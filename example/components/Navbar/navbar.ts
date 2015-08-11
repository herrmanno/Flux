class Navbar extends ho.components.Component {
    loggedin: boolean = false;;

	html =
		`
		<a href="#login">Login</a>
		<a href="#register">Register</a>
		<a href="#private" {{!loggedin ? 'hidden': ''}}>Private</a>
		`;

		init() {
			let self = this;
			return ho.flux.STORES.loadStore('LoginStore')
			.then((s: ho.flux.Store<any>)=> {
				s.register(self.loginStoreChanged, self);
			});
		}

		protected loginStoreChanged(data: LoginStoreData): void {
			this.loggedin = !!data.name
			this.render();
		}
}
