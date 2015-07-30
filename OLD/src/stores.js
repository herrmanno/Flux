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
