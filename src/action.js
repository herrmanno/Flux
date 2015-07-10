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
