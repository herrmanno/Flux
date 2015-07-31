/// <reference path="../dist/d.ts/state.d.ts"/>
var States = (function () {
    function States() {
        this.login = {
            name: 'login',
            url: 'login',
            view: [
                { name: 'view1', html: '<!-- requires="Loginform"--><Loginform/>' }
            ]
        };
        this.register = {
            name: 'register',
            url: 'register',
            view: [
                { name: 'view1', html: 'html/register.html' }
            ]
        };
        this.private = {
            name: 'private',
            url: 'private',
            view: [
                { name: 'view1', html: 'html/private.html' }
            ],
            before: function () {
                return new ho.promise.Promise(function (resolve, reject) {
                    var s = typeof LoginStore !== 'undefined' && ho.flux.STORES.get(LoginStore);
                    if (s && s.isLoggedIn())
                        resolve(null);
                    else {
                        window.alert("You're a bad boy...");
                        reject({ state: 'login' });
                    }
                });
            }
        };
        this.catchall = {
            name: 'catchall',
            url: '.*',
            redirect: 'login'
        };
        this.states = [
            this.login,
            this.register,
            this.private,
            this.catchall
        ];
    }
    return States;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3RhdGVzLnRzIl0sIm5hbWVzIjpbIlN0YXRlcyIsIlN0YXRlcy5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6IkFBQUEsK0NBQStDO0FBRS9DO0lBQUFBO1FBRUNDLFVBQUtBLEdBQUdBO1lBQ1BBLElBQUlBLEVBQUVBLE9BQU9BO1lBQ2JBLEdBQUdBLEVBQUVBLE9BQU9BO1lBQ1pBLElBQUlBLEVBQUVBO2dCQUNMQSxFQUFDQSxJQUFJQSxFQUFFQSxPQUFPQSxFQUFFQSxJQUFJQSxFQUFFQSwwQ0FBMENBLEVBQUNBO2FBQ2pFQTtTQUNEQSxDQUFBQTtRQUVEQSxhQUFRQSxHQUFHQTtZQUNWQSxJQUFJQSxFQUFFQSxVQUFVQTtZQUNoQkEsR0FBR0EsRUFBRUEsVUFBVUE7WUFDZkEsSUFBSUEsRUFBRUE7Z0JBQ0xBLEVBQUNBLElBQUlBLEVBQUVBLE9BQU9BLEVBQUVBLElBQUlBLEVBQUVBLG9CQUFvQkEsRUFBQ0E7YUFDM0NBO1NBQ0RBLENBQUFBO1FBRURBLFlBQU9BLEdBQUdBO1lBQ1RBLElBQUlBLEVBQUVBLFNBQVNBO1lBQ2ZBLEdBQUdBLEVBQUVBLFNBQVNBO1lBQ2RBLElBQUlBLEVBQUVBO2dCQUNMQSxFQUFDQSxJQUFJQSxFQUFFQSxPQUFPQSxFQUFFQSxJQUFJQSxFQUFFQSxtQkFBbUJBLEVBQUNBO2FBQzFDQTtZQUNEQSxNQUFNQSxFQUFFQTtnQkFDUEEsTUFBTUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQ0EsT0FBT0EsRUFBRUEsTUFBTUE7b0JBQzdDQSxJQUFJQSxDQUFDQSxHQUFlQSxPQUFPQSxVQUFVQSxLQUFLQSxXQUFXQSxJQUFJQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtvQkFDeEZBLEVBQUVBLENBQUFBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO3dCQUN0QkEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ2ZBLElBQUlBLENBQUNBLENBQUNBO3dCQUNMQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxxQkFBcUJBLENBQUNBLENBQUNBO3dCQUNwQ0EsTUFBTUEsQ0FBQ0EsRUFBQ0EsS0FBS0EsRUFBRUEsT0FBT0EsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzFCQSxDQUFDQTtnQkFDRkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDSkEsQ0FBQ0E7U0FDREEsQ0FBQUE7UUFFREEsYUFBUUEsR0FBR0E7WUFDVkEsSUFBSUEsRUFBRUEsVUFBVUE7WUFDaEJBLEdBQUdBLEVBQUVBLElBQUlBO1lBQ1RBLFFBQVFBLEVBQUVBLE9BQU9BO1NBQ2pCQSxDQUFBQTtRQUVEQSxXQUFNQSxHQUFHQTtZQUNSQSxJQUFJQSxDQUFDQSxLQUFLQTtZQUNWQSxJQUFJQSxDQUFDQSxRQUFRQTtZQUNiQSxJQUFJQSxDQUFDQSxPQUFPQTtZQUNaQSxJQUFJQSxDQUFDQSxRQUFRQTtTQUNiQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUFERCxhQUFDQTtBQUFEQSxDQUFDQSxBQWpERCxJQWlEQyJ9