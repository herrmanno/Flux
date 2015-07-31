/// <reference path="./store"/>
/// <reference path="./dispatcher.ts"/>
/// <reference path="./state.ts"/>
/// <reference path="./stateprovider.ts"/>

/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>


module ho.flux {

	import Promise = ho.promise.Promise;


	/** Data that a Router#go takes */
	export interface IRouteData {
	    state: string;
		args: any;
		extern: boolean;
	}

	/** Data that Router#changes emit to its listeners */
	export interface IRouterData {
	    state: IState;
		args: any;
		extern: boolean;
	}

	export class Router extends Store<IRouterData> {

		private mapping:Array<IState> = null;
		private state:IState;
		private args:any = null;

		constructor() {
			super();
			this.on('STATE', this.onStateChangeRequested.bind(this));
		}

		public _init(): Promise<any, any> {
			let onHashChange = this.onHashChange.bind(this);
			return this.initStates()
			.then(() => {
				window.onhashchange = onHashChange;
				onHashChange();
			});
		}


		public go(data: IRouteData): void {
			ho.flux.DISPATCHER.dispatch({
				type: 'STATE',
				data: data
			});
		}

		private initStates(): Promise<any, any> {
			return stateprovider.instance.getStates()
			.then((istates) => {
				this.mapping = istates.states;
			});
		}

		private getStateFromName(name: string): IState {
			return this.mapping.filter((s)=>{
				return s.name === name
			})[0];
		}

		private onStateChangeRequested(data: IRouteData): void {
			//current state and args equals requested state and args -> return
			if(this.state && this.state.name === data.state && this.equals(this.args, data.args))
				return;

			//get requested state
			let state = this.getStateFromName(data.state);


			//requested state has an redirect property -> call redirect state
			if(!!state.redirect) {
				state = this.getStateFromName(state.redirect);
			}


			//TODO handler promises & actions


			//does the state change request comes from extern e.g. url change in browser window ?
			let extern = !! data.extern;

			//------- set current state & arguments
			this.state = state;
			this.args = data.args;

			this.data = {
				state: state,
				args: data.args,
				extern: extern,
			};

			//------- set url for browser
			var url = this.urlFromState(state.url, data.args);
			this.setUrl(url);

			this.changed();
		}

		private onHashChange(): void {
			let s = this.stateFromUrl(window.location.hash.substr(1));

			ho.flux.DISPATCHER.dispatch({
				type: 'STATE',
				data: {
					state: s.state,
					args: s.args,
					extern: true,
				}
			});
		}

		private setUrl(url: string): void {
			if(window.location.hash.substr(1) === url)
				return;

			let l = window.onhashchange;
			window.onhashchange = null;
			window.location.hash = url;
			window.onhashchange = l;
		}

		private regexFromUrl(url: string): string {
			var regex = /:([\w]+)/;
			while(url.match(regex)) {
				url = url.replace(regex, "([^\/]+)");
			}
			return url+'$';
		}

		private argsFromUrl(pattern: string, url: string): any {
			let r = this.regexFromUrl(pattern);
			let names = pattern.match(r).slice(1);
			let values = url.match(r).slice(1);

			let args = {};
			names.forEach(function(name, i) {
				args[name.substr(1)] = values[i];
			});

			return args;
		}

		private stateFromUrl(url: string): IRouteData {
			var s = void 0;
			this.mapping.forEach((state: IState) => {
				if(s)
					return;

				var r = this.regexFromUrl(state.url);
				if(url.match(r)) {
					var args = this.argsFromUrl(state.url, url);
					s = {
						"state": state.name,
						"args": args,
						"extern": false
					};
				}
			});

			if(!s)
				throw "No State found for url "+url;

			return s;
		}

		private urlFromState(url: string, args: any): string {
			let regex = /:([\w]+)/;
			while(url.match(regex)) {
				url = url.replace(regex, function(m) {
					return args[m.substr(1)];
				});
			}
			return url;
		}

		private equals(o1: any, o2: any) : boolean {
			return JSON.stringify(o1) === JSON.stringify(o2);
		}

	}
}
