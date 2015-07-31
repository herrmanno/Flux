var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var UserStore = (function (_super) {
    __extends(UserStore, _super);
    function UserStore() {
        _super.call(this);
        this.data = JSON.parse(localStorage['users']) || [];
    }
    UserStore.prototype.addUser = function (user) {
        this.data.push(user);
        this.save();
        this.changed();
    };
    UserStore.prototype.save = function () {
        localStorage['users'] = JSON.stringify(this.data);
    };
    return UserStore;
})(ho.flux.Store);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlclN0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVXNlclN0b3JlLnRzIl0sIm5hbWVzIjpbIlVzZXJTdG9yZSIsIlVzZXJTdG9yZS5jb25zdHJ1Y3RvciIsIlVzZXJTdG9yZS5hZGRVc2VyIiwiVXNlclN0b3JlLnNhdmUiXSwibWFwcGluZ3MiOiI7Ozs7O0FBS0E7SUFBd0JBLDZCQUEyQkE7SUFDbERBO1FBQ0NDLGlCQUFPQSxDQUFDQTtRQUNSQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxZQUFZQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtJQUNyREEsQ0FBQ0E7SUFFREQsMkJBQU9BLEdBQVBBLFVBQVFBLElBQVdBO1FBQ2xCRSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNyQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDWkEsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0lBRU9GLHdCQUFJQSxHQUFaQTtRQUNDRyxZQUFZQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUNuREEsQ0FBQ0E7SUFHRkgsZ0JBQUNBO0FBQURBLENBQUNBLEFBakJELEVBQXdCLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQWlCcEMifQ==