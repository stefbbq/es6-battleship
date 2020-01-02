import Board from "./components/Board";
import { createShip } from "./utils/createShip.js";

// Generate a few fake ships
console.log(">>> Generating Ships");
let ships = [];

ships.push(createShip(3, "right", { x: 1, y: 2 }));
ships.push(createShip(4, "down", { x: 6, y: 3 }));
ships.push(createShip(5, "down", { x: 1, y: 5 }));

// Create a new board and give it some ships
console.log(">>> Generating the Board");
let board = new Board(ships);

// Attempt a few hit tests
console.log(">>> Attempting a few hit tests");
console.log(`At 2, 2: ${board.hitTest(2, 2)}`);
console.log(`At 3, 2: ${board.hitTest(3, 2)}`);
console.log(`At 4, 2: ${board.hitTest(4, 2)}`);
console.log(`At 6, 8: ${board.hitTest(6, 8)}`);
console.log(`At 2, 2: ${board.hitTest(2, 2)}`);
console.log(`At 6, 6: ${board.hitTest(6, 6)}`);
board.printBoard();

// Do your own thing (try more hit tests!)
debugger;
