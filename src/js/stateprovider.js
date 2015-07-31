/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
/// <reference path="./state.ts"/>
var ho;
(function (ho) {
    var flux;
    (function (flux) {
        var stateprovider;
        (function (stateprovider) {
            var Promise = ho.promise.Promise;
            var StateProvider = (function () {
                function StateProvider() {
                    this.useMin = false;
                }
                StateProvider.prototype.resolve = function () {
                    return this.useMin ?
                        "states.min.js" :
                        "states.js";
                };
                StateProvider.prototype.getStates = function (name) {
                    var _this = this;
                    if (name === void 0) { name = "States"; }
                    return new Promise(function (resolve, reject) {
                        var src = _this.resolve();
                        var script = document.createElement('script');
                        script.onload = function () {
                            resolve(new window[name]);
                        };
                        script.onerror = function (e) {
                            reject(e);
                        };
                        script.src = src;
                        document.getElementsByTagName('head')[0].appendChild(script);
                    });
                };
                return StateProvider;
            })();
            stateprovider.instance = new StateProvider();
        })(stateprovider = flux.stateprovider || (flux.stateprovider = {}));
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));
