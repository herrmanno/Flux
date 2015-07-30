/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
/// <reference path="./storeprovider.ts"/>

module ho.flux {
	import Promise = ho.promise.Promise;

	export function loadStore(name: string): Promise<Store, string> {
		if(STORES[name] !== undefined && STORES[name] instanceof Store)
			return Promise.create(STORES[name]);
		else {
			return new Promise((resolve, reject) => {
				storeprovider.instance.getStore(name)
				.then((s)=>{resolve(s);})
				.catch((e)=>{reject(e);});
			});
		}

	}
}
