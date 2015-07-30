/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts" />
declare module ho.flux.storeprovider {
    import Promise = ho.promise.Promise;
    interface IStoreProvider {
        useMin: boolean;
        resolve(name: string): string;
        getStore(name: string): Promise<typeof Store, string>;
    }
    let instance: IStoreProvider;
}
