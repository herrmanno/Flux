/// <reference path="../dist/d.ts/state.d.ts"/>
var States = (function () {
    function States() {
        this.login = {
            name: 'login',
            url: 'login',
            view: [
                { name: 'view1', html: 'html/login.html' }
            ]
        };
        this.register = {
            name: 'register',
            url: 'register',
            view: [
                { name: 'view1', html: 'html/register.html' }
            ]
        };
        this.catchall = {
            name: 'catchall',
            url: '.*',
            redirect: 'login'
        };
        this.states = [
            this.login,
            this.register,
            this.catchall
        ];
    }
    return States;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3RhdGVzLnRzIl0sIm5hbWVzIjpbIlN0YXRlcyIsIlN0YXRlcy5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6IkFBQUEsK0NBQStDO0FBRS9DO0lBQUFBO1FBRUNDLFVBQUtBLEdBQUdBO1lBQ1BBLElBQUlBLEVBQUVBLE9BQU9BO1lBQ2JBLEdBQUdBLEVBQUVBLE9BQU9BO1lBQ1pBLElBQUlBLEVBQUVBO2dCQUNMQSxFQUFDQSxJQUFJQSxFQUFFQSxPQUFPQSxFQUFFQSxJQUFJQSxFQUFFQSxpQkFBaUJBLEVBQUNBO2FBQ3hDQTtTQUNEQSxDQUFBQTtRQUVEQSxhQUFRQSxHQUFHQTtZQUNWQSxJQUFJQSxFQUFFQSxVQUFVQTtZQUNoQkEsR0FBR0EsRUFBRUEsVUFBVUE7WUFDZkEsSUFBSUEsRUFBRUE7Z0JBQ0xBLEVBQUNBLElBQUlBLEVBQUVBLE9BQU9BLEVBQUVBLElBQUlBLEVBQUVBLG9CQUFvQkEsRUFBQ0E7YUFDM0NBO1NBQ0RBLENBQUFBO1FBRURBLGFBQVFBLEdBQUdBO1lBQ1ZBLElBQUlBLEVBQUVBLFVBQVVBO1lBQ2hCQSxHQUFHQSxFQUFFQSxJQUFJQTtZQUNUQSxRQUFRQSxFQUFFQSxPQUFPQTtTQUNqQkEsQ0FBQUE7UUFFREEsV0FBTUEsR0FBR0E7WUFDUkEsSUFBSUEsQ0FBQ0EsS0FBS0E7WUFDVkEsSUFBSUEsQ0FBQ0EsUUFBUUE7WUFDYkEsSUFBSUEsQ0FBQ0EsUUFBUUE7U0FDYkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFBREQsYUFBQ0E7QUFBREEsQ0FBQ0EsQUE3QkQsSUE2QkMifQ==