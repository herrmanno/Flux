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
            .then(function (h) {
            html = h;
            return this.loadDynamicRequirements(html);
        }.bind(this))
            .then(function () {
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
    View.prototype.loadDynamicRequirements = function (html) {
        var requirements = html.match(/<!--\s*requires?="(.+)"/);
        if (requirements !== null)
            requirements = requirements[1].split(",").map(function (r) { return r.trim(); });
        else
            requirements = [];
        var Registry = ho.components.registry.instance;
        var promises = requirements
            .filter(function (req) {
            return !Registry.hasComponent(req);
        })
            .map(function (req) {
            return Registry.loadComponent(req);
        });
        return ho.promise.Promise.all(promises);
    };
    return View;
})(ho.components.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInZpZXcudHMiXSwibmFtZXMiOlsiVmlldyIsIlZpZXcuY29uc3RydWN0b3IiLCJWaWV3LmluaXQiLCJWaWV3LnZpZXduYW1lIiwiVmlldy5zdGF0ZV9jaGFuZ2VkIiwiVmlldy5nZXRIdG1sIiwiVmlldy5sb2FkRHluYW1pY1JlcXVpcmVtZW50cyJdLCJtYXBwaW5ncyI6IkFBQUEsa0RBQWtEO0FBQ2xELGlEQUFpRDtBQUNqRCxtREFBbUQ7Ozs7OztBQUVuRDtJQUFtQkEsd0JBQXVCQTtJQUExQ0E7UUFBbUJDLDhCQUF1QkE7UUFFekNBLGVBQVVBLEdBQUdBO1lBQ1pBLEVBQUNBLElBQUlBLEVBQUVBLFVBQVVBLEVBQUVBLFFBQVFBLEVBQUVBLElBQUlBLEVBQUNBO1NBQ2xDQSxDQUFDQTtJQXlFSEEsQ0FBQ0E7SUF2RUFELG1CQUFJQSxHQUFKQTtRQUNDRSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUV2RUEsQ0FBQ0E7SUFFREYsc0JBQUlBLDBCQUFRQTthQUFaQTtZQUNDRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUNwQ0EsQ0FBQ0E7OztPQUFBSDtJQUVEQSw0QkFBYUEsR0FBYkEsVUFBY0EsSUFBeUJBO1FBQXZDSSxpQkFlQ0E7UUFkQUEsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsVUFBQ0EsQ0FBQ0E7WUFDbkNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLEtBQUlBLENBQUNBLFFBQVFBLENBQUNBO1FBQ2pDQSxDQUFD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QSxRQUFRQSxHQUFHQSxFQUFFQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUUvQ0EsSUFBSUEsUUFBUUEsR0FBR0EsWUFBWUE7YUFDcEJBLE1BQU1BLENBQUNBLFVBQUNBLEdBQUdBO1lBQ1JBLE1BQU1BLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLFlBQVlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3ZDQSxDQUFDQSxDQUFDQTthQUNEQSxHQUFHQSxDQUFDQSxVQUFDQSxHQUFHQTtZQUNMQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxhQUFhQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUN2Q0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFVEEsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDekNBLENBQUNBO0lBR0ZOLFdBQUNBO0FBQURBLENBQUNBLEFBN0VELEVBQW1CLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQTZFekMifQ==