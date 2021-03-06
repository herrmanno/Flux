/// <reference path="bower_components/ho-promise/dist/promise.d.ts" />
/// <reference path="bower_components/ho-classloader/dist/classloader.d.ts" />
declare module ho.flux {
    class CallbackHolder {
        protected prefix: string;
        protected lastID: number;
        protected callbacks: {
            [key: string]: Function;
        };
        register(callback: Function, self?: any): string;
        unregister(id: any): void;
    }
}
declare module ho.flux {
    interface IAction {
        type: string;
        data?: any;
    }
    class Dispatcher extends CallbackHolder {
        private isPending;
        private isHandled;
        private isDispatching;
        private pendingPayload;
        waitFor(...ids: Array<number>): void;
        dispatch(action: IAction): void;
        private invokeCallback(id);
        private startDispatching(payload);
        private stopDispatching();
    }
}
declare module ho.flux {
    let DISPATCHER: Dispatcher;
    let STORES: registry.Registry;
    let ACTIONS: actions.Registry;
    let dir: boolean;
}
declare module ho.flux {
    import Promise = ho.promise.Promise;
    /** Data that a Router#go takes */
    interface IRouteData {
        state: string;
        args: any;
        extern: boolean;
    }
    /** Data that Router#changes emit to its listeners */
    interface IRouterData {
        state: IState;
        args: any;
        extern: boolean;
    }
    class Router extends Store<IRouterData> {
        private mapping;
        init(): Promise<any, any>;
        go(state: string, data?: any): void;
        go(data: IRouteData): void;
        private initStates();
        private getStateFromName(name);
        protected onStateChangeRequested(data: IRouteData): void;
        private onHashChange();
        private setUrl(url);
        private regexFromUrl(url);
        private argsFromUrl(pattern, url);
        private stateFromUrl(url);
        private urlFromState(url, args);
        private equals(o1, o2);
    }
}
declare module ho.flux {
    import Promise = ho.promise.Promise;
    interface IState {
        name: string;
        url: string;
        redirect?: string;
        before?: (data: IRouteData) => Promise<any, any>;
        view?: Array<IViewState>;
    }
    interface IViewState {
        name: string;
        html: string;
    }
    interface IStates {
        states: Array<IState>;
    }
}
declare module ho.flux {
    class Store<T> extends CallbackHolder {
        static handlerMap: any;
        static on: (type: any) => (target: any, key: any, desc: any) => any;
        protected data: T;
        id: string;
        private handlers;
        protected actions: string[];
        constructor();
        init(): ho.promise.Promise<any, any>;
        name: string;
        register(callback: (data: T) => void, self?: any): string;
        protected on(type: string, func: Function): void;
        protected handle(action: IAction): void;
        protected changed(): void;
    }
}
declare module ho.flux.actions {
    class Action {
        name: string;
    }
}
declare module ho.flux.actions {
    import Promise = ho.promise.Promise;
    let mapping: {
        [key: string]: string;
    };
    let useDir: boolean;
    class Registry {
        private actions;
        private actionLoader;
        register(action: Action): Action;
        get(actionClass: string): Store<any>;
        get<T extends Action>(actionClass: {
            new (): T;
        }): T;
        loadAction(name: string): Promise<Action, string>;
    }
}
declare module ho.flux.registry {
    import Promise = ho.promise.Promise;
    let mapping: {
        [key: string]: string;
    };
    let useDir: boolean;
    class Registry {
        private stores;
        private storeLoader;
        register(store: Store<any>): Store<any>;
        get(storeClass: string): Store<any>;
        get<T extends Store<any>>(storeClass: {
            new (): T;
        }): T;
        loadStore(name: string, init?: boolean): Promise<Store<any>, string>;
    }
}
declare module ho.flux.stateprovider {
    import Promise = ho.promise.Promise;
    interface IStateProvider {
        useMin: boolean;
        resolve(): string;
        getStates(name?: string): Promise<IStates, string>;
    }
    let instance: IStateProvider;
}
