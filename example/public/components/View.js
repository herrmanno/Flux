CFW.register({

	name: 'View',

	requires: [],

	properties: ['viewid'],

	html: false,

	init: function() {
		this.storeid = STORES.STATE.register(this.state_changed);

		this.sethtml();

	},

	state_changed: function(state) {
		this.sethtml();
	},

	sethtml: function() {
		var s = STORES.STATE;
		var n = this.viewid;

		if(s.state) {

			var v = s.state.views.filter(function(v) {return v.name == n;})[0];

			if(v) {
				//html needs to be loaded
				if(v.html.endsWith('.html')) {
					AJAX.GET(v.html)
					.then(function(html) {
						this.element.innerHTML = html;
					}.bind(this));
				//v.html is actual html code
				} else {
					this.element.innerHTML = v.html;
				}

			//current state does not support this view
			} else {
				this.element.innerHTML = null;
			}

		}
	}


});
