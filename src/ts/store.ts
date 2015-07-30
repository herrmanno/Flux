/// <reference path="./callbackholder.ts"/>
/// <reference path="./storeregistry.ts"/>

module ho.flux {

	export class Store extends CallbackHolder {

		protected data: any;
		private id: string;
		private handlers: {[key: string]: Function} = {};


		constructor() {
			super();
			this.id = ho.flux.DISPATCHER.register(this.handle);
			this.init();
		}

		protected init(): void {}

		protected on(type: string, func: (data: any)=>any): void {
			this.handlers[type] = func;
		}

		protected handle(action: IAction): void {
			if(typeof this.handlers[action.type] === 'function')
				this.handlers[action.type](action.data);
		};


		protected changed(): void {
			for (let id in this.callbacks) {
			  let cb = this.callbacks[id];
			  if(cb)
			  	cb(this.data);
			}
		}


	};


}
