(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

// Fast allocator and initializer for large arrays

function allocInit(len, val) {
  // if you preallocate 100K or more items, v8 turns it into a hashtable
  var prealloc = len < 99999 ? len : 99999;
  var a = new Array(prealloc);
  for (var k = 0; k < prealloc; ++k) a[k] = val;
  var remaining = len - prealloc;
  while (remaining-- > 0) a.push(val);
  return a;
}

// A generic 2d array with a configurable allocator. 
function makeArray2d(allocInit) {
    function Array2d(m, n, initial) {
        this.m = m;
        this.n = n;
        this.length = m * n;
        this.a = allocInit(this.length, initial);
    }

    Array2d.prototype.get = function(i, j) {
        return this.a[i * this.n + j];
    }

    Array2d.prototype.set = function(i, j, val) {
        this.a[i * this.n + j] = val;
    }

    Array2d.prototype.toString = function() {
        var s = '';
        for (var i = 0; i < this.m; ++i)
            s += '[' + this.a.slice(i * this.n, (i+1)*this.n).join(',') + ']' + '\n';
        return s;
    }
    return Array2d;
}

// Export uses the default allocator
exports = module.exports = makeArray2d(allocInit);
// Also provides a way to customize an allocator
exports.withAllocator = makeArray2d;

exports.allocInit = allocInit;

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _array2d = require("array-2d");

var _array2d2 = _interopRequireDefault(_array2d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Board class
// Handles the board state, performing hit tests and tracking active ships
// Position states:
//  - untouched water
//  = attacked water
//  O untouched ship
//  X attacked ship

var Board = function () {
  function Board(ships) {
    var _this = this;

    _classCallCheck(this, Board);

    // Check if ships exists, kill the app otherwise
    if (ships) this.ships = ships;else throw new Error("Ack, the board hasn't been provided any ships!");

    // Create the board and init board state
    this.board = new _array2d2.default(10, 10, "-");
    this.boardActive = true;

    // Draw the ships on the board (yay for array-2d making this super easy)
    ships.forEach(function (ship) {
      ship.forEach(function (position) {
        _this.board.set(position.y, position.x, "O"); // Reversed XY as library is row/col
      });
    });

    console.log("Board generated with " + this.ships.length + " ship(s)");
  }

  /**
   * Perform a test on the board with a set of coordinates
   *
   * @param {*} x x coordinate / column position using zero-based numbering
   * @param {*} y y coordinate / row position using zero-based numbering
   * @returns "Hit", "Miss", "Already Attacked", "Sunk", "Win" or out of bounds conditional
   * @memberof Board
   */


  _createClass(Board, [{
    key: "hitTest",
    value: function hitTest(x, y) {
      // Check if the game hasn't already been won
      if (this.boardActive) {
        // Lets see where the attempt gets us
        switch (this.board.get(y, x)) {
          case undefined:
            return "This position doesn't exist on the board.";
          case "-":
            // Hitting open water; "Miss" state
            this.board.set(y, x, "="); // Reversed XY as library is row/col
            return "Miss";
          case "O":
            // Hitting an intact ship; "Sunk", "Hit" or "Win" states
            this.board.set(y, x, "X"); // Reversed XY as library is row/col
            return this.updateShips(x, y);
          case "=": // Hitting a previously attacked position; "Already Attacked" state
          case "X":
            return "Already attacked";
        }
      } else {
        return "This board is clear, and the game is over.";
      }
    }

    /**
     * Remove a piece of a ship if the coordinates match an existing position
     * This function will also set boardActive to false if a win is detected
     *
     * @param {*} x x coordinate / column position using zero-based numbering
     * @param {*} y y coordinate / row position using zero-based numbering
     * @returns "Sunk", "Hit" or "Win" state (ie: no ships left!)
     * @memberof Board
     */

  }, {
    key: "updateShips",
    value: function updateShips(x, y) {
      var _this2 = this;

      var shipSunk = false;

      // iterate through ships
      this.ships.forEach(function (ship, shipIndex) {
        // iterate through individual ship positions
        ship.forEach(function (position, positionIndex) {
          // remove ship position if it's been attacked
          if (position.x == x && position.y == y) ship.splice(positionIndex, 1);
        });
        // remove the whole ship if it's been obliterated, and set the shipSunk boolean to true
        if (ship.length == 0) {
          _this2.ships.splice(shipIndex, 1);
          shipSunk = true;
        }
      });

      if (shipSunk && this.ships.length) return "Sunk";else if (!shipSunk && this.ships.length) return "Hit";else {
        this.boardActive = false;
        return "Win";
      }
    }

    /**
     * Print the current state of the board to the console
     *
     * @memberof Board
     */

  }, {
    key: "printBoard",
    value: function printBoard() {
      if (this.gameActive) console.log("Active Board: ------ ");else console.log("Inactive board: ----");
      console.log(this.board.toString());
    }
  }]);

  return Board;
}();

exports.default = Board;

},{"array-2d":1}],3:[function(require,module,exports){
"use strict";

var _Board = require("./components/Board");

var _Board2 = _interopRequireDefault(_Board);

var _createShip = require("./utils/createShip.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generate a few fake ships
console.log(">>> Generating Ships");
var ships = [];

ships.push((0, _createShip.createShip)(3, "right", { x: 1, y: 2 }));
ships.push((0, _createShip.createShip)(4, "down", { x: 6, y: 3 }));
ships.push((0, _createShip.createShip)(5, "down", { x: 1, y: 5 }));

// Create a new board and give it some ships
console.log(">>> Generating the Board");
var board = new _Board2.default(ships);

// Attempt a few hit tests
console.log(">>> Attempting a few hit tests");
console.log("At 2, 2: " + board.hitTest(2, 2));
console.log("At 3, 2: " + board.hitTest(3, 2));
console.log("At 4, 2: " + board.hitTest(4, 2));
console.log("At 6, 8: " + board.hitTest(6, 8));
console.log("At 2, 2: " + board.hitTest(2, 2));
console.log("At 6, 6: " + board.hitTest(6, 6));
board.printBoard();

// Do your own thing (try more hit tests!)
debugger;

},{"./components/Board":2,"./utils/createShip.js":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Return a ship, which is basically an array of {x: number, y: number}
// positions either going right or down across the board
var createShip = exports.createShip = function createShip(length, orientation, startPosition) {
  var positions = [];

  if (orientation == "right") {
    for (var i = startPosition.x; i < length + startPosition.x; i++) {
      positions.push({ x: i, y: startPosition.y });
    }
  } else {
    for (var _i = startPosition.y; _i < length + startPosition.y; _i++) {
      positions.push({ x: startPosition.x, y: _i });
    }
  }

  console.log("Creating a ship at coordinates " + startPosition.x + ", " + startPosition.y + " oriented " + orientation + " and " + length + " units long");
  return positions;
};

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXJyYXktMmQvYXJyYXktMmQuanMiLCJzcmMvY29tcG9uZW50cy9Cb2FyZC5qcyIsInNyYy9pbmRleC5qcyIsInNyYy91dGlscy9jcmVhdGVTaGlwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUM3Q0E7Ozs7Ozs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0lBRXFCLEs7QUFDbkIsaUJBQVksS0FBWixFQUFtQjtBQUFBOztBQUFBOztBQUNqQjtBQUNBLFFBQUksS0FBSixFQUFXLEtBQUssS0FBTCxHQUFhLEtBQWIsQ0FBWCxLQUNLLE1BQU0sSUFBSSxLQUFKLENBQVUsZ0RBQVYsQ0FBTjs7QUFFTDtBQUNBLFNBQUssS0FBTCxHQUFhLElBQUksaUJBQUosQ0FBWSxFQUFaLEVBQWdCLEVBQWhCLEVBQW9CLEdBQXBCLENBQWI7QUFDQSxTQUFLLFdBQUwsR0FBbUIsSUFBbkI7O0FBRUE7QUFDQSxVQUFNLE9BQU4sQ0FBYyxnQkFBUTtBQUNwQixXQUFLLE9BQUwsQ0FBYSxvQkFBWTtBQUN2QixjQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsU0FBUyxDQUF4QixFQUEyQixTQUFTLENBQXBDLEVBQXVDLEdBQXZDLEVBRHVCLENBQ3NCO0FBQzlDLE9BRkQ7QUFHRCxLQUpEOztBQU1BLFlBQVEsR0FBUiwyQkFB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ZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXG4vLyBGYXN0IGFsbG9jYXRvciBhbmQgaW5pdGlhbGl6ZXIgZm9yIGxhcmdlIGFycmF5c1xuXG5mdW5jdGlvbiBhbGxvY0luaXQobGVuLCB2YWwpIHtcbiAgLy8gaWYgeW91IHByZWFsbG9jYXRlIDEwMEsgb3IgbW9yZSBpdGVtcywgdjggdHVybnMgaXQgaW50byBhIGhhc2h0YWJsZVxuICB2YXIgcHJlYWxsb2MgPSBsZW4gPCA5OTk5OSA/IGxlbiA6IDk5OTk5O1xuICB2YXIgYSA9IG5ldyBBcnJheShwcmVhbGxvYyk7XG4gIGZvciAodmFyIGsgPSAwOyBrIDwgcHJlYWxsb2M7ICsraykgYVtrXSA9IHZhbDtcbiAgdmFyIHJlbWFpbmluZyA9IGxlbiAtIHByZWFsbG9jO1xuICB3aGlsZSAocmVtYWluaW5nLS0gPiAwKSBhLnB1c2godmFsKTtcbiAgcmV0dXJuIGE7XG59XG5cbi8vIEEgZ2VuZXJpYyAyZCBhcnJheSB3aXRoIGEgY29uZmlndXJhYmxlIGFsbG9jYXRvci4gXG5mdW5jdGlvbiBtYWtlQXJyYXkyZChhbGxvY0luaXQpIHtcbiAgICBmdW5jdGlvbiBBcnJheTJkKG0sIG4sIGluaXRpYWwpIHtcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5uID0gbjtcbiAgICAgICAgdGhpcy5sZW5ndGggPSBtICogbjtcbiAgICAgICAgdGhpcy5hID0gYWxsb2NJbml0KHRoaXMubGVuZ3RoLCBpbml0aWFsKTtcbiAgICB9XG5cbiAgICBBcnJheTJkLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihpLCBqKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFbaSAqIHRoaXMubiArIGpdO1xuICAgIH1cblxuICAgIEFycmF5MmQucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGksIGosIHZhbCkge1xuICAgICAgICB0aGlzLmFbaSAqIHRoaXMubiArIGpdID0gdmFsO1xuICAgIH1cblxuICAgIEFycmF5MmQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzID0gJyc7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tOyArK2kpXG4gICAgICAgICAgICBzICs9ICdbJyArIHRoaXMuYS5zbGljZShpICogdGhpcy5uLCAoaSsxKSp0aGlzLm4pLmpvaW4oJywnKSArICddJyArICdcXG4nO1xuICAgICAgICByZXR1cm4gcztcbiAgICB9XG4gICAgcmV0dXJuIEFycmF5MmQ7XG59XG5cbi8vIEV4cG9ydCB1c2VzIHRoZSBkZWZhdWx0IGFsbG9jYXRvclxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gbWFrZUFycmF5MmQoYWxsb2NJbml0KTtcbi8vIEFsc28gcHJvdmlkZXMgYSB3YXkgdG8gY3VzdG9taXplIGFuIGFsbG9jYXRvclxuZXhwb3J0cy53aXRoQWxsb2NhdG9yID0gbWFrZUFycmF5MmQ7XG5cbmV4cG9ydHMuYWxsb2NJbml0ID0gYWxsb2NJbml0O1xuIiwiaW1wb3J0IEFycmF5MmQgZnJvbSBcImFycmF5LTJkXCI7XG5cbi8vIEJvYXJkIGNsYXNzXG4vLyBIYW5kbGVzIHRoZSBib2FyZCBzdGF0ZSwgcGVyZm9ybWluZyBoaXQgdGVzdHMgYW5kIHRyYWNraW5nIGFjdGl2ZSBzaGlwc1xuLy8gUG9zaXRpb24gc3RhdGVzOlxuLy8gIC0gdW50b3VjaGVkIHdhdGVyXG4vLyAgPSBhdHRhY2tlZCB3YXRlclxuLy8gIE8gdW50b3VjaGVkIHNoaXBcbi8vICBYIGF0dGFja2VkIHNoaXBcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQm9hcmQge1xuICBjb25zdHJ1Y3RvcihzaGlwcykge1xuICAgIC8vIENoZWNrIGlmIHNoaXBzIGV4aXN0cywga2lsbCB0aGUgYXBwIG90aGVyd2lzZVxuICAgIGlmIChzaGlwcykgdGhpcy5zaGlwcyA9IHNoaXBzO1xuICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yKFwiQWNrLCB0aGUgYm9hcmQgaGFzbid0IGJlZW4gcHJvdmlkZWQgYW55IHNoaXBzIVwiKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgYm9hcmQgYW5kIGluaXQgYm9hcmQgc3RhdGVcbiAgICB0aGlzLmJvYXJkID0gbmV3IEFycmF5MmQoMTAsIDEwLCBcIi1cIik7XG4gICAgdGhpcy5ib2FyZEFjdGl2ZSA9IHRydWU7XG5cbiAgICAvLyBEcmF3IHRoZSBzaGlwcyBvbiB0aGUgYm9hcmQgKHlheSBmb3IgYXJyYXktMmQgbWFraW5nIHRoaXMgc3VwZXIgZWFzeSlcbiAgICBzaGlwcy5mb3JFYWNoKHNoaXAgPT4ge1xuICAgICAgc2hpcC5mb3JFYWNoKHBvc2l0aW9uID0+IHtcbiAgICAgICAgdGhpcy5ib2FyZC5zZXQocG9zaXRpb24ueSwgcG9zaXRpb24ueCwgXCJPXCIpOyAvLyBSZXZlcnNlZCBYWSBhcyBsaWJyYXJ5IGlzIHJvdy9jb2xcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coYEJvYXJkIGdlbmVyYXRlZCB3aXRoICR7dGhpcy5zaGlwcy5sZW5ndGh9IHNoaXAocylgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtIGEgdGVzdCBvbiB0aGUgYm9hcmQgd2l0aCBhIHNldCBvZiBjb29yZGluYXRlc1xuICAgKlxuICAgKiBAcGFyYW0geyp9IHggeCBjb29yZGluYXRlIC8gY29sdW1uIHBvc2l0aW9uIHVzaW5nIHplcm8tYmFzZWQgbnVtYmVyaW5nXG4gICAqIEBwYXJhbSB7Kn0geSB5IGNvb3JkaW5hdGUgLyByb3cgcG9zaXRpb24gdXNpbmcgemVyby1iYXNlZCBudW1iZXJpbmdcbiAgICogQHJldHVybnMgXCJIaXRcIiwgXCJNaXNzXCIsIFwiQWxyZWFkeSBBdHRhY2tlZFwiLCBcIlN1bmtcIiwgXCJXaW5cIiBvciBvdXQgb2YgYm91bmRzIGNvbmRpdGlvbmFsXG4gICAqIEBtZW1iZXJvZiBCb2FyZFxuICAgKi9cbiAgaGl0VGVzdCh4LCB5KSB7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIGdhbWUgaGFzbid0IGFscmVhZHkgYmVlbiB3b25cbiAgICBpZiAodGhpcy5ib2FyZEFjdGl2ZSkge1xuICAgICAgLy8gTGV0cyBzZWUgd2hlcmUgdGhlIGF0dGVtcHQgZ2V0cyB1c1xuICAgICAgc3dpdGNoICh0aGlzLmJvYXJkLmdldCh5LCB4KSkge1xuICAgICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgICByZXR1cm4gXCJUaGlzIHBvc2l0aW9uIGRvZXNuJ3QgZXhpc3Qgb24gdGhlIGJvYXJkLlwiO1xuICAgICAgICBjYXNlIFwiLVwiOiAvLyBIaXR0aW5nIG9wZW4gd2F0ZXI7IFwiTWlzc1wiIHN0YXRlXG4gICAgICAgICAgdGhpcy5ib2FyZC5zZXQoeSwgeCwgXCI9XCIpOyAvLyBSZXZlcnNlZCBYWSBhcyBsaWJyYXJ5IGlzIHJvdy9jb2xcbiAgICAgICAgICByZXR1cm4gXCJNaXNzXCI7XG4gICAgICAgIGNhc2UgXCJPXCI6IC8vIEhpdHRpbmcgYW4gaW50YWN0IHNoaXA7IFwiU3Vua1wiLCBcIkhpdFwiIG9yIFwiV2luXCIgc3RhdGVzXG4gICAgICAgICAgdGhpcy5ib2FyZC5zZXQoeSwgeCwgXCJYXCIpOyAvLyBSZXZlcnNlZCBYWSBhcyBsaWJyYXJ5IGlzIHJvdy9jb2xcbiAgICAgICAgICByZXR1cm4gdGhpcy51cGRhdGVTaGlwcyh4LCB5KTtcbiAgICAgICAgY2FzZSBcIj1cIjogLy8gSGl0dGluZyBhIHByZXZpb3VzbHkgYXR0YWNrZWQgcG9zaXRpb247IFwiQWxyZWFkeSBBdHRhY2tlZFwiIHN0YXRlXG4gICAgICAgIGNhc2UgXCJYXCI6XG4gICAgICAgICAgcmV0dXJuIFwiQWxyZWFkeSBhdHRhY2tlZFwiO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJUaGlzIGJvYXJkIGlzIGNsZWFyLCBhbmQgdGhlIGdhbWUgaXMgb3Zlci5cIjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgcGllY2Ugb2YgYSBzaGlwIGlmIHRoZSBjb29yZGluYXRlcyBtYXRjaCBhbiBleGlzdGluZyBwb3NpdGlvblxuICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYWxzbyBzZXQgYm9hcmRBY3RpdmUgdG8gZmFsc2UgaWYgYSB3aW4gaXMgZGV0ZWN0ZWRcbiAgICpcbiAgICogQHBhcmFtIHsqfSB4IHggY29vcmRpbmF0ZSAvIGNvbHVtbiBwb3NpdGlvbiB1c2luZyB6ZXJvLWJhc2VkIG51bWJlcmluZ1xuICAgKiBAcGFyYW0geyp9IHkgeSBjb29yZGluYXRlIC8gcm93IHBvc2l0aW9uIHVzaW5nIHplcm8tYmFzZWQgbnVtYmVyaW5nXG4gICAqIEByZXR1cm5zIFwiU3Vua1wiLCBcIkhpdFwiIG9yIFwiV2luXCIgc3RhdGUgKGllOiBubyBzaGlwcyBsZWZ0ISlcbiAgICogQG1lbWJlcm9mIEJvYXJkXG4gICAqL1xuICB1cGRhdGVTaGlwcyh4LCB5KSB7XG4gICAgbGV0IHNoaXBTdW5rID0gZmFsc2U7XG5cbiAgICAvLyBpdGVyYXRlIHRocm91Z2ggc2hpcHNcbiAgICB0aGlzLnNoaXBzLmZvckVhY2goKHNoaXAsIHNoaXBJbmRleCkgPT4ge1xuICAgICAgLy8gaXRlcmF0ZSB0aHJvdWdoIGluZGl2aWR1YWwgc2hpcCBwb3NpdGlvbnNcbiAgICAgIHNoaXAuZm9yRWFjaCgocG9zaXRpb24sIHBvc2l0aW9uSW5kZXgpID0+IHtcbiAgICAgICAgLy8gcmVtb3ZlIHNoaXAgcG9zaXRpb24gaWYgaXQncyBiZWVuIGF0dGFja2VkXG4gICAgICAgIGlmIChwb3NpdGlvbi54ID09IHggJiYgcG9zaXRpb24ueSA9PSB5KSBzaGlwLnNwbGljZShwb3NpdGlvbkluZGV4LCAxKTtcbiAgICAgIH0pO1xuICAgICAgLy8gcmVtb3ZlIHRoZSB3aG9sZSBzaGlwIGlmIGl0J3MgYmVlbiBvYmxpdGVyYXRlZCwgYW5kIHNldCB0aGUgc2hpcFN1bmsgYm9vbGVhbiB0byB0cnVlXG4gICAgICBpZiAoc2hpcC5sZW5ndGggPT0gMCkge1xuICAgICAgICB0aGlzLnNoaXBzLnNwbGljZShzaGlwSW5kZXgsIDEpO1xuICAgICAgICBzaGlwU3VuayA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoc2hpcFN1bmsgJiYgdGhpcy5zaGlwcy5sZW5ndGgpIHJldHVybiBcIlN1bmtcIjtcbiAgICBlbHNlIGlmICghc2hpcFN1bmsgJiYgdGhpcy5zaGlwcy5sZW5ndGgpIHJldHVybiBcIkhpdFwiO1xuICAgIGVsc2Uge1xuICAgICAgdGhpcy5ib2FyZEFjdGl2ZSA9IGZhbHNlO1xuICAgICAgcmV0dXJuIFwiV2luXCI7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByaW50IHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBib2FyZCB0byB0aGUgY29uc29sZVxuICAgKlxuICAgKiBAbWVtYmVyb2YgQm9hcmRcbiAgICovXG4gIHByaW50Qm9hcmQoKSB7XG4gICAgaWYgKHRoaXMuZ2FtZUFjdGl2ZSkgY29uc29sZS5sb2coXCJBY3RpdmUgQm9hcmQ6IC0tLS0tLSBcIik7XG4gICAgZWxzZSBjb25zb2xlLmxvZyhcIkluYWN0aXZlIGJvYXJkOiAtLS0tXCIpO1xuICAgIGNvbnNvbGUubG9nKHRoaXMuYm9hcmQudG9TdHJpbmcoKSk7XG4gIH1cbn1cbiIsImltcG9ydCBCb2FyZCBmcm9tIFwiLi9jb21wb25lbnRzL0JvYXJkXCI7XG5pbXBvcnQgeyBjcmVhdGVTaGlwIH0gZnJvbSBcIi4vdXRpbHMvY3JlYXRlU2hpcC5qc1wiO1xuXG4vLyBHZW5lcmF0ZSBhIGZldyBmYWtlIHNoaXBzXG5jb25zb2xlLmxvZyhcIj4+PiBHZW5lcmF0aW5nIFNoaXBzXCIpO1xubGV0IHNoaXBzID0gW107XG5cbnNoaXBzLnB1c2goY3JlYXRlU2hpcCgzLCBcInJpZ2h0XCIsIHsgeDogMSwgeTogMiB9KSk7XG5zaGlwcy5wdXNoKGNyZWF0ZVNoaXAoNCwgXCJkb3duXCIsIHsgeDogNiwgeTogMyB9KSk7XG5zaGlwcy5wdXNoKGNyZWF0ZVNoaXAoNSwgXCJkb3duXCIsIHsgeDogMSwgeTogNSB9KSk7XG5cbi8vIENyZWF0ZSBhIG5ldyBib2FyZCBhbmQgZ2l2ZSBpdCBzb21lIHNoaXBzXG5jb25zb2xlLmxvZyhcIj4+PiBHZW5lcmF0aW5nIHRoZSBCb2FyZFwiKTtcbmxldCBib2FyZCA9IG5ldyBCb2FyZChzaGlwcyk7XG5cbi8vIEF0dGVtcHQgYSBmZXcgaGl0IHRlc3RzXG5jb25zb2xlLmxvZyhcIj4+PiBBdHRlbXB0aW5nIGEgZmV3IGhpdCB0ZXN0c1wiKTtcbmNvbnNvbGUubG9nKGBBdCAyLCAyOiAke2JvYXJkLmhpdFRlc3QoMiwgMil9YCk7XG5jb25zb2xlLmxvZyhgQXQgMywgMjogJHtib2FyZC5oaXRUZXN0KDMsIDIpfWApO1xuY29uc29sZS5sb2coYEF0IDQsIDI6ICR7Ym9hcmQuaGl0VGVzdCg0LCAyKX1gKTtcbmNvbnNvbGUubG9nKGBBdCA2LCA4OiAke2JvYXJkLmhpdFRlc3QoNiwgOCl9YCk7XG5jb25zb2xlLmxvZyhgQXQgMiwgMjogJHtib2FyZC5oaXRUZXN0KDIsIDIpfWApO1xuY29uc29sZS5sb2coYEF0IDYsIDY6ICR7Ym9hcmQuaGl0VGVzdCg2LCA2KX1gKTtcbmJvYXJkLnByaW50Qm9hcmQoKTtcblxuLy8gRG8geW91ciBvd24gdGhpbmcgKHRyeSBtb3JlIGhpdCB0ZXN0cyEpXG5kZWJ1Z2dlcjtcbiIsIi8vIFJldHVybiBhIHNoaXAsIHdoaWNoIGlzIGJhc2ljYWxseSBhbiBhcnJheSBvZiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9XG4vLyBwb3NpdGlvbnMgZWl0aGVyIGdvaW5nIHJpZ2h0IG9yIGRvd24gYWNyb3NzIHRoZSBib2FyZFxuZXhwb3J0IGNvbnN0IGNyZWF0ZVNoaXAgPSAobGVuZ3RoLCBvcmllbnRhdGlvbiwgc3RhcnRQb3NpdGlvbikgPT4ge1xuICBsZXQgcG9zaXRpb25zID0gW107XG5cbiAgaWYgKG9yaWVudGF0aW9uID09IFwicmlnaHRcIikge1xuICAgIGZvciAobGV0IGkgPSBzdGFydFBvc2l0aW9uLng7IGkgPCBsZW5ndGggKyBzdGFydFBvc2l0aW9uLng7IGkrKykge1xuICAgICAgcG9zaXRpb25zLnB1c2goeyB4OiBpLCB5OiBzdGFydFBvc2l0aW9uLnkgfSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAobGV0IGkgPSBzdGFydFBvc2l0aW9uLnk7IGkgPCBsZW5ndGggKyBzdGFydFBvc2l0aW9uLnk7IGkrKykge1xuICAgICAgcG9zaXRpb25zLnB1c2goeyB4OiBzdGFydFBvc2l0aW9uLngsIHk6IGkgfSk7XG4gICAgfVxuICB9XG5cbiAgY29uc29sZS5sb2coXG4gICAgYENyZWF0aW5nIGEgc2hpcCBhdCBjb29yZGluYXRlcyAke3N0YXJ0UG9zaXRpb24ueH0sICR7XG4gICAgICBzdGFydFBvc2l0aW9uLnlcbiAgICB9IG9yaWVudGVkICR7b3JpZW50YXRpb259IGFuZCAke2xlbmd0aH0gdW5pdHMgbG9uZ2AsXG4gICk7XG4gIHJldHVybiBwb3NpdGlvbnM7XG59O1xuIl19
