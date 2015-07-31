var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Loginform = (function (_super) {
    __extends(Loginform, _super);
    function Loginform() {
        _super.apply(this, arguments);
        this.html = "<input id=\"username\"/>\n\t\t<input id=\"password\"/>\n\t\t<button onclick=\"{#login()}>Login</button>\n\t\t<p>{error}</p>\n\t\t";
        this.error = '';
    }
    Loginform.prototype.init = function () {
        var _this = this;
        return ho.flux.STORES.loadStore('LoginStore')
            .then(function (s) {
            _this.store = s;
            _this.store;
        });
    };
    Loginform.prototype.login = function () {
        var data = {
            name: this.children['username'].value,
            password: this.children['password'].value
        };
        ho.flux.STORES.get(LoginStore).login(data);
    };
    return Loginform;
})(ho.components.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW5mb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibG9naW5mb3JtLnRzIl0sIm5hbWVzIjpbIkxvZ2luZm9ybSIsIkxvZ2luZm9ybS5jb25zdHJ1Y3RvciIsIkxvZ2luZm9ybS5pbml0IiwiTG9naW5mb3JtLmxvZ2luIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBO0lBQXdCQSw2QkFBdUJBO0lBQS9DQTtRQUF3QkMsOEJBQXVCQTtRQUU5Q0EsU0FBSUEsR0FDSEEsbUlBSUNBLENBQUNBO1FBR0tBLFVBQUtBLEdBQVdBLEVBQUVBLENBQUNBO0lBaUI1QkEsQ0FBQ0E7SUFmQUQsd0JBQUlBLEdBQUpBO1FBQUFFLGlCQU1DQTtRQUxBQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxZQUFZQSxDQUFDQTthQUM1Q0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsQ0FBQ0E7WUFDUEEsS0FBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsS0FBSUEsQ0FBQ0EsS0FBS0EsQ0FBQUE7UUFDWEEsQ0FBQ0EsQ0FBQ0EsQ0FBQUE7SUFDSEEsQ0FBQ0E7SUFFREYseUJBQUtBLEdBQUxBO1FBQ0NHLElBQUlBLElBQUlBLEdBQUdBO1lBQ1ZBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLEtBQUtBO1lBQ3JDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxLQUFLQTtTQUN6Q0EsQ0FBQ0E7UUFDRkEsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDNUNBLENBQUNBO0lBQ0ZILGdCQUFDQTtBQUFEQSxDQUFDQSxBQTNCRCxFQUF3QixFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsRUEyQjlDIn0=