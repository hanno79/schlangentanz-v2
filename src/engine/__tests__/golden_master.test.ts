/*
Author: Claude Code
Datum: 04.08.2026
Version: 1.0
Beschreibung: Golden Master — hält einen ganzen Spielverlauf fest, nicht einzelne Regeln.

**Warum es das braucht.** Die 684 anderen Tests prüfen, was jemand als Assertion
aufgeschrieben hat. Keiner hält einen *Verlauf* fest. Beim `turnState.ts`-Split am
04.08.2026 ließ sich deshalb nur belegen, dass alle 56 Funktionsrümpfe
byte-identisch verschoben wurden — Verhaltensgleichheit war statisch erschlossen,
nicht gemessen. Für das nächste Refactoring soll das anders sein.

Dieser Test spielt zwei Partien vollständig durch und schreibt je Schritt eine
Zeile mit: Zugphase, aktiver Spieler, gewählte Aktion, Handgröße, Stapelrest und
Punktestand. Verglichen wird dieser Verlauf als Snapshot. Ändert ein Refactoring
das Verhalten irgendwo, verschiebt sich der Verlauf ab dieser Stelle — und der
Diff zeigt, *wo*.

**Warum ein Protokoll und kein Zustands-Snapshot.** Ein serialisierter
Spielzustand je Schritt wären einige Tausend Zeilen. So ein Snapshot wird bei
jeder Änderung blind bestätigt statt gelesen, und dann ist er nichts wert. Die
Zeile hier ist kurz genug, um im Diff wirklich gelesen zu werden.

**Determinismus ohne globales Patchen.** `erstelleSpielzustand` nimmt eine
`rng`-Funktion; `Math.random` steht in der Engine nur als deren Standardwert
(`state.ts`). Mit eigener RNG ist die Engine vollständig deterministisch — anders
als in den Playwright-Verträgen, die `Math.random` überschreiben müssen, weil sie
die App als Ganzes fahren.

**Warum zwei Auswahlstrategien.** Der Test soll einen Verlauf festnageln, nicht gut
spielen — deshalb keine Heuristik, sondern „immer die erste" bzw. „immer die
letzte legale Aktion". Beide sind reproduzierbar und erklärungsfrei.

Die zweite ist nicht Beiwerk: Mit „erste" öffnet sich in 391 Schritten **kein
einziges** Reaktionsfenster (gemessen), weil das jeweilige Ziel nie eine
Farbenschutzkarte hält. `reaktionsaufloesung.ts` wäre damit von diesem Test nicht
gedeckt — ausgerechnet ein Modul, das der Split vom 04.08.2026 neu geschnitten hat.
Mit „letzte" fallen je Partie 4 bis 13 Reaktionen an. Deshalb sichert der Test
unten ausdrücklich zu, dass Reaktionen **vorkommen**: Verlöre er diese Abdeckung
still, bliebe er grün und prüfte die Hälfte weniger.
*/

import { describe, expect, it } from 'vitest';
import { erstelleSpielzustand } from '../state';
import {
  beendeAufgabenpruefung,
  beendeAusspielphase,
  beendeZug,
  starteAusspielphase,
  werfeUeberzaehligeHandkartenAb,
} from '../turnState';
import { anwendeAktion, ermittleLegaleAktionen, ermittleReaktionsAktionen } from '../legalActions';
import type { SpielAktion } from '../legalActions';
import { berechneSpielzustandGesamtwertung } from '../scoring';
import { ueberhandAbwurfKartenIds, ueberhandAnzahl } from '../ueberhand';
import type { Spielzustand } from '../types';

/**
 * Deterministische RNG (Lehmer/Park-Miller). Bewusst kein konstanter Wert: Eine
 * RNG, die immer dasselbe liefert, mischt das Deck nicht und prüft damit einen
 * Sonderfall statt einer Partie.
 */
function festeRng(saat: number): () => number {
  let zustand = saat % 2147483647;
  if (zustand <= 0) zustand += 2147483646;
  return () => {
    zustand = (zustand * 16807) % 2147483647;
    return (zustand - 1) / 2147483646;
  };
}

/* Obergrenze gegen eine Endlosschleife: Der Test soll fehlschlagen, nicht hängen.
   Gemessen braucht eine Partie unter 400 Schritte; die Grenze ist Fangnetz, nicht
   Erwartung. */
const SCHRITT_OBERGRENZE = 3000;

/** Welche der angebotenen Aktionen genommen wird. Keine Heuristik, siehe Dateikopf. */
type Auswahl = (aktionen: SpielAktion[]) => SpielAktion;

const ERSTE: Auswahl = (aktionen) => aktionen[0];
const LETZTE: Auswahl = (aktionen) => aktionen[aktionen.length - 1];

function punktestand(zustand: Spielzustand): string {
  return berechneSpielzustandGesamtwertung(zustand)
    .spielerwertungen.map((eintrag) => eintrag.gesamtPunkte)
    .join('/');
}

function aktionsKennung(aktion: SpielAktion): string {
  /* Nur Engine-Daten, kein UI-Label: `src/aktionsLabel.ts` formuliert für
     Menschen und darf sich ändern, ohne dass ein Engine-Verlauf sich ändert.

     ÄNDERUNG [04.08.2026]: `JSON.stringify` statt `String`, Schlüssel sortiert —
     aus dem CodeRabbit-Review zu PR #6, und der Fund war echt. `String(wert)`
     ergab für das `ziele`-Array von `SchlangenfrassSpielen` schlicht
     `[object Object]`; im ersten Snapshot stand das **zwölfmal**. Verschiedene
     Frass-Ziele sahen damit identisch aus, und eine Regeländerung, die andere
     Ziele wählt, wäre unbemerkt durchgelaufen — genau das, was dieser Test
     verhindern soll.

     Die Sortierung nimmt der Kennung zusätzlich die Abhängigkeit von der
     Reihenfolge, in der die Engine die Felder anlegt: Sonst verschiebt ein
     umgestelltes Objektliteral den Snapshot, ohne dass sich Verhalten ändert. */
  const felder = Object.entries(aktion)
    .filter(([schluessel]) => schluessel !== 'typ' && schluessel !== 'spielerId')
    .sort(([a], [b]) => a.localeCompare(b))
    // Zeichenketten bleiben nackt — mit Anführungszeichen wäre jede Zeile lauter,
    // ohne etwas zu unterscheiden. Alles andere geht durch JSON.
    .map(([schluessel, wert]) => `${schluessel}=${typeof wert === 'string' ? wert : JSON.stringify(wert)}`)
    .join(' ');
  return felder === '' ? aktion.typ : `${aktion.typ} ${felder}`;
}

/**
 * Fährt eine Partie bis zum Ende und protokolliert jeden Schritt.
 *
 * Der Fahrer entspricht dem, was die Oberfläche tut (`usePartie.ts`): In der
 * Ausspielphase eine Aktion wählen, im Reaktionsfenster eine Reaktion, sonst die
 * Phase weiterschalten. Überzählige Karten gehen nach `ueberhandAbwurfKartenIds`
 * weg — dieselbe Vorauswahl, die die Oberfläche als Rückfall benutzt.
 */
function spieleDurch(
  anzahlSpieler: number,
  saat: number,
  waehle: Auswahl,
): { protokoll: string[]; zustand: Spielzustand; reaktionen: number } {
  let zustand = erstelleSpielzustand(anzahlSpieler, festeRng(saat));
  const protokoll: string[] = [];
  let schritte = 0;
  let reaktionen = 0;

  while (zustand.spielphase !== 'Beendet' && schritte < SCHRITT_OBERGRENZE) {
    schritte += 1;
    const vorher = zustand;
    let was: string;

    if (zustand.pendingReaktion !== null) {
      const moeglich = ermittleReaktionsAktionen(zustand);
      if (moeglich.length === 0) {
        throw new Error('Reaktionsfenster offen, aber keine Reaktion möglich — die Partie steckt fest.');
      }
      const gewaehlt = waehle(moeglich);
      reaktionen += 1;
      was = `reagiere ${aktionsKennung(gewaehlt)}`;
      zustand = anwendeAktion(zustand, gewaehlt);
    } else if (zustand.zugphase === 'Nachziehphase') {
      was = 'starteAusspielphase';
      zustand = starteAusspielphase(zustand);
    } else if (zustand.zugphase === 'Ausspielphase') {
      const aktionen = ermittleLegaleAktionen(zustand);
      if (aktionen.length > 0) {
        const gewaehlt = waehle(aktionen);
        was = aktionsKennung(gewaehlt);
        zustand = anwendeAktion(zustand, gewaehlt);
      } else if (zustand.zugpflichten.gespielteKarten === 0) {
        /* Hier stand ein handgebauter Pflicht-Abwurf. Er war falsch, gefunden im
           Codex-Review (Gate 7): `ermittleLegaleAktionen` bietet den
           Pflicht-Abwurf **selbst** an, wenn er zulässig ist
           (`legalActions.ts:1118`) — er kommt also über `waehle(aktionen)` oben
           herein. Bleibt die Liste trotzdem leer und ist noch keine Karte
           gespielt, liegt einer von drei Fällen vor, und in keinem davon darf
           abgeworfen werden: leere Hand, Kartenlimit erreicht, oder eine nicht
           enumerierte Schlangenhäutung ist möglich — bei der ist der
           Pflicht-Abwurf ausdrücklich gesperrt (`ÄNDERUNG [07.06.2026]` in
           `legalActions.ts`). Der eigene Zweig hätte genau diese Sperre umgangen
           und einen Verlauf festgenagelt, den ein Spieler nie erreicht.

           Die Häutung braucht Eingaben, die nur der `Haeutungseditor` liefert;
           dieser Fahrer kann sie nicht bedienen. Deshalb hier abbrechen statt
           schweigend etwas anderes zu tun. Die drei gewählten Fälle erreichen
           diesen Punkt nicht. */
        throw new Error(
          `Schritt ${schritte}: keine legale Aktion und noch keine Karte gespielt. ` +
            'Erreicht wurde ein Pfad, den dieser Fahrer nicht bedienen kann (vermutlich ' +
            'nicht enumerierte Schlangenhäutung). Andere Saat wählen oder den Fahrer erweitern.',
        );
      } else {
        was = 'beendeAusspielphase';
        zustand = beendeAusspielphase(zustand);
      }
    } else if (zustand.zugphase === 'Aufgabenpruefung') {
      /* `aufgabenGeprueft` ist eine Zusage des Aufrufers, kein eigener
         Engine-Schritt — dieselbe Stelle wie in `usePartie.ts`. */
      was = 'beendeAufgabenpruefung';
      zustand = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });
    } else if (zustand.zugphase === 'Zugabschluss') {
      const ueberzaehlig = ueberhandAnzahl(zustand);
      if (ueberzaehlig > 0) {
        /* `ueberhandAbwurfKartenIds` ist der Fallback, den auch die Oberfläche und
           die KI benutzen — **nicht** die menschliche Auswahl nach R2.5. Welche
           Karten ein Mensch über dem Limit abgibt, ist seine Entscheidung; dieser
           Verlauf nagelt deshalb den Fallback fest, nicht jede mögliche Wahl.
           Benannt im Codex-Review (Gate 7). */
        const kartenIds = ueberhandAbwurfKartenIds(zustand);
        was = `wirf ${ueberzaehlig} ab`;
        zustand = werfeUeberzaehligeHandkartenAb(zustand, { kartenIds });
      } else {
        was = 'beendeZug';
        zustand = beendeZug(zustand, { pflichtenErfuellt: true });
      }
    } else {
      throw new Error(`Unerwartete Zugphase im Golden Master: ${zustand.zugphase}`);
    }

    if (zustand === vorher) {
      throw new Error(`Schritt ${schritte} (${was}) hat den Zustand nicht verändert — Endlosschleife.`);
    }

    const spieler = zustand.spieler[zustand.aktiverSpielerIndex];
    protokoll.push(
      [
        String(schritte).padStart(3, '0'),
        zustand.spielphase,
        zustand.zugphase,
        `S${zustand.aktiverSpielerIndex}`,
        was,
        `hand=${spieler.hand.length}`,
        `stapel=${zustand.nachziehstapel.length}`,
        `punkte=${punktestand(zustand)}`,
      ].join(' | '),
    );
  }

  if (schritte >= SCHRITT_OBERGRENZE) {
    throw new Error(`Partie war nach ${SCHRITT_OBERGRENZE} Schritten nicht beendet.`);
  }

  return { protokoll, zustand, reaktionen };
}

/*
Die Fälle. „erste" fährt den geraden Weg ohne Reaktionen, „letzte" erzwingt sie —
zusammen decken sie beide Hälften. Die Saaten sind gemessen ausgewählt: Nicht jede
Kombination endet, und mit „erste" bleiben Reaktionen bei den meisten Saaten aus.
*/
const FAELLE = [
  { anzahlSpieler: 2, saat: 20260804, waehle: ERSTE, name: '2 Spieler, erste Aktion', mitReaktionen: false },
  { anzahlSpieler: 2, saat: 20260804, waehle: LETZTE, name: '2 Spieler, letzte Aktion', mitReaktionen: true },
  { anzahlSpieler: 3, saat: 42, waehle: LETZTE, name: '3 Spieler, letzte Aktion', mitReaktionen: true },
] as const;

describe('Golden Master: ein ganzer Spielverlauf, festgenagelt', () => {
  for (const fall of FAELLE) {
    describe(fall.name, () => {
      const { protokoll, zustand, reaktionen } = spieleDurch(fall.anzahlSpieler, fall.saat, fall.waehle);

      it('die Partie endet', () => {
        // Ohne diese Zusicherung könnte der Snapshot einen Abbruch festhalten.
        expect(zustand.spielphase).toBe('Beendet');
        expect(zustand.zugphase).toBe('Spielende');
        expect(protokoll.length).toBeGreaterThan(20);
      });

      if (fall.mitReaktionen) {
        it('das Reaktionsfenster kommt im Verlauf wirklich vor', () => {
          /* Die wichtigere Richtung: Fiele diese Abdeckung weg — etwa weil eine
             Regeländerung Reaktionen seltener macht —, bliebe der Snapshot grün
             und `reaktionsaufloesung.ts` wäre ungedeckt, ohne dass es auffällt. */
          expect(reaktionen).toBeGreaterThan(0);
        });
      }

      it('der Verlauf ist unverändert', () => {
        expect(protokoll.join('\n')).toMatchSnapshot();
      });
    });
  }

  it('dieselbe Saat liefert denselben Verlauf', () => {
    // Der Snapshot wäre wertlos, wenn der Lauf selbst schwankte.
    expect(spieleDurch(2, 20260804, ERSTE).protokoll).toEqual(spieleDurch(2, 20260804, ERSTE).protokoll);
  });
});
