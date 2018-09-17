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
  const SPLASH_SCREEN = document.getElementById('start-screen');
  const STARS_CONTAINER = document.getElementById('starsScore');
  const PLAYER_FORM = document.getElementById('form');
  const GREET_PLAYER = document.getElementById('greet-player');
  const CARD_CLASSES = ['open', 'show', 'match', 'animated', 'shake', 'rubberBand', 'flipInY'];
  const [OPEN_CARD, SHOW_CARD, MATCH_CARD, ANIMATED_CARD, ANIMATED_CARD_SHAKE, ANIMATED_CARD_RUBBER, ANIMATED_CARD_FLIPY] = CARD_CLASSES;
  const SCORES_DATA = [];
  const MODAL = document.querySelector('.modal');
  let cards = [...document.querySelectorAll('li.card')];
  let tempList = [];
  let score = 0;

  /**
   * No need to reload page when restarting game you only need to
   * update the given DOM using createGameBoard() if reload is use you actually reloading the
   * whole page which is unnecessary
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

    // remove winner stars container
    STARS_CONTAINER.innerHTML = '';
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
   * Generate Game Board on page load
   */

  createGameBoard();

  /**
   *
   * Game Functionality
   */

  function startGame(evt) {
    // Set the target element global dependency
    const target = evt.target;
    // Adds an event to any card in the deck/game board
    if (target.nodeName === 'LI') {
      // Open/Show card
      openCard();
      // Add current open card to a temporary list
      tempList.push(target);
      // Check if more than one card in temporary list
      if (tempList.length === 2) {
        // Count moves
        scorePanel.countMoves++;
        // Matching processing
        matchOpenCards();
        // Display score
        scorePanel.displayScores();
      } else {
        return false;
      }
      // For perf reasons remove events from the elements
      target.removeEventListener('click', startGame, false);
    }

    function openCard() {
      target.classList.add(OPEN_CARD, SHOW_CARD);
    }

    function matchOpenCards() {
      // Wait to find a match
      setTimeout(function () {
        if (tempList[0].firstElementChild.className === tempList[1].firstElementChild.className) {
          matchCards();
        } else {
          closeCards();
        }
        // Clear temporary list start fresh
        tempList = [];
      }, 500);
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
      // Check match cards counter, counter needs to equal total number of cards, then , stop timer and display winner screen
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
      playerScore(scorePanel.stars);
      let star, startFragment = document.createDocumentFragment();
      if(scorePanel.stars >= 1) {
        for (let i = 1; i <= scorePanel.stars; i++) {
          star = document.createElement('i');
          star.classList.add('fa','fa-star');
          star.style.color = '#ff0';
          startFragment.appendChild(star);
        }
        STARS_CONTAINER.appendChild(startFragment);
      } else {
        star = document.createElement('i');
        star.classList.add('fa','fa-frown-o');
        star.style.color = 'red';
        STARS_CONTAINER.appendChild(star);
      }
    }
  }
  /**
   * Config score panel
   */
  const starsEl = document.querySelectorAll('ul.stars li'),
    movesEl = document.querySelector('span.moves'),
    timeEl = document.querySelector('span.time');
  const PENALTY = 16,
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
    SPLASH_SCREEN.classList.remove('hidden');
  }

  function playAgain() {
    // Hide modal and remove animation classes
    MODAL.classList.remove('animated', 'zoomIn');
    MODAL.classList.add('modal--hidden');
    // Reset game
    resetGame();
    // optional start with splash screen
    SPLASH_SCREEN.classList.remove('hidden');
  }

  function splashScreen(event) {
    event.preventDefault();
    event.currentTarget.classList.add('hidden');
    startTimer(event);
  }

  // Greet player with message
  function typeMessage(message, color) {
    GREET_PLAYER.textContent = message;
    GREET_PLAYER.style.color = color || '#000';
  }

  function playerScore(stars) {
    switch (stars) {
      case 3:
        typeMessage('Outstanding!');
        break;
      case 2:
        typeMessage('Great Job!');
        break;
      case 1:
        typeMessage('Good Job!');
        break;
      default:
        typeMessage('So Sad! Try Again!','red');
        break;
    }
  }

  // if (storageAvailable('localStorage')) {
  //   // Yippee! We can use localStorage awesomeness
  // } else {
  //   // Too bad, no localStorage for us
  //   console.error('Too bad, no localStorage for us');
  // }

  /**
   * Game events
   */
  SPLASH_SCREEN.addEventListener('click', splashScreen);
  GAME_BOARD.addEventListener('click', startGame);
  RESTART.addEventListener('click', resetGame);
  PLAY_AGAIN.addEventListener('click', playAgain);


  /**
   * Poly localstorage
   */

  function storageAvailable(type) {
    try {
      var storage = window[type],
        x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return e instanceof DOMException && (
          // everything except Firefox
          e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === 'QuotaExceededError' ||
          // Firefox
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage.length !== 0;
    }
  }
}());