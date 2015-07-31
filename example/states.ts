/// <reference path="../dist/d.ts/state.d.ts"/>

class States implements ho.flux.IStates {

	login = {
		name: 'login',
		url: 'login',
		view: [
			{name: 'view1', html: '<!-- requires="Loginform"--><Loginform/>'}
		]
	}

	register = {
		name: 'register',
		url: 'register',
		view: [
			{name: 'view1', html: 'html/register.html'}
		]
	}

	private = {
		name: 'private',
		url: 'private',
		view: [
			{name: 'view1', html: 'html/private.html'}
		],
		before: () => {
			return new ho.promise.Promise((resolve, reject) => {
				let s: LoginStore = typeof LoginStore !== 'undefined' && ho.flux.STORES.get(LoginStore);
				if(s && s.isLoggedIn())
					resolve(null);
				else {
					window.alert("You're a bad boy...");
					reject({state: 'login'});
				}
			});
		}
	}

	catchall = {
		name: 'catchall',
		url: '.*',
		redirect: 'login'
	}

	states = [
		this.login,
		this.register,
		this.private,
		this.catchall
	];
}
