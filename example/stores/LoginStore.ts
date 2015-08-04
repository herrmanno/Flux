interface LoginStoreData extends IUser {
	error: string;
}

class LoginStore extends ho.flux.Store<LoginStoreData> {

	static actions = {
		LOGIN_SUCCES: 'LOGIN_SUCCES',
		LOGIN_ERROR: 'LOGIN_ERROR'
	}


	init() {
		this.data = <LoginStoreData>{};
	}

	login(user: IUser): void {
		if(user.name === this.data.name && user.password === this.data.password)
			return;

		let found = JSON.parse(localStorage['users'] || '[]')
		.filter((u) => {
			return u.name === user.name && u.password === user.password;
		})[0];

		if(found) {
			this.data = found;
			this.changed();
			ho.flux.DISPATCHER.dispatch({type: LoginStore.actions.LOGIN_SUCCES});
		} else {
			this.data.error = "Username or Password is wrong!"
			ho.flux.DISPATCHER.dispatch({type: LoginStore.actions.LOGIN_ERROR});
		}

		this.changed();

	}

	isLoggedIn(): boolean {
		return !!this.data;
	}



}
