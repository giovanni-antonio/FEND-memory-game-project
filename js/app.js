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
(function () {
  'use strict';
  // Controls
  const GAME_BOARD = document.getElementById('gameBoard');
  const RESTART = document.getElementById('restart');
  const PLAY_AGAIN = document.getElementById('playAgain');
  const TIMEOUT = 500;
  let timeID = null;

  // Cards
  const CARD_CLASSES = ['open', 'show', 'match', 'animated', 'shake', 'rubberBand'];
  const [OPEN_CARD, SHOW_CARD, MATCH_CARD, ANIMATED_CARD, ANIMATED_CARD_SHAKE, ANIMATED_CARD_RUBBER] = CARD_CLASSES;
  let cards = [...document.querySelectorAll('li.card')];
  let list = [];

  // Modal
  let modal = document.querySelector('div.modal');
  let movesScore = document.getElementById('movesScore');
  let starsScore = document.getElementById('starsScore');
  let recordTime = document.getElementById('recordTime');

  // Time
  const TIME = document.querySelector('span.time');

  /**
   * SCORE CONFIG
   */

  let scorePanelStars = document.querySelectorAll('ul.stars li');
  let scorePanelMoves = document.querySelector('span.moves');
  const STARS_LENGTH = scorePanelStars.length;
  const PENALTY_VAL = 16;

  let scorePanel = {
    moves: 0,
    stars: STARS_LENGTH,
    penalty: PENALTY_VAL,
    openCardsCount: 0,
    reset() {
      this.moves = 0;
      this.stars = STARS_LENGTH;
      this.penalty = PENALTY_VAL;
      this.openCardsCount = 0;
      scorePanelMoves.textContent = 0;
      for (let i = 0; i < STARS_LENGTH; i++) {
        scorePanelStars[i].firstElementChild.classList.remove('fa-star-o');
      }
    }
  };

  /**
   * TIMER CONFIG
   */

  let timeControl = {
    uptime: false,
    seconds: 1,
    minutes: 0,
    hours: 0,
    delay: 1000,
    reset() {
      this.seconds = 1;
      this.minutes = 0;
      this.hours = 0;
      this.uptime = false;
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

  /**
   * Create board
   */

  displayBoard();

  /**
   * TIMER FUNCTIONALITY
   */

  function gameTimer() {
    displayTimer();
    // check for secs, mins, and hours
    if (timeControl.seconds++ === 59) {
      timeControl.seconds = 0;
      timeControl.minutes++;
      if (timeControl.minutes === 59) {
        timeControl.minutes = 0;
        timeControl.hours++;
        if (timeControl.hours === 24) {
          timeControl.hours = 0;
        }
      }
    }
    timeID = setTimeout(() => {
      gameTimer();
    }, timeControl.delay);
  }

  function startTimer(event) {
    event.preventDefault();
    if (!timeControl.uptime) {
      timeControl.uptime = true;
      gameTimer();
      event.target.removeEventListener('click', startTimer, false);
    }
  }

  function displayTimer() {
    TIME.textContent = `${timeControl.minutes}:${timeControl.seconds}`;
  }

  function stopTimer() {
    clearTimeout(timeID);
    timeControl.reset();
    TIME.textContent = '0:0';
    timeID = null;
  }

  /**
   * GAME FUNCTIONALITY
   */

  function playGame(event) {
    let target = event.target;
    if (target.nodeName === 'LI') {
      displayCard(target);
      matchingCards(target);
      displayMoves();
      displayStarPenalty();
      // Removes event after done
      target.removeEventListener('click', playGame, false);
    }
  }

  function hideCard() {
    for (let i = 0; i < list.length; i++) {
      animateCard(list[i], ANIMATED_CARD_SHAKE);
    }
  }

  function openCard() {
    scorePanel.openCardsCount += 2;
    for (let i = 0; i < list.length; i++) {
      list[i].classList.add(MATCH_CARD);
      animateCard(list[i], ANIMATED_CARD_RUBBER);
    }
    // when all cards are open display winner screen
    displayWinner();
  }

  // Create animation
  function animateCard(el, animation) {
    el.classList.add(animation, ANIMATED_CARD);
    setTimeout(() => {
      el.classList.remove(animation, ANIMATED_CARD, OPEN_CARD, SHOW_CARD);
    }, TIMEOUT);
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
    if (scorePanel.openCardsCount === cards.length) {
      modal.classList.remove('modal--hidden');
      movesScore.textContent = scorePanel.moves;
      starsScore.textContent = scorePanel.stars;
      recordTime.textContent = `${timeControl.minutes}:${timeControl.seconds}`;
      stopTimer();
    }
  }

  function playAgain(event) {
    modal.classList.add('modal--hidden');
    movesScore.textContent = 0;
    starsScore.textContent = 0;
    resetGame();
  }

  function resetGame(event) {
    stopTimer();
    scorePanel.reset();
    list = [];
    displayBoard();
  }

  /**
   * GAME CONTROLS
   */
  // To start game timer
  GAME_BOARD.addEventListener('click', startTimer);
  // Play game event
  GAME_BOARD.addEventListener('click', playGame);
  RESTART.addEventListener('click', resetGame);
  PLAY_AGAIN.addEventListener('click', playAgain);
})();