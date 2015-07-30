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
