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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3RhdGVzLnRzIl0sIm5hbWVzIjpbIlN0YXRlcyIsIlN0YXRlcy5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6IkFBQUEsK0NBQStDO0FBRS9DO0lBQUFBO1FBRUNDLFVBQUtBLEdBQUdBO1lBQ1BBLElBQUlBLEVBQUVBLE9BQU9BO1lBQ2JBLEdBQUdBLEVBQUVBLE9BQU9BO1lBQ1pBLElBQUlBLEVBQUVBO2dCQUNMQSxFQUFDQSxJQUFJQSxFQUFFQSxPQUFPQSxFQUFFQSxJQUFJQSxFQUFFQSwwQ0FBMENBLEVBQUNBO2FBQ2pFQTtTQUNEQSxDQUFBQTtRQUVEQSxhQUFRQSxHQUFHQTtZQUNWQSxJQUFJQSxFQUFFQSxVQUFVQTtZQUNoQkEsR0FBR0EsRUFBRUEsVUFBVUE7WUFDZkEsSUFBSUEsRUFBRUE7Z0JBQ0xBLEVBQUNBLElBQUlBLEVBQUVBLE9BQU9BLEVBQUVBLElBQUlBLEVBQUVBLG9CQUFvQkEsRUFBQ0E7YUFDM0NBO1NBQ0RBLENBQUFBO1FBRURBLFlBQU9BLEdBQUdBO1lBQ1RBLElBQUlBLEVBQUVBLFNBQVNBO1lBQ2ZBLEdBQUdBLEVBQUVBLFNBQVNBO1lBQ2RBLElBQUlBLEVBQUVBO2dCQUNMQSxFQUFDQSxJQUFJQSxFQUFFQSxPQUFPQSxFQUFFQSxJQUFJQSxFQUFFQSxtQkFBbUJBLEVBQUNBO2FBQzFDQTtZQUNEQSxNQUFNQSxFQUFFQTtnQkFDUEEsTUFBTUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQ0EsT0FBT0EsRUFBRUEsTUFBTUE7b0JBQzdDQSxJQUFJQSxDQUFDQSxHQUFlQSxPQUFPQSxVQUFVQSxLQUFLQSxXQUFXQSxJQUFJQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtvQkFDeEZBLEVBQUVBLENBQUFBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO3dCQUN0QkEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ2ZBLElBQUlBLENBQUNBLENBQUNBO3dCQUNMQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxxQkFBcUJBLENBQUNBLENBQUNBO3dCQUNwQ0EsTUFBTUEsQ0FBQ0EsRUFBQ0EsS0FBS0EsRUFBRUEsT0FBT0EsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzFCQSxDQUFDQTtnQkFDRkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDSkEsQ0FBQ0E7U0FDREEsQ0FBQUE7UUFFREEsYUFBUUEsR0FBR0E7WUFDVkEsSUFBSUEsRUFBRUEsVUFBVUE7WUFDaEJBLEdBQUdBLEVBQUVBLElBQUlBO1lBQ1RBLFFBQVFBLEVBQUVBLE9BQU9BO1NBQ2pCQSxDQUFBQTtRQUVEQSxXQUFNQSxHQUFHQTtZQUNSQSxJQUFJQSxDQUFDQSxLQUFLQTtZQUNWQSxJQUFJQSxDQUFDQSxRQUFRQTtZQUNiQSxJQUFJQSxDQUFDQSxPQUFPQTtZQUNaQSxJQUFJQSxDQUFDQSxRQUFRQTtTQUNiQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUFERCxhQUFDQTtBQUFEQSxDQUFDQSxBQWpERCxJQWlEQyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kaXN0L2QudHMvc3RhdGUuZC50c1wiLz5cblxuY2xhc3MgU3RhdGVzIGltcGxlbWVudHMgaG8uZmx1eC5JU3RhdGVzIHtcblxuXHRsb2dpbiA9IHtcblx0XHRuYW1lOiAnbG9naW4nLFxuXHRcdHVybDogJ2xvZ2luJyxcblx0XHR2aWV3OiBbXG5cdFx0XHR7bmFtZTogJ3ZpZXcxJywgaHRtbDogJzwhLS0gcmVxdWlyZXM9XCJMb2dpbmZvcm1cIi0tPjxMb2dpbmZvcm0vPid9XG5cdFx0XVxuXHR9XG5cblx0cmVnaXN0ZXIgPSB7XG5cdFx0bmFtZTogJ3JlZ2lzdGVyJyxcblx0XHR1cmw6ICdyZWdpc3RlcicsXG5cdFx0dmlldzogW1xuXHRcdFx0e25hbWU6ICd2aWV3MScsIGh0bWw6ICdodG1sL3JlZ2lzdGVyLmh0bWwnfVxuXHRcdF1cblx0fVxuXG5cdHByaXZhdGUgPSB7XG5cdFx0bmFtZTogJ3ByaXZhdGUnLFxuXHRcdHVybDogJ3ByaXZhdGUnLFxuXHRcdHZpZXc6IFtcblx0XHRcdHtuYW1lOiAndmlldzEnLCBodG1sOiAnaHRtbC9wcml2YXRlLmh0bWwnfVxuXHRcdF0sXG5cdFx0YmVmb3JlOiAoKSA9PiB7XG5cdFx0XHRyZXR1cm4gbmV3IGhvLnByb21pc2UuUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRcdGxldCBzOiBMb2dpblN0b3JlID0gdHlwZW9mIExvZ2luU3RvcmUgIT09ICd1bmRlZmluZWQnICYmIGhvLmZsdXguU1RPUkVTLmdldChMb2dpblN0b3JlKTtcblx0XHRcdFx0aWYocyAmJiBzLmlzTG9nZ2VkSW4oKSlcblx0XHRcdFx0XHRyZXNvbHZlKG51bGwpO1xuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHR3aW5kb3cuYWxlcnQoXCJZb3UncmUgYSBiYWQgYm95Li4uXCIpO1xuXHRcdFx0XHRcdHJlamVjdCh7c3RhdGU6ICdsb2dpbid9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0Y2F0Y2hhbGwgPSB7XG5cdFx0bmFtZTogJ2NhdGNoYWxsJyxcblx0XHR1cmw6ICcuKicsXG5cdFx0cmVkaXJlY3Q6ICdsb2dpbidcblx0fVxuXG5cdHN0YXRlcyA9IFtcblx0XHR0aGlzLmxvZ2luLFxuXHRcdHRoaXMucmVnaXN0ZXIsXG5cdFx0dGhpcy5wcml2YXRlLFxuXHRcdHRoaXMuY2F0Y2hhbGxcblx0XTtcbn1cbiJdfQ==