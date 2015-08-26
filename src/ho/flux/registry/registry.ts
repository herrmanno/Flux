
module ho.flux.registry {
	import Promise = ho.promise.Promise;

	export let mapping: {[key:string]:string} = {};
	export let useDir = true;

	export class Registry {

		private stores: {[key: string]: Store<any>} = {};

		private storeLoader = new ho.classloader.ClassLoader({
           urlTemplate: 'stores/${name}.js',
           useDir
       });

		public register(store: Store<any>): Store<any> {
			this.stores[store.name] = store;
			return store;
		}

		public get(storeClass: string): Store<any>
		public get<T extends Store<any>>(storeClass: {new():T}): T
		public get<T extends Store<any>>(storeClass: any): T {
			let name = void 0;
			if(typeof storeClass === 'string')
				name = storeClass;
			else
				name = storeClass.toString().match(/\w+/g)[1];
			return <T>this.stores[name];
		}

		public loadStore(name: string): Promise<Store<any>, string> {

			let self = this;
			let cls: Array<typeof Store> = [];

			if(!!this.stores[name])
				return Promise.create(this.stores[name]);

            return this.storeLoader.load({
                name,
				url: mapping[name],
                super: ["ho.flux.Store"]
            })
            .then((classes: Array<typeof Store>) => {
                cls = classes;
				classes = classes.filter(c => {
					return !self.get(c);
				});

				let promises =  classes.map(c => {
					return Promise.create(self.register(new c).init());
                });

                return Promise.all(promises);
            })
			.then(p => {
				return self.get(cls.pop());
			})

		}

	}

}
