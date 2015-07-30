(function() {
	var Router = function() {

		var self = this;
		this.ROUTE_FINISHED = "ROUTE_FINISHED";
		this.routing = false;
		this.viewState = {};
		this.handlers= [];

		this.init = function() {
			self.initFinishedHandler();

			/*
			AJAX.GET_JSON("route")
			.then(function(routes) {
				routes.stores.forEach(STORES.loadStore);
			});
			*/
		};

		this.initFinishedHandler = function() {
			//------- Listener that fires ROUTE_FINISHED if all views are updated
			self.registerHandler("VIEW_UPDATED", function(name) {
				if(!self.viewState[name])
					self.viewState[name] = {loading : false, html: null};
				else
					self.viewState[name].loading = false;

				var finished = true;
				for(var v in self.viewState) {
					if(!self.viewState.hasOwnProperty(v)) continue;
					if(finished && self.viewState[v].loading)
						finished = false;
				}
				if(finished && !self.routing) {
					DISPATCHER.dispatch(self.ROUTE_FINISHED, null);
				}
			});
		};

		this.getViewstate = function(view) {
			if(view) {
				return self.viewState[view] || {};
			} else {
				return self.viewState;
			}
		};

		this.setLoading = function(views) {
			//------ set all available views to loading
			Array.prototype.forEach.call(views, function(view) {
				var viewName = view.dataset.view;
				if(!self.viewState[viewName]) {
					self.viewState[viewName] = {loading : true, html: null};
					return;
				} else {
					self.viewState[viewName].loading = true;
				}

			});
		};

		this.setRoute = function(hash) {
			self.routing = true;
			var views = document.querySelectorAll("*[data-view]");

			//------ set all available views to loading
			self.setLoading(views);

			Array.prototype.forEach.call(views, function(view, index) {
				var last = index+1 == views.length;
				var viewName = view.dataset.view;

				var html = STATE.htmlForView(viewName);

				//------- No Route found
				if(html === null) {
					view.innerHTML = null;
					self.viewState[viewName].html = null;
					if(last)
						self.routing = false;
					DISPATCHER.dispatch('VIEW_UPDATED', viewName);
					return;
				}


				//------- View's html needs to be updated
				if(self.viewState[viewName].html != html) {
					self.viewState[viewName].html = html;
				} else {
					//------- View's html does not need to change
					if(last)
						self.routing = false;
					DISPATCHER.dispatch('VIEW_UPDATED', viewName);
					return;
				}


				var _setHTML = function() {
					var arg1 = view;
					var arg2 = html.toString();
					return function() {
						setHTML(arg1, arg2);
					};
				}();



				var stores = STATE.storesForView(viewName);

				Promise.all(stores.map(STORES.loadStore))
				.then(_setHTML);

			});

			self.routing = false;
		};

		var setHTML = function(view, html) {
			var url = 'html/'+html+(html.endsWith('.html') ? '' : '.html');
			AJAX.GET(url)
			.then(function(resp) {
				view.innerHTML = resp;
				VIEW.initView(view);
			});
		};

		//------- call 'Constructor'
		self.init();
	};

	Router.prototype = new Listener("ROUTER");

	window.ROUTER = new Router();
})();
