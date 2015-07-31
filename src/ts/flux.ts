/// <reference path="./dispatcher.ts"/>
/// <reference path="./router.ts"/>
/// <reference path="./storeregistry.ts"/>

module ho.flux {
	import Promise = ho.promise.Promise;

	export let DISPATCHER: Dispatcher = new Dispatcher();
	//export let STORES: {[key:string]:Store<any>} = {};
	export let STORES: Storeregistry = new Storeregistry();

	//if(typeof ho.flux.STORES['Router'] === 'undefined')
	if(ho.flux.STORES.get(Router) === undefined)
		new Router();

	export function run(): Promise<any, any> {
		//return (<Router>ho.flux.STORES['Router']).init();
		return STORES.get(Router)._init();
	}
}
