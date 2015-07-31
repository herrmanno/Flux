interface IUser {
	name:string;
	password:string;
}

class UserStore extends ho.flux.Store<Array<IUser>> {
	constructor() {
		super();
		this.data = JSON.parse(localStorage['users']) || [];
	}

	addUser(user: IUser): void {
		this.data.push(user);
		this.save();
		this.changed();
	}

	private save(): void {
		localStorage['users'] = JSON.stringify(this.data);
	}


}
