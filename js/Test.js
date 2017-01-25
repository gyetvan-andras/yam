"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Test = function () {
  function Test() {
    _classCallCheck(this, Test);

    this._bananas = [];
  }

  _createClass(Test, [{
    key: "populate",
    value: function populate() {
      var _arr = [1, 2, 3, 4, 5];

      for (var _i = 0; _i < _arr.length; _i++) {
        var i = _arr[_i];
        this._bananas.push(i);
      }
      console.log("Test populated");
    }
  }, {
    key: "bananas",
    get: function get() {
      return this._bananas.filter(function (banana) {
        return banana.isRipe;
      });
    },
    set: function set(bananas) {
      if (bananas.length > 100) {
        throw "Wow " + bananas.length + " is a lot of bananas!";
      }
      this._bananas = bananas;
    }
  }]);

  return Test;
}();
//# sourceMappingURL=Test.js.map
