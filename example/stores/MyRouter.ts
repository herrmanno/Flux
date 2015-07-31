
/// <reference path="../../dist/d.ts/router.d.ts"/>

class MyRouter extends ho.flux.Router {

	constructor() {
		super();
		this.on('LOGIN_SUCCES', this.onStateChangeRequested.bind(this, {state: 'login'}));
	}

}
