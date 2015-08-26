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
        var actions;
        (function (actions) {
            var Action = (function () {
                function Action() {
                }
                Object.defineProperty(Action.prototype, "name", {
                    get: function () {
                        return this.constructor.toString().match(/\w+/g)[1];
                    },
                    enumerable: true,
                    configurable: true
                });
                return Action;
            })();
            actions.Action = Action;
        })(actions = flux.actions || (flux.actions = {}));
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));

var ho;
(function (ho) {
    var flux;
    (function (flux) {
        var actions;
        (function (actions) {
            var Promise = ho.promise.Promise;
            actions.mapping = {};
            actions.useDir = true;
            var Registry = (function () {
                function Registry() {
                    this.actions = {};
                    this.actionLoader = new ho.classloader.ClassLoader({
                        urlTemplate: 'actions/${name}.js',
                        useDir: actions.useDir
                    });
                }
                Registry.prototype.register = function (action) {
                    this.actions[action.name] = action;
                    return action;
                };
                Registry.prototype.get = function (actionClass) {
                    var name = void 0;
                    if (typeof actionClass === 'string')
                        name = actionClass;
                    else
                        name = actionClass.toString().match(/\w+/g)[1];
                    return this.actions[name];
                };
                Registry.prototype.loadAction = function (name) {
                    var self = this;
                    if (!!this.actions[name])
                        return Promise.create(this.actions[name]);
                    return this.actionLoader.load({
                        name: name,
                        url: actions.mapping[name],
                        super: ["ho.flux.action.Action"]
                    })
                        .then(function (classes) {
                        classes.map(function (a) {
                            if (!self.get(a))
                                self.register(new a);
                        });
                        return self.get(classes.pop());
                    });
                };
                return Registry;
            })();
            actions.Registry = Registry;
        })(actions = flux.actions || (flux.actions = {}));
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
                    var cls = [];
                    if (!!this.stores[name])
                        return Promise.create(this.stores[name]);
                    return this.storeLoader.load({
                        name: name,
                        url: registry.mapping[name],
                        super: ["ho.flux.Store"]
                    })
                        .then(function (classes) {
                        cls = classes;
                        classes = classes.filter(function (c) {
                            return !self.get(c);
                        });
                        var promises = classes.map(function (c) {
                            return Promise.create(self.register(new c).init());
                        });
                        return Promise.all(promises);
                    })
                        .then(function (p) {
                        return self.get(cls.pop());
                    });
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
                this.actions = [];
                this.id = ho.flux.DISPATCHER.register(this.handle.bind(this));
                //ho.flux.STORES.register(this);
            }
            Store.prototype.init = function () {
                return ho.promise.Promise.all(this.actions.map(function (a) {
                    return ho.flux.ACTIONS.loadAction(a);
                }));
            };
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
        var Promise = ho.promise.Promise;
        flux.DISPATCHER = new flux.Dispatcher();
        flux.STORES = new flux.registry.Registry();
        flux.ACTIONS = new flux.actions.Registry();
        flux.dir = false;
        function run(router) {
            if (router === void 0) { router = flux.Router; }
            return new Promise(function (resolve, reject) {
                if (router === flux.Router)
                    resolve(new flux.Router());
                else if (typeof router === 'function')
                    resolve(new router());
                else if (typeof router === 'string') {
                    flux.STORES.loadStore(router)
                        .then(function (s) { return resolve(s); });
                }
            })
                .then(function (r) {
                return flux.STORES.register(r).init();
            });
        }
        flux.run = run;
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9oby9mbHV4L2NhbGxiYWNraG9sZGVyLnRzIiwic3JjL2hvL2ZsdXgvc3RhdGUudHMiLCJzcmMvaG8vZmx1eC9hY3Rpb25zL2FjdGlvbi50cyIsInNyYy9oby9mbHV4L2FjdGlvbnMvcmVnaXN0cnkudHMiLCJzcmMvaG8vZmx1eC9yZWdpc3RyeS9yZWdpc3RyeS50cyIsInNyYy9oby9mbHV4L3N0YXRlcHJvdmlkZXIvc3RhdGVwcm92aWRlci50cyIsInNyYy9oby9mbHV4L3N0b3JlLnRzIiwic3JjL2hvL2ZsdXgvcm91dGVyLnRzIiwic3JjL2hvL2ZsdXgvZGlzcGF0Y2hlci50cyIsInNyYy9oby9mbHV4L2ZsdXgudHMiXSwibmFtZXMiOlsiaG8iLCJoby5mbHV4IiwiaG8uZmx1eC5DYWxsYmFja0hvbGRlciIsImhvLmZsdXguQ2FsbGJhY2tIb2xkZXIuY29uc3RydWN0b3IiLCJoby5mbHV4LkNhbGxiYWNrSG9sZGVyLnJlZ2lzdGVyIiwiaG8uZmx1eC5DYWxsYmFja0hvbGRlci51bnJlZ2lzdGVyIiwiaG8uZmx1eC5hY3Rpb25zIiwiaG8uZmx1eC5hY3Rpb25zLkFjdGlvbiIsImhvLmZsdXguYWN0aW9ucy5BY3Rpb24uY29uc3RydWN0b3IiLCJoby5mbHV4LmFjdGlvbnMuQWN0aW9uLm5hbWUiLCJoby5mbHV4LmFjdGlvbnMuUmVnaXN0cnkiLCJoby5mbHV4LmFjdGlvbnMuUmVnaXN0cnkuY29uc3RydWN0b3IiLCJoby5mbHV4LmFjdGlvbnMuUmVnaXN0cnkucmVnaXN0ZXIiLCJoby5mbHV4LmFjdGlvbnMuUmVnaXN0cnkuZ2V0IiwiaG8uZmx1eC5hY3Rpb25zLlJlZ2lzdHJ5LmxvYWRBY3Rpb24iLCJoby5mbHV4LnJlZ2lzdHJ5IiwiaG8uZmx1eC5yZWdpc3RyeS5SZWdpc3RyeSIsImhvLmZsdXgucmVnaXN0cnkuUmVnaXN0cnkuY29uc3RydWN0b3IiLCJoby5mbHV4LnJlZ2lzdHJ5LlJlZ2lzdHJ5LnJlZ2lzdGVyIiwiaG8uZmx1eC5yZWdpc3RyeS5SZWdpc3RyeS5nZXQiLCJoby5mbHV4LnJlZ2lzdHJ5LlJlZ2lzdHJ5LmxvYWRTdG9yZSIsImhvLmZsdXguc3RhdGVwcm92aWRlciIsImhvLmZsdXguc3RhdGVwcm92aWRlci5TdGF0ZVByb3ZpZGVyIiwiaG8uZmx1eC5zdGF0ZXByb3ZpZGVyLlN0YXRlUHJvdmlkZXIuY29uc3RydWN0b3IiLCJoby5mbHV4LnN0YXRlcHJvdmlkZXIuU3RhdGVQcm92aWRlci5yZXNvbHZlIiwiaG8uZmx1eC5zdGF0ZXByb3ZpZGVyLlN0YXRlUHJvdmlkZXIuZ2V0U3RhdGVzIiwiaG8uZmx1eC5TdG9yZSIsImhvLmZsdXguU3RvcmUuY29uc3RydWN0b3IiLCJoby5mbHV4LlN0b3JlLmluaXQiLCJoby5mbHV4LlN0b3JlLm5hbWUiLCJoby5mbHV4LlN0b3JlLnJlZ2lzdGVyIiwiaG8uZmx1eC5TdG9yZS5vbiIsImhvLmZsdXguU3RvcmUuaGFuZGxlIiwiaG8uZmx1eC5TdG9yZS5jaGFuZ2VkIiwiaG8uZmx1eC5Sb3V0ZXIiLCJoby5mbHV4LlJvdXRlci5jb25zdHJ1Y3RvciIsImhvLmZsdXguUm91dGVyLmluaXQiLCJoby5mbHV4LlJvdXRlci5nbyIsImhvLmZsdXguUm91dGVyLmluaXRTdGF0ZXMiLCJoby5mbHV4LlJvdXRlci5nZXRTdGF0ZUZyb21OYW1lIiwiaG8uZmx1eC5Sb3V0ZXIub25TdGF0ZUNoYW5nZVJlcXVlc3RlZCIsImhvLmZsdXguUm91dGVyLm9uSGFzaENoYW5nZSIsImhvLmZsdXguUm91dGVyLnNldFVybCIsImhvLmZsdXguUm91dGVyLnJlZ2V4RnJvbVVybCIsImhvLmZsdXguUm91dGVyLmFyZ3NGcm9tVXJsIiwiaG8uZmx1eC5Sb3V0ZXIuc3RhdGVGcm9tVXJsIiwiaG8uZmx1eC5Sb3V0ZXIudXJsRnJvbVN0YXRlIiwiaG8uZmx1eC5Sb3V0ZXIuZXF1YWxzIiwiaG8uZmx1eC5EaXNwYXRjaGVyIiwiaG8uZmx1eC5EaXNwYXRjaGVyLmNvbnN0cnVjdG9yIiwiaG8uZmx1eC5EaXNwYXRjaGVyLndhaXRGb3IiLCJoby5mbHV4LkRpc3BhdGNoZXIuZGlzcGF0Y2giLCJoby5mbHV4LkRpc3BhdGNoZXIuaW52b2tlQ2FsbGJhY2siLCJoby5mbHV4LkRpc3BhdGNoZXIuc3RhcnREaXNwYXRjaGluZyIsImhvLmZsdXguRGlzcGF0Y2hlci5zdG9wRGlzcGF0Y2hpbmciLCJoby5mbHV4LnJ1biJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBTyxFQUFFLENBb0JSO0FBcEJELFdBQU8sRUFBRTtJQUFDQSxJQUFBQSxJQUFJQSxDQW9CYkE7SUFwQlNBLFdBQUFBLElBQUlBLEVBQUNBLENBQUNBO1FBRWZDO1lBQUFDO2dCQUVXQyxXQUFNQSxHQUFXQSxLQUFLQSxDQUFDQTtnQkFDcEJBLFdBQU1BLEdBQVdBLENBQUNBLENBQUNBO2dCQUN0QkEsY0FBU0EsR0FBNEJBLEVBQUVBLENBQUNBO1lBYW5EQSxDQUFDQTtZQVhPRCxpQ0FBUUEsR0FBZkEsVUFBZ0JBLFFBQWtCQSxFQUFFQSxJQUFVQTtnQkFDMUNFLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO2dCQUNyQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsR0FBR0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsUUFBUUEsQ0FBQ0E7Z0JBQzNEQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUNaQSxDQUFDQTtZQUVNRixtQ0FBVUEsR0FBakJBLFVBQWtCQSxFQUFFQTtnQkFDaEJHLEVBQUVBLENBQUFBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO29CQUMzQkEsTUFBTUEsdUNBQXVDQSxHQUFHQSxFQUFFQSxDQUFDQTtnQkFDakRBLE9BQU9BLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO1lBQzVCQSxDQUFDQTs7WUFDSkgscUJB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Q0FBV0EsVUFBQ0EsT0FBT0EsRUFBRUEsTUFBTUE7Z0JBQzVDQSxFQUFFQSxDQUFBQSxDQUFDQSxNQUFNQSxLQUFLQSxXQUFNQSxDQUFDQTtvQkFDcEJBLE9BQU9BLENBQUNBLElBQUlBLFdBQU1BLEVBQUVBLENBQUNBLENBQUNBO2dCQUN2QkEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsTUFBTUEsS0FBS0EsVUFBVUEsQ0FBQ0E7b0JBQ3BDQSxPQUFPQSxDQUFDQSxJQUFJQSxNQUFNQSxFQUFFQSxDQUFDQSxDQUFBQTtnQkFDdEJBLElBQUlBLENBQUNBLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLE1BQU1BLEtBQUtBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO29CQUNwQ0EsV0FBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0E7eUJBQ3ZCQSxJQUFJQSxDQUFDQSxVQUFBQSxDQUFDQSxJQUFJQSxPQUFBQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFWQSxDQUFVQSxDQUFDQSxDQUFBQTtnQkFDdkJBLENBQUNBO1lBQ0ZBLENBQUNBLENBQUNBO2lCQUNEQSxJQUFJQSxDQUFDQSxVQUFBQSxDQUFDQTtnQkFDTkEsTUFBTUEsQ0FBQ0EsV0FBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7WUFDbENBLENBQUNBLENBQUNBLENBQUNBO1FBRUpBLENBQUNBO1FBZmV0RCxRQUFHQSxNQWVsQkEsQ0FBQUE7SUFDRkEsQ0FBQ0EsRUE1QlNELElBQUlBLEdBQUpBLE9BQUlBLEtBQUpBLE9BQUlBLFFBNEJiQTtBQUFEQSxDQUFDQSxFQTVCTSxFQUFFLEtBQUYsRUFBRSxRQTRCUiIsImZpbGUiOiJmbHV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlIGhvLmZsdXgge1xyXG5cclxuXHRleHBvcnQgY2xhc3MgQ2FsbGJhY2tIb2xkZXIge1xyXG5cclxuXHRcdHByb3RlY3RlZCBwcmVmaXg6IHN0cmluZyA9ICdJRF8nO1xyXG4gICAgXHRwcm90ZWN0ZWQgbGFzdElEOiBudW1iZXIgPSAxO1xyXG5cdFx0cHJvdGVjdGVkIGNhbGxiYWNrczoge1trZXk6c3RyaW5nXTpGdW5jdGlvbn0gPSB7fTtcclxuXHJcblx0XHRwdWJsaWMgcmVnaXN0ZXIoY2FsbGJhY2s6IEZ1bmN0aW9uLCBzZWxmPzogYW55KTogc3RyaW5nIHtcclxuICAgIFx0XHRsZXQgaWQgPSB0aGlzLnByZWZpeCArIHRoaXMubGFzdElEKys7XHJcbiAgICBcdFx0dGhpcy5jYWxsYmFja3NbaWRdID0gc2VsZiA/IGNhbGxiYWNrLmJpbmQoc2VsZikgOiBjYWxsYmFjaztcclxuICAgIFx0XHRyZXR1cm4gaWQ7XHJcbiAgXHRcdH1cclxuXHJcbiAgXHRcdHB1YmxpYyB1bnJlZ2lzdGVyKGlkKSB7XHJcbiAgICAgIFx0XHRpZighdGhpcy5jYWxsYmFja3NbaWRdKVxyXG5cdFx0XHRcdHRocm93ICdDb3VsZCBub3QgdW5yZWdpc3RlciBjYWxsYmFjayBmb3IgaWQgJyArIGlkO1xyXG4gICAgXHRcdGRlbGV0ZSB0aGlzLmNhbGxiYWNrc1tpZF07XHJcbiAgXHRcdH07XHJcblx0fVxyXG59XHJcbiIsIlxyXG5tb2R1bGUgaG8uZmx1eCB7XHJcblx0aW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XHJcblxyXG5cclxuXHRleHBvcnQgaW50ZXJmYWNlIElTdGF0ZSB7XHJcblx0XHRuYW1lOiBzdHJpbmc7XHJcblx0XHR1cmw6IHN0cmluZztcclxuXHRcdHJlZGlyZWN0Pzogc3RyaW5nO1xyXG5cdFx0YmVmb3JlPzogKGRhdGE6IElSb3V0ZURhdGEpPT5Qcm9taXNlPGFueSwgYW55PjtcclxuXHRcdHZpZXc/OiBBcnJheTxJVmlld1N0YXRlPjtcclxuXHR9XHJcblxyXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVZpZXdTdGF0ZSB7XHJcblx0ICAgIG5hbWU6IHN0cmluZztcclxuXHRcdGh0bWw6IHN0cmluZztcclxuXHR9XHJcblxyXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVN0YXRlcyB7XHJcblx0ICAgIHN0YXRlczogQXJyYXk8SVN0YXRlPjtcclxuXHR9XHJcblxyXG59XHJcbiIsIm1vZHVsZSBoby5mbHV4LmFjdGlvbnMge1xuXHRleHBvcnQgY2xhc3MgQWN0aW9uIHtcblxuXHRcdGdldCBuYW1lKCk6IHN0cmluZyB7XG5cdFx0ICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcblx0ICAgfVxuXHQgICBcblx0fVxufVxuIiwiXHJcbm1vZHVsZSBoby5mbHV4LmFjdGlvbnMge1xyXG5cdGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuXHRleHBvcnQgbGV0IG1hcHBpbmc6IHtba2V5OnN0cmluZ106c3RyaW5nfSA9IHt9O1xyXG5cdGV4cG9ydCBsZXQgdXNlRGlyID0gdHJ1ZTtcclxuXHJcblx0ZXhwb3J0IGNsYXNzIFJlZ2lzdHJ5IHtcclxuXHJcblx0XHRwcml2YXRlIGFjdGlvbnM6IHtba2V5OiBzdHJpbmddOiBBY3Rpb259ID0ge307XHJcblxyXG5cdFx0cHJpdmF0ZSBhY3Rpb25Mb2FkZXIgPSBuZXcgaG8uY2xhc3Nsb2FkZXIuQ2xhc3NMb2FkZXIoe1xyXG4gICAgICAgICAgIHVybFRlbXBsYXRlOiAnYWN0aW9ucy8ke25hbWV9LmpzJyxcclxuICAgICAgICAgICB1c2VEaXJcclxuICAgICAgIH0pO1xyXG5cclxuXHRcdHB1YmxpYyByZWdpc3RlcihhY3Rpb246IEFjdGlvbik6IEFjdGlvbiB7XHJcblx0XHRcdHRoaXMuYWN0aW9uc1thY3Rpb24ubmFtZV0gPSBhY3Rpb247XHJcblx0XHRcdHJldHVybiBhY3Rpb247XHJcblx0XHR9XHJcblxyXG5cdFx0cHVibGljIGdldChhY3Rpb25DbGFzczogc3RyaW5nKTogU3RvcmU8YW55PlxyXG5cdFx0cHVibGljIGdldDxUIGV4dGVuZHMgQWN0aW9uPihhY3Rpb25DbGFzczoge25ldygpOlR9KTogVFxyXG5cdFx0cHVibGljIGdldDxUIGV4dGVuZHMgQWN0aW9uPihhY3Rpb25DbGFzczogYW55KTogVCB7XHJcblx0XHRcdGxldCBuYW1lID0gdm9pZCAwO1xyXG5cdFx0XHRpZih0eXBlb2YgYWN0aW9uQ2xhc3MgPT09ICdzdHJpbmcnKVxyXG5cdFx0XHRcdG5hbWUgPSBhY3Rpb25DbGFzcztcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdG5hbWUgPSBhY3Rpb25DbGFzcy50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xyXG5cdFx0XHRyZXR1cm4gPFQ+dGhpcy5hY3Rpb25zW25hbWVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdHB1YmxpYyBsb2FkQWN0aW9uKG5hbWU6IHN0cmluZyk6IFByb21pc2U8QWN0aW9uLCBzdHJpbmc+IHtcclxuXHJcblx0XHRcdGxldCBzZWxmID0gdGhpcztcclxuXHJcblx0XHRcdGlmKCEhdGhpcy5hY3Rpb25zW25hbWVdKVxyXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLmNyZWF0ZSh0aGlzLmFjdGlvbnNbbmFtZV0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWN0aW9uTG9hZGVyLmxvYWQoe1xyXG4gICAgICAgICAgICAgICAgbmFtZSxcclxuXHRcdFx0XHR1cmw6IG1hcHBpbmdbbmFtZV0sXHJcbiAgICAgICAgICAgICAgICBzdXBlcjogW1wiaG8uZmx1eC5hY3Rpb24uQWN0aW9uXCJdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChjbGFzc2VzOiBBcnJheTx0eXBlb2YgQWN0aW9uPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2xhc3Nlcy5tYXAoYSA9PiB7XHJcblx0XHRcdFx0XHRpZighc2VsZi5nZXQoYSkpXHJcblx0XHRcdFx0XHRcdHNlbGYucmVnaXN0ZXIobmV3IGEpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5nZXQoY2xhc3Nlcy5wb3AoKSk7XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG59XHJcbiIsIlxyXG5tb2R1bGUgaG8uZmx1eC5yZWdpc3RyeSB7XHJcblx0aW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XHJcblxyXG5cdGV4cG9ydCBsZXQgbWFwcGluZzoge1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge307XHJcblx0ZXhwb3J0IGxldCB1c2VEaXIgPSB0cnVlO1xyXG5cclxuXHRleHBvcnQgY2xhc3MgUmVnaXN0cnkge1xyXG5cclxuXHRcdHByaXZhdGUgc3RvcmVzOiB7W2tleTogc3RyaW5nXTogU3RvcmU8YW55Pn0gPSB7fTtcclxuXHJcblx0XHRwcml2YXRlIHN0b3JlTG9hZGVyID0gbmV3IGhvLmNsYXNzbG9hZGVyLkNsYXNzTG9hZGVyKHtcclxuICAgICAgICAgICB1cmxUZW1wbGF0ZTogJ3N0b3Jlcy8ke25hbWV9LmpzJyxcclxuICAgICAgICAgICB1c2VEaXJcclxuICAgICAgIH0pO1xyXG5cclxuXHRcdHB1YmxpYyByZWdpc3RlcihzdG9yZTogU3RvcmU8YW55Pik6IFN0b3JlPGFueT4ge1xyXG5cdFx0XHR0aGlzLnN0b3Jlc1tzdG9yZS5uYW1lXSA9IHN0b3JlO1xyXG5cdFx0XHRyZXR1cm4gc3RvcmU7XHJcblx0XHR9XHJcblxyXG5cdFx0cHVibGljIGdldChzdG9yZUNsYXNzOiBzdHJpbmcpOiBTdG9yZTxhbnk+XHJcblx0XHRwdWJsaWMgZ2V0PFQgZXh0ZW5kcyBTdG9yZTxhbnk+PihzdG9yZUNsYXNzOiB7bmV3KCk6VH0pOiBUXHJcblx0XHRwdWJsaWMgZ2V0PFQgZXh0ZW5kcyBTdG9yZTxhbnk+PihzdG9yZUNsYXNzOiBhbnkpOiBUIHtcclxuXHRcdFx0bGV0IG5hbWUgPSB2b2lkIDA7XHJcblx0XHRcdGlmKHR5cGVvZiBzdG9yZUNsYXNzID09PSAnc3RyaW5nJylcclxuXHRcdFx0XHRuYW1lID0gc3RvcmVDbGFzcztcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdG5hbWUgPSBzdG9yZUNsYXNzLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XHJcblx0XHRcdHJldHVybiA8VD50aGlzLnN0b3Jlc1tuYW1lXTtcclxuXHRcdH1cclxuXHJcblx0XHRwdWJsaWMgbG9hZFN0b3JlKG5hbWU6IHN0cmluZyk6IFByb21pc2U8U3RvcmU8YW55Piwgc3RyaW5nPiB7XHJcblxyXG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XHJcblx0XHRcdGxldCBjbHM6IEFycmF5PHR5cGVvZiBTdG9yZT4gPSBbXTtcclxuXHJcblx0XHRcdGlmKCEhdGhpcy5zdG9yZXNbbmFtZV0pXHJcblx0XHRcdFx0cmV0dXJuIFByb21pc2UuY3JlYXRlKHRoaXMuc3RvcmVzW25hbWVdKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0b3JlTG9hZGVyLmxvYWQoe1xyXG4gICAgICAgICAgICAgICAgbmFtZSxcclxuXHRcdFx0XHR1cmw6IG1hcHBpbmdbbmFtZV0sXHJcbiAgICAgICAgICAgICAgICBzdXBlcjogW1wiaG8uZmx1eC5TdG9yZVwiXVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoY2xhc3NlczogQXJyYXk8dHlwZW9mIFN0b3JlPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2xzID0gY2xhc3NlcztcclxuXHRcdFx0XHRjbGFzc2VzID0gY2xhc3Nlcy5maWx0ZXIoYyA9PiB7XHJcblx0XHRcdFx0XHRyZXR1cm4gIXNlbGYuZ2V0KGMpO1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRsZXQgcHJvbWlzZXMgPSAgY2xhc3Nlcy5tYXAoYyA9PiB7XHJcblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5jcmVhdGUoc2VsZi5yZWdpc3RlcihuZXcgYykuaW5pdCgpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XHJcbiAgICAgICAgICAgIH0pXHJcblx0XHRcdC50aGVuKHAgPT4ge1xyXG5cdFx0XHRcdHJldHVybiBzZWxmLmdldChjbHMucG9wKCkpO1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxufVxyXG4iLCJcclxubW9kdWxlIGhvLmZsdXguc3RhdGVwcm92aWRlciB7XHJcblx0aW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJU3RhdGVQcm92aWRlciB7XHJcbiAgICAgICAgdXNlTWluOmJvb2xlYW47XHJcblx0XHRyZXNvbHZlKCk6IHN0cmluZztcclxuXHRcdGdldFN0YXRlcyhuYW1lPzpzdHJpbmcpOiBQcm9taXNlPElTdGF0ZXMsIHN0cmluZz47XHJcbiAgICB9XHJcblxyXG5cdGNsYXNzIFN0YXRlUHJvdmlkZXIgaW1wbGVtZW50cyBJU3RhdGVQcm92aWRlciB7XHJcblxyXG4gICAgICAgIHVzZU1pbjogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICByZXNvbHZlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVzZU1pbiA/XHJcbiAgICAgICAgICAgICAgICBgc3RhdGVzLm1pbi5qc2AgOlxyXG4gICAgICAgICAgICAgICAgYHN0YXRlcy5qc2A7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXRTdGF0ZXMobmFtZSA9IFwiU3RhdGVzXCIpOiBQcm9taXNlPElTdGF0ZXMsIHN0cmluZz4ge1xyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2U8SVN0YXRlcywgYW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblx0XHRcdFx0bGV0IHNyYyA9IHRoaXMucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xyXG4gICAgICAgICAgICAgICAgc2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IHdpbmRvd1tuYW1lXSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cdFx0XHRcdHNjcmlwdC5vbmVycm9yID0gKGUpID0+IHtcclxuXHRcdFx0XHRcdHJlamVjdChlKTtcclxuXHRcdFx0XHR9O1xyXG4gICAgICAgICAgICAgICAgc2NyaXB0LnNyYyA9IHNyYztcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGxldCBpbnN0YW5jZTogSVN0YXRlUHJvdmlkZXIgPSBuZXcgU3RhdGVQcm92aWRlcigpO1xyXG59XHJcbiIsIlxyXG5tb2R1bGUgaG8uZmx1eCB7XHJcblxyXG5cdGV4cG9ydCBjbGFzcyBTdG9yZTxUPiBleHRlbmRzIENhbGxiYWNrSG9sZGVyIHtcclxuXHJcblx0XHRwcm90ZWN0ZWQgZGF0YTogVDtcclxuXHRcdHByaXZhdGUgaWQ6IHN0cmluZztcclxuXHRcdHByaXZhdGUgaGFuZGxlcnM6IHtba2V5OiBzdHJpbmddOiBGdW5jdGlvbn0gPSB7fTtcclxuXHRcdHByb3RlY3RlZCBhY3Rpb25zOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0XHRzdXBlcigpO1xyXG5cdFx0XHR0aGlzLmlkID0gaG8uZmx1eC5ESVNQQVRDSEVSLnJlZ2lzdGVyKHRoaXMuaGFuZGxlLmJpbmQodGhpcykpO1xyXG5cdFx0XHQvL2hvLmZsdXguU1RPUkVTLnJlZ2lzdGVyKHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHB1YmxpYyBpbml0KCk6IGhvLnByb21pc2UuUHJvbWlzZTxhbnksIGFueT4ge1xyXG5cdFx0XHRyZXR1cm4gaG8ucHJvbWlzZS5Qcm9taXNlLmFsbCh0aGlzLmFjdGlvbnMubWFwKGE9PntcclxuXHRcdFx0XHRyZXR1cm4gaG8uZmx1eC5BQ1RJT05TLmxvYWRBY3Rpb24oYSk7XHJcblx0XHRcdH0pKTtcclxuXHRcdH1cclxuXHJcblx0XHQgZ2V0IG5hbWUoKTogc3RyaW5nIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcclxuXHRcdH1cclxuXHJcblx0XHRwdWJsaWMgcmVnaXN0ZXIoY2FsbGJhY2s6IChkYXRhOlQpPT52b2lkLCBzZWxmPzphbnkpOiBzdHJpbmcge1xyXG5cdFx0XHRyZXR1cm4gc3VwZXIucmVnaXN0ZXIoY2FsbGJhY2ssIHNlbGYpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHByb3RlY3RlZCBvbih0eXBlOiBzdHJpbmcsIGZ1bmM6IEZ1bmN0aW9uKTogdm9pZCB7XHJcblx0XHRcdHRoaXMuaGFuZGxlcnNbdHlwZV0gPSBmdW5jO1xyXG5cdFx0fVxyXG5cclxuXHRcdHByb3RlY3RlZCBoYW5kbGUoYWN0aW9uOiBJQWN0aW9uKTogdm9pZCB7XHJcblx0XHRcdGlmKHR5cGVvZiB0aGlzLmhhbmRsZXJzW2FjdGlvbi50eXBlXSA9PT0gJ2Z1bmN0aW9uJylcclxuXHRcdFx0XHR0aGlzLmhhbmRsZXJzW2FjdGlvbi50eXBlXShhY3Rpb24uZGF0YSk7XHJcblx0XHR9O1xyXG5cclxuXHJcblx0XHRwcm90ZWN0ZWQgY2hhbmdlZCgpOiB2b2lkIHtcclxuXHRcdFx0Zm9yIChsZXQgaWQgaW4gdGhpcy5jYWxsYmFja3MpIHtcclxuXHRcdFx0ICBsZXQgY2IgPSB0aGlzLmNhbGxiYWNrc1tpZF07XHJcblx0XHRcdCAgaWYoY2IpXHJcblx0XHRcdCAgXHRjYih0aGlzLmRhdGEpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cclxuXHR9O1xyXG5cclxuXHJcbn1cclxuIiwiXHJcblxyXG5tb2R1bGUgaG8uZmx1eCB7XHJcblxyXG5cdGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuXHJcblx0LyoqIERhdGEgdGhhdCBhIFJvdXRlciNnbyB0YWtlcyAqL1xyXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVJvdXRlRGF0YSB7XHJcblx0ICAgIHN0YXRlOiBzdHJpbmc7XHJcblx0XHRhcmdzOiBhbnk7XHJcblx0XHRleHRlcm46IGJvb2xlYW47XHJcblx0fVxyXG5cclxuXHQvKiogRGF0YSB0aGF0IFJvdXRlciNjaGFuZ2VzIGVtaXQgdG8gaXRzIGxpc3RlbmVycyAqL1xyXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVJvdXRlckRhdGEge1xyXG5cdCAgICBzdGF0ZTogSVN0YXRlO1xyXG5cdFx0YXJnczogYW55O1xyXG5cdFx0ZXh0ZXJuOiBib29sZWFuO1xyXG5cdH1cclxuXHJcblx0ZXhwb3J0IGNsYXNzIFJvdXRlciBleHRlbmRzIFN0b3JlPElSb3V0ZXJEYXRhPiB7XHJcblxyXG5cdFx0cHJpdmF0ZSBtYXBwaW5nOkFycmF5PElTdGF0ZT4gPSBudWxsO1xyXG5cclxuXHRcdHB1YmxpYyBpbml0KCk6IFByb21pc2U8YW55LCBhbnk+IHtcclxuXHRcdFx0dGhpcy5vbignU1RBVEUnLCB0aGlzLm9uU3RhdGVDaGFuZ2VSZXF1ZXN0ZWQuYmluZCh0aGlzKSk7XHJcblxyXG5cdFx0XHRsZXQgb25IYXNoQ2hhbmdlID0gdGhpcy5vbkhhc2hDaGFuZ2UuYmluZCh0aGlzKTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzLmluaXRTdGF0ZXMoKVxyXG5cdFx0XHQudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0d2luZG93Lm9uaGFzaGNoYW5nZSA9IG9uSGFzaENoYW5nZTtcclxuXHRcdFx0XHRvbkhhc2hDaGFuZ2UoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cHVibGljIGdvKHN0YXRlOiBzdHJpbmcsIGRhdGE/OiBhbnkpOiB2b2lkXHJcblx0XHRwdWJsaWMgZ28oZGF0YTogSVJvdXRlRGF0YSk6IHZvaWRcclxuXHRcdHB1YmxpYyBnbyhkYXRhOiBJUm91dGVEYXRhIHwgc3RyaW5nLCBhcmdzPzogYW55KTogdm9pZCB7XHJcblxyXG5cdFx0XHRsZXQgX2RhdGE6IElSb3V0ZURhdGEgPSB7XHJcblx0XHRcdFx0c3RhdGU6IHVuZGVmaW5lZCxcclxuXHRcdFx0XHRhcmdzOiB1bmRlZmluZWQsXHJcblx0XHRcdFx0ZXh0ZXJuOiBmYWxzZVxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0aWYodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdFx0X2RhdGEuc3RhdGUgPSBkYXRhO1xyXG5cdFx0XHRcdF9kYXRhLmFyZ3MgPSBhcmdzO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdF9kYXRhLnN0YXRlID0gZGF0YS5zdGF0ZTtcclxuXHRcdFx0XHRfZGF0YS5hcmdzID0gZGF0YS5hcmdzO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRoby5mbHV4LkRJU1BBVENIRVIuZGlzcGF0Y2goe1xyXG5cdFx0XHRcdHR5cGU6ICdTVEFURScsXHJcblx0XHRcdFx0ZGF0YTogX2RhdGFcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJpdmF0ZSBpbml0U3RhdGVzKCk6IFByb21pc2U8YW55LCBhbnk+IHtcclxuXHRcdFx0cmV0dXJuIHN0YXRlcHJvdmlkZXIuaW5zdGFuY2UuZ2V0U3RhdGVzKClcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oaXN0YXRlcykge1xyXG5cdFx0XHRcdHRoaXMubWFwcGluZyA9IGlzdGF0ZXMuc3RhdGVzO1xyXG5cdFx0XHR9LmJpbmQodGhpcykpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgZ2V0U3RhdGVGcm9tTmFtZShuYW1lOiBzdHJpbmcpOiBJU3RhdGUge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5tYXBwaW5nLmZpbHRlcigocyk9PntcclxuXHRcdFx0XHRyZXR1cm4gcy5uYW1lID09PSBuYW1lXHJcblx0XHRcdH0pWzBdO1xyXG5cdFx0fVxyXG5cclxuXHRcdHByb3RlY3RlZCBvblN0YXRlQ2hhbmdlUmVxdWVzdGVkKGRhdGE6IElSb3V0ZURhdGEpOiB2b2lkIHtcclxuXHRcdFx0Ly9nZXQgcmVxdWVzdGVkIHN0YXRlXHJcblx0XHRcdGxldCBzdGF0ZSA9IHRoaXMuZ2V0U3RhdGVGcm9tTmFtZShkYXRhLnN0YXRlKTtcclxuXHRcdFx0bGV0IHVybCA9IHRoaXMudXJsRnJvbVN0YXRlKHN0YXRlLnVybCwgZGF0YS5hcmdzKTtcclxuXHJcblx0XHRcdC8vY3VycmVudCBzdGF0ZSBhbmQgYXJncyBlcXVhbHMgcmVxdWVzdGVkIHN0YXRlIGFuZCBhcmdzIC0+IHJldHVyblxyXG5cdFx0XHRpZihcclxuXHRcdFx0XHR0aGlzLmRhdGEgJiZcclxuXHRcdFx0XHR0aGlzLmRhdGEuc3RhdGUgJiZcclxuXHRcdFx0XHR0aGlzLmRhdGEuc3RhdGUubmFtZSA9PT0gZGF0YS5zdGF0ZSAmJlxyXG5cdFx0XHRcdHRoaXMuZXF1YWxzKHRoaXMuZGF0YS5hcmdzLCBkYXRhLmFyZ3MpICYmXHJcblx0XHRcdFx0dXJsID09PSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSlcclxuXHRcdFx0KSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cclxuXHJcblx0XHRcdC8vcmVxdWVzdGVkIHN0YXRlIGhhcyBhbiByZWRpcmVjdCBwcm9wZXJ0eSAtPiBjYWxsIHJlZGlyZWN0IHN0YXRlXHJcblx0XHRcdGlmKCEhc3RhdGUucmVkaXJlY3QpIHtcclxuXHRcdFx0XHRzdGF0ZSA9IHRoaXMuZ2V0U3RhdGVGcm9tTmFtZShzdGF0ZS5yZWRpcmVjdCk7XHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHRsZXQgcHJvbSA9IHR5cGVvZiBzdGF0ZS5iZWZvcmUgPT09ICdmdW5jdGlvbicgPyBzdGF0ZS5iZWZvcmUoZGF0YSkgOiBQcm9taXNlLmNyZWF0ZSh1bmRlZmluZWQpO1xyXG5cdFx0XHRwcm9tXHJcblx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdFx0XHQvL2RvZXMgdGhlIHN0YXRlIGNoYW5nZSByZXF1ZXN0IGNvbWVzIGZyb20gZXh0ZXJuIGUuZy4gdXJsIGNoYW5nZSBpbiBicm93c2VyIHdpbmRvdyA/XHJcblx0XHRcdFx0bGV0IGV4dGVybiA9ICEhIGRhdGEuZXh0ZXJuO1xyXG5cclxuXHRcdFx0XHR0aGlzLmRhdGEgPSB7XHJcblx0XHRcdFx0XHRzdGF0ZTogc3RhdGUsXHJcblx0XHRcdFx0XHRhcmdzOiBkYXRhLmFyZ3MsXHJcblx0XHRcdFx0XHRleHRlcm46IGV4dGVybixcclxuXHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHQvLy0tLS0tLS0gc2V0IHVybCBmb3IgYnJvd3NlclxyXG5cdFx0XHRcdHZhciB1cmwgPSB0aGlzLnVybEZyb21TdGF0ZShzdGF0ZS51cmwsIGRhdGEuYXJncyk7XHJcblx0XHRcdFx0dGhpcy5zZXRVcmwodXJsKTtcclxuXHJcblx0XHRcdFx0dGhpcy5jaGFuZ2VkKCk7XHJcblxyXG5cdFx0XHR9LmJpbmQodGhpcyksXHJcblx0XHRcdGZ1bmN0aW9uKGRhdGEpIHtcclxuXHRcdFx0XHR0aGlzLm9uU3RhdGVDaGFuZ2VSZXF1ZXN0ZWQoZGF0YSk7XHJcblx0XHRcdH0uYmluZCh0aGlzKSk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgb25IYXNoQ2hhbmdlKCk6IHZvaWQge1xyXG5cdFx0XHRsZXQgcyA9IHRoaXMuc3RhdGVGcm9tVXJsKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigxKSk7XHJcblxyXG5cdFx0XHRoby5mbHV4LkRJU1BBVENIRVIuZGlzcGF0Y2goe1xyXG5cdFx0XHRcdHR5cGU6ICdTVEFURScsXHJcblx0XHRcdFx0ZGF0YToge1xyXG5cdFx0XHRcdFx0c3RhdGU6IHMuc3RhdGUsXHJcblx0XHRcdFx0XHRhcmdzOiBzLmFyZ3MsXHJcblx0XHRcdFx0XHRleHRlcm46IHRydWUsXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRwcml2YXRlIHNldFVybCh1cmw6IHN0cmluZyk6IHZvaWQge1xyXG5cdFx0XHRpZih3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSkgPT09IHVybClcclxuXHRcdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0XHRsZXQgbCA9IHdpbmRvdy5vbmhhc2hjaGFuZ2U7XHJcblx0XHRcdHdpbmRvdy5vbmhhc2hjaGFuZ2UgPSBudWxsO1xyXG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IHVybDtcclxuXHRcdFx0d2luZG93Lm9uaGFzaGNoYW5nZSA9IGw7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJpdmF0ZSByZWdleEZyb21VcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0XHR2YXIgcmVnZXggPSAvOihbXFx3XSspLztcclxuXHRcdFx0d2hpbGUodXJsLm1hdGNoKHJlZ2V4KSkge1xyXG5cdFx0XHRcdHVybCA9IHVybC5yZXBsYWNlKHJlZ2V4LCBcIihbXlxcL10rKVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdXJsKyckJztcclxuXHRcdH1cclxuXHJcblx0XHRwcml2YXRlIGFyZ3NGcm9tVXJsKHBhdHRlcm46IHN0cmluZywgdXJsOiBzdHJpbmcpOiBhbnkge1xyXG5cdFx0XHRsZXQgciA9IHRoaXMucmVnZXhGcm9tVXJsKHBhdHRlcm4pO1xyXG5cdFx0XHRsZXQgbmFtZXMgPSBwYXR0ZXJuLm1hdGNoKHIpLnNsaWNlKDEpO1xyXG5cdFx0XHRsZXQgdmFsdWVzID0gdXJsLm1hdGNoKHIpLnNsaWNlKDEpO1xyXG5cclxuXHRcdFx0bGV0IGFyZ3MgPSB7fTtcclxuXHRcdFx0bmFtZXMuZm9yRWFjaChmdW5jdGlvbihuYW1lLCBpKSB7XHJcblx0XHRcdFx0YXJnc1tuYW1lLnN1YnN0cigxKV0gPSB2YWx1ZXNbaV07XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmV0dXJuIGFyZ3M7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJpdmF0ZSBzdGF0ZUZyb21VcmwodXJsOiBzdHJpbmcpOiBJUm91dGVEYXRhIHtcclxuXHRcdFx0dmFyIHMgPSB2b2lkIDA7XHJcblx0XHRcdHRoaXMubWFwcGluZy5mb3JFYWNoKChzdGF0ZTogSVN0YXRlKSA9PiB7XHJcblx0XHRcdFx0aWYocylcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHJcblx0XHRcdFx0dmFyIHIgPSB0aGlzLnJlZ2V4RnJvbVVybChzdGF0ZS51cmwpO1xyXG5cdFx0XHRcdGlmKHVybC5tYXRjaChyKSkge1xyXG5cdFx0XHRcdFx0dmFyIGFyZ3MgPSB0aGlzLmFyZ3NGcm9tVXJsKHN0YXRlLnVybCwgdXJsKTtcclxuXHRcdFx0XHRcdHMgPSB7XHJcblx0XHRcdFx0XHRcdFwic3RhdGVcIjogc3RhdGUubmFtZSxcclxuXHRcdFx0XHRcdFx0XCJhcmdzXCI6IGFyZ3MsXHJcblx0XHRcdFx0XHRcdFwiZXh0ZXJuXCI6IGZhbHNlXHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRpZighcylcclxuXHRcdFx0XHR0aHJvdyBcIk5vIFN0YXRlIGZvdW5kIGZvciB1cmwgXCIrdXJsO1xyXG5cclxuXHRcdFx0cmV0dXJuIHM7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJpdmF0ZSB1cmxGcm9tU3RhdGUodXJsOiBzdHJpbmcsIGFyZ3M6IGFueSk6IHN0cmluZyB7XHJcblx0XHRcdGxldCByZWdleCA9IC86KFtcXHddKykvO1xyXG5cdFx0XHR3aGlsZSh1cmwubWF0Y2gocmVnZXgpKSB7XHJcblx0XHRcdFx0dXJsID0gdXJsLnJlcGxhY2UocmVnZXgsIGZ1bmN0aW9uKG0pIHtcclxuXHRcdFx0XHRcdHJldHVybiBhcmdzW20uc3Vic3RyKDEpXTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdXJsO1xyXG5cdFx0fVxyXG5cclxuXHRcdHByaXZhdGUgZXF1YWxzKG8xOiBhbnksIG8yOiBhbnkpIDogYm9vbGVhbiB7XHJcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShvMSkgPT09IEpTT04uc3RyaW5naWZ5KG8yKTtcclxuXHRcdH1cclxuXHJcblx0fVxyXG59XHJcbiIsIlxyXG5tb2R1bGUgaG8uZmx1eCB7XHJcblxyXG5cdGV4cG9ydCBpbnRlcmZhY2UgSUFjdGlvbiB7XHJcblx0ICAgIHR5cGU6c3RyaW5nO1xyXG5cdFx0ZGF0YT86YW55O1xyXG5cdH1cclxuXHJcblx0ZXhwb3J0IGNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBDYWxsYmFja0hvbGRlciB7XHJcblxyXG4gICAgXHRwcml2YXRlIGlzUGVuZGluZzoge1trZXk6c3RyaW5nXTpib29sZWFufSA9IHt9O1xyXG4gICAgXHRwcml2YXRlIGlzSGFuZGxlZDoge1trZXk6c3RyaW5nXTpib29sZWFufSA9IHt9O1xyXG4gICAgXHRwcml2YXRlIGlzRGlzcGF0Y2hpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIFx0cHJpdmF0ZSBwZW5kaW5nUGF5bG9hZDogSUFjdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0cHVibGljIHdhaXRGb3IoLi4uaWRzOiBBcnJheTxudW1iZXI+KTogdm9pZCB7XHJcblx0XHRcdGlmKCF0aGlzLmlzRGlzcGF0Y2hpbmcpXHJcblx0XHQgIFx0XHR0aHJvdyAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IE11c3QgYmUgaW52b2tlZCB3aGlsZSBkaXNwYXRjaGluZy4nO1xyXG5cclxuXHRcdFx0Zm9yIChsZXQgaWkgPSAwOyBpaSA8IGlkcy5sZW5ndGg7IGlpKyspIHtcclxuXHRcdFx0ICBsZXQgaWQgPSBpZHNbaWldO1xyXG5cclxuXHRcdFx0ICBpZiAodGhpcy5pc1BlbmRpbmdbaWRdKSB7XHJcblx0XHQgICAgICBcdGlmKCF0aGlzLmlzSGFuZGxlZFtpZF0pXHJcblx0XHRcdCAgICAgIFx0dGhyb3cgYHdhaXRGb3IoLi4uKTogQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZCB3aGlsZSB3YXRpbmcgZm9yICR7aWR9YDtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0ICB9XHJcblxyXG5cdFx0XHQgIGlmKCF0aGlzLmNhbGxiYWNrc1tpZF0pXHJcblx0XHRcdCAgXHR0aHJvdyBgd2FpdEZvciguLi4pOiAke2lkfSBkb2VzIG5vdCBtYXAgdG8gYSByZWdpc3RlcmVkIGNhbGxiYWNrLmA7XHJcblxyXG5cdFx0XHQgIHRoaXMuaW52b2tlQ2FsbGJhY2soaWQpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdHB1YmxpYyBkaXNwYXRjaChhY3Rpb246IElBY3Rpb24pIHtcclxuXHRcdFx0aWYodGhpcy5pc0Rpc3BhdGNoaW5nKVxyXG5cdFx0ICAgIFx0dGhyb3cgJ0Nhbm5vdCBkaXNwYXRjaCBpbiB0aGUgbWlkZGxlIG9mIGEgZGlzcGF0Y2guJztcclxuXHJcblx0XHRcdHRoaXMuc3RhcnREaXNwYXRjaGluZyhhY3Rpb24pO1xyXG5cclxuXHRcdCAgICB0cnkge1xyXG5cdFx0ICAgICAgZm9yIChsZXQgaWQgaW4gdGhpcy5jYWxsYmFja3MpIHtcclxuXHRcdCAgICAgICAgaWYgKHRoaXMuaXNQZW5kaW5nW2lkXSkge1xyXG5cdFx0ICAgICAgICAgIGNvbnRpbnVlO1xyXG5cdFx0ICAgICAgICB9XHJcblx0XHQgICAgICAgIHRoaXMuaW52b2tlQ2FsbGJhY2soaWQpO1xyXG5cdFx0ICAgICAgfVxyXG5cdFx0ICAgIH0gZmluYWxseSB7XHJcblx0XHQgICAgICB0aGlzLnN0b3BEaXNwYXRjaGluZygpO1xyXG5cdFx0ICAgIH1cclxuXHRcdH07XHJcblxyXG5cdCAgXHRwcml2YXRlIGludm9rZUNhbGxiYWNrKGlkOiBudW1iZXIpOiB2b2lkIHtcclxuXHQgICAgXHR0aGlzLmlzUGVuZGluZ1tpZF0gPSB0cnVlO1xyXG5cdCAgICBcdHRoaXMuY2FsbGJhY2tzW2lkXSh0aGlzLnBlbmRpbmdQYXlsb2FkKTtcclxuXHQgICAgXHR0aGlzLmlzSGFuZGxlZFtpZF0gPSB0cnVlO1xyXG5cdCAgXHR9XHJcblxyXG5cdCAgXHRwcml2YXRlIHN0YXJ0RGlzcGF0Y2hpbmcocGF5bG9hZDogSUFjdGlvbik6IHZvaWQge1xyXG5cdCAgICBcdGZvciAobGV0IGlkIGluIHRoaXMuY2FsbGJhY2tzKSB7XHJcblx0ICAgICAgXHRcdHRoaXMuaXNQZW5kaW5nW2lkXSA9IGZhbHNlO1xyXG5cdCAgICAgIFx0XHR0aGlzLmlzSGFuZGxlZFtpZF0gPSBmYWxzZTtcclxuXHQgICAgXHR9XHJcblx0ICAgIFx0dGhpcy5wZW5kaW5nUGF5bG9hZCA9IHBheWxvYWQ7XHJcblx0ICAgIFx0dGhpcy5pc0Rpc3BhdGNoaW5nID0gdHJ1ZTtcclxuICBcdFx0fVxyXG5cclxuXHQgIFx0cHJpdmF0ZSBzdG9wRGlzcGF0Y2hpbmcoKTogdm9pZCB7XHJcblx0ICAgIFx0dGhpcy5wZW5kaW5nUGF5bG9hZCA9IG51bGw7XHJcblx0ICAgIFx0dGhpcy5pc0Rpc3BhdGNoaW5nID0gZmFsc2U7XHJcblx0ICBcdH1cclxuXHR9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8tcHJvbWlzZS9kaXN0L3Byb21pc2UuZC50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8tY2xhc3Nsb2FkZXIvZGlzdC9jbGFzc2xvYWRlci5kLnRzXCIvPlxyXG5cclxubW9kdWxlIGhvLmZsdXgge1xyXG5cdGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuXHRleHBvcnQgbGV0IERJU1BBVENIRVI6IERpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xyXG5cclxuXHRleHBvcnQgbGV0IFNUT1JFUzogcmVnaXN0cnkuUmVnaXN0cnkgPSBuZXcgcmVnaXN0cnkuUmVnaXN0cnkoKTtcclxuXHJcblx0ZXhwb3J0IGxldCBBQ1RJT05TOiBhY3Rpb25zLlJlZ2lzdHJ5ID0gbmV3IGFjdGlvbnMuUmVnaXN0cnkoKTtcclxuXHJcblx0ZXhwb3J0IGxldCBkaXI6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcblxyXG5cdGV4cG9ydCBmdW5jdGlvbiBydW4ocm91dGVyOmFueSA9IFJvdXRlcik6IFByb21pc2U8YW55LCBhbnk+IHtcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZTxhbnksIGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cdFx0XHRpZihyb3V0ZXIgPT09IFJvdXRlcilcclxuXHRcdFx0XHRyZXNvbHZlKG5ldyBSb3V0ZXIoKSk7XHJcblx0XHRcdGVsc2UgaWYodHlwZW9mIHJvdXRlciA9PT0gJ2Z1bmN0aW9uJylcclxuXHRcdFx0XHRyZXNvbHZlKG5ldyByb3V0ZXIoKSlcclxuXHRcdFx0ZWxzZSBpZih0eXBlb2Ygcm91dGVyID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRcdFNUT1JFUy5sb2FkU3RvcmUocm91dGVyKVxyXG5cdFx0XHRcdC50aGVuKHMgPT4gcmVzb2x2ZShzKSlcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHRcdC50aGVuKHIgPT4ge1xyXG5cdFx0XHRyZXR1cm4gU1RPUkVTLnJlZ2lzdGVyKHIpLmluaXQoKTtcclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcbn1cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9