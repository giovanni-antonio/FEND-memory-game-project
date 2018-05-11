/**
 * MEMORY GAME PROJECT
 * Author: Giovanni Lara
 * Date: May 8, 2018
 * https://github.com/gioalo
 * v1.0
 */

/**
 * GAME SETTINGS
 */
// Controls
const GAME_BOARD = document.getElementById('gameBoard');
const RESTART = document.getElementById('restart');
const PLAY_AGAIN = document.getElementById('playAgain');
const TIMEOUT = 500;

// Cards
const CARD_CLASSES = ['open', 'show', 'match'];
const [OPEN_CARD, SHOW_CARD, MATCH_CARD] = CARD_CLASSES;
let cards = [...document.querySelectorAll('li.card')];
let list = [];
let matchCards = 0;

// Modal
let modal = document.querySelector('div.modal');
let movesScore = document.getElementById('movesScore');
let starsScore = document.getElementById('starsScore');


/**
 * SCORE PANEL
 */

let scorePanelStars = document.querySelectorAll('ul.stars li');
let scorePanelMoves = document.querySelector('span.moves');
const STARS_LENGTH = scorePanelStars.length;
const PENALTY_VAL = 16;

let scorePanel = {
  moves: 0,
  stars: STARS_LENGTH,
  penalty: PENALTY_VAL,
  reset() {
    this.moves = 0;
    this.stars = STARS_LENGTH;
    this.penalty = PENALTY_VAL;
    scorePanelMoves.textContent = 0;
    for (let i = 0; i < STARS_LENGTH; i++) {
      scorePanelStars[i].firstElementChild.classList.remove('fa-star-o');
    }
  }
};

/**
 * DISPLAY CARDS
 */

function displayBoard() {
  cards = shuffle(cards);
  let fragment = document.createDocumentFragment();
  for (let i = 0; i < cards.length; i++) {
    // Clean-up old game history
    cards[i].classList.remove(...CARD_CLASSES);
    // add fresh cards
    fragment.appendChild(cards[i]);
  }
  GAME_BOARD.appendChild(fragment);
}

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

displayBoard();

/**
 * GAME FUNCTIONALITY
 */

function playGame(event) {
  let target = event.target;
  if (target.nodeName === 'LI') {
    displayCard(target);
    matchingCards(target);
  }
}

function hideCard() {
  for (let i = 0; i < list.length; i++) {
    list[i].classList.remove(OPEN_CARD, SHOW_CARD);
  }
}

function openCard() {
  for (let i = 0; i < list.length; i++) {
    list[i].classList.add(MATCH_CARD);
    list[i].classList.remove(OPEN_CARD, SHOW_CARD);
  }
  matchCards += 2;
  displayWinner();
}

function matchingCards(target) {
  list.push(target);
  if (list.length === 2) {
    setTimeout(function () {
      if (list[0].firstElementChild.className === list[1].firstElementChild.className) {
        openCard();
      } else {
        hideCard();
      }
      list = [];
    }, TIMEOUT);
    scorePanel.moves++;
    displayMoves();
    displayStarPenalty();
  }
}

function displayStarPenalty() {
  if (scorePanel.stars !== 0) {
    if (scorePanel.moves === scorePanel.penalty) {
      scorePanel.stars--;
      scorePanelStars[scorePanel.stars].firstElementChild.classList.add('fa-star-o');
      scorePanel.penalty += PENALTY_VAL;
    }
  }
}

function displayMoves() {
  scorePanelMoves.textContent = scorePanel.moves;
}

function displayCard(target) {
  target.classList.add(OPEN_CARD, SHOW_CARD);
}

function displayWinner() {
  if (matchCards === cards.length) {
    modal.classList.remove('modal--hidden');
    movesScore.textContent = scorePanel.moves;
    starsScore.textContent = scorePanel.stars;
  }
}

function playAgain() {
  modal.classList.add('modal--hidden');
  movesScore.textContent = 0;
  starsScore.textContent = 0;
  resetGame();
}

function resetGame() {
  list = [];
  scorePanel.reset();
  displayBoard();
}

/**
 * GAME CONTROLS
 */
GAME_BOARD.addEventListener('click', playGame);
RESTART.addEventListener('click', resetGame);
PLAY_AGAIN.addEventListener('click', playAgain);