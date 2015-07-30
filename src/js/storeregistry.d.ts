/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts" />
/// <reference path="storeprovider.d.ts" />
declare module ho.flux {
    import Promise = ho.promise.Promise;
    function loadStore(name: string): Promise<Store, string>;
}
