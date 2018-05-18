/**
 * Memory Game App
 * Author: Giovanni Lara
 * Date: 05/18/2018
 * https://github.com/gioalo
 * Lic. M.I.T
 * v2.0
 */
(function () {

  'use strict';
  // Globals
  const GAME_BOARD = document.getElementById('gameBoard');
  const RESTART = document.getElementById('restart');
  const PLAY_AGAIN = document.getElementById('playAgain');
  const CARD_CLASSES = ['open', 'show', 'match', 'animated', 'shake', 'rubberBand'];
  const [OPEN_CARD, SHOW_CARD, MATCH_CARD, ANIMATED_CARD, ANIMATED_CARD_SHAKE, ANIMATED_CARD_RUBBER] = CARD_CLASSES;
  const MODAL = document.querySelector('.modal');
  let cards = [...document.querySelectorAll('li.card')];
  let tempList = [];


  /**
   * No need to reload page when restarting game you only need to
   * update the given DOM using createGameBoard() if reload is use you actually reloading the
   * whole page which is unessesary
   */
  function createGameBoard() {
    // Make sure temporary list is empty
    tempList = [];
    // Shuffle cards
    cards = shuffle(cards);
    const fragment = document.createDocumentFragment();
    cards.forEach(function (card) {
      // Remove any add classes history from cards
      card.classList.remove(...CARD_CLASSES);
      // Append to fragment
      fragment.appendChild(card);
    });
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

  function startGame(evt) {
    // Set the target element global dependency
    const target = evt.target;
    // Adds an event to any card in the deck/game board
    if (target.nodeName === 'LI') {
      // Call game funtionality
      openCard();
      matchOpenCards();
      scorePanel.displayScores();
      // For perf reasons remove events from the elements
      target.removeEventListener('click', startGame, false);
    }

    function openCard() {
      target.classList.add(OPEN_CARD, SHOW_CARD);
    }

    function matchOpenCards() {
      // Add current open cards to a temporary list
      tempList.push(target);
      // Check if more than one card is open
      if (tempList.length === 2) {
        // Count moves
        scorePanel.countMoves++;
        // Wait to find a match
        setTimeout(function () {
          if (tempList[0].firstElementChild.className === tempList[1].firstElementChild.className)
            matchCards();
          else
            closeCards();
          // Clear temporary list start fresh
          tempList = [];
        }, 500);
      } else {
        return false;
      }
    }
  }

  function matchCards() {
    // Count matches
    scorePanel.countMatches += 2;
    // Animate match cards
    animateCard(tempList[0], ANIMATED_CARD_RUBBER);
    animateCard(tempList[1], ANIMATED_CARD_RUBBER);
    // Add match class to open cards
    tempList[0].classList.add(MATCH_CARD);
    tempList[1].classList.add(MATCH_CARD);
    // Check match cards counter, counter needs to equal total numer of cards, then , stop timer and display winner screen
    if (scorePanel.countMatches === cards.length) {
      stopTimer();
      displayWinner();
    }
  }

  function closeCards() {
    // Animate wrong match
    animateCard(tempList[0], ANIMATED_CARD_SHAKE);
    animateCard(tempList[1], ANIMATED_CARD_SHAKE);
  }

  function animateCard(el, animation) {
    // First animate card element
    el.classList.add(animation, ANIMATED_CARD);
    // Then remove animation and added classes
    setTimeout(() => {
      el.classList.remove(animation, ANIMATED_CARD, OPEN_CARD, SHOW_CARD);
    }, 500);
  }

  function displayWinner() {
    let mm = `0${time.min}`.slice(-2);
    let ss = `0${time.sec - 1}`.slice(-2);
    MODAL.classList.remove('modal--hidden');
    MODAL.classList.add('animated', 'zoomIn');
    document.getElementById('movesScore').textContent = scorePanel.countMoves;
    document.getElementById('recordTime').textContent = `${mm}:${ss}`;
    document.getElementById('starsScore').textContent = scorePanel.stars;
  }

  /**
   * Config score panel
   */
  const starsEl = document.querySelectorAll('ul.stars li'),
    movesEl = document.querySelector('span.moves'),
    timeEl = document.querySelector('span.time');
  const PENALTY = 12,
    STARS_LEN = starsEl.length;
  const scorePanel = {
    countMoves: 0,
    countMatches: 0,
    penalty: PENALTY,
    stars: STARS_LEN,
    displayScores() {
      // Display moves
      movesEl.textContent = this.countMoves;
      // Check if there are stars left
      if (this.stars !== 0) {
        // Check if number of moves equals penalty
        if (this.countMoves === this.penalty) {
          // Remove a star
          this.stars--;
          // Adds empty star icon
          starsEl[this.stars].firstElementChild.classList.add('fa-star-o');
          // Add next cycle penalty
          this.penalty += PENALTY;
        }
      }
    },
    reset() {
      this.countMoves = 0;
      this.countMatches = 0;
      this.stars = STARS_LEN;
      this.penalty = PENALTY;
      timeEl.textContent = '00:00';
      movesEl.textContent = 0;
      starsEl.forEach(function (star) {
        star.firstElementChild.classList.remove('fa-star-o');
      });
    }
  };

  /**
   * Time Config
   */

  const time = {
    isRunning: false,
    timeoutID: null,
    sec: 0,
    min: 0,
    hr: 0,
    reset() {
      this.isRunning = false;
      this.timeoutID = null;
      this.sec = 0;
      this.min = 0;
      this.hr = 0;
    }
  }

  function tick() {
    displayTimer();
    if (time.sec++ === 59) {
      time.sec = 0;
      time.min++;
      if (time.min === 59) {
        time.min = 0;
        time.hr++;
        if (time.hr === 24) {
          time.hr = 0;
        }
      }
    }
    time.timeoutID = setTimeout(() => {
      tick();
    }, 1000);
  }

  function startTimer(event) {
    event.preventDefault();
    if (!time.isRunning) {
      time.isRunning = true;
      tick();
      event.target.removeEventListener('click', startTimer, false);
    }
  }

  function stopTimer() {
    clearTimeout(time.timeoutID);
    time.timeoutID = null;
  }

  function displayTimer() {
    let mm = `0${time.min}`.slice(-2);
    let ss = `0${time.sec}`.slice(-2);
    timeEl.textContent = `${mm}:${ss}`;
  }
  /**
   * Reset game
   */
  function resetGame() {
    stopTimer();
    scorePanel.reset();
    time.reset();
    createGameBoard();
  }

  function playAgain() {
    // Hide modal and remove animation classes
    MODAL.classList.remove('animated', 'zoomIn');
    MODAL.classList.add('modal--hidden');
    // Reset game
    resetGame();
  }

  /**
   * Game events
   */
  GAME_BOARD.addEventListener('click', startTimer);
  GAME_BOARD.addEventListener('click', startGame);
  RESTART.addEventListener('click', resetGame);
  PLAY_AGAIN.addEventListener('click', playAgain);

}());