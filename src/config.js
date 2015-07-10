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
