/// <reference path="callbackholder.d.ts" />
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
