/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
/// <reference path="./storeprovider.ts"/>
var ho;
(function (ho) {
    var flux;
    (function (flux) {
        var Promise = ho.promise.Promise;
        function loadStore(name) {
            if (flux.STORES[name] !== undefined && flux.STORES[name] instanceof flux.Store)
                return Promise.create(flux.STORES[name]);
            else {
                return new Promise(function (resolve, reject) {
                    flux.storeprovider.instance.getStore(name)
                        .then(function (s) { resolve(s); })
                        .catch(function (e) { reject(e); });
                });
            }
        }
        flux.loadStore = loadStore;
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));
