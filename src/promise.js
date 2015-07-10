(function() {
	window.Promise = function Promise(onResolve, onReject) {
		var self = this;

		this.data = undefined;

		this.resolved = false;
		this.rejected = false;
		this.done = false;

		if(typeof onResolve === 'function')
			this.onResolve = onResolve;
		if(typeof onReject === 'function')
			this.onReject = onReject;
		if(typeof onResolve === 'string')
			this.name = onResolve;

		this.ret = undefined;


		this.set = function(data) {
			if(self.done)
				throw "Promise is already resolved / rejected";
			self.data = data;
		};

		this.resolve = function(data) {
			self.set(data);
			self.resolved = self.done = true;
			if(self.onResolve) {
				self._resolve();
			}
		};

		this._resolve = function() {
			if(!self.ret) {
				self.ret = new Promise('Return-Promise' + self.name);
			}

			var v = self.onResolve(self.data);

			if(v && v instanceof Promise) {
				v.then(self.ret.resolve, self.ret.reject);
			}
			else {
				self.ret.resolve(v);
			}

		};

		this.reject = function(data) {
			self.set(data);
			self.rejected = self.done = true;

			if(self.onReject) {
				self.onReject(this.data);
			}
			if(self.ret) {
				self.ret.reject(this.data);
			}
		};

		this._reject = function() {
			if(!self.ret) {
				self.ret = new Promise('Return-Promise' + self.name);
			}

			self.onReject(self.data);
			self.ret.reject(self.data);
		};

		this.then = function(res, rej) {
			self.ret = new Promise('Return-Promise' + self.name);

			if(res && typeof res === 'function')
				self.onResolve = res;

			if(rej && typeof rej === 'function')
				self.onReject = rej;


			if(self.resolved) {
				self._resolve();
			}

			if(self.rejected) {
				self._reject();
			}

			return self.ret;
		};

		this.catch = function(cb) {
			self.onReject = cb;
			if(self.rejected)
				self._reject();
		};
	};

	window.Promise.all = function(arr) {
		var p = new Promise();

		var data = [];

		if(arr.length === 0) {
			p.resolve();
		} else {
			arr.forEach(function(prom, index) {
				prom
				.then(function(d) {
					if(p.done)
						return;

					data[index] = d;
					var allResolved = arr.reduce(function(state, p1) {
						return state && p1.resolved;
					}, true);
					if(allResolved) {
						p.resolve(data);
					}

				})
				.catch(function(err) {
					p.reject(err);
				});
			});
		}

		return p;
	};

})();
