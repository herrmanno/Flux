/// <reference path="dispatcher.d.ts" />
/// <reference path="router.d.ts" />
/// <reference path="storeregistry.d.ts" />
declare module ho.flux {
    import Promise = ho.promise.Promise;
    let DISPATCHER: Dispatcher;
    let STORES: Storeregistry;
    function run(): Promise<any, any>;
}
