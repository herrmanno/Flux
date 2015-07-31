/// <reference path="callbackholder.d.ts" />
/// <reference path="storeregistry.d.ts" />
declare module ho.flux {
    class Store<T> extends CallbackHolder {
        protected data: T;
        private id;
        private handlers;
        constructor();
        name: string;
        protected init(): void;
        register(callback: (data: T) => void, self?: any): string;
        protected on(type: string, func: Function): void;
        protected handle(action: IAction): void;
        protected changed(): void;
    }
}
