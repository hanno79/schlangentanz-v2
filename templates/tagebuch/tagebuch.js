/* Verhalten der Tagebuchseiten. Ohne Bibliothek, ohne Netzzugriff.
   Ohne JavaScript bleibt alles sichtbar und ausgeklappt; hier wird nur
   ein- und ausgeblendet, nie etwas gestaltet. */
(function () {
  'use strict';

  var EINKLAPP_ZEICHEN = 700;

  function alle(wurzel, auswahl) {
    return Array.prototype.slice.call(wurzel.querySelectorAll(auswahl));
  }

  /* ---------- Verlauf: Filter, Sortierung, Einklappen ---------- */

  function verlaufStarten(verlauf) {
    var zustand = { art: 'alle', kapitel: '', phase: '', suche: '' };
    var eintraege = alle(verlauf, '.eintrag');
    /* Suchtext vor dem Einklappen merken: der eingefügte Knopf
       "weiterlesen" gehört nicht zum Quelltext und darf nicht treffen. */
    var suchtexte = eintraege.map(function (e) {
      return e.textContent.toLowerCase();
    });
    var phasen = alle(verlauf, '[data-phase]');
    var artKnoepfe = alle(document, '[data-art]').filter(function (k) {
      return k.tagName === 'BUTTON';
    });
    var treffer = document.querySelector('[data-treffer]');

    function passt(eintrag) {
      if (zustand.art !== 'alle' && eintrag.dataset.art !== zustand.art) {
        return false;
      }
      if (zustand.kapitel &&
          (eintrag.dataset.kapitel || '').split(' ').indexOf(zustand.kapitel) < 0) {
        return false;
      }
      var phase = eintrag.closest('[data-phase]');
      if (zustand.phase && (!phase || phase.dataset.phase !== zustand.phase)) {
        return false;
      }
      return !zustand.suche ||
        suchtexte[eintraege.indexOf(eintrag)].indexOf(zustand.suche) >= 0;
    }

    function anwenden() {
      var sichtbar = 0;
      eintraege.forEach(function (eintrag) {
        var zeigen = passt(eintrag);
        eintrag.hidden = !zeigen;
        if (zeigen) { sichtbar += 1; }
      });
      phasen.forEach(function (phase) {
        var zahl = alle(phase, '.eintrag').filter(function (e) {
          return !e.hidden;
        }).length;
        phase.hidden = zahl === 0;
        var zaehler = phase.querySelector('[data-phase-anzahl]');
        if (zaehler) { zaehler.textContent = String(zahl); }
      });
      if (treffer) {
        treffer.textContent = sichtbar + (sichtbar === 1 ? ' Eintrag' : ' Einträge');
      }
    }

    artKnoepfe.forEach(function (knopf) {
      knopf.addEventListener('click', function () {
        zustand.art = knopf.dataset.art;
        artKnoepfe.forEach(function (k) {
          k.classList.toggle('aktiv', k === knopf);
          k.setAttribute('aria-pressed', k === knopf ? 'true' : 'false');
        });
        anwenden();
      });
    });

    alle(document, 'select[data-filter]').forEach(function (auswahl) {
      auswahl.addEventListener('change', function () {
        zustand[auswahl.dataset.filter] = auswahl.value;
        anwenden();
      });
    });

    var suche = document.querySelector('[data-suche]');
    if (suche) {
      suche.addEventListener('input', function () {
        zustand.suche = suche.value.trim().toLowerCase();
        anwenden();
      });
    }

    var sortierung = document.querySelector('[data-sortierung]');
    if (sortierung) {
      sortierung.addEventListener('click', function () {
        /* Ein Umschalter: die Beschriftung bleibt "Älteste zuerst",
           aria-pressed sagt, ob es gerade gilt. */
        var aufsteigend = sortierung.dataset.sortierung === 'absteigend';
        sortierung.dataset.sortierung = aufsteigend ? 'aufsteigend' : 'absteigend';
        sortierung.setAttribute('aria-pressed', aufsteigend ? 'true' : 'false');
        /* Die Reihenfolge im DOM umkehren; die Phasen behalten ihren Index. */
        phasen.slice().reverse().forEach(function (phase) {
          verlauf.appendChild(phase);
        });
        phasen.forEach(function (phase) {
          alle(phase, '.eintrag').reverse().forEach(function (eintrag) {
            phase.appendChild(eintrag);
          });
        });
        phasen.reverse();
      });
    }

    eintraege.forEach(einklappen);
    anwenden();
    zumAnkerOeffnen();
    window.addEventListener('hashchange', zumAnkerOeffnen);
  }

  /* Entscheidungen zeigen ihre vier Felder und Sackgassen ihre Folge immer
     ganz; eingeklappt verschwänden Gewählt, Begründung und Folge. */
  var NIE_EINKLAPPEN = ['entscheidung', 'sackgasse'];

  function einklappen(eintrag) {
    if (NIE_EINKLAPPEN.indexOf(eintrag.dataset.art) >= 0) { return; }
    var text = eintrag.querySelector('.eintragstext');
    if (!text || text.textContent.length <= EINKLAPP_ZEICHEN) { return; }
    var knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'weiterlesen';
    knopf.textContent = 'weiterlesen';
    knopf.setAttribute('aria-expanded', 'false');
    eintrag.classList.add('eingeklappt');
    text.insertAdjacentElement('afterend', knopf);
    knopf.addEventListener('click', function () {
      var zu = eintrag.classList.toggle('eingeklappt');
      knopf.textContent = zu ? 'weiterlesen' : 'weniger';
      knopf.setAttribute('aria-expanded', zu ? 'false' : 'true');
    });
  }

  /* Ein Sprung auf #e-… soll nie in einem eingeklappten Eintrag landen. */
  function zumAnkerOeffnen() {
    if (!window.location.hash) { return; }
    var ziel = document.getElementById(window.location.hash.slice(1));
    if (!ziel || !ziel.classList.contains('eingeklappt')) { return; }
    var knopf = ziel.querySelector('.weiterlesen');
    if (knopf) { knopf.click(); }
  }

  /* ---------- Carousel ---------- */

  function carouselStarten(carousel) {
    var folien = alle(carousel, '.folie');
    if (folien.length === 0) { return; }
    var aktuell = 0;
    var punkte = document.createElement('div');
    punkte.className = 'punkte';
    var punktKnoepfe = folien.map(function (folie, index) {
      var punkt = document.createElement('button');
      punkt.type = 'button';
      punkt.className = 'punkt';
      punkt.setAttribute('aria-label', 'Abbildung ' + (index + 1));
      punkt.addEventListener('click', function () { zeigen(index); });
      punkte.appendChild(punkt);
      return punkt;
    });
    carousel.appendChild(punkte);

    function zeigen(index) {
      aktuell = (index + folien.length) % folien.length;
      folien.forEach(function (folie, i) { folie.hidden = i !== aktuell; });
      punktKnoepfe.forEach(function (punkt, i) {
        punkt.classList.toggle('aktiv', i === aktuell);
      });
    }

    var zurueck = carousel.querySelector('[data-zurueck]');
    var weiter = carousel.querySelector('[data-weiter]');
    if (zurueck) { zurueck.addEventListener('click', function () { zeigen(aktuell - 1); }); }
    if (weiter) { weiter.addEventListener('click', function () { zeigen(aktuell + 1); }); }
    carousel.tabIndex = 0;
    carousel.setAttribute('aria-roledescription', 'Carousel');
    carousel.setAttribute('aria-label', 'Abbildungen, mit Pfeiltasten blättern');
    /* Lag der Fokus auf der Folie, die jetzt verborgen ist, fiele er auf
       <body> und weitere Pfeiltasten gingen ins Leere. Er wandert deshalb auf
       das Bild der neuen Folie, bei einer Tabelle auf das Carousel selbst. */
    function blaettern(schritt) {
      var vorher = document.activeElement;
      zeigen(aktuell + schritt);
      var folie = vorher ? vorher.closest('.folie') : null;
      if (!folie || !folie.hidden) { return; }
      var bild = folien[aktuell].querySelector('img');
      if (bild) { bild.focus(); }
      if (document.activeElement !== bild) { carousel.focus(); }
    }

    carousel.addEventListener('keydown', function (ereignis) {
      /* Bei offener Vergrösserung blättert nur diese. */
      if (document.documentElement.classList.contains('lightbox-offen')) { return; }
      if (ereignis.key === 'ArrowLeft') {
        ereignis.preventDefault();
        blaettern(-1);
      } else if (ereignis.key === 'ArrowRight') {
        ereignis.preventDefault();
        blaettern(1);
      }
    });
    zeigen(0);
  }

  /* ---------- Vergrösserung ---------- */

  function lightboxStarten() {
    var bilder = alle(document, '[data-lightbox] img, figure img');
    if (bilder.length === 0) { return; }
    var huelle = document.createElement('div');
    huelle.className = 'lightbox';
    huelle.hidden = true;
    huelle.setAttribute('role', 'dialog');
    huelle.setAttribute('aria-modal', 'true');
    huelle.setAttribute('aria-label', 'Abbildung vergrössert');
    huelle.innerHTML =
      '<button type="button" class="schliessen" aria-label="Schliessen">&times;</button>' +
      '<button type="button" class="zurueck" aria-label="Zurück">&lsaquo;</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="weiter" aria-label="Weiter">&rsaquo;</button>';
    document.body.appendChild(huelle);
    var grossbild = huelle.querySelector('img');
    var beschriftung = huelle.querySelector('figcaption');
    var knoepfe = alle(huelle, 'button');
    var schliessKnopf = huelle.querySelector('.schliessen');
    var gruppe = bilder;
    var position = 0;
    var ausloeser = null;

    function zeigen(index) {
      position = (index + gruppe.length) % gruppe.length;
      var bild = gruppe[position];
      grossbild.src = bild.src;
      grossbild.alt = bild.alt;
      var figur = bild.closest('figure');
      var unterschrift = figur ? figur.querySelector('figcaption') : null;
      beschriftung.textContent = unterschrift ? unterschrift.textContent : bild.alt;
    }

    /* Der Fokus wandert in die Vergrösserung und beim Schliessen zurück
       auf das Bild, von dem aus sie geöffnet wurde. */
    function oeffnen(bild) {
      var behaelter = bild.closest('[data-lightbox]');
      gruppe = behaelter ? alle(behaelter, 'img') : bilder;
      ausloeser = bild;
      huelle.hidden = false;
      document.documentElement.classList.add('lightbox-offen');
      zeigen(gruppe.indexOf(bild));
      schliessKnopf.focus();
    }

    function schliessen() {
      huelle.hidden = true;
      document.documentElement.classList.remove('lightbox-offen');
      if (ausloeser) { ausloeser.focus(); }
    }

    /* Bilder sind per Tastatur erreichbar und öffnen mit Enter oder Leertaste. */
    bilder.forEach(function (bild) {
      bild.tabIndex = 0;
      bild.setAttribute('role', 'button');
      /* Ohne alt-Text benennt die Bildunterschrift das Bild. */
      var figur = bild.closest('figure');
      var unterschrift = figur ? figur.querySelector('figcaption') : null;
      var name = bild.alt || (unterschrift ? unterschrift.textContent : '');
      bild.setAttribute('aria-label', 'Vergrössern: ' + name);
      bild.addEventListener('click', function () { oeffnen(bild); });
      bild.addEventListener('keydown', function (ereignis) {
        if (ereignis.key === 'Enter' || ereignis.key === ' ') {
          ereignis.preventDefault();
          oeffnen(bild);
        }
      });
    });
    schliessKnopf.addEventListener('click', schliessen);
    huelle.querySelector('.zurueck').addEventListener('click', function () { zeigen(position - 1); });
    huelle.querySelector('.weiter').addEventListener('click', function () { zeigen(position + 1); });
    huelle.addEventListener('click', function (ereignis) {
      if (ereignis.target === huelle) { schliessen(); }
    });
    document.addEventListener('keydown', function (ereignis) {
      if (huelle.hidden) { return; }
      if (ereignis.key === 'Escape') {
        ereignis.preventDefault();
        schliessen();
      } else if (ereignis.key === 'ArrowLeft') {
        ereignis.preventDefault();
        zeigen(position - 1);
      } else if (ereignis.key === 'ArrowRight') {
        ereignis.preventDefault();
        zeigen(position + 1);
      } else if (ereignis.key === 'Tab') {
        /* Der Fokus bleibt in der Vergrösserung, solange sie offen ist. */
        var stelle = knoepfe.indexOf(document.activeElement);
        var schritt = ereignis.shiftKey ? -1 : 1;
        ereignis.preventDefault();
        knoepfe[(stelle + schritt + knoepfe.length) % knoepfe.length].focus();
      }
    });
  }

  function starten() {
    var verlauf = document.querySelector('[data-verlauf]');
    if (verlauf) { verlaufStarten(verlauf); }
    alle(document, '[data-carousel]').forEach(carouselStarten);
    lightboxStarten();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', starten);
  } else {
    starten();
  }
})();
