/// <reference path="../dist/d.ts/state.d.ts"/>

class State implements ho.flux.IStates {
	states = [
		this.login,
		this.catchall
	];

	login = {
		name: 'login',
		url: 'login',
	}

	catchall = {
		name: 'catchall',
		url: '*'
	}
}
