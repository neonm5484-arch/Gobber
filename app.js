const STORAGE_KEY = 'gobber-state-v1';
const ADMIN_DEMO_PIN = 'NeonMan'; // Prototype only; never use a client-side PIN for real admin security.
const QUESTIONS_PER_ROUND = 5;

const DEFAULT_USERS = [
  { id: 'user-neo', name: 'NeonMan', coins: 420, status: 'active', isAdmin: true, avatar: 'N' },
  { id: 'user-ari', name: 'Ari', coins: 230, status: 'active', isAdmin: false, avatar: 'A' },
  { id: 'user-mina', name: 'Mina', coins: 180, status: 'active', isAdmin: false, avatar: 'M' },
  { id: 'user-jules', name: 'Jules', coins: 310, status: 'active', isAdmin: false, avatar: 'J' }
];

const MODES = [
  { id: 'classic', name: 'Classic Chaos', label: 'Classic', description: 'A balanced five-question quiz round.', reward: 20, multiplier: 1 },
  { id: 'gold', name: 'Gold Rush', label: 'Bonus coins', description: 'Earn double coins for every correct answer.', reward: 20, multiplier: 2 },
  { id: 'speed', name: 'Speed Run', label: 'Quick play', description: 'A quick round with a bigger perfect-round bonus.', reward: 25, multiplier: 1 },
  { id: 'survival', name: 'Survival', label: 'No misses', description: 'Try to get all five answers right. One miss ends the round.', reward: 30, multiplier: 1 },
  { id: 'team', name: 'Team Rush', label: 'Solo demo', description: 'Practice a team-style quiz solo. Multiplayer teams are not connected yet.', reward: 20, multiplier: 1 }
];

const QUESTIONS = [
  { category: 'Science', question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'], answer: 'Mars' },
  { category: 'Technology', question: 'What does CSS stand for?', options: ['Creative Style Selector', 'Cascading Style Sheets', 'Computer Setup System', 'Core Script Styling'], answer: 'Cascading Style Sheets' },
  { category: 'Technology', question: 'Which language adds interactivity to many web pages?', options: ['HTML', 'JavaScript', 'CSS', 'Markdown'], answer: 'JavaScript' },
  { category: 'General', question: 'What is a set of instructions a computer follows called?', options: ['Algorithm', 'Database', 'Pixel', 'Browser'], answer: 'Algorithm' },
  { category: 'Science', question: 'What is the chemical symbol for water?', options: ['CO₂', 'O₂', 'H₂O', 'NaCl'], answer: 'H₂O' },
  { category: 'General', question: 'How many sides does a hexagon have?', options: ['Five', 'Six', 'Seven', 'Eight'], answer: 'Six' },
  { category: 'Technology', question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Power Utility', 'Core Program Update', 'Central Program Unit'], answer: 'Central Processing Unit' },
  { category: 'Science', question: 'Which gas do plants absorb from the atmosphere?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Helium'], answer: 'Carbon dioxide' }
];

const PACKS = [
  { id: 'uncommon', name: 'Uncommon Pack', rarity: 'Uncommon', cost: 35, items: ['Glow Orb', 'Coin Burst', 'Pixel Pin', 'Star Sticker', 'Spark Token'] },
  { id: 'rare', name: 'Rare Pack', rarity: 'Rare', cost: 80, items: ['Nova Charm', 'Turbo Boost', 'Lucky Meteor', 'Power Cube', 'Moon Gem'] },
  { id: 'epic', name: 'Epic Pack', rarity: 'Epic', cost: 150, items: ['Storm Crown', 'Sunfire Rune', 'Void Prism', 'Titan Medal', 'Lightning Cape'] },
  { id: 'legendary', name: 'Legendary Pack', rarity: 'Legendary', cost: 300, items: ['Gobber Core', 'Solar Dragon', 'Phantom Crown', 'Aether Blade', 'Moonshine Aura'] },
  { id: 'secret', name: 'Secret Pack', rarity: 'Secret', cost: 600, items: ['Obsidian Genesis', 'Dimensional Echo', 'Void Sovereign', 'Celestial Warden', 'Prime Relic'] }
];

function freshState() {
  return {
    currentUserId: 'user-neo',
    view: 'home',
    selectedMode: 'classic',
    round: null,
    inventory: ['Starter Badge', 'Glow Orb'],
    users: structuredClone(DEFAULT_USERS),
    adminLog: []
  };
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored || !Array.isArray(stored.users)) return freshState();
    return { ...freshState(), ...stored, users: stored.users, inventory: Array.isArray(stored.inventory) ? stored.inventory : [] };
  } catch {
    return freshState();
  }
}

let state = loadState();
let packAnimationTimer;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Gobber could not save this browser session.', error);
  }
}

function currentUser() {
  return state.users.find((user) => user.id === state.currentUserId) || state.users[0];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function setView(view) {
  state.view = view;
  saveState();
  render();
}

function startRound(modeId) {
  const mode = MODES.find((entry) => entry.id === modeId);
  if (!mode) return;
  state.selectedMode = modeId;
  state.round = { questionIndex: 0, correct: 0, answered: false, questions: makeRoundQuestions(), finished: false };
  state.view = 'play';
  saveState();
  render();
}

function makeRoundQuestions() {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, QUESTIONS_PER_ROUND);
}

function answerQuestion(option) {
  const round = state.round;
  if (!round || round.finished || round.answered) return;
  const question = round.questions[round.questionIndex];
  const correct = option === question.answer;
  round.answered = true;
  if (correct) round.correct += 1;
  saveState();
  render();

  const mode = MODES.find((entry) => entry.id === state.selectedMode) || MODES[0];
  const survivalMiss = mode.id === 'survival' && !correct;
  window.setTimeout(() => {
    if (survivalMiss || round.questionIndex >= round.questions.length - 1) {
      finishRound();
      return;
    }
    round.questionIndex += 1;
    round.answered = false;
    saveState();
    render();
  }, 850);
}

function finishRound() {
  const round = state.round;
  if (!round || round.finished) return;
  round.finished = true;
  const mode = MODES.find((entry) => entry.id === state.selectedMode) || MODES[0];
  const perfectBonus = round.correct === round.questions.length ? 25 : 0;
  const earned = round.correct * mode.reward * mode.multiplier + perfectBonus;
  currentUser().coins += earned;
  round.earned = earned;
  round.perfectBonus = perfectBonus;
  saveState();
  render();
}

function openPack(packId) {
  const pack = PACKS.find((entry) => entry.id === packId);
  const user = currentUser();
  if (!pack || !user) return;
  if (user.coins < pack.cost) {
    window.alert(`You need ${pack.cost - user.coins} more coins for this pack.`);
    return;
  }

  user.coins -= pack.cost;
  const item = pack.items[Math.floor(Math.random() * pack.items.length)];
  state.inventory.push({ name: item, rarity: pack.rarity });
  saveState();
  showPackReveal(pack, item);
}

function showPackReveal(pack, item) {
  document.querySelector('.pack-reveal')?.remove();
  window.clearTimeout(packAnimationTimer);
  const overlay = document.createElement('div');
  overlay.className = 'pack-reveal';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', `${pack.rarity} pack reward`);
  overlay.innerHTML = `
    <div class="pack-card ${pack.id === 'secret' ? 'secret' : ''}" tabindex="-1">
      <div class="small-word">${escapeHtml(pack.rarity)} drop</div>
      <div class="card-name">${escapeHtml(item)}</div>
      <div class="small-word">${escapeHtml(pack.name)}</div>
      <button class="small-btn reveal-close" type="button">Close</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.reveal-close').addEventListener('click', () => {
    overlay.remove();
    render();
  });
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      overlay.remove();
      render();
    }
  });
  packAnimationTimer = window.setTimeout(() => {
    if (overlay.isConnected) {
      overlay.remove();
      render();
    }
  }, 6000);
}

function openAdmin() {
  if (!currentUser().isAdmin) {
    window.alert('This demo profile does not have admin access.');
    return;
  }
  const pin = window.prompt('Demo admin PIN:');
  if (pin !== ADMIN_DEMO_PIN) {
    if (pin !== null) window.alert('Incorrect PIN.');
    return;
  }
  setView('admin');
}

function applyAdminChanges() {
  if (!currentUser().isAdmin) {
    setView('profile');
    return;
  }
  const user = state.users.find((entry) => entry.id === document.getElementById('admin-user')?.value);
  const coinsInput = document.getElementById('admin-coins');
  const statusInput = document.getElementById('admin-status');
  const roleInput = document.getElementById('admin-role');
  if (!user || !coinsInput || !statusInput || !roleInput) return;

  const coins = Number(coinsInput.value);
  if (!Number.isSafeInteger(coins) || coins < 0) {
    window.alert('Coins must be a whole number greater than or equal to zero.');
    return;
  }

  const previous = `${user.coins} coins, ${user.status}`;
  user.coins = coins;
  user.status = statusInput.value;
  user.isAdmin = roleInput.value === 'true';
  state.adminLog.unshift({ text: `${currentUser().name} updated ${user.name}: ${previous} → ${user.coins} coins, ${user.status}`, at: new Date().toLocaleString() });
  state.adminLog = state.adminLog.slice(0, 10);
  saveState();
  render();
}

function renderHome() {
  const user = currentUser();
  const mode = MODES.find((entry) => entry.id === state.selectedMode) || MODES[0];
  return `
    <section class="hero">
      <div class="hero-row">
        <div>
          <span class="mode-badge">A fresh, original quiz game</span>
          <h1>Gobber <span style="color:var(--primary)">is your free arena.</span></h1>
          <p>Play quick knowledge rounds, earn coins, and collect original Gobber drops. Pick a mode and jump in.</p>
          <div class="cta-row">
            <button class="primary-btn" data-action="view" data-view="modes">Choose a game</button>
            <button class="secondary-btn" data-action="view" data-view="packs">Explore packs</button>
          </div>
        </div>
        <div class="hero-card">
          <h3>Player snapshot</h3>
          <div class="stat-grid">
            <div class="stat-box"><div class="stat-label">Coins</div><div class="stat-value">${user.coins}</div></div>
            <div class="stat-box"><div class="stat-label">Status</div><div class="stat-value">${escapeHtml(user.status)}</div></div>
            <div class="stat-box"><div class="stat-label">Collectibles</div><div class="stat-value">${state.inventory.length}</div></div>
            <div class="stat-box"><div class="stat-label">Last mode</div><div class="stat-value">${escapeHtml(mode.label)}</div></div>
          </div>
        </div>
      </div>
    </section>
    <div class="grid">
      <article class="card"><h3>Free game modes</h3><p>Choose from five original modes. Multiplayer is a future step; Team Rush is a solo demo for now.</p><button class="secondary-btn" data-action="view" data-view="modes">Browse modes</button></article>
      <article class="card"><h3>Collectible packs</h3><p>Five rarity tiers, original collectibles, and a dramatic animated reveal.</p><button class="secondary-btn" data-action="view" data-view="packs">Visit the shop</button></article>
      <article class="card"><h3>Your profile</h3><p>See your coin balance, collection, and the prototype admin controls.</p><button class="secondary-btn" data-action="view" data-view="profile">Open profile</button></article>
    </div>`;
}

function renderModes() {
  return `
    <div class="section-title"><h2>Choose a game mode</h2><span class="mode-badge">Free to play</span></div>
    <div class="grid">${MODES.map((mode) => `
      <article class="card mode-card">
        <span class="mode-badge">${escapeHtml(mode.label)}</span>
        <h3>${escapeHtml(mode.name)}</h3><p>${escapeHtml(mode.description)}</p>
        <button class="primary-btn" data-action="start" data-mode="${mode.id}">Play ${escapeHtml(mode.name)}</button>
      </article>`).join('')}</div>`;
}

function renderPlay() {
  const round = state.round;
  if (!round) return `<section class="question-panel"><h2>Ready to play?</h2><button class="primary-btn" data-action="view" data-view="modes">Choose a mode</button></section>`;
  const mode = MODES.find((entry) => entry.id === state.selectedMode) || MODES[0];
  if (round.finished) {
    return `<section class="question-panel round-result">
      <span class="mode-badge">Round complete</span><h2>${round.correct} / ${round.questions.length} correct</h2>
      <p>You earned <strong>${round.earned || 0} coins</strong>${round.perfectBonus ? `, including a ${round.perfectBonus}-coin perfect-round bonus` : ''}.</p>
      <div class="cta-row"><button class="primary-btn" data-action="start" data-mode="${mode.id}">Play again</button><button class="secondary-btn" data-action="view" data-view="modes">Change mode</button></div>
    </section>`;
  }
  const question = round.questions[round.questionIndex];
  return `<section class="quiz-shell"><div class="question-panel">
    <div class="question-top"><strong>${escapeHtml(mode.name)}</strong><span>Question ${round.questionIndex + 1} of ${round.questions.length}</span></div>
    <div class="progress-track"><div class="progress-fill" style="width:${(round.questionIndex / round.questions.length) * 100}%"></div></div>
    <span class="mode-badge">${escapeHtml(question.category)}</span><h2 class="question-text">${escapeHtml(question.question)}</h2>
    <div class="answer-grid">${question.options.map((option) => {
      const isCorrect = round.answered && option === question.answer;
      const isWrong = round.answered && option !== question.answer && round.selectedAnswer === option;
      return `<button class="answer-btn ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}" data-action="answer" data-option="${escapeHtml(option)}" ${round.answered ? 'disabled' : ''}>${escapeHtml(option)}</button>`;
    }).join('')}</div>
    <p class="muted-text">Score: ${round.correct} correct</p>
  </div></section>`;
}

function renderPacks() {
  return `<div class="section-title"><h2>Gobber packs</h2><span class="mode-badge">Five collectible rarities</span></div>
    <p class="muted-text">Packs contain original Gobber collectibles. Pack purchases and inventory are saved in this browser only.</p>
    <div class="pack-grid">${PACKS.map((pack) => `<article class="pack-box rarity-${pack.id}">
      <div class="pack-header"><h3>${escapeHtml(pack.name)}</h3><span class="rarity-pill">${escapeHtml(pack.rarity)}</span></div>
      <p>${pack.items.length} possible rewards</p><ul>${pack.items.slice(0, 3).map((item) => `<li>✦ ${escapeHtml(item)}</li>`).join('')}</ul>
      <button class="primary-btn" data-action="pack" data-pack="${pack.id}">Open · ${pack.cost} coins</button>
    </article>`).join('')}</div>`;
}

function renderProfile() {
  const user = currentUser();
  return `<section class="card profile-card"><div class="user-meta"><div class="avatar">${escapeHtml(user.avatar)}</div><div>
    <div class="user-name-row"><h2 style="margin:0">${escapeHtml(user.name)}</h2><span class="mode-badge">${escapeHtml(user.status)}</span></div><p style="margin:8px 0 0;color:var(--muted)">${user.coins} coins</p>
  </div></div><div class="inline-row"><button class="admin-mini-btn" data-action="admin">Admin</button></div></section>
  <div class="grid"><article class="card"><h3>Player stats</h3><p>Coins: <strong>${user.coins}</strong></p><p>Status: ${escapeHtml(user.status)}</p><p>Role: ${user.isAdmin ? 'Admin' : 'Player'}</p><p>Save type: this browser only</p></article>
  <article class="card"><h3>Collection · ${state.inventory.length}</h3><div class="inventory-list">${state.inventory.map((item) => {
    const entry = typeof item === 'string' ? { name: item, rarity: 'Starter' } : item;
    return `<span class="inventory-pill" title="${escapeHtml(entry.rarity)}">${escapeHtml(entry.name)} <small>${escapeHtml(entry.rarity)}</small></span>`;
  }).join('')}</div></article></div>`;
}

function renderAdmin() {
  if (!currentUser().isAdmin) return '<section class="question-panel"><h2>Admin access required</h2></section>';
  const selected = state.users.find((user) => user.id === (state.adminSelectedUserId || currentUser().id)) || currentUser();
  return `<section class="admin-panel"><div class="section-title"><h2>Demo admin panel</h2><span class="mode-badge">Local prototype only</span></div>
    <p class="muted-text">These sample accounts and changes exist only in this browser. The PIN is visible in the app source and is not real security.</p>
    <div class="form-grid">
      <div class="field"><label for="admin-user">Sample user</label><select id="admin-user">${state.users.map((user) => `<option value="${user.id}" ${user.id === selected.id ? 'selected' : ''}>${escapeHtml(user.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="admin-coins">Coins</label><input id="admin-coins" type="number" min="0" step="1" value="${selected.coins}" /></div>
      <div class="field"><label for="admin-status">Account status</label><select id="admin-status"><option value="active" ${selected.status === 'active' ? 'selected' : ''}>Active</option><option value="suspended" ${selected.status === 'suspended' ? 'selected' : ''}>Suspended</option><option value="banned" ${selected.status === 'banned' ? 'selected' : ''}>Banned</option></select></div>
      <div class="field"><label for="admin-role">Admin role</label><select id="admin-role"><option value="false" ${!selected.isAdmin ? 'selected' : ''}>Player</option><option value="true" ${selected.isAdmin ? 'selected' : ''}>Admin</option></select></div>
    </div><div class="cta-row" style="margin-top:18px"><button class="primary-btn" data-action="admin-save">Save demo changes</button><button class="secondary-btn" data-action="view" data-view="profile">Back to profile</button></div>
    <div class="audit-box"><h3>Recent demo admin actions</h3>${state.adminLog.length ? `<ul>${state.adminLog.map((item) => `<li>${escapeHtml(item.at)} · ${escapeHtml(item.text)}</li>`).join('')}</ul>` : '<p>No admin changes yet.</p>'}</div>
  </section>`;
}

function render() {
  const view = state.view;
  const pages = { home: renderHome, modes: renderModes, play: renderPlay, packs: renderPacks, profile: renderProfile, admin: renderAdmin };
  const content = (pages[view] || renderHome)();
  const nav = [['home', 'Home'], ['modes', 'Modes'], ['packs', 'Packs'], ['profile', 'Profile']];
  document.getElementById('app').innerHTML = `
    <header class="topbar"><a class="brand brand-link" href="#home" data-action="view" data-view="home"><span class="logo">G</span><span>Gobber</span></a>
      <nav class="nav" aria-label="Main navigation">${nav.map(([id, label]) => `<button class="${view === id || (id === 'modes' && view === 'play') ? 'active' : ''}" data-action="view" data-view="${id}">${label}</button>`).join('')}</nav>
      <div class="coin-chip" aria-label="Coin balance">🪙 ${currentUser().coins}</div>
    </header><main class="container">${content}</main>
    <footer class="site-footer">Gobber prototype · Progress is saved locally in this browser</footer>`;

  document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'view') setView(button.dataset.view);
    if (action === 'start') startRound(button.dataset.mode);
    if (action === 'answer') answerQuestion(button.dataset.option);
    if (action === 'pack') openPack(button.dataset.pack);
    if (action === 'admin') openAdmin();
    if (action === 'admin-save') applyAdminChanges();
  }));

  document.getElementById('admin-user')?.addEventListener('change', (event) => {
    state.adminSelectedUserId = event.target.value;
    render();
  });
}

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    state = loadState();
    render();
  }
});

render();
