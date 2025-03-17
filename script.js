const defaultTraversalX = [0, 1, 2, 3];
const defaultTraversalY = [0, 1, 2, 3];
let head = document.getElementById("head");
let scoreBar = document.getElementById("scoreBar");
let scoreItem = document.getElementById("score");
let bestBar = document.getElementById("scoreBar");
let bestItem = document.getElementById("score");
let container = document.getElementById("container");
let curGame = null;
let mask = document.querySelectorAll(".mask,.gameover,#again");
let game = document.getElementById("game");

document.addEventListener("DOMContentLoaded", () => {
  curGame = new Game();
  curGame.init();
});
let btn = document.getElementById("restart");
let againBtn = document.getElementById("again");
btn.onclick = newGame;
againBtn.onclick = newGame;
function newGame() {
  curGame.clear();
  curGame = null;
  curGame = new Game();
  curGame.init();
}

class Game {
  /* direction */
  static dir = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
  ];
  constructor() {
    this.game = document.getElementById("game");
    this.item = game.querySelectorAll(".item");
    this.tile = new Array(4);
    this.score = 0;
  }

  /**
   * create new tile to the game board.
   * create 2 tiles when initializing.
   * new tile's value is 2 or 4.
   * @param {Integer} the num of tile to create
   */
  createNewTile = (num = 1) => {
    for (let i = 0; i < num; i++) {
      let rand = Math.floor(Math.random() * 16);
      let x = Math.floor(rand / 4);
      let y = rand % 4;
      while (this.tile[x][y]) {
        rand = Math.floor(Math.random() * 16);
        x = Math.floor(rand / 4);
        y = rand % 4;
      }
      let value = (Math.floor(Math.random() * 2) + 1) * 2;
      this.tile[x][y] = value;
      this.addTile({ x: x, y: y, val: value }, 250, false, true);
    }
  };
  /**
   * check if there has a empty space
   * @return {boolean} no empty space
   */
  isNoEmptySpace = () => {
    for (let row of this.tile) {
      for (let i of row) {
        if (i == 0) return false;
      }
    }
    return true;
  };
  /**
   * if the board has no empty space,
   * check if any tile can be merged.
   * @return {boolean} some tiles can be merged.
   */
  canMove = () => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (
          (j < 3 && this.tile[i][j] == this.tile[i][j + 1]) ||
          (i < 3 && this.tile[i][j] == this.tile[i + 1][j])
        ) {
          return true;
        }
      }
    }
    return false;
  };
  /**
   * listen the event of key down,
   * move the tile and merge,
   * check if the game is over
   * @param {Event} read the key pushed through event.key
   */
  onKeyDown(event) {
    let dir = 0;
    // prevent the default event of arrow key
    // then the window will not scroll
    event.preventDefault();

    // read the direction
    switch (event.key) {
      case "ArrowUp":
        dir = 0;
        break;
      case "ArrowRight":
        dir = 1;
        break;
      case "ArrowDown":
        dir = 2;
        break;
      case "ArrowLeft":
        dir = 3;
        break;
      default:
        return;
    }

    // the order to traversal the index
    let traversal = {
      x: [...defaultTraversalX],
      y: [...defaultTraversalY]
    };

    clearAnimateItem();
    // move the tile and merge
    // return true if change happen

    let promise = curGame.moveTile(dir, traversal);
    
    // change happen and there has empty space
    // then create a new tile
    promise.then((moved) => {
      if (moved && !curGame.isNoEmptySpace()) {
        curGame.createNewTile();
      }
      // the game board is full and no tile can be merged
      // game over.
      if (curGame.isNoEmptySpace() && !curGame.canMove()) {
        curGame.endGame();
      }
    });
  }
  /**
   * initial the game.
   */
  init = () => {
    let promise = new Promise((resolve) => {
      for (let i = 0; i < 4; i++) {
        this.tile[i] = new Array(4).fill(0);
      }
      resolve();
    });
    promise
      .then(this.createNewTile(2))
      .then(() => document.addEventListener("keydown", this.onKeyDown));
  };
  /**
   * move the tile and merge the neighbor of same value in the direction.
   * merge will happen only once on the same tile per move
   * . 2 2 4 -> . . 4 4
   * @param {Integer} the index of direction
   * @param {Object}
   *    x:the order of traversal in the row direction
   *    y:the order of traversal in the column direction
   * @return {boolean} whether change happen in this move
   */
  async moveTile(d, traversal) {
    // this.forbiddenTile.clear();
    let changed = false;
    let score = 0;
    if (Game.dir[d][0] == 1) traversal.x = traversal.x.reverse();
    if (Game.dir[d][1] == 1) traversal.y = traversal.y.reverse();

    // save the last item changed
    // avoid a tile be merged twice
    let lastChangedItem = null;

    traversal.x.forEach((i) => {
      traversal.y.forEach((j) => {
        let val = this.tile[i][j];
        if (val != 0) {
          let cur = { x: i, y: j, val: val };
          // find the farthest pos tile can move to
          let finalPos = this.findFinalPos(d, cur);
          let next = finalPos.next;
          let newTile;
          // merge with the next tile
          if (
            next.x >= 0 &&
            next.x < 4 &&
            next.y >= 0 &&
            next.y < 4 &&
            val == this.tile[next.x][next.y] &&
            (!lastChangedItem ||
              next.x != lastChangedItem.x ||
              next.y != lastChangedItem.y)
          ) 
          
          {
            score += val * 2;
            newTile = { x: next.x, y: next.y, val: val * 2 };
            lastChangedItem = { x: next.x, y: next.y };
          } else {
            newTile = { x: finalPos.x, y: finalPos.y, val: val };
          }

          if (!changed && (newTile.x != i || newTile.y != j)) {
            changed = true;
          }
          let mySound = new Audio("swipe-255512.mp3")
mySound.play()
          

          // no change happen
          if (newTile.x == i && newTile.y == j) return;
          // update the array
          this.tile[i][j] = 0;
          this.tile[newTile.x][newTile.y] = newTile.val;
          // move the tile
          this.move(cur, newTile);

        }
      });
    });
    if (score) this.updateScore(score);
    return changed;
  }
  /**
   * find the final position the tile will move to.
   * @param {Array} the order of traversal
   * @param {Object} x,y
   * @return {Object} include the final position and its next tile
   */
  findFinalPos = (d, cur) => {
    let res = cur;
    while (cur.x >= 0 && cur.x <= 3 && cur.y >= 0 && cur.y <= 3) {
      res = cur;
      cur = { x: cur.x + Game.dir[d][0], y: cur.y + Game.dir[d][1] };
      if (
        cur.x > 3 ||
        cur.x < 0 ||
        cur.y > 3 ||
        cur.y < 0 ||
        this.tile[cur.x][cur.y]
      ) {
        break;
      }
    }
    return {
      x: res.x,
      y: res.y,
      next: { x: cur.x, y: cur.y }
    };
  };

  /**
   * add tile to the game board with animation effect.
   * @param {Object} new tile
   * @param {Integet} delay to add the tile / animation time
   * @param {Boolean} use animation of merging
   * @param {Boolean} use animation of creating
   */
  addTile = (tile, delay, merged, created = false) => {
    let { x, y, val } = tile;
    let coord = getCoord(this.item[x * 4 + y]);
    let newTile = null;
    // animate
    if (merged || created) {
      newTile = document.createElement("div");
      let className = merged ? "mergeTile" : "newTile";
      newTile.classList.add(className);
      newTile.classList.add("item");
      newTile.dataset.value = val;
      newTile.innerHTML = val;
      newTile.style.left = coord.left + "px";
      newTile.style.top = coord.top + "px";
      container.append(newTile);

      newTile.getBoundingClientRect();
      newTile.style.transform = "scale(1)";
      newTile.style.visibility = "hidden";
    }
    setTimeout(() => {
      this.item[x * 4 + y].innerHTML = val;
      this.item[x * 4 + y].dataset.value = val;
    }, delay);
  };
  /**
   * move the tile
   * @param {Object} old tile
   * @param {Object} new tile
   */
  move = (old, newTile) => {
    let oldIndex = old.x * 4 + old.y;
    let newIndex = newTile.x * 4 + newTile.y;
    let merged = old.val != newTile.val;

    let oldCoord = getCoord(this.item[oldIndex]);

    let moveTile = document.createElement("div");
    moveTile.classList.add("moveTile", "item");
    moveTile.dataset.value = old.val;
    moveTile.innerHTML = old.val;
    moveTile.style.left = oldCoord.left + "px";
    moveTile.style.top = oldCoord.top + "px";

    container.append(moveTile);
    this.item[oldIndex].innerHTML = "";
    this.item[oldIndex].dataset.value = 0;

    this.addTile(newTile, 100, merged);
    let newCoord = getCoord(this.item[newIndex]);
    moveTile.style.left = newCoord.left + "px";
    moveTile.style.top = newCoord.top + "px";
    moveTile.style.visibility = "hidden";
    // moveTile.classList.add('hidden');
  };
  /**
   * update the score
   * @param {Integer} score to add
   */
  updateScore = (score) => {
    this.score += score;
    scoreItem.innerHTML = this.score;
    let item = document.createElement("div");
    item.className = "scoreAdd";
    item.innerHTML = `+${score}`;
    item.style.top = 60 + "px";
    item.style.right = 130 + "px";
    container.append(item);
    setTimeout(() => {
      item.style.top = -100 + "px";
      item.style.opacity = 0;
    }, 0);
    setTimeout(() => {
      item.remove();
    }, 2000);
  };

  /**
   * game over.
   */
  endGame = () => {
    document.removeEventListener("keydown", this.onKeyDown);
    let mySound = new Audio("gameover.mp3")
    mySound.play()
    console.log("gameover");
    mask.forEach((i) => {
      i.hidden = false;
    });
    if (!timeout) {
      peep();
    } else {
      checkScore();
    }
    
  };
  /**
   * clear the game board.
   */
  clear = () => {
    this.tile = null;
    this.score = 0;
    document.removeEventListener("keydown", this.onKeyDown);
    for (let i of this.item) {
      i.innerHTML = "";
      i.dataset.value = 0;
    }
    clearAnimateItem();
    mask.forEach((i) => {
      i.hidden = true;
    });
  };
}
/**
 * get bounding client rect relative to container.
 */
function getCoord(item) {
  let containerCoord = container.getBoundingClientRect();
  let coord = item.getBoundingClientRect();
  return {
    left: coord.left - containerCoord.left,
    top: coord.top - containerCoord.top
  };
}
/**
 * clear the animation item. 
 */
function clearAnimateItem() {
  let temp = document.querySelectorAll(".newTile,.mergeTile,.moveTile");
  temp.forEach((t) => t.remove());
}


function checkForWin() {
  for (let i = 0; i < squares.length; i++) {
      if (squares[i].innerHTML == 2048) {
          scoreDisplay.innerHTML = "You win!";
          document.removeEventListener("keyup", control);
      }
  }
};

window.fakeStorage = {
  _data: {},

  setItem: function (id, val) {
    return this._data[id] = String(val);
  },

  getItem: function (id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem: function (id) {
    return delete this._data[id];
  },

  clear: function () {
    return this._data = {};
  }
};
function HTMLActuator(){
  this.scoreBar = document.querySelector("#score")
  this.bestBar = document.querySelector("#best")
}
function LocalStorageManager() {
  this.bestScoreKey     = "bestScore";
  this.gameStateKey     = "gameState";

  var supported = this.localStorageSupported();
  this.storage = supported ? window.localStorage : window.fakeStorage;
}

LocalStorageManager.prototype.localStorageSupported = function () {
  var testKey = "test";

  try {
    var storage = window.localStorage;
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

// Best score getters/setters
LocalStorageManager.prototype.getBestScore = function () {
  return this.storage.getItem(this.bestScoreKey) || 0;
};

LocalStorageManager.prototype.setBestScore = function (score) {
  this.storage.setItem(this.bestScoreKey, score);
};

// Game state getters/setters and clearing
LocalStorageManager.prototype.getGameState = function () {
  var stateJSON = this.storage.getItem(this.gameStateKey);
  return stateJSON ? JSON.parse(stateJSON) : null;
};

LocalStorageManager.prototype.setGameState = function (gameState) {
  this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
};

LocalStorageManager.prototype.clearGameState = function () {
  this.storage.removeItem(this.gameStateKey);
};

function Tile(position, value) {
  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || 2;

  this.previousPosition = null;
  this.mergedFrom       = null; // Tracks tiles that merged together
}

Tile.prototype.savePosition = function () {
  this.previousPosition = { x: this.x, y: this.y };
};

Tile.prototype.updatePosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};

Tile.prototype.serialize = function () {
  return {
    position: {
      x: this.x,
      y: this.y
    },
    value: this.value
  };
};