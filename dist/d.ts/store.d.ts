/// <reference path="callbackholder.d.ts" />
/// <reference path="storeregistry.d.ts" />
declare module ho.flux {
    class Store extends CallbackHolder {
        protected data: any;
        private id;
        private handlers;
        constructor();
        protected init(): void;
        protected on(type: string, func: (data: any) => any): void;
        protected handle(action: IAction): void;
        protected changed(): void;
    }
}
