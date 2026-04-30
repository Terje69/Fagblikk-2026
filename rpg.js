/* ============================================================
   FAGBLIKK MÜNCHEN 2026 — DAS SPIEL
   Mücklus von Bustenburg & Das Reinheitsgebot-Komplott
   Et tekstbasert rollespill i 8 kapitler
   ============================================================ */

(function () {
  'use strict';

  const TOTAL_CHAPTERS = 8;

  // ═══════════════════════════════════════════════════════════
  // ENTRY
  // ═══════════════════════════════════════════════════════════
  function startRPG(chapter) {
    const menu = document.getElementById('rpgChapterMenu');
    const game = document.getElementById('rpgGame');
    if (!menu || !game) return;

    menu.classList.add('hidden');
    game.classList.remove('hidden');
    game.innerHTML = '';

    const fns = {
      1: runChapter1, 2: runChapter2, 3: runChapter3, 4: runChapter4,
      5: runChapter5, 6: runChapter6, 7: runChapter7, 8: runChapter8
    };
    const fn = fns[chapter];
    if (fn) fn(game);
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

  // ═══════════════════════════════════════════════════════════
  // RENDERER
  // ═══════════════════════════════════════════════════════════
  function makeRenderer(container, story) {
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
      // gameover
      if (opt.next === 'gameover') {
        container.innerHTML = '';
        container.appendChild(consequenceBox(opt.consequence, 'fatal'));
        container.appendChild(backToMenuBtn('★ START PÅ NYTT ★'));
        return;
      }
      // win
      if (opt.next === 'win') {
        container.innerHTML = '';
        container.appendChild(consequenceBox(opt.consequence, 'win'));
        container.appendChild(winBox());
        container.appendChild(backToMenuBtn('★ TILBAKE TIL KAPITTELMENY ★'));
        return;
      }
      // skumlos
      if (typeof opt.next === 'string' && opt.next.indexOf('skumlos') === 0) {
        const parts = opt.next.split('_');
        const back = parseInt(parts[parts.length - 1], 10);
        showSkumlos(isNaN(back) ? returnIndex : back, opt.consequence);
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

      const intro = prefix ? `<em>${escapeHTML(prefix)}</em><br><br>` : '';
      const txt = document.createElement('div');
      txt.className = 'rpg-text rpg-skumlos-text';
      txt.innerHTML =
        intro +
        'Mücklus befinner seg igjen i Skumløs-Wald, det forbannede krattet utenfor München hvor ' +
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
  // UI helpers
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

  function consequenceBox(html, mode) {
    const d = document.createElement('div');
    let cls = 'rpg-consequence';
    if (mode === 'fatal') cls += ' rpg-fatal';
    if (mode === 'win')   cls += ' rpg-win';
    d.className = cls;
    d.innerHTML = String(html).replace(/\n/g, '<br>');
    return d;
  }

  function winBox() {
    const d = document.createElement('div');
    d.className = 'rpg-winbox';
    d.innerHTML =
      '<div class="rpg-win-emblem">★</div>' +
      '<div class="rpg-win-title">★ MISJON FULLFØRT ★</div>' +
      '<div class="rpg-win-sub">Reinheitsgebot-Tavlen er gjenforent. ' +
      'Oktoberfest 2026 reddes. Mücklus von Bustenburg er fullt rehabilitert ' +
      'og innstilt som <em>Generalbierinspektor</em> av Ministerium für Biersicherheit.</div>';
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
  // KAPITTEL 1 — TILBAKEKOMSTEN
  // ═══════════════════════════════════════════════════════════
  function runChapter1(container) {
    const story = [
      // Steg 1
      {
        text:
          `Det er <strong>24. september 2026</strong>. Mücklus von Bustenburg har sittet fanget i Skumløs-Wald i halvannet år, holdt i sjakk av en lunken Hansa han ikke klarer å drikke ferdig. Han har gått ned 14 kilo i sin Bierehre. Plutselig hører han noe utenkelig — lyden av et knust halvliterskrus mot bartrærne, og motorduren av en BMW 7-serie limousin som maler seg gjennom granskogen.\n\nEn skinnende Mercedes-Maybach (sponset av Augustiner) parkerer på lysningen. Ut stiger <strong>Bürgermeister Klaus Lederhausen</strong> i full bayersk drakt med ordfører-medaljon og Hofbräu-flagg på brystlommen, fulgt av en tjener som bærer en sølvskåle med iskald <em>St. Bernardus Abt 12</em>.`,
        options: [
          { text: 'Drikk St. Bernardus uten å spørre', consequence: 'En bølge av faglig styrke skyller gjennom Mücklus. Skogen rundt ham bleker, og plutselig er han tilbake i et virkelig München. Bürgermesteren smiler bredt — for bredt — og legger en hånd på hans skulder. «Velkommen tilbake, Bierinspektor. Vi har et problem.»', next: 1 },
          { text: '«Hva er fangsten?» — kreve forklaring først', consequence: 'Bürgermesteren tørker en tåre. «Mücklus. Bayern står i fare for å miste sin sjel. Jeg trenger deg.» Han forteller mens Mücklus drikker. St. Bernardus brenner forbannelsen ut av kroppen. Skogen viker.', next: 1 },
          { text: '«Dette er en felle, jeg er ikke dum», snu og gå dypere inn i skogen', consequence: 'Mücklus tar tre skritt inn mellom Hansa-trærne. Skumløs-Wald lukker seg igjen rundt ham. Bürgermesteren sukker og kjører hjem.', next: 'skumlos_0' }
        ]
      },
      // Steg 2
      {
        text:
          `Tilbake i Hofbräuhauses statsgemak forteller Bürgermeisteren historien. Natt til <strong>1. mai 2026</strong> ble selve <strong>Reinheitsgebot-Tavlen</strong> stjålet fra det dypeste hvelv under Hofbräuhaus — den hellige steintavlen fra 1516 som garanterer renheten i alt bayersk øl. Den har ligget der siden kong Wilhelm IVs hånd.\n\nTyven splittet tavlen i seks fragmenter — <strong>Gerste, Hopfen, Wasser, Hefe, Reinheit</strong> og <strong>Bierehre</strong> — og spredte dem strategisk over München. Hvis ikke alle seks gjenforenes før <strong>Oktoberfest åpner 1. oktober</strong>, vil all München-øl mystisk vannes ut til 2,4 % og mistet sin Bierehre. Hele Bayern vil bli til Skumløs-Wald.\n\nMücklus har syv dager. Bürgermesteren rekker ham et brev med seks navn på mistenkte.`,
        options: [
          { text: 'Be om å få lese listen over mistenkte', consequence: 'Brevet inneholder seks navn:<br>— <strong>Trond Gieske</strong> (politisk omreisende)<br>— <strong>Russen-Krister</strong> (humle-importør)<br>— <strong>Wegert Beid</strong> (sluppet ut, jobber Augustiner)<br>— <strong>Gossa-Peter</strong> (lager-besatt)<br>— <strong>Heim E. Wernhardt</strong> (Geheime Braupolizei)<br>— <strong>DJ Dock-Vater</strong> (Höyvind Hund, musiker)', next: 2 },
          { text: 'Be om forsterkninger', consequence: 'Bürgermesteren nikker. «Vi henter dem inn med en gang.» <strong>Bams Brür</strong> teleporteres inn fra Antwerpen som hjernen, <strong>Der Rüller</strong> kommer rullende fra Garmisch som transport, og <strong>BSM</strong> er allerede på plass i kamuflasje med Bluetooth-headset. Brevet med mistenkte ligger på bordet.', next: 2 },
          { text: 'Be om å få inspisere åstedet først', consequence: 'De går ned i hvelvet. Mücklus tenner en lighter og finner: en messing-knapp av Lederhose-type, en flekk av <em>Pepsi Max</em> på gulvet, og en gulnet lapp med påskrift «lagre — for ettertiden». Tre spor allerede.', next: 2 }
        ]
      },
      // Steg 3
      {
        text:
          `På åstedet finner Mücklus tre spor som han noterer i den lille svarte boken sin:\n\n<strong>1.</strong> En messing-Lederhose-knapp — bare to skreddere i München lager dem: en i Sendling, en i Bogenhausen.\n<strong>2.</strong> En Pepsi Max-flekk — fra en flaske som ikke selges på Hofbräuhaus.\n<strong>3.</strong> En lapp med ordene «lagre — for ettertiden» — en signatur Mücklus har sett før.\n\nUtenfor regner det. Bams Brür står ved Marienplatz med tre paraplyer og en åpen Stadtplan. «Hvor skal vi først?»`,
        options: [
          { text: 'Schwabing — Englischer Garten har en bygg-leverandør som har tipset', consequence: 'Bams Brür folder kartet. «Trond Gieske er sett ved Chinesischer Turm tre dager på rad.» De tar U6 nordover.', next: 3 },
          { text: 'Glockenbachviertel — det er rapportert humle-tyveri på Viktualienmarkt', consequence: 'Bams Brür folder kartet. «Russen-Krister selger humle av topp klasse rett ved Schneider Bräuhaus.» Vi tar T-banen sørover etter Schwabing.', next: 3 },
          { text: 'Sendling — Augustiner-bryggeriets vannpumpe er sabotert', consequence: 'Bams Brür folder kartet. «Wegert Beid jobber der nå. Etter omveltningen i Paulaner-Keller, må han hatt en snarvei.» Vi tar Sendling etter Glockenbach.', next: 3 }
        ]
      },
      // Steg 4
      {
        text:
          `Ruten er klar. Mücklus tar imot en frisk Augustiner Edelstoff fra Bams Brür og ser opp mot Frauenkirches grønne kupler. <em>«Sieben Tage. Sechs Verdächtige. Eine Wahrheit.»</em>\n\nMisjonen begynner i Schwabing.\n\nFortsettelse i Kapittel 2.`,
        options: []
      }
    ];

    makeRenderer(container, story).renderStep(0);
  }

  // ═══════════════════════════════════════════════════════════
  // KAPITTEL 2 — SCHWABING / FRAGMENT GERSTE
  // ═══════════════════════════════════════════════════════════
  function runChapter2(container) {
    const story = [
      // Steg 1
      {
        text:
          `Englischer Garten. Klokka er fire på ettermiddagen. Solen treffer det grønne pagoden av <strong>Chinesischer Turm</strong> der et bayersk Volksmusik-orkester spiller «Skol! Skol!» med tuba og dragspel. Mücklus von Bustenburg sitter på en lang Bierbank med et halvliterskrus Hofbräu Original (klovne-øl, men man tar det man får).\n\nVed nabobordet sitter <strong>Trond Gieske</strong> i en for-tett Trachtenjacke som spretter åpen ved knappene, mens han smiler mot tre tyske damer fra Düsseldorf. På bordet hans ligger det en pose merket <em>«BAYERISCHES SAATGUT — EXCLUSIV — HALLERTAU 2026»</em>. Innholdet er mistenkelig kornlignende.`,
        options: [
          { text: 'Konfrontere Trond Gieske direkte over bordet', consequence: 'Trond Gieske sper ut Apfelsaft-Schorle og rekker frem hånda. «Hyggelig! Du må være… kjent!» Han nekter for alt. «Jeg er bare i München for politisk lunsj med SPD-fraksjonen.» Posen feier han forsiktig under bordet med foten. Damene fra Düsseldorf gjør seg klare for å gå.', next: 1 },
          { text: 'Bestille runder med Augustiner og lytte til lokal sladder', consequence: 'En gammel mann med Tirolerhatt nikker mot Trond Gieske. «Den der politikeren har vært på Chinesischer Turm hver dag i en uke. Han kaster ting i Eisbach hver kveld klokka åtte. Surferne sier de finner kornposer i bølgen.»', next: 1 },
          { text: 'Liste seg ut til Eisbach for å snakke med surferne', consequence: 'Eisbach-bølgen står stødig som alltid. Surferne er bayere i våtdrakt og Lederhose-kortbukse over. De forteller at «ein Politiker hat vorgestern eine Tasche reingeworfen — og inni var det noe gull-gult.» Det er Gerste-fragmentet.', next: 1 }
        ]
      },
      // Steg 2
      {
        text:
          `Surferne på Eisbach er villige til å hjelpe — men bare etter at Mücklus von Bustenburg har bevist sin <em>faglige stand</em>. De rekker ham et surfebrett av eik og dirigerer ham mot bølgen.`,
        options: [
          { text: 'Forsøke å surfe på Eisbach selv', consequence: 'Mücklus klatrer opp på brettet. I 3,2 sekunder ser det faktisk lovende ut. I 3,3 sekunder vender bølgen ham om og slukker ham som en Brez\'n i sennep. Surferne ler godt — men de respekterer faglig forsøk og rekker ham Gerste-fragmentet, fortsatt vått.', next: 2 },
          { text: 'Tilby surferne en runde med Augustiner Edelstoff', consequence: 'Bayerske surfere smelter ved synet av Augustiner. De rekker over Gerste-fragmentet i bytte mot en kasse, og forteller at de så <strong>Trond Gieske</strong> i Lederhose-jakke kaste posen i bølgen for to dager siden. «Han hadde ein Telefongespräch med en stor mann i lyseblå dress.»', next: 2 },
          { text: 'Bløffe en Hawaii-surf-cred fra North Shore', consequence: 'Surferne ler av aksenten hans. «Du har aldri vært i havet, du har vært i Moldefjorden!» De vender ryggen og kaster ham en Pepsi Max — som han ikke kan motstå. Skumløs-Wald.', next: 'skumlos_1' }
        ]
      },
      // Steg 3
      {
        text:
          `Mücklus vandrer tilbake til Chinesischer Turm med Gerste-fragmentet pakket i en våt avis (Süddeutsche Zeitung, kultur-bilag). Trond Gieske sitter fortsatt der, men nå med en ny dame — denne gangen fra Augsburg. Når han ser Mücklus med fragmentet, blir han kritthvit i ansiktet og sletter fortere enn vanlig en SMS.`,
        options: [
          { text: '«Hvem fortalte deg å gjemme dette?»', consequence: 'Trond Gieske svetter gjennom Trachtenjakka. «Jeg ble lurt! En mann i lyseblå dress kontaktet meg i april. Han sa han trengte en politiker som kunne kaste ting diskret. Han betalte i kontanter — og en gala-invitasjon. Jeg vet ikke navnet hans, men han hadde en <em>messing-Lederhose-knapp</em> i jakkeoppslaget.»<br><br><strong>Ledetråd #1:</strong> Tyvens medhjelper bærer messing-Lederhose-knapp.', next: 3 },
          { text: '«Hva het mannen som ga deg ordre?»', consequence: 'Trond Gieske: «Han kalte seg bare «Der Klient». Han hadde en limousin. Han sa: <em>«Slip det i Eisbach. Vi henter det senere. For en god sak.»</em>» Trond gråter litt. Mücklus noterer.<br><br><strong>Ledetråd #1:</strong> Tyven bruker mellommenn og kaller seg «Der Klient».', next: 3 },
          { text: 'Gi Trond Gieske juling under bordet', consequence: 'Trond Gieske er en stor mann men en mindre kriger. Etter to slag har han fått nok og leverer skriftlig tilståelse: alibi for natt til 1. mai (gala på Bayerische Staatskanzlei med 200 vitner og videoarkiv), pluss bekreftelse på at han bare var transportør, ikke tyv.<br><br><strong>Ledetråd #1:</strong> Trond Gieske har vanntett alibi for selve natta.', next: 3 }
        ]
      },
      // Steg 4
      {
        text:
          `Mücklus von Bustenburg pakker Gerste-fragmentet i en tørr lommetørke. Bams Brür venter ved kanten av Englischer Garten med en åpnet Augustiner Helles og oppdaterte tegninger. «Ett av seks. Neste stop: Glockenbachviertel.»\n\nFortsettelse i Kapittel 3.`,
        options: []
      }
    ];

    makeRenderer(container, story).renderStep(0);
  }

  // ═══════════════════════════════════════════════════════════
  // KAPITTEL 3 — GLOCKENBACHVIERTEL / FRAGMENT HOPFEN
  // ═══════════════════════════════════════════════════════════
  function runChapter3(container) {
    const story = [
      // Steg 1
      {
        text:
          `Glockenbachviertel — Münchens trendige bydel hvor kunstnere drikker Aventinus og diskuterer hvor mye sosial demokrati en Brez\'n bør ha. Mücklus sitter på <strong>Schneider Bräuhaus</strong> sin uteservering med en Schneider Weisse Mein Original. Solen er på vei ned.\n\nSå dukker han opp: <strong>Russen-Krister</strong>, ikledd full sibirsk pelskåpe selv om det er 19 grader, slepende på en stor pose merket <em>«ХМЕЛЬ — HOPFEN — TOP CLASS — HALLERTAU 2026»</em>. Han ser ikke Mücklus. Han bestiller — av alle ting — en <strong>Hofbräu Original</strong>. Klovne-øl. Mücklus kjenner dette er mistenkelig.`,
        options: [
          { text: 'Forfølg Russen-Krister diskret når han forlater puben', consequence: 'Mücklus sniker etter ham gjennom Glockenbach-gatene. Russen-Krister stopper utenfor en uskyldig-utseende kjellerdør, banker tre korte og to lange, og forsvinner ned. På døra er det en liten messing-Lederhose-knapp.', next: 1 },
          { text: 'Konfrontere Russen-Krister direkte ved bordet', consequence: 'Russen-Krister hopper fra stolen. «Mücklus! Brat! Long time no see!» Han er forvirret over møtet, men slipper ut at han er «middleman, just middleman, I don\'t steal, I just deliver.» Mücklus får ham til å lede an til lageret.', next: 1 },
          { text: 'Stjele posen mens Russen-Krister bestiller mer øl', consequence: 'Mücklus rekker armen rundt nabobordet. Posen veier 14 kilo. I det Mücklus tar den, snur Russen-Krister seg med en stor smil og sier: «Du er heldig. Jeg ville solgt deg den uansett. Men la oss snakke nede.» De drar til lageret.', next: 1 }
        ]
      },
      // Steg 2
      {
        text:
          `Lageret under Glockenbach er et betongkjeller-rom på størrelse med en Festzelt. Det er fullt av humle-poser stablet til taket, alle merket «HALLERTAU». I et hjørne ligger en spesielt forseglet kasse med messing-beslag og et glødende glassrør på toppen — <strong>Hopfen-fragmentet</strong>.\n\nRussen-Krister forklarer på sin egen blanding av tysk, russisk og fjellbygdmål: «Jeg kjøpte hele containeren av en mann i lyseblå dress i april. Han betalte i kontanter og ba meg <em>«lagre dette ett halvt år, så hente det inn til Oktoberfest»</em>. Han sa det var for en velgjørenhets-anledning.»`,
        options: [
          { text: '«Hvem var mannen i lyseblå dress?»', consequence: 'Russen-Krister: «Han hadde messing-knapp på jakkeoppslag. Han kjørte limousin. Han ba meg kalle ham <em>«Der Klient»</em>. Jeg trodde det var helt vanlig forretning! Sibirsk vodka-bransje gjør det hele tida!»<br><br><strong>Ledetråd #2:</strong> Samme «Der Klient» har plassert humle hos Russen-Krister.', next: 2 },
          { text: 'Be om kvitteringen for handelen', consequence: 'Russen-Krister roter i en gammel skoeske og finner kvitteringen. Datert <strong>14. april 2026</strong> — to og en halv uke FØR Reinheitsgebot-Tavlen ble stjålet. Beløpet: 47.500 EUR i kontanter.<br><br><strong>Ledetråd #2:</strong> Tyveriet var planlagt minst tre uker i forveien.', next: 2 },
          { text: 'Smake på humlen for å sjekke kvalitet', consequence: 'Det er ekte Hallertau. Faglig svært sterk humle. Mücklus får en plutselig klarhet — og legger merke til en diskret spaltelukt av <em>Pepsi Max</em> i kassen rundt fragmentet.<br><br><strong>Ledetråd #2:</strong> Pepsi Max-spor på flere lokasjoner — samme tyv.', next: 2 }
        ]
      },
      // Steg 3
      {
        text:
          `Plutselig høres bråk fra ovenfor. Lyset av en politisignal flammer ned trappen. Det er en <strong>Geheime Braupolizei</strong>-razzia ledet av selveste <strong>Heim E. Wernhardt</strong>! Han skriker: «JEDER bleibt stehen! Auf den Boden!» Russen-Krister begynner å gråte russisk-bayrisk.\n\nMücklus må stikke av med Hopfen-fragmentet før Wernhardt får tak i det.`,
        options: [
          { text: 'Klatre opp på taket gjennom luftesjakten', consequence: 'Mücklus dytter seg gjennom luftesjakten — det smaker av gammel støv og sigarettrester. Han kommer ut på en flat tegltak ovenfor et Schwabing-hipster-bakeri. Han hopper fra tak til tak og lander i en Augustiner-bortleveringsbil. Sjåføren leverer ham gratis tilbake til Hofbräuhaus mot en delt øl. Hopfen-fragmentet sikret.', next: 3 },
          { text: 'Forsøke bakgangen', consequence: 'Bakgangen åpner seg rett mot Wernhardts sekundærpatrulje med kommissær Dittmer som leder. Han har et lommetørkle og en lang Maglite. Mücklus blir tatt — Skumløs-Wald.', next: 'skumlos_2' },
          { text: 'Skvulpe en flaske Aventinus i ansiktet på Heim E. Wernhardt', consequence: 'Den røkte, mørke Schneider Aventinusen treffer Wernhardts uniform i en perfekt parabel. Lukten — sterkere enn pepperspray for en byråkrat. Han hyler «MEINE NEUE UNIFORM!» og forsvinner i en sky av såpevann. Mücklus stikker av med fragmentet. Lokale ler godt og nikker anerkjennende.', next: 3 }
        ]
      },
      // Steg 4
      {
        text:
          `To av seks. Mücklus von Bustenburg står på Marienplatz og lar Augustiner-vognen kjøre videre. Bams Brür kommer luskende ut fra en sidegate med en oppdatering: «Wegert Beid leder bryggeri-tur på Augustiner-Keller om en time. Hvis du skal infiltrere, må vi gå nå.»\n\nFortsettelse i Kapittel 4.`,
        options: []
      }
    ];

    makeRenderer(container, story).renderStep(0);
  }

  // ═══════════════════════════════════════════════════════════
  // KAPITTEL 4 — SENDLING / FRAGMENT WASSER
  // ═══════════════════════════════════════════════════════════
  function runChapter4(container) {
    const story = [
      // Steg 1
      {
        text:
          `Augustiner-Keller i Sendling. Klokka er ti over fire. Mücklus von Bustenburg klemmer seg inn i en gruppe italienske turister fra Verona som alle bærer røde caps og snakker om FC Bayern. <strong>Der Rüller</strong> står ved siden av, forkledd som hotell-konsierge med et headset og en fotograf-vest.\n\nGuiden står foran med klipboard og en falsk smil. Det er <strong>Wegert Beid</strong> — i full Bräumeister-uniform, nå med Augustiner-emblem på brystet. Han har klippet Lederhosen kortere enn forrige gang. Han ser usikkerhet i øynene. Han starter turen.`,
        options: [
          { text: 'Stille spørsmål som bare en tidligere Bierinspektor kan vite svaret på', consequence: 'Mücklus: «Forklare den iso-elektriske pH-verdien til Augustiner-vannet kontra Hofbräu-vannet ved 4 grader Celsius?» Wegert Beid blekner. Italienerne blir imponert. Wegert Beid svetter og kremter. «Sir... vi går videre.» Han har lagt merke til Mücklus.', next: 1 },
          { text: 'Forbli helt anonym i den italienske flokken', consequence: 'Mücklus snakker italiensk i monoton dialekt. «Bellissima.» «Si.» «Guarda.» Han glir gjennom turen uten å bli oppdaget. Det gir ham operasjonsrom.', next: 1 },
          { text: 'Drikke smaksprøvene altfor fort', consequence: 'Wegert Beid stopper og roper: «Sir, please, dette er en TUR, ikke en Stammtisch!» Italienerne ler. Mücklus blir bedt om å ta en pause på et sidebord — som tilfeldigvis er like ved pumpehuset.', next: 1 }
        ]
      },
      // Steg 2
      {
        text:
          `Etter halvgått tur stopper Wegert Beid brått ved en umerket dør. «Et øyeblikk, kjære gjester. Jeg må sjekke en pumpe.» Han forsvinner gjennom døra. Mücklus ser en sjanse.\n\nDer Rüller mumler i headsettet: «Han har vært inne der to ganger i dag allerede. Det er Wasser-pumpen. Gå.»`,
        options: [
          { text: 'Følge etter Wegert Beid umiddelbart', consequence: 'Mücklus åpner døra forsiktig. Inne er det dampende rør og en spotlight som lyser på en glasskolbe på en sokkel. Wasser-fragmentet. Wegert Beid står over det med skjelvende hender, som om han ikke kan bestemme seg for å ta det eller ikke.', next: 2 },
          { text: 'Avlede gruppen og smyge bak Wegert Beid', consequence: 'Mücklus tipper om en flaske Edelstoff. Italienerne hyler. Mens kaoset står, sniker han bak Wegert Beid og inn i pumpehuset. Wegert Beid har glassrøret i hånda og ser Mücklus med dyp skam i blikket.', next: 2 },
          { text: 'Bryte opp luken med en Maßkrug', consequence: 'Glasset knuses i hans grep. Wegert Beid kommer ut og finner Mücklus blødende på gulvet. «Sir... du blir bedt om å forlate turen.» Mücklus utvises og må vente på neste tur — to dager senere. <em>Skumløs-Wald-trussel for tidstap.</em>', next: 'skumlos_1' }
        ]
      },
      // Steg 3
      {
        text:
          `Inne i pumpehuset står Wegert Beid med Wasser-fragmentet i den ene hånden og en hvit konvolutt i den andre. Han ser Mücklus, og i stedet for å kjempe — bryter han sammen.\n\n«Mücklus von Bustenburg. Du må tro meg. Bürgermeister Lederhausen plasserte meg her som <strong>spion</strong>. Han sa det var for å holde et øye på Augustiner — men jeg har innsett han bruker bryggeriene til å skjule fragmenter. Jeg er ikke tyven. Jeg er bare en pønske mole. Her — ta det. Jeg vil vitne.»\n\nHan rekker over Wasser-fragmentet i ren glasskolbe.`,
        options: [
          { text: 'Spør om beviset', consequence: 'Wegert Beid åpner konvolutten. Inne ligger en tjenesteordre signert med store K og L: <em>«Wegert Beid plasseres ved Augustiner-Keller fra 5. mai 2026 for «særskilt overvåking» — Bürgermeister Klaus Lederhausen.»</em> Datoen er fire dager etter tyveriet.<br><br><strong>Ledetråd #3:</strong> Bürgermesteren plasserte moler i bryggerier rett etter tyveriet.', next: 3 },
          { text: 'Lov ham nåde mot full forklaring', consequence: 'Wegert Beid: «Han kalte meg inn 2. mai. Han sa han hadde "fått igjen" min sak fra Paulaner-Keller. Han ba meg jobbe på Augustiner som vakthold. Sa det var av den store sak — Bayerns ære. Jeg trodde ham. I retur fikk jeg leilighet i Sendling og 80% rabatt på Edelstoff.»<br><br><strong>Ledetråd #3:</strong> Bürgermesteren rekrutterer ved å betale i øl-rabatter.', next: 3 },
          { text: 'Tenk over om Wegert Beid kan være tyven likevel', consequence: 'Mücklus husker at Wegert Beid satt på Paulaner-Keller hele 1. mai med 12 vitner. Bryllupsfest. Vanntett alibi. Han er ikke tyven.<br><br><strong>Ledetråd #3:</strong> Wegert Beid har bekreftet alibi for tyveri-natta.', next: 3 }
        ]
      },
      // Steg 4
      {
        text:
          `Mücklus von Bustenburg pakker Wasser-fragmentet ned i fôret av jakka. Wegert Beid reiser seg og rekker hånda fram. «Tre stykker dropper du. Tre igjen. Pass deg for Bürgermesteren — han ser ikke ut som det, men han er ikke som han fremstår.»\n\nMücklus har nå <strong>tre fragmenter av seks</strong>. Bams Brür venter utenfor med en Mercedes Sprinter. «Hofbräuhaus. Lehel. Vi går rett tilbake til åstedet.»\n\nFortsettelse i Kapittel 5.`,
        options: []
      }
    ];

    makeRenderer(container, story).renderStep(0);
  }

  // ═══════════════════════════════════════════════════════════
  // KAPITTEL 5 — LEHEL / FRAGMENT HEFE
  // ═══════════════════════════════════════════════════════════
  function runChapter5(container) {
    const story = [
      // Steg 1
      {
        text:
          `Tilbake i Hofbräuhauses store offentlige sal. Det er full musikk fra orkesteret som spiller «Ein Prosit» for åtti og fjerde gang denne uka. Servitørene bærer åtte Maß i hver arm. Mücklus von Bustenburg setter seg i nærheten av kjelleningangen og bestiller en Maß Hofbräu Original — han må passe inn.\n\nHan speider rundt. På et bord helt bakerst, alene, sitter en gammel mann i grå frakk og lager-hatt. Han lagrer en glass Hefeweizen i en sølvkrukke han trekker fram fra jakka, korker forsiktig, og legger ned i en kjellerveske. Det er <strong>Gossa-Peter</strong>.`,
        options: [
          { text: 'Sett seg ved Gossa-Peter direkte', consequence: 'Gossa-Peter løfter hodet sakte. Øynene hans er som to gamle Aventinus-flasker. «Hva vil du??» Det samme spørsmålet han stilte i Antwerpen for et år siden. Mücklus ber høflig om å snakke om <em>«lagring»</em>. Gossa-Peter våkner litt opp. «Lagring? Det er kunst. Det er livet.» Han forteller villig om sin lagrings-besettelse — og om en ny avtale han nylig har inngått.', next: 1 },
          { text: 'Spør verten i Hofbräuhaus om Gossa-Peter', consequence: 'Verten gnir hendene tørt på sin hvite forklær. «Den der mannen har vært her hver kveld i fem måneder. Han betaler kontant. Han bestiller alltid Hefeweizen. Han forsvinner i kjelleren omkring midnatt.» Verten gir Mücklus en kjellernøkkel. «Vær diskret.»', next: 1 },
          { text: 'Følg etter Gossa-Peter når han reiser seg', consequence: 'Gossa-Peter reiser seg rundt 23:30, betaler kontant, og forsvinner mot kjellertrappen. Mücklus følger på sikker avstand. Stoppet ved hver fjerde trinn for å lytte.', next: 1 }
        ]
      },
      // Steg 2
      {
        text:
          `I kjelleren under Hofbräuhaus, fjernt fra det offentlige hvelvet, er det et hemmelig <strong>lagrings-kammer</strong> som er hugget inn i grunnfjellet. Lyset er fra fakler. Veggene er kledd med hyller, og hyllene er tette med <strong>sølvkrukker fra hvert tiår siden 1850</strong>. Hver krukke har dato. Noen er tomme. De fleste er fulle.\n\nGossa-Peter står ved et alter midt i rommet. Foran ham: en spesielt stor sølvkrukke, mer ornamentert enn de andre, med messing-relieff av en gjær-vortex. Inne i den glimter <strong>Hefe-fragmentet</strong>.`,
        options: [
          { text: 'Konfrontere Gossa-Peter åpent', consequence: 'Gossa-Peter snur seg sakte. «Du... Mücklus. Lenge siden Antwerpen.» Han ler tørt. «Jeg har lagret denne for noen. Jeg har en kontrakt. Jeg er bundet av lagringsens ed.» Han trekker frem et papir.', next: 2 },
          { text: 'Bytte ut sølvkrukken med en falsk og snike seg ut', consequence: 'Mücklus har en reservekrukke i jakka — han hadde forutsett dette. I bytte legger han ned en krukke fylt med hvit kaffe og litt salt. Han glir bort med Hefe-fragmentet. Det vil ta Gossa-Peter en uke å oppdage byttet — for da har han allerede lagret kaffekrukken i 50 år.', next: 2 },
          { text: 'Distrahere Gossa-Peter med en intens debatt om Aventinus-lagring', consequence: 'Mücklus: «Tre år eller ti år? Hva er optimal lagring?» Gossa-Peter våkner. «TI ÅR! Naturligvis! Kun en idiot lagrer mindre enn ti år!» De diskuterer i en time. I løpet av debatten plukker Mücklus opp Hefe-fragmentet og putter det i lommen. Gossa-Peter merker det ikke før Mücklus er på vei opp trappen.', next: 2 }
        ]
      },
      // Steg 3
      {
        text:
          `Gossa-Peter trekker frem en gammel kontrakt. På den øverste linjen står datoen: <strong>28. april 2026</strong> — tre dager før Reinheitsgebot-Tavlen ble stjålet. Underskriften: <em>«K.L. — Bürgermeister»</em>. Klausulen: <em>«Lagre vedlagte Hefe-element i femti år. Honorar: 50.000 EUR pluss livstid-tilgang til Hofbräu-kjelleren.»</em>\n\nGossa-Peter sukker. «Jeg trodde det var en familieskatt han ville bevare. Jeg ante ikke det var en del av Reinheitsgebot. Jeg er en lagrings-mann. Ikke en kjeltring.»`,
        options: [
          { text: 'Ta bort kontrakten som bevis', consequence: 'Mücklus ruller kontrakten i en pappskall og legger den i jakka. Gossa-Peter spør forsiktig: «Får jeg fortsatt lagre... noe?» Mücklus nikker. «En Aventinus, mest sannsynlig.» Gossa-Peter ler for første gang på seks år.<br><br><strong>Ledetråd #4:</strong> Bürgermesteren har skriftlig avtale om lagring av Hefe-fragment, datert TRE DAGER FØR tyveriet.', next: 3 },
          { text: 'Be Gossa-Peter vitne i finalen', consequence: 'Gossa-Peter nikker dypt. «Jeg vitner. Bürgermesteren har behandlet meg som en pengeløs lager-mann. Jeg har min ære.» Han signerer en enkel erklæring og rekker den til Mücklus.<br><br><strong>Ledetråd #4:</strong> Gossa-Peter er villig til å vitne.', next: 3 },
          { text: 'Knuse alle de tomme sølvkrukkene i sinne', consequence: 'Gossa-Peter holder rundt seg selv som om han har blitt skutt. «MINE KRUKKER!! NOOOO!!!» Han faller om i lagrings-kollaps. Mücklus skammer seg dypt og blir sendt til Skumløs-Wald av sin egen samvittighet.', next: 'skumlos_1' }
        ]
      },
      // Steg 4
      {
        text:
          `Fire av seks. Mücklus von Bustenburg går opp av kjelleren med Hefe-fragmentet pakket i sjokoladepapir. Bams Brür venter med en oppdatering. «Bogenhausen. Heim E. Wernhardts villa. Han holder mottakelse i kveld. Vi har klar invitasjoner.»\n\nFortsettelse i Kapittel 6.`,
        options: []
      }
    ];

    makeRenderer(container, story).renderStep(0);
  }

  // ═══════════════════════════════════════════════════════════
  // KAPITTEL 6 — BOGENHAUSEN / FRAGMENT REINHEIT
  // ═══════════════════════════════════════════════════════════
  function runChapter6(container) {
    const story = [
      // Steg 1
      {
        text:
          `Bogenhausen — villa-strøket. <strong>Heim E. Wernhardts</strong> hus er en kvit funksjonalistisk pakke med to porter, fire flagg (Bayern, Tyskland, EU, Hofbräu) og en Geheime Braupolizei-vakt med opphøyd hake. Mottakelsen er i full gang. Et strykekvartett spiller bayrisch klassisk.\n\nMücklus von Bustenburg er kledd i Trachtenjacke med ny messing-Lederhose-knapp han har <em>plantet</em> som signatur. Bams Brür er i smoking, ber drinkene til riksmål, og sjarmerer seg gjennom døra. <strong>BSM</strong> er gartner i grønn vest med skanner skjult i en blomsterbukett.`,
        options: [
          { text: 'Sjarme verten — Frau Wernhardt — med fagsterke vitser om Maß-håndtering', consequence: 'Frau Wernhardt ler høyt og rødmer. Hun rekker Mücklus en signert kopi av sin selvbiografi <em>«Mein Leben mit Heim»</em> og forteller — kanskje uvitende — at hennes mann «driver et privat-prosjekt» fra et låst skap på kontoret. «Han kaller det «Reinheits-arkivet». Komisk navn, ikke?»', next: 1 },
          { text: 'Snik seg ut til kontoret med en gang', consequence: 'Mücklus glir gjennom korridorene. Kontoret har en tung eikedør. Den er ikke låst — det er for åpenbart. Han tar et skritt inn. På skrivebordet står en tom Schneider Aventinus, en messing-Lederhose-knapp som er identisk med den fra åstedet, og et nøkkelknippe.', next: 1 },
          { text: 'Spille piano i salongen for å skape distraksjon', consequence: 'Mücklus åpner Steinwayen og slår an «Komm, lieber Mai» i Bb-dur, men i lavt tempo og med Schlager-takt. Hele rommet stopper. Frau Wernhardt gråter. BSM utnytter rommet til å plante en mikrofon i Heim E. Wernhardts skap.', next: 1 }
        ]
      },
      // Steg 2
      {
        text:
          `Inne på kontoret står Mücklus foran et messingbeslått skap merket <em>«REINHEITS-ARCHIV — STRENG VERTRAULICH»</em>. Han prøver første nøkkel. Andre. Tredje. Den sjuende åpner. Inne hviler det på fløyel: en glødende glassplate med innskriften <strong>«REINHEIT»</strong>.\n\nDøren bak ham åpner. <strong>Heim E. Wernhardt</strong> står der i full Gala-uniform med iskaldt blikk.\n\n«Aha. Mücklus von Bustenburg. <em>Lange nicht gesehen.</em>»`,
        options: [
          { text: 'Trekke en flaske Aventinus og true med å skvulpe (gammel taktikk)', consequence: 'Wernhardt holder hånda frem. «Stopp. Mücklus. Hør på meg. Jeg skvulpet jeg ble for et år siden, og jeg har fortsatt ikke fått ut flekken. Men hør: jeg er ikke tyven. Jeg er en undersøker. Jeg samler bevis.»', next: 2 },
          { text: 'Late som han bare lette etter toaletter', consequence: 'Wernhardt ler kort. «Toalettet er på den andre siden av huset, Mücklus. Jeg vet du leter etter Reinheit-fragmentet. La meg fortelle deg sannheten — det er ikke det du tror.»', next: 2 },
          { text: 'Ta fragmentet og løpe', consequence: 'Mücklus napper plata og spurter mot vinduet. Wernhardt lar ham gå — og roper bak ham: «DET ER EN AVLEDNING! DEN ÆKTE LIGGER UNDER AUGUSTINER-KELLER!» Mücklus stopper i karmen.', next: 2 }
        ]
      },
      // Steg 3
      {
        text:
          `Heim E. Wernhardt setter seg ned bak skrivebordet og åpner et skapdokument. «Hør, Mücklus. Reinheits-fragmentet i mitt skap er en <strong>kopi av høy kvalitet</strong>. Jeg fikk lage den for å lokke tyven til meg. Den ekte ligger gjemt i kjelleren under Augustiner-Keller, og bare én person har nøkkelen til den kjelleren — Bürgermeister Klaus Lederhausen.»\n\nHan rekker Mücklus en mappe. «Jeg har samlet bevis i fire måneder. Jeg vet hvem tyven er. Jeg har bare ikke kunnet handle uten en annen Bierinspektor som vitne. Du er den vitnesbyrden. La oss gjøre dette sammen.»`,
        options: [
          { text: 'Inngå allianse med Heim E. Wernhardt', consequence: 'Mücklus håndhilser. Heim E. trekker frem en ekte Edelstoff fra kjølemini-baren. De skåler. Heim E. gir Mücklus den falske Reinheits-plata (som ikke er ubrukelig — den fungerer som «matchende lokkemiddel»), pluss kjellernøkkelen til Augustiner-Keller. <br><br><strong>Ledetråd #5:</strong> Tyvens nøkkel er Bürgermesterens — han er den eneste med tilgang til Augustiner-kjelleren.', next: 3 },
          { text: 'Tvile på Wernhardt — kanskje dette er et nytt nivå av lurendreieri', consequence: 'Mücklus krever bevis. Wernhardt åpner mappa: foto, telefonlogg, Lederhose-knappkatalog. Alt peker mot én mann. Mücklus blir overbevist. Han mottar nøkkelen til Augustiner-kjelleren.<br><br><strong>Ledetråd #5:</strong> Heim E. Wernhardt har omfattende mappe på den ekte tyven.', next: 3 },
          { text: 'Avslå alliansen og ta begge fragmentene (falsk + ekte) selv', consequence: 'Mücklus prøver. Han kommer seg så vidt ut av huset, men uten den ekte. I bilen utenfor sitter Bürgermesterens sjåfør og ser ham. Stryker Mücklus av som amatør. <em>Skumløs-Wald-trussel</em>.', next: 'skumlos_2' }
        ]
      },
      // Steg 4
      {
        text:
          `Senere samme natt åpner Mücklus von Bustenburg den hemmelige kjellerdøra under Augustiner-Keller med Wernhardts nøkkel. Inne, i et rom på størrelse med en dybde-skranke, ligger den <strong>ekte Reinheit-plata</strong> på en sokkel. Han plukker den opp. Den er varm. Han har nå <strong>fem av seks fragmenter</strong>.\n\nLommen vibrerer. Ukjent nummer. Mücklus tar den. Det er Bürgermesteren. «Mücklus! Hvordan går det? Du har vel funnet alle fragmentene? Vi nærmer oss målet, ikke sant?» Stemmen er glatt som spillolje.\n\nFortsettelse i Kapittel 7.`,
        options: []
      }
    ];

    makeRenderer(container, story).renderStep(0);
  }

  // ═══════════════════════════════════════════════════════════
  // KAPITTEL 7 — THERESIENWIESE / FRAGMENT BIEREHRE
  // ═══════════════════════════════════════════════════════════
  function runChapter7(container) {
    const story = [
      // Steg 1
      {
        text:
          `<strong>Theresienwiese, 30. september 2026.</strong> Dagen før Oktoberfest-åpningen. Det er arrangørenes natt — pre-show, sound-check, riggemester-helvete. Inne på <strong>Hacker-Festzelt</strong> tester <strong>DJ Dock-Vater</strong> (Höyvind Hund, broren til Tore Hund) sound-anlegget. På bordet hans, midt mellom platespillerne, står et glassbeger med skinnende kant — <em>«Bierehre»</em>-glasset.\n\nMücklus von Bustenburg snor seg gjennom backstage-vakthold. Han får uventet hjelp av <strong>Han Som Ligner på Türken Som Ligner på Mace</strong>, ikledd full tysk landslagsdrakt fra 1990 og med en VIP-pass på halsen. Han nikker stille — uten å si sitt namn — og åpner døra til DJ-pulten.`,
        options: [
          { text: 'Stjele glassbegeret når DJ Dock-Vater snur ryggen', consequence: 'Mücklus napper det. Det er for lett. Han åpner det og finner... en plast-glassbiter med teksten «WALMART HAMBURG 2024». Det er en falsk. DJ Dock-Vater snur seg og smiler. «Du tok lokkemiddelet, ja. Den ekte er gjemt under DJ-pulten. Sett deg.»', next: 1 },
          { text: 'Konfrontere DJ Dock-Vater direkte', consequence: 'DJ Dock-Vater løfter en hodetelefon. «Mücklus von Bustenburg. Jeg har forventet deg.» Han senker volumet på Schlager-jingelen. «Sett deg. Vi har noe å snakke om.»', next: 1 },
          { text: 'Utfordre ham til en plate-duell først', consequence: 'DJ Dock-Vater løfter et øyenbryn. «Plate-duell? Du må ha en god plate, Mücklus.» Mücklus rekker frem en uåpnet vinyl-utgave av Helene Fischer-coveret av «Atemlos». DJ Dock-Vater hyler av latter. «Du er en mann med ære. La oss spille.» (Han taper, men gir Mücklus respekt.)', next: 1 }
        ]
      },
      // Steg 2
      {
        text:
          `DJ Dock-Vater henter ut en flaske Hofbräu Maibock fra ishylla og åpner to. «Det er én ting du må vite, Mücklus. Jeg er ikke tyven. Jeg ble <strong>betalt for å være lokkemiddel</strong> — for å la noen tro at jeg hadde Bierehre-fragmentet. I retur fikk jeg en BMW i7 og et VIP-pass til Oktoberfest 2026. Jeg har fanget hver eneste mistanke. Det er på tide å fortelle sannheten.»\n\nHan trekker fram en konvolutt. På den står det: <em>«Til den som lykkes med å samle alle fragmenter — fra Höyvind Hund.»</em>`,
        options: [
          { text: 'Åpne konvolutten umiddelbart', consequence: 'Inni er det tre ting:<br>★ En liste over <strong>alle som har fått messing-Lederhose-knapper</strong> i 2026 — kun ÉN person står på den.<br>★ En videoopptak fra Hofbräuhaus\' overvåkning natt til 1. mai (taggene er endret men metadata er bevart).<br>★ En personlig håndskrevet beskjed: <em>«Klaus Lederhausen er Der Klient. Bürgermesteren stjal selv tavlen. Bevisene er nok. Lykke til. — Höyvind.»</em><br><br><strong>Ledetråd #6:</strong> Bürgermesterens identitet bekreftet via tre uavhengige bevis.', next: 2 },
          { text: 'Spør hvorfor Höyvind hjelper akkurat nå', consequence: 'Höyvind Hund: «Jeg er broren til Tore Hund. Han kjempet mot Olav den Hellige. Jeg kjemper mot moderne korrupsjon. Lederhausen brukte meg. Han trodde han kunne lure en hund. Han glemte at hunder husker.»<br><br><strong>Ledetråd #6:</strong> Höyvind Hund vitner mot Bürgermesteren.', next: 2 },
          { text: 'Ta en plate-duell først, så snakk', consequence: 'Mücklus vinner over Höyvind med en perfekt mix av Andrea Berg, Helene Fischer og Skol-Skol-jodling. Höyvind hilser med dyp respekt. «Du er ekte. Her er beviset.» Konvolutten åpnes — alle bevis er tilstede.<br><br><strong>Ledetråd #6:</strong> Bürgermesteren bekreftet som tyv.', next: 2 }
        ]
      },
      // Steg 3
      {
        text:
          `Höyvind Hund åpner et hemmelig rom under DJ-pulten. Mellom strømkabler og en kasse Augustiner ligger den <strong>ekte Bierehre-plata</strong>. Den er varm, glødende, og har inngravert: <em>«Wer ehrt, wird geehrt.»</em>\n\nDet er tordenklang utenfor — selv om himmelen er klar. Tegn på at fragmentene er nær gjenforening.\n\nMücklus pakker det ned. Han har nå <strong>seks av seks fragmenter</strong>.`,
        options: [
          { text: 'Ringe Bürgermesteren og late som om alt går bra', consequence: 'Mücklus tar en dyp pust og ringer. Bürgermesteren svarer på første ring. «Mücklus! Hvor er du?» Mücklus, med sukkersøt stemme: «På Theresienwiese, Bürgermeister. Jeg har det siste fragmentet. Vil du møte meg i Hofbräuhauses hvelv i kveld klokka tjueen for gjenforeningsseremoni?» Bürgermesteren: «Selvsagt! Hva en triumf!»', next: 3 },
          { text: 'Sende sms til alle mistenkte: «Hvelvet, kl 21, alle vitner»', consequence: 'Mücklus sender melding til alle seks. Innen ti minutter har alle bekreftet — selv Bürgermesteren, som tror han kommer for å motta æresprisen.', next: 3 },
          { text: 'Bare gå rett til hvelvet og avslutt det selv', consequence: 'Bams Brür stopper ham. «Mücklus. Vi gjør dette riktig. Alle vitner. Det er Bayerns ære.» Mücklus nikker. Han sender meldinger.', next: 3 }
        ]
      },
      // Steg 4
      {
        text:
          `Klokka 20:55. Mücklus von Bustenburg går ned trappen til Hofbräuhauses dypeste hvelv med <strong>alle seks fragmenter</strong> i bagen. Inne i hvelvet venter de:\n\n<strong>Trond Gieske</strong> (sliter med å puste i Trachtenjakka).\n<strong>Russen-Krister</strong> (i sibirsk pelskåpe).\n<strong>Wegert Beid</strong> (skjelver av nervøsitet).\n<strong>Gossa-Peter</strong> (ser inn i en sølvkrukke).\n<strong>Heim E. Wernhardt</strong> (full Gala-uniform, holder mappa si).\n<strong>DJ Dock-Vater / Höyvind Hund</strong> (DJ-headset rundt halsen).\n<strong>Bürgermeister Klaus Lederhausen</strong> (smiler bredt).\n\nDet er showtime.\n\nFortsettelse i <strong>Kapittel 8 — Avsløringen</strong>.`,
        options: []
      }
    ];

    makeRenderer(container, story).renderStep(0);
  }

  // ═══════════════════════════════════════════════════════════
  // KAPITTEL 8 — HOFBRÄUHAUS' HVELV / AVSLØRINGEN
  // ═══════════════════════════════════════════════════════════
  function runChapter8(container) {
    const story = [
      // Steg 1 — monolog
      {
        text:
          `Hofbräuhauses dypeste hvelv. Steinveggene er våte av århundrer. Ett fakkel-bord, ett alter, ett tomt felt der Reinheitsgebot-Tavlen en gang sto. Bürgermeister Klaus Lederhausen står i full bayersk drakt med fersk Edelstoff og et glis så bredt at det ikke passer på ansiktet hans. De andre seks står langs veggen.\n\nMücklus von Bustenburg åpner bagen og legger de seks fragmentene i ring rundt det tomme feltet — Gerste, Hopfen, Wasser, Hefe, Reinheit, Bierehre. De gløder. Lufta dirrer.\n\nHan begynner.\n\n<em>«Mine herrer. Hver av dere har holdt et fragment. Hver av dere har et alibi. Men én av dere — én — har vært puppemester. Han har plassert sine medhjelpere som brikker i et spill større enn dem selv. La meg gå gjennom bevisene.»</em>`,
        options: [
          { text: 'Fortsett monologen', consequence: '<em>«Trond Gieske: gala på Bayerische Staatskanzlei med 200 vitner. Alibi.<br>Russen-Krister: kvittering datert 14. april — han ble engasjert som mellommann tre uker FØR tyveriet ble oppdaget.<br>Wegert Beid: bryllup på Paulaner-Keller med 12 vitner. Alibi.<br>Gossa-Peter: kontrakt datert 28. april — han ble engasjert som lager TRE DAGER før tyveriet.<br>Heim E. Wernhardt: hadde mistanke i fire måneder, men trengte vitne for å handle.<br>DJ Dock-Vater: betalt for å være lokkemiddel.<br>Alle har vært brikker. Ingen var hjernen.»</em>', next: 1 }
        ]
      },
      // Steg 2 — bevisrekken
      {
        text:
          `Mücklus trekker frem den lille svarte boken. Han leser sakte:\n\n<strong>1.</strong> En messing-Lederhose-knapp på åstedet — produsert av <em>én</em> skredder i Sendling. Knappen finnes i kun ett jakkeoppslag i hele München.\n<strong>2.</strong> Pepsi Max-flekker på fire forskjellige fragmenter — samme person, samme drikkevane.\n<strong>3.</strong> Lapp på åstedet: «lagre — for ettertiden» — Gossa-Peters signatur, men datert med <em>fremmed håndskrift</em>. Skrevet av oppdragsgiveren, ikke utfører.\n<strong>4.</strong> Tjenesteordrer signert «K.L.» i Wegert Beids konvolutt — datert 2. mai.\n<strong>5.</strong> Lagrings-kontrakt signert «K.L.» i Gossa-Peters arkiv — datert 28. april.\n<strong>6.</strong> Höyvind Hunds liste over messing-knapp-bærere — kun <em>ett</em> navn.\n\nHan ser opp og lar blikket gå rundt rommet.\n\n<em>«Tyven er den eneste personen som hadde tilgang til Hofbräuhauses dypeste hvelv. Den eneste som kunne plassere moler i bryggerier. Den eneste som hadde nøkkelen til Augustiner-Kellers hemmelige kjeller. Den eneste som kunne hente Mücklus von Bustenburg ut av Skumløs-Wald.»</em>\n\nMücklus tar en pause. Stemningen er som en tørr Aventinus.\n\n<em>«Velg, herrer. Hvem er tyven?»</em>`,
        options: [
          { text: 'Pek på TROND GIESKE', consequence: 'Galt valg. Trond Gieske blir overrasket og forsvarer seg med 200 gala-vitner. Mücklus mister troverdighet. Bürgermesteren ler hjertelig. Skumløs-Wald.', next: 'skumlos_1' },
          { text: 'Pek på RUSSEN-KRISTER', consequence: 'Galt valg. Russen-Krister fremlegger kvitteringen som beviser han var middleman, ikke hjerne. Mücklus mister troverdighet. Skumløs-Wald.', next: 'skumlos_1' },
          { text: 'Pek på WEGERT BEID', consequence: 'Galt valg. Wegert Beid har bryllups-alibi med 12 vitner og videoarkiv. Mücklus mister troverdighet. Skumløs-Wald.', next: 'skumlos_1' },
          { text: 'Pek på GOSSA-PETER', consequence: 'Galt valg. Gossa-Peter fremlegger kontrakten som beviser han ble engasjert tre dager før tyveriet — han var ikke planleggeren. Skumløs-Wald.', next: 'skumlos_1' },
          { text: 'Pek på HEIM E. WERNHARDT', consequence: 'Galt valg. Heim E. Wernhardt åpner mappa si med fire måneders etterforskning av Bürgermesteren. Mücklus innser han har tatt feil. Skumløs-Wald.', next: 'skumlos_1' },
          { text: 'Pek på DJ DOCK-VATER (HÖYVIND HUND)', consequence: 'Galt valg. Höyvind Hund rekker frem konvolutten han ga Mücklus på Theresienwiese. «Jeg ga deg bevisene. Hvorfor pekte du på meg?» Mücklus innser feilen. Skumløs-Wald.', next: 'skumlos_1' },
          { text: 'Pek på BÜRGERMEISTER KLAUS LEDERHAUSEN', consequence: 'Riktig valg. Bürgermesteren mister smilet. Han forsøker å rygge mot kjellertrappen, men Bams Brür og BSM blokkerer. Heim E. Wernhardt trekker fram håndjern. Trond Gieske drikker hele Edelstoffen sin på ett trekk av lettelse.', next: 2 }
        ]
      },
      // Steg 3 — tilståelse
      {
        text:
          `Bürgermeister Klaus Lederhausen sukker dypt. Han retter seg opp, smaker en siste slurk Edelstoff, og smiler tørt.\n\n<em>«Bra, Mücklus. Bra. Jeg innrømmer det. Jeg planla det hele.»</em>\n\nHan forteller:\n\n«Augustiner-bryggeriet hadde nektet å bidra til min gjenvalgskampanje. Jeg trengte forhandlingskort. Hva er bedre enn å holde Reinheitsgebot-Tavlen i pant? Hvis Augustiner ikke åpnet pengesekken, ville jeg lekke at <em>de</em> stjal den. De ville bli hengt ut i Süddeutsche Zeitung og miste alle sine fans.»\n\n«Du var avledningen, Mücklus. Den uimotståelige helten. Pressen ville være opptatt med deg mens jeg forhandlet. Men jeg gjorde én feil.»\n\n«Jeg undervurderte din faglige stand.»\n\nHan ser opp på Mücklus og venter dommen.`,
        options: [
          { text: 'Bannlys ham til SKUMLØS-WALD for evig tid', consequence: 'Mücklus peker på kjellertrappen. Bams Brür og BSM eskorterer Bürgermesteren ut av bygningen. Et lys-fenomen oppstår over Marienplatz. Bürgermesteren forsvinner i en sky av lunken Hansa-damp. Skumløs-Wald har fått sin nyeste fange.', next: 'win', 'epilog': 'bannlyst' },
          { text: 'Send ham til PAULANER-KELLER (poetisk hevn — Wegert Beids gamle skjebne)', consequence: 'Mücklus peker på Paulaner-spjeldet. Wegert Beid smiler for første gang på fem år. Bürgermesteren blir eskortert ut og innsatt i en evig Stammtisch på Paulaner-Keller, hvor han må drikke arbeids-Salvator i 2,4 % styrke til evig tid.', next: 'win' },
          { text: 'Tilgi ham hvis han avgår øyeblikkelig og skjenker en runde Edelstoff', consequence: 'Bürgermesteren signerer avgangsbrevet på stedet, og betaler en runde Augustiner Edelstoff til alle i hvelvet. Han forsvinner ut av politikken og åpner senere et lite biergarten i Garmisch hvor han bare serverer Hofbräu Original til turister. Mild, men rettferdig dom.', next: 'win' }
        ]
      },
      // Steg 4 — gjenforening og epilog
      {
        text:
          `Mücklus von Bustenburg legger fragmentene på alteret én etter én — Gerste, Hopfen, Wasser, Hefe, Reinheit, Bierehre. De smelter sammen i et gyllent lys. <strong>Reinheitsgebot-Tavlen</strong> reformer seg på sin sokkel, hel igjen. Hofbräuhausen rister forsiktig — som om den slipper ut et seks måneders gammelt sukk.\n\nFra hvelvtaket faller noe glødende ned i Mücklus\' hender. Det er <strong>Den Goldene Maßkrug von König Ludwig</strong>, som har ligget gjemt under Hofbräuhaus i ett år, frigjort av tavlens gjenforening. Den fyller seg selv med iskald Augustiner Edelstoff.\n\n<em>«Bayerns ære er reddet. Oktoberfest 2026 åpner i morgen. Du, Mücklus von Bustenburg, er herved utnevnt til Generalbierinspektor av Ministerium für Biersicherheit. Det er ditt nye namn.»</em>\n\nHeim E. Wernhardt salutterer. Wegert Beid gråter. Gossa-Peter har allerede begynt å lagre fragmentenes sveise-merker for ettertiden. Russen-Krister åpner en flaske vodka. Trond Gieske SMS\'er sin agent for å booke pressekonferanse. Höyvind Hund spiller «Skol! Skol!» fra mobiltelefonen.\n\nDe drar opp til den offentlige salen. Det er åtti og fjerde Ein Prosit i kveld. Mücklus løfter Goldenen Maßkrug. Et helt München skåler tilbake.\n\n<em>«Ein Prosit, ein Prosit, der Gemütlichkeit!»</em>\n\nMisjonen er fullført. Eller er den? Skumløs-Walds trollmann er fortsatt på frifot — men det er en historie for et annet kapittel.`,
        options: [
          { text: '★ AVSLUTT MED ÆRE ★', consequence: 'Mücklus von Bustenburg, Generalbierinspektor av Bayern, går mot Oktoberfest med Goldenen Maßkrug i hånda og Bams Brür ved sin side. Solen står opp over Theresienwiese. Det er 1. oktober 2026.', next: 'win' }
        ]
      }
    ];

    makeRenderer(container, story).renderStep(0);
  }

  // ═══════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════
  window.startRPG = startRPG;
  window.returnRPGToMenu = returnToMenu;

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
