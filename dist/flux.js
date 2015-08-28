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
                        super: ["ho.flux.actions.Action"]
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
                Registry.prototype.loadStore = function (name, init) {
                    if (init === void 0) { init = true; }
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
                            var result = self.register(new c);
                            if (init)
                                result = result.init();
                            return Promise.create(result);
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
                var self = this;
                var handlers = Store.handlerMap[this.constructor.prototype];
                for (var type in handlers) {
                    var methodKeys = handlers[type];
                    methodKeys.forEach(function (key) {
                        var method = self[key].bind(self);
                        self.on(type, method);
                    });
                }
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
            Store.handlerMap = {};
            Store.on = function (type) {
                return function (target, key, desc) {
                    Store.handlerMap[target] = Store.handlerMap[target] || {};
                    Store.handlerMap[target][type] = Store.handlerMap[target][type] || [];
                    Store.handlerMap[target][type].push(key);
                    return desc;
                };
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
        flux.ACTIONS = new flux.actions.Registry();
        flux.dir = false;
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9oby9mbHV4L2NhbGxiYWNraG9sZGVyLnRzIiwic3JjL2hvL2ZsdXgvc3RhdGUudHMiLCJzcmMvaG8vZmx1eC9hY3Rpb25zL2FjdGlvbi50cyIsInNyYy9oby9mbHV4L2FjdGlvbnMvcmVnaXN0cnkudHMiLCJzcmMvaG8vZmx1eC9yZWdpc3RyeS9yZWdpc3RyeS50cyIsInNyYy9oby9mbHV4L3N0b3JlLnRzIiwic3JjL2hvL2ZsdXgvZGlzcGF0Y2hlci50cyIsInNyYy9oby9mbHV4L2ZsdXgudHMiXSwibmFtZXMiOlsiaG8iLCJoby5mbHV4IiwiaG8uZmx1eC5DYWxsYmFja0hvbGRlciIsImhvLmZsdXguQ2FsbGJhY2tIb2xkZXIuY29uc3RydWN0b3IiLCJoby5mbHV4LkNhbGxiYWNrSG9sZGVyLnJlZ2lzdGVyIiwiaG8uZmx1eC5DYWxsYmFja0hvbGRlci51bnJlZ2lzdGVyIiwiaG8uZmx1eC5hY3Rpb25zIiwiaG8uZmx1eC5hY3Rpb25zLkFjdGlvbiIsImhvLmZsdXguYWN0aW9ucy5BY3Rpb24uY29uc3RydWN0b3IiLCJoby5mbHV4LmFjdGlvbnMuQWN0aW9uLm5hbWUiLCJoby5mbHV4LmFjdGlvbnMuUmVnaXN0cnkiLCJoby5mbHV4LmFjdGlvbnMuUmVnaXN0cnkuY29uc3RydWN0b3IiLCJoby5mbHV4LmFjdGlvbnMuUmVnaXN0cnkucmVnaXN0ZXIiLCJoby5mbHV4LmFjdGlvbnMuUmVnaXN0cnkuZ2V0IiwiaG8uZmx1eC5hY3Rpb25zLlJlZ2lzdHJ5LmxvYWRBY3Rpb24iLCJoby5mbHV4LnJlZ2lzdHJ5IiwiaG8uZmx1eC5yZWdpc3RyeS5SZWdpc3RyeSIsImhvLmZsdXgucmVnaXN0cnkuUmVnaXN0cnkuY29uc3RydWN0b3IiLCJoby5mbHV4LnJlZ2lzdHJ5LlJlZ2lzdHJ5LnJlZ2lzdGVyIiwiaG8uZmx1eC5yZWdpc3RyeS5SZWdpc3RyeS5nZXQiLCJoby5mbHV4LnJlZ2lzdHJ5LlJlZ2lzdHJ5LmxvYWRTdG9yZSIsImhvLmZsdXguU3RvcmUiLCJoby5mbHV4LlN0b3JlLmNvbnN0cnVjdG9yIiwiaG8uZmx1eC5TdG9yZS5pbml0IiwiaG8uZmx1eC5TdG9yZS5uYW1lIiwiaG8uZmx1eC5TdG9yZS5yZWdpc3RlciIsImhvLmZsdXguU3RvcmUub24iLCJoby5mbHV4LlN0b3JlLmhhbmRsZSIsImhvLmZsdXguU3RvcmUuY2hhbmdlZCIsImhvLmZsdXguRGlzcGF0Y2hlciIsImhvLmZsdXguRGlzcGF0Y2hlci5jb25zdHJ1Y3RvciIsImhvLmZsdXguRGlzcGF0Y2hlci53YWl0Rm9yIiwiaG8uZmx1eC5EaXNwYXRjaGVyLmRpc3BhdGNoIiwiaG8uZmx1eC5EaXNwYXRjaGVyLmludm9rZUNhbGxiYWNrIiwiaG8uZmx1eC5EaXNwYXRjaGVyLnN0YXJ0RGlzcGF0Y2hpbmciLCJoby5mbHV4LkRpc3BhdGNoZXIuc3RvcERpc3BhdGNoaW5nIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFPLEVBQUUsQ0FvQlI7QUFwQkQsV0FBTyxFQUFFO0lBQUNBLElBQUFBLElBQUlBLENBb0JiQTtJQXBCU0EsV0FBQUEsSUFBSUEsRUFBQ0EsQ0FBQ0E7UUFFZkM7WUFBQUM7Z0JBRVdDLFdBQU1BLEdBQVdBLEtBQUtBLENBQUNBO2dCQUNwQkEsV0FBTUEsR0FBV0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RCQSxjQUFTQSxHQUE0QkEsRUFBRUEsQ0FBQ0E7WUFhbkRBLENBQUNBO1lBWE9ELGlDQUFRQSxHQUFmQSxVQUFnQkEsUUFBa0JBLEVBQUVBLElBQVVBO2dCQUMxQ0UsSUFBSUEsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7Z0JBQ3JDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxHQUFHQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxRQUFRQSxDQUFDQTtnQkFDM0RBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBO1lBQ1pBLENBQUNBO1lB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QUFLQSxDQUFDQTtJQXVCakNBLENBQUNBLEVBaENTRCxJQUFJQSxHQUFKQSxPQUFJQSxLQUFKQSxPQUFJQSxRQWdDYkE7QUFBREEsQ0FBQ0EsRUFoQ00sRUFBRSxLQUFGLEVBQUUsUUFnQ1IiLCJmaWxlIjoiZmx1eC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZSBoby5mbHV4IHtcclxuXHJcblx0ZXhwb3J0IGNsYXNzIENhbGxiYWNrSG9sZGVyIHtcclxuXHJcblx0XHRwcm90ZWN0ZWQgcHJlZml4OiBzdHJpbmcgPSAnSURfJztcclxuICAgIFx0cHJvdGVjdGVkIGxhc3RJRDogbnVtYmVyID0gMTtcclxuXHRcdHByb3RlY3RlZCBjYWxsYmFja3M6IHtba2V5OnN0cmluZ106RnVuY3Rpb259ID0ge307XHJcblxyXG5cdFx0cHVibGljIHJlZ2lzdGVyKGNhbGxiYWNrOiBGdW5jdGlvbiwgc2VsZj86IGFueSk6IHN0cmluZyB7XHJcbiAgICBcdFx0bGV0IGlkID0gdGhpcy5wcmVmaXggKyB0aGlzLmxhc3RJRCsrO1xyXG4gICAgXHRcdHRoaXMuY2FsbGJhY2tzW2lkXSA9IHNlbGYgPyBjYWxsYmFjay5iaW5kKHNlbGYpIDogY2FsbGJhY2s7XHJcbiAgICBcdFx0cmV0dXJuIGlkO1xyXG4gIFx0XHR9XHJcblxyXG4gIFx0XHRwdWJsaWMgdW5yZWdpc3RlcihpZCkge1xyXG4gICAgICBcdFx0aWYoIXRoaXMuY2FsbGJhY2tzW2lkXSlcclxuXHRcdFx0XHR0aHJvdyAnQ291bGQgbm90IHVucmVnaXN0ZXIgY2FsbGJhY2sgZm9yIGlkICcgKyBpZDtcclxuICAgIFx0XHRkZWxldGUgdGhpcy5jYWxsYmFja3NbaWRdO1xyXG4gIFx0XHR9O1xyXG5cdH1cclxufVxyXG4iLCJcclxubW9kdWxlIGhvLmZsdXgge1xyXG5cdGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuXHJcblx0ZXhwb3J0IGludGVyZmFjZSBJU3RhdGUge1xyXG5cdFx0bmFtZTogc3RyaW5nO1xyXG5cdFx0dXJsOiBzdHJpbmc7XHJcblx0XHRyZWRpcmVjdD86IHN0cmluZztcclxuXHRcdGJlZm9yZT86IChkYXRhOiBJUm91dGVEYXRhKT0+UHJvbWlzZTxhbnksIGFueT47XHJcblx0XHR2aWV3PzogQXJyYXk8SVZpZXdTdGF0ZT47XHJcblx0fVxyXG5cclxuXHRleHBvcnQgaW50ZXJmYWNlIElWaWV3U3RhdGUge1xyXG5cdCAgICBuYW1lOiBzdHJpbmc7XHJcblx0XHRodG1sOiBzdHJpbmc7XHJcblx0fVxyXG5cclxuXHRleHBvcnQgaW50ZXJmYWNlIElTdGF0ZXMge1xyXG5cdCAgICBzdGF0ZXM6IEFycmF5PElTdGF0ZT47XHJcblx0fVxyXG5cclxufVxyXG4iLCJtb2R1bGUgaG8uZmx1eC5hY3Rpb25zIHtcblx0ZXhwb3J0IGNsYXNzIEFjdGlvbiB7XG5cblx0XHRnZXQgbmFtZSgpOiBzdHJpbmcge1xuXHRcdCAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG5cdCAgIH1cblx0ICAgXG5cdH1cbn1cbiIsIlxyXG5tb2R1bGUgaG8uZmx1eC5hY3Rpb25zIHtcclxuXHRpbXBvcnQgUHJvbWlzZSA9IGhvLnByb21pc2UuUHJvbWlzZTtcclxuXHJcblx0ZXhwb3J0IGxldCBtYXBwaW5nOiB7W2tleTpzdHJpbmddOnN0cmluZ30gPSB7fTtcclxuXHRleHBvcnQgbGV0IHVzZURpciA9IHRydWU7XHJcblxyXG5cdGV4cG9ydCBjbGFzcyBSZWdpc3RyeSB7XHJcblxyXG5cdFx0cHJpdmF0ZSBhY3Rpb25zOiB7W2tleTogc3RyaW5nXTogQWN0aW9ufSA9IHt9O1xyXG5cclxuXHRcdHByaXZhdGUgYWN0aW9uTG9hZGVyID0gbmV3IGhvLmNsYXNzbG9hZGVyLkNsYXNzTG9hZGVyKHtcclxuICAgICAgICAgICB1cmxUZW1wbGF0ZTogJ2FjdGlvbnMvJHtuYW1lfS5qcycsXHJcbiAgICAgICAgICAgdXNlRGlyXHJcbiAgICAgICB9KTtcclxuXHJcblx0XHRwdWJsaWMgcmVnaXN0ZXIoYWN0aW9uOiBBY3Rpb24pOiBBY3Rpb24ge1xyXG5cdFx0XHR0aGlzLmFjdGlvbnNbYWN0aW9uLm5hbWVdID0gYWN0aW9uO1xyXG5cdFx0XHRyZXR1cm4gYWN0aW9uO1xyXG5cdFx0fVxyXG5cclxuXHRcdHB1YmxpYyBnZXQoYWN0aW9uQ2xhc3M6IHN0cmluZyk6IFN0b3JlPGFueT5cclxuXHRcdHB1YmxpYyBnZXQ8VCBleHRlbmRzIEFjdGlvbj4oYWN0aW9uQ2xhc3M6IHtuZXcoKTpUfSk6IFRcclxuXHRcdHB1YmxpYyBnZXQ8VCBleHRlbmRzIEFjdGlvbj4oYWN0aW9uQ2xhc3M6IGFueSk6IFQge1xyXG5cdFx0XHRsZXQgbmFtZSA9IHZvaWQgMDtcclxuXHRcdFx0aWYodHlwZW9mIGFjdGlvbkNsYXNzID09PSAnc3RyaW5nJylcclxuXHRcdFx0XHRuYW1lID0gYWN0aW9uQ2xhc3M7XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRuYW1lID0gYWN0aW9uQ2xhc3MudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcclxuXHRcdFx0cmV0dXJuIDxUPnRoaXMuYWN0aW9uc1tuYW1lXTtcclxuXHRcdH1cclxuXHJcblx0XHRwdWJsaWMgbG9hZEFjdGlvbihuYW1lOiBzdHJpbmcpOiBQcm9taXNlPEFjdGlvbiwgc3RyaW5nPiB7XHJcblxyXG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG5cdFx0XHRpZighIXRoaXMuYWN0aW9uc1tuYW1lXSlcclxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5jcmVhdGUodGhpcy5hY3Rpb25zW25hbWVdKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFjdGlvbkxvYWRlci5sb2FkKHtcclxuICAgICAgICAgICAgICAgIG5hbWUsXHJcblx0XHRcdFx0dXJsOiBtYXBwaW5nW25hbWVdLFxyXG4gICAgICAgICAgICAgICAgc3VwZXI6IFtcImhvLmZsdXguYWN0aW9ucy5BY3Rpb25cIl1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKGNsYXNzZXM6IEFycmF5PHR5cGVvZiBBY3Rpb24+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzLm1hcChhID0+IHtcclxuXHRcdFx0XHRcdGlmKCFzZWxmLmdldChhKSlcclxuXHRcdFx0XHRcdFx0c2VsZi5yZWdpc3RlcihuZXcgYSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmdldChjbGFzc2VzLnBvcCgpKTtcclxuICAgICAgICAgICAgfSlcclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcbn1cclxuIiwiXHJcbm1vZHVsZSBoby5mbHV4LnJlZ2lzdHJ5IHtcclxuXHRpbXBvcnQgUHJvbWlzZSA9IGhvLnByb21pc2UuUHJvbWlzZTtcclxuXHJcblx0ZXhwb3J0IGxldCBtYXBwaW5nOiB7W2tleTpzdHJpbmddOnN0cmluZ30gPSB7fTtcclxuXHRleHBvcnQgbGV0IHVzZURpciA9IHRydWU7XHJcblxyXG5cdGV4cG9ydCBjbGFzcyBSZWdpc3RyeSB7XHJcblxyXG5cdFx0cHJpdmF0ZSBzdG9yZXM6IHtba2V5OiBzdHJpbmddOiBTdG9yZTxhbnk+fSA9IHt9O1xyXG5cclxuXHRcdHByaXZhdGUgc3RvcmVMb2FkZXIgPSBuZXcgaG8uY2xhc3Nsb2FkZXIuQ2xhc3NMb2FkZXIoe1xyXG4gICAgICAgICAgIHVybFRlbXBsYXRlOiAnc3RvcmVzLyR7bmFtZX0uanMnLFxyXG4gICAgICAgICAgIHVzZURpclxyXG4gICAgICAgfSk7XHJcblxyXG5cdFx0cHVibGljIHJlZ2lzdGVyKHN0b3JlOiBTdG9yZTxhbnk+KTogU3RvcmU8YW55PiB7XHJcblx0XHRcdHRoaXMuc3RvcmVzW3N0b3JlLm5hbWVdID0gc3RvcmU7XHJcblx0XHRcdHJldHVybiBzdG9yZTtcclxuXHRcdH1cclxuXHJcblx0XHRwdWJsaWMgZ2V0KHN0b3JlQ2xhc3M6IHN0cmluZyk6IFN0b3JlPGFueT5cclxuXHRcdHB1YmxpYyBnZXQ8VCBleHRlbmRzIFN0b3JlPGFueT4+KHN0b3JlQ2xhc3M6IHtuZXcoKTpUfSk6IFRcclxuXHRcdHB1YmxpYyBnZXQ8VCBleHRlbmRzIFN0b3JlPGFueT4+KHN0b3JlQ2xhc3M6IGFueSk6IFQge1xyXG5cdFx0XHRsZXQgbmFtZSA9IHZvaWQgMDtcclxuXHRcdFx0aWYodHlwZW9mIHN0b3JlQ2xhc3MgPT09ICdzdHJpbmcnKVxyXG5cdFx0XHRcdG5hbWUgPSBzdG9yZUNsYXNzO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0bmFtZSA9IHN0b3JlQ2xhc3MudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcclxuXHRcdFx0cmV0dXJuIDxUPnRoaXMuc3RvcmVzW25hbWVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdHB1YmxpYyBsb2FkU3RvcmUobmFtZTogc3RyaW5nLCBpbml0ID0gdHJ1ZSk6IFByb21pc2U8U3RvcmU8YW55Piwgc3RyaW5nPiB7XHJcblxyXG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XHJcblx0XHRcdGxldCBjbHM6IEFycmF5PHR5cGVvZiBTdG9yZT4gPSBbXTtcclxuXHJcblx0XHRcdGlmKCEhdGhpcy5zdG9yZXNbbmFtZV0pXHJcblx0XHRcdFx0cmV0dXJuIFByb21pc2UuY3JlYXRlKHRoaXMuc3RvcmVzW25hbWVdKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0b3JlTG9hZGVyLmxvYWQoe1xyXG4gICAgICAgICAgICAgICAgbmFtZSxcclxuXHRcdFx0XHR1cmw6IG1hcHBpbmdbbmFtZV0sXHJcbiAgICAgICAgICAgICAgICBzdXBlcjogW1wiaG8uZmx1eC5TdG9yZVwiXVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoY2xhc3NlczogQXJyYXk8dHlwZW9mIFN0b3JlPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2xzID0gY2xhc3NlcztcclxuXHRcdFx0XHRjbGFzc2VzID0gY2xhc3Nlcy5maWx0ZXIoYyA9PiB7XHJcblx0XHRcdFx0XHRyZXR1cm4gIXNlbGYuZ2V0KGMpO1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRsZXQgcHJvbWlzZXMgPSAgY2xhc3Nlcy5tYXAoYyA9PiB7XHJcblx0XHRcdFx0XHRsZXQgcmVzdWx0OiBhbnkgPSBzZWxmLnJlZ2lzdGVyKG5ldyBjKTtcclxuXHRcdFx0XHRcdGlmKGluaXQpXHJcblx0XHRcdFx0XHRcdHJlc3VsdCA9IHJlc3VsdC5pbml0KCk7XHJcblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5jcmVhdGUocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XHJcbiAgICAgICAgICAgIH0pXHJcblx0XHRcdC50aGVuKHAgPT4ge1xyXG5cdFx0XHRcdHJldHVybiBzZWxmLmdldChjbHMucG9wKCkpO1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxufVxyXG4iLCJcclxubW9kdWxlIGhvLmZsdXgge1xyXG5cclxuXHRleHBvcnQgY2xhc3MgU3RvcmU8VD4gZXh0ZW5kcyBDYWxsYmFja0hvbGRlciB7XHJcblxyXG5cdFx0c3RhdGljIGhhbmRsZXJNYXA6IGFueSA9IHt9O1xyXG5cdFx0c3RhdGljIG9uID0gZnVuY3Rpb24odHlwZSkge1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24odGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuXHRcdFx0XHRTdG9yZS5oYW5kbGVyTWFwW3RhcmdldF0gPSBTdG9yZS5oYW5kbGVyTWFwW3RhcmdldF0gfHwge307XHJcblx0XHRcdFx0U3RvcmUuaGFuZGxlck1hcFt0YXJnZXRdW3R5cGVdID0gU3RvcmUuaGFuZGxlck1hcFt0YXJnZXRdW3R5cGVdIHx8IFtdO1xyXG5cdFx0XHRcdFN0b3JlLmhhbmRsZXJNYXBbdGFyZ2V0XVt0eXBlXS5wdXNoKGtleSlcclxuXHRcdFx0XHRyZXR1cm4gZGVzYztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHByb3RlY3RlZCBkYXRhOiBUO1xyXG5cdFx0cHJpdmF0ZSBpZDogc3RyaW5nO1xyXG5cdFx0cHJpdmF0ZSBoYW5kbGVyczoge1trZXk6IHN0cmluZ106IEZ1bmN0aW9ufSA9IHt9O1xyXG5cdFx0cHJvdGVjdGVkIGFjdGlvbnM6IHN0cmluZ1tdID0gW107XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHRcdHN1cGVyKCk7XHJcblx0XHRcdHRoaXMuaWQgPSBoby5mbHV4LkRJU1BBVENIRVIucmVnaXN0ZXIodGhpcy5oYW5kbGUuYmluZCh0aGlzKSk7XHJcblxyXG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XHJcblx0XHRcdGxldCBoYW5kbGVycyA9IFN0b3JlLmhhbmRsZXJNYXBbdGhpcy5jb25zdHJ1Y3Rvci5wcm90b3R5cGVdO1xyXG5cdFx0XHRmb3IodmFyIHR5cGUgaW4gaGFuZGxlcnMpIHtcclxuXHRcdFx0XHRsZXQgbWV0aG9kS2V5cyA9IGhhbmRsZXJzW3R5cGVdO1xyXG5cdFx0XHRcdG1ldGhvZEtleXMuZm9yRWFjaChrZXkgPT4ge1xyXG5cdFx0XHRcdFx0bGV0IG1ldGhvZCA9IHNlbGZba2V5XS5iaW5kKHNlbGYpO1xyXG5cdFx0XHRcdFx0c2VsZi5vbih0eXBlLCBtZXRob2QpO1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdH1cclxuXHRcdFx0Ly9oby5mbHV4LlNUT1JFUy5yZWdpc3Rlcih0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHRwdWJsaWMgaW5pdCgpOiBoby5wcm9taXNlLlByb21pc2U8YW55LCBhbnk+IHtcclxuXHRcdFx0cmV0dXJuIGhvLnByb21pc2UuUHJvbWlzZS5hbGwodGhpcy5hY3Rpb25zLm1hcChhPT57XHJcblx0XHRcdFx0cmV0dXJuIGhvLmZsdXguQUNUSU9OUy5sb2FkQWN0aW9uKGEpO1xyXG5cdFx0XHR9KSk7XHJcblx0XHR9XHJcblxyXG5cdFx0IGdldCBuYW1lKCk6IHN0cmluZyB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XHJcblx0XHR9XHJcblxyXG5cdFx0cHVibGljIHJlZ2lzdGVyKGNhbGxiYWNrOiAoZGF0YTpUKT0+dm9pZCwgc2VsZj86YW55KTogc3RyaW5nIHtcclxuXHRcdFx0cmV0dXJuIHN1cGVyLnJlZ2lzdGVyKGNhbGxiYWNrLCBzZWxmKTtcclxuXHRcdH1cclxuXHJcblx0XHRwcm90ZWN0ZWQgb24odHlwZTogc3RyaW5nLCBmdW5jOiBGdW5jdGlvbik6IHZvaWQge1xyXG5cdFx0XHR0aGlzLmhhbmRsZXJzW3R5cGVdID0gZnVuYztcclxuXHRcdH1cclxuXHJcblx0XHRwcm90ZWN0ZWQgaGFuZGxlKGFjdGlvbjogSUFjdGlvbik6IHZvaWQge1xyXG5cdFx0XHRpZih0eXBlb2YgdGhpcy5oYW5kbGVyc1thY3Rpb24udHlwZV0gPT09ICdmdW5jdGlvbicpXHJcblx0XHRcdFx0dGhpcy5oYW5kbGVyc1thY3Rpb24udHlwZV0oYWN0aW9uLmRhdGEpO1xyXG5cdFx0fTtcclxuXHJcblxyXG5cdFx0cHJvdGVjdGVkIGNoYW5nZWQoKTogdm9pZCB7XHJcblx0XHRcdGZvciAobGV0IGlkIGluIHRoaXMuY2FsbGJhY2tzKSB7XHJcblx0XHRcdCAgbGV0IGNiID0gdGhpcy5jYWxsYmFja3NbaWRdO1xyXG5cdFx0XHQgIGlmKGNiKVxyXG5cdFx0XHQgIFx0Y2IodGhpcy5kYXRhKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHJcblx0fTtcclxuXHJcblxyXG59XHJcbiIsIlxyXG5tb2R1bGUgaG8uZmx1eCB7XHJcblxyXG5cdGV4cG9ydCBpbnRlcmZhY2UgSUFjdGlvbiB7XHJcblx0ICAgIHR5cGU6c3RyaW5nO1xyXG5cdFx0ZGF0YT86YW55O1xyXG5cdH1cclxuXHJcblx0ZXhwb3J0IGNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBDYWxsYmFja0hvbGRlciB7XHJcblxyXG4gICAgXHRwcml2YXRlIGlzUGVuZGluZzoge1trZXk6c3RyaW5nXTpib29sZWFufSA9IHt9O1xyXG4gICAgXHRwcml2YXRlIGlzSGFuZGxlZDoge1trZXk6c3RyaW5nXTpib29sZWFufSA9IHt9O1xyXG4gICAgXHRwcml2YXRlIGlzRGlzcGF0Y2hpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIFx0cHJpdmF0ZSBwZW5kaW5nUGF5bG9hZDogSUFjdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0cHVibGljIHdhaXRGb3IoLi4uaWRzOiBBcnJheTxudW1iZXI+KTogdm9pZCB7XHJcblx0XHRcdGlmKCF0aGlzLmlzRGlzcGF0Y2hpbmcpXHJcblx0XHQgIFx0XHR0aHJvdyAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IE11c3QgYmUgaW52b2tlZCB3aGlsZSBkaXNwYXRjaGluZy4nO1xyXG5cclxuXHRcdFx0Zm9yIChsZXQgaWkgPSAwOyBpaSA8IGlkcy5sZW5ndGg7IGlpKyspIHtcclxuXHRcdFx0ICBsZXQgaWQgPSBpZHNbaWldO1xyXG5cclxuXHRcdFx0ICBpZiAodGhpcy5pc1BlbmRpbmdbaWRdKSB7XHJcblx0XHQgICAgICBcdGlmKCF0aGlzLmlzSGFuZGxlZFtpZF0pXHJcblx0XHRcdCAgICAgIFx0dGhyb3cgYHdhaXRGb3IoLi4uKTogQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZCB3aGlsZSB3YXRpbmcgZm9yICR7aWR9YDtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0ICB9XHJcblxyXG5cdFx0XHQgIGlmKCF0aGlzLmNhbGxiYWNrc1tpZF0pXHJcblx0XHRcdCAgXHR0aHJvdyBgd2FpdEZvciguLi4pOiAke2lkfSBkb2VzIG5vdCBtYXAgdG8gYSByZWdpc3RlcmVkIGNhbGxiYWNrLmA7XHJcblxyXG5cdFx0XHQgIHRoaXMuaW52b2tlQ2FsbGJhY2soaWQpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdHB1YmxpYyBkaXNwYXRjaChhY3Rpb246IElBY3Rpb24pIHtcclxuXHRcdFx0aWYodGhpcy5pc0Rpc3BhdGNoaW5nKVxyXG5cdFx0ICAgIFx0dGhyb3cgJ0Nhbm5vdCBkaXNwYXRjaCBpbiB0aGUgbWlkZGxlIG9mIGEgZGlzcGF0Y2guJztcclxuXHJcblx0XHRcdHRoaXMuc3RhcnREaXNwYXRjaGluZyhhY3Rpb24pO1xyXG5cclxuXHRcdCAgICB0cnkge1xyXG5cdFx0ICAgICAgZm9yIChsZXQgaWQgaW4gdGhpcy5jYWxsYmFja3MpIHtcclxuXHRcdCAgICAgICAgaWYgKHRoaXMuaXNQZW5kaW5nW2lkXSkge1xyXG5cdFx0ICAgICAgICAgIGNvbnRpbnVlO1xyXG5cdFx0ICAgICAgICB9XHJcblx0XHQgICAgICAgIHRoaXMuaW52b2tlQ2FsbGJhY2soaWQpO1xyXG5cdFx0ICAgICAgfVxyXG5cdFx0ICAgIH0gZmluYWxseSB7XHJcblx0XHQgICAgICB0aGlzLnN0b3BEaXNwYXRjaGluZygpO1xyXG5cdFx0ICAgIH1cclxuXHRcdH07XHJcblxyXG5cdCAgXHRwcml2YXRlIGludm9rZUNhbGxiYWNrKGlkOiBudW1iZXIpOiB2b2lkIHtcclxuXHQgICAgXHR0aGlzLmlzUGVuZGluZ1tpZF0gPSB0cnVlO1xyXG5cdCAgICBcdHRoaXMuY2FsbGJhY2tzW2lkXSh0aGlzLnBlbmRpbmdQYXlsb2FkKTtcclxuXHQgICAgXHR0aGlzLmlzSGFuZGxlZFtpZF0gPSB0cnVlO1xyXG5cdCAgXHR9XHJcblxyXG5cdCAgXHRwcml2YXRlIHN0YXJ0RGlzcGF0Y2hpbmcocGF5bG9hZDogSUFjdGlvbik6IHZvaWQge1xyXG5cdCAgICBcdGZvciAobGV0IGlkIGluIHRoaXMuY2FsbGJhY2tzKSB7XHJcblx0ICAgICAgXHRcdHRoaXMuaXNQZW5kaW5nW2lkXSA9IGZhbHNlO1xyXG5cdCAgICAgIFx0XHR0aGlzLmlzSGFuZGxlZFtpZF0gPSBmYWxzZTtcclxuXHQgICAgXHR9XHJcblx0ICAgIFx0dGhpcy5wZW5kaW5nUGF5bG9hZCA9IHBheWxvYWQ7XHJcblx0ICAgIFx0dGhpcy5pc0Rpc3BhdGNoaW5nID0gdHJ1ZTtcclxuICBcdFx0fVxyXG5cclxuXHQgIFx0cHJpdmF0ZSBzdG9wRGlzcGF0Y2hpbmcoKTogdm9pZCB7XHJcblx0ICAgIFx0dGhpcy5wZW5kaW5nUGF5bG9hZCA9IG51bGw7XHJcblx0ICAgIFx0dGhpcy5pc0Rpc3BhdGNoaW5nID0gZmFsc2U7XHJcblx0ICBcdH1cclxuXHR9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8tcHJvbWlzZS9kaXN0L3Byb21pc2UuZC50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvaG8tY2xhc3Nsb2FkZXIvZGlzdC9jbGFzc2xvYWRlci5kLnRzXCIvPlxyXG5cclxubW9kdWxlIGhvLmZsdXgge1xyXG5cdGltcG9ydCBQcm9taXNlID0gaG8ucHJvbWlzZS5Qcm9taXNlO1xyXG5cclxuXHRleHBvcnQgbGV0IERJU1BBVENIRVI6IERpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xyXG5cclxuXHRleHBvcnQgbGV0IFNUT1JFUzogcmVnaXN0cnkuUmVnaXN0cnkgPSBuZXcgcmVnaXN0cnkuUmVnaXN0cnkoKTtcclxuXHJcblx0ZXhwb3J0IGxldCBBQ1RJT05TOiBhY3Rpb25zLlJlZ2lzdHJ5ID0gbmV3IGFjdGlvbnMuUmVnaXN0cnkoKTtcclxuXHJcblx0ZXhwb3J0IGxldCBkaXI6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcblxyXG5cdC8qXHJcblx0ZXhwb3J0IGZ1bmN0aW9uIHJ1bihyb3V0ZXI6YW55ID0gUm91dGVyKTogUHJvbWlzZTxhbnksIGFueT4ge1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlPGFueSwgYW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblx0XHRcdGlmKCEhU1RPUkVTLmdldChyb3V0ZXIpKVxyXG5cdFx0XHRcdHJlc29sdmUoU1RPUkVTLmdldChyb3V0ZXIpKVxyXG5cdFx0XHRlbHNlIGlmKHJvdXRlciA9PT0gUm91dGVyKVxyXG5cdFx0XHRcdHJlc29sdmUobmV3IFJvdXRlcigpKTtcclxuXHRcdFx0ZWxzZSBpZih0eXBlb2Ygcm91dGVyID09PSAnZnVuY3Rpb24nKVxyXG5cdFx0XHRcdHJlc29sdmUobmV3IHJvdXRlcigpKVxyXG5cdFx0XHRlbHNlIGlmKHR5cGVvZiByb3V0ZXIgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdFx0U1RPUkVTLmxvYWRTdG9yZShyb3V0ZXIpXHJcblx0XHRcdFx0LnRoZW4ocyA9PiByZXNvbHZlKHMpKVxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdFx0LnRoZW4ociA9PiB7XHJcblx0XHRcdHJldHVybiBTVE9SRVMucmVnaXN0ZXIocikuaW5pdCgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdH1cclxuXHQqL1xyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==