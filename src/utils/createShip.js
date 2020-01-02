// Return a ship, which is basically an array of {x: number, y: number}
// positions either going right or down across the board
export const createShip = (length, orientation, startPosition) => {
  let positions = [];

  if (orientation == "right") {
    for (let i = startPosition.x; i < length + startPosition.x; i++) {
      positions.push({ x: i, y: startPosition.y });
    }
  } else {
    for (let i = startPosition.y; i < length + startPosition.y; i++) {
      positions.push({ x: startPosition.x, y: i });
    }
  }

  console.log(
    `Creating a ship at coordinates ${startPosition.x}, ${
      startPosition.y
    } oriented ${orientation} and ${length} units long`,
  );
  return positions;
};
