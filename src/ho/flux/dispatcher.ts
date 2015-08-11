
module ho.flux {

	export interface IAction {
	    type:string;
		data?:any;
	}

	export class Dispatcher extends CallbackHolder {

    	private isPending: {[key:string]:boolean} = {};
    	private isHandled: {[key:string]:boolean} = {};
    	private isDispatching: boolean = false;
    	private pendingPayload: IAction = null;

		public waitFor(...ids: Array<number>): void {
			if(!this.isDispatching)
		  		throw 'Dispatcher.waitFor(...): Must be invoked while dispatching.';

			for (let ii = 0; ii < ids.length; ii++) {
			  let id = ids[ii];

			  if (this.isPending[id]) {
		      	if(!this.isHandled[id])
			      	throw `waitFor(...): Circular dependency detected while wating for ${id}`;
				continue;
			  }

			  if(!this.callbacks[id])
			  	throw `waitFor(...): ${id} does not map to a registered callback.`;

			  this.invokeCallback(id);
			}
		};

		public dispatch(action: IAction) {
			if(this.isDispatching)
		    	throw 'Cannot dispatch in the middle of a dispatch.';

			this.startDispatching(action);

		    try {
		      for (let id in this.callbacks) {
		        if (this.isPending[id]) {
		          continue;
		        }
		        this.invokeCallback(id);
		      }
		    } finally {
		      this.stopDispatching();
		    }
		};

	  	private invokeCallback(id: number): void {
	    	this.isPending[id] = true;
	    	this.callbacks[id](this.pendingPayload);
	    	this.isHandled[id] = true;
	  	}

	  	private startDispatching(payload: IAction): void {
	    	for (let id in this.callbacks) {
	      		this.isPending[id] = false;
	      		this.isHandled[id] = false;
	    	}
	    	this.pendingPayload = payload;
	    	this.isDispatching = true;
  		}

	  	private stopDispatching(): void {
	    	this.pendingPayload = null;
	    	this.isDispatching = false;
	  	}
	}
}
