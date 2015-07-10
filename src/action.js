(function() {

	var Actions = function() {
		var self = this;

		self.loaded = new Promise();

		AJAX.GET_JSON(API.CONFIG.urls.actions)
		.then(function(actions) {
			actions.forEach(function(name) {
				self[name] = self.createAction(name);
			});
			self.loaded.resolve();
		});

	};

	Actions.prototype.createAction = function(name) {
		var action = function(data) {
			DISPATCHER.dispatch(name, data);
		};

		return action;
	};


	API.ACTIONS = window.ACTIONS = new Actions();

})();
