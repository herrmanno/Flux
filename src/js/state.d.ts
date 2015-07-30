/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts" />
declare module ho.flux {
    import Promise = ho.promise.Promise;
    interface IState {
        name: string;
        url: string;
        redirect?: string;
        before?: () => Promise<any, any>;
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
