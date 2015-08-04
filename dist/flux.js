var ho;
(function (ho) {
    var flux;
    (function (flux) {
        var CallbackHolder = (function () {
            function CallbackHolder() {
                this.prefix = 'ID_';
                this.lastID = 1;
                this.callbacks = {};
            }
            CallbackHolder.prototype.register = function (callback, self) {
                var id = this.prefix + this.lastID++;
                this.callbacks[id] = self ? callback.bind(self) : callback;
                return id;
            };
            CallbackHolder.prototype.unregister = function (id) {
                if (!this.callbacks[id])
                    throw 'Could not unregister callback for id ' + id;
                delete this.callbacks[id];
            };
            ;
            return CallbackHolder;
        })();
        flux.CallbackHolder = CallbackHolder;
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));
/// <reference path="./callbackholder.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ho;
(function (ho) {
    var flux;
    (function (flux) {
        var Dispatcher = (function (_super) {
            __extends(Dispatcher, _super);
            function Dispatcher() {
                _super.apply(this, arguments);
                this.isPending = {};
                this.isHandled = {};
                this.isDispatching = false;
                this.pendingPayload = null;
            }
            Dispatcher.prototype.waitFor = function () {
                var ids = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    ids[_i - 0] = arguments[_i];
                }
                if (!this.isDispatching)
                    throw 'Dispatcher.waitFor(...): Must be invoked while dispatching.';
                for (var ii = 0; ii < ids.length; ii++) {
                    var id = ids[ii];
                    if (this.isPending[id]) {
                        if (!this.isHandled[id])
                            throw "waitFor(...): Circular dependency detected while wating for " + id;
                        continue;
                    }
                    if (!this.callbacks[id])
                        throw "waitFor(...): " + id + " does not map to a registered callback.";
                    this.invokeCallback(id);
                }
            };
            ;
            Dispatcher.prototype.dispatch = function (action) {
                if (this.isDispatching)
                    throw 'Cannot dispatch in the middle of a dispatch.';
                this.startDispatching(action);
                try {
                    for (var id in this.callbacks) {
                        if (this.isPending[id]) {
                            continue;
                        }
                        this.invokeCallback(id);
                    }
                }
                finally {
                    this.stopDispatching();
                }
            };
            ;
            Dispatcher.prototype.invokeCallback = function (id) {
                this.isPending[id] = true;
                this.callbacks[id](this.pendingPayload);
                this.isHandled[id] = true;
            };
            Dispatcher.prototype.startDispatching = function (payload) {
                for (var id in this.callbacks) {
                    this.isPending[id] = false;
                    this.isHandled[id] = false;
                }
                this.pendingPayload = payload;
                this.isDispatching = true;
            };
            Dispatcher.prototype.stopDispatching = function () {
                this.pendingPayload = null;
                this.isDispatching = false;
            };
            return Dispatcher;
        })(flux.CallbackHolder);
        flux.Dispatcher = Dispatcher;
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
var ho;
(function (ho) {
    var flux;
    (function (flux) {
        var storeprovider;
        (function (storeprovider) {
            var Promise = ho.promise.Promise;
            storeprovider.mapping = {};
            var StoreProvider = (function () {
                function StoreProvider() {
                    this.useMin = false;
                }
                StoreProvider.prototype.resolve = function (name) {
                    name = name.split('.').join('/');
                    return this.useMin ?
                        "stores/" + name + ".min.js" :
                        "stores/" + name + ".js";
                };
                StoreProvider.prototype.getStore = function (name) {
                    var _this = this;
                    if (window[name] !== undefined && window[name].prototype instanceof flux.Store)
                        return Promise.create(window[name]);
                    return new Promise(function (resolve, reject) {
                        var src = storeprovider.mapping[name] || _this.resolve(name);
                        var script = document.createElement('script');
                        script.onload = function () {
                            if (typeof this.get(name) === 'function')
                                resolve(this.get(name));
                            else
                                reject("Error while loading Store " + name);
                        }.bind(_this);
                        script.src = src;
                        document.getElementsByTagName('head')[0].appendChild(script);
                    });
                };
                StoreProvider.prototype.get = function (name) {
                    var c = window;
                    name.split('.').forEach(function (part) {
                        c = c[part];
                    });
                    return c;
                };
                return StoreProvider;
            })();
            storeprovider.instance = new StoreProvider();
        })(storeprovider = flux.storeprovider || (flux.storeprovider = {}));
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));
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
                return store;
            };
            Storeregistry.prototype.get = function (storeClass) {
                var name = storeClass.toString().match(/\w+/g)[1];
                return this.stores[name];
            };
            Storeregistry.prototype.loadStore = function (name) {
                var self = this;
                var ret = this.getParentOfStore(name)
                    .then(function (parent) {
                    if (self.stores[parent] instanceof flux.Store || parent === 'ho.flux.Store')
                        return true;
                    else
                        return self.loadStore(parent);
                })
                    .then(function (parentType) {
                    return ho.flux.storeprovider.instance.getStore(name);
                })
                    .then(function (storeClass) {
                    return self.register(new storeClass).init();
                })
                    .then(function () {
                    return self.stores[name];
                });
                return ret;
                /*
                return new Promise(function(resolve, reject) {
                    if(this.get(name) instanceof Store)
                        resolve(this.get(name))
                    else {
    
                        storeprovider.instance.getStore(name)
                        .then((storeClass) => {
                            this.register(new storeClass());
                            resolve(this.get(name));
                        })
                        .catch(reject);
                    }
    
                }.bind(this));
                */
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
            Storeregistry.prototype.getParentOfStore = function (name) {
                return new Promise(function (resolve, reject) {
                    var xmlhttp = new XMLHttpRequest();
                    xmlhttp.onreadystatechange = function () {
                        if (xmlhttp.readyState == 4) {
                            var resp = xmlhttp.responseText;
                            if (xmlhttp.status == 200) {
                                var m = resp.match(/}\)\((.*)\);/);
                                if (m !== null) {
                                    resolve(m[1]);
                                }
                                else {
                                    resolve(null);
                                }
                            }
                            else {
                                reject(resp);
                            }
                        }
                    };
                    xmlhttp.open('GET', ho.flux.storeprovider.instance.resolve(name));
                    xmlhttp.send();
                });
            };
            return Storeregistry;
        })();
        flux.Storeregistry = Storeregistry;
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));
/// <reference path="./callbackholder.ts"/>
/// <reference path="./storeregistry.ts"/>
var ho;
(function (ho) {
    var flux;
    (function (flux) {
        var Store = (function (_super) {
            __extends(Store, _super);
            function Store() {
                _super.call(this);
                this.handlers = {};
                this.id = ho.flux.DISPATCHER.register(this.handle.bind(this));
                //ho.flux.STORES[this.name] = this;
                ho.flux.STORES.register(this);
            }
            Store.prototype.init = function () { };
            Object.defineProperty(Store.prototype, "name", {
                get: function () {
                    return this.constructor.toString().match(/\w+/g)[1];
                },
                enumerable: true,
                configurable: true
            });
            Store.prototype.register = function (callback, self) {
                return _super.prototype.register.call(this, callback, self);
            };
            Store.prototype.on = function (type, func) {
                this.handlers[type] = func;
            };
            Store.prototype.handle = function (action) {
                if (typeof this.handlers[action.type] === 'function')
                    this.handlers[action.type](action.data);
            };
            ;
            Store.prototype.changed = function () {
                for (var id in this.callbacks) {
                    var cb = this.callbacks[id];
                    if (cb)
                        cb(this.data);
                }
            };
            return Store;
        })(flux.CallbackHolder);
        flux.Store = Store;
        ;
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
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
/// <reference path="./store"/>
/// <reference path="./dispatcher.ts"/>
/// <reference path="./state.ts"/>
/// <reference path="./stateprovider.ts"/>
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
var ho;
(function (ho) {
    var flux;
    (function (flux) {
        var Promise = ho.promise.Promise;
        var Router = (function (_super) {
            __extends(Router, _super);
            //private state:IState;
            //private args:any = null;
            function Router() {
                _super.call(this);
                this.mapping = null;
            }
            Router.prototype.init = function () {
                this.on('STATE', this.onStateChangeRequested.bind(this));
                var onHashChange = this.onHashChange.bind(this);
                return this.initStates()
                    .then(function () {
                    window.onhashchange = onHashChange;
                    onHashChange();
                });
            };
            Router.prototype.go = function (data) {
                ho.flux.DISPATCHER.dispatch({
                    type: 'STATE',
                    data: data
                });
            };
            Router.prototype.initStates = function () {
                return flux.stateprovider.instance.getStates()
                    .then(function (istates) {
                    this.mapping = istates.states;
                }.bind(this));
            };
            Router.prototype.getStateFromName = function (name) {
                return this.mapping.filter(function (s) {
                    return s.name === name;
                })[0];
            };
            Router.prototype.onStateChangeRequested = function (data) {
                //current state and args equals requested state and args -> return
                //if(this.state && this.state.name === data.state && this.equals(this.args, data.args))
                if (this.data && this.data.state && this.data.state.name === data.state && this.equals(this.data.args, data.args))
                    return;
                //get requested state
                var state = this.getStateFromName(data.state);
                //requested state has an redirect property -> call redirect state
                if (!!state.redirect) {
                    state = this.getStateFromName(state.redirect);
                }
                //TODO handler promises
                var prom = typeof state.before === 'function' ? state.before(data) : Promise.create(undefined);
                prom
                    .then(function () {
                    //does the state change request comes from extern e.g. url change in browser window ?
                    var extern = !!data.extern;
                    //------- set current state & arguments
                    //this.state = state;
                    //this.args = data.args;
                    this.data = {
                        state: state,
                        args: data.args,
                        extern: extern
                    };
                    //------- set url for browser
                    var url = this.urlFromState(state.url, data.args);
                    this.setUrl(url);
                    this.changed();
                }.bind(this), function (data) {
                    this.onStateChangeRequested(data);
                }.bind(this));
            };
            Router.prototype.onHashChange = function () {
                var s = this.stateFromUrl(window.location.hash.substr(1));
                ho.flux.DISPATCHER.dispatch({
                    type: 'STATE',
                    data: {
                        state: s.state,
                        args: s.args,
                        extern: true
                    }
                });
            };
            Router.prototype.setUrl = function (url) {
                if (window.location.hash.substr(1) === url)
                    return;
                var l = window.onhashchange;
                window.onhashchange = null;
                window.location.hash = url;
                window.onhashchange = l;
            };
            Router.prototype.regexFromUrl = function (url) {
                var regex = /:([\w]+)/;
                while (url.match(regex)) {
                    url = url.replace(regex, "([^\/]+)");
                }
                return url + '$';
            };
            Router.prototype.argsFromUrl = function (pattern, url) {
                var r = this.regexFromUrl(pattern);
                var names = pattern.match(r).slice(1);
                var values = url.match(r).slice(1);
                var args = {};
                names.forEach(function (name, i) {
                    args[name.substr(1)] = values[i];
                });
                return args;
            };
            Router.prototype.stateFromUrl = function (url) {
                var _this = this;
                var s = void 0;
                this.mapping.forEach(function (state) {
                    if (s)
                        return;
                    var r = _this.regexFromUrl(state.url);
                    if (url.match(r)) {
                        var args = _this.argsFromUrl(state.url, url);
                        s = {
                            "state": state.name,
                            "args": args,
                            "extern": false
                        };
                    }
                });
                if (!s)
                    throw "No State found for url " + url;
                return s;
            };
            Router.prototype.urlFromState = function (url, args) {
                var regex = /:([\w]+)/;
                while (url.match(regex)) {
                    url = url.replace(regex, function (m) {
                        return args[m.substr(1)];
                    });
                }
                return url;
            };
            Router.prototype.equals = function (o1, o2) {
                return JSON.stringify(o1) === JSON.stringify(o2);
            };
            return Router;
        })(flux.Store);
        flux.Router = Router;
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));
/// <reference path="./dispatcher.ts"/>
/// <reference path="./router.ts"/>
/// <reference path="./storeregistry.ts"/>
var ho;
(function (ho) {
    var flux;
    (function (flux) {
        flux.DISPATCHER = new flux.Dispatcher();
        //export let STORES: {[key:string]:Store<any>} = {};
        flux.STORES = new flux.Storeregistry();
        //if(typeof ho.flux.STORES['Router'] === 'undefined')
        if (ho.flux.STORES.get(flux.Router) === undefined)
            new flux.Router();
        function run() {
            //return (<Router>ho.flux.STORES['Router']).init();
            return flux.STORES.get(flux.Router).init();
        }
        flux.run = run;
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbGxiYWNraG9sZGVyLnRzIiwiZGlzcGF0Y2hlci50cyIsInN0b3JlcHJvdmlkZXIudHMiLCJzdG9yZXJlZ2lzdHJ5LnRzIiwic3RvcmUudHMiLCJzdGF0ZS50cyIsInN0YXRlcHJvdmlkZXIudHMiLCJyb3V0ZXIudHMiLCJmbHV4LnRzIl0sIm5hbWVzIjpbImhvIiwiaG8uZmx1eCIsImhvLmZsdXguQ2FsbGJhY2tIb2xkZXIiLCJoby5mbHV4LkNhbGxiYWNrSG9sZGVyLmNvbnN0cnVjdG9yIiwiaG8uZmx1eC5DYWxsYmFja0hvbGRlci5yZWdpc3RlciIsImhvLmZsdXguQ2FsbGJhY2tIb2xkZXIudW5yZWdpc3RlciIsImhvLmZsdXguRGlzcGF0Y2hlciIsImhvLmZsdXguRGlzcGF0Y2hlci5jb25zdHJ1Y3RvciIsImhvLmZsdXguRGlzcGF0Y2hlci53YWl0Rm9yIiwiaG8uZmx1eC5EaXNwYXRjaGVyLmRpc3BhdGNoIiwiaG8uZmx1eC5EaXNwYXRjaGVyLmludm9rZUNhbGxiYWNrIiwiaG8uZmx1eC5EaXNwYXRjaGVyLnN0YXJ0RGlzcGF0Y2hpbmciLCJoby5mbHV4LkRpc3BhdGNoZXIuc3RvcERpc3BhdGNoaW5nIiwiaG8uZmx1eC5zdG9yZXByb3ZpZGVyIiwiaG8uZmx1eC5zdG9yZXByb3ZpZGVyLlN0b3JlUHJvdmlkZXIiLCJoby5mbHV4LnN0b3JlcHJvdmlkZXIuU3RvcmVQcm92aWRlci5jb25zdHJ1Y3RvciIsImhvLmZsdXguc3RvcmVwcm92aWRlci5TdG9yZVByb3ZpZGVyLnJlc29sdmUiLCJoby5mbHV4LnN0b3JlcHJvdmlkZXIuU3RvcmVQcm92aWRlci5nZXRTdG9yZSIsImhvLmZsdXguc3RvcmVwcm92aWRlci5TdG9yZVByb3ZpZGVyLmdldCIsImhvLmZsdXguU3RvcmVyZWdpc3RyeSIsImhvLmZsdXguU3RvcmVyZWdpc3RyeS5jb25zdHJ1Y3RvciIsImhvLmZsdXguU3RvcmVyZWdpc3RyeS5yZWdpc3RlciIsImhvLmZsdXguU3RvcmVyZWdpc3RyeS5nZXQiLCJoby5mbHV4LlN0b3JlcmVnaXN0cnkubG9hZFN0b3JlIiwiaG8uZmx1eC5TdG9yZXJlZ2lzdHJ5LmdldFBhcmVudE9mU3RvcmUiLCJoby5mbHV4LlN0b3JlIiwiaG8uZmx1eC5TdG9yZS5jb25zdHJ1Y3RvciIsImhvLmZsdXguU3RvcmUuaW5pdCIsImhvLmZsdXguU3RvcmUubmFtZSIsImhvLmZsdXguU3RvcmUucmVnaXN0ZXIiLCJoby5mbHV4LlN0b3JlLm9uIiwiaG8uZmx1eC5TdG9yZS5oYW5kbGUiLCJoby5mbHV4LlN0b3JlLmNoYW5nZWQiLCJoby5mbHV4LnN0YXRlcHJvdmlkZXIiLCJoby5mbHV4LnN0YXRlcHJvdmlkZXIuU3RhdGVQcm92aWRlciIsImhvLmZsdXguc3RhdGVwcm92aWRlci5TdGF0ZVByb3ZpZGVyLmNvbnN0cnVjdG9yIiwiaG8uZmx1eC5zdGF0ZXByb3ZpZGVyLlN0YXRlUHJvdmlkZXIucmVzb2x2ZSIsImhvLmZsdXguc3RhdGVwcm92aWRlci5TdGF0ZVByb3ZpZGVyLmdldFN0YXRlcyIsImhvLmZsdXguUm91dGVyIiwiaG8uZmx1eC5Sb3V0ZXIuY29uc3RydWN0b3IiLCJoby5mbHV4LlJvdXRlci5pbml0IiwiaG8uZmx1eC5Sb3V0ZXIuZ28iLCJoby5mbHV4LlJvdXRlci5pbml0U3RhdGVzIiwiaG8uZmx1eC5Sb3V0ZXIuZ2V0U3RhdGVGcm9tTmFtZSIsImhvLmZsdXguUm91dGVyLm9uU3RhdGVDaGFuZ2VSZXF1ZXN0ZWQiLCJoby5mbHV4LlJvdXRlci5vbkhhc2hDaGFuZ2UiLCJoby5mbHV4LlJvdXRlci5zZXRVcmwiLCJoby5mbHV4LlJvdXRlci5yZWdleEZyb21VcmwiLCJoby5mbHV4LlJvdXRlci5hcmdzRnJvbVVybCIsImhvLmZsdXguUm91dGVyLnN0YXRlRnJvbVVybCIsImhvLmZsdXguUm91dGVyLnVybEZyb21TdGF0ZSIsImhvLmZsdXguUm91dGVyLmVxdWFscyIsImhvLmZsdXgucnVuIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFPLEVBQUUsQ0Fv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UUFBR0EsTUFHbEJBLENBQUFBO0lBQ0ZBLENBQUNBLEVBZlNELElBQUlBLEdBQUpBLE9BQUlBLEtBQUpBLE9BQUlBLFFBZWJBO0FBQURBLENBQUNBLEVBZk0sRUFBRSxLQUFGLEVBQUUsUUFlUiIsImZpbGUiOiJmbHV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlIGhvLmZsdXgge1xuXG5cdGV4cG9ydCBjbGFzcyBDYWxsYmFja0hvbGRlciB7XG5cblx0XHRwcm90ZWN0ZWQgcHJlZml4OiBzdHJpbmcgPSAnSURfJztcbiAgICBcdHByb3RlY3RlZCBsYXN0SUQ6IG51bWJlciA9IDE7XG5cdFx0cHJvdGVjdGVkIGNhbGxiYWNrczoge1trZXk6c3RyaW5nXTpGdW5jdGlvbn0gPSB7fTtcblxuXHRcdHB1YmxpYyByZWdpc3RlcihjYWxsYmFjazogRnVuY3Rpb24sIHNlbGY/OiBhbnkpOiBzdHJpbmcge1xuICAgIFx0XHRsZXQgaWQgPSB0aGlzLnByZWZpeCArIHRoaXMubGFzdElEKys7XG4gICAgXHRcdHRoaXMuY2FsbGJhY2tzW2lkXSA9IHNlbGYgPyBjYWxsYmFjay5iaW5kKHNlbGYpIDogY2FsbGJhY2s7XG4gICAgXHRcdHJldHVybiBpZDtcbiAgXHRcdH1cblxuICBcdFx0cHVibGljIHVucmVnaXN0ZXIoaWQpIHtcbiAgICAgIFx0XHRpZighdGhpcy5jYWxsYmFja3NbaWRdKVxuXHRcdFx0XHR0aHJvdyAnQ291bGQgbm90IHVucmVnaXN0ZXIgY2FsbGJhY2sgZm9yIGlkICcgKyBpZDtcbiAgICBcdFx0ZGVsZXRlIHRoaXMuY2FsbGJhY2tzW2lkXTtcbiAgXHRcdH07XG5cdH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2NhbGxiYWNraG9sZGVyLnRzXCIvPlxuXG5tb2R1bGUgaG8uZmx1eCB7XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJQWN0aW9uIHtcblx0ICAgIHR5cGU6c3RyaW5nO1xuXHRcdGRhdGE/OmFueTtcblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgQ2FsbGJhY2tIb2xkZXIge1xuXG4gICAgXHRwcml2YXRlIGlzUGVuZGluZzoge1trZXk6c3RyaW5nXTpib29sZWFufSA9IHt9O1xuICAgIFx0cHJpdmF0ZSBpc0hhbmRsZWQ6IHtba2V5OnN0cmluZ106Ym9vbGVhbn0gPSB7fTtcbiAgICBcdHByaXZhdGUgaXNEaXNwYXRjaGluZzogYm9vbGVhbiA9IGZhbHNlO1xuICAgIFx0cHJpdmF0ZSBwZW5kaW5nUGF5bG9hZDogSUFjdGlvbiA9IG51bGw7XG5cblx0XHRwdWJsaWMgd2FpdEZvciguLi5pZHM6IEFycmF5PG51bWJlcj4pOiB2b2lkIHtcblx0XHRcdGlmKCF0aGlzLmlzRGlzcGF0Y2hpbmcpXG5cdFx0ICBcdFx0dGhyb3cgJ0Rpc3BhdGNoZXIud2FpdEZvciguLi4pOiBNdXN0IGJlIGludm9rZWQgd2hpbGUgZGlzcGF0Y2hpbmcuJztcblxuXHRcdFx0Zm9yIChsZXQgaWkgPSAwOyBpaSA8IGlkcy5sZW5ndGg7IGlpKyspIHtcblx0XHRcdCAgbGV0IGlkID0gaWRzW2lpXTtcblxuXHRcdFx0ICBpZiAodGhpcy5pc1BlbmRpbmdbaWRdKSB7XG5cdFx0ICAgICAgXHRpZighdGhpcy5pc0hhbmRsZWRbaWRdKVxuXHRcdFx0ICAgICAgXHR0aHJvdyBgd2FpdEZvciguLi4pOiBDaXJjdWxhciBkZXBlbmRlbmN5IGRldGVjdGVkIHdoaWxlIHdhdGluZyBmb3IgJHtpZH1gO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdCAgfVxuXG5cdFx0XHQgIGlmKCF0aGlzLmNhbGxiYWNrc1tpZF0pXG5cdFx0XHQgIFx0dGhyb3cgYHdhaXRGb3IoLi4uKTogJHtpZH0gZG9lcyBub3QgbWFwIHRvIGEgcmVnaXN0ZXJlZCBjYWxsYmFjay5gO1xuXG5cdFx0XHQgIHRoaXMuaW52b2tlQ2FsbGJhY2soaWQpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRwdWJsaWMgZGlzcGF0Y2goYWN0aW9uOiBJQWN0aW9uKSB7XG5cdFx0XHRpZih0aGlzLmlzRGlzcGF0Y2hpbmcpXG5cdFx0ICAgIFx0dGhyb3cgJ0Nhbm5vdCBkaXNwYXRjaCBpbiB0aGUgbWlkZGxlIG9mIGEgZGlzcGF0Y2guJztcblxuXHRcdFx0dGhpcy5zdGFydERpc3BhdGNoaW5nKGFjdGlvbik7XG5cblx0XHQgICAgdHJ5IHtcblx0XHQgICAgICBmb3IgKGxldCBpZCBpbiB0aGlzLmNhbGxiYWNrcykge1xuXHRcdCAgICAgICAgaWYgKHRoaXMuaXNQZW5kaW5nW2lkXSkge1xuXHRcdCAgICAgICAgICBjb250aW51ZTtcblx0XHQgICAgICAgIH1cblx0XHQgICAgICAgIHRoaXMuaW52b2tlQ2FsbGJhY2soaWQpO1xuXHRcdCAgICAgIH1cblx0XHQgICAgfSBmaW5hbGx5IHtcblx0XHQgICAgICB0aGlzLnN0b3BEaXNwYXRjaGluZygpO1xuXHRcdCAgICB9XG5cdFx0fTtcblxuXHQgIFx0cHJpdmF0ZSBpbnZva2VDYWxsYmFjayhpZDogbnVtYmVyKTogdm9pZCB7XG5cdCAgICBcdHRoaXMuaXNQZW5kaW5nW2lkXSA9IHRydWU7XG5cdCAgICBcdHRoaXMuY2FsbGJhY2tzW2lkXSh0aGlzLnBlbmRpbmdQYXlsb2FkKTtcblx0ICAgIFx0dGhpcy5pc0hhbmRsZWRbaWRdID0gdHJ1ZTtcblx0ICBcdH1cblxuXHQgIFx0cHJpdmF0ZSBzdGFydERpc3BhdGNoaW5nKHBheWxvYWQ6IElBY3Rpb24pOiB2b2lkIHtcblx0ICAgIFx0Zm9yIChsZXQgaWQgaW4gdGhpcy5jYWxsYmFja3MpIHtcblx0ICAgICAgXHRcdHRoaXMuaXNQZW5kaW5nW2lkXSA9IGZhbHNlO1xuXHQgICAgICBcdFx0dGhpcy5pc0hhbmRsZWRbaWRdID0gZmFsc2U7XG5cdCAgICBcdH1cblx0ICAgIFx0dGhpcy5wZW5kaW5nUGF5bG9hZCA9IHBheWxvYWQ7XG5cdCAgICBcdHRoaXMuaXNEaXNwYXRjaGluZyA9IHRydWU7XG4gIFx0XHR9XG5cblx0ICBcdHByaXZhdGUgc3RvcERpc3BhdGNoaW5nKCk6IHZvaWQge1xuXHQgICAgXHR0aGlzLnBlbmRpbmdQYXlsb2FkID0gbnVsbDtcblx0ICAgIFx0dGhpcy5pc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG5cdCAgXHR9XG5cdH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9ib3dlcl9jb21wb25lbnRzL2hvLXByb21pc2UvZGlzdC9kLnRzL3Byb21pc2UuZC50c1wiLz5cblxubW9kdWxlIGhvLmZsdXguc3RvcmVwcm92aWRlciB7XG5cdGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xuXG4gICAgZXhwb3J0IGludGVyZmFjZSBJU3RvcmVQcm92aWRlciB7XG4gICAgICAgIHVzZU1pbjpib29sZWFuO1xuXHRcdHJlc29sdmUobmFtZTpzdHJpbmcpOiBzdHJpbmc7XG5cdFx0Z2V0U3RvcmUobmFtZTpzdHJpbmcpOiBQcm9taXNlPHR5cGVvZiBTdG9yZSwgc3RyaW5nPjtcbiAgICB9XG5cblx0ZXhwb3J0IGxldCBtYXBwaW5nOiB7W25hbWU6c3RyaW5nXTpzdHJpbmd9ID0ge307XG5cblx0Y2xhc3MgU3RvcmVQcm92aWRlciBpbXBsZW1lbnRzIElTdG9yZVByb3ZpZGVyIHtcblxuICAgICAgICB1c2VNaW46IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgICAgICByZXNvbHZlKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZS5zcGxpdCgnLicpLmpvaW4oJy8nKTtcblx0XHRcdHJldHVybiB0aGlzLnVzZU1pbiA/XG4gICAgICAgICAgICAgICAgYHN0b3Jlcy8ke25hbWV9Lm1pbi5qc2AgOlxuICAgICAgICAgICAgICAgIGBzdG9yZXMvJHtuYW1lfS5qc2A7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRTdG9yZShuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHR5cGVvZiBTdG9yZSwgc3RyaW5nPiB7XG4gICAgICAgICAgICBpZih3aW5kb3dbbmFtZV0gIT09IHVuZGVmaW5lZCAmJiB3aW5kb3dbbmFtZV0ucHJvdG90eXBlIGluc3RhbmNlb2YgU3RvcmUpXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLmNyZWF0ZSh3aW5kb3dbbmFtZV0pO1xuXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2U8dHlwZW9mIFN0b3JlLCBhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgc3JjID0gbWFwcGluZ1tuYW1lXSB8fCB0aGlzLnJlc29sdmUobmFtZSk7XG4gICAgICAgICAgICAgICAgbGV0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgICAgIHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mIHRoaXMuZ2V0KG5hbWUpID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLmdldChuYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChgRXJyb3Igd2hpbGUgbG9hZGluZyBTdG9yZSAke25hbWV9YClcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgICAgICAgICAgICAgc2NyaXB0LnNyYyA9IHNyYztcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cblx0XHRwcml2YXRlIGdldChuYW1lOiBzdHJpbmcpOiB0eXBlb2YgU3RvcmUge1xuICAgICAgICAgICAgbGV0IGM6IGFueSA9IHdpbmRvdztcbiAgICAgICAgICAgIG5hbWUuc3BsaXQoJy4nKS5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICAgICAgICAgICAgYyA9IGNbcGFydF07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiA8dHlwZW9mIFN0b3JlPmM7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGV4cG9ydCBsZXQgaW5zdGFuY2U6IElTdG9yZVByb3ZpZGVyID0gbmV3IFN0b3JlUHJvdmlkZXIoKTtcbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9ib3dlcl9jb21wb25lbnRzL2hvLXByb21pc2UvZGlzdC9kLnRzL3Byb21pc2UuZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3N0b3JlcHJvdmlkZXIudHNcIi8+XG5cbm1vZHVsZSBoby5mbHV4IHtcblx0aW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XG5cblx0ZXhwb3J0IGNsYXNzIFN0b3JlcmVnaXN0cnkge1xuXG5cdFx0cHJpdmF0ZSBzdG9yZXM6IHtba2V5OiBzdHJpbmddOiBTdG9yZTxhbnk+fSA9IHt9O1xuXG5cdFx0cHVibGljIHJlZ2lzdGVyKHN0b3JlOiBTdG9yZTxhbnk+KTogU3RvcmU8YW55PiB7XG5cdFx0XHR0aGlzLnN0b3Jlc1tzdG9yZS5uYW1lXSA9IHN0b3JlO1xuXHRcdFx0cmV0dXJuIHN0b3JlO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBnZXQ8VCBleHRlbmRzIFN0b3JlPGFueT4+KHN0b3JlQ2xhc3M6IHtuZXcoKTpUfSk6IFQge1xuXHRcdFx0bGV0IG5hbWUgPSBzdG9yZUNsYXNzLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG5cdFx0XHRyZXR1cm4gPFQ+dGhpcy5zdG9yZXNbbmFtZV07XG5cdFx0fVxuXG5cdFx0cHVibGljIGxvYWRTdG9yZShuYW1lOiBzdHJpbmcpOiBQcm9taXNlPFN0b3JlPGFueT4sIHN0cmluZz4ge1xuXG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHQgICBcdGxldCByZXQgPSB0aGlzLmdldFBhcmVudE9mU3RvcmUobmFtZSlcblx0XHQgICBcdC50aGVuKChwYXJlbnQpID0+IHtcblx0XHRcdCAgIFx0aWYoc2VsZi5zdG9yZXNbcGFyZW50XSBpbnN0YW5jZW9mIFN0b3JlIHx8IHBhcmVudCA9PT0gJ2hvLmZsdXguU3RvcmUnKVxuXHRcdFx0XHQgICBcdHJldHVybiB0cnVlO1xuXHQgICBcdFx0XHRlbHNlXG5cdFx0XHQgICBcdFx0cmV0dXJuIHNlbGYubG9hZFN0b3JlKHBhcmVudCk7XG5cdFx0ICAgXHR9KVxuXHRcdCAgIFx0LnRoZW4oKHBhcmVudFR5cGUpID0+IHtcblx0XHRcdCAgIFx0cmV0dXJuIGhvLmZsdXguc3RvcmVwcm92aWRlci5pbnN0YW5jZS5nZXRTdG9yZShuYW1lKTtcblx0XHQgICBcdH0pXG5cdFx0ICAgXHQudGhlbigoc3RvcmVDbGFzcykgPT4ge1xuXHRcdFx0ICAgXHRyZXR1cm4gc2VsZi5yZWdpc3RlcihuZXcgc3RvcmVDbGFzcykuaW5pdCgpO1xuXHRcdCAgIFx0fSlcblx0XHRcdC50aGVuKCgpPT57XG5cdFx0XHQgICBcdHJldHVybiBzZWxmLnN0b3Jlc1tuYW1lXTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gcmV0O1xuXG5cdFx0XHQvKlxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0XHRpZih0aGlzLmdldChuYW1lKSBpbnN0YW5jZW9mIFN0b3JlKVxuXHRcdFx0XHRcdHJlc29sdmUodGhpcy5nZXQobmFtZSkpXG5cdFx0XHRcdGVsc2Uge1xuXG5cdFx0XHRcdFx0c3RvcmVwcm92aWRlci5pbnN0YW5jZS5nZXRTdG9yZShuYW1lKVxuXHRcdFx0XHRcdC50aGVuKChzdG9yZUNsYXNzKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlZ2lzdGVyKG5ldyBzdG9yZUNsYXNzKCkpO1xuXHRcdFx0XHRcdFx0cmVzb2x2ZSh0aGlzLmdldChuYW1lKSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2gocmVqZWN0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9LmJpbmQodGhpcykpO1xuXHRcdFx0Ki9cblxuXHRcdFx0Lypcblx0XHRcdGlmKFNUT1JFU1tuYW1lXSAhPT0gdW5kZWZpbmVkICYmIFNUT1JFU1tuYW1lXSBpbnN0YW5jZW9mIFN0b3JlKVxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5jcmVhdGUoU1RPUkVTW25hbWVdKTtcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0XHRcdHN0b3JlcHJvdmlkZXIuaW5zdGFuY2UuZ2V0U3RvcmUobmFtZSlcblx0XHRcdFx0XHQudGhlbigocyk9PntyZXNvbHZlKHMpO30pXG5cdFx0XHRcdFx0LmNhdGNoKChlKT0+e3JlamVjdChlKTt9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHQqL1xuXG5cdFx0fVxuXG5cdFx0cHJvdGVjdGVkIGdldFBhcmVudE9mU3RvcmUobmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcsIGFueT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIGxldCB4bWxodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgeG1saHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHhtbGh0dHAucmVhZHlTdGF0ZSA9PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVzcCA9IHhtbGh0dHAucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoeG1saHR0cC5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG0gPSByZXNwLm1hdGNoKC99XFwpXFwoKC4qKVxcKTsvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihtICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobVsxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlc3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgeG1saHR0cC5vcGVuKCdHRVQnLCBoby5mbHV4LnN0b3JlcHJvdmlkZXIuaW5zdGFuY2UucmVzb2x2ZShuYW1lKSk7XG4gICAgICAgICAgICAgICAgeG1saHR0cC5zZW5kKCk7XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cdH1cblxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vY2FsbGJhY2tob2xkZXIudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9zdG9yZXJlZ2lzdHJ5LnRzXCIvPlxuXG5tb2R1bGUgaG8uZmx1eCB7XG5cblx0ZXhwb3J0IGNsYXNzIFN0b3JlPFQ+IGV4dGVuZHMgQ2FsbGJhY2tIb2xkZXIge1xuXG5cdFx0cHJvdGVjdGVkIGRhdGE6IFQ7XG5cdFx0cHJpdmF0ZSBpZDogc3RyaW5nO1xuXHRcdHByaXZhdGUgaGFuZGxlcnM6IHtba2V5OiBzdHJpbmddOiBGdW5jdGlvbn0gPSB7fTtcblxuXG5cdFx0Y29uc3RydWN0b3IoKSB7XG5cdFx0XHRzdXBlcigpO1xuXHRcdFx0dGhpcy5pZCA9IGhvLmZsdXguRElTUEFUQ0hFUi5yZWdpc3Rlcih0aGlzLmhhbmRsZS5iaW5kKHRoaXMpKTtcblx0XHRcdC8vaG8uZmx1eC5TVE9SRVNbdGhpcy5uYW1lXSA9IHRoaXM7XG5cdFx0XHRoby5mbHV4LlNUT1JFUy5yZWdpc3Rlcih0aGlzKTtcblx0XHR9XG5cblx0XHRwdWJsaWMgaW5pdCgpOiBhbnkge31cblxuXHRcdCBnZXQgbmFtZSgpOiBzdHJpbmcge1xuXHRcdFx0cmV0dXJuIHRoaXMuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcblx0XHR9XG5cblx0XHRwdWJsaWMgcmVnaXN0ZXIoY2FsbGJhY2s6IChkYXRhOlQpPT52b2lkLCBzZWxmPzphbnkpOiBzdHJpbmcge1xuXHRcdFx0cmV0dXJuIHN1cGVyLnJlZ2lzdGVyKGNhbGxiYWNrLCBzZWxmKTtcblx0XHR9XG5cblx0XHRwcm90ZWN0ZWQgb24odHlwZTogc3RyaW5nLCBmdW5jOiBGdW5jdGlvbik6IHZvaWQge1xuXHRcdFx0dGhpcy5oYW5kbGVyc1t0eXBlXSA9IGZ1bmM7XG5cdFx0fVxuXG5cdFx0cHJvdGVjdGVkIGhhbmRsZShhY3Rpb246IElBY3Rpb24pOiB2b2lkIHtcblx0XHRcdGlmKHR5cGVvZiB0aGlzLmhhbmRsZXJzW2FjdGlvbi50eXBlXSA9PT0gJ2Z1bmN0aW9uJylcblx0XHRcdFx0dGhpcy5oYW5kbGVyc1thY3Rpb24udHlwZV0oYWN0aW9uLmRhdGEpO1xuXHRcdH07XG5cblxuXHRcdHByb3RlY3RlZCBjaGFuZ2VkKCk6IHZvaWQge1xuXHRcdFx0Zm9yIChsZXQgaWQgaW4gdGhpcy5jYWxsYmFja3MpIHtcblx0XHRcdCAgbGV0IGNiID0gdGhpcy5jYWxsYmFja3NbaWRdO1xuXHRcdFx0ICBpZihjYilcblx0XHRcdCAgXHRjYih0aGlzLmRhdGEpO1xuXHRcdFx0fVxuXHRcdH1cblxuXG5cdH07XG5cblxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8tcHJvbWlzZS9kaXN0L2QudHMvcHJvbWlzZS5kLnRzXCIvPlxuXG5tb2R1bGUgaG8uZmx1eCB7XG5cdGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xuXG5cblx0ZXhwb3J0IGludGVyZmFjZSBJU3RhdGUge1xuXHRcdG5hbWU6IHN0cmluZztcblx0XHR1cmw6IHN0cmluZztcblx0XHRyZWRpcmVjdD86IHN0cmluZztcblx0XHRiZWZvcmU/OiAoZGF0YTogSVJvdXRlRGF0YSk9PlByb21pc2U8YW55LCBhbnk+O1xuXHRcdHZpZXc/OiBBcnJheTxJVmlld1N0YXRlPjtcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVZpZXdTdGF0ZSB7XG5cdCAgICBuYW1lOiBzdHJpbmc7XG5cdFx0aHRtbDogc3RyaW5nO1xuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJU3RhdGVzIHtcblx0ICAgIHN0YXRlczogQXJyYXk8SVN0YXRlPjtcblx0fVxuXG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYm93ZXJfY29tcG9uZW50cy9oby1wcm9taXNlL2Rpc3QvZC50cy9wcm9taXNlLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9zdGF0ZS50c1wiLz5cblxubW9kdWxlIGhvLmZsdXguc3RhdGVwcm92aWRlciB7XG5cdGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xuXG4gICAgZXhwb3J0IGludGVyZmFjZSBJU3RhdGVQcm92aWRlciB7XG4gICAgICAgIHVzZU1pbjpib29sZWFuO1xuXHRcdHJlc29sdmUoKTogc3RyaW5nO1xuXHRcdGdldFN0YXRlcyhuYW1lPzpzdHJpbmcpOiBQcm9taXNlPElTdGF0ZXMsIHN0cmluZz47XG4gICAgfVxuXG5cdGNsYXNzIFN0YXRlUHJvdmlkZXIgaW1wbGVtZW50cyBJU3RhdGVQcm92aWRlciB7XG5cbiAgICAgICAgdXNlTWluOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAgICAgcmVzb2x2ZSgpOiBzdHJpbmcge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudXNlTWluID9cbiAgICAgICAgICAgICAgICBgc3RhdGVzLm1pbi5qc2AgOlxuICAgICAgICAgICAgICAgIGBzdGF0ZXMuanNgO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0U3RhdGVzKG5hbWUgPSBcIlN0YXRlc1wiKTogUHJvbWlzZTxJU3RhdGVzLCBzdHJpbmc+IHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZTxJU3RhdGVzLCBhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdFx0bGV0IHNyYyA9IHRoaXMucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIGxldCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgICAgICAgICBzY3JpcHQub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IHdpbmRvd1tuYW1lXSk7XG4gICAgICAgICAgICAgICAgfTtcblx0XHRcdFx0c2NyaXB0Lm9uZXJyb3IgPSAoZSkgPT4ge1xuXHRcdFx0XHRcdHJlamVjdChlKTtcblx0XHRcdFx0fTtcbiAgICAgICAgICAgICAgICBzY3JpcHQuc3JjID0gc3JjO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGV4cG9ydCBsZXQgaW5zdGFuY2U6IElTdGF0ZVByb3ZpZGVyID0gbmV3IFN0YXRlUHJvdmlkZXIoKTtcbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3N0b3JlXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZGlzcGF0Y2hlci50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3N0YXRlLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vc3RhdGVwcm92aWRlci50c1wiLz5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8tcHJvbWlzZS9kaXN0L2QudHMvcHJvbWlzZS5kLnRzXCIvPlxuXG5cbm1vZHVsZSBoby5mbHV4IHtcblxuXHRpbXBvcnQgUHJvbWlzZSA9IGhvLnByb21pc2UuUHJvbWlzZTtcblxuXG5cdC8qKiBEYXRhIHRoYXQgYSBSb3V0ZXIjZ28gdGFrZXMgKi9cblx0ZXhwb3J0IGludGVyZmFjZSBJUm91dGVEYXRhIHtcblx0ICAgIHN0YXRlOiBzdHJpbmc7XG5cdFx0YXJnczogYW55O1xuXHRcdGV4dGVybjogYm9vbGVhbjtcblx0fVxuXG5cdC8qKiBEYXRhIHRoYXQgUm91dGVyI2NoYW5nZXMgZW1pdCB0byBpdHMgbGlzdGVuZXJzICovXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVJvdXRlckRhdGEge1xuXHQgICAgc3RhdGU6IElTdGF0ZTtcblx0XHRhcmdzOiBhbnk7XG5cdFx0ZXh0ZXJuOiBib29sZWFuO1xuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFJvdXRlciBleHRlbmRzIFN0b3JlPElSb3V0ZXJEYXRhPiB7XG5cblx0XHRwcml2YXRlIG1hcHBpbmc6QXJyYXk8SVN0YXRlPiA9IG51bGw7XG5cdFx0Ly9wcml2YXRlIHN0YXRlOklTdGF0ZTtcblx0XHQvL3ByaXZhdGUgYXJnczphbnkgPSBudWxsO1xuXG5cdFx0Y29uc3RydWN0b3IoKSB7XG5cdFx0XHRzdXBlcigpO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBpbml0KCk6IFByb21pc2U8YW55LCBhbnk+IHtcblx0XHRcdHRoaXMub24oJ1NUQVRFJywgdGhpcy5vblN0YXRlQ2hhbmdlUmVxdWVzdGVkLmJpbmQodGhpcykpO1xuXG5cdFx0XHRsZXQgb25IYXNoQ2hhbmdlID0gdGhpcy5vbkhhc2hDaGFuZ2UuYmluZCh0aGlzKTtcblxuXHRcdFx0cmV0dXJuIHRoaXMuaW5pdFN0YXRlcygpXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdHdpbmRvdy5vbmhhc2hjaGFuZ2UgPSBvbkhhc2hDaGFuZ2U7XG5cdFx0XHRcdG9uSGFzaENoYW5nZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cblx0XHRwdWJsaWMgZ28oZGF0YTogSVJvdXRlRGF0YSk6IHZvaWQge1xuXHRcdFx0aG8uZmx1eC5ESVNQQVRDSEVSLmRpc3BhdGNoKHtcblx0XHRcdFx0dHlwZTogJ1NUQVRFJyxcblx0XHRcdFx0ZGF0YTogZGF0YVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBpbml0U3RhdGVzKCk6IFByb21pc2U8YW55LCBhbnk+IHtcblx0XHRcdHJldHVybiBzdGF0ZXByb3ZpZGVyLmluc3RhbmNlLmdldFN0YXRlcygpXG5cdFx0XHQudGhlbihmdW5jdGlvbihpc3RhdGVzKSB7XG5cdFx0XHRcdHRoaXMubWFwcGluZyA9IGlzdGF0ZXMuc3RhdGVzO1xuXHRcdFx0fS5iaW5kKHRoaXMpKTtcblx0XHR9XG5cblx0XHRwcml2YXRlIGdldFN0YXRlRnJvbU5hbWUobmFtZTogc3RyaW5nKTogSVN0YXRlIHtcblx0XHRcdHJldHVybiB0aGlzLm1hcHBpbmcuZmlsdGVyKChzKT0+e1xuXHRcdFx0XHRyZXR1cm4gcy5uYW1lID09PSBuYW1lXG5cdFx0XHR9KVswXTtcblx0XHR9XG5cblx0XHRwcm90ZWN0ZWQgb25TdGF0ZUNoYW5nZVJlcXVlc3RlZChkYXRhOiBJUm91dGVEYXRhKTogdm9pZCB7XG5cdFx0XHQvL2N1cnJlbnQgc3RhdGUgYW5kIGFyZ3MgZXF1YWxzIHJlcXVlc3RlZCBzdGF0ZSBhbmQgYXJncyAtPiByZXR1cm5cblx0XHRcdC8vaWYodGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLm5hbWUgPT09IGRhdGEuc3RhdGUgJiYgdGhpcy5lcXVhbHModGhpcy5hcmdzLCBkYXRhLmFyZ3MpKVxuXHRcdFx0aWYodGhpcy5kYXRhICYmIHRoaXMuZGF0YS5zdGF0ZSAmJiB0aGlzLmRhdGEuc3RhdGUubmFtZSA9PT0gZGF0YS5zdGF0ZSAmJiB0aGlzLmVxdWFscyh0aGlzLmRhdGEuYXJncywgZGF0YS5hcmdzKSlcblx0XHRcdFx0cmV0dXJuO1xuXG5cdFx0XHQvL2dldCByZXF1ZXN0ZWQgc3RhdGVcblx0XHRcdGxldCBzdGF0ZSA9IHRoaXMuZ2V0U3RhdGVGcm9tTmFtZShkYXRhLnN0YXRlKTtcblxuXG5cdFx0XHQvL3JlcXVlc3RlZCBzdGF0ZSBoYXMgYW4gcmVkaXJlY3QgcHJvcGVydHkgLT4gY2FsbCByZWRpcmVjdCBzdGF0ZVxuXHRcdFx0aWYoISFzdGF0ZS5yZWRpcmVjdCkge1xuXHRcdFx0XHRzdGF0ZSA9IHRoaXMuZ2V0U3RhdGVGcm9tTmFtZShzdGF0ZS5yZWRpcmVjdCk7XG5cdFx0XHR9XG5cblxuXHRcdFx0Ly9UT0RPIGhhbmRsZXIgcHJvbWlzZXNcblx0XHRcdGxldCBwcm9tID0gdHlwZW9mIHN0YXRlLmJlZm9yZSA9PT0gJ2Z1bmN0aW9uJyA/IHN0YXRlLmJlZm9yZShkYXRhKSA6IFByb21pc2UuY3JlYXRlKHVuZGVmaW5lZCk7XG5cdFx0XHRwcm9tXG5cdFx0XHQudGhlbihmdW5jdGlvbigpIHtcblxuXHRcdFx0XHQvL2RvZXMgdGhlIHN0YXRlIGNoYW5nZSByZXF1ZXN0IGNvbWVzIGZyb20gZXh0ZXJuIGUuZy4gdXJsIGNoYW5nZSBpbiBicm93c2VyIHdpbmRvdyA/XG5cdFx0XHRcdGxldCBleHRlcm4gPSAhISBkYXRhLmV4dGVybjtcblxuXHRcdFx0XHQvLy0tLS0tLS0gc2V0IGN1cnJlbnQgc3RhdGUgJiBhcmd1bWVudHNcblx0XHRcdFx0Ly90aGlzLnN0YXRlID0gc3RhdGU7XG5cdFx0XHRcdC8vdGhpcy5hcmdzID0gZGF0YS5hcmdzO1xuXG5cdFx0XHRcdHRoaXMuZGF0YSA9IHtcblx0XHRcdFx0XHRzdGF0ZTogc3RhdGUsXG5cdFx0XHRcdFx0YXJnczogZGF0YS5hcmdzLFxuXHRcdFx0XHRcdGV4dGVybjogZXh0ZXJuLFxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdC8vLS0tLS0tLSBzZXQgdXJsIGZvciBicm93c2VyXG5cdFx0XHRcdHZhciB1cmwgPSB0aGlzLnVybEZyb21TdGF0ZShzdGF0ZS51cmwsIGRhdGEuYXJncyk7XG5cdFx0XHRcdHRoaXMuc2V0VXJsKHVybCk7XG5cblx0XHRcdFx0dGhpcy5jaGFuZ2VkKCk7XG5cblx0XHRcdH0uYmluZCh0aGlzKSxcblx0XHRcdGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0dGhpcy5vblN0YXRlQ2hhbmdlUmVxdWVzdGVkKGRhdGEpO1xuXHRcdFx0fS5iaW5kKHRoaXMpKTtcblxuXHRcdH1cblxuXHRcdHByaXZhdGUgb25IYXNoQ2hhbmdlKCk6IHZvaWQge1xuXHRcdFx0bGV0IHMgPSB0aGlzLnN0YXRlRnJvbVVybCh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSkpO1xuXG5cdFx0XHRoby5mbHV4LkRJU1BBVENIRVIuZGlzcGF0Y2goe1xuXHRcdFx0XHR0eXBlOiAnU1RBVEUnLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0c3RhdGU6IHMuc3RhdGUsXG5cdFx0XHRcdFx0YXJnczogcy5hcmdzLFxuXHRcdFx0XHRcdGV4dGVybjogdHJ1ZSxcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBzZXRVcmwodXJsOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRcdGlmKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigxKSA9PT0gdXJsKVxuXHRcdFx0XHRyZXR1cm47XG5cblx0XHRcdGxldCBsID0gd2luZG93Lm9uaGFzaGNoYW5nZTtcblx0XHRcdHdpbmRvdy5vbmhhc2hjaGFuZ2UgPSBudWxsO1xuXHRcdFx0d2luZG93LmxvY2F0aW9uLmhhc2ggPSB1cmw7XG5cdFx0XHR3aW5kb3cub25oYXNoY2hhbmdlID0gbDtcblx0XHR9XG5cblx0XHRwcml2YXRlIHJlZ2V4RnJvbVVybCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0XHR2YXIgcmVnZXggPSAvOihbXFx3XSspLztcblx0XHRcdHdoaWxlKHVybC5tYXRjaChyZWdleCkpIHtcblx0XHRcdFx0dXJsID0gdXJsLnJlcGxhY2UocmVnZXgsIFwiKFteXFwvXSspXCIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHVybCsnJCc7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBhcmdzRnJvbVVybChwYXR0ZXJuOiBzdHJpbmcsIHVybDogc3RyaW5nKTogYW55IHtcblx0XHRcdGxldCByID0gdGhpcy5yZWdleEZyb21VcmwocGF0dGVybik7XG5cdFx0XHRsZXQgbmFtZXMgPSBwYXR0ZXJuLm1hdGNoKHIpLnNsaWNlKDEpO1xuXHRcdFx0bGV0IHZhbHVlcyA9IHVybC5tYXRjaChyKS5zbGljZSgxKTtcblxuXHRcdFx0bGV0IGFyZ3MgPSB7fTtcblx0XHRcdG5hbWVzLmZvckVhY2goZnVuY3Rpb24obmFtZSwgaSkge1xuXHRcdFx0XHRhcmdzW25hbWUuc3Vic3RyKDEpXSA9IHZhbHVlc1tpXTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gYXJncztcblx0XHR9XG5cblx0XHRwcml2YXRlIHN0YXRlRnJvbVVybCh1cmw6IHN0cmluZyk6IElSb3V0ZURhdGEge1xuXHRcdFx0dmFyIHMgPSB2b2lkIDA7XG5cdFx0XHR0aGlzLm1hcHBpbmcuZm9yRWFjaCgoc3RhdGU6IElTdGF0ZSkgPT4ge1xuXHRcdFx0XHRpZihzKVxuXHRcdFx0XHRcdHJldHVybjtcblxuXHRcdFx0XHR2YXIgciA9IHRoaXMucmVnZXhGcm9tVXJsKHN0YXRlLnVybCk7XG5cdFx0XHRcdGlmKHVybC5tYXRjaChyKSkge1xuXHRcdFx0XHRcdHZhciBhcmdzID0gdGhpcy5hcmdzRnJvbVVybChzdGF0ZS51cmwsIHVybCk7XG5cdFx0XHRcdFx0cyA9IHtcblx0XHRcdFx0XHRcdFwic3RhdGVcIjogc3RhdGUubmFtZSxcblx0XHRcdFx0XHRcdFwiYXJnc1wiOiBhcmdzLFxuXHRcdFx0XHRcdFx0XCJleHRlcm5cIjogZmFsc2Vcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYoIXMpXG5cdFx0XHRcdHRocm93IFwiTm8gU3RhdGUgZm91bmQgZm9yIHVybCBcIit1cmw7XG5cblx0XHRcdHJldHVybiBzO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgdXJsRnJvbVN0YXRlKHVybDogc3RyaW5nLCBhcmdzOiBhbnkpOiBzdHJpbmcge1xuXHRcdFx0bGV0IHJlZ2V4ID0gLzooW1xcd10rKS87XG5cdFx0XHR3aGlsZSh1cmwubWF0Y2gocmVnZXgpKSB7XG5cdFx0XHRcdHVybCA9IHVybC5yZXBsYWNlKHJlZ2V4LCBmdW5jdGlvbihtKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFyZ3NbbS5zdWJzdHIoMSldO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB1cmw7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBlcXVhbHMobzE6IGFueSwgbzI6IGFueSkgOiBib29sZWFuIHtcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShvMSkgPT09IEpTT04uc3RyaW5naWZ5KG8yKTtcblx0XHR9XG5cblx0fVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZGlzcGF0Y2hlci50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3JvdXRlci50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3N0b3JlcmVnaXN0cnkudHNcIi8+XG5cbm1vZHVsZSBoby5mbHV4IHtcblx0aW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XG5cblx0ZXhwb3J0IGxldCBESVNQQVRDSEVSOiBEaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcblx0Ly9leHBvcnQgbGV0IFNUT1JFUzoge1trZXk6c3RyaW5nXTpTdG9yZTxhbnk+fSA9IHt9O1xuXHRleHBvcnQgbGV0IFNUT1JFUzogU3RvcmVyZWdpc3RyeSA9IG5ldyBTdG9yZXJlZ2lzdHJ5KCk7XG5cblx0Ly9pZih0eXBlb2YgaG8uZmx1eC5TVE9SRVNbJ1JvdXRlciddID09PSAndW5kZWZpbmVkJylcblx0aWYoaG8uZmx1eC5TVE9SRVMuZ2V0KFJvdXRlcikgPT09IHVuZGVmaW5lZClcblx0XHRuZXcgUm91dGVyKCk7XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIHJ1bigpOiBQcm9taXNlPGFueSwgYW55PiB7XG5cdFx0Ly9yZXR1cm4gKDxSb3V0ZXI+aG8uZmx1eC5TVE9SRVNbJ1JvdXRlciddKS5pbml0KCk7XG5cdFx0cmV0dXJuIFNUT1JFUy5nZXQoUm91dGVyKS5pbml0KCk7XG5cdH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==