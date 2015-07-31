/// <reference path="../../dist/d.ts/store.d.ts"/>
/// <reference path="../../dist/d.ts/flux.d.ts"/>
/// <reference path="../../dist/d.ts/router.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var View = (function (_super) {
    __extends(View, _super);
    function View() {
        _super.apply(this, arguments);
        this.properties = [
            { name: 'viewname', required: true }
        ];
    }
    View.prototype.init = function () {
        ho.flux.STORES.get(ho.flux.Router).register(this.state_changed, this);
    };
    Object.defineProperty(View.prototype, "viewname", {
        get: function () {
            return this.properties['viewname'];
        },
        enumerable: true,
        configurable: true
    });
    View.prototype.state_changed = function (data) {
        var _this = this;
        var html = data.state.view.filter(function (v) {
            return v.name === _this.viewname;
        })[0].html;
        this.getHtml(html)
            .then(function (html) {
            this.html = false;
            this.element.innerHTML = html;
            this.render();
        }.bind(this));
    };
    View.prototype.getHtml = function (html) {
        if (typeof html === 'undefined')
            return ho.promise.Promise.create(null);
        else if (html.slice(-5) !== '.html')
            return ho.promise.Promise.create(html);
        else
            return new ho.promise.Promise(function (resolve, reject) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4) {
                        var resp = xmlhttp.responseText;
                        if (xmlhttp.status == 200) {
                            resolve(resp);
                        }
                        else {
                            reject(resp);
                        }
                    }
                };
                xmlhttp.open('GET', html, true);
                xmlhttp.send();
            });
    };
    return View;
})(ho.components.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInZpZXcudHMiXSwibmFtZXMiOlsiVmlldyIsIlZpZXcuY29uc3RydWN0b3IiLCJWaWV3LmluaXQiLCJWaWV3LnZpZXduYW1lIiwiVmlldy5zdGF0ZV9jaGFuZ2VkIiwiVmlldy5nZXRIdG1sIl0sIm1hcHBpbmdzIjoiQUFBQSxrREFBa0Q7QUFDbEQsaURBQWlEO0FBQ2pELG1EQUFtRDs7Ozs7O0FBRW5EO0lBQW1CQSx3QkFBdUJBO0lBQTFDQTtRQUFtQkMsOEJBQXVCQTtRQUV6Q0EsZUFBVUEsR0FBR0E7WUFDWkEsRUFBQ0EsSUFBSUEsRUFBRUEsVUFBVUEsRUFBRUEsUUFBUUEsRUFBRUEsSUFBSUEsRUFBQ0E7U0FDbENBLENBQUNBO0lBa0RIQSxDQUFDQTtJQWhEQUQsbUJBQUlBLEdBQUpBO1FBQ0NFLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO0lBRXZFQSxDQUFDQTtJQUVERixzQkFBSUEsMEJBQVFBO2FBQVpBO1lBQ0NHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1FBQ3BDQSxDQUFDQTs7O09BQUFIO0lBRURBLDRCQUFhQSxHQUFiQSxVQUFjQSxJQUF5QkE7UUFBdkNJLGlCQVdDQTtRQVZBQSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxVQUFDQSxDQUFDQTtZQUNuQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsS0FBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7UUFDakNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBO1FBRVhBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBO2FBQ2pCQSxJQUFJQSxDQUFDQSxVQUFTQSxJQUFJQTtZQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztZQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDOUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsQ0FBQyxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNmQSxDQUFDQTtJQUVTSixzQkFBT0EsR0FBakJBLFVBQWtCQSxJQUFZQTtRQUM3QkssRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsSUFBSUEsS0FBS0EsV0FBV0EsQ0FBQ0E7WUFDOUJBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3hDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFBQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxPQUFPQSxDQUFDQTtZQUNsQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDeENBLElBQUlBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLFVBQUNBLE9BQU9BLEVBQUVBLE1BQU1BO2dCQUVsREEsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsY0FBY0EsRUFBRUEsQ0FBQ0E7Z0JBQ25DQSxPQUFPQSxDQUFDQSxrQkFBa0JBLEdBQUdBO29CQUM1QixFQUFFLENBQUEsQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzVCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7d0JBQ2hDLEVBQUUsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQzs0QkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNmLENBQUM7d0JBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNkLENBQUM7b0JBQ0YsQ0FBQztnQkFDRixDQUFDLENBQUNBO2dCQUVGQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDaENBLE9BQU9BLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1lBQ2hCQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVKQSxDQUFDQTtJQUdGTCxXQUFDQTtBQUFEQSxDQUFDQSxBQXRERCxFQUFtQixFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFzRHpDIn0=