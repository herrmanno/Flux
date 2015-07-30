/// <reference path="dispatcher.d.ts" />
/// <reference path="state.d.ts" />
/// <reference path="stateprovider.d.ts" />
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts" />
declare module ho.flux {
    interface IRouteData {
        state: string;
        args: any;
        extern: boolean;
    }
}
