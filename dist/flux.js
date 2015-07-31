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
            var StoreProvider = (function () {
                function StoreProvider() {
                    this.useMin = false;
                }
                StoreProvider.prototype.resolve = function (name) {
                    return this.useMin ?
                        "stores/" + name + ".min.js" :
                        "stores/" + name + ".js";
                };
                StoreProvider.prototype.getStore = function (name) {
                    var _this = this;
                    if (window[name] !== undefined && window[name].prototype instanceof flux.Store)
                        return Promise.create(window[name]);
                    return new Promise(function (resolve, reject) {
                        var src = _this.resolve(name);
                        var script = document.createElement('script');
                        script.onload = function () {
                            if (typeof window[name] === 'function')
                                resolve(window[name]);
                            else
                                reject("Error while loading Attribute " + name);
                        };
                        script.src = src;
                        document.getElementsByTagName('head')[0].appendChild(script);
                    });
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
            };
            Storeregistry.prototype.get = function (storeClass) {
                var name = storeClass.toString().match(/\w+/g)[1];
                return this.stores[name];
            };
            Storeregistry.prototype.loadStore = function (name) {
                if (flux.STORES[name] !== undefined && flux.STORES[name] instanceof flux.Store)
                    return Promise.create(flux.STORES[name]);
                else {
                    return new Promise(function (resolve, reject) {
                        flux.storeprovider.instance.getStore(name)
                            .then(function (s) { resolve(s); })
                            .catch(function (e) { reject(e); });
                    });
                }
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
                this.init();
            }
            Object.defineProperty(Store.prototype, "name", {
                get: function () {
                    return this.constructor.toString().match(/\w+/g)[1];
                },
                enumerable: true,
                configurable: true
            });
            Store.prototype.init = function () { };
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
                        script.onerror = reject;
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
        var Router = (function (_super) {
            __extends(Router, _super);
            function Router() {
                _super.call(this);
                this.mapping = null;
                this.args = null;
                this.on('STATE', this.onStateChangeRequested.bind(this));
            }
            Router.prototype.init = function () {
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
                var _this = this;
                return flux.stateprovider.instance.getStates()
                    .then(function (istates) {
                    _this.mapping = istates.states;
                });
            };
            Router.prototype.getStateFromName = function (name) {
                return this.mapping.filter(function (s) {
                    return s.name === name;
                })[0];
            };
            Router.prototype.onStateChangeRequested = function (data) {
                //current state and args equals requested state and args -> return
                if (this.state && this.state.name === data.state && this.equals(this.args, data.args))
                    return;
                //get requested state
                var state = this.getStateFromName(data.state);
                //requested state has an redirect property -> call redirect state
                if (!!state.redirect) {
                    state = this.getStateFromName(state.redirect);
                }
                //TODO handler promises & actions
                //does the state change request comes from extern e.g. url change in browser window ?
                var extern = !!data.extern;
                //------- set current state & arguments
                this.state = state;
                this.args = data.args;
                this.data = {
                    state: state,
                    args: data.args,
                    extern: extern
                };
                //------- set url for browser
                var url = this.urlFromState(state.url, data.args);
                this.setUrl(url);
                this.changed();
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
            /*
            private handle = {
                'STATE': function(data) {
                    this.states[data.state](data.args, data.extern);
                }
            }
            */
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbGxiYWNraG9sZGVyLnRzIiwiZGlzcGF0Y2hlci50cyIsInN0b3JlcHJvdmlkZXIudHMiLCJzdG9yZXJlZ2lzdHJ5LnRzIiwic3RvcmUudHMiLCJzdGF0ZS50cyIsInN0YXRlcHJvdmlkZXIudHMiLCJyb3V0ZXIudHMiLCJmbHV4LnRzIl0sIm5hbWVzIjpbImhvIiwiaG8uZmx1eCIsImhvLmZsdXguQ2FsbGJhY2tIb2xkZXIiLCJoby5mbHV4LkNhbGxiYWNrSG9sZGVyLmNvbnN0cnVjdG9yIiwiaG8uZmx1eC5DYWxsYmFja0hvbGRlci5yZWdpc3RlciIsImhvLmZsdXguQ2FsbGJhY2tIb2xkZXIudW5yZWdpc3RlciIsImhvLmZsdXguRGlzcGF0Y2hlciIsImhvLmZsdXguRGlzcGF0Y2hlci5jb25zdHJ1Y3RvciIsImhvLmZsdXguRGlzcGF0Y2hlci53YWl0Rm9yIiwiaG8uZmx1eC5EaXNwYXRjaGVyLmRpc3BhdGNoIiwiaG8uZmx1eC5EaXNwYXRjaGVyLmludm9rZUNhbGxiYWNrIiwiaG8uZmx1eC5EaXNwYXRjaGVyLnN0YXJ0RGlzcGF0Y2hpbmciLCJoby5mbHV4LkRpc3BhdGNoZXIuc3RvcERpc3BhdGNoaW5nIiwiaG8uZmx1eC5zdG9yZXByb3ZpZGVyIiwiaG8uZmx1eC5zdG9yZXByb3ZpZGVyLlN0b3JlUHJvdmlkZXIiLCJoby5mbHV4LnN0b3JlcHJvdmlkZXIuU3RvcmVQcm92aWRlci5jb25zdHJ1Y3RvciIsImhvLmZsdXguc3RvcmVwcm92aWRlci5TdG9yZVByb3ZpZGVyLnJlc29sdmUiLCJoby5mbHV4LnN0b3JlcHJvdmlkZXIuU3RvcmVQcm92aWRlci5nZXRTdG9yZSIsImhvLmZsdXguU3RvcmVyZWdpc3RyeSIsImhvLmZsdXguU3RvcmVyZWdpc3RyeS5jb25zdHJ1Y3RvciIsImhvLmZsdXguU3RvcmVyZWdpc3RyeS5yZWdpc3RlciIsImhvLmZsdXguU3RvcmVyZWdpc3RyeS5nZXQiLCJoby5mbHV4LlN0b3JlcmVnaXN0cnkubG9hZFN0b3JlIiwiaG8uZmx1eC5TdG9yZSIsImhvLmZsdXguU3RvcmUuY29uc3RydWN0b3IiLCJoby5mbHV4LlN0b3JlLm5hbWUiLCJoby5mbHV4LlN0b3JlLmluaXQiLCJoby5mbHV4LlN0b3JlLnJlZ2lzdGVyIiwiaG8uZmx1eC5TdG9yZS5vbiIsImhvLmZsdXguU3RvcmUuaGFuZGxlIiwiaG8uZmx1eC5TdG9yZS5jaGFuZ2VkIiwiaG8uZmx1eC5zdGF0ZXByb3ZpZGVyIiwiaG8uZmx1eC5zdGF0ZXByb3ZpZGVyLlN0YXRlUHJvdmlkZXIiLCJoby5mbHV4LnN0YXRlcHJvdmlkZXIuU3RhdGVQcm92aWRlci5jb25zdHJ1Y3RvciIsImhvLmZsdXguc3RhdGVwcm92aWRlci5TdGF0ZVByb3ZpZGVyLnJlc29sdmUiLCJoby5mbHV4LnN0YXRlcHJvdmlkZXIuU3RhdGVQcm92aWRlci5nZXRTdGF0ZXMiLCJoby5mbHV4LlJvdXRlciIsImhvLmZsdXguUm91dGVyLmNvbnN0cnVjdG9yIiwiaG8uZmx1eC5Sb3V0ZXIuaW5pdCIsImhvLmZsdXguUm91dGVyLmdvIiwiaG8uZmx1eC5Sb3V0ZXIuaW5pdFN0YXRlcyIsImhvLmZsdXguUm91dGVyLmdldFN0YXRlRnJvbU5hbWUiLCJoby5mbHV4LlJvdXRlci5vblN0YXRlQ2hhbmdlUmVxdWVzdGVkIiwiaG8uZmx1eC5Sb3V0ZXIub25IYXNoQ2hhbmdlIiwiaG8uZmx1eC5Sb3V0ZXIuc2V0VXJsIiwiaG8uZmx1eC5Sb3V0ZXIucmVnZXhGcm9tVXJsIiwiaG8uZmx1eC5Sb3V0ZXIuYXJnc0Zyb21VcmwiLCJoby5mbHV4LlJvdXRlci5zdGF0ZUZyb21VcmwiLCJoby5mbHV4LlJvdXRlci51cmxGcm9tU3RhdGUiLCJoby5mbHV4LlJvdXRlci5lcXVhbHMiLCJoby5mbHV4LnJ1biJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBTyxFQUFFLENBb0JSO0FBcEJELFdBQU8sRUFBRTtJQUFDQSxJQUFBQSxJQUFJQSxDQW9CYkE7SUFwQlNBLFdBQUFBLElBQUlBLEVBQUNBLENBQUNBO1FBRWZDO1lB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dUNBQXVDO0FBQ3ZDLG1DQUFtQztBQUNuQywwQ0FBMEM7QUFFMUMsSUFBTyxFQUFFLENBZVI7QUFmRCxXQUFPLEVBQUU7SUFBQ0EsSUFBQUEsSUFBSUEsQ0FlYkE7SUFmU0EsV0FBQUEsSUFBSUEsRUFBQ0EsQ0FBQ0E7UUFHSkMsZUFBVUEsR0FBZUEsSUFBSUEsZUFBVUEsRUFBRUEsQ0FBQ0E7UUFDckRBLEFBQ0FBLG9EQURvREE7UUFDekNBLFdBQU1BLEdBQWtCQSxJQUFJQSxrQkFBYUEsRUFBRUEsQ0FBQ0E7UUFFdkRBLEFBQ0FBLHFEQURxREE7UUFDckRBLEVBQUVBLENBQUFBLENBQUNBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLFdBQU1BLENBQUNBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzNDQSxJQUFJQSxXQUFNQSxFQUFFQSxDQUFDQTtRQUVkQTtZQUNDaUQsQUFDQUEsbURBRG1EQTtZQUNuREEsTUFBTUEsQ0FBQ0EsV0FBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsV0FBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDbENBLENBQUNBO1FBSGVqRCxRQUFHQSxNQUdsQkEsQ0FBQUE7SUFDRkEsQ0FBQ0EsRUFmU0QsSUFBSUEsR0FBSkEsT0FBSUEsS0FBSkEsT0FBSUEsUUFlYkE7QUFBREEsQ0FBQ0EsRUFmTSxFQUFFLEtBQUYsRUFBRSxRQWVSIiwiZmlsZSI6ImZsdXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUgaG8uZmx1eCB7XG5cblx0ZXhwb3J0IGNsYXNzIENhbGxiYWNrSG9sZGVyIHtcblxuXHRcdHByb3RlY3RlZCBwcmVmaXg6IHN0cmluZyA9ICdJRF8nO1xuICAgIFx0cHJvdGVjdGVkIGxhc3RJRDogbnVtYmVyID0gMTtcblx0XHRwcm90ZWN0ZWQgY2FsbGJhY2tzOiB7W2tleTpzdHJpbmddOkZ1bmN0aW9ufSA9IHt9O1xuXG5cdFx0cHVibGljIHJlZ2lzdGVyKGNhbGxiYWNrOiBGdW5jdGlvbiwgc2VsZj86IGFueSk6IHN0cmluZyB7XG4gICAgXHRcdGxldCBpZCA9IHRoaXMucHJlZml4ICsgdGhpcy5sYXN0SUQrKztcbiAgICBcdFx0dGhpcy5jYWxsYmFja3NbaWRdID0gc2VsZiA/IGNhbGxiYWNrLmJpbmQoc2VsZikgOiBjYWxsYmFjaztcbiAgICBcdFx0cmV0dXJuIGlkO1xuICBcdFx0fVxuXG4gIFx0XHRwdWJsaWMgdW5yZWdpc3RlcihpZCkge1xuICAgICAgXHRcdGlmKCF0aGlzLmNhbGxiYWNrc1tpZF0pXG5cdFx0XHRcdHRocm93ICdDb3VsZCBub3QgdW5yZWdpc3RlciBjYWxsYmFjayBmb3IgaWQgJyArIGlkO1xuICAgIFx0XHRkZWxldGUgdGhpcy5jYWxsYmFja3NbaWRdO1xuICBcdFx0fTtcblx0fVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vY2FsbGJhY2tob2xkZXIudHNcIi8+XG5cbm1vZHVsZSBoby5mbHV4IHtcblxuXHRleHBvcnQgaW50ZXJmYWNlIElBY3Rpb24ge1xuXHQgICAgdHlwZTpzdHJpbmc7XG5cdFx0ZGF0YT86YW55O1xuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBDYWxsYmFja0hvbGRlciB7XG5cbiAgICBcdHByaXZhdGUgaXNQZW5kaW5nOiB7W2tleTpzdHJpbmddOmJvb2xlYW59ID0ge307XG4gICAgXHRwcml2YXRlIGlzSGFuZGxlZDoge1trZXk6c3RyaW5nXTpib29sZWFufSA9IHt9O1xuICAgIFx0cHJpdmF0ZSBpc0Rpc3BhdGNoaW5nOiBib29sZWFuID0gZmFsc2U7XG4gICAgXHRwcml2YXRlIHBlbmRpbmdQYXlsb2FkOiBJQWN0aW9uID0gbnVsbDtcblxuXHRcdHB1YmxpYyB3YWl0Rm9yKC4uLmlkczogQXJyYXk8bnVtYmVyPik6IHZvaWQge1xuXHRcdFx0aWYoIXRoaXMuaXNEaXNwYXRjaGluZylcblx0XHQgIFx0XHR0aHJvdyAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IE11c3QgYmUgaW52b2tlZCB3aGlsZSBkaXNwYXRjaGluZy4nO1xuXG5cdFx0XHRmb3IgKGxldCBpaSA9IDA7IGlpIDwgaWRzLmxlbmd0aDsgaWkrKykge1xuXHRcdFx0ICBsZXQgaWQgPSBpZHNbaWldO1xuXG5cdFx0XHQgIGlmICh0aGlzLmlzUGVuZGluZ1tpZF0pIHtcblx0XHQgICAgICBcdGlmKCF0aGlzLmlzSGFuZGxlZFtpZF0pXG5cdFx0XHQgICAgICBcdHRocm93IGB3YWl0Rm9yKC4uLik6IENpcmN1bGFyIGRlcGVuZGVuY3kgZGV0ZWN0ZWQgd2hpbGUgd2F0aW5nIGZvciAke2lkfWA7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0ICB9XG5cblx0XHRcdCAgaWYoIXRoaXMuY2FsbGJhY2tzW2lkXSlcblx0XHRcdCAgXHR0aHJvdyBgd2FpdEZvciguLi4pOiAke2lkfSBkb2VzIG5vdCBtYXAgdG8gYSByZWdpc3RlcmVkIGNhbGxiYWNrLmA7XG5cblx0XHRcdCAgdGhpcy5pbnZva2VDYWxsYmFjayhpZCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHB1YmxpYyBkaXNwYXRjaChhY3Rpb246IElBY3Rpb24pIHtcblx0XHRcdGlmKHRoaXMuaXNEaXNwYXRjaGluZylcblx0XHQgICAgXHR0aHJvdyAnQ2Fubm90IGRpc3BhdGNoIGluIHRoZSBtaWRkbGUgb2YgYSBkaXNwYXRjaC4nO1xuXG5cdFx0XHR0aGlzLnN0YXJ0RGlzcGF0Y2hpbmcoYWN0aW9uKTtcblxuXHRcdCAgICB0cnkge1xuXHRcdCAgICAgIGZvciAobGV0IGlkIGluIHRoaXMuY2FsbGJhY2tzKSB7XG5cdFx0ICAgICAgICBpZiAodGhpcy5pc1BlbmRpbmdbaWRdKSB7XG5cdFx0ICAgICAgICAgIGNvbnRpbnVlO1xuXHRcdCAgICAgICAgfVxuXHRcdCAgICAgICAgdGhpcy5pbnZva2VDYWxsYmFjayhpZCk7XG5cdFx0ICAgICAgfVxuXHRcdCAgICB9IGZpbmFsbHkge1xuXHRcdCAgICAgIHRoaXMuc3RvcERpc3BhdGNoaW5nKCk7XG5cdFx0ICAgIH1cblx0XHR9O1xuXG5cdCAgXHRwcml2YXRlIGludm9rZUNhbGxiYWNrKGlkOiBudW1iZXIpOiB2b2lkIHtcblx0ICAgIFx0dGhpcy5pc1BlbmRpbmdbaWRdID0gdHJ1ZTtcblx0ICAgIFx0dGhpcy5jYWxsYmFja3NbaWRdKHRoaXMucGVuZGluZ1BheWxvYWQpO1xuXHQgICAgXHR0aGlzLmlzSGFuZGxlZFtpZF0gPSB0cnVlO1xuXHQgIFx0fVxuXG5cdCAgXHRwcml2YXRlIHN0YXJ0RGlzcGF0Y2hpbmcocGF5bG9hZDogSUFjdGlvbik6IHZvaWQge1xuXHQgICAgXHRmb3IgKGxldCBpZCBpbiB0aGlzLmNhbGxiYWNrcykge1xuXHQgICAgICBcdFx0dGhpcy5pc1BlbmRpbmdbaWRdID0gZmFsc2U7XG5cdCAgICAgIFx0XHR0aGlzLmlzSGFuZGxlZFtpZF0gPSBmYWxzZTtcblx0ICAgIFx0fVxuXHQgICAgXHR0aGlzLnBlbmRpbmdQYXlsb2FkID0gcGF5bG9hZDtcblx0ICAgIFx0dGhpcy5pc0Rpc3BhdGNoaW5nID0gdHJ1ZTtcbiAgXHRcdH1cblxuXHQgIFx0cHJpdmF0ZSBzdG9wRGlzcGF0Y2hpbmcoKTogdm9pZCB7XG5cdCAgICBcdHRoaXMucGVuZGluZ1BheWxvYWQgPSBudWxsO1xuXHQgICAgXHR0aGlzLmlzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcblx0ICBcdH1cblx0fVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8tcHJvbWlzZS9kaXN0L2QudHMvcHJvbWlzZS5kLnRzXCIvPlxuXG5tb2R1bGUgaG8uZmx1eC5zdG9yZXByb3ZpZGVyIHtcblx0aW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIElTdG9yZVByb3ZpZGVyIHtcbiAgICAgICAgdXNlTWluOmJvb2xlYW47XG5cdFx0cmVzb2x2ZShuYW1lOnN0cmluZyk6IHN0cmluZztcblx0XHRnZXRTdG9yZShuYW1lOnN0cmluZyk6IFByb21pc2U8dHlwZW9mIFN0b3JlLCBzdHJpbmc+O1xuICAgIH1cblxuXHRjbGFzcyBTdG9yZVByb3ZpZGVyIGltcGxlbWVudHMgSVN0b3JlUHJvdmlkZXIge1xuXG4gICAgICAgIHVzZU1pbjogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgICAgIHJlc29sdmUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVzZU1pbiA/XG4gICAgICAgICAgICAgICAgYHN0b3Jlcy8ke25hbWV9Lm1pbi5qc2AgOlxuICAgICAgICAgICAgICAgIGBzdG9yZXMvJHtuYW1lfS5qc2A7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRTdG9yZShuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHR5cGVvZiBTdG9yZSwgc3RyaW5nPiB7XG4gICAgICAgICAgICBpZih3aW5kb3dbbmFtZV0gIT09IHVuZGVmaW5lZCAmJiB3aW5kb3dbbmFtZV0ucHJvdG90eXBlIGluc3RhbmNlb2YgU3RvcmUpXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLmNyZWF0ZSh3aW5kb3dbbmFtZV0pO1xuXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2U8dHlwZW9mIFN0b3JlLCBhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgc3JjID0gdGhpcy5yZXNvbHZlKG5hbWUpO1xuICAgICAgICAgICAgICAgIGxldCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgICAgICAgICBzY3JpcHQub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiB3aW5kb3dbbmFtZV0gPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHdpbmRvd1tuYW1lXSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChgRXJyb3Igd2hpbGUgbG9hZGluZyBBdHRyaWJ1dGUgJHtuYW1lfWApXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzY3JpcHQuc3JjID0gc3JjO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGV4cG9ydCBsZXQgaW5zdGFuY2U6IElTdG9yZVByb3ZpZGVyID0gbmV3IFN0b3JlUHJvdmlkZXIoKTtcbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9ib3dlcl9jb21wb25lbnRzL2hvLXByb21pc2UvZGlzdC9kLnRzL3Byb21pc2UuZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3N0b3JlcHJvdmlkZXIudHNcIi8+XG5cbm1vZHVsZSBoby5mbHV4IHtcblx0aW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XG5cblx0ZXhwb3J0IGNsYXNzIFN0b3JlcmVnaXN0cnkge1xuXG5cdFx0cHJpdmF0ZSBzdG9yZXM6IHtba2V5OiBzdHJpbmddOiBTdG9yZTxhbnk+fSA9IHt9O1xuXG5cdFx0cHVibGljIHJlZ2lzdGVyKHN0b3JlOiBTdG9yZTxhbnk+KTogdm9pZCB7XG5cdFx0XHR0aGlzLnN0b3Jlc1tzdG9yZS5uYW1lXSA9IHN0b3JlO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBnZXQ8VCBleHRlbmRzIFN0b3JlPGFueT4+KHN0b3JlQ2xhc3M6IHtuZXcoKTpUfSk6IFQge1xuXHRcdFx0bGV0IG5hbWUgPSBzdG9yZUNsYXNzLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG5cdFx0XHRyZXR1cm4gPFQ+dGhpcy5zdG9yZXNbbmFtZV07XG5cdFx0fVxuXG5cdFx0cHVibGljIGxvYWRTdG9yZShuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHR5cGVvZiBTdG9yZSwgc3RyaW5nPiB7XG5cdFx0XHRpZihTVE9SRVNbbmFtZV0gIT09IHVuZGVmaW5lZCAmJiBTVE9SRVNbbmFtZV0gaW5zdGFuY2VvZiBTdG9yZSlcblx0XHRcdFx0cmV0dXJuIFByb21pc2UuY3JlYXRlKFNUT1JFU1tuYW1lXSk7XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdFx0XHRzdG9yZXByb3ZpZGVyLmluc3RhbmNlLmdldFN0b3JlKG5hbWUpXG5cdFx0XHRcdFx0LnRoZW4oKHMpPT57cmVzb2x2ZShzKTt9KVxuXHRcdFx0XHRcdC5jYXRjaCgoZSk9PntyZWplY3QoZSk7fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0fVxuXHR9XG5cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2NhbGxiYWNraG9sZGVyLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vc3RvcmVyZWdpc3RyeS50c1wiLz5cblxubW9kdWxlIGhvLmZsdXgge1xuXG5cdGV4cG9ydCBjbGFzcyBTdG9yZTxUPiBleHRlbmRzIENhbGxiYWNrSG9sZGVyIHtcblxuXHRcdHByb3RlY3RlZCBkYXRhOiBUO1xuXHRcdHByaXZhdGUgaWQ6IHN0cmluZztcblx0XHRwcml2YXRlIGhhbmRsZXJzOiB7W2tleTogc3RyaW5nXTogRnVuY3Rpb259ID0ge307XG5cblxuXHRcdGNvbnN0cnVjdG9yKCkge1xuXHRcdFx0c3VwZXIoKTtcblx0XHRcdHRoaXMuaWQgPSBoby5mbHV4LkRJU1BBVENIRVIucmVnaXN0ZXIodGhpcy5oYW5kbGUuYmluZCh0aGlzKSk7XG5cdFx0XHQvL2hvLmZsdXguU1RPUkVTW3RoaXMubmFtZV0gPSB0aGlzO1xuXHRcdFx0aG8uZmx1eC5TVE9SRVMucmVnaXN0ZXIodGhpcyk7XG5cdFx0XHR0aGlzLmluaXQoKTtcblx0XHR9XG5cblx0XHQgZ2V0IG5hbWUoKTogc3RyaW5nIHtcblx0XHRcdHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG5cdFx0fVxuXG5cdFx0cHJvdGVjdGVkIGluaXQoKTogdm9pZCB7fVxuXG5cdFx0cHVibGljIHJlZ2lzdGVyKGNhbGxiYWNrOiAoZGF0YTpUKT0+dm9pZCwgc2VsZj86YW55KTogc3RyaW5nIHtcblx0XHRcdHJldHVybiBzdXBlci5yZWdpc3RlcihjYWxsYmFjaywgc2VsZik7XG5cdFx0fVxuXG5cdFx0cHJvdGVjdGVkIG9uKHR5cGU6IHN0cmluZywgZnVuYzogRnVuY3Rpb24pOiB2b2lkIHtcblx0XHRcdHRoaXMuaGFuZGxlcnNbdHlwZV0gPSBmdW5jO1xuXHRcdH1cblxuXHRcdHByb3RlY3RlZCBoYW5kbGUoYWN0aW9uOiBJQWN0aW9uKTogdm9pZCB7XG5cdFx0XHRpZih0eXBlb2YgdGhpcy5oYW5kbGVyc1thY3Rpb24udHlwZV0gPT09ICdmdW5jdGlvbicpXG5cdFx0XHRcdHRoaXMuaGFuZGxlcnNbYWN0aW9uLnR5cGVdKGFjdGlvbi5kYXRhKTtcblx0XHR9O1xuXG5cblx0XHRwcm90ZWN0ZWQgY2hhbmdlZCgpOiB2b2lkIHtcblx0XHRcdGZvciAobGV0IGlkIGluIHRoaXMuY2FsbGJhY2tzKSB7XG5cdFx0XHQgIGxldCBjYiA9IHRoaXMuY2FsbGJhY2tzW2lkXTtcblx0XHRcdCAgaWYoY2IpXG5cdFx0XHQgIFx0Y2IodGhpcy5kYXRhKTtcblx0XHRcdH1cblx0XHR9XG5cblxuXHR9O1xuXG5cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9ib3dlcl9jb21wb25lbnRzL2hvLXByb21pc2UvZGlzdC9kLnRzL3Byb21pc2UuZC50c1wiLz5cblxubW9kdWxlIGhvLmZsdXgge1xuXHRpbXBvcnQgUHJvbWlzZSA9IGhvLnByb21pc2UuUHJvbWlzZTtcblxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVN0YXRlIHtcblx0XHRuYW1lOiBzdHJpbmc7XG5cdFx0dXJsOiBzdHJpbmc7XG5cdFx0cmVkaXJlY3Q/OiBzdHJpbmc7XG5cdFx0YmVmb3JlPzogKCk9PlByb21pc2U8YW55LCBhbnk+O1xuXHRcdHZpZXc/OiBBcnJheTxJVmlld1N0YXRlPjtcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVZpZXdTdGF0ZSB7XG5cdCAgICBuYW1lOiBzdHJpbmc7XG5cdFx0aHRtbDogc3RyaW5nO1xuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJU3RhdGVzIHtcblx0ICAgIHN0YXRlczogQXJyYXk8SVN0YXRlPjtcblx0fVxuXG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vYm93ZXJfY29tcG9uZW50cy9oby1wcm9taXNlL2Rpc3QvZC50cy9wcm9taXNlLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9zdGF0ZS50c1wiLz5cblxubW9kdWxlIGhvLmZsdXguc3RhdGVwcm92aWRlciB7XG5cdGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xuXG4gICAgZXhwb3J0IGludGVyZmFjZSBJU3RhdGVQcm92aWRlciB7XG4gICAgICAgIHVzZU1pbjpib29sZWFuO1xuXHRcdHJlc29sdmUoKTogc3RyaW5nO1xuXHRcdGdldFN0YXRlcyhuYW1lPzpzdHJpbmcpOiBQcm9taXNlPElTdGF0ZXMsIHN0cmluZz47XG4gICAgfVxuXG5cdGNsYXNzIFN0YXRlUHJvdmlkZXIgaW1wbGVtZW50cyBJU3RhdGVQcm92aWRlciB7XG5cbiAgICAgICAgdXNlTWluOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAgICAgcmVzb2x2ZSgpOiBzdHJpbmcge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudXNlTWluID9cbiAgICAgICAgICAgICAgICBgc3RhdGVzLm1pbi5qc2AgOlxuICAgICAgICAgICAgICAgIGBzdGF0ZXMuanNgO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0U3RhdGVzKG5hbWUgPSBcIlN0YXRlc1wiKTogUHJvbWlzZTxJU3RhdGVzLCBzdHJpbmc+IHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZTxJU3RhdGVzLCBhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgc3JjID0gdGhpcy5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgbGV0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgICAgIHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgd2luZG93W25hbWVdKTtcbiAgICAgICAgICAgICAgICB9O1xuXHRcdFx0XHRzY3JpcHQub25lcnJvciA9IHJlamVjdDtcbiAgICAgICAgICAgICAgICBzY3JpcHQuc3JjID0gc3JjO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGV4cG9ydCBsZXQgaW5zdGFuY2U6IElTdGF0ZVByb3ZpZGVyID0gbmV3IFN0YXRlUHJvdmlkZXIoKTtcbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3N0b3JlXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZGlzcGF0Y2hlci50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3N0YXRlLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vc3RhdGVwcm92aWRlci50c1wiLz5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8tcHJvbWlzZS9kaXN0L2QudHMvcHJvbWlzZS5kLnRzXCIvPlxuXG5cbm1vZHVsZSBoby5mbHV4IHtcblxuXHRpbXBvcnQgUHJvbWlzZSA9IGhvLnByb21pc2UuUHJvbWlzZTtcblxuXG5cdC8qKiBEYXRhIHRoYXQgYSBSb3V0ZXIjZ28gdGFrZXMgKi9cblx0ZXhwb3J0IGludGVyZmFjZSBJUm91dGVEYXRhIHtcblx0ICAgIHN0YXRlOiBzdHJpbmc7XG5cdFx0YXJnczogYW55O1xuXHRcdGV4dGVybjogYm9vbGVhbjtcblx0fVxuXG5cdC8qKiBEYXRhIHRoYXQgUm91dGVyI2NoYW5nZXMgZW1pdCB0byBpdHMgbGlzdGVuZXJzICovXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVJvdXRlckRhdGEge1xuXHQgICAgc3RhdGU6IElTdGF0ZTtcblx0XHRhcmdzOiBhbnk7XG5cdFx0ZXh0ZXJuOiBib29sZWFuO1xuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFJvdXRlciBleHRlbmRzIFN0b3JlPElSb3V0ZXJEYXRhPiB7XG5cblx0XHRwcml2YXRlIG1hcHBpbmc6QXJyYXk8SVN0YXRlPiA9IG51bGw7XG5cdFx0cHJpdmF0ZSBzdGF0ZTpJU3RhdGU7XG5cdFx0cHJpdmF0ZSBhcmdzOmFueSA9IG51bGw7XG5cblx0XHRjb25zdHJ1Y3RvcigpIHtcblx0XHRcdHN1cGVyKCk7XG5cdFx0XHR0aGlzLm9uKCdTVEFURScsIHRoaXMub25TdGF0ZUNoYW5nZVJlcXVlc3RlZC5iaW5kKHRoaXMpKTtcblxuXHRcdH1cblxuXHRcdHB1YmxpYyBpbml0KCk6IFByb21pc2U8YW55LCBhbnk+IHtcblx0XHRcdGxldCBvbkhhc2hDaGFuZ2UgPSB0aGlzLm9uSGFzaENoYW5nZS5iaW5kKHRoaXMpO1xuXHRcdFx0cmV0dXJuIHRoaXMuaW5pdFN0YXRlcygpXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdHdpbmRvdy5vbmhhc2hjaGFuZ2UgPSBvbkhhc2hDaGFuZ2U7XG5cdFx0XHRcdG9uSGFzaENoYW5nZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cblx0XHRwdWJsaWMgZ28oZGF0YTogSVJvdXRlRGF0YSk6IHZvaWQge1xuXHRcdFx0aG8uZmx1eC5ESVNQQVRDSEVSLmRpc3BhdGNoKHtcblx0XHRcdFx0dHlwZTogJ1NUQVRFJyxcblx0XHRcdFx0ZGF0YTogZGF0YVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBpbml0U3RhdGVzKCk6IFByb21pc2U8YW55LCBhbnk+IHtcblx0XHRcdHJldHVybiBzdGF0ZXByb3ZpZGVyLmluc3RhbmNlLmdldFN0YXRlcygpXG5cdFx0XHQudGhlbigoaXN0YXRlcykgPT4ge1xuXHRcdFx0XHR0aGlzLm1hcHBpbmcgPSBpc3RhdGVzLnN0YXRlcztcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgZ2V0U3RhdGVGcm9tTmFtZShuYW1lOiBzdHJpbmcpOiBJU3RhdGUge1xuXHRcdFx0cmV0dXJuIHRoaXMubWFwcGluZy5maWx0ZXIoKHMpPT57XG5cdFx0XHRcdHJldHVybiBzLm5hbWUgPT09IG5hbWVcblx0XHRcdH0pWzBdO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgb25TdGF0ZUNoYW5nZVJlcXVlc3RlZChkYXRhOiBJUm91dGVEYXRhKTogdm9pZCB7XG5cdFx0XHQvL2N1cnJlbnQgc3RhdGUgYW5kIGFyZ3MgZXF1YWxzIHJlcXVlc3RlZCBzdGF0ZSBhbmQgYXJncyAtPiByZXR1cm5cblx0XHRcdGlmKHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5uYW1lID09PSBkYXRhLnN0YXRlICYmIHRoaXMuZXF1YWxzKHRoaXMuYXJncywgZGF0YS5hcmdzKSlcblx0XHRcdFx0cmV0dXJuO1xuXG5cdFx0XHQvL2dldCByZXF1ZXN0ZWQgc3RhdGVcblx0XHRcdGxldCBzdGF0ZSA9IHRoaXMuZ2V0U3RhdGVGcm9tTmFtZShkYXRhLnN0YXRlKTtcblxuXG5cdFx0XHQvL3JlcXVlc3RlZCBzdGF0ZSBoYXMgYW4gcmVkaXJlY3QgcHJvcGVydHkgLT4gY2FsbCByZWRpcmVjdCBzdGF0ZVxuXHRcdFx0aWYoISFzdGF0ZS5yZWRpcmVjdCkge1xuXHRcdFx0XHRzdGF0ZSA9IHRoaXMuZ2V0U3RhdGVGcm9tTmFtZShzdGF0ZS5yZWRpcmVjdCk7XG5cdFx0XHR9XG5cblxuXHRcdFx0Ly9UT0RPIGhhbmRsZXIgcHJvbWlzZXMgJiBhY3Rpb25zXG5cblxuXHRcdFx0Ly9kb2VzIHRoZSBzdGF0ZSBjaGFuZ2UgcmVxdWVzdCBjb21lcyBmcm9tIGV4dGVybiBlLmcuIHVybCBjaGFuZ2UgaW4gYnJvd3NlciB3aW5kb3cgP1xuXHRcdFx0bGV0IGV4dGVybiA9ICEhIGRhdGEuZXh0ZXJuO1xuXG5cdFx0XHQvLy0tLS0tLS0gc2V0IGN1cnJlbnQgc3RhdGUgJiBhcmd1bWVudHNcblx0XHRcdHRoaXMuc3RhdGUgPSBzdGF0ZTtcblx0XHRcdHRoaXMuYXJncyA9IGRhdGEuYXJncztcblxuXHRcdFx0dGhpcy5kYXRhID0ge1xuXHRcdFx0XHRzdGF0ZTogc3RhdGUsXG5cdFx0XHRcdGFyZ3M6IGRhdGEuYXJncyxcblx0XHRcdFx0ZXh0ZXJuOiBleHRlcm4sXG5cdFx0XHR9O1xuXG5cdFx0XHQvLy0tLS0tLS0gc2V0IHVybCBmb3IgYnJvd3NlclxuXHRcdFx0dmFyIHVybCA9IHRoaXMudXJsRnJvbVN0YXRlKHN0YXRlLnVybCwgZGF0YS5hcmdzKTtcblx0XHRcdHRoaXMuc2V0VXJsKHVybCk7XG5cblx0XHRcdHRoaXMuY2hhbmdlZCgpO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgb25IYXNoQ2hhbmdlKCk6IHZvaWQge1xuXHRcdFx0bGV0IHMgPSB0aGlzLnN0YXRlRnJvbVVybCh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSkpO1xuXG5cdFx0XHRoby5mbHV4LkRJU1BBVENIRVIuZGlzcGF0Y2goe1xuXHRcdFx0XHR0eXBlOiAnU1RBVEUnLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0c3RhdGU6IHMuc3RhdGUsXG5cdFx0XHRcdFx0YXJnczogcy5hcmdzLFxuXHRcdFx0XHRcdGV4dGVybjogdHJ1ZSxcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Lypcblx0XHRwcml2YXRlIGhhbmRsZSA9IHtcblx0XHRcdCdTVEFURSc6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0dGhpcy5zdGF0ZXNbZGF0YS5zdGF0ZV0oZGF0YS5hcmdzLCBkYXRhLmV4dGVybik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCovXG5cblx0XHRwcml2YXRlIHNldFVybCh1cmw6IHN0cmluZyk6IHZvaWQge1xuXHRcdFx0aWYod2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyKDEpID09PSB1cmwpXG5cdFx0XHRcdHJldHVybjtcblxuXHRcdFx0bGV0IGwgPSB3aW5kb3cub25oYXNoY2hhbmdlO1xuXHRcdFx0d2luZG93Lm9uaGFzaGNoYW5nZSA9IG51bGw7XG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IHVybDtcblx0XHRcdHdpbmRvdy5vbmhhc2hjaGFuZ2UgPSBsO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgcmVnZXhGcm9tVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRcdHZhciByZWdleCA9IC86KFtcXHddKykvO1xuXHRcdFx0d2hpbGUodXJsLm1hdGNoKHJlZ2V4KSkge1xuXHRcdFx0XHR1cmwgPSB1cmwucmVwbGFjZShyZWdleCwgXCIoW15cXC9dKylcIik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdXJsKyckJztcblx0XHR9XG5cblx0XHRwcml2YXRlIGFyZ3NGcm9tVXJsKHBhdHRlcm46IHN0cmluZywgdXJsOiBzdHJpbmcpOiBhbnkge1xuXHRcdFx0bGV0IHIgPSB0aGlzLnJlZ2V4RnJvbVVybChwYXR0ZXJuKTtcblx0XHRcdGxldCBuYW1lcyA9IHBhdHRlcm4ubWF0Y2gocikuc2xpY2UoMSk7XG5cdFx0XHRsZXQgdmFsdWVzID0gdXJsLm1hdGNoKHIpLnNsaWNlKDEpO1xuXG5cdFx0XHRsZXQgYXJncyA9IHt9O1xuXHRcdFx0bmFtZXMuZm9yRWFjaChmdW5jdGlvbihuYW1lLCBpKSB7XG5cdFx0XHRcdGFyZ3NbbmFtZS5zdWJzdHIoMSldID0gdmFsdWVzW2ldO1xuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBhcmdzO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgc3RhdGVGcm9tVXJsKHVybDogc3RyaW5nKTogSVJvdXRlRGF0YSB7XG5cdFx0XHR2YXIgcyA9IHZvaWQgMDtcblx0XHRcdHRoaXMubWFwcGluZy5mb3JFYWNoKChzdGF0ZTogSVN0YXRlKSA9PiB7XG5cdFx0XHRcdGlmKHMpXG5cdFx0XHRcdFx0cmV0dXJuO1xuXG5cdFx0XHRcdHZhciByID0gdGhpcy5yZWdleEZyb21Vcmwoc3RhdGUudXJsKTtcblx0XHRcdFx0aWYodXJsLm1hdGNoKHIpKSB7XG5cdFx0XHRcdFx0dmFyIGFyZ3MgPSB0aGlzLmFyZ3NGcm9tVXJsKHN0YXRlLnVybCwgdXJsKTtcblx0XHRcdFx0XHRzID0ge1xuXHRcdFx0XHRcdFx0XCJzdGF0ZVwiOiBzdGF0ZS5uYW1lLFxuXHRcdFx0XHRcdFx0XCJhcmdzXCI6IGFyZ3MsXG5cdFx0XHRcdFx0XHRcImV4dGVyblwiOiBmYWxzZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRpZighcylcblx0XHRcdFx0dGhyb3cgXCJObyBTdGF0ZSBmb3VuZCBmb3IgdXJsIFwiK3VybDtcblxuXHRcdFx0cmV0dXJuIHM7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSB1cmxGcm9tU3RhdGUodXJsOiBzdHJpbmcsIGFyZ3M6IGFueSk6IHN0cmluZyB7XG5cdFx0XHRsZXQgcmVnZXggPSAvOihbXFx3XSspLztcblx0XHRcdHdoaWxlKHVybC5tYXRjaChyZWdleCkpIHtcblx0XHRcdFx0dXJsID0gdXJsLnJlcGxhY2UocmVnZXgsIGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gYXJnc1ttLnN1YnN0cigxKV07XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHVybDtcblx0XHR9XG5cblx0XHRwcml2YXRlIGVxdWFscyhvMTogYW55LCBvMjogYW55KSA6IGJvb2xlYW4ge1xuXHRcdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KG8xKSA9PT0gSlNPTi5zdHJpbmdpZnkobzIpO1xuXHRcdH1cblxuXHR9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9kaXNwYXRjaGVyLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcm91dGVyLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vc3RvcmVyZWdpc3RyeS50c1wiLz5cblxubW9kdWxlIGhvLmZsdXgge1xuXHRpbXBvcnQgUHJvbWlzZSA9IGhvLnByb21pc2UuUHJvbWlzZTtcblxuXHRleHBvcnQgbGV0IERJU1BBVENIRVI6IERpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXHQvL2V4cG9ydCBsZXQgU1RPUkVTOiB7W2tleTpzdHJpbmddOlN0b3JlPGFueT59ID0ge307XG5cdGV4cG9ydCBsZXQgU1RPUkVTOiBTdG9yZXJlZ2lzdHJ5ID0gbmV3IFN0b3JlcmVnaXN0cnkoKTtcblxuXHQvL2lmKHR5cGVvZiBoby5mbHV4LlNUT1JFU1snUm91dGVyJ10gPT09ICd1bmRlZmluZWQnKVxuXHRpZihoby5mbHV4LlNUT1JFUy5nZXQoUm91dGVyKSA9PT0gdW5kZWZpbmVkKVxuXHRcdG5ldyBSb3V0ZXIoKTtcblxuXHRleHBvcnQgZnVuY3Rpb24gcnVuKCk6IFByb21pc2U8YW55LCBhbnk+IHtcblx0XHQvL3JldHVybiAoPFJvdXRlcj5oby5mbHV4LlNUT1JFU1snUm91dGVyJ10pLmluaXQoKTtcblx0XHRyZXR1cm4gU1RPUkVTLmdldChSb3V0ZXIpLmluaXQoKTtcblx0fVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9