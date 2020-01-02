import { createShip } from "../src/utils/createShip";
import Board from "../src/components/board.js";

describe("board.js", function() {
  let shipA = createShip(3, "right", { x: 1, y: 2 });
  let shipB = createShip(4, "down", { x: 6, y: 3 });
  let ships = [shipA, shipB];
  let board = new Board(ships);

  it('hitTest(2, 2) should return "Hit"', function() {
    expect(board.hitTest(2, 2)).toBe("Hit");
  });
  it('hitTest(2, 2) again should return "Already Attacked"', function() {
    expect(board.hitTest(2, 2)).toBe("Already Attacked");
  });
  it('hitTest(2, 6) should return "Miss"', function() {
    expect(board.hitTest(2, 6)).toBe("Miss");
  });
});
