/// <reference path="./store"/>
/// <reference path="./dispatcher.ts"/>
/// <reference path="./state.ts"/>
/// <reference path="./stateprovider.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>
var ho;
(function (ho) {
    var flux;
    (function (flux) {
        var Router = (function (_super) {
            __extends(Router, _super);
            function Router() {
                _super.call(this);
                this.mapping = null;
                this.args = null;
                this.on('STATE', this.onStateChangeRequested);
                this.initStates();
                window.onhashchange = this.onHashChange;
            }
            Router.prototype.go = function (data) {
                ho.flux.DISPATCHER.dispatch({
                    type: 'STATE',
                    data: data
                });
            };
            Router.prototype.initStates = function () {
                var _this = this;
                flux.stateprovider.instance.getStates()
                    .then(function (istates) {
                    _this.mapping = istates.states;
                });
            };
            Router.prototype.getStateFromName = function (name) {
                return this.mapping.filter(function (s) {
                    return s.name === name;
                })[0];
            };
            Router.prototype.onStateChangeRequested = function (data) {
                //current state and args equals requested state and args -> return
                if (this.state && this.state.name === data.state && this.args === data.args)
                    return;
                //get requested state
                var state = this.getStateFromName(data.state);
                //requested state has an redirect property -> call redirect state
                if (!!state.redirect) {
                    state = this.getStateFromName(state.redirect);
                }
                //TODO handler promises & actions
                //does the state change request comes from extern e.g. url change in browser window ?
                var extern = !!data.extern;
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
            };
            Router.prototype.onHashChange = function () {
                var s = this.stateFromUrl(window.location.hash.substr(1));
                ho.flux.DISPATCHER.dispatch({
                    type: 'STATE',
                    data: {
                        state: s.state,
                        args: s.args,
                        extern: true,
                    }
                });
            };
            /*
            private handle = {
                'STATE': function(data) {
                    this.states[data.state](data.args, data.extern);
                }
            }
            */
            Router.prototype.setUrl = function (url) {
                if (window.location.hash.substr(1) === url)
                    return;
                var l = window.onhashchange;
                window.onhashchange = null;
                window.location.hash = url;
                window.onhashchange = l;
            };
            Router.prototype.regexFromUrl = function (url) {
                var regex = /:([\w]+)/;
                while (url.match(regex)) {
                    url = url.replace(regex, "([^\/]+)");
                }
                return url + '$';
            };
            Router.prototype.argsFromUrl = function (pattern, url) {
                var r = this.regexFromUrl(pattern);
                var names = pattern.match(r).slice(1);
                var values = url.match(r).slice(1);
                var args = {};
                names.forEach(function (name, i) {
                    args[name.substr(1)] = values[i];
                });
                return args;
            };
            Router.prototype.stateFromUrl = function (url) {
                var _this = this;
                var s = void 0;
                this.mapping.forEach(function (state) {
                    if (s)
                        return;
                    var r = _this.regexFromUrl(state.url);
                    if (url.match(r)) {
                        var args = _this.argsFromUrl(state.url, url);
                        s = {
                            "state": state.name,
                            "args": args,
                            "extern": false
                        };
                    }
                });
                if (!s)
                    throw "No State found for url " + url;
                return s;
            };
            Router.prototype.urlFromState = function (url, args) {
                var regex = /:([\w]+)/;
                while (url.match(regex)) {
                    url = url.replace(regex, function (m) {
                        return args[m.substr(1)];
                    });
                }
                return url;
            };
            return Router;
        })(flux.Store);
    })(flux = ho.flux || (ho.flux = {}));
})(ho || (ho = {}));
