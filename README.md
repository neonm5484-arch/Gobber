const STORAGE_KEY = 'gobber-state-v1';

const defaultState = {
  currentUserId: 'user-neo',
  view: 'home',
  selectedMode: 'classic',
  currentQuestion: null,
  currentQuestionIndex: 0,
  inventory: ['Starter Badge', 'Glow Orb'],
  users: [
    { id: 'user-neo', name: 'NeonMan', coins: 420, status: 'active', isAdmin: true, avatar: 'N' },
    { id: 'user-2', name: 'Ari', coins: 230, status: 'active', isAdmin: false, avatar: 'A' },
    { id: 'user-3', name: 'Mina', coins: 180, status: 'suspended', isAdmin: false, avatar: 'M' },
    { id: 'user-4', name: 'Jules', coins: 310, status: 'active', isAdmin: false, avatar: 'J' }
  ]
};

const PACKS = [
  {
    id: 'uncommon',
    name: 'Uncommon Pack',
    rarity: 'Uncommon',
    cost: 35,
    odds: 50,
    items: ['Glow Orb', 'Coin Burst', 'Pixel Pin', 'Star Sticker', 'Spark Token']
  },
  {
    id: 'rare',
    name: 'Rare Pack',
    rarity: 'Rare',
    cost: 80,
    odds: 30,
    items: ['Nova Charm', 'Turbo Boost', 'Lucky Meteor', 'Power Cube', 'Moon Gem']
  },
  {
    id: 'epic',
    name: 'Epic Pack',
    rarity: 'Epic',
    cost: 150,
    odds: 14,
    items: ['Storm Crown', 'Sunfire Rune', 'Void Prism', 'Titan Medal', 'Lightning Cape']
  },
  {
    id: 'legendary',
    name: 'Legendary Pack',
    rarity: 'Legendary',
    cost: 300,
    odds: 5,
    items: ['Gobber Core', 'Solar Dragon', 'Phantom Crown', 'Aether Blade', 'Moonshine Aura']
  },
  {
    id: 'secret',
    name: 'Secret Pack',
    rarity: 'Secret',
    cost: 600,
    odds: 1,
    items: ['Obsidian Genesis', 'Dimensional Echo', 'Void Sovereign', 'Celestial Warden', 'Prime Relic']
  }
];

const MODE_DATA = [
  {
    id: 'classic',
    name: 'Classic Chaos',
    description: 'Fast quiz rounds with streak bonuses and coin rewards.',
    reward: 35,
    difficulty: 'Easy'
  },
  {
    id: 'team',
    name: 'Team Rush',
    description: 'Split into teams and race for the fastest correct answers.',
    reward: 45,
    difficulty: 'Medium'
  },
  {
    id: 'gold',
    name: 'Gold Rush',
    description: 'Every correct answer adds bonus coins and boosts your payout.',
    reward: 60,
    difficulty: 'Medium'
  },
  {
    id: 'speed',
    name: 'Speed Run',
    description: 'Answer quickly to chain multipliers and unlock big prizes.',
    reward: 80,
    difficulty: 'Hard'
  },
  {
    id: 'survival',
    name: 'Survival',
    description: 'Stay alive through a set of rapid-fire challenge rounds.',
    reward: 95,
    difficulty: 'Hard'
  }
];

const QUIZ_BANK = [
  {
    question: 'What does CSS stand for?',
    options: ['Creative Style Selector', 'Cascading Style Sheets', 'Computer Setup System', 'Core Script Styling'],
    answer: 'Cascading Style Sheets'
  },
  {
    question: 'Which language powers interactivity in the browser?',
    options: ['HTML', 'JavaScript', 'CSS', 'Markdown'],
    answer: 'JavaScript'
  },
  {
    question: 'What is the term for a set of rules that a computer follows?',
    options: ['Algorithm', 'Database', 'Segment', 'Sprite'],
    answer: 'Algorithm'
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Mercury'],
    answer: 'Mars'
  },
  {
    question: 'What does CPU stand for?',
    options: ['Central Processing Unit', 'Computer Power Utility', 'Core Program Update', 'Central Program Unit'],
    answer: 'Central Processing Unit'
  }
];

let state = loadState();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultState);

  try {
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...parsed, users: parsed.users || defaultState.users, inventory: parsed.inventory || defaultState.inventory };
  } catch (error) {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getCurrentUser() {
  return state.users.find((user) => user.id === state.currentUserId) || state.users[0];
}

function setView(view) {
  state.view = view;
  saveState();
  renderApp();
}

function selectMode(modeId) {
  state.selectedMode = modeId;
  state.currentQuestionIndex = 0;
  const nextQuestion = getNextQuestion();
  state.currentQuestion = nextQuestion;
  saveState();
  renderApp();
}

function getNextQuestion() {
  const question = QUIZ_BANK[state.currentQuestionIndex % QUIZ_BANK.length];
  return question;
}

function handleAnswer(answer) {
  if (!state.currentQuestion) return;

  const currentUser = getCurrentUser();
  const correct = answer === state.currentQuestion.answer;
  const mode = MODE_DATA.find((entry) => entry.id === state.selectedMode) || MODE_DATA[0];

  if (correct) {
    currentUser.coins += mode.reward;
    state.inventory.push('Streak Spark');
  }

  state.currentQuestionIndex += 1;
  state.currentQuestion = getNextQuestion();
  saveState();
  renderApp();
}

function openPack(packId) {
  const pack = PACKS.find((entry) => entry.id === packId);
  const currentUser = getCurrentUser();

  if (!pack) return;
  if (currentUser.coins < pack.cost) {
    alert('Not enough coins for that pack.');
    return;
  }

  currentUser.coins -= pack.cost;
  const randomItem = pack.items[Math.floor(Math.random() * pack.items.length)];
  state.inventory.push(randomItem);
  const reveal = document.createElement('div');
  reveal.className = 'pack-reveal';
  reveal.innerHTML = `
    <div class="pack-card ${pack.id === 'secret' ? 'secret' : ''}">
      <div class="small-word">${pack.rarity}</div>
      <div class="card-name">${randomItem}</div>
      <div class="small-word">${pack.name}</div>
    </div>
  `;

  document.body.appendChild(reveal);
  setTimeout(() => {
    reveal.remove();
    saveState();
    renderApp();
  }, 1600);
}

function openAdmin() {
  const pin = prompt('Enter admin PIN');
  if (pin === 'NeonMan') {
    state.view = 'admin';
    saveState();
    renderApp();
    return;
  }

  alert('Incorrect admin PIN.');
}

function updateUserField(field, value) {
  const selectedUser = state.users.find((user) => user.id === document.getElementById('admin-user').value);
  if (!selectedUser) return;

  if (field === 'coins') {
    selectedUser.coins = Number(value);
  }

  if (field === 'status') {
    selectedUser.status = value;
  }

  if (field === 'admin') {
    selectedUser.isAdmin = value === 'true';
  }

  saveState();
  renderApp();
}

function renderApp() {
  const currentUser = getCurrentUser();
  const app = document.getElementById('app');

  const navButtons = ['home', 'modes', 'packs', 'profile'].map((name) => `
    <button class="${state.view === name ? 'active' : ''}" data-action="set-view" data-view="${name}">${name === 'home' ? 'Home' : name.charAt(0).toUpperCase() + name.slice(1)}</button>
  `).join('');

  const selectedMode = MODE_DATA.find((mode) => mode.id === state.selectedMode) || MODE_DATA[0];

  const pageContent = (() => {
    if (state.view === 'modes') {
      return `
        <div class="section-title">
          <h2>Game Modes</h2>
          <span class="mode-badge">Free to play</span>
        </div>
        <div class="grid">
          ${MODE_DATA.map((mode) => `
            <div class="card">
              <div class="mode-badge">${mode.difficulty}</div>
              <h3>${mode.name}</h3>
              <p>${mode.description}</p>
              <div class="inline-row">
                <button class="primary-btn" data-action="select-mode" data-mode="${mode.id}">Play</button>
                <span>+${mode.reward} coins</span>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="quiz-shell">
          <div class="question-panel">
            <div class="question-top">
              <strong>${selectedMode.name}</strong>
              <span>Question ${state.currentQuestionIndex + 1}</span>
            </div>
            <h2 style="margin-top: 12px;">${state.currentQuestion?.question || 'Choose a mode to begin.'}</h2>
            <div class="answer-grid">
              ${(state.currentQuestion?.options || []).map((option) => `
                <button class="answer-btn" data-action="answer-question" data-option="${option}">${option}</button>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (state.view === 'packs') {
      return `
        <div class="section-title">
          <h2>Loot Packs</h2>
          <span class="mode-badge">5 rarities</span>
        </div>
        <div class="pack-grid">
          ${PACKS.map((pack) => `
            <div class="pack-box rarity-${pack.id}">
              <div class="pack-header">
                <h3>${pack.name}</h3>
                <span class="rarity-pill">${pack.rarity}</span>
              </div>
              <p>${pack.items.length} possible rewards</p>
              <ul>
                ${pack.items.slice(0, 3).map((item) => `<li>• ${item}</li>`).join('')}
              </ul>
              <button class="primary-btn" data-action="open-pack" data-pack="${pack.id}">Open for ${pack.cost}</button>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (state.view === 'profile') {
      const adminButton = currentUser.isAdmin ? '<button class="admin-mini-btn" data-action="open-admin">Admin</button>' : '<button class="admin-mini-btn" data-action="open-admin">Admin PIN</button>';

      return `
        <div class="card profile-card">
          <div class="user-meta">
            <div class="avatar">${currentUser.avatar}</div>
            <div>
              <div class="user-name-row">
                <h2 style="margin: 0;">${currentUser.name}</h2>
                <span class="mode-badge">${currentUser.status}</span>
              </div>
              <p style="margin: 8px 0 0; color: var(--muted);">${currentUser.coins} coins</p>
            </div>
          </div>
          <div class="inline-row">
            ${adminButton}
            <button class="small-btn" data-action="set-view" data-view="home">Home</button>
          </div>
        </div>

        <div class="grid" style="margin-top: 18px;">
          <div class="card">
            <h3>Profile Stats</h3>
            <p>Coins: ${currentUser.coins}</p>
            <p>Status: ${currentUser.status}</p>
            <p>Role: ${currentUser.isAdmin ? 'Admin' : 'Player'}</p>
          </div>
          <div class="card">
            <h3>Inventory</h3>
            <div class="inventory-list">
              ${state.inventory.map((item) => `<span class="inventory-pill">${item}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (state.view === 'admin') {
      return `
        <div class="admin-panel">
          <div class="section-title">
            <h2>Admin Panel</h2>
            <button class="danger-btn" data-action="set-view" data-view="profile">Back to profile</button>
          </div>

          <div class="form-grid">
            <div class="field">
              <label>User</label>
              <select id="admin-user">
                ${state.users.map((user) => `<option value="${user.id}" ${user.id === currentUser.id ? 'selected' : ''}>${user.name}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label>Coins</label>
              <input id="admin-coins" type="number" value="${state.users[0]?.coins || 0}" />
            </div>
            <div class="field">
              <label>Status</label>
              <select id="admin-status">
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
            <div class="field">
              <label>Admin access</label>
              <select id="admin-role">
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          </div>

          <div class="cta-row" style="margin-top: 18px;">
            <button class="primary-btn" data-action="apply-admin-change">Apply changes</button>
            <button class="secondary-btn" data-action="set-view" data-view="profile">Cancel</button>
          </div>
        </div>
      `;
    }

    return `
      <section class="hero">
        <div class="hero-row">
          <div>
            <div class="mode-badge">Original quiz game</div>
            <h1>Gobber <span style="color: var(--primary);">is your free arena.</span></h1>
            <p>Play fast, fun knowledge rounds, unlock packs with five rarities, and build a collection inspired by premium card-drop games—in a completely original experience.</p>
            <div class="cta-row">
              <button class="primary-btn" data-action="set-view" data-view="modes">Play now</button>
              <button class="secondary-btn" data-action="set-view" data-view="packs">Open packs</button>
            </div>
          </div>
          <div class="hero-card">
            <h3>Player snapshot</h3>
            <div class="stat-grid">
              <div class="stat-box">
                <div class="stat-label">Coins</div>
                <div class="stat-value">${currentUser.coins}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Status</div>
                <div class="stat-value">${currentUser.status}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Inventory</div>
                <div class="stat-value">${state.inventory.length}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Mode</div>
                <div class="stat-value">${selectedMode.name}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="grid">
        <div class="card">
          <h3>Free modes</h3>
          <p>Classic, team, speed, boss, and survival experiences without premium barriers.</p>
          <button class="secondary-btn" data-action="set-view" data-view="modes">View modes</button>
        </div>
        <div class="card">
          <h3>Pack ladder</h3>
          <p>Uncommon, Rare, Epic, Legendary, and Secret rarity drops with card-style reveals.</p>
          <button class="secondary-btn" data-action="set-view" data-view="packs">Open packs</button>
        </div>
        <div class="card">
          <h3>Profile controls</h3>
          <p>Secure profile panel with a hidden admin button and a PIN for moderation tools.</p>
          <button class="secondary-btn" data-action="set-view" data-view="profile">Open profile</button>
        </div>
      </div>
    `;
  })();

  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <div class="logo">G</div>
        <span>Gobber</span>
      </div>
      <nav class="nav">${navButtons}</nav>
    </header>
    <main class="container">${pageContent}</main>
  `;

  wireEvents();
}

function applyAdminChange() {
  const selectedId = document.getElementById('admin-user').value;
  const selectedUser = state.users.find((user) => user.id === selectedId);
  if (!selectedUser) return;

  selectedUser.coins = Number(document.getElementById('admin-coins').value || 0);
  selectedUser.status = document.getElementById('admin-status').value;
  selectedUser.isAdmin = document.getElementById('admin-role').value === 'true';

  saveState();
  renderApp();
}

function wireEvents() {
  document.querySelectorAll('[data-action]').forEach((button) => {
    const action = button.dataset.action;

    button.addEventListener('click', () => {
      if (action === 'set-view') {
        setView(button.dataset.view);
      }

      if (action === 'select-mode') {
        selectMode(button.dataset.mode);
      }

      if (action === 'answer-question') {
        handleAnswer(button.dataset.option);
      }

      if (action === 'open-pack') {
        openPack(button.dataset.pack);
      }

      if (action === 'open-admin') {
        openAdmin();
      }

      if (action === 'apply-admin-change') {
        applyAdminChange();
      }
    });
  });
}

renderApp();

window.addEventListener('storage', () => {
  state = loadState();
  renderApp();
});
