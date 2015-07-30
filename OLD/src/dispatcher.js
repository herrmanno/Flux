(function() {
	"use strict";

  	function Dispatcher() {
		var prefix = 'ID_';
    	var lastID = 1;
    	var callbacks = {};
    	var isPending = {};
    	var isHandled = {};
    	var isDispatching = false;
    	var pendingPayload = null;

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

		this.waitFor = function(ids) {
			if(!isDispatching)
		  		API.err('Dispatcher.waitFor(...): Must be invoked while dispatching.');
			for (var ii = 0; ii < ids.length; ii++) {
			  var id = ids[ii];

			  if (isPending[id]) {
		      	if(!isHandled[id])
			      	API.err('waitFor(...): Circular dependency detected while wating for ' + id);
				continue;
			  }

			  if(!callbacks[id])
			  	API.err('waitFor(...): ' + id + ' does not map to a registered callback.');
			  invokeCallback(id);
			}
		};

		this.dispatch = function(data) {
			if(isDispatching)
		    	API.err('Cannot dispatch in the middle of a dispatch.');
		    startDispatching(data);
		    try {
		      for (var id in callbacks) {
		        if (isPending[id]) {
		          continue;
		        }
		        invokeCallback(id);
		      }
		    } finally {
		      stopDispatching();
		    }
		};

	  	function invokeCallback(id) {
	    	isPending[id] = true;
	    	callbacks[id](pendingPayload);
	    	isHandled[id] = true;
	  	}

	  	function startDispatching(payload) {
	    	for (var id in callbacks) {
	      		isPending[id] = false;
	      		isHandled[id] = false;
	    	}
	    	pendingPayload = payload;
	    	isDispatching = true;
  		}

	  	function stopDispatching() {
	    	pendingPayload = null;
	    	isDispatching = false;
	  	}
	}

	window.DISPATCHER = API.DISPATCHER = new Dispatcher();

})();
