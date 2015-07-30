(function() {
	window.FLUX = {
		run: function(opt) {
			if(opt)
				Flux_config(opt);

			return API.STATE.init();
		}
	};
})();
