/// <reference path="../dist/d.ts/state.d.ts"/>

class States implements ho.flux.IStates {

	login = {
		name: 'login',
		url: 'login',
		view: [
			{name: 'view1', html: 'html/login.html'}
		]
	}

	register = {
		name: 'register',
		url: 'register',
		view: [
			{name: 'view1', html: 'html/register.html'}
		]
	}

	catchall = {
		name: 'catchall',
		url: '.*',
		redirect: 'login'
	}

	states = [
		this.login,
		this.register,
		this.catchall
	];
}
