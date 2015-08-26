module ho.flux.actions {
	export class Action {

		get name(): string {
		   return this.constructor.toString().match(/\w+/g)[1];
	   }
	   
	}
}
