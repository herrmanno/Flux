/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
/// <reference path="./storeprovider.ts"/>
var ho;
(function (ho) {
    var flux;
    (function (flux) {
        var Promise = ho.promise.Promise;
        var Storeregistry = (function () {
            function Storeregistry() {
                this.stores = {};
            }
            Storeregistry.prototype.register = function (store) {
                this.stores[store.name] = store;
            };
            Storeregistry.prototype.get = function (storeClass) {
                var name = storeClass.toString().match(/\w+/g)[1];
                return this.stores[name];
            };
            Storeregistry.prototype.loadStore = function (name) {
                return new Promise(function (resolve, reject) {
                    var _this = this;
                    if (this.get(name) instanceof flux.Store)
                        resolve(this.get(name));
                    else {
                        flux.storeprovider.instance.getStore(name)
                            .then(function (storeClass) {
                            _this.register(new storeClass());
                            resolve(_this.get(name));
                        })
                            .catch(reject);
                    }
                }.bind(this));
                /*
                if(STORES[name] !== undefined && STORES[name] instanceof Store)
                    return Promise.create(STORES[name]);
                else {
                    return new Promise((resolve, reject) => {
                        storeprovider.instance.getStore(name)
                        .then((s)=>{resolve(s);})
                        .catch((e)=>{reject(e);});
                    });
                }
                */
            };
            return Storeregistry;
        })();
        flux.Storeregistry = Storeregistry;
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));
