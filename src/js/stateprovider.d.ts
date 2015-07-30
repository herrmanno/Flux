/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts" />
/// <reference path="state.d.ts" />
declare module ho.flux.stateprovider {
    import Promise = ho.promise.Promise;
    interface IStateProvider {
        useMin: boolean;
        resolve(): string;
        getStates(name?: string): Promise<IStates, string>;
    }
    let instance: IStateProvider;
}
