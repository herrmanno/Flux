/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>

module ho.flux.storeprovider {
	import Promise = ho.promise.Promise;

    export interface IStoreProvider {
        useMin:boolean;
		resolve(name:string): string;
		getStore(name:string): Promise<typeof Store, string>;
    }

	export let mapping: {[name:string]:string} = {};

	class StoreProvider implements IStoreProvider {

        useMin: boolean = false;

        resolve(name: string): string {
            name = name.split('.').join('/');
			return this.useMin ?
                `stores/${name}.min.js` :
                `stores/${name}.js`;
        }

        getStore(name: string): Promise<typeof Store, string> {
            if(window[name] !== undefined && window[name].prototype instanceof Store)
				return Promise.create(window[name]);

			return new Promise<typeof Store, any>((resolve, reject) => {
                let src = mapping[name] || this.resolve(name);
                let script = document.createElement('script');
                script.onload = function() {
                    if(typeof this.get(name) === 'function')
                        resolve(this.get(name));
                    else
                        reject(`Error while loading Store ${name}`)
                }.bind(this);
                script.src = src;
                document.getElementsByTagName('head')[0].appendChild(script);
            });

        }

		private get(name: string): typeof Store {
            let c: any = window;
            name.split('.').forEach((part) => {
                c = c[part];
            });
            return <typeof Store>c;
        }

    }

    export let instance: IStoreProvider = new StoreProvider();
}
