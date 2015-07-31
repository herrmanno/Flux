/// <reference path="dispatcher.d.ts" />
/// <reference path="state.d.ts" />
/// <reference path="stateprovider.d.ts" />
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts" />
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
        private state;
        private args;
        constructor();
        init(): Promise<any, any>;
        go(data: IRouteData): void;
        private initStates();
        private getStateFromName(name);
        private onStateChangeRequested(data);
        private onHashChange();
        private setUrl(url);
        private regexFromUrl(url);
        private argsFromUrl(pattern, url);
        private stateFromUrl(url);
        private urlFromState(url, args);
        private equals(o1, o2);
    }
}
