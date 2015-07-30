/*
 * Define Ajax-Class & init global Singleton
 */
(function() {
	var Ajax = function() {};

	Ajax.prototype.ajax = function(url, type, data, json) {
		var p = new Promise();
		var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if(xmlhttp.readyState == 4) {
				var resp = xmlhttp.responseText;
				var ct = xmlhttp.getResponseHeader('content-type');
				if(ct.match(/.*application\/json.*/)) {
					resp = JSON.parse(resp);
				}

				if(xmlhttp.status == 200) {
                	p.resolve(resp);
				} else {
					p.reject(resp);
				}
            }
        };

        xmlhttp.open(type, url, true);

		if(data) {
			if(json) {
				xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
				xmlhttp.send(JSON.stringify(data));
			} else {
				xmlhttp.send(data);
			}
		} else {
			xmlhttp.send();
		}

        return p;
	};

	Ajax.prototype.GET = function(url) {
		return Ajax.prototype.ajax(url, 'GET');
	};

	Ajax.prototype.GET_JSON = function(url) {
		return Ajax.prototype.ajax(url, 'GET', undefined, true);
	};

	Ajax.prototype.POST_JSON = function(url, data) {
		return Ajax.prototype.ajax(url, 'POST', data, true);
	};

	Ajax.prototype.DELETE_JSON = function(url, data) {
		return Ajax.prototype.ajax(url, 'DELETE', data, true);
	};

	API.AJAX = window.AJAX = new Ajax();

})();
