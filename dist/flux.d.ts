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
declare module ho.flux.storeprovider {
    import Promise = ho.promise.Promise;
    interface IStoreProvider {
        useMin: boolean;
        resolve(name: string): string;
        getStore(name: string): Promise<typeof Store, string>;
    }
    let mapping: {
        [name: string]: string;
    };
    let instance: IStoreProvider;
}
declare module ho.flux {
    import Promise = ho.promise.Promise;
    class Storeregistry {
        private stores;
        register(store: Store<any>): Store<any>;
        get<T extends Store<any>>(storeClass: {
            new (): T;
        }): T;
        loadStore(name: string): Promise<Store<any>, string>;
        protected getParentOfStore(name: string): Promise<string, any>;
    }
}
declare module ho.flux {
    class Store<T> extends CallbackHolder {
        protected data: T;
        private id;
        private handlers;
        constructor();
        init(): any;
        name: string;
        register(callback: (data: T) => void, self?: any): string;
        protected on(type: string, func: Function): void;
        protected handle(action: IAction): void;
        protected changed(): void;
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
declare module ho.flux.stateprovider {
    import Promise = ho.promise.Promise;
    interface IStateProvider {
        useMin: boolean;
        resolve(): string;
        getStates(name?: string): Promise<IStates, string>;
    }
    let instance: IStateProvider;
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
        constructor();
        init(): Promise<any, any>;
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
    let DISPATCHER: Dispatcher;
    let STORES: Storeregistry;
    function run(): Promise<any, any>;
}
