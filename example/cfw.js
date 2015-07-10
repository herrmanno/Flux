(function(){
(function() {
	window.Promise = function Promise(onResolve, onReject) {
		var self = this;

		this.data = undefined;

		this.resolved = false;
		this.rejected = false;
		this.done = false;

		if(typeof onResolve === 'function')
			this.onResolve = onResolve;
		if(typeof onReject === 'function')
			this.onReject = onReject;
		if(typeof onResolve === 'string')
			this.name = onResolve;

		this.ret = undefined;


		this.set = function(data) {
			if(self.done)
				throw "Promise is already resolved / rejected";
			self.data = data;
		};

		this.resolve = function(data) {
			self.set(data);
			self.resolved = self.done = true;
			if(self.onResolve) {
				self._resolve();
			}
		};

		this._resolve = function() {
			if(!self.ret) {
				self.ret = new Promise('Return-Promise' + self.name);
			}

			var v = self.onResolve(self.data);

			if(v && v instanceof Promise) {
				v.then(self.ret.resolve, self.ret.reject);
			}
			else {
				self.ret.resolve(v);
			}

		};

		this.reject = function(data) {
			self.set(data);
			self.rejected = self.done = true;

			if(self.onReject) {
				self.onReject(this.data);
			}
			if(self.ret) {
				self.ret.reject(this.data);
			}
		};

		this._reject = function() {
			if(!self.ret) {
				self.ret = new Promise('Return-Promise' + self.name);
			}

			self.onReject(self.data);
			self.ret.reject(self.data);
		};

		this.then = function(res, rej) {
			self.ret = new Promise('Return-Promise' + self.name);

			if(res && typeof res === 'function')
				self.onResolve = res;

			if(rej && typeof rej === 'function')
				self.onReject = rej;


			if(self.resolved) {
				self._resolve();
			}

			if(self.rejected) {
				self._reject();
			}

			return self.ret;
		};

		this.catch = function(cb) {
			self.onReject = cb;
			if(self.rejected)
				self._reject();
		};
	};

	window.Promise.all = function(arr) {
		var p = new Promise();

		var data = [];

		if(arr.length === 0) {
			p.resolve();
		} else {
			arr.forEach(function(prom, index) {
				prom
				.then(function(d) {
					if(p.done)
						return;

					data[index] = d;
					var allResolved = arr.reduce(function(state, p1) {
						return state && p1.resolved;
					}, true);
					if(allResolved) {
						p.resolve(data);
					}

				})
				.catch(function(err) {
					p.reject(err);
				});
			});
		}

		return p;
	};

})();

	CFWRenderer = function Renderer() {

		var r = {
			tag: /<([^>]*?(?:(?:('|")[^'"]*?\2)[^>]*?)*)>/,
			repeat: /repeat=["|'].+["|']/,
			type: /[\s|/]*(.*?)[\s|\/|>]/,
			text: /(?:.|[\r\n])*?[^"'\\]</m,

		};

		function parse(html, root) {
			root = root || {html: null, parent: null, children: []};

			var m;
			while((m = r.tag.exec(html)) !== null) {
				//------- found some text before next tag
				var tag, type, closing, selfClosing, repeat, unClose;
				if(m.index !== 0) {
					tag = html.match(r.text)[0];
					tag = tag.substr(0, tag.length-1);
					type = 'TEXT';
					selfClosing = true;
					repeat = false;
				} else {
					tag = m[1].trim();
					type = (tag+'>').match(r.type)[1];
					closing = tag[0] === '/';
					selfClosing = tag[tag.length-1] === '/';
					repeat = !!tag.match(r.repeat);

					if(selfClosing && CFW.hasComponent(type)) {
						selfClosing = false;
						tag = tag.substr(0, tag.length-1) + " ";

						unClose = true;
					}
				}

				html = html.slice(tag.length + (type === 'TEXT' ? 0 : 2) );



				if(closing) {
					break;
				} else {
					root.children.push({parent: root, html: tag, type: type, selfClosing: selfClosing, repeat: repeat, children: []});

					if(!unClose && !selfClosing) {
						var result = parse(html, root.children[root.children.length-1]);
						html = result.html;
						root.children.pop();
						root.children.push(result.root);
					}
				}

				m = html.match(r.tag);
			}

			return {html: html, root: root};
		}

		function renderRepeat(root, models) {
			models = [].concat(models);

			for(var c = 0; c < root.children.length; c++) {
				var child = root.children[c];
				if(child.repeat) {
					var regex = /repeat=["|']\s*(\S+)\s+as\s+(\S+?)["|']/;
					var m = child.html.match(regex).slice(1);
					var name = m[1];
					var indexName;
					if(name.indexOf(',') > -1) {
						var names = name.split(',');
						name = names[0].trim();
						indexName = names[1].trim();
					}

					var model = evaluate(models, m[0]);

					var holder = [];
					model.forEach(function(value, index) {
						var model2 = {};
						model2[name] = value;
						model2[indexName] = index;

						var models2 = [].concat(models);
						models2.unshift(model2);

						var node = copyNode(child);
						node.repeat = false;
						node.html = node.html.replace(r.repeat, '');
						node.html = repl(node.html, models2);

						node = renderRepeat(node, models2);

						//root.children.splice(root.children.indexOf(child), 0, node);
						holder.push(node);
					});

					holder.forEach(function(n) {
						root.children.splice(root.children.indexOf(child), 0, n);
					});
					root.children.splice(root.children.indexOf(child), 1);
				} else {
					child.html = repl(child.html, models);
					child = renderRepeat(child, models);
					root.children[c] = child;
				}
			}

			return root;
		}

		function render(root, model) {
			return root;
		}

		function domToString(root, indent) {
			indent = indent || 0;
			var html = '';

			if(root.html) {
				html += '\t'.repeat(indent);
				if(root.type !== 'TEXT')
					html += '<' + root.html + '>';
				else html += root.html;
			}

			if(html)
				html += '\n';

			if(root.children.length) {
				html += root.children.map(function(c) {
					return domToString(c, indent+(root.type ? 1 : 2));
				}).join('\n');
			}

			if(root.type && root.type !== 'TEXT' && !root.selfClosing) {
				html += '\t'.repeat(indent);
				html += '</'+root.type+'>\n';
			}

			return html;
		}

		function evaluate(models, path) {
			var mi = 0;
			var model = void 0;
			while(mi < models.length && model === undefined) {
				model = models[mi];
				try {
					with(model)
						model = eval(path);
				} catch(e) {
					model = void 0;
					mi++;
				}
			}

			return model;
		}

		function copyNode(node) {
			var n = {
				parent: node.parent,
				html: node.html,
				type: node.type,
				selfClosing: node.selfClosing,
				repeat: node.repeat,
				children: node.children.map(copyNode)
			};

			return n;
		}

		function repl(str, models) {
			var regex = /{([^{}|]+)}/;
			var regexG = /{([^{}|]+)}/g;

			var m = str.match(regexG);
			if(!m)
				return str;

			while(m.length) {
				var path = m[0];
				path = path.startsWith('{') ? path.substr(1) : path;
				path = path.endsWith('}') ? path.substr(0, path.length-1) : path;
				var value = evaluate(models, path);
				/*
				var value = undefined;
				try {
					with(model)
						value = eval(path);
				} catch(e) {}
				*/

				if(value !== undefined) {
					if(typeof value === 'function') {
						value = "Component.getComponent(this)."+path;
					}
					str = str.replace(m[0], value);
				}

				m = m.slice(1);
			}

			return str;
		}

		return {
			'render': function(component) {
				var html = component.html;

				var root = parse(html).root;
				root = renderRepeat(root, component);
				root = render(root);

				//TODO handle original innerHTML

				html = domToString(root, -1);

				component.element.innerHTML = html;
			}
		};
	};

	var CFWOptions = function(opt) {
		opt = opt || {};

		this.renderer = opt.renderer || CFWRenderer();

		this.componentProvider = opt.componentProvider || function(name) {
			var p = new Promise();

			CFW.loadingComponents[name] = p;

			var src = 'components/'+name+'.js';

			var script = document.createElement('script');
			script.setAttribute('src', src);
			script.async = false;
			script.onerror = function(e) {
				p.reject("failed to load script '"+src+"'");
			};

			document.head.appendChild(script);

			return p;
		};

		this.htmlProvider = opt.htmlProvider || function(name) {
			var p = new Promise();

			var url = 'components/'+name+'.html';

			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function() {
				if(xmlhttp.readyState == 4) {
					var resp = xmlhttp.responseText;
					if(xmlhttp.status == 200) {
						p.resolve(resp);
					} else {
						p.reject(resp);
					}
				}
			};

			xmlhttp.open('GET', url, true);
			xmlhttp.send();

			return p;
		};

	};

	window.CFW = {

		components: [],

		loadingComponents: {},

		options: null,

		register: function(c) {
			var p = new Promise();
			p.then(function(html) {
				c.html = html;
				this.components.push(c);
				document.createElement(c.name);

				if(this.loadingComponents[c.name])
					this.loadingComponents[c.name].resolve();

			}.bind(this));

			if(c.html) {
				p.resolve(c.html);
			} else {
				if(typeof c.html === 'boolean' && !c.html) {
					p.resolve(false);
				} else {
					this.options.htmlProvider(c.name)
					.then(p.resolve)
					.catch(function(err) {
						throw 'No html template file found for Component '+c.name;
					});
				}
			}

		},

		run: function(opt) {
			this.options = new CFWOptions(opt);
			this.components.forEach(function(c) {
				this.initComponent(c);
			}.bind(this));
		},

		initElement : function(el) {
			this.components.forEach(function(c) {
				this.initComponent(c, el);
			}.bind(this));
		},

		initComponent: function(c, el) {
			el = el || document;
			Array.prototype.forEach.call(el.querySelectorAll(c.name), function(e) {
				new Component(c, e);
			});
		},

		hasComponent: function(name) {
			var c = this.components.filter(function(c) {
				return c.name === name;
			});

			return !!c.length;
		},

		loadComponent: function(name) {
			return this.options.componentProvider(name);
		},
	};

	if(window.require && window.module && window.module.exports) {
		module.exports = CFW;
	}

	window.Component = function(c, e) {
		var self = this;
		c = Component.normalize(c);


		e.component = this;
		this.element = e;

		this.orig_innerHTML = e.innerHTML;

		for(var key in c) {
			if(c.hasOwnProperty(key)) {
				this[key] = c[key];
			}
		}

		this.properties.forEach(this.grabProperty.bind(this));

		if(this.init)
			this.init.call(this);

		Promise.all(this.requires.map(this.checkRequirement.bind(this)))
		.then(this.render.bind(this))
		.catch(function(err) {
			throw err;
		});
	};

	Component.prototype.findOne = function(selector) {
		return this.element.querySelector(selector);
	};

	Component.prototype.find = function(selector) {
		var elements = this.element.querySelectorAll(selector);
		var arr = [];
		while(elements.length) {
			arr.push(elements[0]);
			elements = elements.slice(1);
		}

		return arr;
	};

	Component.prototype.grabProperty = function(name) {
		this[name] = this.element[name] || this.element.getAttribute(name);
	};

	Component.prototype.render = function() {
		CFW.options.renderer.render(this);

		if(this.updated)
			this.updated();

		this.initChildren();

		CFW.initElement(this.element);
		/*
		this.renderHTML();
		this.renderRepeat();
		if(this.updated)
			this.updated();
		*/
	};

	/*

	Component.prototype.renderHTML = function() {
		var html = this.html;
		html = Component.repl(html, this);
		this.element.innerHTML = html;
	};

	Component.prototype.renderRepeat = function(el, model) {
		var root = el || this.element;
		var repeatEl = root.querySelector('[repeat]');

		model = model || this;

		while(repeatEl) {
			var repeatStr = repeatEl.getAttribute('repeat');
			var r = repeatStr.match(/(\S+)\s+as\s+(\S+)/).slice(1);
			var name = r[1];
			try {
				with(model)
					model = eval(r[0]);
			} catch(e) {
				return;
			}

			var holder = document.createElement('div');
			model.forEach(function(value) {
				var model = {};
				model[name] = value;

				var node = repeatEl.cloneNode(true);
				node.removeAttribute('repeat');
				holder.appendChild(document.createComment(' ' + repeatStr + ' :: ' + name + ' = ' + JSON.stringify(value) + ' '));
				holder.appendChild(node);
				holder.innerHTML = Component.repl(holder.innerHTML, model);
				this.renderRepeat(holder, model);
			}.bind(this));
			var parent = repeatEl.parentNode;
			while(holder.hasChildNodes()) {
				var child = holder.firstChild;
				parent.insertBefore(child, repeatEl);
			}
			parent.removeChild(repeatEl);

			var repeatEl = root.querySelector('[repeat]');
		}

		CFW.initElement(root);
	};

	Component.repl = function(str, model) {
		var regex = /{([^{}|]+)}/;
		var regexG = /{([^{}|]+)}/g;

		var m = str.match(regexG);
		if(!m)
			return str;

		while(m.length) {
			var path = m[0];
			path = path.startsWith('{') ? path.substr(1) : path;
			path = path.endsWith('}') ? path.substr(0, path.length-1) : path;
			var value = undefined;
			try {
				with(model)
					value = eval(path);
			} catch(e) {}

			if(value !== undefined) {
				if(typeof value === 'function') {
					value = "Component.getComponent(this)."+path;
				}
				str = str.replace(m[0], value);
			}

			m = m.slice(1);
		}

		return str;
	};
	*/

	Component.prototype.checkRequirement = function(name) {
		var p = new Promise();

		if(window.CFW.hasComponent(name)) {
			p.resolve();
		}
		else {
			window.CFW.loadComponent(name)
			.then(p.resolve)
			.catch(p.reject);
		}

		return p;
	};

	Component.prototype.initChildren = function() {
		var childs = this.element.querySelectorAll('*');
		for(var c = 0; c < childs.length; c++) {
			var child = childs[c];
			if(child.id) {
				this.children[child.id] = child;
			}
			this.children[child.tagName] = this.children[child.tagName] || [];
			this.children[child.tagName].push(child);
		}
	};

	Component.prototype.getParent = function() {
		var el = this.element.parentNode;
		while(!el.component)
			el = el.parentNode;
		return el.component;
	};

	Component.getComponent = function(el) {
		while(!el.component)
			el = el.parentNode;
		return el.component;
	};

	Component.normalize = function(c) {
		if(!c.name) throw "Component needs a name";

		c.properties = c.properties || [];
		c.requires = c.requires || [];
		c.children = {};

		return c;
	};
})();
