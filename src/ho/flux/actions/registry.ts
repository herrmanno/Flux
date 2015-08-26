
module ho.flux.actions {
	import Promise = ho.promise.Promise;

	export let mapping: {[key:string]:string} = {};
	export let useDir = true;

	export class Registry {

		private actions: {[key: string]: Action} = {};

		private actionLoader = new ho.classloader.ClassLoader({
           urlTemplate: 'actions/${name}.js',
           useDir
       });

		public register(action: Action): Action {
			this.actions[action.name] = action;
			return action;
		}

		public get(actionClass: string): Store<any>
		public get<T extends Action>(actionClass: {new():T}): T
		public get<T extends Action>(actionClass: any): T {
			let name = void 0;
			if(typeof actionClass === 'string')
				name = actionClass;
			else
				name = actionClass.toString().match(/\w+/g)[1];
			return <T>this.actions[name];
		}

		public loadAction(name: string): Promise<Action, string> {

			let self = this;

			if(!!this.actions[name])
				return Promise.create(this.actions[name]);

            return this.actionLoader.load({
                name,
				url: mapping[name],
                super: ["ho.flux.actions.Action"]
            })
            .then((classes: Array<typeof Action>) => {
                classes.map(a => {
					if(!self.get(a))
						self.register(new a);
                });
                return self.get(classes.pop());
            })

		}

	}

}
