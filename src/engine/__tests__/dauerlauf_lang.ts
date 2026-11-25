import { expect } from 'vitest'
import { dauerlaufPartien } from '../testing/dauerlauf'
import { erwarteGeprueftenLauf, spieleGeprueft } from './dauerlauf_pruefer'
import type { Erweiterung } from './dauerlauf_pruefer'

/*
E11, Kriterium 3: der lange Dauerlauf, aufgeteilt in vier Dateien
`dauerlauf_teil_<n>.dauerlauf.test.ts`, damit Vitest sie nebeneinander rechnet.
Er läuft nicht in `npm test`, sondern mit `npm run test:dauerlauf` (Endung
`.dauerlauf.test.ts`, `vite.config.ts`): Er braucht mehrere Minuten, und
`npm test` ist ein Gate, das jeder Task unter Last fährt. Dieselben Prüfer
laufen mit 300 Partien in `dauerlauf.test.ts` auch in `npm test`.

X7 verlangt 2'000 Partien mit Erweiterung. Die 1'000 Partien ohne Erweiterung
aus E11 bleiben dabei; zusammen sind es 3'000, je Teil 250 ohne und 500 mit.

In jedem Schritt gilt: Invarianten, Speichern und Laden, jede aufgezählte
Aktion ist erlaubt (`testing/dauerlauf.ts`), eine zufällig verfälschte Aktion
wird abgelehnt, höchstens 5 Handkarten nach dem eigenen Zugende, der
Nachziehstapel ist genau dann leer, wenn die Schlussrunde läuft oder die
Partie beendet ist (`dauerlauf_pruefer.ts`). Gezählt wird zudem, wie oft die
Teile der Erweiterung gespielt werden (`erweiterungsPruefer`).
*/

export const TEILE = 4
const OHNE_JE_TEIL = 250
const MIT_JE_TEIL = 500

/** Teil 1 bis 4: je 250 Partien ohne Erweiterung (Saaten 1 bis 1000) und 500 mit (Saaten 1001 bis 3000), reihum 2, 3 und 4 Spieler. */
export function partienDesTeils(teil: number) {
  return [...dauerlaufPartien(OHNE_JE_TEIL, false, 1 + (teil - 1) * OHNE_JE_TEIL), ...dauerlaufPartien(MIT_JE_TEIL, true, 1001 + (teil - 1) * MIT_JE_TEIL)]
}

/**
 * X7: So oft kommt jeder Teil der Erweiterung in einem Teil mindestens vor, rund
 * die Hälfte der kleinsten Zahl der vier Teile am 25.11.2026: eingelöste offene
 * Aufgaben 1'927, erfüllte geheime 530, Comeback 853, Risiko mit Erfolg 1'892 und
 * mit Misserfolg 1'073, Entscheidungen eines Gegners 467, Schlangenkörbe 452.
 */
const ERWEITERUNG_MINDESTENS: Readonly<Record<keyof Erweiterung, number>> = {
  AufgabeErfuellt: 900,
  GeheimeAufgabeErfuellt: 250,
  ComebackEingesetzt: 400,
  RisikoErfolg: 900,
  RisikoMisserfolg: 500,
  RisikoGegnerEntscheidet: 200,
  SchlangenkorbGespielt: 200,
}

/** Spielt einen Teil mit allen Prüfern und prüft, dass jede Partie endet und jede geprüfte Lage vorkam. */
export function pruefeLangenDauerlauf(teil: number): void {
  const partien = partienDesTeils(teil)
  const lauf = spieleGeprueft(partien, 0xe11 + teil)
  const { zuege, reaktionen, verfaelscht, umfang, erweiterung } = lauf
  console.info(
    `E11-Dauerlauf Teil ${teil}: ${lauf.ergebnisse.length} Partien, ${lauf.schritte} Schritte, höchste Aktionszahl ${umfang.hoechste} (${umfang.bei}), ` +
      `zweite Züge ${zuege.zweite} (Schlussrunde ${zuege.zweiteInSchlussrunde}), Reaktionen ${JSON.stringify(reaktionen)}, ` +
      `verfälscht ${JSON.stringify(verfaelscht.jeArt)}, Erweiterung ${JSON.stringify(erweiterung)}`,
  )

  expect(new Set(partien.map((eintrag) => eintrag.spielerzahl)), `Teil ${teil}: 2, 3 und 4 Spieler`).toEqual(new Set([2, 3, 4]))
  erwarteGeprueftenLauf(lauf, `Teil ${teil}`)
  expect(Object.keys(verfaelscht.jeArt).length, `Teil ${teil}: jede Art der Verfälschung kam vor`).toBe(10)
  expect(zuege.zweite, `Teil ${teil}: A7.8, zweite Züge nach einem Verdoppler`).toBeGreaterThan(1000)
  expect(zuege.zweiteInSchlussrunde, `Teil ${teil}: A7.8/A10, zweite Züge in der Schlussrunde`).toBeGreaterThan(0)
  expect(reaktionen.Abgewehrt, `Teil ${teil}: A7.2, Abwehren mit Farbenschutz`).toBeGreaterThan(200)
  expect(reaktionen.Ausgesetzt, `Teil ${teil}: A7.6, ausgesetzte Züge`).toBeGreaterThan(500)
  expect(reaktionen.GrubeOhneWirkung, `Teil ${teil}: D29, Gruben ohne Wirkung`).toBeGreaterThan(0)
  // X7: In den Partien mit Erweiterung werden alle ihre Teile gespielt.
  for (const [art, mindestens] of Object.entries(ERWEITERUNG_MINDESTENS) as Array<[keyof Erweiterung, number]>) {
    expect(erweiterung[art], `Teil ${teil}: X7, ${art}`).toBeGreaterThanOrEqual(mindestens)
  }
}
