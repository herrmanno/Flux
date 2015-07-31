/// <reference path="../../dist/d.ts/router.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MyRouter = (function (_super) {
    __extends(MyRouter, _super);
    function MyRouter() {
        _super.call(this);
        this.on('LOGIN_SUCCES', this.onStateChangeRequested.bind(this, { state: 'login' }));
    }
    return MyRouter;
})(ho.flux.Router);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXlSb3V0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJNeVJvdXRlci50cyJdLCJuYW1lcyI6WyJNeVJvdXRlciIsIk15Um91dGVyLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiQUFDQSxtREFBbUQ7Ozs7OztBQUVuRDtJQUF1QkEsNEJBQWNBO0lBRXBDQTtRQUNDQyxpQkFBT0EsQ0FBQ0E7UUFDUkEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsY0FBY0EsRUFBRUEsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFDQSxLQUFLQSxFQUFFQSxPQUFPQSxFQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNuRkEsQ0FBQ0E7SUFFRkQsZUFBQ0E7QUFBREEsQ0FBQ0EsQUFQRCxFQUF1QixFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFPcEMifQ==