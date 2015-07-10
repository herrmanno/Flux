(function() {

	function err(reason) {
		if(API.CONFIG.err.alert)
			window.alert('DISPATCHER: ' + reason);
		if(API.CONFIG.err.throw)
			throw 'DISPATCHER: ' + reason;
	}

	API.err = err;

})();
