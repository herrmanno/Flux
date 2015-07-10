(function() {
	var State = new Store({

		name: 'STATE',

		mapping: null,

		states: {},

		state: undefined,

		args: null,

		init: function() {
			var p = new Promise('bootstrap-state');

			Promise.all([API.ACTIONS.loaded, API.STORES.loaded])
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
