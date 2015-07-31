var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var LoginStore = (function (_super) {
    __extends(LoginStore, _super);
    function LoginStore() {
        _super.call(this);
    }
    LoginStore.prototype.login = function (user) {
        var found = (JSON.parse(localStorage['users']) || [])
            .filter(function (u) {
            return u.name === user.name && u.password === user.password;
        })[0];
        if (found) {
            this.data = found;
            this.changed();
            ho.flux.DISPATCHER.dispatch({ type: LoginStore.actions.LOGIN_SUCCES });
        }
    };
    LoginStore.prototype.isLoggedIn = function () {
        return !!this.data;
    };
    LoginStore.actions = {
        LOGIN_SUCCES: 'LOGIN_SUCCES',
        LOGIN_ERROR: 'LOGIN_ERROR'
    };
    return LoginStore;
})(ho.flux.Store);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9naW5TdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkxvZ2luU3RvcmUudHMiXSwibmFtZXMiOlsiTG9naW5TdG9yZSIsIkxvZ2luU3RvcmUuY29uc3RydWN0b3IiLCJMb2dpblN0b3JlLmxvZ2luIiwiTG9naW5TdG9yZS5pc0xvZ2dlZEluIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBO0lBQXlCQSw4QkFBb0JBO0lBTTVDQTtRQUNDQyxpQkFBT0EsQ0FBQ0E7SUFDVEEsQ0FBQ0E7SUFFREQsMEJBQUtBLEdBQUxBLFVBQU1BLElBQVdBO1FBQ2hCRSxJQUFJQSxLQUFLQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxZQUFZQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTthQUNwREEsTUFBTUEsQ0FBQ0EsVUFBQ0EsQ0FBQ0E7WUFDVEEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsS0FBS0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7UUFDN0RBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBRU5BLEVBQUVBLENBQUFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ1ZBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBO1lBQ2xCQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtZQUNmQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFDQSxJQUFJQSxFQUFFQSxVQUFVQSxDQUFDQSxPQUFPQSxDQUFDQSxZQUFZQSxFQUFDQSxDQUFDQSxDQUFDQTtRQUN0RUEsQ0FBQ0E7SUFFRkEsQ0FBQ0E7SUFFREYsK0JBQVVBLEdBQVZBO1FBQ0NHLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO0lBQ3BCQSxDQUFDQTtJQXpCTUgsa0JBQU9BLEdBQUdBO1FBQ2hCQSxZQUFZQSxFQUFFQSxjQUFjQTtRQUM1QkEsV0FBV0EsRUFBRUEsYUFBYUE7S0FDMUJBLENBQUFBO0lBMEJGQSxpQkFBQ0E7QUFBREEsQ0FBQ0EsQUE5QkQsRUFBeUIsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBOEJyQyJ9