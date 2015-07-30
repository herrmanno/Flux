/// <reference path="./dispatcher.ts"/>
/// <reference path="./store.ts"/>
var ho;
(function (ho) {
    var flux;
    (function (flux) {
        flux.DISPATCHER = new flux.Dispatcher();
        flux.STORES = {};
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));
