/* ============================================================
   FAGBLIKK MÜNCHEN 2026 – DDR BIERKONTROLLE APP
   Ministerium für Biersicherheit · Abteilung Fagblikk
   ============================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────
     FIREBASE CONFIG – Fyll inn dine verdier her!
     ────────────────────────────────────────────── */
  const FIREBASE_CONFIG = {
    apiKey:            'AIzaSyDU6BpNWsbef1gOGAJr3WH_76p5LsdSu9s',
    authDomain:        'fagblikk-munchen.firebaseapp.com',
    databaseURL:       'https://fagblikk-munchen-default-rtdb.europe-west1.firebasedatabase.app',
    projectId:         'fagblikk-munchen',
    storageBucket:     'fagblikk-munchen.firebasestorage.app',
    messagingSenderId: '788340717650',
    appId:             '1:788340717650:web:e4586905a3a6d32e98478b'
  };

  // ==================== FIREBASE INIT ====================
  let db = null;
  let firebaseReady = false;

  function initFirebase() {
    try {
      if (typeof firebase === 'undefined') return false;
      if (!FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey === 'DIN_API_KEY') return false; // not configured
      firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.database();
      firebaseReady = true;
      console.log('[Fagblikk] Firebase tilkoblet');
      return true;
    } catch (e) {
      console.warn('[Fagblikk] Firebase feilet, bruker lokal lagring:', e.message);
      return false;
    }
  }

  const useFirebase = initFirebase();

  // ==================== APPROVED AGENTS ====================
  const APPROVED_AGENTS = [
    'Hams Brurs Brurs Brur',
    'Hams Brur',
    'Mykle',
    'Banksjef2',
    'Fagbrur',
    'Mace',
    'Niggo Kristiansen',
    'Wiggen',
    'Pagos'
  ];

  // Normalized lookup for case-insensitive matching
  const AGENT_LOOKUP = {};
  APPROVED_AGENTS.forEach(a => { AGENT_LOOKUP[a.toLowerCase().trim()] = a; });

  function validateAgent(input) {
    const key = input.toLowerCase().trim();
    return AGENT_LOOKUP[key] || null;
  }

  // ==================== DATA LAYER ====================
  const LS_PREFIX = 'fb26_';
  let currentAgent = null;

  // --- Local storage helpers ---
  function lsGet(key) {
    try { const v = localStorage.getItem(LS_PREFIX + key); return v ? JSON.parse(v) : null; }
    catch { return null; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(val)); } catch {}
  }

  // --- Firebase helpers ---
  function fbPath(agent, section, itemKey) {
    const safe = agent.replace(/[.#$/\[\]]/g, '_');
    return section + '/' + safe + '/' + itemKey.replace(/[.#$/\[\]]/g, '_');
  }

  function saveRating(agent, brewery, beer, state) {
    const key = brewery + '|||' + beer;
    // Always save locally
    lsSet('beer_' + agent + '_' + key, state);
    // Also push to Firebase
    if (firebaseReady && db) {
      db.ref(fbPath(agent, 'ratings', key)).set(state).catch(() => {});
    }
  }

  function getRating(agent, brewery, beer) {
    const key = brewery + '|||' + beer;
    return lsGet('beer_' + agent + '_' + key) || { tasted: false, rating: 0 };
  }

  function savePrep(agent, beerKey, done) {
    lsSet('prep_' + agent + '_' + beerKey, done);
    if (firebaseReady && db) {
      db.ref(fbPath(agent, 'prep', beerKey)).set(done).catch(() => {});
    }
  }

  function getPrep(agent, beerKey) {
    return lsGet('prep_' + agent + '_' + beerKey) || false;
  }

  // ==================== FIREBASE REAL-TIME LISTENERS ====================
  function listenForChanges() {
    if (!firebaseReady || !db) return;

    // Sync all ratings into localStorage and re-render
    db.ref('ratings').on('value', snap => {
      const data = snap.val();
      if (!data) return;
      Object.keys(data).forEach(agent => {
        Object.keys(data[agent]).forEach(key => {
          lsSet('beer_' + agent + '_' + key, data[agent][key]);
        });
      });
      // Re-render if on beer tab
      if (document.getElementById('tab-bier').classList.contains('active')) {
        renderTop3();
      }
    });

    // Sync all prep data and re-render leaderboard
    db.ref('prep').on('value', snap => {
      const data = snap.val();
      if (!data) return;
      Object.keys(data).forEach(agent => {
        Object.keys(data[agent]).forEach(key => {
          lsSet('prep_' + agent + '_' + key, data[agent][key]);
        });
      });
      renderPrepLeaderboard();
    });

    // Sync attendance data
    db.ref('attendance').on('value', snap => {
      const data = snap.val();
      if (!data) return;
      Object.keys(data).forEach(agent => {
        lsSet('att_' + agent, data[agent]);
      });
      renderAttendance();
    });
  }

  // Push ALL local data to Firebase on login (in case offline data exists)
  function pushLocalToFirebase() {
    if (!firebaseReady || !db || !currentAgent) return;
    // Push ratings
    BREWERIES.forEach(b => {
      b.beers.forEach(beer => {
        const state = getRating(currentAgent, b.name, beer.name);
        if (state.tasted || state.rating > 0) {
          const key = b.name + '|||' + beer.name;
          db.ref(fbPath(currentAgent, 'ratings', key)).set(state).catch(() => {});
        }
      });
    });
    // Push prep
    PREP_BEERS.forEach(beer => {
      const done = getPrep(currentAgent, beer.key);
      if (done) {
        db.ref(fbPath(currentAgent, 'prep', beer.key)).set(done).catch(() => {});
      }
    });
    // Push attendance
    const att = lsGet('att_' + currentAgent);
    if (att) {
      const safe = currentAgent.replace(/[.#$/\[\]]/g, '_');
      db.ref('attendance/' + safe).set(att).catch(() => {});
    }
  }

  // ==================== LOGIN ====================
  const loginScreen = document.getElementById('loginScreen');
  const appShell = document.getElementById('appShell');
  const agentInput = document.getElementById('agentName');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');
  const agentBadge = document.getElementById('agentBadge');
  const agentDisplay = document.getElementById('agentDisplay');

  function showApp() {
    loginScreen.classList.add('hidden');
    appShell.style.display = '';
    agentDisplay.textContent = currentAgent;
    renderBeerList();
    renderPrepList();
    renderPrepLeaderboard();
    renderTop3();
    renderDaySelector();
    renderAttendance();
    renderTrackList();
    updateCountdown();
    pushLocalToFirebase();
    listenForChanges();
  }

  function doLogin() {
    const raw = agentInput.value.trim();
    if (!raw) {
      loginError.textContent = '⚠ FEHLER: AGENTENNAME ERFORDERLICH';
      agentInput.focus();
      return;
    }
    const agent = validateAgent(raw);
    if (!agent) {
      loginError.textContent = '⛔ ZUGANG VERWEIGERT · UNBEKANNTER AGENT';
      agentInput.value = '';
      agentInput.focus();
      return;
    }
    currentAgent = agent;
    lsSet('lastAgent', currentAgent);
    showApp();
  }

  loginBtn.addEventListener('click', doLogin);
  agentInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin();
    loginError.textContent = '';
  });

  // Logout
  agentBadge.addEventListener('click', () => {
    if (confirm('Abmelden als Agent ' + currentAgent + '?')) {
      currentAgent = null;
      localStorage.removeItem(LS_PREFIX + 'lastAgent');
      loginScreen.classList.remove('hidden');
      appShell.style.display = 'none';
      agentInput.value = '';
      agentInput.focus();
      // Detach Firebase listeners
      if (firebaseReady && db) {
        db.ref('ratings').off();
        db.ref('prep').off();
      }
    }
  });

  // Auto-login
  const lastAgent = lsGet('lastAgent');
  if (lastAgent && validateAgent(lastAgent)) {
    currentAgent = validateAgent(lastAgent);
    showApp();
  } else {
    agentInput.focus();
  }

  // ==================== NAVIGATION ====================
  document.querySelectorAll('.nav-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.nav-card').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Refresh data when switching tabs
      if (tab === 'bier') { renderBeerList(); }
      if (tab === 'vorb') { renderPrepList(); renderPrepLeaderboard(); }
      if (tab === 'teiln') { renderDaySelector(); renderAttendance(); }
    });
  });

  // ==================== COUNTDOWN ====================
  const TRIP_DATE = '2026-10-07T06:45:00+02:00';

  function updateCountdown() {
    const diff = new Date(TRIP_DATE) - new Date();
    const d = document.getElementById('days');
    const h = document.getElementById('hours');
    const m = document.getElementById('minutes');
    const s = document.getElementById('status');
    if (!d) return;
    if (diff <= 0) { d.textContent='0'; h.textContent='00'; m.textContent='00'; s.textContent='ABFLUG!'; return; }
    const t = Math.floor(diff / 60000);
    d.textContent = Math.floor(t / 1440);
    h.textContent = String(Math.floor((t % 1440) / 60)).padStart(2, '0');
    m.textContent = String(t % 60).padStart(2, '0');
    s.textContent = 'AKTIV';
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ==================== BEER DATABASE ====================
  const BREWERIES = [
    { name: 'Augustiner-Bräu', founded: '1328', beers: [
      { name: 'Lagerbier Hell', type: 'Helles · 5.2%' },
      { name: 'Edelstoff', type: 'Exportbier · 5.6%' },
      { name: 'Dunkel', type: 'Münchner Dunkel · 5.6%' },
      { name: 'Maximator', type: 'Doppelbock · 7.5%' },
      { name: 'Weissbier', type: 'Hefeweizen · 5.4%' },
      { name: 'Pils', type: 'Pilsner · 5.6%' },
      { name: 'Oktoberfestbier', type: 'Märzen · 6.0%' },
    ]},
    { name: 'Paulaner', founded: '1634', beers: [
      { name: 'Münchner Hell', type: 'Helles · 4.9%' },
      { name: 'Salvator', type: 'Doppelbock · 7.9%' },
      { name: 'Hefe-Weißbier Naturtrüb', type: 'Hefeweizen · 5.5%' },
      { name: 'Hefe-Weißbier Dunkel', type: 'Dunkles Weizen · 5.3%' },
      { name: 'Münchner Dunkel', type: 'Dunkel · 5.0%' },
      { name: 'Oktoberfest Bier', type: 'Märzen · 6.0%' },
      { name: 'Pils', type: 'Pilsner · 4.9%' },
    ]},
    { name: 'Hofbräu München', founded: '1589', beers: [
      { name: 'Original', type: 'Helles · 5.1%' },
      { name: 'Dunkel', type: 'Münchner Dunkel · 5.5%' },
      { name: 'Hefe Weizen', type: 'Hefeweizen · 5.1%' },
      { name: 'Maibock', type: 'Maibock · 7.2%' },
      { name: 'Schwarze Weisse', type: 'Dunkles Weizen · 5.1%' },
      { name: 'Oktoberfestbier', type: 'Märzen · 6.3%' },
    ]},
    { name: 'Spaten', founded: '1397', beers: [
      { name: 'Münchner Hell', type: 'Helles · 5.2%' },
      { name: 'Premium Lager', type: 'Lager · 5.2%' },
      { name: 'Optimator', type: 'Doppelbock · 7.6%' },
      { name: 'Dunkel', type: 'Münchner Dunkel · 5.1%' },
      { name: 'Oktoberfestbier', type: 'Märzen · 5.9%' },
    ]},
    { name: 'Hacker-Pschorr', founded: '1417', beers: [
      { name: 'Münchner Hell', type: 'Helles · 5.0%' },
      { name: 'Münchner Dunkel', type: 'Dunkel · 5.0%' },
      { name: 'Hefe Weißbier', type: 'Hefeweizen · 5.5%' },
      { name: 'Anno 1417 Kellerbier', type: 'Kellerbier · 5.5%' },
      { name: 'Superior', type: 'Festbier · 5.5%' },
      { name: 'Oktoberfest Märzen', type: 'Märzen · 5.8%' },
    ]},
    { name: 'Löwenbräu', founded: '1383', beers: [
      { name: 'Original', type: 'Helles · 5.2%' },
      { name: 'Triumphator', type: 'Doppelbock · 7.6%' },
      { name: 'Urtyp', type: 'Export · 5.4%' },
      { name: 'Dunkel', type: 'Münchner Dunkel · 5.6%' },
      { name: 'Oktoberfestbier', type: 'Märzen · 6.1%' },
    ]},
    { name: 'Franziskaner', founded: '1363', beers: [
      { name: 'Hefe-Weißbier', type: 'Hefeweizen · 5.0%' },
      { name: 'Hefe-Weißbier Dunkel', type: 'Dunkles Weizen · 5.0%' },
      { name: 'Kristallklar', type: 'Kristallweizen · 5.0%' },
      { name: 'Royal', type: 'Weizenbock · 7.5%' },
    ]},
    { name: 'Ayinger', founded: '1878', beers: [
      { name: 'Celebrator', type: 'Doppelbock · 6.7%' },
      { name: 'Jahrhundert-Bier', type: 'Export · 5.5%' },
      { name: 'Altbairisch Dunkel', type: 'Dunkel · 5.0%' },
      { name: 'Bräu-Weisse', type: 'Hefeweizen · 5.1%' },
      { name: 'Ur-Weisse', type: 'Dunkles Weizen · 5.8%' },
    ]}
  ];

  // ==================== PREPARATION BEERS ====================
  const PREP_BEERS = [
    { key: 'paulaner-hell',       name: 'Paulaner Münchner Hell',            type: 'Helles · 4.9%', source: 'VINMONOPOLET' },
    { key: 'paulaner-weissbier',  name: 'Paulaner Hefe-Weißbier Naturtrüb',  type: 'Hefeweizen · 5.5%', source: 'VINMONOPOLET' },
    { key: 'paulaner-oktoberfest',name: 'Paulaner Oktoberfest Bier',         type: 'Märzen · 6.0%', source: 'VINMONOPOLET' },
    { key: 'hofbrau-dunkel',      name: 'Hofbräu München Dunkel',            type: 'Münchner Dunkel · 5.5%', source: 'VINMONOPOLET' },
    { key: 'franziskaner-weiss',  name: 'Franziskaner Hefe-Weissbier',       type: 'Hefeweizen · 5.0%', source: 'VINMONOPOLET' },
    { key: 'erdinger-weissbier',  name: 'Erdinger Weissbier',                type: 'Hefeweizen · 5.3%', source: 'DAGLIGVARE' },
    { key: 'paulaner-dunkel',     name: 'Paulaner Münchner Dunkel',          type: 'Dunkel · 5.0%', source: 'VINMONOPOLET' },
    { key: 'spaten-hell',         name: 'Spaten Münchner Hell',              type: 'Helles · 5.2%', source: 'VINMONOPOLET' },
    { key: 'weihenstephan-hefe',  name: 'Weihenstephaner Hefeweissbier',     type: 'Hefeweizen · 5.4%', source: 'VINMONOPOLET' },
    { key: 'augustiner-hell',     name: 'Augustiner Lagerbier Hell',         type: 'Helles · 5.2%', source: 'SPESIALBUTIKK' },
  ];

  // ==================== PREP CHECKLIST ====================
  function renderPrepList() {
    if (!currentAgent) return;
    const el = document.getElementById('prepList');
    if (!el) return;
    el.innerHTML = '';

    PREP_BEERS.forEach(beer => {
      const done = getPrep(currentAgent, beer.key);
      const item = document.createElement('div');
      item.className = 'prep-item' + (done ? ' done' : '');

      const check = document.createElement('div');
      check.className = 'prep-check';
      check.textContent = done ? '✓' : '';
      check.addEventListener('click', () => {
        const newVal = !getPrep(currentAgent, beer.key);
        savePrep(currentAgent, beer.key, newVal);
        renderPrepList();
        renderPrepLeaderboard();
      });

      const nameDiv = document.createElement('div');
      nameDiv.className = 'prep-name';
      nameDiv.innerHTML = '<span class="prep-beer-name">' + beer.name + '</span>'
        + '<span class="prep-beer-detail">' + beer.type + '</span>';

      const src = document.createElement('span');
      src.className = 'prep-source';
      src.textContent = beer.source;

      item.append(check, nameDiv, src);
      el.appendChild(item);
    });
  }

  // ==================== PREP LEADERBOARD ====================
  function renderPrepLeaderboard() {
    const el = document.getElementById('prepLeaderboard');
    if (!el) return;

    const total = PREP_BEERS.length;
    const rows = [];

    APPROVED_AGENTS.forEach(agent => {
      let done = 0;
      PREP_BEERS.forEach(beer => {
        if (getPrep(agent, beer.key)) done++;
      });
      rows.push({ agent, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 });
    });

    rows.sort((a, b) => b.pct - a.pct || a.agent.localeCompare(b.agent));

    if (rows.every(r => r.done === 0)) {
      el.innerHTML = '<div class="lb-empty">Noch keine Fortschritte gemeldet.</div>';
      return;
    }

    el.innerHTML = '<div class="leaderboard">' + rows.map((r, i) => {
      const isSelf = currentAgent && r.agent === currentAgent;
      return '<div class="lb-row' + (isSelf ? ' lb-self' : '') + '">'
        + '<div class="lb-rank">' + (i + 1) + '.</div>'
        + '<div class="lb-name">' + r.agent + '</div>'
        + '<div class="lb-bar-wrap"><div class="lb-bar" style="width:' + r.pct + '%"></div></div>'
        + '<div class="lb-pct">' + r.pct + '%</div>'
        + '</div>';
    }).join('') + '</div>';
  }

  // ==================== TOP 3 LISTS ====================
  function getPersonalTop3() {
    if (!currentAgent) return [];
    const rated = [];
    BREWERIES.forEach(b => {
      b.beers.forEach(beer => {
        const s = getRating(currentAgent, b.name, beer.name);
        if (s.rating > 0) rated.push({ beer: beer.name, brewery: b.name, rating: s.rating });
      });
    });
    rated.sort((a, b) => b.rating - a.rating);
    return rated.slice(0, 3);
  }

  function getSharedTop3() {
    const scores = {};
    BREWERIES.forEach(b => {
      b.beers.forEach(beer => {
        let total = 0, count = 0;
        APPROVED_AGENTS.forEach(agent => {
          const s = getRating(agent, b.name, beer.name);
          if (s.rating > 0) { total += s.rating; count++; }
        });
        if (count > 0) {
          scores[b.name + '|||' + beer.name] = {
            beer: beer.name, brewery: b.name,
            avg: total / count, voters: count
          };
        }
      });
    });
    const arr = Object.values(scores);
    arr.sort((a, b) => b.avg !== a.avg ? b.avg - a.avg : b.voters - a.voters);
    return arr.slice(0, 3);
  }

  function renderTop3() {
    const pEl = document.getElementById('personalTop3');
    const sEl = document.getElementById('sharedTop3');
    if (!pEl || !sEl) return;

    const personal = getPersonalTop3();
    pEl.innerHTML = personal.length === 0
      ? '<p class="top3-empty">Noch keine Bewertungen, Agent ' + (currentAgent || '') + '.</p>'
      : personal.map((item, i) =>
        '<div class="top3-item">'
        + '<div class="top3-rank">' + (i+1) + '.</div>'
        + '<div class="top3-info"><div class="top3-beer">' + item.beer + '</div><div class="top3-brewery">' + item.brewery + '</div></div>'
        + '<div class="top3-stars">' + '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating) + '</div>'
        + '</div>').join('');

    const shared = getSharedTop3();
    sEl.innerHTML = shared.length === 0
      ? '<p class="top3-empty">Noch keine kollektiven Bewertungen.</p>'
      : shared.map((item, i) => {
        const full = Math.round(item.avg);
        return '<div class="top3-item">'
          + '<div class="top3-rank">' + (i+1) + '.</div>'
          + '<div class="top3-info"><div class="top3-beer">' + item.beer + '</div><div class="top3-brewery">' + item.brewery + '</div></div>'
          + '<div class="top3-stars">' + '★'.repeat(full) + '☆'.repeat(5 - full) + '</div>'
          + '<div class="top3-voters">' + item.voters + ' AGT<br/>Ø ' + item.avg.toFixed(1) + '</div>'
          + '</div>';
      }).join('');
  }

  // ==================== BEER CHECKLIST ====================
  function renderBeerList() {
    if (!currentAgent) return;
    const container = document.getElementById('beerList');
    if (!container) return;
    container.innerHTML = '';

    BREWERIES.forEach(brewery => {
      const section = document.createElement('div');
      section.className = 'brewery-section';

      let tastedCount = 0;
      brewery.beers.forEach(b => { if (getRating(currentAgent, brewery.name, b.name).tasted) tastedCount++; });

      const header = document.createElement('div');
      header.className = 'brewery-header';
      header.innerHTML = '<h3>' + brewery.name
        + ' <small style="font-size:0.5em;opacity:0.5;font-family:Arial,sans-serif;">(' + brewery.founded + ')</small></h3>'
        + '<span class="brewery-count">' + tastedCount + '/' + brewery.beers.length + '</span>'
        + '<span class="brewery-toggle">▼</span>';

      const beerContainer = document.createElement('div');
      beerContainer.className = 'brewery-beers';

      brewery.beers.forEach(beer => {
        const state = getRating(currentAgent, brewery.name, beer.name);
        const item = document.createElement('div');
        item.className = 'beer-item' + (state.tasted ? ' tasted' : '');

        const check = document.createElement('div');
        check.className = 'beer-check';
        check.textContent = state.tasted ? '✓' : '';
        check.addEventListener('click', () => {
          const s = getRating(currentAgent, brewery.name, beer.name);
          s.tasted = !s.tasted;
          if (!s.tasted) s.rating = 0;
          saveRating(currentAgent, brewery.name, beer.name, s);
          renderBeerList();
        });

        const nameDiv = document.createElement('div');
        nameDiv.className = 'beer-name';
        nameDiv.innerHTML = beer.name + '<span class="beer-type">' + beer.type + '</span>';

        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'beer-rating';
        for (let i = 1; i <= 5; i++) {
          const star = document.createElement('button');
          star.className = 'rating-star' + (i <= state.rating ? ' filled' : '');
          star.textContent = '★';
          star.addEventListener('click', (e) => {
            e.stopPropagation();
            const s = getRating(currentAgent, brewery.name, beer.name);
            s.rating = (s.rating === i) ? 0 : i;
            if (s.rating > 0) s.tasted = true;
            saveRating(currentAgent, brewery.name, beer.name, s);
            renderBeerList();
          });
          ratingDiv.appendChild(star);
        }

        item.append(check, nameDiv, ratingDiv);
        beerContainer.appendChild(item);
      });

      header.addEventListener('click', () => {
        header.classList.toggle('collapsed');
        beerContainer.classList.toggle('collapsed');
      });

      section.append(header, beerContainer);
      container.appendChild(section);
    });

    // Stats
    let total = 0, tasted = 0;
    BREWERIES.forEach(b => { b.beers.forEach(beer => { total++; if (getRating(currentAgent, b.name, beer.name).tasted) tasted++; }); });
    const pEl = document.getElementById('beerProgress');
    const tEl = document.getElementById('beerTotal');
    if (pEl) pEl.textContent = tasted;
    if (tEl) tEl.textContent = total;

    renderTop3();
  }

  // Reset
  const resetBtn = document.getElementById('resetBeers');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!currentAgent) return;
      if (confirm('Alle Bewertungen für Agent ' + currentAgent + ' zurücksetzen?')) {
        BREWERIES.forEach(b => {
          b.beers.forEach(beer => {
            const key = 'beer_' + currentAgent + '_' + b.name + '|||' + beer.name;
            localStorage.removeItem(LS_PREFIX + key);
            if (firebaseReady && db) {
              db.ref(fbPath(currentAgent, 'ratings', b.name + '|||' + beer.name)).remove().catch(() => {});
            }
          });
        });
        renderBeerList();
      }
    });
  }

  // ==================== ATTENDANCE / TEILNEHMER ====================
  const TRIP_DAYS = [
    { key: 'mi', label: 'MITTWOCH', date: '7. OKT' },
    { key: 'do', label: 'DONNERSTAG', date: '8. OKT' },
    { key: 'fr', label: 'FREITAG', date: '9. OKT' },
  ];

  function getAttendance(agent) {
    return lsGet('att_' + agent) || { mi: false, do: false, fr: false };
  }

  function saveAttendance(agent, att) {
    lsSet('att_' + agent, att);
    if (firebaseReady && db) {
      const safe = agent.replace(/[.#$/\[\]]/g, '_');
      db.ref('attendance/' + safe).set(att).catch(() => {});
    }
  }

  function renderDaySelector() {
    if (!currentAgent) return;
    const el = document.getElementById('daySelector');
    if (!el) return;
    const att = getAttendance(currentAgent);
    el.innerHTML = TRIP_DAYS.map(day => {
      const sel = att[day.key];
      return '<button class="day-btn' + (sel ? ' selected' : '') + '" data-day="' + day.key + '">'
        + '<span class="day-label">' + day.label + '</span>'
        + '<span class="day-date">' + day.date + '</span>'
        + '<span class="day-check">' + (sel ? '✓' : '○') + '</span>'
        + '</button>';
    }).join('');

    el.querySelectorAll('.day-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = btn.dataset.day;
        const a = getAttendance(currentAgent);
        a[day] = !a[day];
        saveAttendance(currentAgent, a);
        renderDaySelector();
        renderAttendance();
      });
    });
  }

  function renderAttendance() {
    const el = document.getElementById('attendanceOverview');
    if (!el) return;

    const totals = { mi: 0, do: 0, fr: 0 };
    const rows = APPROVED_AGENTS.map(agent => {
      const a = getAttendance(agent);
      if (a.mi) totals.mi++;
      if (a.do) totals.do++;
      if (a.fr) totals.fr++;
      return { agent, att: a };
    });

    let html = '<div class="attendance-grid">';
    html += '<div class="att-header"><div>AGENT</div><div>MI</div><div>DO</div><div>FR</div></div>';
    rows.forEach(r => {
      const self = currentAgent && r.agent === currentAgent;
      html += '<div class="att-row' + (self ? ' att-self' : '') + '">';
      html += '<div>' + r.agent + '</div>';
      TRIP_DAYS.forEach(d => {
        html += '<div class="' + (r.att[d.key] ? 'att-yes' : 'att-no') + '">' + (r.att[d.key] ? '★' : '·') + '</div>';
      });
      html += '</div>';
    });
    html += '<div class="att-totals"><div>TOTAL</div>';
    html += '<div>' + totals.mi + '</div><div>' + totals.do + '</div><div>' + totals.fr + '</div>';
    html += '</div></div>';

    el.innerHTML = html;
  }

  // ==================== MUSIC PLAYER – ALTE SCHLAGER ====================
  /*
   * SLIK LEGGER DU TIL SANGER:
   * 1) Legg MP3-filer i en mappe kalt "audio/" i repoet
   * 2) Oppdater PLAYLIST-arrayen under med filnavn, tittel og artist
   */
  const PLAYLIST = [
    { file: 'audio/slaapmutske-pa-tapp.mp3', title: 'Slaapmutske På Tapp', artist: 'Kontignent Klassiker' },
    { file: 'audio/au-pairen.mp3', title: 'Au-Pairen', artist: 'Kontignent Klassiker' },
    { file: 'audio/fagfolkene-samles.mp3', title: 'Fagfolkene Samles', artist: 'Kontignent Klassiker' },
    { file: 'audio/lastebilsjaforens-bonn.mp3', title: 'Lastebilsjåførens Bønn', artist: 'Kontignent Klassiker' },
    { file: 'audio/lyset-over-kontignentet.mp3', title: 'Lyset Over Kontignentet', artist: 'Kontignent Klassiker' },
    { file: 'audio/mykle.mp3', title: 'Mykle', artist: 'Kontignent Klassiker' },
    { file: 'audio/struise.mp3', title: 'Struise', artist: 'Kontignent Klassiker' },
    { file: 'audio/fersk-bolleke-i-sola.mp3', title: 'Fersk Bolleke i Sola', artist: 'Kontignent Klassiker' },
    { file: 'audio/kontignentets-savn.mp3', title: 'Kontignentets Savn', artist: 'Kontignent Klassiker' },
    { file: 'audio/servitrisen-pa-den-engel.mp3', title: 'Servitrisen På Den Engel', artist: 'Kontignent Klassiker' },
    { file: 'audio/music-player123.mp3', title: 'Music Player 123', artist: 'Kontignent Klassiker' },
  ];

  let audioEl = null;
  let currentTrack = -1;
  let isPlaying = false;

  function initAudio() {
    audioEl = new Audio();
    audioEl.addEventListener('ended', () => { playNext(); });
    audioEl.addEventListener('timeupdate', updatePlayerProgress);
    audioEl.addEventListener('loadedmetadata', () => {
      const dur = document.getElementById('playerDuration');
      if (dur) dur.textContent = formatTime(audioEl.duration);
    });
  }

  function formatTime(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + String(sec).padStart(2, '0');
  }

  function updatePlayerProgress() {
    if (!audioEl || !audioEl.duration) return;
    const pct = (audioEl.currentTime / audioEl.duration) * 100;
    const fg = document.getElementById('playerBarFg');
    const cur = document.getElementById('playerCurrent');
    if (fg) fg.style.width = pct + '%';
    if (cur) cur.textContent = formatTime(audioEl.currentTime);
  }

  function loadTrack(index) {
    if (PLAYLIST.length === 0) return;
    currentTrack = ((index % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length;
    const track = PLAYLIST[currentTrack];
    audioEl.src = track.file;
    document.getElementById('playerTitle').textContent = track.title;
    document.getElementById('playerArtist').textContent = track.artist;
    document.getElementById('playerBarFg').style.width = '0%';
    document.getElementById('playerCurrent').textContent = '0:00';
    highlightTrack();
  }

  function togglePlay() {
    if (PLAYLIST.length === 0) return;
    if (currentTrack < 0) loadTrack(0);
    const btn = document.getElementById('playerPlay');
    if (audioEl.paused) {
      audioEl.play().then(() => {
        isPlaying = true;
        if (btn) btn.textContent = '⏸';
      }).catch(() => {});
    } else {
      audioEl.pause();
      isPlaying = false;
      if (btn) btn.textContent = '▶';
    }
  }

  function playNext() { loadTrack(currentTrack + 1); if (isPlaying) audioEl.play().catch(() => {}); }
  function playPrev() { loadTrack(currentTrack - 1); if (isPlaying) audioEl.play().catch(() => {}); }

  function highlightTrack() {
    document.querySelectorAll('.track-item').forEach((el, i) => {
      el.classList.toggle('playing', i === currentTrack);
    });
  }

  function renderTrackList() {
    const el = document.getElementById('trackList');
    if (!el) return;

    if (PLAYLIST.length === 0) {
      el.innerHTML = '<div class="no-tracks">KEINE LIEDER GELADEN · MP3-DATEIEN IN /AUDIO/ ABLEGEN UND PLAYLIST IN APP.JS KONFIGURIEREN</div>';
      return;
    }

    el.innerHTML = PLAYLIST.map((t, i) =>
      '<div class="track-item' + (i === currentTrack ? ' playing' : '') + '" data-idx="' + i + '">'
      + '<div class="track-num">' + (i + 1) + '</div>'
      + '<div class="track-info"><div class="track-name">' + t.title + '</div><div class="track-artist">' + t.artist + '</div></div>'
      + '<div class="track-playing-icon">♪</div>'
      + '</div>'
    ).join('');

    el.querySelectorAll('.track-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx, 10);
        loadTrack(idx);
        isPlaying = true;
        audioEl.play().catch(() => {});
        document.getElementById('playerPlay').textContent = '⏸';
      });
    });
  }

  // Player controls
  document.getElementById('playerPlay').addEventListener('click', togglePlay);
  document.getElementById('playerNext').addEventListener('click', () => { playNext(); });
  document.getElementById('playerPrev').addEventListener('click', () => { playPrev(); });

  // Seek on progress bar click
  document.getElementById('playerBarBg').addEventListener('click', (e) => {
    if (!audioEl || !audioEl.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioEl.currentTime = pct * audioEl.duration;
  });

  initAudio();

  // ==================== SVG IMAGES ====================
  function svgBeerMug() {
    return '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" fill="#2c1810"/><rect x="10" y="10" width="280" height="280" fill="none" stroke="#c7a500" stroke-width="3"/><circle cx="150" cy="150" r="120" fill="#3a1510"/><rect x="85" y="80" width="100" height="140" rx="8" fill="#DAA520" stroke="#1a0a0a" stroke-width="3"/><ellipse cx="135" cy="82" rx="52" ry="18" fill="#f5e6c8" stroke="#1a0a0a" stroke-width="2"/><ellipse cx="120" cy="76" rx="16" ry="10" fill="#fff" opacity="0.5"/><rect x="88" y="95" width="94" height="120" rx="5" fill="#c7a500" opacity="0.6"/><path d="M185 100 Q220 100 220 150 Q220 200 185 200" fill="none" stroke="#DAA520" stroke-width="10"/><path d="M185 100 Q215 100 215 150 Q215 200 185 200" fill="none" stroke="#1a0a0a" stroke-width="3"/><rect x="85" y="120" width="100" height="4" fill="#1a0a0a" opacity="0.3"/><rect x="85" y="170" width="100" height="4" fill="#1a0a0a" opacity="0.3"/><text x="135" y="158" text-anchor="middle" font-size="36" fill="#b71c1c" font-family="serif">★</text><text x="150" y="268" text-anchor="middle" font-family="Impact,sans-serif" font-size="18" fill="#ffd600" letter-spacing="4">VOLKSBIER</text></svg>';
  }
  function svgPretzel() {
    return '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" fill="#2c1810"/><rect x="10" y="10" width="280" height="280" fill="none" stroke="#c7a500" stroke-width="3"/><circle cx="150" cy="140" r="100" fill="#3a1510"/><path d="M150 200 Q100 170 80 130 Q60 80 100 60 Q140 40 150 90 Q160 40 200 60 Q240 80 220 130 Q200 170 150 200Z" fill="none" stroke="#c7a500" stroke-width="16" stroke-linecap="round"/><path d="M150 200 Q100 170 80 130 Q60 80 100 60 Q140 40 150 90 Q160 40 200 60 Q240 80 220 130 Q200 170 150 200Z" fill="none" stroke="#DAA520" stroke-width="10" stroke-linecap="round"/><circle cx="110" cy="100" r="3" fill="#f5e6c8" opacity="0.8"/><circle cx="170" cy="85" r="3" fill="#f5e6c8" opacity="0.8"/><circle cx="150" cy="160" r="3" fill="#f5e6c8" opacity="0.8"/><text x="150" y="268" text-anchor="middle" font-family="Impact,sans-serif" font-size="18" fill="#ffd600" letter-spacing="4">BREZEL</text></svg>';
  }
  function svgSchweinshaxe() {
    return '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" fill="#2c1810"/><rect x="10" y="10" width="280" height="280" fill="none" stroke="#c7a500" stroke-width="3"/><circle cx="150" cy="140" r="100" fill="#3a1510"/><ellipse cx="150" cy="200" rx="90" ry="25" fill="#8B7355" stroke="#1a0a0a" stroke-width="2"/><ellipse cx="145" cy="150" rx="50" ry="55" fill="#8B4513" stroke="#1a0a0a" stroke-width="2"/><ellipse cx="140" cy="145" rx="42" ry="48" fill="#A0522D"/><ellipse cx="130" cy="130" rx="20" ry="25" fill="#CD853F" opacity="0.4"/><rect x="148" y="85" width="8" height="50" rx="4" fill="#f5e6c8" stroke="#1a0a0a" stroke-width="1.5"/><circle cx="152" cy="82" r="8" fill="#f5e6c8" stroke="#1a0a0a" stroke-width="1.5"/><text x="150" y="268" text-anchor="middle" font-family="Impact,sans-serif" font-size="15" fill="#ffd600" letter-spacing="3">SCHWEINSHAXE</text></svg>';
  }
  function svgSchnitzel() {
    return '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" fill="#2c1810"/><rect x="10" y="10" width="280" height="280" fill="none" stroke="#c7a500" stroke-width="3"/><circle cx="150" cy="140" r="100" fill="#3a1510"/><ellipse cx="150" cy="175" rx="95" ry="30" fill="#8B7355" stroke="#1a0a0a" stroke-width="2"/><ellipse cx="145" cy="145" rx="65" ry="35" transform="rotate(-8 145 145)" fill="#DAA520" stroke="#1a0a0a" stroke-width="2"/><ellipse cx="142" cy="142" rx="58" ry="30" transform="rotate(-8 142 142)" fill="#c7a500"/><circle cx="200" cy="140" r="16" fill="#ffd600" stroke="#1a0a0a" stroke-width="1.5"/><circle cx="200" cy="140" r="12" fill="#ffeb3b" opacity="0.6"/><text x="150" y="268" text-anchor="middle" font-family="Impact,sans-serif" font-size="18" fill="#ffd600" letter-spacing="4">SCHNITZEL</text></svg>';
  }
  function svgWeisswurst() {
    return '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" fill="#2c1810"/><rect x="10" y="10" width="280" height="280" fill="none" stroke="#c7a500" stroke-width="3"/><circle cx="150" cy="140" r="100" fill="#3a1510"/><ellipse cx="150" cy="185" rx="90" ry="25" fill="#8B7355" stroke="#1a0a0a" stroke-width="2"/><rect x="80" y="130" width="120" height="22" rx="11" fill="#e8d5a8" stroke="#1a0a0a" stroke-width="1.5"/><rect x="85" y="155" width="115" height="22" rx="11" fill="#e8d5a8" stroke="#1a0a0a" stroke-width="1.5"/><circle cx="210" cy="155" r="14" fill="#8B6508" stroke="#1a0a0a" stroke-width="1.5"/><text x="150" y="120" text-anchor="middle" font-size="26" fill="#b71c1c" font-family="serif">★</text><text x="150" y="268" text-anchor="middle" font-family="Impact,sans-serif" font-size="15" fill="#ffd600" letter-spacing="3">WEISSWURST</text></svg>';
  }
  function svgBeerGarden() {
    return '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" fill="#2c1810"/><rect x="10" y="10" width="280" height="280" fill="none" stroke="#c7a500" stroke-width="3"/><rect x="15" y="15" width="270" height="130" fill="#1a2a4a"/><circle cx="60" cy="110" r="30" fill="#2a4a18"/><circle cx="150" cy="100" r="35" fill="#345a20"/><circle cx="240" cy="110" r="30" fill="#2a4a18"/><rect x="15" y="145" width="270" height="125" fill="#3a5a20"/><rect x="80" y="175" width="140" height="8" fill="#8B6914" stroke="#1a0a0a" stroke-width="1.5"/><rect x="100" y="183" width="6" height="35" fill="#6a5010"/><rect x="195" y="183" width="6" height="35" fill="#6a5010"/><rect x="110" y="160" width="18" height="20" rx="2" fill="#DAA520" stroke="#1a0a0a" stroke-width="1"/><ellipse cx="119" cy="161" rx="10" ry="4" fill="#f5e6c8"/><rect x="165" y="160" width="18" height="20" rx="2" fill="#DAA520" stroke="#1a0a0a" stroke-width="1"/><ellipse cx="174" cy="161" rx="10" ry="4" fill="#f5e6c8"/><text x="150" y="55" text-anchor="middle" font-size="22" fill="#ffd600" font-family="serif">★ ★ ★</text><text x="150" y="260" text-anchor="middle" font-family="Impact,sans-serif" font-size="16" fill="#ffd600" letter-spacing="3">BIERGARTEN</text></svg>';
  }
  function svgToilet() {
    return '<svg viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="360" fill="#2c1810"/><rect x="8" y="8" width="284" height="344" fill="none" stroke="#c7a500" stroke-width="3"/><rect x="15" y="15" width="270" height="290" fill="#d4d4c0"/><g stroke="#b8b8a8" stroke-width="0.5" opacity="0.5"><line x1="15" y1="55" x2="285" y2="55"/><line x1="15" y1="95" x2="285" y2="95"/><line x1="15" y1="135" x2="285" y2="135"/><line x1="15" y1="175" x2="285" y2="175"/><line x1="15" y1="215" x2="285" y2="215"/><line x1="15" y1="255" x2="285" y2="255"/><line x1="75" y1="15" x2="75" y2="305"/><line x1="135" y1="15" x2="135" y2="305"/><line x1="195" y1="15" x2="195" y2="305"/><line x1="255" y1="15" x2="255" y2="305"/></g><rect x="108" y="40" width="84" height="60" rx="6" fill="#e8e8e0" stroke="#999" stroke-width="2"/><rect x="142" y="35" width="16" height="12" rx="3" fill="#c0c0b0" stroke="#999" stroke-width="1.5"/><rect x="146" y="30" width="8" height="8" rx="2" fill="#d0d0c0"/><path d="M100 100 L100 170 Q100 245 150 250 Q200 245 200 170 L200 100 Z" fill="#e8e8e0" stroke="#999" stroke-width="2"/><path d="M106 100 L106 168 Q106 238 150 244 Q194 238 194 168 L194 100 Z" fill="#f5f5f0"/><path d="M95 100 Q95 96 100 95 L200 95 Q205 96 205 100 L205 108 Q205 112 200 112 L100 112 Q95 112 95 108 Z" fill="#e0e0d8" stroke="#999" stroke-width="2"/><ellipse cx="150" cy="195" rx="28" ry="25" fill="#a8c8d8" opacity="0.4"/><rect x="15" y="260" width="270" height="45" fill="#8B7355"/><text x="150" y="30" text-anchor="middle" font-size="20" fill="#b71c1c" font-family="serif">★</text><rect x="15" y="305" width="270" height="48" fill="#7f0000"/><text x="150" y="325" text-anchor="middle" font-family="Impact,sans-serif" font-size="14" fill="#ffd600" letter-spacing="3">DIE UNVERMEIDLICHE</text><text x="150" y="344" text-anchor="middle" font-family="Impact,sans-serif" font-size="12" fill="#c7a500" letter-spacing="3">KONSEQUENZ</text></svg>';
  }

  // ==================== RENDER GALLERIES ====================
  function renderGirGallery() {
    const g = document.getElementById('girGallery');
    if (!g) return;
    const items = [
      { svg: svgBeerMug(), c: 'DAS VOLKSBIER' },
      { svg: svgPretzel(), c: 'DIE BREZEL' },
      { svg: svgSchweinshaxe(), c: 'SCHWEINSHAXE' },
      { svg: svgSchnitzel(), c: 'DAS SCHNITZEL' },
      { svg: svgWeisswurst(), c: 'WEISSWURST MIT SENF' },
      { svg: svgBeerGarden(), c: 'DER BIERGARTEN' },
    ];
    g.innerHTML = items.map(i => '<div class="gallery-item">' + i.svg + '<div class="gallery-caption">' + i.c + '</div></div>').join('');
  }

  function renderTarImage() {
    const c = document.getElementById('tarImage');
    if (!c) return;
    c.innerHTML = svgToilet() + '<div class="tar-caption">★ PFLICHTBESUCH ★</div>';
  }

  renderGirGallery();
  renderTarImage();

  // ==================== SERVICE WORKER ====================
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

})();
