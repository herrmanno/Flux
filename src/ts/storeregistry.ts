/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
/// <reference path="./storeprovider.ts"/>

module ho.flux {
	import Promise = ho.promise.Promise;

	export class Storeregistry {

		private stores: {[key: string]: Store<any>} = {};

		public register(store: Store<any>): Store<any> {
			this.stores[store.name] = store;
			return store;
		}

		public get<T extends Store<any>>(storeClass: {new():T}): T {
			let name = storeClass.toString().match(/\w+/g)[1];
			return <T>this.stores[name];
		}

		public loadStore(name: string): Promise<Store<any>, string> {

			let self = this;

		   	let ret = this.getParentOfStore(name)
		   	.then((parent) => {
			   	if(self.stores[parent] instanceof Store || parent === 'ho.flux.Store')
				   	return true;
	   			else
			   		return self.loadStore(parent);
		   	})
		   	.then((parentType) => {
			   	return ho.flux.storeprovider.instance.getStore(name);
		   	})
		   	.then((storeClass) => {
			   	return self.register(new storeClass).init();
		   	})
			.then(()=>{
			   	return self.stores[name];
			});

			return ret;

			/*
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
			*/

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

		protected getParentOfStore(name: string): Promise<string, any> {
            return new Promise((resolve, reject) => {

                let xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = () => {
                    if(xmlhttp.readyState == 4) {
                        let resp = xmlhttp.responseText;
                        if(xmlhttp.status == 200) {
                            let m = resp.match(/}\)\((.*)\);/);
                            if(m !== null) {
                                resolve(m[1]);
                            }
                            else {
                                resolve(null);
                            }
                        } else {
                            reject(resp);
                        }

                    }
                };

                xmlhttp.open('GET', ho.flux.storeprovider.instance.resolve(name));
                xmlhttp.send();

            });
        }
	}

}
