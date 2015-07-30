/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>

module ho.flux.storeprovider {
	import Promise = ho.promise.Promise;

    export interface IStoreProvider {
        useMin:boolean;
		resolve(name:string): string;
		getStore(name:string): Promise<typeof Store, string>;
    }

	class StoreProvider implements IStoreProvider {

        useMin: boolean = false;

        resolve(name: string): string {
            return this.useMin ?
                `stores/${name}.min.js` :
                `stores/${name}.js`;
        }

        getStore(name: string): Promise<typeof Store, string> {
            if(window[name] !== undefined && window[name].prototype instanceof Store)
				return Promise.create(window[name]);

			return new Promise<typeof Store, any>((resolve, reject) => {
                let src = this.resolve(name);
                let script = document.createElement('script');
                script.onload = function() {
                    if(typeof window[name] === 'function')
                        resolve(window[name]);
                    else
                        reject(`Error while loading Attribute ${name}`)
                };
                script.src = src;
                document.getElementsByTagName('head')[0].appendChild(script);
            });

        }

    }

    export let instance: IStoreProvider = new StoreProvider();
}
