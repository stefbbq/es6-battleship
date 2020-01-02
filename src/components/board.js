import Array2d from "array-2d";

// Board class
// Handles the board state, performing hit tests and tracking active ships
// Position states:
//  - untouched water
//  = attacked water
//  O untouched ship
//  X attacked ship

export default class Board {
  constructor(ships) {
    // Check if ships exists, kill the app otherwise
    if (ships) this.ships = ships;
    else throw new Error("Ack, the board hasn't been provided any ships!");

    // Create the board and init board state
    this.board = new Array2d(10, 10, "-");
    this.boardActive = true;

    // Draw the ships on the board (yay for array-2d making this super easy)
    ships.forEach(ship => {
      ship.forEach(position => {
        this.board.set(position.y, position.x, "O"); // Reversed XY here and henceforth as array-2d library is row/col based
      });
    });

    console.log(`Board generated with ${this.ships.length} ship(s)`);
  }

  /**
   * Perform a test on the board with a set of coordinates
   *
   * @param {*} x x coordinate / column position using zero-based numbering
   * @param {*} y y coordinate / row position using zero-based numbering
   * @returns "Hit", "Miss", "Already Attacked", "Sunk", "Win" or out of bounds conditional
   * @memberof Board
   */
  hitTest(x, y) {
    // Check if the game hasn't already been won
    if (this.boardActive) {
      switch (this.board.get(y, x)) {
        case undefined: // Hitting a position that doesn't exist
          return "This position doesn't exist on the board.";
        case "-": // Hitting open water; "Miss" state
          this.board.set(y, x, "=");
          return "Miss";
        case "O": // Hitting an intact ship; "Sunk", "Hit" or "Win" states
          this.board.set(y, x, "X");
          return this.updateShips(x, y);
        case "=": // Hitting a previously attacked position; "Already Attacked" state
        case "X":
          return "Already Attacked";
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
  updateShips(x, y) {
    let shipSunk = false;

    // iterate through ships
    this.ships.forEach((ship, shipIndex) => {
      // iterate through individual ship positions
      ship.forEach((position, positionIndex) => {
        // remove ship position if it's been attacked
        if (position.x == x && position.y == y) ship.splice(positionIndex, 1);
      });
      // remove the whole ship if it's been obliterated, and set the shipSunk boolean to true
      if (ship.length == 0) {
        this.ships.splice(shipIndex, 1);
        shipSunk = true;
      }
    });

    if (shipSunk && this.ships.length) return "Sunk";
    else if (!shipSunk && this.ships.length) return "Hit";
    else {
      this.boardActive = false;
      return "Win";
    }
  }

  /**
   * Print the current state of the board to the console
   *
   * @memberof Board
   */
  printBoard() {
    if (this.gameActive) console.log("Active Board: ------ ");
    else console.log("Inactive board: ----");
    console.log(this.board.toString());
  }
}
