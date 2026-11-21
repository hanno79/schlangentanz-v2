import { expect } from 'vitest'
import { dauerlaufPartien } from '../testing/dauerlauf'
import { erwarteGeprueftenLauf, spieleGeprueft } from './dauerlauf_pruefer'

/*
E11, Kriterium 3: der lange Dauerlauf mit 2'000 Zufallspartien, aufgeteilt in
vier Dateien `dauerlauf_teil_<n>.dauerlauf.test.ts` zu je 500 Partien, damit
Vitest sie nebeneinander rechnet. Er läuft nicht in `npm test`, sondern mit
`npm run test:dauerlauf` (Endung `.dauerlauf.test.ts`, `vite.config.ts`): Er
braucht mehrere Minuten, und `npm test` ist ein Gate, das jeder Task unter
Last fährt. Dieselben Prüfer laufen mit 300 Partien in `dauerlauf.test.ts`
auch in `npm test`.

In jedem Schritt gilt: Invarianten, Speichern und Laden, jede aufgezählte
Aktion ist erlaubt (`testing/dauerlauf.ts`), eine zufällig verfälschte Aktion
wird abgelehnt, höchstens 5 Handkarten nach dem eigenen Zugende, der
Nachziehstapel ist genau dann leer, wenn die Schlussrunde läuft oder die
Partie beendet ist (`dauerlauf_pruefer.ts`).
*/

export const TEILE = 4
const JE_TEIL_UND_ART = 250

/** Teil 1 bis 4: je 250 Partien ohne Erweiterung (Saaten ab 1) und 250 mit (Saaten ab 1001), reihum 2, 3 und 4 Spieler. */
export function partienDesTeils(teil: number) {
  const versatz = (teil - 1) * JE_TEIL_UND_ART
  return [...dauerlaufPartien(JE_TEIL_UND_ART, false, 1 + versatz), ...dauerlaufPartien(JE_TEIL_UND_ART, true, 1001 + versatz)]
}

/** Spielt einen Teil mit allen Prüfern und prüft, dass jede Partie endet und jede geprüfte Lage vorkam. */
export function pruefeLangenDauerlauf(teil: number): void {
  const partien = partienDesTeils(teil)
  const lauf = spieleGeprueft(partien, 0xe11 + teil)
  const { zuege, reaktionen, verfaelscht, umfang } = lauf
  console.info(
    `E11-Dauerlauf Teil ${teil}: ${lauf.ergebnisse.length} Partien, ${lauf.schritte} Schritte, höchste Aktionszahl ${umfang.hoechste} (${umfang.bei}), ` +
      `zweite Züge ${zuege.zweite} (Schlussrunde ${zuege.zweiteInSchlussrunde}), Reaktionen ${JSON.stringify(reaktionen)}, ` +
      `verfälscht ${JSON.stringify(verfaelscht.jeArt)}`,
  )

  expect(new Set(partien.map((eintrag) => eintrag.spielerzahl)), `Teil ${teil}: 2, 3 und 4 Spieler`).toEqual(new Set([2, 3, 4]))
  erwarteGeprueftenLauf(lauf, `Teil ${teil}`)
  expect(Object.keys(verfaelscht.jeArt).length, `Teil ${teil}: jede Art der Verfälschung kam vor`).toBe(10)
  expect(zuege.zweite, `Teil ${teil}: A7.8, zweite Züge nach einem Verdoppler`).toBeGreaterThan(1000)
  expect(zuege.zweiteInSchlussrunde, `Teil ${teil}: A7.8/A10, zweite Züge in der Schlussrunde`).toBeGreaterThan(0)
  expect(reaktionen.Abgewehrt, `Teil ${teil}: A7.2, Abwehren mit Farbenschutz`).toBeGreaterThan(200)
  expect(reaktionen.Ausgesetzt, `Teil ${teil}: A7.6, ausgesetzte Züge`).toBeGreaterThan(500)
  expect(reaktionen.GrubeOhneWirkung, `Teil ${teil}: D29, Gruben ohne Wirkung`).toBeGreaterThan(0)
}
