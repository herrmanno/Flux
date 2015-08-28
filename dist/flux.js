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
                var handlers = Store.handlerMap[this.name];
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
                    target = target.name;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9oby9mbHV4L2NhbGxiYWNraG9sZGVyLnRzIiwic3JjL2hvL2ZsdXgvc3RhdGUudHMiLCJzcmMvaG8vZmx1eC9hY3Rpb25zL2FjdGlvbi50cyIsInNyYy9oby9mbHV4L2FjdGlvbnMvcmVnaXN0cnkudHMiLCJzcmMvaG8vZmx1eC9yZWdpc3RyeS9yZWdpc3RyeS50cyIsInNyYy9oby9mbHV4L3N0b3JlLnRzIiwic3JjL2hvL2ZsdXgvZGlzcGF0Y2hlci50cyIsInNyYy9oby9mbHV4L2ZsdXgudHMiXSwibmFtZXMiOlsiaG8iLCJoby5mbHV4IiwiaG8uZmx1eC5DYWxsYmFja0hvbGRlciIsImhvLmZsdXguQ2FsbGJhY2tIb2xkZXIuY29uc3RydWN0b3IiLCJoby5mbHV4LkNhbGxiYWNrSG9sZGVyLnJlZ2lzdGVyIiwiaG8uZmx1eC5DYWxsYmFja0hvbGRlci51bnJlZ2lzdGVyIiwiaG8uZmx1eC5hY3Rpb25zIiwiaG8uZmx1eC5hY3Rpb25zLkFjdGlvbiIsImhvLmZsdXguYWN0aW9ucy5BY3Rpb24uY29uc3RydWN0b3IiLCJoby5mbHV4LmFjdGlvbnMuQWN0aW9uLm5hbWUiLCJoby5mbHV4LmFjdGlvbnMuUmVnaXN0cnkiLCJoby5mbHV4LmFjdGlvbnMuUmVnaXN0cnkuY29uc3RydWN0b3IiLCJoby5mbHV4LmFjdGlvbnMuUmVnaXN0cnkucmVnaXN0ZXIiLCJoby5mbHV4LmFjdGlvbnMuUmVnaXN0cnkuZ2V0IiwiaG8uZmx1eC5hY3Rpb25zLlJlZ2lzdHJ5LmxvYWRBY3Rpb24iLCJoby5mbHV4LnJlZ2lzdHJ5IiwiaG8uZmx1eC5yZWdpc3RyeS5SZWdpc3RyeSIsImhvLmZsdXgucmVnaXN0cnkuUmVnaXN0cnkuY29uc3RydWN0b3IiLCJoby5mbHV4LnJlZ2lzdHJ5LlJlZ2lzdHJ5LnJlZ2lzdGVyIiwiaG8uZmx1eC5yZWdpc3RyeS5SZWdpc3RyeS5nZXQiLCJoby5mbHV4LnJlZ2lzdHJ5LlJlZ2lzdHJ5LmxvYWRTdG9yZSIsImhvLmZsdXguU3RvcmUiLCJoby5mbHV4LlN0b3JlLmNvbnN0cnVjdG9yIiwiaG8uZmx1eC5TdG9yZS5pbml0IiwiaG8uZmx1eC5TdG9yZS5uYW1lIiwiaG8uZmx1eC5TdG9yZS5yZWdpc3RlciIsImhvLmZsdXguU3RvcmUub24iLCJoby5mbHV4LlN0b3JlLmhhbmRsZSIsImhvLmZsdXguU3RvcmUuY2hhbmdlZCIsImhvLmZsdXguRGlzcGF0Y2hlciIsImhvLmZsdXguRGlzcGF0Y2hlci5jb25zdHJ1Y3RvciIsImhvLmZsdXguRGlzcGF0Y2hlci53YWl0Rm9yIiwiaG8uZmx1eC5EaXNwYXRjaGVyLmRpc3BhdGNoIiwiaG8uZmx1eC5EaXNwYXRjaGVyLmludm9rZUNhbGxiYWNrIiwiaG8uZmx1eC5EaXNwYXRjaGVyLnN0YXJ0RGlzcGF0Y2hpbmciLCJoby5mbHV4LkRpc3BhdGNoZXIuc3RvcERpc3BhdGNoaW5nIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFPLEVBQUUsQ0FvQlI7QUFwQkQsV0FBTyxFQUFFO0lBQUNBLElBQUFBLElBQUlBLENBb0JiQTtJQXBCU0EsV0FBQUEsSUFBSUEsRUFBQ0EsQ0FBQ0E7UUFFZkM7WUFBQUM7Z0JBRVdDLFdBQU1BLEdBQVdBLEtBQUtBLENBQUNBO2dCQUNwQkEsV0FBTUEsR0FBV0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RCQSxjQUFTQSxHQUE0QkEsRUFBRUEsQ0FBQ0E7WUFhbkRBLENBQUNBO1lBWE9ELGlDQUFRQSxHQUFmQSxVQUFnQkEsUUFBa0JBLEVBQUVBLElBQVVBO2dCQUMxQ0UsSUFBSUEsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7Z0JBQ3JDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxHQUFHQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxRQUFRQSxDQUFDQTtnQkFDM0RBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBO1lBQ1pBLENBQUNBO1lB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QUFDQTtRQUVuREEsUUFBR0EsR0FBWUEsS0FBS0EsQ0FBQ0E7SUF1QmpDQSxDQUFDQSxFQWhDU0QsSUFBSUEsR0FBSkEsT0FBSUEsS0FBSkEsT0FBSUEsUUFnQ2JBO0FBQURBLENBQUNBLEVBaENNLEVBQUUsS0FBRixFQUFFLFFBZ0NSIiwiZmlsZSI6ImZsdXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUgaG8uZmx1eCB7XHJcblxyXG5cdGV4cG9ydCBjbGFzcyBDYWxsYmFja0hvbGRlciB7XHJcblxyXG5cdFx0cHJvdGVjdGVkIHByZWZpeDogc3RyaW5nID0gJ0lEXyc7XHJcbiAgICBcdHByb3RlY3RlZCBsYXN0SUQ6IG51bWJlciA9IDE7XHJcblx0XHRwcm90ZWN0ZWQgY2FsbGJhY2tzOiB7W2tleTpzdHJpbmddOkZ1bmN0aW9ufSA9IHt9O1xyXG5cclxuXHRcdHB1YmxpYyByZWdpc3RlcihjYWxsYmFjazogRnVuY3Rpb24sIHNlbGY/OiBhbnkpOiBzdHJpbmcge1xyXG4gICAgXHRcdGxldCBpZCA9IHRoaXMucHJlZml4ICsgdGhpcy5sYXN0SUQrKztcclxuICAgIFx0XHR0aGlzLmNhbGxiYWNrc1tpZF0gPSBzZWxmID8gY2FsbGJhY2suYmluZChzZWxmKSA6IGNhbGxiYWNrO1xyXG4gICAgXHRcdHJldHVybiBpZDtcclxuICBcdFx0fVxyXG5cclxuICBcdFx0cHVibGljIHVucmVnaXN0ZXIoaWQpIHtcclxuICAgICAgXHRcdGlmKCF0aGlzLmNhbGxiYWNrc1tpZF0pXHJcblx0XHRcdFx0dGhyb3cgJ0NvdWxkIG5vdCB1bnJlZ2lzdGVyIGNhbGxiYWNrIGZvciBpZCAnICsgaWQ7XHJcbiAgICBcdFx0ZGVsZXRlIHRoaXMuY2FsbGJhY2tzW2lkXTtcclxuICBcdFx0fTtcclxuXHR9XHJcbn1cclxuIiwiXHJcbm1vZHVsZSBoby5mbHV4IHtcclxuXHRpbXBvcnQgUHJvbWlzZSA9IGhvLnByb21pc2UuUHJvbWlzZTtcclxuXHJcblxyXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVN0YXRlIHtcclxuXHRcdG5hbWU6IHN0cmluZztcclxuXHRcdHVybDogc3RyaW5nO1xyXG5cdFx0cmVkaXJlY3Q/OiBzdHJpbmc7XHJcblx0XHRiZWZvcmU/OiAoZGF0YTogSVJvdXRlRGF0YSk9PlByb21pc2U8YW55LCBhbnk+O1xyXG5cdFx0dmlldz86IEFycmF5PElWaWV3U3RhdGU+O1xyXG5cdH1cclxuXHJcblx0ZXhwb3J0IGludGVyZmFjZSBJVmlld1N0YXRlIHtcclxuXHQgICAgbmFtZTogc3RyaW5nO1xyXG5cdFx0aHRtbDogc3RyaW5nO1xyXG5cdH1cclxuXHJcblx0ZXhwb3J0IGludGVyZmFjZSBJU3RhdGVzIHtcclxuXHQgICAgc3RhdGVzOiBBcnJheTxJU3RhdGU+O1xyXG5cdH1cclxuXHJcbn1cclxuIiwibW9kdWxlIGhvLmZsdXguYWN0aW9ucyB7XG5cdGV4cG9ydCBjbGFzcyBBY3Rpb24ge1xuXG5cdFx0Z2V0IG5hbWUoKTogc3RyaW5nIHtcblx0XHQgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xuXHQgICB9XG5cdCAgIFxuXHR9XG59XG4iLCJcclxubW9kdWxlIGhvLmZsdXguYWN0aW9ucyB7XHJcblx0aW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XHJcblxyXG5cdGV4cG9ydCBsZXQgbWFwcGluZzoge1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge307XHJcblx0ZXhwb3J0IGxldCB1c2VEaXIgPSB0cnVlO1xyXG5cclxuXHRleHBvcnQgY2xhc3MgUmVnaXN0cnkge1xyXG5cclxuXHRcdHByaXZhdGUgYWN0aW9uczoge1trZXk6IHN0cmluZ106IEFjdGlvbn0gPSB7fTtcclxuXHJcblx0XHRwcml2YXRlIGFjdGlvbkxvYWRlciA9IG5ldyBoby5jbGFzc2xvYWRlci5DbGFzc0xvYWRlcih7XHJcbiAgICAgICAgICAgdXJsVGVtcGxhdGU6ICdhY3Rpb25zLyR7bmFtZX0uanMnLFxyXG4gICAgICAgICAgIHVzZURpclxyXG4gICAgICAgfSk7XHJcblxyXG5cdFx0cHVibGljIHJlZ2lzdGVyKGFjdGlvbjogQWN0aW9uKTogQWN0aW9uIHtcclxuXHRcdFx0dGhpcy5hY3Rpb25zW2FjdGlvbi5uYW1lXSA9IGFjdGlvbjtcclxuXHRcdFx0cmV0dXJuIGFjdGlvbjtcclxuXHRcdH1cclxuXHJcblx0XHRwdWJsaWMgZ2V0KGFjdGlvbkNsYXNzOiBzdHJpbmcpOiBTdG9yZTxhbnk+XHJcblx0XHRwdWJsaWMgZ2V0PFQgZXh0ZW5kcyBBY3Rpb24+KGFjdGlvbkNsYXNzOiB7bmV3KCk6VH0pOiBUXHJcblx0XHRwdWJsaWMgZ2V0PFQgZXh0ZW5kcyBBY3Rpb24+KGFjdGlvbkNsYXNzOiBhbnkpOiBUIHtcclxuXHRcdFx0bGV0IG5hbWUgPSB2b2lkIDA7XHJcblx0XHRcdGlmKHR5cGVvZiBhY3Rpb25DbGFzcyA9PT0gJ3N0cmluZycpXHJcblx0XHRcdFx0bmFtZSA9IGFjdGlvbkNsYXNzO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0bmFtZSA9IGFjdGlvbkNsYXNzLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XHJcblx0XHRcdHJldHVybiA8VD50aGlzLmFjdGlvbnNbbmFtZV07XHJcblx0XHR9XHJcblxyXG5cdFx0cHVibGljIGxvYWRBY3Rpb24obmFtZTogc3RyaW5nKTogUHJvbWlzZTxBY3Rpb24sIHN0cmluZz4ge1xyXG5cclxuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuXHRcdFx0aWYoISF0aGlzLmFjdGlvbnNbbmFtZV0pXHJcblx0XHRcdFx0cmV0dXJuIFByb21pc2UuY3JlYXRlKHRoaXMuYWN0aW9uc1tuYW1lXSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hY3Rpb25Mb2FkZXIubG9hZCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lLFxyXG5cdFx0XHRcdHVybDogbWFwcGluZ1tuYW1lXSxcclxuICAgICAgICAgICAgICAgIHN1cGVyOiBbXCJoby5mbHV4LmFjdGlvbnMuQWN0aW9uXCJdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChjbGFzc2VzOiBBcnJheTx0eXBlb2YgQWN0aW9uPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2xhc3Nlcy5tYXAoYSA9PiB7XHJcblx0XHRcdFx0XHRpZighc2VsZi5nZXQoYSkpXHJcblx0XHRcdFx0XHRcdHNlbGYucmVnaXN0ZXIobmV3IGEpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5nZXQoY2xhc3Nlcy5wb3AoKSk7XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG59XHJcbiIsIlxyXG5tb2R1bGUgaG8uZmx1eC5yZWdpc3RyeSB7XHJcblx0aW1wb3J0IFByb21pc2UgPSBoby5wcm9taXNlLlByb21pc2U7XHJcblxyXG5cdGV4cG9ydCBsZXQgbWFwcGluZzoge1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge307XHJcblx0ZXhwb3J0IGxldCB1c2VEaXIgPSB0cnVlO1xyXG5cclxuXHRleHBvcnQgY2xhc3MgUmVnaXN0cnkge1xyXG5cclxuXHRcdHByaXZhdGUgc3RvcmVzOiB7W2tleTogc3RyaW5nXTogU3RvcmU8YW55Pn0gPSB7fTtcclxuXHJcblx0XHRwcml2YXRlIHN0b3JlTG9hZGVyID0gbmV3IGhvLmNsYXNzbG9hZGVyLkNsYXNzTG9hZGVyKHtcclxuICAgICAgICAgICB1cmxUZW1wbGF0ZTogJ3N0b3Jlcy8ke25hbWV9LmpzJyxcclxuICAgICAgICAgICB1c2VEaXJcclxuICAgICAgIH0pO1xyXG5cclxuXHRcdHB1YmxpYyByZWdpc3RlcihzdG9yZTogU3RvcmU8YW55Pik6IFN0b3JlPGFueT4ge1xyXG5cdFx0XHR0aGlzLnN0b3Jlc1tzdG9yZS5uYW1lXSA9IHN0b3JlO1xyXG5cdFx0XHRyZXR1cm4gc3RvcmU7XHJcblx0XHR9XHJcblxyXG5cdFx0cHVibGljIGdldChzdG9yZUNsYXNzOiBzdHJpbmcpOiBTdG9yZTxhbnk+XHJcblx0XHRwdWJsaWMgZ2V0PFQgZXh0ZW5kcyBTdG9yZTxhbnk+PihzdG9yZUNsYXNzOiB7bmV3KCk6VH0pOiBUXHJcblx0XHRwdWJsaWMgZ2V0PFQgZXh0ZW5kcyBTdG9yZTxhbnk+PihzdG9yZUNsYXNzOiBhbnkpOiBUIHtcclxuXHRcdFx0bGV0IG5hbWUgPSB2b2lkIDA7XHJcblx0XHRcdGlmKHR5cGVvZiBzdG9yZUNsYXNzID09PSAnc3RyaW5nJylcclxuXHRcdFx0XHRuYW1lID0gc3RvcmVDbGFzcztcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdG5hbWUgPSBzdG9yZUNsYXNzLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XHJcblx0XHRcdHJldHVybiA8VD50aGlzLnN0b3Jlc1tuYW1lXTtcclxuXHRcdH1cclxuXHJcblx0XHRwdWJsaWMgbG9hZFN0b3JlKG5hbWU6IHN0cmluZywgaW5pdCA9IHRydWUpOiBQcm9taXNlPFN0b3JlPGFueT4sIHN0cmluZz4ge1xyXG5cclxuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xyXG5cdFx0XHRsZXQgY2xzOiBBcnJheTx0eXBlb2YgU3RvcmU+ID0gW107XHJcblxyXG5cdFx0XHRpZighIXRoaXMuc3RvcmVzW25hbWVdKVxyXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLmNyZWF0ZSh0aGlzLnN0b3Jlc1tuYW1lXSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdG9yZUxvYWRlci5sb2FkKHtcclxuICAgICAgICAgICAgICAgIG5hbWUsXHJcblx0XHRcdFx0dXJsOiBtYXBwaW5nW25hbWVdLFxyXG4gICAgICAgICAgICAgICAgc3VwZXI6IFtcImhvLmZsdXguU3RvcmVcIl1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKGNsYXNzZXM6IEFycmF5PHR5cGVvZiBTdG9yZT4pID0+IHtcclxuICAgICAgICAgICAgICAgIGNscyA9IGNsYXNzZXM7XHJcblx0XHRcdFx0Y2xhc3NlcyA9IGNsYXNzZXMuZmlsdGVyKGMgPT4ge1xyXG5cdFx0XHRcdFx0cmV0dXJuICFzZWxmLmdldChjKTtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0bGV0IHByb21pc2VzID0gIGNsYXNzZXMubWFwKGMgPT4ge1xyXG5cdFx0XHRcdFx0bGV0IHJlc3VsdDogYW55ID0gc2VsZi5yZWdpc3RlcihuZXcgYyk7XHJcblx0XHRcdFx0XHRpZihpbml0KVxyXG5cdFx0XHRcdFx0XHRyZXN1bHQgPSByZXN1bHQuaW5pdCgpO1xyXG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2UuY3JlYXRlKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xyXG4gICAgICAgICAgICB9KVxyXG5cdFx0XHQudGhlbihwID0+IHtcclxuXHRcdFx0XHRyZXR1cm4gc2VsZi5nZXQoY2xzLnBvcCgpKTtcclxuXHRcdFx0fSlcclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcbn1cclxuIiwiXHJcbm1vZHVsZSBoby5mbHV4IHtcclxuXHJcblx0ZXhwb3J0IGNsYXNzIFN0b3JlPFQ+IGV4dGVuZHMgQ2FsbGJhY2tIb2xkZXIge1xyXG5cclxuXHRcdHN0YXRpYyBoYW5kbGVyTWFwOiBhbnkgPSB7fTtcclxuXHRcdHN0YXRpYyBvbiA9IGZ1bmN0aW9uKHR5cGUpIHtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKHRhcmdldCwga2V5LCBkZXNjKSB7XHJcblx0XHRcdFx0dGFyZ2V0ID0gdGFyZ2V0Lm5hbWU7XHJcblx0XHRcdFx0U3RvcmUuaGFuZGxlck1hcFt0YXJnZXRdID0gU3RvcmUuaGFuZGxlck1hcFt0YXJnZXRdIHx8IHt9O1xyXG5cdFx0XHRcdFN0b3JlLmhhbmRsZXJNYXBbdGFyZ2V0XVt0eXBlXSA9IFN0b3JlLmhhbmRsZXJNYXBbdGFyZ2V0XVt0eXBlXSB8fCBbXTtcclxuXHRcdFx0XHRTdG9yZS5oYW5kbGVyTWFwW3RhcmdldF1bdHlwZV0ucHVzaChrZXkpXHJcblx0XHRcdFx0cmV0dXJuIGRlc2M7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRwcm90ZWN0ZWQgZGF0YTogVDtcclxuXHRcdHB1YmxpYyBpZDogc3RyaW5nO1xyXG5cdFx0cHJpdmF0ZSBoYW5kbGVyczoge1trZXk6IHN0cmluZ106IEZ1bmN0aW9ufSA9IHt9O1xyXG5cdFx0cHJvdGVjdGVkIGFjdGlvbnM6IHN0cmluZ1tdID0gW107XHJcblxyXG5cdFx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHRcdHN1cGVyKCk7XHJcblx0XHRcdHRoaXMuaWQgPSBoby5mbHV4LkRJU1BBVENIRVIucmVnaXN0ZXIodGhpcy5oYW5kbGUuYmluZCh0aGlzKSk7XHJcblxyXG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XHJcblx0XHRcdGxldCBoYW5kbGVycyA9IFN0b3JlLmhhbmRsZXJNYXBbdGhpcy5uYW1lXTtcclxuXHRcdFx0Zm9yKHZhciB0eXBlIGluIGhhbmRsZXJzKSB7XHJcblx0XHRcdFx0bGV0IG1ldGhvZEtleXMgPSBoYW5kbGVyc1t0eXBlXTtcclxuXHRcdFx0XHRtZXRob2RLZXlzLmZvckVhY2goa2V5ID0+IHtcclxuXHRcdFx0XHRcdGxldCBtZXRob2QgPSBzZWxmW2tleV0uYmluZChzZWxmKTtcclxuXHRcdFx0XHRcdHNlbGYub24odHlwZSwgbWV0aG9kKTtcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9XHJcblx0XHRcdC8vaG8uZmx1eC5TVE9SRVMucmVnaXN0ZXIodGhpcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0cHVibGljIGluaXQoKTogaG8ucHJvbWlzZS5Qcm9taXNlPGFueSwgYW55PiB7XHJcblx0XHRcdHJldHVybiBoby5wcm9taXNlLlByb21pc2UuYWxsKHRoaXMuYWN0aW9ucy5tYXAoYT0+e1xyXG5cdFx0XHRcdHJldHVybiBoby5mbHV4LkFDVElPTlMubG9hZEFjdGlvbihhKTtcclxuXHRcdFx0fSkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdCBnZXQgbmFtZSgpOiBzdHJpbmcge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xyXG5cdFx0fVxyXG5cclxuXHRcdHB1YmxpYyByZWdpc3RlcihjYWxsYmFjazogKGRhdGE6VCk9PnZvaWQsIHNlbGY/OmFueSk6IHN0cmluZyB7XHJcblx0XHRcdHJldHVybiBzdXBlci5yZWdpc3RlcihjYWxsYmFjaywgc2VsZik7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJvdGVjdGVkIG9uKHR5cGU6IHN0cmluZywgZnVuYzogRnVuY3Rpb24pOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5oYW5kbGVyc1t0eXBlXSA9IGZ1bmM7XHJcblx0XHR9XHJcblxyXG5cdFx0cHJvdGVjdGVkIGhhbmRsZShhY3Rpb246IElBY3Rpb24pOiB2b2lkIHtcclxuXHRcdFx0aWYodHlwZW9mIHRoaXMuaGFuZGxlcnNbYWN0aW9uLnR5cGVdID09PSAnZnVuY3Rpb24nKVxyXG5cdFx0XHRcdHRoaXMuaGFuZGxlcnNbYWN0aW9uLnR5cGVdKGFjdGlvbi5kYXRhKTtcclxuXHRcdH07XHJcblxyXG5cclxuXHRcdHByb3RlY3RlZCBjaGFuZ2VkKCk6IHZvaWQge1xyXG5cdFx0XHRmb3IgKGxldCBpZCBpbiB0aGlzLmNhbGxiYWNrcykge1xyXG5cdFx0XHQgIGxldCBjYiA9IHRoaXMuY2FsbGJhY2tzW2lkXTtcclxuXHRcdFx0ICBpZihjYilcclxuXHRcdFx0ICBcdGNiKHRoaXMuZGF0YSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblxyXG5cdH07XHJcblxyXG5cclxufVxyXG4iLCJcclxubW9kdWxlIGhvLmZsdXgge1xyXG5cclxuXHRleHBvcnQgaW50ZXJmYWNlIElBY3Rpb24ge1xyXG5cdCAgICB0eXBlOnN0cmluZztcclxuXHRcdGRhdGE/OmFueTtcclxuXHR9XHJcblxyXG5cdGV4cG9ydCBjbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgQ2FsbGJhY2tIb2xkZXIge1xyXG5cclxuICAgIFx0cHJpdmF0ZSBpc1BlbmRpbmc6IHtba2V5OnN0cmluZ106Ym9vbGVhbn0gPSB7fTtcclxuICAgIFx0cHJpdmF0ZSBpc0hhbmRsZWQ6IHtba2V5OnN0cmluZ106Ym9vbGVhbn0gPSB7fTtcclxuICAgIFx0cHJpdmF0ZSBpc0Rpc3BhdGNoaW5nOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBcdHByaXZhdGUgcGVuZGluZ1BheWxvYWQ6IElBY3Rpb24gPSBudWxsO1xyXG5cclxuXHRcdHB1YmxpYyB3YWl0Rm9yKC4uLmlkczogQXJyYXk8bnVtYmVyPik6IHZvaWQge1xyXG5cdFx0XHRpZighdGhpcy5pc0Rpc3BhdGNoaW5nKVxyXG5cdFx0ICBcdFx0dGhyb3cgJ0Rpc3BhdGNoZXIud2FpdEZvciguLi4pOiBNdXN0IGJlIGludm9rZWQgd2hpbGUgZGlzcGF0Y2hpbmcuJztcclxuXHJcblx0XHRcdGZvciAobGV0IGlpID0gMDsgaWkgPCBpZHMubGVuZ3RoOyBpaSsrKSB7XHJcblx0XHRcdCAgbGV0IGlkID0gaWRzW2lpXTtcclxuXHJcblx0XHRcdCAgaWYgKHRoaXMuaXNQZW5kaW5nW2lkXSkge1xyXG5cdFx0ICAgICAgXHRpZighdGhpcy5pc0hhbmRsZWRbaWRdKVxyXG5cdFx0XHQgICAgICBcdHRocm93IGB3YWl0Rm9yKC4uLik6IENpcmN1bGFyIGRlcGVuZGVuY3kgZGV0ZWN0ZWQgd2hpbGUgd2F0aW5nIGZvciAke2lkfWA7XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdCAgfVxyXG5cclxuXHRcdFx0ICBpZighdGhpcy5jYWxsYmFja3NbaWRdKVxyXG5cdFx0XHQgIFx0dGhyb3cgYHdhaXRGb3IoLi4uKTogJHtpZH0gZG9lcyBub3QgbWFwIHRvIGEgcmVnaXN0ZXJlZCBjYWxsYmFjay5gO1xyXG5cclxuXHRcdFx0ICB0aGlzLmludm9rZUNhbGxiYWNrKGlkKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0XHRwdWJsaWMgZGlzcGF0Y2goYWN0aW9uOiBJQWN0aW9uKSB7XHJcblx0XHRcdGlmKHRoaXMuaXNEaXNwYXRjaGluZylcclxuXHRcdCAgICBcdHRocm93ICdDYW5ub3QgZGlzcGF0Y2ggaW4gdGhlIG1pZGRsZSBvZiBhIGRpc3BhdGNoLic7XHJcblxyXG5cdFx0XHR0aGlzLnN0YXJ0RGlzcGF0Y2hpbmcoYWN0aW9uKTtcclxuXHJcblx0XHQgICAgdHJ5IHtcclxuXHRcdCAgICAgIGZvciAobGV0IGlkIGluIHRoaXMuY2FsbGJhY2tzKSB7XHJcblx0XHQgICAgICAgIGlmICh0aGlzLmlzUGVuZGluZ1tpZF0pIHtcclxuXHRcdCAgICAgICAgICBjb250aW51ZTtcclxuXHRcdCAgICAgICAgfVxyXG5cdFx0ICAgICAgICB0aGlzLmludm9rZUNhbGxiYWNrKGlkKTtcclxuXHRcdCAgICAgIH1cclxuXHRcdCAgICB9IGZpbmFsbHkge1xyXG5cdFx0ICAgICAgdGhpcy5zdG9wRGlzcGF0Y2hpbmcoKTtcclxuXHRcdCAgICB9XHJcblx0XHR9O1xyXG5cclxuXHQgIFx0cHJpdmF0ZSBpbnZva2VDYWxsYmFjayhpZDogbnVtYmVyKTogdm9pZCB7XHJcblx0ICAgIFx0dGhpcy5pc1BlbmRpbmdbaWRdID0gdHJ1ZTtcclxuXHQgICAgXHR0aGlzLmNhbGxiYWNrc1tpZF0odGhpcy5wZW5kaW5nUGF5bG9hZCk7XHJcblx0ICAgIFx0dGhpcy5pc0hhbmRsZWRbaWRdID0gdHJ1ZTtcclxuXHQgIFx0fVxyXG5cclxuXHQgIFx0cHJpdmF0ZSBzdGFydERpc3BhdGNoaW5nKHBheWxvYWQ6IElBY3Rpb24pOiB2b2lkIHtcclxuXHQgICAgXHRmb3IgKGxldCBpZCBpbiB0aGlzLmNhbGxiYWNrcykge1xyXG5cdCAgICAgIFx0XHR0aGlzLmlzUGVuZGluZ1tpZF0gPSBmYWxzZTtcclxuXHQgICAgICBcdFx0dGhpcy5pc0hhbmRsZWRbaWRdID0gZmFsc2U7XHJcblx0ICAgIFx0fVxyXG5cdCAgICBcdHRoaXMucGVuZGluZ1BheWxvYWQgPSBwYXlsb2FkO1xyXG5cdCAgICBcdHRoaXMuaXNEaXNwYXRjaGluZyA9IHRydWU7XHJcbiAgXHRcdH1cclxuXHJcblx0ICBcdHByaXZhdGUgc3RvcERpc3BhdGNoaW5nKCk6IHZvaWQge1xyXG5cdCAgICBcdHRoaXMucGVuZGluZ1BheWxvYWQgPSBudWxsO1xyXG5cdCAgICBcdHRoaXMuaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xyXG5cdCAgXHR9XHJcblx0fVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi9ib3dlcl9jb21wb25lbnRzL2hvLXByb21pc2UvZGlzdC9wcm9taXNlLmQudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi9ib3dlcl9jb21wb25lbnRzL2hvLWNsYXNzbG9hZGVyL2Rpc3QvY2xhc3Nsb2FkZXIuZC50c1wiLz5cclxuXHJcbm1vZHVsZSBoby5mbHV4IHtcclxuXHRpbXBvcnQgUHJvbWlzZSA9IGhvLnByb21pc2UuUHJvbWlzZTtcclxuXHJcblx0ZXhwb3J0IGxldCBESVNQQVRDSEVSOiBEaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcclxuXHJcblx0ZXhwb3J0IGxldCBTVE9SRVM6IHJlZ2lzdHJ5LlJlZ2lzdHJ5ID0gbmV3IHJlZ2lzdHJ5LlJlZ2lzdHJ5KCk7XHJcblxyXG5cdGV4cG9ydCBsZXQgQUNUSU9OUzogYWN0aW9ucy5SZWdpc3RyeSA9IG5ldyBhY3Rpb25zLlJlZ2lzdHJ5KCk7XHJcblxyXG5cdGV4cG9ydCBsZXQgZGlyOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG5cclxuXHQvKlxyXG5cdGV4cG9ydCBmdW5jdGlvbiBydW4ocm91dGVyOmFueSA9IFJvdXRlcik6IFByb21pc2U8YW55LCBhbnk+IHtcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZTxhbnksIGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cdFx0XHRpZighIVNUT1JFUy5nZXQocm91dGVyKSlcclxuXHRcdFx0XHRyZXNvbHZlKFNUT1JFUy5nZXQocm91dGVyKSlcclxuXHRcdFx0ZWxzZSBpZihyb3V0ZXIgPT09IFJvdXRlcilcclxuXHRcdFx0XHRyZXNvbHZlKG5ldyBSb3V0ZXIoKSk7XHJcblx0XHRcdGVsc2UgaWYodHlwZW9mIHJvdXRlciA9PT0gJ2Z1bmN0aW9uJylcclxuXHRcdFx0XHRyZXNvbHZlKG5ldyByb3V0ZXIoKSlcclxuXHRcdFx0ZWxzZSBpZih0eXBlb2Ygcm91dGVyID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRcdFNUT1JFUy5sb2FkU3RvcmUocm91dGVyKVxyXG5cdFx0XHRcdC50aGVuKHMgPT4gcmVzb2x2ZShzKSlcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHRcdC50aGVuKHIgPT4ge1xyXG5cdFx0XHRyZXR1cm4gU1RPUkVTLnJlZ2lzdGVyKHIpLmluaXQoKTtcclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcblx0Ki9cclxufVxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=