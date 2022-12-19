let playerNO = 0;

function Player() {
  let player = {};
  let text = document.querySelector(`#name${playerNO ? "B" : "A"}`);
  let _NO = playerNO++;
  player.letter = _NO ? "O" : "X";
  player.name = `Player ${_NO ? "2" : "1"}`;
  let setName = function (e) {
    if (e.target.value == "") {
      player.name = `Player ${_NO ? "2" : "1"}`;
      return;
    }
    player.name = e.target.value;
  };
  text.addEventListener("change", setName);
  return player;
}

let playerA = Player();
let playerB = Player();

let gameBoard = (function () {
  let gm = {};
   gm.divs = document.querySelectorAll(".section");
   gm.gameboard = new Array(9);

   gm.render = function () {
    for (let i = 0; i < this.gameboard.length; i++) {
      if (this.gameboard[i] == undefined) {
        this.divs[i].innerText = "";
        continue;
      }
      this.divs[i].innerText = this.gameboard[i];
    }
  };
  return gm;
})();
let game = (function () {
  let _turn = 0;
  let _over = false;
  let _winner = null;
  let _mode = 0;
  let _playerBname;
  let interface = document.querySelector(".interface");
  let _changeButton = document.querySelector(".choose");
  let _restartButton = document.querySelector(".restart");
  let _winnerDiv = document.querySelector(".winner");
  let _cpuButton = document.querySelector(".cpu");
  let _playerBtext = document.querySelector(".playerB");
  let _cpuMethod = function () {
    if (_mode == 0) {
      interface.removeChild(_playerBtext);
      _cpuButton.innerText = "VS. Player";
      _mode = 1;
      _playerBname = playerB.name;
      playerB.name = "CPU";
    } else {
      interface.insertBefore(_playerBtext, _changeButton);
      _cpuButton.innerText = "VS. A.I";
      _mode = 0;
      playerB.name = _playerBname;
    }
  };
  let _restartmethod = function (e) {
    _turn = 0;
    _over = false;
    _winner = null;
    gameBoard.gameboard.fill(undefined);
    _changeButton.removeAttribute("disabled");
    _cpuButton.removeAttribute("disabled");
    _winnerDiv.innerText = "";
    gameBoard.render();
  };
  let _changeLetter = function (e) {
    if (playerA.letter == "X") {
      playerA.letter = "O";
      playerB.letter = "X";
    } else {
      playerA.letter = "X";
      playerB.letter = "O";
    }
    let labelA = document.querySelector(`label[for="nameA"]`);
    let labelB = document.querySelector(`label[for="nameB"]`);
    labelA.innerText = playerA.letter;
    labelB.innerText = playerB.letter;
  };
  let _addMark = function (e) {
    if (_over) {
      return;
    }
    _changeButton.setAttribute("disabled", "");
    _cpuButton.setAttribute("disabled", "");
    let div = e.target;
    let section = e.target.getAttribute("data-key");
    if (gameBoard.gameboard[section]) {
      return;
    }
    let turn = _turn ? playerB : playerA;
    gameBoard.gameboard[section] = turn.letter;
    gameBoard.render();
    _check(turn);
    if (_mode == 0) {
      _turn = _turn ? 0 : 1;
    }
    if (_mode == 1 && !_over) {
      _playingAI();
    }
  };
  function _check(turn) {
    let gameboard = gameBoard.gameboard;
    condition = false;
    for (let i = 0; i <= gameboard.length; i += 1) {
      if (gameboard[i] == undefined) continue;
      if (i % 3 == 0) {
        if (
          gameboard[i] == gameboard[i + 1] &&
          gameboard[i + 1] == gameboard[i + 2]
        ) {
          condition = true;
        }
      }
      if (i == 0) {
        if (
          gameboard[i] == gameboard[i + 4] &&
          gameboard[i] == gameboard[i + 8]
        ) {
          condition = true;
          break;
        }
      }
      if (i == 6) {
        if (
          gameboard[i] == gameboard[i - 2] &&
          gameboard[i] == gameboard[i - 4]
        ) {
          condition = true;
          break;
        }
      }
      if (i < 3) {
        if (
          gameboard[i] == gameboard[i + 3] &&
          gameboard[i] == gameboard[i + 6]
        ) {
          condition = true;
        }
      }
    }
    if (condition) {
      _over = true;
      _winner = turn;
      _winnerDiv.innerText = `The Winner is ${turn.name + " : " + turn.letter}`;
      _changeButton.removeAttribute("disabled");
      _cpuButton.removeAttribute("disabled");

      return;
    }
    let every = true;
    for (let x of gameboard) {
      if (x == undefined) {
        every = false;
      }
    }
    if (every) {
      _over = true;
      console.log("DRAW");
      _changeButton.removeAttribute("disabled");
      _cpuButton.removeAttribute("disabled");
      _winnerDiv.innerText = `DRAW`;
      return;
    }
  }
  function _playingBot() {
    if (_over) return;
    let gameboard = gameBoard.gameboard;
    while (true) {
      let rand = (Math.random() * 8).toFixed(0);
      if (gameboard[rand] == undefined) {
        gameboard[rand] = playerB.letter;
        gameBoard.render();
        break;
      }
    }
  }
  function _playingAI() {
    let gameboard = [...(gameBoard.gameboard)];
    gameBoard.gameboard  = _AI(gameboard, playerB, -1, +1, true, 1);
    _check(playerB);
     gameBoard.render();
  }

  function _AI(position, turn, alpha, beta, maximizingPlayer, number) {
    let test = _checkForAI(position, turn);
    if (test != null) {
      return test;
    }

    if (maximizingPlayer) {
      let value = -1;
      let s;
      for (let x of _determinePosition(position, turn)) {
        let r = _AI(x,playerA,alpha,beta,false,number+1);
        if(r> value){
          value = r;
          if(number ==1){
          s = x;
          }
        }
        alpha = Math.max(alpha, value);

        if (beta <= alpha) {
          break;
        }
      }
      if(number == 1){
        return s;
      }
      return value;
    } else {
      let value = 1;
      for (let x of _determinePosition(position, turn)) {
        value = Math.min(value, _AI(x, playerB,alpha,beta, true, number + 1));
        beta = Math.min(beta, value);
        if (beta <= alpha) {
          break;
        }
      }
      return value;
    }
  }

  function _determinePosition(position, turn) {
    let arrayOfPositions = [];
    for (let i = 0; i < 9; i++) {
      let pos = [...position];
      if (pos[i] == undefined) {
        pos[i] = turn.letter;
        arrayOfPositions.push(pos);
      }
    }
    return arrayOfPositions;
  }

  function _checkForAI(position, turn) {
    let gameboard = position;
    condition = false;
    for (let i = 0; i <= gameboard.length; i += 1) {
      if (gameboard[i] == undefined) continue;
      if (i % 3 == 0) {
        if (
          gameboard[i] == gameboard[i + 1] &&
          gameboard[i + 1] == gameboard[i + 2]
        ) {
          condition = true;
        }
      }
      if (i == 0) {
        if (
          gameboard[i] == gameboard[i + 4] &&
          gameboard[i] == gameboard[i + 8]
        ) {
          condition = true;
          break;
        }
      }
      if (i == 6) {
        if (
          gameboard[i] == gameboard[i - 2] &&
          gameboard[i] == gameboard[i - 4]
        ) {
          condition = true;
          break;
        }
      }
      if (i < 3) {
        if (
          gameboard[i] == gameboard[i + 3] &&
          gameboard[i] == gameboard[i + 6]
        ) {
          condition = true;
        }
      }
    }
    if (condition) {
      if (turn == playerA) return 1;
      else return -1;
    }
    let every = true;
    for (let x of gameboard) {
      if (x == undefined) {
        every = false;
      }
    }
    if (every) {
      return 0;
    }
    return null;
  }
  for (let div of gameBoard.divs) {
    div.addEventListener("click", _addMark);
  }
  _changeButton.addEventListener("click", _changeLetter);
  _restartButton.addEventListener("click", _restartmethod);
  _cpuButton.addEventListener("click", _cpuMethod);
})();
