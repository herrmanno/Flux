/// <reference path="../../../bower_components/ho-promise/dist/promise.d.ts"/>
/// <reference path="../../../bower_components/ho-classloader/dist/classloader.d.ts"/>

module ho.flux {
	import Promise = ho.promise.Promise;

	export let DISPATCHER: Dispatcher = new Dispatcher();

	export let STORES: registry.Registry = new registry.Registry();

	export let dir: boolean = false;

	//if(ho.flux.STORES.get(Router) === undefined)
	//	new Router();

	export function run(): Promise<any, any> {
		//return (<Router>ho.flux.STORES['Router']).init();
		return STORES.get(Router).init();
	}
}
