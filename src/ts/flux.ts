module ho.flux {
	import Promise = ho.promise.Promise;

	export let DISPATCHER: Dispatcher = new Dispatcher();

	export let STORES: Storeregistry = new Storeregistry();

	export let dir: boolean = false;

	//if(ho.flux.STORES.get(Router) === undefined)
	//	new Router();

	export function run(): Promise<any, any> {
		//return (<Router>ho.flux.STORES['Router']).init();
		return STORES.get(Router).init();
	}
}
