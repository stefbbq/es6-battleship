import { createShip } from "../src/utils/createShip";

describe("createShip.js", function() {
  let ship = createShip(3, "right", { x: 1, y: 2 });

  it("ship should have a length of 3", function() {
    expect(ship.length).toBe(3);
  });
});
