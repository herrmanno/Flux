CFW.register({

	name: 'UserList',

	requires: [],

	properties: [],

	init: function() {
		Store.loadStore('USERS_STORE')
		.then(function() {
			this.storeid = STORES.USERS_STORE.register(this.state_changed);
		}.bind(this));

	},


});
