# Battleship

A simple app that bootstraps the nits of a Battleship game board and then manages it's state.

#### Introduction

This app runs in the browser's console.

You can use those (and the functions available within) to try it yourself. Check out `/src/index.js` to see how to create ships and interact with the board.

#### Technical notes

This app compiles with Gulp, tranpiling ES6 -> ES5, and runs tests using Karma. It's pretty vanilla otherwise, though it does use the **array-2d** library to help the math along a bit.

#### How to use

###### Quickstart:

```
npm i
npm run dev
```

###### Other Commands:

**To run:** `npm run serve`
_Note: open up the console in the browser to see the app in action. If you'd like to interact with it, refresh the browser window with the console open so the debugger will trigger._

**Build the app:** `npm run build`
**Run tests:** `npm run test`
