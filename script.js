const nations = [
  {
    id: 'lyria',
    name: 'Lyria',
    color: '#75f0a7',
    x: 18,
    y: 30,
    player: true,
    gold: 54,
    food: 60,
    steel: 44,
    energy: 36,
    manpower: 78,
    industry: 52,
    army: 26,
    navy: 12,
    air: 8,
    tech: 18,
    territory: 12,
    relations: { varden: 42, orion: 28, cressida: 18, solace: 31, navea: 24 },
  },
  {
    id: 'varden',
    name: 'Varden',
    color: '#76a8ff',
    x: 52,
    y: 25,
    player: false,
    gold: 48,
    food: 52,
    steel: 51,
    energy: 44,
    manpower: 72,
    industry: 57,
    army: 31,
    navy: 18,
    air: 12,
    tech: 22,
    territory: 14,
    relations: { lyra: 42, orion: 14, cressida: 16, solace: 20, navea: 28 },
  },
  {
    id: 'cressida',
    name: 'Cressida',
    color: '#ffb067',
    x: 76,
    y: 28,
    player: false,
    gold: 46,
    food: 49,
    steel: 42,
    energy: 40,
    manpower: 64,
    industry: 46,
    army: 24,
    navy: 16,
    air: 10,
    tech: 19,
    territory: 11,
    relations: { lyra: 18, varden: 16, orion: 34, solace: 22, navea: 29 },
  },
  {
    id: 'orion',
    name: 'Orion',
    color: '#ff6f7d',
    x: 62,
    y: 62,
    player: false,
    gold: 57,
    food: 58,
    steel: 50,
    energy: 53,
    manpower: 80,
    industry: 58,
    army: 33,
    navy: 21,
    air: 14,
    tech: 24,
    territory: 14,
    relations: { lyra: 28, varden: 14, cressida: 34, solace: 18, navea: 20 },
  },
  {
    id: 'solace',
    name: 'Solace',
    color: '#d1a8ff',
    x: 31,
    y: 72,
    player: false,
    gold: 43,
    food: 55,
    steel: 38,
    energy: 34,
    manpower: 61,
    industry: 44,
    army: 21,
    navy: 10,
    air: 7,
    tech: 17,
    territory: 11,
    relations: { lyra: 31, varden: 20, cressida: 22, orion: 18, navea: 35 },
  },
  {
    id: 'navea',
    name: 'Navea',
    color: '#f0e68c',
    x: 84,
    y: 70,
    player: false,
    gold: 52,
    food: 46,
    steel: 47,
    energy: 49,
    manpower: 69,
    industry: 55,
    army: 29,
    navy: 24,
    air: 11,
    tech: 21,
    territory: 13,
    relations: { lyra: 24, varden: 28, cressida: 29, orion: 20, solace: 35 },
  },
];

const state = {
  turn: 1,
  selectedNationId: 'lyria',
  log: [],
  pendingWar: null,
};

const mapEl = document.querySelector('#map');
const logList = document.querySelector('#log-list');
const relationsList = document.querySelector('#relations-list');
const eventBanner = document.querySelector('#event-banner');
const selectedName = document.querySelector('#selected-name');
const selectedTag = document.querySelector('#selected-tag');
const turnCounter = document.querySelector('#turn-counter');

function logMessage(message) {
  state.log.unshift(message);
  if (state.log.length > 10) {
    state.log = state.log.slice(0, 10);
  }
  renderLog();
}

function getSelectedNation() {
  return nations.find((nation) => nation.id === state.selectedNationId) || nations[0];
}

function computePower(nation) {
  return Math.round(
    nation.army * 3 +
      nation.navy * 2.5 +
      nation.air * 2 +
      nation.tech * 3 +
      nation.industry * 2 +
      nation.manpower / 2
  );
}

function getRelationLabel(value) {
  if (value >= 55) return { className: 'good', text: 'Warm' };
  if (value <= 25) return { className: 'bad', text: 'Hostile' };
  return { className: 'neutral', text: 'Tense' };
}

function setSelectedNation(id) {
  state.selectedNationId = id;
  render();
}

function renderMap() {
  mapEl.innerHTML = '';

  nations.forEach((nation) => {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = `nation-marker ${nation.id === state.selectedNationId ? 'selected' : ''}`;
    marker.style.left = `${nation.x}%`;
    marker.style.top = `${nation.y}%`;
    marker.style.borderTopColor = nation.color;
    marker.style.color = nation.color;
    marker.innerHTML = `
      <span class="dot" style="background:${nation.color};"></span>
      <span class="name">${nation.name}</span>
      <span class="power">${computePower(nation)}</span>
    `;
    marker.addEventListener('click', () => setSelectedNation(nation.id));
    mapEl.appendChild(marker);
  });
}

function renderNationInfo() {
  const nation = getSelectedNation();
  selectedName.textContent = nation.name;
  selectedTag.textContent = nation.player ? 'Player' : 'AI';
  selectedTag.className = `tag ${nation.player ? 'player-tag' : 'ai-tag'}`;

  document.querySelector('#power-value').textContent = computePower(nation);
  document.querySelector('#industry-value').textContent = nation.industry;
  document.querySelector('#gold-value').textContent = nation.gold;
  document.querySelector('#manpower-value').textContent = nation.manpower;
  document.querySelector('#tech-value').textContent = nation.tech;
  document.querySelector('#army-value').textContent = nation.army;
  document.querySelector('#food-value').textContent = nation.food;
  document.querySelector('#steel-value').textContent = nation.steel;
  document.querySelector('#energy-value').textContent = nation.energy;
  document.querySelector('#territory-value').textContent = nation.territory;
}

function renderRelations() {
  const nation = getSelectedNation();
  const rows = Object.entries(nation.relations)
    .map(([targetId, value]) => {
      const target = nations.find((n) => n.id === targetId);
      const relation = getRelationLabel(value);
      return `
        <div class="relation-row">
          <span class="relation-name">${target.name}</span>
          <span class="meter ${relation.className}">${relation.text}</span>
        </div>
      `;
    })
    .join('');

  relationsList.innerHTML = rows;
}

function renderLog() {
  logList.innerHTML = state.log
    .map((entry) => `<li>${entry}</li>`)
    .join('');
  document.querySelector('#log-count').textContent = `${state.log.length} entries`;
}

function randomEvent() {
  const events = [
    'A new rail line boosts industrial output across the frontier.',
    'Pirate fleets disrupt coastal shipping lanes.',
    'The treasury is flush with tax revenue after a strong harvest.',
    'Border tensions spike as mobilization rumors spread.',
    'A diplomatic summit opens the door for a strategic trade pact.',
    'A breakthrough in metallurgy accelerates arms production.',
    'A supply convoy reaches the front line, restoring morale.',
    'Storms delay naval operations and strain food reserves.',
  ];
  return events[Math.floor(Math.random() * events.length)];
}

function applyTurnIncome() {
  nations.forEach((nation) => {
    nation.gold += Math.round(nation.industry / 10) + 2;
    nation.food += Math.round((nation.territory + nation.industry) / 8);
    nation.steel += Math.round(nation.industry / 12);
    nation.energy += Math.round(nation.tech / 10);
    nation.manpower = Math.min(100, nation.manpower + 3);
  });
}

function applyAiTurn() {
  nations.forEach((nation) => {
    if (nation.player) return;

    const strongestTarget = nations
      .filter((other) => other.id !== nation.id)
      .sort((a, b) => computePower(b) - computePower(a))[0];

    const relation = nation.relations[state.selectedNationId] ?? 35;
    if (relation <= 20 && computePower(nation) > computePower(getSelectedNation()) * 0.85) {
      declareWar(nation.id, getSelectedNation().id, false);
      return;
    }

    if (Math.random() < 0.25) {
      nation.tech += 1;
      nation.gold = Math.max(10, nation.gold - 6);
      logMessage(`${nation.name} develops a new military doctrine.`);
    }

    if (Math.random() < 0.2 && nation.army < 40) {
      nation.army += 3;
      nation.manpower = Math.max(10, nation.manpower - 5);
      logMessage(`${nation.name} mobilizes reserves for a rapid deployment.`);
    }

    if (strongestTarget && Math.random() < 0.1) {
      nation.relations[strongestTarget.id] = Math.max(-30, nation.relations[strongestTarget.id] - 8);
      strongestTarget.relations[nation.id] = Math.max(-30, strongestTarget.relations[nation.id] - 8);
    }
  });
}

function declareWar(attackerId, defenderId, isPlayerAction = true) {
  const attacker = nations.find((n) => n.id === attackerId);
  const defender = nations.find((n) => n.id === defenderId);
  if (!attacker || !defender || attackerId === defenderId) return;

  attacker.relations[defenderId] = Math.max(-30, attacker.relations[defenderId] - 18);
  defender.relations[attackerId] = Math.max(-30, defender.relations[attackerId] - 18);

  const attackerPower = computePower(attacker);
  const defenderPower = computePower(defender);
  const resultRoll = Math.random() * (attackerPower + defenderPower);

  if (resultRoll <= attackerPower) {
    attacker.army = Math.max(8, attacker.army - 6);
    defender.army = Math.max(6, defender.army - 12);
    defender.territory = Math.max(5, defender.territory - 1);
    attacker.territory = Math.min(18, attacker.territory + 1);
    logMessage(`${attacker.name} wins a decisive battlefield against ${defender.name}.`);
  } else {
    attacker.army = Math.max(8, attacker.army - 12);
    defender.army = Math.max(6, defender.army - 6);
    attacker.territory = Math.max(5, attacker.territory - 1);
    logMessage(`${defender.name} repels ${attacker.name} in a brutal counteroffensive.`);
  }

  if (isPlayerAction) {
    state.pendingWar = defenderId;
  }
}

function researchSelected() {
  const nation = getSelectedNation();
  if (nation.gold < 8) {
    logMessage(`${nation.name} lacks the treasury to fund research.`);
    return;
  }

  nation.gold -= 8;
  nation.tech += 1;
  nation.industry += 1;
  logMessage(`${nation.name} accelerates a new industrial breakthrough.`);
}

function mobilizeSelected() {
  const nation = getSelectedNation();
  if (nation.manpower < 10) {
    logMessage(`${nation.name} cannot mobilize more troops.`);
    return;
  }

  nation.army += 4;
  nation.manpower -= 10;
  nation.food = Math.max(0, nation.food - 4);
  logMessage(`${nation.name} mobilizes reserve units and shores up the front.`);
}

function tradeSelected() {
  const nation = getSelectedNation();
  nation.gold += 12;
  nation.relations = Object.fromEntries(
    Object.entries(nation.relations).map(([id, value]) => [id, Math.min(100, value + 5)])
  );
  logMessage(`${nation.name} secures a profitable trade arrangement with neighboring powers.`);
}

function peaceSelected() {
  const nation = getSelectedNation();
  const rival = nations.find((other) => other.id !== nation.id && nation.relations[other.id] <= 15);

  if (!rival) {
    logMessage(`${nation.name} has no immediate leverage for formal peace talks.`);
    return;
  }

  nation.relations[rival.id] = Math.min(100, nation.relations[rival.id] + 20);
  rival.relations[nation.id] = Math.min(100, rival.relations[nation.id] + 20);
  logMessage(`${nation.name} negotiates a ceasefire with ${rival.name}.`);
}

function handleAction(action) {
  if (action === 'research') researchSelected();
  if (action === 'mobilize') mobilizeSelected();
  if (action === 'trade') tradeSelected();
  if (action === 'war') {
    const nation = getSelectedNation();
    const rival = nations
      .filter((other) => other.id !== nation.id)
      .sort((a, b) => computePower(b) - computePower(a))[0];
    declareWar(nation.id, rival.id, true);
  }
  if (action === 'peace') peaceSelected();
  render();
}

function advanceTurn() {
  state.turn += 1;
  applyTurnIncome();
  applyAiTurn();
  eventBanner.textContent = randomEvent();

  nations.forEach((nation) => {
    nations.forEach((other) => {
      if (nation.id === other.id) return;
      nation.relations[other.id] = Math.max(-30, Math.min(100, nation.relations[other.id] + (Math.random() > 0.5 ? 2 : -2)));
      other.relations[nation.id] = Math.max(-30, Math.min(100, other.relations[nation.id] + (Math.random() > 0.5 ? 2 : -2)));
    });
  });

  logMessage(`Turn ${state.turn}: ${randomEvent()}`);
  render();
}

function render() {
  turnCounter.textContent = state.turn;
  renderMap();
  renderNationInfo();
  renderRelations();
  renderLog();
}

document.querySelector('#end-turn').addEventListener('click', advanceTurn);
document.querySelectorAll('.action-btn').forEach((button) => {
  button.addEventListener('click', () => handleAction(button.dataset.action));
});

logMessage('Lyria enters the theatre with a restless frontier and expanding ambitions.');
render();
