/// <reference path="./dispatcher.ts"/>
/// <reference path="./store.ts"/>

module ho.flux {
	export let DISPATCHER = new Dispatcher();
	export let STORES: {[key:string]:Store} = {};

}
