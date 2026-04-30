/* ============================================================
   FAGBLIKK MÜNCHEN 2026 — DAS SPIEL
   Die Legende von Mücklus von Bustenburg
   Et tekstbasert rollespill i 5 kapitler
   ============================================================ */

(function () {
  'use strict';

  // ───────────────────────────────────────────────────────────
  // ENTRY: starte et kapittel
  // ───────────────────────────────────────────────────────────
  function startRPG(chapter) {
    const menu = document.getElementById('rpgChapterMenu');
    const game = document.getElementById('rpgGame');
    if (!menu || !game) return;

    menu.classList.add('hidden');
    game.classList.remove('hidden');
    game.innerHTML = '';

    if      (chapter === 1) runChapter1(game);
    else if (chapter === 2) runChapter2(game);
    else if (chapter === 3) runChapter3(game);
    else if (chapter === 4) runChapter4(game);
    else if (chapter === 5) runChapter5(game);
    else game.textContent = 'Ukjent kapittel.';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function returnToMenu() {
    const menu = document.getElementById('rpgChapterMenu');
    const game = document.getElementById('rpgGame');
    if (!menu || !game) return;
    game.classList.add('hidden');
    game.innerHTML = '';
    menu.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ───────────────────────────────────────────────────────────
  // FELLES RENDER-KJERNE
  // ───────────────────────────────────────────────────────────
  function makeRenderer(container, story, opts) {
    opts = opts || {};

    function renderStep(i) {
      const step = story[i];
      container.innerHTML = '';
      container.appendChild(stepHeader(i, story.length));
      container.appendChild(storyText(step.text));

      if (!step.options || step.options.length === 0) {
        container.appendChild(backToMenuBtn('★ TILBAKE TIL KAPITTELMENY ★'));
        return;
      }

      step.options.forEach(opt => {
        const b = choiceBtn(opt.text);
        b.onclick = () => handleOption(opt, i);
        container.appendChild(b);
      });
    }

    function handleOption(opt, returnIndex) {
      // Spesialkommandoer
      if (opt.next === 'gameover') {
        container.innerHTML = '';
        container.appendChild(consequenceBox(opt.consequence, true));
        const btn = backToMenuBtn('★ START PÅ NYTT ★');
        container.appendChild(btn);
        return;
      }
      if (typeof opt.next === 'string' && opt.next.indexOf('skumlos') === 0) {
        // skumlos_return_<step>
        const parts = opt.next.split('_');
        const back = parseInt(parts[parts.length - 1], 10);
        const ret = isNaN(back) ? returnIndex : back;
        showSkumlos(ret, opt.consequence);
        return;
      }

      container.innerHTML = '';
      container.appendChild(stepHeader(returnIndex, story.length, true));
      container.appendChild(consequenceBox(opt.consequence));

      if (typeof opt.next === 'number') {
        const next = nextBtn('★ NESTE ★');
        next.onclick = () => renderStep(opt.next);
        container.appendChild(next);
      } else {
        container.appendChild(backToMenuBtn('★ TILBAKE TIL KAPITTELMENY ★'));
      }
    }

    function showSkumlos(returnStep, prefix) {
      container.innerHTML = '';
      const head = document.createElement('div');
      head.className = 'rpg-skumlos-head';
      head.innerHTML = '☠ SKUMLØS-WALD ☠';
      container.appendChild(head);

      const intro = prefix
        ? `<em>${escapeHTML(prefix)}</em><br><br>` : '';
      const txt = document.createElement('div');
      txt.className = 'rpg-text rpg-skumlos-text';
      txt.innerHTML =
        intro +
        'Mücklus befinner seg i Skumløs-Wald, et mørkt kratt utenfor München hvor ' +
        'glassholdet er forferdelig, kelnerne har Pepsi Max-flekker på skjorta, ' +
        'og det kun serveres lunken Hansa i plastkrus. Han må be til ' +
        '<strong>St. Bernardus</strong> for å komme seg ut.';
      container.appendChild(txt);

      const pray = choiceBtn('🙏 BE TIL ST. BERNARDUS');
      pray.classList.add('rpg-pray');
      pray.onclick = () => renderStep(returnStep);
      container.appendChild(pray);
    }

    return { renderStep };
  }

  // ───────────────────────────────────────────────────────────
  // UI-HELPERE
  // ───────────────────────────────────────────────────────────
  function stepHeader(i, total, isConsequence) {
    const h = document.createElement('div');
    h.className = 'rpg-step-header';
    h.innerHTML =
      '<span class="rpg-step-num">STEG ' + (i + 1) + ' / ' + total + '</span>' +
      (isConsequence ? '<span class="rpg-step-tag">RESULTAT</span>'
                     : '<span class="rpg-step-tag">FORTELLING</span>');
    return h;
  }

  function storyText(html) {
    const d = document.createElement('div');
    d.className = 'rpg-text';
    d.innerHTML = String(html).replace(/\n/g, '<br>');
    return d;
  }

  function consequenceBox(html, isFatal) {
    const d = document.createElement('div');
    d.className = 'rpg-consequence' + (isFatal ? ' rpg-fatal' : '');
    d.innerHTML = String(html).replace(/\n/g, '<br>');
    return d;
  }

  function choiceBtn(label) {
    const b = document.createElement('button');
    b.className = 'rpg-choice';
    b.innerHTML = '<span class="rpg-choice-arrow">▸</span> ' + escapeHTML(label);
    return b;
  }

  function nextBtn(label) {
    const b = document.createElement('button');
    b.className = 'rpg-next';
    b.textContent = label;
    return b;
  }

  function backToMenuBtn(label) {
    const b = document.createElement('button');
    b.className = 'rpg-back';
    b.textContent = label;
    b.onclick = returnToMenu;
    return b;
  }

  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ═══════════════════════════════════════════════════════════
  // KAPITTEL 1: MÜCKLUS' OPPVÅKNING
  // ═══════════════════════════════════════════════════════════
  function runChapter1(container) {
    const story = [
      // Steg 1
      {
        text:
          `Mücklus von Bustenburg drømmer seg bort en søndag formiddag mens han holder en lederhose-knapp han har funnet på gulvet i Hofbräuhaus. Han kjenner tørsten komme krypende. Heldigvis står det en fersk fat med iskald Augustiner Helles på hans Stammtisch, og en ung tappemester står klar bak springen.`,
        options: [
          { text: 'Ta en lang slurk Augustiner Helles', consequence: 'Mücklus ser opp og oppdager at det er <strong>DJ Höchst</strong> som står bak tappespringen, ikke Roar. Det er noe magisk over måten han betjener Schankhahn på.', next: 1 },
          { text: 'Rister det av seg, kommer seg hjem og jekker en Hofbräu Original', consequence: 'Mücklus innser at Hofbräu Original er en kommersiell klovne-øl, og blir sendt rett til Skumløs-Wald.', next: 'skumlos_0' },
          { text: 'Lar fatet stå urørt og kjører til Augustiner-Bräustuben for litt belgisk øl', consequence: 'Belgisk øl finner han ikke, men i passasjersetet sitter det plutselig en mann i kåpe — det er <strong>DJ Höchst</strong>.', next: 1 }
        ]
      },
      // Steg 2
      {
        text:
          `Mücklus og DJ Höchst sitter på Schwabingstube og deler en Schneider Aventinus, da DJ Höchst plutselig tar opp en levende dackel-valp av lederhose-lommen. De klapper og koser med den. Da ringer det på døren. De ser spørrende på hverandre. Mücklus åpner — og det viser seg å være den fryktede <strong>Russen-Krister</strong>.`,
        options: [
          { text: 'Drikk opp Aventinusen i ro og mak', consequence: 'Munnen fylles av en mektig, røkt smak. Rommet lyses opp av en magisk kraft fra dypet av Schneider-tradisjonen. Russen-Krister bannlyses til Skumløs-Wald for alltid. DJ Höchst gir Mücklus en magisk togbillett til Tegernsee som belønning for å ha reddet valpen.', next: 2 },
          { text: 'Tilby Russen-Krister en Aventinus', consequence: 'Dackelen dør i en grotesk seanse — Russen-Krister tar livet av den med et bayersk-russisk drikkespill. Mücklus ender i Skumløs-Wald.', next: 'skumlos_1' },
          { text: 'Tilby Russen-Krister en Hofbräu Original', consequence: 'Russen-Krister fornærmes av den lave kvaliteten og bannlyses til Skumløs-Wald av seg selv. DJ Höchst rekker Mücklus en magisk togbillett til Tegernsee.', next: 2 }
        ]
      },
      // Steg 3
      {
        text:
          `Mücklus sitter på Hauptbahnhof i München for å benytte seg av den magiske togbilletten. Au Pairen er på jobb og ser ut til å være i godt driv — hun har Lufthansa-uniform og er i gang med å skjenne på en bayersk turistfamilie.`,
        options: [
          { text: 'Kjøpe 2 Maß og lage dackel-lyder på perrongen', consequence: 'Mücklus går ombord, sovner mellom to lederhose-kledte pendlere, og lander etterhvert i Tegernsee etter noen Tegernseer Helles servert av togvogn-kelneren.', next: 3 },
          { text: 'Kjøpe Apfelschorle og en pakke Wrigleys', consequence: 'Sendes til Skumløs-Wald til evig forbannelse. Game over.', next: 'gameover' },
          { text: 'Kjøpe 3 Maß og en stor Schnaps', consequence: 'Slipper ikke inn på toget. I fortvilelsen dukker plutselig <strong>GP</strong> opp og kjører Mücklus til Tegernsee i Bentley\'en. På veien diskuterer de glasshold på Tegernseer Bräustüberl.', next: 3 }
        ]
      },
      // Steg 4 – cliffhanger
      {
        text:
          `Fremme i Tegernsee møter Mücklus den onde <strong>Heim E. Wernhardt</strong> og hans hjelper <strong>Wegert Beid</strong> i Tax Free på Tegernseer Bräustüberl. Wernhardt har ny uniform og holder en mappe merket <em>«Geheime Braupolizei — Akte: M.v.B.»</em> i hånden. Wegert Beid spiser Leberkäs med fingrene.\n\nFortsettelse følger i Kapittel 2.`,
        options: []
      }
    ];

    const r = makeRenderer(container, story);
    r.renderStep(0);
  }

  // ═══════════════════════════════════════════════════════════
  // KAPITTEL 2: FLUKTEN FRA WEGERT BEID
  // ═══════════════════════════════════════════════════════════
  function runChapter2(container) {
    const story = [
      // Steg 1
      {
        text:
          `Mücklus løper inn i den lille Würstchen-buden hvor de selger Bratwurst med søt sennep og potetsalat, i et forsøk på å stikke av. Heim E. Wernhardt sender <strong>Wegert Beid</strong> etter Mücklus von Bustenburg. Wegert Beid har melert lederhosen og en altfor tung baguette i hånda.`,
        options: [
          { text: 'Kaste et tomt halvliterskrus med Schneider Weisse mot Wegert Beid', consequence: 'Treffer midt i planeten. Wegert Beid blir sendt inn i Paulaner-Keller, hvor han tar seg en Salvator som han synes er OK men ikke noe å skrive hjem om. Mücklus kjøper seg litt tid. Wegert Beid havner bak en gjeng med dackler på vei ut og blir stengt inne på Paulaner-Keller til evig tid.', next: 1 },
          { text: 'Styrte først halvlitersglasset med Schneider Weisse, så kaste det tomme glasset', consequence: 'Treffer midt i planeten. Wegert Beid sendes inn til Den Siste Snille på Sendlinger Tor hvor han stortrives og blir sittende og drikke arbeids-Helles i all fremtid. Wegert Beid er beseiret.', next: 1 },
          { text: 'Kaste en Vape som ligger på et bord mot Wegert Beid', consequence: 'Rommet fylles med lys og <strong>Paven</strong> kommer svevende ned fra taket. Wegert Beid bekjempes ved at Paven begynner å skryte til ham så voldsomt at han ikke kommer seg unna. Det rapporteres senere at Wegert Beid har konvertert til katolisismen og driver et bønnesentrum i Schwabing.', next: 1 }
        ]
      },
      // Steg 2
      {
        text:
          `Mücklus von Bustenburg setter seg på toget i retning Marienplatz. Det er ingen Heim E. Wernhardt ombord i toget som dundrer gjennom det Bayerske landskapet. Mücklus setter seg ned på Augustiner-Keller sin uteservering og tar seg en iskald <strong>Augustiner Edelstoff</strong>.`,
        options: [
          { text: 'Bestille en Brez\'n og enda en Edelstoff, etterfulgt av en Andechser Doppelbock', consequence: 'De lokale nikker anerkjennende til hans faglig sterke oppførsel. Han ser et kjent ansikt stå nederst i gata. Heim E. Wernhardt har funnet ham.', next: 2 },
          { text: 'Bestille en Edelstoff, en Brez\'n, studere menyen før han bestiller en Andechser', consequence: 'De lokale nikker anerkjennende til hans faglig sterke oppførsel. Han ser et kjent ansikt stå nederst i gata. Heim E. Wernhardt har funnet ham.', next: 2 },
          { text: 'Bestille en Andechser Doppelbock og to Edelstoff til å skylle ned med', consequence: 'De lokale nikker anerkjennende til hans faglig sterke oppførsel. Han ser et kjent ansikt stå nederst i gata. Heim E. Wernhardt har funnet ham.', next: 2 }
        ]
      },
      // Steg 3
      {
        text:
          `Heim E. Wernhardt kommer løpende i hans retning. Nå er tiden knapp og mulighetene få. Han dypper Brez\'nen i søt sennep før han tar den siste slurken av Andechseren. Mücklus von Bustenburg fikk ikke med seg sitt magiske sverd, <strong>Bjænn</strong>, gjennom sikkerhetskontrollen på Hauptbahnhof, så han kan ikke bekjempe Heim E. Wernhardt på vanlig vis. Han legger på sprang.`,
        options: [
          { text: 'Innom Würstchen Frans', consequence: 'Han ber Frans gi en stor bukett Bratwurst-pommes til Heim E. Wernhardt og løper videre inn på <strong>Augustiner Bräustuben</strong>. Heim E. Wernhardt kommer seg ikke inn med ekstern bukett (husregel) og Mücklus er i trygghet inntil videre. Han bestiller en Andechser Doppelbock og finner en plass å sitte. Innerst i hjørnet sitter en mystisk, kappekledd figur. Det viser seg å være <strong>Der Rüller</strong>, som har rullet helt fra Molde via Garmisch. Han sier «Mücklus, jeg har et oppdrag til deg…»', next: 3 },
          { text: 'Innom Schneider Bräuhaus', consequence: 'Mücklus rekker å ta seg en stor Schneider Aventinus, men klarer ikke løpe like fort med bare én Haferl-sko. Heim E. Wernhardt tar ham igjen og sender ham til Skumløs-Wald.', next: 'skumlos_2' },
          { text: 'Innom Allegro Moderati ved Viktualienmarkt', consequence: '<strong>Trond Gieske</strong> sitter i restauranten og prøver å sjekke opp Heim E. Wernhardt når han kommer. De utvikler en romanse over en delt Maß. Mücklus kommer seg i trygghet hos Augustiner Bräustuben. Innerst i hjørnet sitter en mystisk, kappekledd figur. Det viser seg å være <strong>Der Rüller</strong>, som har rullet helt fra Molde via Garmisch. Han sier «Mücklus, jeg har et oppdrag til deg…»', next: 3 }
        ]
      },
      // Steg 4 – cliffhanger
      {
        text: `Fortsettelse følger i Kapittel 3.`,
        options: []
      }
    ];

    const r = makeRenderer(container, story);
    r.renderStep(0);
  }

  // ═══════════════════════════════════════════════════════════
  // KAPITTEL 3: DER RÜLLERS PRØVELSE
  // ═══════════════════════════════════════════════════════════
  function runChapter3(container) {
    const story = [
      // Steg 1
      {
        text:
          `Der Rüller nikker diskret til verten på Augustiner Bräustuben, og kort tid etter kommer han med 15 forskjellige bayerske øl til Mücklus von Bustenburg på et lite trebrett. «Dette er den første prøvelsen du må gjennom for å bevise at du er <em>Den Utvalgte</em>.» Mücklus ser forundret på ham. «Hva mener du med Den Utvalgte?» sier han forfjamset. Det er vanskelig å konsentrere seg om samtalen når det står så mye herligheter på bordet — Tegernseer Helles, Augustiner Edelstoff, Schneider Weisse, Aventinus, Andechser Doppelbock, Paulaner Salvator, Hofbräu Maibock, Ayinger Celebrator, og syv andre.\n\n«Det er skrevet i profetien at Den Utvalgte vil bekjempe Wegert Beid, banke ned 15 øl, finne <strong>Den Goldene Maßkrug von König Ludwig</strong> — og så redde sjelen til <strong>Kai Andreas</strong>, den rettmessige guden, fra evig fortapelse i Skumløs-Wald. Hva sier du, er du klar?»\n\nMens Der Rüller fortalte profetien, hadde Mücklus rukket å drikke alle 15 ølene og var allerede på vei til Schnaps-baren for å ha noe å skylle dem ned med.`,
        options: [
          { text: 'Godta Rüllers oppdrag', consequence: 'De går videre til Würstchen Frans for en liten matbit. Der Rüller tar en bit Bratwurst og reiser seg opp av stolen i ærefrykt — han blir helbredet av hvor faglig sterk buketten er.', next: 1 },
          { text: 'Ikke godta Rüllers oppdrag', consequence: 'Mücklus sendes straks til Skumløs-Wald av sin egen samvittighet.', next: 'skumlos_0' }
        ]
      },
      // Steg 2
      {
        text:
          `Etter en heftig stor bukett med søt sennep og Krautsalat hører de noe voldsomt bråk fra hjørnet av Sendlinger Straße. De går rundt hjørnet og ser <strong>Heim E. Wernhardt</strong> i full slåsskamp med en mann i kamuflasjeantrekk og bluetooth-headset. Det viser seg å være <strong>BSM</strong>. Der Rüller løper tilbake til bilen sin og trykker på noen knapper. Bilen forvandles til et kamphelikopter med Augustiner-logo på siden.\n\nHeim E. Wernhardt blir bekjempet i en brutal og destruktiv scene som senere skal bli en lokal legende på Marienplatz. «Han er i Skumløs-Wald nå, og kommer seg ikke ut derfra på en stund. Jeg må tilbake til Hydro. Det kommer en ubåt inn for bunkring i ettermiddag, og det krever ekstra vakthold,» sa BSM før han praiet en taxi.`,
        options: [
          { text: 'Dra på Schneider Bräuhaus', consequence: 'Kjøpe en lagret Schneider Aventinus og litt Obatzda. Drar innom en Späti i Schwabing på vei til hotellrommet. I morgen skal de legge en plan for hvordan å redde Kai Andreas og finne Den Goldene Maßkrug.', next: 2 },
          { text: 'Dra tilbake til Augustiner Bräustuben', consequence: 'Broren er på plass bak spakene. Det viser seg at det har vært en Stadtführung i byen, så de er tomme for øl. Han går innom en Späti på vei hjem og kjøper en penisformet flaskeåpner i lederhose-design. I morgen skal de legge en plan for hvordan å redde Kai Andreas og finne Den Goldene Maßkrug.', next: 2 }
        ]
      },
      // Steg 3 – cliffhanger med to nye karakterer
      {
        text:
          `Mücklus våkner på hotellrommet sitt på Hotel Bayerischer Hof av at det banker bestemt på døren. Han retter på lederhosen og labber mot døra.\n\n«Hei Rüller!» sier han bestemt.\n\nPå andre siden av døren er det ikke Der Rüller som står, men to andre kjenninger:\n\n<strong>Türken Som Ligner på Mace</strong> og <strong>Glatte Kasper</strong>.\n\nFortsettelse følger i Kapittel 4.`,
        options: []
      }
    ];

    const r = makeRenderer(container, story);
    r.renderStep(0);
  }

  // ═══════════════════════════════════════════════════════════
  // KAPITTEL 4: BAMS BRÜR
  // ═══════════════════════════════════════════════════════════
  function runChapter4(container) {
    const story = [
      // Steg 1
      {
        text:
          `Türken Som Ligner på Mace stumpet sigaretten i det Mücklus von Bustenburg åpnet døren. Det var ironisk nok en Camel. Glatte Kasper var tydeligvis ikke forberedt, for han ble helt stum da han så Mücklus. Han hadde hørt gjetord om ham i Sæntrum og Schwabing på grunn av hans faglig sterke konsum.\n\nDe ble invitert inn på en øl, selvfølgelig, og fikk hver sin Hofbräu fra minibaren — den lå der for å kunne ha noe å slappe av med mellom slagene. Türken Som Ligner på Mace takket høflig nei, fyrte opp enda en Camel og sprayet seg med Axe Africa. Glatte Kasper var fortsatt målløs.`,
        options: [
          { text: 'Spør Glatte Kasper hva han egentlig heter', consequence: 'Glatte Kasper blir så overrasket over spørsmålet at han sendes umiddelbart til Skumløs-Wald. Ingen har noen gang stilt det spørsmålet før. Mücklus von Bustenburg og Türken Som Ligner på Mace deler en vannpipe og bestemmer seg for å ta en bukett.', next: 1 },
          { text: 'Gi Glatte Kasper juling', consequence: 'Glatte Kasper blir overrasket og sendes til Skumløs-Wald. Türken Som Ligner på Mace blir med å dele ut bank, riktignok mens han fortsatt holder på Camelen. Mücklus og Türken deler en vannpipe og bestemmer seg for å ta en bukett.', next: 1 },
          { text: 'Tisse i Glatte Kaspers Hofbräu før han får den', consequence: 'Det viser seg at det smaker akkurat som Hansa. Glatte Kasper blir overrasket og sendes til Skumløs-Wald av sjokk. Mücklus og Türken Som Ligner på Mace deler en vannpipe og bestemmer seg for å ta en bukett.', next: 1 }
        ]
      },
      // Steg 2
      {
        text:
          `Inne hos Würstchen Frans setter de seg ned med hver sin store bukett. Mücklus velger søt sennep-topping, mens Türken Som Ligner på Mace vil ha karrysaus. De spiser litt i stillhet — de har ikke vekslet et ord utover enigheten om å Franse — før Türken sier at han er sendt dit av <strong>Bams Brür</strong>, en mystisk velgjører som velger å skjule navnet sitt. Han har regnet med at Mücklus von Bustenburg ville havne i trøbbel, og har også selv litt å tjene på å gjeninnsette Kai Andreas som den mektige Gud over alt øl. Türken sier at Mücklus må dra til <strong>Andechs-klosteret</strong> for å hente krefter fra den magiske ølscenen i munkeklosteret.`,
        options: [
          { text: 'Sette seg på toget til Andechs på 2. klasse', consequence: 'Trappa ned til 2. klasse på toget er stengt av en gjeng dackler som står og teller mynter. Mücklus kommer seg ikke forbi og holder på å tisse seg ut. Må gå av i Pasing og dra til hun med Dirndl og Bitchesveis for å tisse. Sjangler etter hvert inn på et nytt tog med tom blære og ankommer Andechs på kveldingen.', next: 2 },
          { text: 'Sette seg på toget til Andechs på 1. klasse', consequence: 'Ser en gjeng med dackler som teller mynter i veien ned til 2. klasse, men slipper det. Går inn på en gullforgylt do og tisser. Ankommer Andechs midt på dagen og tar en Doppelbock Dunkel og en sigg med klosterbroren utenfor refektoriet.', next: 2 },
          { text: 'Tar på seg sykkeldress og låner en landeveissykkel for å sykle til Andechs', consequence: 'Midt mellom München og Andechs fylles veien med svart røyk. Ut av den stiger <strong>Paven</strong>, som har kommet tilbake fra Skumløs-Wald for å bannlyse Mücklus. «En så grå person har ingen rett til å være Den Utvalgte,» sier han før han bannlyser Mücklus til Skumløs-Wald.', next: 'skumlos_1' }
        ]
      },
      // Steg 3
      {
        text:
          `Etter fire dager til ende med hardt faglig innhold — bl.a. Doppelbock-konsum, sigging, og et kosthold bestående utelukkende av Andechser Käse fra refektoriet — kommer den gamle munken fra <strong>Kulminator-baren</strong> tassende bort til Mücklus von Bustenburg, som sitter utenfor klosterhusets hovedinngang.\n\n«Bams Brür har kommet og venter på deg hos oss. Ta ut noen Euro og kom,» sier den gamle munken. Mücklus drikker opp ølen, bestiller en til, drikker opp den, går innom fattigmanns-Augustiner på Marienplatz, stjeler et bilde av Den Goldene Maßkrug, og tar 2 Münchner Tripel før han spaserer bort til Kulminator. Den gamle munken åpner med et olmt blikk når han ringer på.\n\n«Hva vil du???»`,
        options: [
          { text: '«Smake på godt øl»', consequence: 'Den gamle munken spør om han har kontanter. Det har han ikke — Mücklus tror ikke på kontanter av prinsipp. Han blir nektet inngang. Litt lenger borte i gata er det en Späti. Mücklus kjøper seg litt Haribo og et par Helles, og setter seg på asfaltkanten.', next: 3 },
          { text: 'Skalle ned den gamle munken', consequence: 'I det pannebraskene møtes forvandles den gamle munken til å vise sitt sanne jeg — <strong>Gossa-Peter</strong>. Mücklus von Bustenburg sitt hode er tungt av kunnskap og gjennombedøvet av Aventinus, så det medfører at Gossa-Peter blir liggende. Ut av baren kommer den gamle damen som jobbet der, og forteller at hun har vært holdt i fangenskap i årevis. Hun liker egentlig bare ungt, friskt øl, men Gossa hadde en besettelse om å lagre ting i årevis utover holdbarhetsdatoene. Bams Brür kommer også ut, en langhåret mann med en t-skjorte som sier <em>«Caps-frei Zone»</em>. Han ber Mücklus kjøpe noen øl og sette seg ned på en fortauskant litt lenger borte.', next: 3 }
        ]
      },
      // Steg 4
      {
        text:
          `Bams Brür setter seg ved siden av Mücklus von Bustenburg og tar et par Haribo-speilegg. «Nå kommer han snart,» sier Bams, og fyrer opp en sigg. Mücklus ser spørrende på ham og tar en sup av Helles\'en.\n\nMücklus skvetter til når det kommer en person som er <em>kliss lik</em> Türken Som Ligner på Mace gående i full tysk landslagsdrakt fra 1990. De kunne vært tvillingbrødre, der den ene er av tyrkisk opprinnelse, og den nyankomne har litt mer nordisk utseende. Han hilser med avslipt østlandsdialekt, og med perfekt såna/sånass-grammatikk, men nekter å oppgi sitt namn.\n\n<strong>Han Som Ligner på Türken Som Ligner på Mace</strong> viser frem et perfekt Aventinus-glass han har lånt fra en pub i nærheten, og de bestemmer seg for å dra dit for å ta noen øl. Mücklus von Bustenburg og Bams Brür har fått en god tone, men de er nysgjerrige på hvem i alle dager Han Som Ligner på Türken Som Ligner på Mace er, og hvilken rolle han har i det store komplottet her.`,
        options: [
          { text: 'Dra på KFC ved Hauptbahnhof', consequence: 'De har også bepilsningsmuligheter på KFC i dette Fagets Rige. Bøtteholdet og glassholdet er upåklagelig. Det ryktes at Obersten har vært gjest hos selve Hofbräuhaus.', next: 4 },
          { text: 'Dra på Green Café Organical i Schwabing', consequence: 'Bannlyses til Skumløs-Wald — det er rapportert havremelk og fraværende glasshold.', next: 'skumlos_3' },
          { text: 'Dra på Burger King og kjøpe Crispy Chicken', consequence: 'Bannlyses til Skumløs-Wald. Denne gangen hører de høye «oho»-rop som en ugle på vei inn i krattet.', next: 'skumlos_3' }
        ]
      },
      // Steg 5 – cliffhanger
      {
        text: `De tar seg en øl og skal sette seg ned for å planlegge hvordan de kan gjeninnsette Kai Andreas i himmelriket.\n\nFortsettelse følger i Kapittel 5.`,
        options: []
      }
    ];

    const r = makeRenderer(container, story);
    r.renderStep(0);
  }

  // ═══════════════════════════════════════════════════════════
  // KAPITTEL 5: SKUMLØS-WALD & DIE GOLDENE MASSKRUG
  // ═══════════════════════════════════════════════════════════
  function runChapter5(container) {
    const story = [
      // Steg 1
      {
        text:
          `Bams Brür drar frem en gammel bok fra ryggsekken sin, tydelig preget av tidens tann og noen gamle ølsøl. Boken heter <em>«Albin-koppen, Munnggoen og Bukksa som liger i frysseren»</em>. Den har en svak eim av Pepsi Max og bayersk Senf.\n\n«Nøkkelen til å gjeninnsette Kai Andreas — og til å finne Den Goldene Maßkrug von König Ludwig — finner vi i denne hellige teksten,» sier Bams Brür rolig til Mücklus von Bustenburg mens han tar en sup av Hofbräu\'en. «Denne teksten er umulig å lese. Mannen som har skrevet den får vi heller ikke flydd inn for å oversette, fordi han for tiden har skjegg og kommer seg ikke gjennom en sikkerhetskontroll på flyplass. Den eneste måten vi klarer å lese dette på er hvis vi oppnår en promille på 6,9.»\n\nMücklus von Bustenburg foreslo at de skulle dra på <strong>Bierhalle Hops</strong> ved Theresienwiese for å jage nedpå Augustiner Maximator for å komme i gang.`,
        options: [
          { text: 'Drikke 2 Augustiner før Schweinshaxe, fortsette med 8 Augustiner', consequence: 'Oppnår til slutt 6,9 i promille og blir i stand til å forstå teksten. Bayrisch er plutselig like lett som dialekt fra Surnadal.', next: 1 },
          { text: 'Veksle annenhver Augustiner og Hofbräu', consequence: 'Byens <strong>Bürgermeister</strong> kommer innom med Nøkkelen til Byen for å hedre det faglige nivået. Bürgermeisteren lover også vekk en valgfri BMW til Mücklus von Bustenburg og Bams Brür. De oppnår til slutt 6,9 i promille og er i stand til å forstå teksten.', next: 1 },
          { text: 'Ta en lur, en Pepsi Max og en joggetur i Englischer Garten for å klarne hodet', consequence: 'Skumløs-Wald — joggetur er ikke faglig.', next: 'skumlos_0' }
        ]
      },
      // Steg 2
      {
        text:
          `I teksten står det at <strong>Kai Andreas</strong> først og fremst må reddes fra Skumløs-Walds fortapelse før han kan gjeninnta tronen i himmelriket. Det må gjøres gjennom å bekjempe den onde trollmannen som styrer Skumløs-Wald — navnet hans fremgår ikke av teksten. Det er også angitt at <strong>Den Goldene Maßkrug von König Ludwig</strong> ligger gjemt et sted i et bayersk biergarten, og kun den som har bevist sin Bierehre kan løfte den uten å brenne hånda.\n\nDet står også litt forskjellig i boka om Molde Fotballklubb som de blar fort forbi. Selv 6,9 i promille er ikke høyt nok til å klare seg gjennom det. Bams Brür og Mücklus von Bustenburg diskuterer litt frem og tilbake om glassholdet på Bierhalle Hops, og konkluderer med følgende:`,
        options: [
          { text: '«Holdet er OK, spesielt på Maximatoren»', consequence: 'Uttalelsen kan forsvares. De får sitte i fred og drikke litt til. Nå skal de ha seg en KFC før de skal på Clob.', next: 2 },
          { text: '«Holdet er bra»', consequence: 'De lokale nikker nok en gang anerkjennende for vurderingen. En mann ved døra med Tirolerhatt og PC-veske bukker for de når de går ut av lokalet. KFC neste.', next: 2 },
          { text: '«Holdet er fraværende»', consequence: 'Kelneren kommer bort og spytter på de. De går ut av lokalet og bort til KFC.', next: 2 }
        ]
      },
      // Steg 3
      {
        text:
          `På KFC ved Hauptbahnhof lyser <strong>Obersten</strong> opp veggen foran de, og de får følgende valg fra menyen:`,
        options: [
          { text: 'Liten meny med Apfelschorle', consequence: 'Skumløs-Wald.', next: 'skumlos_2' },
          { text: 'Medium meny med øl', consequence: 'Alt for lite mat. De bestiller en stor meny når de er ferdige med den første. Det ender med fråtsing nok en gang. De får bare utdelt en serviett på deling. De har såpass høy promille at Mücklus von Bustenburg sjangler og kommer borti et Aventinus-glass til en på nabobordet, og det blir fett på innsiden av glasset.', next: 3 },
          { text: 'Altfor stor meny med mat nok til en bayersk landsby', consequence: 'De lokale nikker nok en gang anerkjennende. Det ender med fråtsing nok en gang. De får bare utdelt en serviett på deling. De har såpass høy promille at Mücklus von Bustenburg sjangler og kommer borti et Aventinus-glass til en på nabobordet, og det blir fett på innsiden av glasset.', next: 3 }
        ]
      },
      // Steg 4 – Hasse Blitzland og El Bonero
      {
        text:
          `Mannen på nabobordet reiser seg i sinne. Lysene i lokalet flimrer. Det begynner å lyne og tordne utenfor, midt i mai. Bakken rister. Lokalet fylles med røyk, og en bayersk gjeterhund løper skrikende ut.\n\nDet viser seg at mannen har på seg en lang kappe og en trollmannvest med Lederhosen-detaljer. Han har en stor ornamentert stav i hendene, formet som en Maßkrug.\n\nDet viser seg å være\n\n<strong>Hasse Blitzland</strong>.\n\nHan satt sammen med en annen mann som de også dro kjensel på, men som fikk glasset sitt skånet for fettete fingre: lederen for Bunadsgeriljaen, spanjakken <strong>El Bonero</strong>.\n\n«Du må tørke hendene på Lederhosen slik som skikkelige mannfolk,» sier Hasse Blitzland. Mücklus von Bustenburg og Bams Brür er enige, men Bams Brür spør:\n\n«Hva gjør dere her?»\n\nEl Bonero svarer: «Dette er Fagets Hjerte — KFC her i München er det høyeste nivå av fag i hele Sør-Tyskland. Vi tenkte dette var en passende lokasjon for å varme opp lever og nyrer til vi skal på konsert med <strong>DJ Dock-Vater</strong> i kveld på Backstage.»\n\nMücklus von Bustenburg svarer: «Dock-Vater? Jeg trodde han hadde lagt platespilleren på hattehylla?»\n\nEl Bonero gir Mücklus et uventet kyss på kinnet og stryker ham nedover armen mens han sier: «Jeg vet at dere er på et oppdrag for å gjeninnsette Kai Andreas, og at dere leter etter Den Goldene Maßkrug. Da er du interessert i hvem Dock-Vater egentlig er. Hans namn er <strong>Höyvind Hund</strong>. Han er broren til Tore Hund som var med å kjempe mot Olav den Hellige. Han vil være avgjørende i deres oppdrag — det er han som vet hvor König Ludwig gjemte sin Maßkrug.»`,
        options: [
          { text: 'Invitere Hasse Blitzland og El Bonero på en øl på en tilfeldig pub', consequence: 'Fortsettelse følger i et fremtidig kapittel — som ennå ikke er deklassifisert av Ministeriet für Biersicherheit. Belønning for å ha fullført fem kapitler: tilgang til Den Goldene Maßkrug venter i München, oktober 2026.' }
        ]
      }
    ];

    const r = makeRenderer(container, story);
    r.renderStep(0);
  }

  // ───────────────────────────────────────────────────────────
  // PUBLIC API
  // ───────────────────────────────────────────────────────────
  window.startRPG = startRPG;
  window.returnRPGToMenu = returnToMenu;

  // Wire up chapter menu buttons (delegated, runs once DOM is ready)
  function wireMenu() {
    document.querySelectorAll('.rpg-chapter-tile').forEach(btn => {
      if (btn._wired) return;
      btn._wired = true;
      btn.addEventListener('click', () => {
        const ch = parseInt(btn.dataset.chapter, 10);
        if (!isNaN(ch)) startRPG(ch);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireMenu);
  } else {
    wireMenu();
  }
})();
