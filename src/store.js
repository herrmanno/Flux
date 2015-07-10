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
