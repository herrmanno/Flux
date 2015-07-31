/// <reference path="./callbackholder.ts"/>
/// <reference path="./storeregistry.ts"/>

module ho.flux {

	export class Store<T> extends CallbackHolder {

		protected data: T;
		private id: string;
		private handlers: {[key: string]: Function} = {};


		constructor() {
			super();
			this.id = ho.flux.DISPATCHER.register(this.handle.bind(this));
			//ho.flux.STORES[this.name] = this;
			ho.flux.STORES.register(this);
		}

		 get name(): string {
			return this.constructor.toString().match(/\w+/g)[1];
		}

		public register(callback: (data:T)=>void, self?:any): string {
			return super.register(callback, self);
		}

		protected on(type: string, func: Function): void {
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
