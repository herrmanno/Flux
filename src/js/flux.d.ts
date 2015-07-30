/// <reference path="dispatcher.d.ts" />
/// <reference path="store.d.ts" />
declare module ho.flux {
    let DISPATCHER: Dispatcher;
    let STORES: {
        [key: string]: Store;
    };
}
