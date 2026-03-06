const tripDate = '2026-10-08T06:45:00+02:00';

const checklistItems = [
  'Ren truse, gjerne med hull',
];

const schedule = [
  {
    day: 'Torsdag 8. oktober',
    mood: 'Oppmøte, mellomlanding og innledende hydrering',
    items: [
      { time: '06:45', title: 'Molde → Oslo', detail: 'Tidlig avgang. Ingen helter, bare folk med boardingkort.' },
      { time: 'Formiddag', title: 'Oslo → München', detail: 'Videre via Gardermoen. Kaffe, venting og gradvis aksept.' },
      { time: 'Ettermiddag', title: 'Innsjekk og orientering', detail: 'Bag drop. Finn nærmeste øl og lat som dette er god logistikk.' },
      { time: 'Kveld', title: 'Drikke øl', detail: 'Ingen ytterligere forklaring nødvendig.' },
    ],
  },
  {
    day: 'Fredag 9. oktober',
    mood: 'Full drift med lav selvinnsikt',
    items: [
      { time: '11:00', title: 'Drikke øl', detail: 'Rolig åpning. Det blir ikke roligere senere.' },
      { time: '14:00', title: 'Drikke øl', detail: 'Sammenligne glass, bord og hvem som nå høres mest overbevist ut.' },
      { time: '18:00', title: 'Drikke øl', detail: 'Poeng kan noteres. Det er frivillig å være sannferdig.' },
      { time: 'Sen kveld', title: 'Drikke øl', detail: 'Det som nå fremstår som en god idé, vil snart bli stående i ettertid som en hendelse.' },
    ],
  },
  {
    day: 'Lørdag 10. oktober',
    mood: 'Høy produksjon, svak styring',
    items: [
      { time: 'Formiddag', title: 'Drikke øl', detail: 'Teknisk sett etter frokost. Om ikke annet i kronologisk rekkefølge.' },
      { time: 'Ettermiddag', title: 'Drikke øl', detail: 'Målet er bredde, dybde og høyst selektiv hukommelse.' },
      { time: 'Kveld', title: 'Drikke øl', detail: 'Finalerunde. Nakne vurderinger, uryddig rangering og noe som ligner samhold.' },
    ],
  },
  {
    day: 'Søndag 11. oktober',
    mood: 'Retur med administrativt ansikt',
    items: [
      { time: 'Formiddag', title: 'Pakke sakte', detail: 'Se nøye på hva som fortsatt tilhører hvem.' },
      { time: 'Ettermiddag', title: 'München → Oslo', detail: 'Stille fase. Kun nøkkelord og korte setninger.' },
      { time: 'Kveld', title: 'Oslo → Molde', detail: 'Ankomst med redusert glans og økt fortellingsbehov.' },
    ],
  },
];

const challenges = [
  { id: 1, title: 'Første skål før innsjekk', points: 5, risk: 'Lav', description: 'Alle må være enige om at dette teller som kultur.' },
  { id: 2, title: 'Tre steder, én dom', points: 15, risk: 'Middels', description: 'Gi nådeløs vurdering av tre ulike stopp på samme dag.' },
  { id: 3, title: 'Pretzel med verdighet', points: 10, risk: 'Lav', description: 'Bær den som et symbol, ikke som et måltid.' },
  { id: 4, title: 'Sivilisert exit', points: 20, risk: 'Høy', description: 'Forlat siste sted før det blir dumt. Få tror dette er mulig.' },
  { id: 5, title: 'Diplomatisk bestilling', points: 8, risk: 'Middels', description: 'Bestill på tysk uten å improvisere språkfamilier som ikke finnes.' },
];

const rpgNodes = {
  start: {
    title: 'Kapittel 1: Terminalen',
    text: 'Klokken er uansvarlig tidlig på Aro. Gruppen står samlet med svake øyne, harde meninger og en kollektiv tro på at ting vil ordne seg fordi ingen har kapasitet til å tenke alternativet helt ut.',
    options: [
      { label: 'Etabler en midlertidig reisekomité', next: 'committee', effect: { morale: 1, order: 2 } },
      { label: 'Kjøp kaffe og kall det ledelse', next: 'coffee', effect: { morale: 2, order: -1 } },
      { label: 'Før opp dagens første symbolske poeng', next: 'points', effect: { prestige: 1, chaos: 1 } },
    ],
  },
  committee: {
    title: 'Kapittel 2: Komiteen',
    text: 'En komité oppstår uten mandat, men med mye kroppsspråk. Roller deles ut på grunnlag av hvem som peker først og snakker høyt nok til at andre orker å godta det.',
    options: [
      { label: 'Gi komiteen ansvar hele veien til hotellet', next: 'landing', effect: { order: 2 } },
      { label: 'La komiteen kun overvåke væskeinntak', next: 'beerhall', effect: { morale: 1, chaos: 1 } },
    ],
  },
  coffee: {
    title: 'Kapittel 2: Koffeinlinjen',
    text: 'Kaffen gir styrke nok til å skape illusjonen av plan. På Gardermoen begynner det å virke plausibelt at gruppen kan kombinere punktlighet, mellomlanding og impulskjøp uten følgefeil.',
    options: [
      { label: 'Hold dere til gaten og snakk minst mulig', next: 'landing', effect: { order: 1, morale: 1 } },
      { label: 'Spred dere fem minutter og stol på skjebnen', next: 'scatter', effect: { chaos: 2, prestige: 1 } },
    ],
  },
  points: {
    title: 'Kapittel 2: Tallverket',
    text: 'Poengsystemet blir introdusert før første boarding. Det er uklart hva som måles, men alle er enige om at noen allerede ligger bak.',
    options: [
      { label: 'Forenkle alt til ren magefølelse', next: 'beerhall', effect: { morale: 2 } },
      { label: 'Bygg et strengt system ingen forstår', next: 'landing', effect: { order: 1, prestige: 2, morale: -1 } },
    ],
  },
  scatter: {
    title: 'Kapittel 3: Spredning',
    text: 'Gruppen løser opp strukturen et øyeblikk og samles igjen overraskende nok ved gate. Dette tolkes umiddelbart som bevis på at metoden fungerer, selv om ingen egentlig ønsker å teste teorien på nytt.',
    options: [
      { label: 'Land og gå rett til første store hall', next: 'beerhall', effect: { morale: 1, chaos: 1 } },
      { label: 'Lat som alle hele tiden hadde kontroll', next: 'landing', effect: { prestige: 1, order: 1 } },
    ],
  },
  landing: {
    title: 'Kapittel 3: Ankomst',
    text: 'München ligger foran dere som et system av treverk, fliser, messinglyd og store glass. Etter innsjekk oppstår kveldens kjerneproblem: moderasjon, symbolbruk eller full innsats fra første minutt.',
    options: [
      { label: 'Velg bord med omhu og start verdig', next: 'beerhall', effect: { order: 2, prestige: 1 } },
      { label: 'Gå direkte inn og pek på noe stort', next: 'beerhall', effect: { morale: 2, chaos: 1 } },
    ],
  },
  beerhall: {
    title: 'Kapittel 4: Die Bierlinie',
    text: 'Lokalet er varmt, høyt og ubestridelig. Glass settes ned med myndighet. Bord tar form som midlertidige republikker. Nå avgjøres hele turens tone: stram orden, vennlig forfall eller en tvilsomt balansert tredje vei.',
    options: [
      { label: 'Velg orden, notater og presis dømmekraft', next: 'endingA', effect: { order: 2, prestige: 2 } },
      { label: 'Velg humør, volum og glorifisert improvisasjon', next: 'endingB', effect: { morale: 2, chaos: 2 } },
      { label: 'Velg blandingslinjen og hev at dette var planen', next: 'endingC', effect: { morale: 1, order: 1, prestige: 1 } },
    ],
  },
  endingA: {
    title: 'Slutt A: Ministeriet for presis hygge',
    text: 'Turen gjennomføres med en disiplin som ingen trodde var kompatibel med innholdet. Dommer felles, glass vurderes og kveldene avsluttes akkurat før det hele velter. Myndig. Ubegripelig. Effektivt.',
    ending: true,
  },
  endingB: {
    title: 'Slutt B: Den frie humlefronten',
    text: 'Alt glir over i varmt kaos. Det finnes vitner, men få sammenhengende redegjørelser. Poengsystemet forsvinner, men fortellingene overlever. Ingen er sikre på detaljene. Det blir dermed årets sterkeste narrativ.',
    ending: true,
  },
  endingC: {
    title: 'Slutt C: Den balanserte linjen',
    text: 'Gruppen holder akkurat nok struktur til å komme seg mellom stedene og akkurat nok frislipp til å tro at det var fritt valgt. Resultatet er sjelden vakkert, men svært brukbart. Returbilletten får karakteren bestått.',
    ending: true,
  },
};

const state = {
  checkedPacking: load('kontingentet-2026-packing', []),
  doneChallenges: load('kontingentet-2026-challenges', []),
  rpg: load('kontingentet-2026-rpg', {
    nodeId: 'start',
    stats: { morale: 0, order: 0, chaos: 0, prestige: 0 },
    history: [],
  }),
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function renderSchedule() {
  const el = document.getElementById('scheduleGrid');
  el.innerHTML = schedule.map((day) => `
    <article class="schedule-card">
      <h3>${day.day}</h3>
      <p class="schedule-mood">${day.mood}</p>
      <div class="timeline">
        ${day.items.map((item, index) => `
          <div class="timeline-row ${index === 0 ? 'first' : ''}">
            <span class="time">${item.time}</span>
            <div>
              <strong>${item.title}</strong>
              <p>${item.detail}</p>
            </div>
          </div>`).join('')}
      </div>
    </article>`).join('');
}

function renderPacking() {
  const el = document.getElementById('packingList');
  document.getElementById('packingProgress').textContent = `${state.checkedPacking.length}/${checklistItems.length}`;
  el.innerHTML = checklistItems.map((item) => `
    <label class="check-row">
      <input type="checkbox" data-pack-item="${escapeHtml(item)}" ${state.checkedPacking.includes(item) ? 'checked' : ''} />
      <span>${item}</span>
    </label>`).join('');

  el.querySelectorAll('[data-pack-item]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const item = checkbox.dataset.packItem;
      toggleArrayValue(state.checkedPacking, item);
      save('kontingentet-2026-packing', state.checkedPacking);
      renderPacking();
    });
  });
}

function renderChallenges() {
  const el = document.getElementById('challengeList');
  const challengePoints = challenges.filter((challenge) => state.doneChallenges.includes(challenge.id)).reduce((sum, item) => sum + item.points, 0);
  document.getElementById('challengePoints').textContent = challengePoints;
  el.innerHTML = challenges.map((challenge) => `
    <button class="challenge-card ${state.doneChallenges.includes(challenge.id) ? 'active' : ''}" data-challenge-id="${challenge.id}">
      <div class="challenge-head"><strong>${challenge.title}</strong><span>${challenge.points}p</span></div>
      <p>${challenge.description}</p>
      <small>Risiko: ${challenge.risk}</small>
    </button>`).join('');

  el.querySelectorAll('[data-challenge-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.challengeId);
      toggleArrayValue(state.doneChallenges, id);
      save('kontingentet-2026-challenges', state.doneChallenges);
      renderChallenges();
    });
  });
}

function renderRpg() {
  const node = rpgNodes[state.rpg.nodeId] || rpgNodes.start;
  document.getElementById('rpgPhase').textContent = node.ending ? 'Avslutning' : 'Aktiv scene';
  document.getElementById('rpgTitle').textContent = node.title;
  document.getElementById('rpgText').textContent = node.text;
  document.getElementById('statMorale').textContent = state.rpg.stats.morale;
  document.getElementById('statOrder').textContent = state.rpg.stats.order;
  document.getElementById('statChaos').textContent = state.rpg.stats.chaos;
  document.getElementById('statPrestige').textContent = state.rpg.stats.prestige;
  document.getElementById('rpgProgress').textContent = node.ending ? 'Slutt' : node.title.replace(/^Kapittel\s*\d+:\s*/i, '');

  const options = document.getElementById('rpgOptions');
  const history = document.getElementById('rpgHistory');

  options.innerHTML = `${(node.options || []).map((option, index) => `<button data-rpg-index="${index}">${option.label}</button>`).join('')}
    <button class="secondary" id="resetRpg">Start på nytt</button>`;

  options.querySelectorAll('[data-rpg-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = node.options?.[Number(button.dataset.rpgIndex)];
      if (!selected) return;
      state.rpg = {
        nodeId: selected.next,
        stats: {
          morale: state.rpg.stats.morale + (selected.effect?.morale || 0),
          order: state.rpg.stats.order + (selected.effect?.order || 0),
          chaos: state.rpg.stats.chaos + (selected.effect?.chaos || 0),
          prestige: state.rpg.stats.prestige + (selected.effect?.prestige || 0),
        },
        history: [...state.rpg.history, selected.label],
      };
      save('kontingentet-2026-rpg', state.rpg);
      renderRpg();
    });
  });

  document.getElementById('resetRpg').addEventListener('click', () => {
    state.rpg = { nodeId: 'start', stats: { morale: 0, order: 0, chaos: 0, prestige: 0 }, history: [] };
    save('kontingentet-2026-rpg', state.rpg);
    renderRpg();
  });

  history.innerHTML = state.rpg.history.length
    ? `<ol>${state.rpg.history.map((choice) => `<li>${choice}</li>`).join('')}</ol>`
    : '<p>Ingen valg ennå. Delegasjonen er fremdeles teknisk uskyldig.</p>';
}

function toggleArrayValue(array, value) {
  const index = array.indexOf(value);
  if (index >= 0) array.splice(index, 1);
  else array.push(value);
}

function escapeHtml(text) {
  return text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#39;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function updateCountdown() {
  const distance = new Date(tripDate).getTime() - Date.now();
  const done = distance <= 0;
  const days = done ? 0 : Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = done ? 0 : Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = done ? 0 : Math.floor((distance / (1000 * 60)) % 60);
  document.getElementById('days').textContent = days;
  document.getElementById('hours').textContent = hours;
  document.getElementById('minutes').textContent = minutes;
  document.getElementById('status').textContent = done ? 'I gang' : 'Aktiv';
}

function init() {
  renderSchedule();
  renderPacking();
  renderChallenges();
  renderRpg();
  updateCountdown();
  setInterval(updateCountdown, 60000);
}

init();
