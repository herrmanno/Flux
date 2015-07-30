/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
/// <reference path="./state.ts"/>

module ho.flux.stateprovider {
	import Promise = ho.promise.Promise;

    export interface IStateProvider {
        useMin:boolean;
		resolve(): string;
		getStates(name?:string): Promise<IStates, string>;
    }

	class StateProvider implements IStateProvider {

        useMin: boolean = false;

        resolve(): string {
            return this.useMin ?
                `states.min.js` :
                `states.js`;
        }

        getStates(name = "States"): Promise<IStates, string> {
			return new Promise<IStates, any>((resolve, reject) => {
                let src = this.resolve();
                let script = document.createElement('script');
                script.onload = function() {
                    resolve(new window[name]);
                };
				script.onerror = reject;
                script.src = src;
                document.getElementsByTagName('head')[0].appendChild(script);
            });

        }

    }

    export let instance: IStateProvider = new StateProvider();
}
