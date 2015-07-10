CFW.register({

	name: 'View',

	requires: [],

	properties: ['viewid'],

	html: false,

	init: function() {
		this.storeid = STORES.STATE.register(this.state_changed);

		var s = STORES.STATE;
		var n = this.viewid;
		var self = this;

		if(s.state) {
			var v = s.state.views.filter(function(v) {return v.name == n;})[0];
			AJAX.GET(v.html)
			.then(function(html) {
				self.element.innerHTML = html;
			})
		}
	},

	state_changed: function(state) {
		alert(state);
	},


});
