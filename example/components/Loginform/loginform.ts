/// <reference path="../../../dist/flux.d.ts"/>
/// <reference path="../../bower_components/ho-components/dist/components.d.ts"/>

class Loginform extends ho.components.Component {

	html =
		`<input id="username"/>
		<input id="password"/>
		<button onclick="{#login()}">Login</button>
		<p>{error}</p>
		`;

	private store: LoginStore;
	private error: string = '';

	init() {
		return ho.flux.STORES.loadStore('LoginStore')
		.then(()=> {
			ho.flux.STORES.get(LoginStore).register(this.loginStoreChanged, this);
		});
	}

	login() {
		let data = {
			name: this.children['username'].value,
			password: this.children['password'].value
		};
		ho.flux.STORES.get(LoginStore).login(data);
	}

	protected loginStoreChanged(data: LoginStoreData): void {
		if(typeof data.error === 'string') {
			this.error = data.error;
			this.render();
		}
	}
}
