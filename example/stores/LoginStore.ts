class LoginStore extends ho.flux.Store<IUser> {
	static actions = {
		LOGIN_SUCCES: 'LOGIN_SUCCES',
		LOGIN_ERROR: 'LOGIN_ERROR'
	}

	constructor() {
		super();
	}

	login(user: IUser): void {
		let found = (JSON.parse(localStorage['users']) || [])
		.filter((u) => {
			return u.name === user.name && u.password === user.password;
		})[0];

		if(found) {
			this.data = found;
			this.changed();
			ho.flux.DISPATCHER.dispatch({type: LoginStore.actions.LOGIN_SUCCES});
		}

	}

	isLoggedIn(): boolean {
		return !!this.data;
	}



}
