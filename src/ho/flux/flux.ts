/// <reference path="../../../bower_components/ho-promise/dist/promise.d.ts"/>
/// <reference path="../../../bower_components/ho-classloader/dist/classloader.d.ts"/>

module ho.flux {
	import Promise = ho.promise.Promise;

	export let DISPATCHER: Dispatcher = new Dispatcher();

	export let STORES: registry.Registry = new registry.Registry();

	export let ACTIONS: actions.Registry = new actions.Registry();

	export let dir: boolean = false;


	export function run(router:any = Router): Promise<any, any> {
		return new Promise<any, any>((resolve, reject) => {
			if(!!STORES.get(router))
				resolve(STORES.get(router))
			else if(router === Router)
				resolve(new Router());
			else if(typeof router === 'function')
				resolve(new router())
			else if(typeof router === 'string') {
				STORES.loadStore(router)
				.then(s => resolve(s))
			}
		})
		.then(r => {
			return STORES.register(r).init();
		});

	}
}
