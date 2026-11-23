import type { Ereignis } from '../aktionen/typen';
import { definitionFuerAufgabe } from '../aufgabenKarten';
import type { Spielzustand } from '../types';

/*
Der Rahmen der Aufgabenkarten (A9, A5 „Aufgabe erfüllen“, D5, D34, D35). Ob
eine Aufgabe erfüllt ist, sagt ihre Datei unter `aufgaben/`; hier steht, wann
geprüft wird und was dann geschieht.

- Nur mit Erweiterung (D34).
- Geprüft wird für den Spieler am Zug (A9), nach jeder vollständig aufgelösten
  Aktion und damit auch zu Beginn jedes Zuges, der in einer Aktion beginnt
  (`anwendeAktion`). Eine angesagte Karte, über die noch ein Betroffener
  entscheidet, ist nicht aufgelöst (A6). Nach Spielende ist niemand am Zug.
- Eine erfüllte offene Aufgabe geht an ihn, an ihren Platz kommt die oberste
  Karte des Aufgabenstapels (A9), und die wird sofort mitgeprüft, auch in einer
  Kette (D5). Ist der Stapel leer, bleibt der Platz leer (A9).
- Seine geheime Aufgabe zählt, sobald sie in seinem Zug einmal erfüllt war; das
  Spiel merkt es sich verdeckt, ohne Ereignis, und niemand kann es danach mehr
  ändern (D35, B2).

„Schlangenspass!“ ruft niemand: Die Engine erkennt die erfüllte Aufgabe selbst
und meldet sie (B2).
*/

/** Löst für den Spieler am Zug ein, was er jetzt erfüllt. Verändert `zustand` und meldet in `ereignisse`. */
export function pruefeAufgabenAmZug(zustand: Spielzustand, ereignisse: Ereignis[]): void {
  // Geprüft wird nach einer vollständig aufgelösten Aktion: nicht, solange eine Karte schwebt oder eine Entscheidung offen ist (X3).
  if (!zustand.erweiterung || zustand.schwebend !== null || zustand.entscheidung !== null || zustand.partiephase === 'Beendet') return;
  const { spielerIndex } = zustand.zug;
  const spieler = zustand.spieler[spielerIndex];

  const geheime = spieler.geheimeAufgabe;
  if (geheime !== null && !spieler.geheimeAufgabeErfuellt && definitionFuerAufgabe(geheime).istErfuellt(zustand, spielerIndex)) {
    spieler.geheimeAufgabeErfuellt = true;
  }

  let platz = 0;
  while (platz < zustand.offeneAufgaben.length) {
    const aufgabe = zustand.offeneAufgaben[platz];
    if (!definitionFuerAufgabe(aufgabe).istErfuellt(zustand, spielerIndex)) {
      platz += 1;
      continue;
    }
    spieler.erfuellteAufgaben.push(aufgabe);
    ereignisse.push({ typ: 'AufgabeErfuellt', spielerIndex, aufgabeId: aufgabe.id });
    const neue = zustand.aufgabenStapel.shift();
    if (neue === undefined) {
      zustand.offeneAufgaben.splice(platz, 1);
      ereignisse.push({ typ: 'AufgabenstapelLeer', anStelleVon: aufgabe.id });
    } else {
      // Derselbe Platz wird gleich noch einmal geprüft, jetzt mit der aufgedeckten Aufgabe (D5).
      zustand.offeneAufgaben[platz] = neue;
      ereignisse.push({ typ: 'AufgabeAufgedeckt', aufgabeId: neue.id, anStelleVon: aufgabe.id });
    }
  }
}
