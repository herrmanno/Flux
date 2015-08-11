var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Navbar = (function (_super) {
    __extends(Navbar, _super);
    function Navbar() {
        _super.apply(this, arguments);
        this.loggedin = false;
        this.html = "\n\t\t<a href=\"#login\">Login</a>\n\t\t<a href=\"#register\">Register</a>\n\t\t<a href=\"#private\" {{!loggedin ? 'hidden': ''}}>Private</a>\n\t\t";
    }
    ;
    Navbar.prototype.init = function () {
        var self = this;
        return ho.flux.STORES.loadStore('LoginStore')
            .then(function (s) {
            s.register(self.loginStoreChanged, self);
        });
    };
    Navbar.prototype.loginStoreChanged = function (data) {
        this.loggedin = !!data.name;
        this.render();
    };
    return Navbar;
})(ho.components.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2YmFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibmF2YmFyLnRzIl0sIm5hbWVzIjpbIk5hdmJhciIsIk5hdmJhci5jb25zdHJ1Y3RvciIsIk5hdmJhci5pbml0IiwiTmF2YmFyLmxvZ2luU3RvcmVDaGFuZ2VkIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBO0lBQXFCQSwwQkFBdUJBO0lBQTVDQTtRQUFxQkMsOEJBQXVCQTtRQUN4Q0EsYUFBUUEsR0FBWUEsS0FBS0EsQ0FBQ0E7UUFFN0JBLFNBQUlBLEdBQ0hBLHFKQUlDQSxDQUFDQTtJQWNKQSxDQUFDQTs7SUFaQ0QscUJBQUlBLEdBQUpBO1FBQ0NFLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2hCQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxZQUFZQSxDQUFDQTthQUM1Q0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsQ0FBcUJBO1lBQzNCQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQzFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNKQSxDQUFDQTtJQUVTRixrQ0FBaUJBLEdBQTNCQSxVQUE0QkEsSUFBb0JBO1FBQy9DRyxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFBQTtRQUMzQkEsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7SUFDZkEsQ0FBQ0E7SUFDSEgsYUFBQ0E7QUFBREEsQ0FBQ0EsQUF0QkQsRUFBcUIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBc0IzQyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIE5hdmJhciBleHRlbmRzIGhvLmNvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgICBsb2dnZWRpbjogYm9vbGVhbiA9IGZhbHNlOztcblxuXHRodG1sID1cblx0XHRgXG5cdFx0PGEgaHJlZj1cIiNsb2dpblwiPkxvZ2luPC9hPlxuXHRcdDxhIGhyZWY9XCIjcmVnaXN0ZXJcIj5SZWdpc3RlcjwvYT5cblx0XHQ8YSBocmVmPVwiI3ByaXZhdGVcIiB7eyFsb2dnZWRpbiA/ICdoaWRkZW4nOiAnJ319PlByaXZhdGU8L2E+XG5cdFx0YDtcblxuXHRcdGluaXQoKSB7XG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cdFx0XHRyZXR1cm4gaG8uZmx1eC5TVE9SRVMubG9hZFN0b3JlKCdMb2dpblN0b3JlJylcblx0XHRcdC50aGVuKChzOiBoby5mbHV4LlN0b3JlPGFueT4pPT4ge1xuXHRcdFx0XHRzLnJlZ2lzdGVyKHNlbGYubG9naW5TdG9yZUNoYW5nZWQsIHNlbGYpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cHJvdGVjdGVkIGxvZ2luU3RvcmVDaGFuZ2VkKGRhdGE6IExvZ2luU3RvcmVEYXRhKTogdm9pZCB7XG5cdFx0XHR0aGlzLmxvZ2dlZGluID0gISFkYXRhLm5hbWVcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fVxufVxuIl19