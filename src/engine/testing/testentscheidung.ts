import type { EntscheidungsDefinition } from '../entscheidungsregister';
import { mitspielerImUhrzeigersinn, spielerIndexVon } from '../zugablauf';
import { verlangeEntscheidung } from '../reaktion';
import { deckeAuf, zieheVomStapel } from '../stapel';
import type { Spielzustand } from '../types';

/*
Test-Entscheidungen für den Rahmen aus X3: Mit ihnen prüfen Tests und der
Entwicklertisch den Entscheidungsablauf, bevor Comeback, Risiko-Belohnung und
Schlangenkorb echte Entscheidungen bringen (X4 bis X6). Sie sind keine Regel
des Spiels und stehen deshalb nicht im Entscheidungsregister, bis ein Test oder
der Entwicklertisch sie einträgt.

Der Ablauf ahmt den Misserfolg einer Risiko-Aktion nach (A8.2, D52): Eine Karte
wird offen aufgedeckt, der Spieler am Zug wählt frei einen Gegner, und dieser
wählt, ob er die aufgedeckte Karte nimmt oder die oberste Stapelkarte zieht.
*/

export const TEST_GEGNERWAHL = 'Test: Gegner wählen';
export const TEST_KARTENWAHL = 'Test: Karte wählen';

/** Der Spieler am Zug wählt einen Gegner (Optionen: dessen Id); der entscheidet danach über die aufgedeckte Karte. */
const GEGNERWAHL: EntscheidungsDefinition = {
  art: TEST_GEGNERWAHL,
  loese(zustand, entscheidung, wahl) {
    verlangeEntscheidung(zustand, {
      art: TEST_KARTENWAHL,
      karteId: entscheidung.karteId,
      entscheider: spielerIndexVon(zustand, wahl),
      ausgeloestVon: entscheidung.ausgeloestVon,
      optionen: ['aufgedeckte', 'stapel'],
      daten: {},
    });
    return zustand;
  },
};

/** „aufgedeckte“: Die aufgedeckte Karte kommt auf seine Hand. „stapel“: Er zieht die oberste Stapelkarte, die aufgedeckte geht auf den Ablagestapel des Auslösers. */
const KARTENWAHL: EntscheidungsDefinition = {
  art: TEST_KARTENWAHL,
  loese(zustand, entscheidung, wahl) {
    const aufgedeckt = zustand.aufgedeckt.splice(0);
    if (wahl === 'aufgedeckte') {
      zustand.spieler[entscheidung.entscheider].hand.push(...aufgedeckt);
    } else {
      zustand.spieler[entscheidung.ausgeloestVon].ablagestapel.push(...aufgedeckt);
      zieheVomStapel(zustand, entscheidung.entscheider, 1);
    }
    return zustand;
  },
};

export const TESTENTSCHEIDUNGEN: readonly EntscheidungsDefinition[] = [GEGNERWAHL, KARTENWAHL];

/** Deckt die oberste Karte auf und verlangt vom Spieler `spielerIndex` die Wahl eines Gegners; `karteId` ist die auslösende Karte. */
export function verlangeTestwahl(zustand: Spielzustand, spielerIndex: number, karteId: string): void {
  if (deckeAuf(zustand) === null) throw new Error('Testentscheidung: Der Nachziehstapel ist leer, es gibt nichts aufzudecken (D55).');
  verlangeEntscheidung(zustand, {
    art: TEST_GEGNERWAHL,
    karteId,
    entscheider: spielerIndex,
    ausgeloestVon: spielerIndex,
    optionen: mitspielerImUhrzeigersinn(zustand, spielerIndex).map((index) => zustand.spieler[index].id),
    daten: {},
  });
}
