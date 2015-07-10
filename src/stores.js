(function() {

	var Stores = {
		loaded: new Promise()
	};


	AJAX.GET_JSON(API.CONFIG.urls.stores)
	.then(function(stores) {
		Promise.all(stores.map(Store.loadStore))
		.then(Stores.loaded.resolve);
	});

	window.STORES = API.STORES = Stores;
})();
