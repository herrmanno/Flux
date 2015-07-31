class Loginform extends ho.components.Component {

	html =
		`<input id="username"/>
		<input id="password"/>
		<button onclick="{#login()}>Login</button>
		<p>{error}</p>
		`;

	private store: LoginStore;
	private error: string = '';

	init() {
		return ho.flux.STORES.loadStore('LoginStore')
		.then((s) => {
			this.store = s;
			this.store
		})
	}

	login() {
		let data = {
			name: this.children['username'].value,
			password: this.children['password'].value
		};
		ho.flux.STORES.get(LoginStore).login(data);
	}
}
