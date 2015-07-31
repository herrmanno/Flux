/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
/// <reference path="./storeprovider.ts"/>

module ho.flux {
	import Promise = ho.promise.Promise;

	export class Storeregistry {

		private stores: {[key: string]: Store<any>} = {};

		public register(store: Store<any>): void {
			this.stores[store.name] = store;
		}

		public get<T extends Store<any>>(storeClass: {new():T}): T {
			let name = storeClass.toString().match(/\w+/g)[1];
			return <T>this.stores[name];
		}

		public loadStore(name: string): Promise<Store<any>, string> {
			return new Promise(function(resolve, reject) {
				if(this.get(name) instanceof Store)
					resolve(this.get(name))
				else {

					storeprovider.instance.getStore(name)
					.then((storeClass) => {
						this.register(new storeClass());
						resolve(this.get(name));
					})
					.catch(reject);
				}

			}.bind(this));

			/*
			if(STORES[name] !== undefined && STORES[name] instanceof Store)
				return Promise.create(STORES[name]);
			else {
				return new Promise((resolve, reject) => {
					storeprovider.instance.getStore(name)
					.then((s)=>{resolve(s);})
					.catch((e)=>{reject(e);});
				});
			}
			*/

		}
	}

}
