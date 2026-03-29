'use strict';

// Selecting Elements
const player0El = document.querySelector('.player--0');
const player1El = document.querySelector('.player--1');
const score0El = document.querySelector('#score--0');
const score1El = document.querySelector('#score--1');
const current0El = document.getElementById('current--0');
const current1El = document.getElementById('current--1');

const diceEl = document.querySelector('.dice');
const btnNew = document.querySelector('.btn--new');
const btnRoll = document.querySelector('.btn--roll');
const btnHold = document.querySelector('.btn--hold');
const btnInfo = document.querySelector('.btn-info');

// Modals
const modalRules = document.querySelector('.modal--rules');
const modalNotif = document.querySelector('.modal--notification');
const overlay = document.querySelector('.overlay');
const btnCloseNotif = document.querySelector(
  '.modal--notification .close-modal',
);
const btnPrimary = document.getElementById('btn-primary');
const btnSecondary = document.getElementById('btn-secondary');
const btnPlayAgain = document.getElementById('btn-play-again');
const notifIconContainer = document.getElementById('notif-icon-container');

// Settings Inputs
const winScoreInput = document.getElementById('win-score-input');
const penaltyDieInput = document.getElementById('penalty-die-input');

// Game State
let scores,
  currentScore,
  activePlayer,
  playing,
  gameMode,
  targetScore,
  penaltyDie;

// Functions
const updateRulesDisplay = function () {
  const t = winScoreInput.value || '100';
  const p = penaltyDieInput.value || '6';

  document.querySelectorAll('.win-val').forEach(el => (el.textContent = t));
  document.querySelectorAll('.penalty-val').forEach(el => (el.textContent = p));
};

const validateNumericInput = function (e) {
  // Allow only digits
  const value = e.target.value;
  e.target.value = value.replace(/[^0-9]/g, '');

  updateRulesDisplay();
};

const getCryptoRandom = function (min, max) {
  const range = max - min + 1;
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return min + (array[0] % range);
};

// Functions
const init = function () {
  scores = [0, 0];
  currentScore = 0;
  activePlayer = 0;
  playing = true;
  gameMode =
    document.querySelector('.btn-mode.active')?.dataset.mode || 'normal';
  targetScore = parseInt(winScoreInput.value, 10) || 100;
  penaltyDie = parseInt(penaltyDieInput.value, 10) || 6;

  score0El.textContent = 0;
  score1El.textContent = 0;
  current0El.textContent = 0;
  current1El.textContent = 0;

  diceEl.classList.add('hidden');
  player0El.classList.remove('player--winner');
  player1El.classList.remove('player--winner');
  player0El.classList.add('player--active');
  player1El.classList.remove('player--active');
};

const btnModes = document.querySelectorAll('.btn-mode');
const cards = document.querySelectorAll('.protocol-card');
const notifTitle = document.getElementById('notif-title');
const notifText = document.getElementById('notif-text');

const openRulesModal = function (type = 'init') {
  modalRules.classList.remove('hidden');
  overlay.classList.remove('hidden');

  const isReadOnly = type === 'info';
  winScoreInput.disabled = isReadOnly;
  penaltyDieInput.disabled = isReadOnly;
  btnModes.forEach(btn => (btn.disabled = isReadOnly));

  if (type === 'init') {
    btnPrimary.classList.remove('hidden');
    btnPrimary.textContent = 'Start Game';
    btnSecondary.classList.add('hidden');
  } else if (type === 'info') {
    btnPrimary.classList.add('hidden');
    btnSecondary.classList.remove('hidden');
    btnSecondary.textContent = 'Close';
  } else if (type === 'new-game') {
    btnPrimary.classList.remove('hidden');
    btnPrimary.textContent = 'Start New Game';
    btnSecondary.classList.remove('hidden');
    btnSecondary.textContent = 'Cancel';
  }
};

const switchPlayer = function () {
  const currentVal = parseInt(
    document.getElementById(`current--${activePlayer}`).textContent,
    10,
  );
  document.getElementById(`current--${activePlayer}`).textContent = 0;
  currentScore = 0;
  activePlayer = activePlayer === 0 ? 1 : 0;
  player0El.classList.toggle('player--active');
  player1El.classList.toggle('player--active');
};

const openNotif = function (title, message, type = 'loss') {
  notifTitle.textContent = title;
  notifText.textContent = message;

  // Reset modal state
  modalNotif.classList.remove('border-winner', 'shadow-winner');
  notifTitle.classList.remove('text-winner', 'text-accent');
  btnPlayAgain.classList.add('hidden');
  notifIconContainer.innerHTML = '';
  notifIconContainer.classList.remove('active', 'scale-100');
  notifIconContainer.classList.add('scale-0');

  if (type === 'win') {
    modalNotif.classList.add('border-winner', 'shadow-winner');
    notifTitle.classList.add('text-winner');
    btnPlayAgain.classList.remove('hidden');

    // Trophy Icon
    notifIconContainer.innerHTML = `
      <svg class="trophy-icon-active" width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9V2H18V9C18 12.3137 15.3137 15 12 15C8.68629 15 6 12.3137 6 9Z" fill="#FFD700"/>
        <path d="M6 4H3V7C3 8.65685 4.34315 10 6 10V4Z" fill="#FFD700"/>
        <path d="M18 4H21V7C21 8.65685 19.6569 10 18 10V4Z" fill="#FFD700"/>
        <path d="M12 15V22M8 22H16" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  } else {
    notifTitle.classList.add('text-accent');
    // Warning Icon
    notifIconContainer.innerHTML = `
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#ff2a70" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }

  modalNotif.classList.remove('hidden');
  overlay.classList.remove('hidden');

  // Trigger icon entrance
  setTimeout(() => {
    notifIconContainer.classList.remove('scale-0');
    notifIconContainer.classList.add('scale-100', 'active');
  }, 100);

  btnCloseNotif.focus();
};

const handleWin = function () {
  scores[activePlayer] = targetScore;
  document.getElementById(`score--${activePlayer}`).textContent = targetScore;
  playing = false;
  diceEl.classList.add('hidden');
  document
    .querySelector(`.player--${activePlayer}`)
    .classList.add('player--winner');
  document
    .querySelector(`.player--${activePlayer}`)
    .classList.remove('player--active');

  // Confetti Celebration
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#ff2a70', '#ffffff', '#2c5364'],
    zIndex: 999999,
  });

  openNotif(
    'Winner!',
    `Congratulations Player ${activePlayer + 1}! You are first to reach ${targetScore} points!`,
    'win',
  );
};

const closeModals = function () {
  modalRules.classList.add('hidden');
  modalNotif.classList.add('hidden');
  overlay.classList.add('hidden'); // Always hide overlay when closing modals
};

const updateRules = function (mode) {
  gameMode = mode;
  updateRulesDisplay();

  btnModes.forEach(btn => {
    const isActive = btn.dataset.mode === mode;
    btn.classList.toggle('active', isActive);
    btn.classList.toggle('text-[#0f2027]', isActive);
    btn.classList.toggle('text-white/40', !isActive);
  });

  cards.forEach(card => {
    const isTarget = card.classList.contains(`protocol--${mode}`);
    card.classList.toggle('hidden', !isTarget);
    if (isTarget) {
      card.classList.remove('opacity-40');
      card.classList.add('opacity-100');
    }
  });

  // Update btnPrimary background and shadow based on mode
  if (mode === 'normal') {
    btnPrimary.classList.add(
      'bg-neon/70',
      'shadow-neon-glow',
      'hover:shadow-neon-glow-lg',
    );
    btnPrimary.classList.remove(
      'bg-accent',
      'shadow-glow',
      'hover:shadow-glow-lg',
    );
  } else {
    btnPrimary.classList.add(
      'bg-accent',
      'shadow-glow',
      'hover:shadow-glow-lg',
    );
    btnPrimary.classList.remove(
      'bg-neon',
      'shadow-neon-glow',
      'hover:shadow-neon-glow-lg',
    );
  }
};

// Event Listeners for inputs
winScoreInput.addEventListener('input', validateNumericInput);
penaltyDieInput.addEventListener('input', validateNumericInput);

btnModes.forEach(btn => {
  btn.addEventListener('click', () => updateRules(btn.dataset.mode));
});

// Initialize display
updateRules('normal');

btnPrimary.addEventListener('click', () => {
  if (
    btnPrimary.textContent === 'Start New Game' ||
    btnPrimary.textContent === 'Start Game'
  ) {
    init();
  }
  closeModals();
});

btnSecondary.addEventListener('click', () => {
  if (btnSecondary.textContent === 'Cancel') {
    playing = true; // Resume game
  }
  closeModals();
});

btnInfo.addEventListener('click', () => openRulesModal('info'));

btnNew.addEventListener('click', () => {
  if (playing) {
    playing = false; // Pause while deciding
    openRulesModal('new-game');
  } else {
    openRulesModal('init');
  }
});

btnCloseNotif.addEventListener('click', closeModals);

btnPlayAgain.addEventListener('click', () => {
  init();
  closeModals();
});

overlay.addEventListener('click', () => {
  // Only allow clicking overlay to close if we are in 'info' mode
  // or if a notification is open
  const isInfo =
    !btnSecondary.classList.contains('hidden') &&
    btnSecondary.textContent === 'Close';
  const isNotif = !modalNotif.classList.contains('hidden');

  if (isInfo || isNotif) {
    if (isInfo && !playing) playing = true; // Safety resume if somehow not playing
    closeModals();
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const isInfo =
      !btnSecondary.classList.contains('hidden') &&
      btnSecondary.textContent === 'Close';
    const isNotif = !modalNotif.classList.contains('hidden');
    if (isInfo || isNotif) closeModals();
  }
});

// Rolling Dice Functionality
btnRoll.addEventListener('click', function () {
  if (playing) {
    const dice = getCryptoRandom(1, 6);
    diceEl.classList.remove('hidden');
    diceEl.src = `dice-${dice}.png`;

    // Trigger shake animation
    diceEl.classList.remove('animate-shake');
    void diceEl.offsetWidth; // Force reflow
    diceEl.classList.add('animate-shake');

    if (dice !== penaltyDie) {
      const potentialTotal = scores[activePlayer] + currentScore + dice;

      if (potentialTotal === targetScore) {
        // AUTO WIN
        currentScore += dice;
        document.getElementById(`current--${activePlayer}`).textContent =
          currentScore;
        handleWin();
      } else if (potentialTotal > targetScore) {
        // AUTO OVERFLOW
        const accumulatedThisTurn = currentScore;
        currentScore += dice;
        document.getElementById(`current--${activePlayer}`).textContent =
          currentScore;

        let message = `You rolled a ${dice}, exceeding target score of ${targetScore}!`;
        if (gameMode === 'hardcore' && accumulatedThisTurn > 0) {
          scores[activePlayer] = Math.max(
            0,
            scores[activePlayer] - accumulatedThisTurn,
          );
          document.getElementById(`score--${activePlayer}`).textContent =
            scores[activePlayer];
          message += ` ${accumulatedThisTurn} points deducted from your total!`;
        } else {
          message += ` No points added this turn.`;
        }
        message += ` Player ${activePlayer === 0 ? 2 : 1}'s turn.`;

        openNotif('Turn Lost!', message);
        switchPlayer();
      } else {
        // NORMAL ROLL
        currentScore += dice;
        document.getElementById(`current--${activePlayer}`).textContent =
          currentScore;
      }
    } else {
      let message = `You rolled a ${penaltyDie}!`;
      if (gameMode === 'hardcore' && currentScore > 0) {
        scores[activePlayer] = Math.max(0, scores[activePlayer] - currentScore);
        document.getElementById(`score--${activePlayer}`).textContent =
          scores[activePlayer];
        message += ` ${currentScore} points deducted from your total!`;
      }
      message += ` Player ${activePlayer === 0 ? 2 : 1}'s turn.`;

      openNotif('Turn Lost!', message);
      switchPlayer();
    }
  }
});

btnHold.addEventListener('click', function () {
  if (playing) {
    const newScore = scores[activePlayer] + currentScore;

    if (newScore === targetScore) {
      handleWin();
    } else if (newScore > targetScore) {
      // should already be caught by auto-calculation if implemented correctly in roll,
      // but if user holds manually on an overflow (not possible now but just in case)
      let message = `Manual hold exceeded target score of ${targetScore}!`;
      if (gameMode === 'hardcore') {
        scores[activePlayer] = Math.max(0, scores[activePlayer] - currentScore);
        document.getElementById(`score--${activePlayer}`).textContent =
          scores[activePlayer];
      }
      message += ` Player ${activePlayer === 0 ? 2 : 1}'s turn.`;
      openNotif('Turn Lost!', message);
      switchPlayer();
    } else {
      scores[activePlayer] = newScore;
      document.getElementById(`score--${activePlayer}`).textContent =
        scores[activePlayer];
      switchPlayer();
    }
  }
});

// Initial State Setup
updateRules('normal');
playing = false;
openRulesModal('init');
