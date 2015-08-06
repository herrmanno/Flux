
module ho.flux {
	import Promise = ho.promise.Promise;


	export interface IState {
		name: string;
		url: string;
		redirect?: string;
		before?: (data: IRouteData)=>Promise<any, any>;
		view?: Array<IViewState>;
	}

	export interface IViewState {
	    name: string;
		html: string;
	}

	export interface IStates {
	    states: Array<IState>;
	}

}
