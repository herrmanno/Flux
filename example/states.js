/// <reference path="../dist/d.ts/state.d.ts"/>
var State = (function () {
    function State() {
        this.states = [
            this.login,
            this.catchall
        ];
        this.login = {
            name: 'login',
            url: 'login',
        };
        this.catchall = {
            name: 'catchall',
            url: '*'
        };
    }
    return State;
})();
//# sourceMappingURL=states.js.map