/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts" />
/// <reference path="storeprovider.d.ts" />
declare module ho.flux {
    import Promise = ho.promise.Promise;
    class Storeregistry {
        private stores;
        register(store: Store<any>): void;
        get<T extends Store<any>>(storeClass: {
            new (): T;
        }): T;
        loadStore(name: string): Promise<typeof Store, string>;
    }
}
