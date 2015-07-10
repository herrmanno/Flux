(function() {
	var API = {};

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

(function() {

	API.CONFIG = {

		urls: {
			actions: 'actions.json',
			stores: 'stores.json',
			states: 'states.json',
		},

		err: {
			throw: true,
			alert: true,
		}
	};

	window.Flux_config = function(opt) {
		for(var key in opt) {
			API.CONFIG[key] = opt[key];
		}
	};

})();

(function() {

	function err(reason) {
		if(API.CONFIG.err.alert)
			window.alert('DISPATCHER: ' + reason);
		if(API.CONFIG.err.throw)
			throw 'DISPATCHER: ' + reason;
	}

	API.err = err;

})();

/*
 * Define Ajax-Class & init global Singleton
 */
(function() {
	var Ajax = function() {};

	Ajax.prototype.ajax = function(url, type, data, json) {
		var p = new Promise();
		var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if(xmlhttp.readyState == 4) {
				var resp = xmlhttp.responseText;
				var ct = xmlhttp.getResponseHeader('content-type');
				if(ct.match(/.*application\/json.*/)) {
					resp = JSON.parse(resp);
				}

				if(xmlhttp.status == 200) {
                	p.resolve(resp);
				} else {
					p.reject(resp);
				}
            }
        };

        xmlhttp.open(type, url, true);

		if(data) {
			if(json) {
				xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
				xmlhttp.send(JSON.stringify(data));
			} else {
				xmlhttp.send(data);
			}
		} else {
			xmlhttp.send();
		}

        return p;
	};

	Ajax.prototype.GET = function(url) {
		return Ajax.prototype.ajax(url, 'GET');
	};

	Ajax.prototype.GET_JSON = function(url) {
		return Ajax.prototype.ajax(url, 'GET', undefined, true);
	};

	Ajax.prototype.POST_JSON = function(url, data) {
		return Ajax.prototype.ajax(url, 'POST', data, true);
	};

	Ajax.prototype.DELETE_JSON = function(url, data) {
		return Ajax.prototype.ajax(url, 'DELETE', data, true);
	};

	API.AJAX = window.AJAX = new Ajax();

})();

(function() {
	var UTIL = {
		loadScript: function(src) {
			var p = new Promise();

			var scripts = document.querySelectorAll('script[src="'+src+'"]');

			//------- Script already loaded
			if(scripts.length > 0) {
				p.resolve();
			} else {
				var script = document.createElement('script');
				script.setAttribute('src', src);
				script.async = false;
				script.addEventListener('load', function (e) {
					p.resolve(e);
				}, false);

				document.head.appendChild(script);
			}

			return p;
		},

		loadStylesheet: function(href) {
			var p = new Promise();

			var links = document.querySelectorAll('link[href="'+href+'"]');

			if(links.length > 0) {
				p.resolve();
			} else {
				var link = document.createElement('link');
				link.setAttribute('rel', 'stylesheet');
				link.setAttribute('href', href);
				link.addEventListener('load', function (e) {
					p.resolve(e);
				}, false);

				document.head.appendChild(link);
			}

			return p;
		}
	};

	API.UTIL = UTIL;
})();

(function() {

	var Actions = function() {
		var self = this;

		this.load = function() {
			var p = new Promise('actions-load');

			AJAX.GET_JSON(API.CONFIG.urls.actions)
			.then(function(actions) {
				actions.forEach(function(name) {
					self[name] = self.createAction(name);
				});
				p.resolve();
			});

			return p;
		};

	};

	Actions.prototype.createAction = function(name) {
		var action = function(data) {
			DISPATCHER.dispatch(name, data);
		};

		return action;
	};


	API.ACTIONS = window.ACTIONS = new Actions();

})();

(function() {
	"use strict";

  	function Dispatcher() {
		var prefix = 'ID_';
    	var lastID = 1;
    	var callbacks = {};
    	var isPending = {};
    	var isHandled = {};
    	var isDispatching = false;
    	var pendingPayload = null;

  		this.register = function(callback) {
    		var id = prefix + lastID++;
    		callbacks[id] = callback;
    		return id;
  		};

  		this.unregister = function(id) {
      		if(!callbacks[id])
				API.err('Could not unregister callback for id ' + id);
    		delete callbacks[id];
  		};

		this.waitFor = function(ids) {
			if(!isDispatching)
		  		API.err('Dispatcher.waitFor(...): Must be invoked while dispatching.');
			for (var ii = 0; ii < ids.length; ii++) {
			  var id = ids[ii];

			  if (isPending[id]) {
		      	if(!isHandled[id])
			      	API.err('waitFor(...): Circular dependency detected while wating for ' + id);
				continue;
			  }

			  if(!callbacks[id])
			  	API.err('waitFor(...): ' + id + ' does not map to a registered callback.');
			  invokeCallback(id);
			}
		};

		this.dispatch = function(data) {
			if(isDispatching)
		    	API.err('Cannot dispatch in the middle of a dispatch.');
		    startDispatching(data);
		    try {
		      for (var id in callbacks) {
		        if (isPending[id]) {
		          continue;
		        }
		        invokeCallback(id);
		      }
		    } finally {
		      stopDispatching();
		    }
		};

	  	function invokeCallback(id) {
	    	isPending[id] = true;
	    	callbacks[id](pendingPayload);
	    	isHandled[id] = true;
	  	}

	  	function startDispatching(payload) {
	    	for (var id in callbacks) {
	      		isPending[id] = false;
	      		isHandled[id] = false;
	    	}
	    	pendingPayload = payload;
	    	isDispatching = true;
  		}

	  	function stopDispatching() {
	    	pendingPayload = null;
	    	isDispatching = false;
	  	}
	}

	window.DISPATCHER = API.DISPATCHER = new Dispatcher();

})();

(function() {
	"use strict";

	/*
	 * Options: {name, url, load, obj, initFunctions}
	 */
	var Store = function(s) {

		s = Store.normalize(s);

		var self = this;
		var name = s.name;
		var data = s.data;

		var prefix = 'ID_';
    	var lastID = 1;
		var callbacks = {};

		this.id = void 0;


		this._handle = function(action) {

			if(self.handle.hasOwnProperty(action.type))
				self.handle[action.type].call(self, action.data);
		};

		this.register = function(callback) {
    		var id = prefix + lastID++;
    		callbacks[id] = callback;
    		return id;
  		};

  		this.unregister = function(id) {
      		if(!callbacks[id])
				API.err('Could not unregister callback for id ' + id);
    		delete callbacks[id];
  		};

		this.changed = function() {
			for (var id in callbacks) {
			  var cb = callbacks[id];
			  if(cb)
			  	cb.call(null, data);
			}
		};

		//------- constructor
		(function() {
			for(var key in s) {
				if(s.hasOwnProperty(key)) {
					if(typeof s[key] === 'function') {
						self[key] = s[key].bind(self);
					} else {
						self[key] = s[key];
					}
				}
			}

			API.STORES[self.name] = self;
			self.id = DISPATCHER.register(self._handle);
		})();

	};

	Store.normalize = function(s) {
		if(!s.name)
			API.err('Store.name is an required property');
		if(s.handle === undefined)
			API.err('Store.handle is an required property');
		if(s.data === undefined)
			s.data = {};
		return s;
	};

	Store.loadStore = function(s) {
		return API.UTIL.loadScript('store/'+s);
	};


	window.Store = API.Store = Store;

})();

(function() {

	var Stores = {

		load: function() {
			var p = new Promise('stores-load');

			AJAX.GET_JSON(API.CONFIG.urls.stores)
			.then(function(stores) {
				Promise.all(stores.map(Store.loadStore))
				.then(p.resolve);
			});

			return p;
		}
	};

	window.STORES = API.STORES = Stores;
})();

(function() {
	var State = new Store({

		name: 'STATE',

		mapping: null,

		states: {},

		state: undefined,

		args: null,

		init: function() {
			var p = new Promise('bootstrap-state');

			Promise.all([API.ACTIONS.load(), API.STORES.load()])
			.then(function() {
				API.ACTIONS.STATE = function(state, args) {
					API.DISPATCHER.dispatch({
						type: 'STATE',
						data: {
							state: state,
							args: args,
							extern: false,
						}
					});
				};
			})
			.then(this.getMapping)
			.then(p.resolve);

			return p;
		},

		getMapping:  function() {
			var p = new Promise('state-getmapping');

			AJAX.GET_JSON(API.CONFIG.urls.states)
			.then(function(states) {
				this.mapping = states;
				this.initMapping();
				this.initListener();
			}.bind(State))
			.then(p.resolve);

			return p;
		},

		initMapping:  function() {
			//------- create a method for every state
			this.mapping.forEach(function(state) {
				if(!state.name) API.err("Every State needs a name attibute");
				if(!state.url) API.err("Every State needs an url attibute");
				state.actions = state.actions || [];
				state.promises = state.promises || [];
				state.views = state.views || [];

				this.states[state.name] = function(args, extern) {

					//current state and args equals requested state and args -> return
					if(this.state && this.state.name === state.name && this.args === args)
						return;

					//requested state has an redirect property -> call redirect state
					if(!!state.redirect) {
						this.states[state.redirect](args, extern);
						return;
					}

					//TODO handler promises & actions

					//does the state change request comes from extern e.g. url change in browser window ?
					extern = !! extern;

					//------- set current state & arguments
					this.state = state;
					this.args = args;
					this.data = {
						state: state,
						args: args,
						extern: extern,
					};

					//------- set url for browser
					var url = this.urlFromState(state.url, args);
					this.setUrl(url);

					this.changed();
				}.bind(this);
			}.bind(this));
		},

		initListener:  function() {
			window.onhashchange = this.onHashChange();
		},

		onHashChange:  function() {
			var s = this.stateFromUrl(window.location.hash.substr(1));
			API.DISPATCHER.dispatch({
				type: 'STATE',
				data: {
					state: s.state,
					args: s.args,
					extern: true,
				}
			});
		},

		handle: {
			'STATE': function(data) {
				this.states[data.state](data.args, data.extern);
			}
		},

		setUrl:  function(url) {
			if(window.location.hash.substr(1) === url)
				return;

			var l = window.onhashchange;
			window.onhashchange = null;

			window.location.hash = url;

			window.onhashchange = l;
		},

		regexFromUrl:  function(url) {
			var regex = /:([\w]+)/;
			while(url.match(regex)) {
				url = url.replace(regex, "([^\/]+)");
			}
			return url+'$';
		},

		argsFromUrl:  function(pattern, url) {
			var r = this.regexFromUrl(pattern);
			var names = pattern.match(r).slice(1);
			var values = url.match(r).slice(1);

			var args = {};
			names.forEach(function(name, i) {
				args[name.substr(1)] = values[i];
			});

			return args;
		},

		stateFromUrl:  function(url) {
			var s = void 0;
			this.mapping.forEach(function(state) {
				if(s)
					return;

				var r = this.regexFromUrl(state.url);
				if(url.match(r)) {
					var args = this.argsFromUrl(state.url, url);
					s = {
						"state": state.name,
						"args": args
					};
				}
			}.bind(this));

			if(!s)
				API.err("No State found for url "+url);

			return s;
		},

		urlFromState:  function(url, args) {
			var regex = /:([\w]+)/;
			while(url.match(regex)) {
				url = url.replace(regex, function(m) {
					return args[m.substr(1)];
				});
			}
			return url;
		},

	});

	window.STATE = API.STATE = State;
})();

(function() {
	window.FLUX = {
		run: function(opt) {
			if(opt)
				Flux_config(opt);

			return API.STATE.init();
		}
	};
})();

})();
