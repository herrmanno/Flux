/// <reference path="../../dist/flux.d.ts"/>
/// <reference path="../bower_components/ho-components/dist/components.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Loginform = (function (_super) {
    __extends(Loginform, _super);
    function Loginform() {
        _super.apply(this, arguments);
        this.html = "<input id=\"username\"/>\n\t\t<input id=\"password\"/>\n\t\t<button onclick=\"{#login()}\">Login</button>\n\t\t<p>{error}</p>\n\t\t";
        this.error = '';
    }
    Loginform.prototype.init = function () {
        var _this = this;
        return ho.flux.STORES.loadStore('LoginStore')
            .then(function () {
            ho.flux.STORES.get(LoginStore).register(_this.loginStoreChanged, _this);
        });
    };
    Loginform.prototype.login = function () {
        var data = {
            name: this.children['username'].value,
            password: this.children['password'].value
        };
        ho.flux.STORES.get(LoginStore).login(data);
    };
    Loginform.prototype.loginStoreChanged = function (data) {
        if (typeof data.error === 'string') {
            this.error = data.error;
            this.render();
        }
    };
    return Loginform;
})(ho.components.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW5mb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibG9naW5mb3JtLnRzIl0sIm5hbWVzIjpbIkxvZ2luZm9ybSIsIkxvZ2luZm9ybS5jb25zdHJ1Y3RvciIsIkxvZ2luZm9ybS5pbml0IiwiTG9naW5mb3JtLmxvZ2luIiwiTG9naW5mb3JtLmxvZ2luU3RvcmVDaGFuZ2VkIl0sIm1hcHBpbmdzIjoiQUFBQSw0Q0FBNEM7QUFDNUMsOEVBQThFOzs7Ozs7QUFFOUU7SUFBd0JBLDZCQUF1QkE7SUFBL0NBO1FBQXdCQyw4QkFBdUJBO1FBRTlDQSxTQUFJQSxHQUNIQSxxSUFJQ0EsQ0FBQ0E7UUFHS0EsVUFBS0EsR0FBV0EsRUFBRUEsQ0FBQ0E7SUF1QjVCQSxDQUFDQTtJQXJCQUQsd0JBQUlBLEdBQUpBO1FBQUFFLGlCQUtDQTtRQUpBQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxZQUFZQSxDQUFDQTthQUM1Q0EsSUFBSUEsQ0FBQ0E7WUFDTEEsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBSUEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxLQUFJQSxDQUFDQSxDQUFDQTtRQUN2RUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDSkEsQ0FBQ0E7SUFFREYseUJBQUtBLEdBQUxBO1FBQ0NHLElBQUlBLElBQUlBLEdBQUdBO1lBQ1ZBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLEtBQUtBO1lBQ3JDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxLQUFLQTtTQUN6Q0EsQ0FBQ0E7UUFDRkEsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDNUNBLENBQUNBO0lBRVNILHFDQUFpQkEsR0FBM0JBLFVBQTRCQSxJQUFvQkE7UUFDL0NJLEVBQUVBLENBQUFBLENBQUNBLE9BQU9BLElBQUlBLENBQUNBLEtBQUtBLEtBQUtBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25DQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUN4QkEsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDZkEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFDRkosZ0JBQUNBO0FBQURBLENBQUNBLEFBakNELEVBQXdCLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQWlDOUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vZGlzdC9mbHV4LmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vYm93ZXJfY29tcG9uZW50cy9oby1jb21wb25lbnRzL2Rpc3QvY29tcG9uZW50cy5kLnRzXCIvPlxuXG5jbGFzcyBMb2dpbmZvcm0gZXh0ZW5kcyBoby5jb21wb25lbnRzLkNvbXBvbmVudCB7XG5cblx0aHRtbCA9XG5cdFx0YDxpbnB1dCBpZD1cInVzZXJuYW1lXCIvPlxuXHRcdDxpbnB1dCBpZD1cInBhc3N3b3JkXCIvPlxuXHRcdDxidXR0b24gb25jbGljaz1cInsjbG9naW4oKX1cIj5Mb2dpbjwvYnV0dG9uPlxuXHRcdDxwPntlcnJvcn08L3A+XG5cdFx0YDtcblxuXHRwcml2YXRlIHN0b3JlOiBMb2dpblN0b3JlO1xuXHRwcml2YXRlIGVycm9yOiBzdHJpbmcgPSAnJztcblxuXHRpbml0KCkge1xuXHRcdHJldHVybiBoby5mbHV4LlNUT1JFUy5sb2FkU3RvcmUoJ0xvZ2luU3RvcmUnKVxuXHRcdC50aGVuKCgpPT4ge1xuXHRcdFx0aG8uZmx1eC5TVE9SRVMuZ2V0KExvZ2luU3RvcmUpLnJlZ2lzdGVyKHRoaXMubG9naW5TdG9yZUNoYW5nZWQsIHRoaXMpO1xuXHRcdH0pO1xuXHR9XG5cblx0bG9naW4oKSB7XG5cdFx0bGV0IGRhdGEgPSB7XG5cdFx0XHRuYW1lOiB0aGlzLmNoaWxkcmVuWyd1c2VybmFtZSddLnZhbHVlLFxuXHRcdFx0cGFzc3dvcmQ6IHRoaXMuY2hpbGRyZW5bJ3Bhc3N3b3JkJ10udmFsdWVcblx0XHR9O1xuXHRcdGhvLmZsdXguU1RPUkVTLmdldChMb2dpblN0b3JlKS5sb2dpbihkYXRhKTtcblx0fVxuXG5cdHByb3RlY3RlZCBsb2dpblN0b3JlQ2hhbmdlZChkYXRhOiBMb2dpblN0b3JlRGF0YSk6IHZvaWQge1xuXHRcdGlmKHR5cGVvZiBkYXRhLmVycm9yID09PSAnc3RyaW5nJykge1xuXHRcdFx0dGhpcy5lcnJvciA9IGRhdGEuZXJyb3I7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH1cblx0fVxufVxuIl19