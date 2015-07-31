/// <reference path="../../dist/d.ts/store.d.ts"/>
/// <reference path="../../dist/d.ts/flux.d.ts"/>
/// <reference path="../../dist/d.ts/router.d.ts"/>

class View extends ho.components.Component {

	properties = [
		{name: 'viewname', required: true}
	];

	init() {
		ho.flux.STORES.get(ho.flux.Router).register(this.state_changed, this);
		//ho.flux.STORES['Router'].register(this.state_changed.bind(this));
	}

	get viewname() {
		return this.properties['viewname'];
	}

	state_changed(data: ho.flux.IRouterData): void {
		let html = data.state.view.filter((v) => {
			return v.name === this.viewname;
		})[0].html;

		this.getHtml(html)
		.then(function(html) {
			this.html = false;
			this.element.innerHTML = html;
			this.render();
		}.bind(this));
	}

	protected getHtml(html: string):  ho.promise.Promise<string, string> {
		if(typeof html === 'undefined')
			return ho.promise.Promise.create(null);
		else if(html.slice(-5) !== '.html')
			return ho.promise.Promise.create(html);
		else return new ho.promise.Promise((resolve, reject) => {

			let xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function() {
				if(xmlhttp.readyState == 4) {
					var resp = xmlhttp.responseText;
					if(xmlhttp.status == 200) {
						resolve(resp);
					} else {
						reject(resp);
					}
				}
			};

			xmlhttp.open('GET', html, true);
			xmlhttp.send();
		});

	}


}