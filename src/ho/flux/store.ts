
module ho.flux {

	export class Store<T> extends CallbackHolder {

		static handlerMap: any = {};
		static on = function(type) {
			return function(target, key, desc) {
				Store.handlerMap[target] = Store.handlerMap[target] || {};
				Store.handlerMap[target][type] = Store.handlerMap[target][type] || [];
				Store.handlerMap[target][type].push(key)
				return desc;
			}
		}

		protected data: T;
		private id: string;
		private handlers: {[key: string]: Function} = {};
		protected actions: string[] = [];

		constructor() {
			super();
			this.id = ho.flux.DISPATCHER.register(this.handle.bind(this));

			let self = this;
			let handlers = Store.handlerMap[this.constructor.prototype];
			for(var type in handlers) {
				let methodKeys = handlers[type];
				methodKeys.forEach(key => {
					let method = self[key].bind(self);
					self.on(type, method);
				})
			}
			//ho.flux.STORES.register(this);
		}

		public init(): ho.promise.Promise<any, any> {
			return ho.promise.Promise.all(this.actions.map(a=>{
				return ho.flux.ACTIONS.loadAction(a);
			}));
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
