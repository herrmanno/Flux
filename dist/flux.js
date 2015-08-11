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



var ho;
(function (ho) {
    var flux;
    (function (flux) {
        var registry;
        (function (registry) {
            var Promise = ho.promise.Promise;
            registry.mapping = {};
            registry.useDir = true;
            var Registry = (function () {
                function Registry() {
                    this.stores = {};
                    this.storeLoader = new ho.classloader.ClassLoader({
                        urlTemplate: 'stores/${name}.js',
                        useDir: registry.useDir
                    });
                }
                Registry.prototype.register = function (store) {
                    this.stores[store.name] = store;
                    return store;
                };
                Registry.prototype.get = function (storeClass) {
                    var name = void 0;
                    if (typeof storeClass === 'string')
                        name = storeClass;
                    else
                        name = storeClass.toString().match(/\w+/g)[1];
                    return this.stores[name];
                };
                Registry.prototype.loadStore = function (name) {
                    var self = this;
                    if (!!this.stores[name])
                        return Promise.create(this.stores[name]);
                    return this.storeLoader.load({
                        name: name,
                        url: registry.mapping[name],
                        super: ["ho.flux.Store"]
                    })
                        .then(function (classes) {
                        classes.map(function (c) {
                            self.register(new c).init();
                        });
                        return self.get(classes.pop());
                    });
                    /*
                    let self = this;
        
                    let ret = this.getParentOfStore(name)
                    .then((parent) => {
                        if(self.stores[parent] instanceof Store || parent === 'ho.flux.Store')
                            return true;
                        else
                            return self.loadStore(parent);
                    })
                    .then((parentType) => {
                        return ho.flux.storeprovider.instance.getStore(name);
                    })
                    .then((storeClass) => {
                        return self.register(new storeClass).init();
                    })
                    .then(()=>{
                        return self.stores[name];
                    });
        
                    return ret;
                    */
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
                return Registry;
            })();
            registry.Registry = Registry;
        })(registry = flux.registry || (flux.registry = {}));
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));

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
        var Promise = ho.promise.Promise;
        var Router = (function (_super) {
            __extends(Router, _super);
            function Router() {
                _super.apply(this, arguments);
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
            Router.prototype.go = function (data, args) {
                var _data = {
                    state: undefined,
                    args: undefined,
                    extern: false
                };
                if (typeof data === 'string') {
                    _data.state = data;
                    _data.args = args;
                }
                else {
                    _data.state = data.state;
                    _data.args = data.args;
                }
                ho.flux.DISPATCHER.dispatch({
                    type: 'STATE',
                    data: _data
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
                //get requested state
                var state = this.getStateFromName(data.state);
                var url = this.urlFromState(state.url, data.args);
                //current state and args equals requested state and args -> return
                if (this.data &&
                    this.data.state &&
                    this.data.state.name === data.state &&
                    this.equals(this.data.args, data.args) &&
                    url === window.location.hash.substr(1)) {
                    return;
                }
                //requested state has an redirect property -> call redirect state
                if (!!state.redirect) {
                    state = this.getStateFromName(state.redirect);
                }
                var prom = typeof state.before === 'function' ? state.before(data) : Promise.create(undefined);
                prom
                    .then(function () {
                    //does the state change request comes from extern e.g. url change in browser window ?
                    var extern = !!data.extern;
                    this.data = {
                        state: state,
                        args: data.args,
                        extern: extern,
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
                        extern: true,
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

/// <reference path="../../../bower_components/ho-promise/dist/promise.d.ts"/>
/// <reference path="../../../bower_components/ho-classloader/dist/classloader.d.ts"/>
var ho;
(function (ho) {
    var flux;
    (function (flux) {
        flux.DISPATCHER = new flux.Dispatcher();
        flux.STORES = new flux.registry.Registry();
        flux.dir = false;
        //if(ho.flux.STORES.get(Router) === undefined)
        //	new Router();
        function run() {
            //return (<Router>ho.flux.STORES['Router']).init();
            return flux.STORES.get(flux.Router).init();
        }
        flux.run = run;
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9oby9mbHV4L2NhbGxiYWNraG9sZGVyLnRzIiwic3JjL2hvL2ZsdXgvc3RhdGUudHMiLCJzcmMvaG8vZmx1eC9yZWdpc3RyeS9yZWdpc3RyeS50cyIsInNyYy9oby9mbHV4L3N0YXRlcHJvdmlkZXIvc3RhdGVwcm92aWRlci50cyIsInNyYy9oby9mbHV4L3N0b3JlLnRzIiwic3JjL2hvL2ZsdXgvcm91dGVyLnRzIiwic3JjL2hvL2ZsdXgvZGlzcGF0Y2hlci50cyIsInNyYy9oby9mbHV4L2ZsdXgudHMiXSwibmFtZXMiOlsiaG8iLCJoby5mbHV4IiwiaG8uZmx1eC5DYWxsYmFja0hvbGRlciIsImhvLmZsdXguQ2FsbGJhY2tIb2xkZXIuY29uc3RydWN0b3IiLCJoby5mbHV4LkNhbGxiYWNrSG9sZGVyLnJlZ2lzdGVyIiwiaG8uZmx1eC5DYWxsYmFja0hvbGRlci51bnJlZ2lzdGVyIiwiaG8uZmx1eC5yZWdpc3RyeSIsImhvLmZsdXgucmVnaXN0cnkuUmVnaXN0cnkiLCJoby5mbHV4LnJlZ2lzdHJ5LlJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiaG8uZmx1eC5yZWdpc3RyeS5SZWdpc3RyeS5yZWdpc3RlciIsImhvLmZsdXgucmVnaXN0cnkuUmVnaXN0cnkuZ2V0IiwiaG8uZmx1eC5yZWdpc3RyeS5SZWdpc3RyeS5sb2FkU3RvcmUiLCJoby5mbHV4LnN0YXRlcHJvdmlkZXIiLCJoby5mbHV4LnN0YXRlcHJvdmlkZXIuU3RhdGVQcm92aWRlciIsImhvLmZsdXguc3RhdGVwcm92aWRlci5TdGF0ZVByb3ZpZGVyLmNvbnN0cnVjdG9yIiwiaG8uZmx1eC5zdGF0ZXByb3ZpZGVyLlN0YXRlUHJvdmlkZXIucmVzb2x2ZSIsImhvLmZsdXguc3RhdGVwcm92aWRlci5TdGF0ZVByb3ZpZGVyLmdldFN0YXRlcyIsImhvLmZsdXguU3RvcmUiLCJoby5mbHV4LlN0b3JlLmNvbnN0cnVjdG9yIiwiaG8uZmx1eC5TdG9yZS5pbml0IiwiaG8uZmx1eC5TdG9yZS5uYW1lIiwiaG8uZmx1eC5TdG9yZS5yZWdpc3RlciIsImhvLmZsdXguU3RvcmUub24iLCJoby5mbHV4LlN0b3JlLmhhbmRsZSIsImhvLmZsdXguU3RvcmUuY2hhbmdlZCIsImhvLmZsdXguUm91dGVyIiwiaG8uZmx1eC5Sb3V0ZXIuY29uc3RydWN0b3IiLCJoby5mbHV4LlJvdXRlci5pbml0IiwiaG8uZmx1eC5Sb3V0ZXIuZ28iLCJoby5mbHV4LlJvdXRlci5pbml0U3RhdGVzIiwiaG8uZmx1eC5Sb3V0ZXIuZ2V0U3RhdGVGcm9tTmFtZSIsImhvLmZsdXguUm91dGVyLm9uU3RhdGVDaGFuZ2VSZXF1ZXN0ZWQiLCJoby5mbHV4LlJvdXRlci5vbkhhc2hDaGFuZ2UiLCJoby5mbHV4LlJvdXRlci5zZXRVcmwiLCJoby5mbHV4LlJvdXRlci5yZWdleEZyb21VcmwiLCJoby5mbHV4LlJvdXRlci5hcmdzRnJvbVVybCIsImhvLmZsdXguUm91dGVyLnN0YXRlRnJvbVVybCIsImhvLmZsdXguUm91dGVyLnVybEZyb21TdGF0ZSIsImhvLmZsdXguUm91dGVyLmVxdWFscyIsImhvLmZsdXguRGlzcGF0Y2hlciIsImhvLmZsdXguRGlzcGF0Y2hlci5jb25zdHJ1Y3RvciIsImhvLmZsdXguRGlzcGF0Y2hlci53YWl0Rm9yIiwiaG8uZmx1eC5EaXNwYXRjaGVyLmRpc3BhdGNoIiwiaG8uZmx1eC5EaXNwYXRjaGVyLmludm9rZUNhbGxiYWNrIiwiaG8uZmx1eC5EaXNwYXRjaGVyLnN0YXJ0RGlzcGF0Y2hpbmciLCJoby5mbHV4LkRpc3BhdGNoZXIuc3RvcERpc3BhdGNoaW5nIiwiaG8uZmx1eC5ydW4iXSwibWFwcGluZ3MiOiJBQUFBLElBQU8sRUFBRSxDQW9CUjtBQXBCRCxXQUFPLEVBQUU7SUFBQ0EsSUFBQUEsSUFBSUEsQ0FvQmJBO0lBcEJTQSxXQUFBQSxJQUFJQSxFQUFDQSxDQUFDQTtRQUVmQztZQUFBQztnQkFFV0MsV0FBTUEsR0FBV0EsS0FBS0EsQ0FBQ0E7Z0JBQ3BCQSxXQUFNQSxHQUFXQSxDQUFDQSxDQUFDQTtnQkFD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QTtRQUUxQ0EsV0FBTUEsR0FBc0JBLElBQUlBLGFBQVFBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1FBRXBEQSxRQUFHQSxHQUFZQSxLQUFLQSxDQUFDQTtRQUVoQ0EsQUFHQUEsOENBSDhDQTtRQUM5Q0EsZ0JBQWdCQTs7WUFHZjZDLEFBQ0FBLG1EQURtREE7WUFDbkRBLE1BQU1BLENBQUNBLFdBQU1BLENBQUNBLEdBQUdBLENBQUNBLFdBQU1BLENBQUNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1FBQ2xDQSxDQUFDQTtRQUhlN0MsUUFBR0EsTUFHbEJBLENBQUFBO0lBQ0ZBLENBQUNBLEVBaEJTRCxJQUFJQSxHQUFKQSxPQUFJQSxLQUFKQSxPQUFJQSxRQWdCYkE7QUFBREEsQ0FBQ0EsRUFoQk0sRUFBRSxLQUFGLEVBQUUsUUFnQlIiLCJmaWxlIjoiZmx1eC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSBoby5mbHV4IHtcclxuXHJcblx0ZXhwb3J0IGNsYXNzIENhbGxiYWNrSG9sZGVyIHtcclxuXHJcblx0XHRwcm90ZWN0ZWQgcHJlZml4OiBzdHJpbmcgPSAnSURfJztcclxuICAgIFx0cHJvdGVjdGVkIGxhc3RJRDogbnVtYmVyID0gMTtcclxuXHRcdHByb3RlY3RlZCBjYWxsYmFja3M6IHtba2V5OnN0cmluZ106RnVuY3Rpb259ID0ge307XHJcblxyXG5cdFx0cHVibGljIHJlZ2lzdGVyKGNhbGxiYWNrOiBGdW5jdGlvbiwgc2VsZj86IGFueSk6IHN0cmluZyB7XHJcbiAgICBcdFx0bGV0IGlkID0gdGhpcy5wcmVmaXggKyB0aGlzLmxhc3RJRCsrO1xyXG4gICAgXHRcdHRoaXMuY2FsbGJhY2tzW2lkXSA9IHNlbGYgPyBjYWxsYmFjay5iaW5kKHNlbGYpIDogY2FsbGJhY2s7XHJcbiAgICBcdFx0cmV0dXJuIGlkO1xyXG4gIFx0XHR9XHJcblxyXG4gIFx0XHRwdWJsaWMgdW5yZWdpc3RlcihpZCkge1xyXG4gICAgICBcdFx0aWYoIXRoaXMuY2FsbGJhY2tzW2lkXSlcclxuXHRcdFx0XHR0aHJvdyAnQ291bGQgbm90IHVucmVnaXN0ZXIgY2FsbGJhY2sgZm9yIGlkICcgKyBpZDtcclxuICAgIFx0XHRkZWxldGUgdGhpcy5jYWxsYmFja3NbaWRdO1xyXG4gIFx0XHR9O1xyXG5cdH1cclxufVxyXG4iLCJcclxubW9kdWxlIGhvLmZsdXgge1xyXG5cdGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuXHJcblx0ZXhwb3J0IGludGVyZmFjZSBJU3RhdGUge1xyXG5cdFx0bmFtZTogc3RyaW5nO1xyXG5cdFx0dXJsOiBzdHJpbmc7XHJcblx0XHRyZWRpcmVjdD86IHN0cmluZztcclxuXHRcdGJlZm9yZT86IChkYXRhOiBJUm91dGVEYXRhKT0+UHJvbWlzZTxhbnksIGFueT47XHJcblx0XHR2aWV3PzogQXJyYXk8SVZpZXdTdGF0ZT47XHJcblx0fVxyXG5cclxuXHRleHBvcnQgaW50ZXJmYWNlIElWaWV3U3RhdGUge1xyXG5cdCAgICBuYW1lOiBzdHJpbmc7XHJcblx0XHRodG1sOiBzdHJpbmc7XHJcblx0fVxyXG5cclxuXHRleHBvcnQgaW50ZXJmYWNlIElTdGF0ZXMge1xyXG5cdCAgICBzdGF0ZXM6IEFycmF5PElTdGF0ZT47XHJcblx0fVxyXG5cclxufVxyXG4iLCJcclxubW9kdWxlIGhvLmZsdXgucmVnaXN0cnkge1xyXG5cdGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuXHRleHBvcnQgbGV0IG1hcHBpbmc6IHtba2V5OnN0cmluZ106c3RyaW5nfSA9IHt9O1xyXG5cdGV4cG9ydCBsZXQgdXNlRGlyID0gdHJ1ZTtcclxuXHJcblx0ZXhwb3J0IGNsYXNzIFJlZ2lzdHJ5IHtcclxuXHJcblx0XHRwcml2YXRlIHN0b3Jlczoge1trZXk6IHN0cmluZ106IFN0b3JlPGFueT59ID0ge307XHJcblxyXG5cdFx0cHJpdmF0ZSBzdG9yZUxvYWRlciA9IG5ldyBoby5jbGFzc2xvYWRlci5DbGFzc0xvYWRlcih7XHJcbiAgICAgICAgICAgdXJsVGVtcGxhdGU6ICdzdG9yZXMvJHtuYW1lfS5qcycsXHJcbiAgICAgICAgICAgdXNlRGlyXHJcbiAgICAgICB9KTtcclxuXHJcblx0XHRwdWJsaWMgcmVnaXN0ZXIoc3RvcmU6IFN0b3JlPGFueT4pOiBTdG9yZTxhbnk+IHtcclxuXHRcdFx0dGhpcy5zdG9yZXNbc3RvcmUubmFtZV0gPSBzdG9yZTtcclxuXHRcdFx0cmV0dXJuIHN0b3JlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHB1YmxpYyBnZXQoc3RvcmVDbGFzczogc3RyaW5nKTogU3RvcmU8YW55PlxyXG5cdFx0cHVibGljIGdldDxUIGV4dGVuZHMgU3RvcmU8YW55Pj4oc3RvcmVDbGFzczoge25ldygpOlR9KTogVFxyXG5cdFx0cHVibGljIGdldDxUIGV4dGVuZHMgU3RvcmU8YW55Pj4oc3RvcmVDbGFzczogYW55KTogVCB7XHJcblx0XHRcdGxldCBuYW1lID0gdm9pZCAwO1xyXG5cdFx0XHRpZih0eXBlb2Ygc3RvcmVDbGFzcyA9PT0gJ3N0cmluZycpXHJcblx0XHRcdFx0bmFtZSA9IHN0b3JlQ2xhc3M7XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRuYW1lID0gc3RvcmVDbGFzcy50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xyXG5cdFx0XHRyZXR1cm4gPFQ+dGhpcy5zdG9yZXNbbmFtZV07XHJcblx0XHR9XHJcblxyXG5cdFx0cHVibGljIGxvYWRTdG9yZShuYW1lOiBzdHJpbmcpOiBQcm9taXNlPFN0b3JlPGFueT4sIHN0cmluZz4ge1xyXG5cclxuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuXHRcdFx0aWYoISF0aGlzLnN0b3Jlc1tuYW1lXSlcclxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5jcmVhdGUodGhpcy5zdG9yZXNbbmFtZV0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmVMb2FkZXIubG9hZCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lLFxyXG5cdFx0XHRcdHVybDogbWFwcGluZ1tuYW1lXSxcclxuICAgICAgICAgICAgICAgIHN1cGVyOiBbXCJoby5mbHV4LlN0b3JlXCJdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChjbGFzc2VzOiBBcnJheTx0eXBlb2YgU3RvcmU+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzLm1hcChjID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnJlZ2lzdGVyKG5ldyBjKS5pbml0KCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmdldChjbGFzc2VzLnBvcCgpKTtcclxuICAgICAgICAgICAgfSlcclxuXHJcblx0XHRcdC8qXHJcblx0XHRcdGxldCBzZWxmID0gdGhpcztcclxuXHJcblx0XHQgICBcdGxldCByZXQgPSB0aGlzLmdldFBhcmVudE9mU3RvcmUobmFtZSlcclxuXHRcdCAgIFx0LnRoZW4oKHBhcmVudCkgPT4ge1xyXG5cdFx0XHQgICBcdGlmKHNlbGYuc3RvcmVzW3BhcmVudF0gaW5zdGFuY2VvZiBTdG9yZSB8fCBwYXJlbnQgPT09ICdoby5mbHV4LlN0b3JlJylcclxuXHRcdFx0XHQgICBcdHJldHVybiB0cnVlO1xyXG5cdCAgIFx0XHRcdGVsc2VcclxuXHRcdFx0ICAgXHRcdHJldHVybiBzZWxmLmxvYWRTdG9yZShwYXJlbnQpO1xyXG5cdFx0ICAgXHR9KVxyXG5cdFx0ICAgXHQudGhlbigocGFyZW50VHlwZSkgPT4ge1xyXG5cdFx0XHQgICBcdHJldHVybiBoby5mbHV4LnN0b3JlcHJvdmlkZXIuaW5zdGFuY2UuZ2V0U3RvcmUobmFtZSk7XHJcblx0XHQgICBcdH0pXHJcblx0XHQgICBcdC50aGVuKChzdG9yZUNsYXNzKSA9PiB7XHJcblx0XHRcdCAgIFx0cmV0dXJuIHNlbGYucmVnaXN0ZXIobmV3IHN0b3JlQ2xhc3MpLmluaXQoKTtcclxuXHRcdCAgIFx0fSlcclxuXHRcdFx0LnRoZW4oKCk9PntcclxuXHRcdFx0ICAgXHRyZXR1cm4gc2VsZi5zdG9yZXNbbmFtZV07XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIHJldDtcclxuXHRcdFx0Ki9cclxuXHJcblx0XHRcdC8qXHJcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0XHRpZih0aGlzLmdldChuYW1lKSBpbnN0YW5jZW9mIFN0b3JlKVxyXG5cdFx0XHRcdFx0cmVzb2x2ZSh0aGlzLmdldChuYW1lKSlcclxuXHRcdFx0XHRlbHNlIHtcclxuXHJcblx0XHRcdFx0XHRzdG9yZXByb3ZpZGVyLmluc3RhbmNlLmdldFN0b3JlKG5hbWUpXHJcblx0XHRcdFx0XHQudGhlbigoc3RvcmVDbGFzcykgPT4ge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnJlZ2lzdGVyKG5ldyBzdG9yZUNsYXNzKCkpO1xyXG5cdFx0XHRcdFx0XHRyZXNvbHZlKHRoaXMuZ2V0KG5hbWUpKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQuY2F0Y2gocmVqZWN0KTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHR9LmJpbmQodGhpcykpO1xyXG5cdFx0XHQqL1xyXG5cclxuXHRcdFx0LypcclxuXHRcdFx0aWYoU1RPUkVTW25hbWVdICE9PSB1bmRlZmluZWQgJiYgU1RPUkVTW25hbWVdIGluc3RhbmNlb2YgU3RvcmUpXHJcblx0XHRcdFx0cmV0dXJuIFByb21pc2UuY3JlYXRlKFNUT1JFU1tuYW1lXSk7XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblx0XHRcdFx0XHRzdG9yZXByb3ZpZGVyLmluc3RhbmNlLmdldFN0b3JlKG5hbWUpXHJcblx0XHRcdFx0XHQudGhlbigocyk9PntyZXNvbHZlKHMpO30pXHJcblx0XHRcdFx0XHQuY2F0Y2goKGUpPT57cmVqZWN0KGUpO30pO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdCovXHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8qXHJcblx0XHRwcm90ZWN0ZWQgZ2V0UGFyZW50T2ZTdG9yZShuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZywgYW55PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHhtbGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgIHhtbGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHhtbGh0dHAucmVhZHlTdGF0ZSA9PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZXNwID0geG1saHR0cC5yZXNwb25zZVRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHhtbGh0dHAuc3RhdHVzID09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG0gPSByZXNwLm1hdGNoKC99XFwpXFwoKC4qKVxcKTsvKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKG0gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1bMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXNwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHhtbGh0dHAub3BlbignR0VUJywgaG8uZmx1eC5zdG9yZXByb3ZpZGVyLmluc3RhbmNlLnJlc29sdmUobmFtZSkpO1xyXG4gICAgICAgICAgICAgICAgeG1saHR0cC5zZW5kKCk7XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblx0XHQqL1xyXG5cdH1cclxuXHJcbn1cclxuIiwiXHJcbm1vZHVsZSBoby5mbHV4LnN0YXRlcHJvdmlkZXIge1xyXG5cdGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVN0YXRlUHJvdmlkZXIge1xyXG4gICAgICAgIHVzZU1pbjpib29sZWFuO1xyXG5cdFx0cmVzb2x2ZSgpOiBzdHJpbmc7XHJcblx0XHRnZXRTdGF0ZXMobmFtZT86c3RyaW5nKTogUHJvbWlzZTxJU3RhdGVzLCBzdHJpbmc+O1xyXG4gICAgfVxyXG5cclxuXHRjbGFzcyBTdGF0ZVByb3ZpZGVyIGltcGxlbWVudHMgSVN0YXRlUHJvdmlkZXIge1xyXG5cclxuICAgICAgICB1c2VNaW46IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgcmVzb2x2ZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy51c2VNaW4gP1xyXG4gICAgICAgICAgICAgICAgYHN0YXRlcy5taW4uanNgIDpcclxuICAgICAgICAgICAgICAgIGBzdGF0ZXMuanNgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0U3RhdGVzKG5hbWUgPSBcIlN0YXRlc1wiKTogUHJvbWlzZTxJU3RhdGVzLCBzdHJpbmc+IHtcclxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlPElTdGF0ZXMsIGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cdFx0XHRcdGxldCBzcmMgPSB0aGlzLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIGxldCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgICAgICAgICAgICAgIHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyB3aW5kb3dbbmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHRcdFx0XHRzY3JpcHQub25lcnJvciA9IChlKSA9PiB7XHJcblx0XHRcdFx0XHRyZWplY3QoZSk7XHJcblx0XHRcdFx0fTtcclxuICAgICAgICAgICAgICAgIHNjcmlwdC5zcmMgPSBzcmM7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBsZXQgaW5zdGFuY2U6IElTdGF0ZVByb3ZpZGVyID0gbmV3IFN0YXRlUHJvdmlkZXIoKTtcclxufVxyXG4iLCJcclxubW9kdWxlIGhvLmZsdXgge1xyXG5cclxuXHRleHBvcnQgY2xhc3MgU3RvcmU8VD4gZXh0ZW5kcyBDYWxsYmFja0hvbGRlciB7XHJcblxyXG5cdFx0cHJvdGVjdGVkIGRhdGE6IFQ7XHJcblx0XHRwcml2YXRlIGlkOiBzdHJpbmc7XHJcblx0XHRwcml2YXRlIGhhbmRsZXJzOiB7W2tleTogc3RyaW5nXTogRnVuY3Rpb259ID0ge307XHJcblxyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0XHRzdXBlcigpO1xyXG5cdFx0XHR0aGlzLmlkID0gaG8uZmx1eC5ESVNQQVRDSEVSLnJlZ2lzdGVyKHRoaXMuaGFuZGxlLmJpbmQodGhpcykpO1xyXG5cdFx0XHQvL2hvLmZsdXguU1RPUkVTW3RoaXMubmFtZV0gPSB0aGlzO1xyXG5cdFx0XHRoby5mbHV4LlNUT1JFUy5yZWdpc3Rlcih0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHRwdWJsaWMgaW5pdCgpOiBhbnkge31cclxuXHJcblx0XHQgZ2V0IG5hbWUoKTogc3RyaW5nIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcclxuXHRcdH1cclxuXHJcblx0XHRwdWJsaWMgcmVnaXN0ZXIoY2FsbGJhY2s6IChkYXRhOlQpPT52b2lkLCBzZWxmPzphbnkpOiBzdHJpbmcge1xyXG5cdFx0XHRyZXR1cm4gc3VwZXIucmVnaXN0ZXIoY2FsbGJhY2ssIHNlbGYpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHByb3RlY3RlZCBvbih0eXBlOiBzdHJpbmcsIGZ1bmM6IEZ1bmN0aW9uKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuaGFuZGxlcnNbdHlwZV0gPSBmdW5jO1xyXG5cdFx0fVxyXG5cclxuXHRcdHByb3RlY3RlZCBoYW5kbGUoYWN0aW9uOiBJQWN0aW9uKTogdm9pZCB7XHJcblx0XHRcdGlmKHR5cGVvZiB0aGlzLmhhbmRsZXJzW2FjdGlvbi50eXBlXSA9PT0gJ2Z1bmN0aW9uJylcclxuXHRcdFx0XHR0aGlzLmhhbmRsZXJzW2FjdGlvbi50eXBlXShhY3Rpb24uZGF0YSk7XHJcblx0XHR9O1xyXG5cclxuXHJcblx0XHRwcm90ZWN0ZWQgY2hhbmdlZCgpOiB2b2lkIHtcclxuXHRcdFx0Zm9yIChsZXQgaWQgaW4gdGhpcy5jYWxsYmFja3MpIHtcclxuXHRcdFx0ICBsZXQgY2IgPSB0aGlzLmNhbGxiYWNrc1tpZF07XHJcblx0XHRcdCAgaWYoY2IpXHJcblx0XHRcdCAgXHRjYih0aGlzLmRhdGEpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cclxuXHR9O1xyXG5cclxuXHJcbn1cclxuIiwiXHJcblxyXG5tb2R1bGUgaG8uZmx1eCB7XHJcblxyXG5cdGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuXHJcblx0LyoqIERhdGEgdGhhdCBhIFJvdXRlciNnbyB0YWtlcyAqL1xyXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVJvdXRlRGF0YSB7XHJcblx0ICAgIHN0YXRlOiBzdHJpbmc7XHJcblx0XHRhcmdzOiBhbnk7XHJcblx0XHRleHRlcm46IGJvb2xlYW47XHJcblx0fVxyXG5cclxuXHQvKiogRGF0YSB0aGF0IFJvdXRlciNjaGFuZ2VzIGVtaXQgdG8gaXRzIGxpc3RlbmVycyAqL1xyXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVJvdXRlckRhdGEge1xyXG5cdCAgICBzdGF0ZTogSVN0YXRlO1xyXG5cdFx0YXJnczogYW55O1xyXG5cdFx0ZXh0ZXJuOiBib29sZWFuO1xyXG5cdH1cclxuXHJcblx0ZXhwb3J0IGNsYXNzIFJvdXRlciBleHRlbmRzIFN0b3JlPElSb3V0ZXJEYXRhPiB7XHJcblxyXG5cdFx0cHJpdmF0ZSBtYXBwaW5nOkFycmF5PElTdGF0ZT4gPSBudWxsO1xyXG5cclxuXHRcdHB1YmxpYyBpbml0KCk6IFByb21pc2U8YW55LCBhbnk+IHtcclxuXHRcdFx0dGhpcy5vbignU1RBVEUnLCB0aGlzLm9uU3RhdGVDaGFuZ2VSZXF1ZXN0ZWQuYmluZCh0aGlzKSk7XHJcblxyXG5cdFx0XHRsZXQgb25IYXNoQ2hhbmdlID0gdGhpcy5vbkhhc2hDaGFuZ2UuYmluZCh0aGlzKTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzLmluaXRTdGF0ZXMoKVxyXG5cdFx0XHQudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0d2luZG93Lm9uaGFzaGNoYW5nZSA9IG9uSGFzaENoYW5nZTtcclxuXHRcdFx0XHRvbkhhc2hDaGFuZ2UoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cHVibGljIGdvKHN0YXRlOiBzdHJpbmcsIGRhdGE/OiBhbnkpOiB2b2lkXHJcblx0XHRwdWJsaWMgZ28oZGF0YTogSVJvdXRlRGF0YSk6IHZvaWRcclxuXHRcdHB1YmxpYyBnbyhkYXRhOiBJUm91dGVEYXRhIHwgc3RyaW5nLCBhcmdzPzogYW55KTogdm9pZCB7XHJcblxyXG5cdFx0XHRsZXQgX2RhdGE6IElSb3V0ZURhdGEgPSB7XHJcblx0XHRcdFx0c3RhdGU6IHVuZGVmaW5lZCxcclxuXHRcdFx0XHRhcmdzOiB1bmRlZmluZWQsXHJcblx0XHRcdFx0ZXh0ZXJuOiBmYWxzZVxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0aWYodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdFx0X2RhdGEuc3RhdGUgPSBkYXRhO1xyXG5cdFx0XHRcdF9kYXRhLmFyZ3MgPSBhcmdzO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdF9kYXRhLnN0YXRlID0gZGF0YS5zdGF0ZTtcclxuXHRcdFx0XHRfZGF0YS5hcmdzID0gZGF0YS5hcmdzO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRoby5mbHV4LkRJU1BBVENIRVIuZGlzcGF0Y2goe1xyXG5cdFx0XHRcdHR5cGU6ICdTVEFURScsXHJcblx0XHRcdFx0ZGF0YTogX2RhdGFcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJpdmF0ZSBpbml0U3RhdGVzKCk6IFByb21pc2U8YW55LCBhbnk+IHtcclxuXHRcdFx0cmV0dXJuIHN0YXRlcHJvdmlkZXIuaW5zdGFuY2UuZ2V0U3RhdGVzKClcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oaXN0YXRlcykge1xyXG5cdFx0XHRcdHRoaXMubWFwcGluZyA9IGlzdGF0ZXMuc3RhdGVzO1xyXG5cdFx0XHR9LmJpbmQodGhpcykpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgZ2V0U3RhdGVGcm9tTmFtZShuYW1lOiBzdHJpbmcpOiBJU3RhdGUge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5tYXBwaW5nLmZpbHRlcigocyk9PntcclxuXHRcdFx0XHRyZXR1cm4gcy5uYW1lID09PSBuYW1lXHJcblx0XHRcdH0pWzBdO1xyXG5cdFx0fVxyXG5cclxuXHRcdHByb3RlY3RlZCBvblN0YXRlQ2hhbmdlUmVxdWVzdGVkKGRhdGE6IElSb3V0ZURhdGEpOiB2b2lkIHtcclxuXHRcdFx0Ly9nZXQgcmVxdWVzdGVkIHN0YXRlXHJcblx0XHRcdGxldCBzdGF0ZSA9IHRoaXMuZ2V0U3RhdGVGcm9tTmFtZShkYXRhLnN0YXRlKTtcclxuXHRcdFx0bGV0IHVybCA9IHRoaXMudXJsRnJvbVN0YXRlKHN0YXRlLnVybCwgZGF0YS5hcmdzKTtcclxuXHJcblx0XHRcdC8vY3VycmVudCBzdGF0ZSBhbmQgYXJncyBlcXVhbHMgcmVxdWVzdGVkIHN0YXRlIGFuZCBhcmdzIC0+IHJldHVyblxyXG5cdFx0XHRpZihcclxuXHRcdFx0XHR0aGlzLmRhdGEgJiZcclxuXHRcdFx0XHR0aGlzLmRhdGEuc3RhdGUgJiZcclxuXHRcdFx0XHR0aGlzLmRhdGEuc3RhdGUubmFtZSA9PT0gZGF0YS5zdGF0ZSAmJlxyXG5cdFx0XHRcdHRoaXMuZXF1YWxzKHRoaXMuZGF0YS5hcmdzLCBkYXRhLmFyZ3MpICYmXHJcblx0XHRcdFx0dXJsID09PSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSlcclxuXHRcdFx0KSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cclxuXHJcblx0XHRcdC8vcmVxdWVzdGVkIHN0YXRlIGhhcyBhbiByZWRpcmVjdCBwcm9wZXJ0eSAtPiBjYWxsIHJlZGlyZWN0IHN0YXRlXHJcblx0XHRcdGlmKCEhc3RhdGUucmVkaXJlY3QpIHtcclxuXHRcdFx0XHRzdGF0ZSA9IHRoaXMuZ2V0U3RhdGVGcm9tTmFtZShzdGF0ZS5yZWRpcmVjdCk7XHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHRsZXQgcHJvbSA9IHR5cGVvZiBzdGF0ZS5iZWZvcmUgPT09ICdmdW5jdGlvbicgPyBzdGF0ZS5iZWZvcmUoZGF0YSkgOiBQcm9taXNlLmNyZWF0ZSh1bmRlZmluZWQpO1xyXG5cdFx0XHRwcm9tXHJcblx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdFx0XHQvL2RvZXMgdGhlIHN0YXRlIGNoYW5nZSByZXF1ZXN0IGNvbWVzIGZyb20gZXh0ZXJuIGUuZy4gdXJsIGNoYW5nZSBpbiBicm93c2VyIHdpbmRvdyA/XHJcblx0XHRcdFx0bGV0IGV4dGVybiA9ICEhIGRhdGEuZXh0ZXJuO1xyXG5cclxuXHRcdFx0XHR0aGlzLmRhdGEgPSB7XHJcblx0XHRcdFx0XHRzdGF0ZTogc3RhdGUsXHJcblx0XHRcdFx0XHRhcmdzOiBkYXRhLmFyZ3MsXHJcblx0XHRcdFx0XHRleHRlcm46IGV4dGVybixcclxuXHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHQvLy0tLS0tLS0gc2V0IHVybCBmb3IgYnJvd3NlclxyXG5cdFx0XHRcdHZhciB1cmwgPSB0aGlzLnVybEZyb21TdGF0ZShzdGF0ZS51cmwsIGRhdGEuYXJncyk7XHJcblx0XHRcdFx0dGhpcy5zZXRVcmwodXJsKTtcclxuXHJcblx0XHRcdFx0dGhpcy5jaGFuZ2VkKCk7XHJcblxyXG5cdFx0XHR9LmJpbmQodGhpcyksXHJcblx0XHRcdGZ1bmN0aW9uKGRhdGEpIHtcclxuXHRcdFx0XHR0aGlzLm9uU3RhdGVDaGFuZ2VSZXF1ZXN0ZWQoZGF0YSk7XHJcblx0XHRcdH0uYmluZCh0aGlzKSk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgb25IYXNoQ2hhbmdlKCk6IHZvaWQge1xyXG5cdFx0XHRsZXQgcyA9IHRoaXMuc3RhdGVGcm9tVXJsKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigxKSk7XHJcblxyXG5cdFx0XHRoby5mbHV4LkRJU1BBVENIRVIuZGlzcGF0Y2goe1xyXG5cdFx0XHRcdHR5cGU6ICdTVEFURScsXHJcblx0XHRcdFx0ZGF0YToge1xyXG5cdFx0XHRcdFx0c3RhdGU6IHMuc3RhdGUsXHJcblx0XHRcdFx0XHRhcmdzOiBzLmFyZ3MsXHJcblx0XHRcdFx0XHRleHRlcm46IHRydWUsXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRwcml2YXRlIHNldFVybCh1cmw6IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0XHRpZih3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSkgPT09IHVybClcclxuXHRcdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0XHRsZXQgbCA9IHdpbmRvdy5vbmhhc2hjaGFuZ2U7XHJcblx0XHRcdHdpbmRvdy5vbmhhc2hjaGFuZ2UgPSBudWxsO1xyXG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IHVybDtcclxuXHRcdFx0d2luZG93Lm9uaGFzaGNoYW5nZSA9IGw7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJpdmF0ZSByZWdleEZyb21VcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0XHR2YXIgcmVnZXggPSAvOihbXFx3XSspLztcclxuXHRcdFx0d2hpbGUodXJsLm1hdGNoKHJlZ2V4KSkge1xyXG5cdFx0XHRcdHVybCA9IHVybC5yZXBsYWNlKHJlZ2V4LCBcIihbXlxcL10rKVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdXJsKyckJztcclxuXHRcdH1cclxuXHJcblx0XHRwcml2YXRlIGFyZ3NGcm9tVXJsKHBhdHRlcm46IHN0cmluZywgdXJsOiBzdHJpbmcpOiBhbnkge1xyXG5cdFx0XHRsZXQgciA9IHRoaXMucmVnZXhGcm9tVXJsKHBhdHRlcm4pO1xyXG5cdFx0XHRsZXQgbmFtZXMgPSBwYXR0ZXJuLm1hdGNoKHIpLnNsaWNlKDEpO1xyXG5cdFx0XHRsZXQgdmFsdWVzID0gdXJsLm1hdGNoKHIpLnNsaWNlKDEpO1xyXG5cclxuXHRcdFx0bGV0IGFyZ3MgPSB7fTtcclxuXHRcdFx0bmFtZXMuZm9yRWFjaChmdW5jdGlvbihuYW1lLCBpKSB7XHJcblx0XHRcdFx0YXJnc1tuYW1lLnN1YnN0cigxKV0gPSB2YWx1ZXNbaV07XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIGFyZ3M7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJpdmF0ZSBzdGF0ZUZyb21VcmwodXJsOiBzdHJpbmcpOiBJUm91dGVEYXRhIHtcclxuXHRcdFx0dmFyIHMgPSB2b2lkIDA7XHJcblx0XHRcdHRoaXMubWFwcGluZy5mb3JFYWNoKChzdGF0ZTogSVN0YXRlKSA9PiB7XHJcblx0XHRcdFx0aWYocylcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHJcblx0XHRcdFx0dmFyIHIgPSB0aGlzLnJlZ2V4RnJvbVVybChzdGF0ZS51cmwpO1xyXG5cdFx0XHRcdGlmKHVybC5tYXRjaChyKSkge1xyXG5cdFx0XHRcdFx0dmFyIGFyZ3MgPSB0aGlzLmFyZ3NGcm9tVXJsKHN0YXRlLnVybCwgdXJsKTtcclxuXHRcdFx0XHRcdHMgPSB7XHJcblx0XHRcdFx0XHRcdFwic3RhdGVcIjogc3RhdGUubmFtZSxcclxuXHRcdFx0XHRcdFx0XCJhcmdzXCI6IGFyZ3MsXHJcblx0XHRcdFx0XHRcdFwiZXh0ZXJuXCI6IGZhbHNlXHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRpZighcylcclxuXHRcdFx0XHR0aHJvdyBcIk5vIFN0YXRlIGZvdW5kIGZvciB1cmwgXCIrdXJsO1xyXG5cclxuXHRcdFx0cmV0dXJuIHM7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJpdmF0ZSB1cmxGcm9tU3RhdGUodXJsOiBzdHJpbmcsIGFyZ3M6IGFueSk6IHN0cmluZyB7XHJcblx0XHRcdGxldCByZWdleCA9IC86KFtcXHddKykvO1xyXG5cdFx0XHR3aGlsZSh1cmwubWF0Y2gocmVnZXgpKSB7XHJcblx0XHRcdFx0dXJsID0gdXJsLnJlcGxhY2UocmVnZXgsIGZ1bmN0aW9uKG0pIHtcclxuXHRcdFx0XHRcdHJldHVybiBhcmdzW20uc3Vic3RyKDEpXTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdXJsO1xyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgZXF1YWxzKG8xOiBhbnksIG8yOiBhbnkpIDogYm9vbGVhbiB7XHJcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShvMSkgPT09IEpTT04uc3RyaW5naWZ5KG8yKTtcclxuXHRcdH1cclxuXHJcblx0fVxyXG59XHJcbiIsIlxyXG5tb2R1bGUgaG8uZmx1eCB7XHJcblxyXG5cdGV4cG9ydCBpbnRlcmZhY2UgSUFjdGlvbiB7XHJcblx0ICAgIHR5cGU6c3RyaW5nO1xyXG5cdFx0ZGF0YT86YW55O1xyXG5cdH1cclxuXHJcblx0ZXhwb3J0IGNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBDYWxsYmFja0hvbGRlciB7XHJcblxyXG4gICAgXHRwcml2YXRlIGlzUGVuZGluZzoge1trZXk6c3RyaW5nXTpib29sZWFufSA9IHt9O1xyXG4gICAgXHRwcml2YXRlIGlzSGFuZGxlZDoge1trZXk6c3RyaW5nXTpib29sZWFufSA9IHt9O1xyXG4gICAgXHRwcml2YXRlIGlzRGlzcGF0Y2hpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIFx0cHJpdmF0ZSBwZW5kaW5nUGF5bG9hZDogSUFjdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0cHVibGljIHdhaXRGb3IoLi4uaWRzOiBBcnJheTxudW1iZXI+KTogdm9pZCB7XHJcblx0XHRcdGlmKCF0aGlzLmlzRGlzcGF0Y2hpbmcpXHJcblx0XHQgIFx0XHR0aHJvdyAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IE11c3QgYmUgaW52b2tlZCB3aGlsZSBkaXNwYXRjaGluZy4nO1xyXG5cclxuXHRcdFx0Zm9yIChsZXQgaWkgPSAwOyBpaSA8IGlkcy5sZW5ndGg7IGlpKyspIHtcclxuXHRcdFx0ICBsZXQgaWQgPSBpZHNbaWldO1xyXG5cclxuXHRcdFx0ICBpZiAodGhpcy5pc1BlbmRpbmdbaWRdKSB7XHJcblx0XHQgICAgICBcdGlmKCF0aGlzLmlzSGFuZGxlZFtpZF0pXHJcblx0XHRcdCAgICAgIFx0dGhyb3cgYHdhaXRGb3IoLi4uKTogQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZCB3aGlsZSB3YXRpbmcgZm9yICR7aWR9YDtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0ICB9XHJcblxyXG5cdFx0XHQgIGlmKCF0aGlzLmNhbGxiYWNrc1tpZF0pXHJcblx0XHRcdCAgXHR0aHJvdyBgd2FpdEZvciguLi4pOiAke2lkfSBkb2VzIG5vdCBtYXAgdG8gYSByZWdpc3RlcmVkIGNhbGxiYWNrLmA7XHJcblxyXG5cdFx0XHQgIHRoaXMuaW52b2tlQ2FsbGJhY2soaWQpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdHB1YmxpYyBkaXNwYXRjaChhY3Rpb246IElBY3Rpb24pIHtcclxuXHRcdFx0aWYodGhpcy5pc0Rpc3BhdGNoaW5nKVxyXG5cdFx0ICAgIFx0dGhyb3cgJ0Nhbm5vdCBkaXNwYXRjaCBpbiB0aGUgbWlkZGxlIG9mIGEgZGlzcGF0Y2guJztcclxuXHJcblx0XHRcdHRoaXMuc3RhcnREaXNwYXRjaGluZyhhY3Rpb24pO1xyXG5cclxuXHRcdCAgICB0cnkge1xyXG5cdFx0ICAgICAgZm9yIChsZXQgaWQgaW4gdGhpcy5jYWxsYmFja3MpIHtcclxuXHRcdCAgICAgICAgaWYgKHRoaXMuaXNQZW5kaW5nW2lkXSkge1xyXG5cdFx0ICAgICAgICAgIGNvbnRpbnVlO1xyXG5cdFx0ICAgICAgICB9XHJcblx0XHQgICAgICAgIHRoaXMuaW52b2tlQ2FsbGJhY2soaWQpO1xyXG5cdFx0ICAgICAgfVxyXG5cdFx0ICAgIH0gZmluYWxseSB7XHJcblx0XHQgICAgICB0aGlzLnN0b3BEaXNwYXRjaGluZygpO1xyXG5cdFx0ICAgIH1cclxuXHRcdH07XHJcblxyXG5cdCAgXHRwcml2YXRlIGludm9rZUNhbGxiYWNrKGlkOiBudW1iZXIpOiB2b2lkIHtcclxuXHQgICAgXHR0aGlzLmlzUGVuZGluZ1tpZF0gPSB0cnVlO1xyXG5cdCAgICBcdHRoaXMuY2FsbGJhY2tzW2lkXSh0aGlzLnBlbmRpbmdQYXlsb2FkKTtcclxuXHQgICAgXHR0aGlzLmlzSGFuZGxlZFtpZF0gPSB0cnVlO1xyXG5cdCAgXHR9XHJcblxyXG5cdCAgXHRwcml2YXRlIHN0YXJ0RGlzcGF0Y2hpbmcocGF5bG9hZDogSUFjdGlvbik6IHZvaWQge1xyXG5cdCAgICBcdGZvciAobGV0IGlkIGluIHRoaXMuY2FsbGJhY2tzKSB7XHJcblx0ICAgICAgXHRcdHRoaXMuaXNQZW5kaW5nW2lkXSA9IGZhbHNlO1xyXG5cdCAgICAgIFx0XHR0aGlzLmlzSGFuZGxlZFtpZF0gPSBmYWxzZTtcclxuXHQgICAgXHR9XHJcblx0ICAgIFx0dGhpcy5wZW5kaW5nUGF5bG9hZCA9IHBheWxvYWQ7XHJcblx0ICAgIFx0dGhpcy5pc0Rpc3BhdGNoaW5nID0gdHJ1ZTtcclxuICBcdFx0fVxyXG5cclxuXHQgIFx0cHJpdmF0ZSBzdG9wRGlzcGF0Y2hpbmcoKTogdm9pZCB7XHJcblx0ICAgIFx0dGhpcy5wZW5kaW5nUGF5bG9hZCA9IG51bGw7XHJcblx0ICAgIFx0dGhpcy5pc0Rpc3BhdGNoaW5nID0gZmFsc2U7XHJcblx0ICBcdH1cclxuXHR9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8tcHJvbWlzZS9kaXN0L3Byb21pc2UuZC50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8tY2xhc3Nsb2FkZXIvZGlzdC9jbGFzc2xvYWRlci5kLnRzXCIvPlxyXG5cclxubW9kdWxlIGhvLmZsdXgge1xyXG5cdGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuXHRleHBvcnQgbGV0IERJU1BBVENIRVI6IERpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xyXG5cclxuXHRleHBvcnQgbGV0IFNUT1JFUzogcmVnaXN0cnkuUmVnaXN0cnkgPSBuZXcgcmVnaXN0cnkuUmVnaXN0cnkoKTtcclxuXHJcblx0ZXhwb3J0IGxldCBkaXI6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcblx0Ly9pZihoby5mbHV4LlNUT1JFUy5nZXQoUm91dGVyKSA9PT0gdW5kZWZpbmVkKVxyXG5cdC8vXHRuZXcgUm91dGVyKCk7XHJcblxyXG5cdGV4cG9ydCBmdW5jdGlvbiBydW4oKTogUHJvbWlzZTxhbnksIGFueT4ge1xyXG5cdFx0Ly9yZXR1cm4gKDxSb3V0ZXI+aG8uZmx1eC5TVE9SRVNbJ1JvdXRlciddKS5pbml0KCk7XHJcblx0XHRyZXR1cm4gU1RPUkVTLmdldChSb3V0ZXIpLmluaXQoKTtcclxuXHR9XHJcbn1cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9