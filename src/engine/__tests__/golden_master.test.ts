// @vitest-environment node
import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { protokolliere } from '../testing/partieprotokoll'
import type { Partieprotokoll } from '../testing/partieprotokoll'
import { allePruefer, erweiterungsPruefer, neueErweiterung, neueReaktionen, neuerZugzaehler, reaktionsPruefer, regelPruefer } from './dauerlauf_pruefer'
import type { Erweiterung, Reaktionen, Zugzaehler } from './dauerlauf_pruefer'

/*
E11, Kriterium 5: der Golden Master der Basis-Engine. Drei Zufallspartien mit
fester Saat, ohne Erweiterung, zu zweit, zu dritt und zu viert. Ihr Protokoll
(`testing/partieprotokoll.ts`) liegt lesbar unter `golden/`; vor dem Einfrieren
liest ein Prüfer die Partie zu zweit Zug für Zug gegen Teil A.

Ändert eine Regel den Verlauf, wird der Test rot und zeigt die Stelle im Text.
Ist die Änderung gewollt, liest man den neuen Verlauf wieder gegen Teil A und
schreibt ihn mit `npx vitest run src/engine/__tests__/golden_master.test.ts -u`.

X7: der Golden Master der Erweiterung, drei weitere Partien mit fester Saat
**mit** Erweiterung, zu zweit, zu dritt und zu viert. Die Saaten sind so
gewählt, dass in jeder Partie alle Teile der Erweiterung vorkommen: eine
eingelöste offene Aufgabe, eine geheime Aufgabe in der Endwertung, eine
Comeback-Karte, eine Risiko-Karte mit Erfolg und eine mit Misserfolg, bei der
ein Gegner entscheidet, und der Schlangenkorb; dazu wie oben eine Abwehr und
ein zweiter Zug nach dem Verdoppler. Gesucht wurde je Spielerzahl unter den
Saaten 1 bis 60 (gewählt wie hier, gleichverteilt unter der sortierten
Aufzählung); genommen ist die Partie mit den wenigsten Schritten, die das alles
enthält, bei Gleichstand die kleinere Saat: zu zweit Saat 11 (187 Schritte), zu
dritt Saat 39 (186), zu viert Saat 41 (181). Ihr Protokoll liest ein Prüfer Zug
für Zug gegen Teil A und D, bevor es als eingefroren gilt.
*/

const PARTIEN = [
  { saat: 5, spielerzahl: 2, erweiterung: false, datei: 'golden/partie-2-spieler-saat-5.txt' },
  { saat: 3, spielerzahl: 3, erweiterung: false, datei: 'golden/partie-3-spieler-saat-3.txt' },
  { saat: 2, spielerzahl: 4, erweiterung: false, datei: 'golden/partie-4-spieler-saat-2.txt' },
]

/** X7: die Partien mit Erweiterung. */
const PARTIEN_ERWEITERUNG = [
  { saat: 11, spielerzahl: 2, erweiterung: true, datei: 'golden/erweiterung-2-spieler-saat-11.txt' },
  { saat: 39, spielerzahl: 3, erweiterung: true, datei: 'golden/erweiterung-3-spieler-saat-39.txt' },
  { saat: 41, spielerzahl: 4, erweiterung: true, datei: 'golden/erweiterung-4-spieler-saat-41.txt' },
]

interface GeprueftePartie {
  protokoll: Partieprotokoll
  zuege: Zugzaehler
  reaktionen: Reaktionen
  erweiterung: Erweiterung
}

/** Jede Partie wird einmal gespielt, mit den Prüfern des Dauerlaufs; die Tests lesen daraus. */
const gespielt = new Map<string, GeprueftePartie>()
function spiele(saat: number, spielerzahl: number, erweiterung = false): GeprueftePartie {
  const schluessel = `${saat}/${spielerzahl}/${erweiterung}`
  if (!gespielt.has(schluessel)) {
    const zuege = neuerZugzaehler()
    const reaktionen = neueReaktionen()
    const gezaehlt = neueErweiterung()
    const protokoll = protokolliere({ saat, spielerzahl, erweiterung }, allePruefer(regelPruefer(zuege), reaktionsPruefer(reaktionen), erweiterungsPruefer(gezaehlt)))
    gespielt.set(schluessel, { protokoll, zuege, reaktionen, erweiterung: gezaehlt })
  }
  return gespielt.get(schluessel)!
}

describe('A4/A5/A6/A7/A8/A9/A10/A11: Golden Master, je drei Partien mit fester Saat ohne und mit Erweiterung (E11 Kriterium 5, X7)', () => {
  it.each([...PARTIEN, ...PARTIEN_ERWEITERUNG])('A10: $spielerzahl Spieler, Saat $saat, Erweiterung $erweiterung: der Verlauf gleicht Zug für Zug dem eingefrorenen Protokoll', async ({ saat, spielerzahl, erweiterung, datei }) => {
    const pfad = new URL(datei, import.meta.url)
    expect(existsSync(pfad), `protokolliere: ${datei} fehlt; eingefroren wird erst nach der Lektüre gegen Teil A`).toBe(true)
    await expect(spiele(saat, spielerzahl, erweiterung).protokoll.text).toMatchFileSnapshot(datei)
  })

  it.each([...PARTIEN, ...PARTIEN_ERWEITERUNG])('A6/A7.2/A7.8/A10: $spielerzahl Spieler, Saat $saat, Erweiterung $erweiterung: eine Abwehr, ein zweiter Zug nach dem Verdoppler, und die Schlussrunde hat N−1 Züge', ({ saat, spielerzahl, erweiterung }) => {
    const { zuege, reaktionen } = spiele(saat, spielerzahl, erweiterung)
    expect(reaktionen.Abgewehrt, 'A7.2: Abwehren mit Farbenschutz in der Partie').toBeGreaterThan(0)
    expect(zuege.zweite, 'A7.8: zweite Züge nach einem Verdoppler in der Partie').toBeGreaterThan(0)
    expect(zuege.letzte, 'A10: letzte Züge in der Schlussrunde, gespielt oder ausgesetzt').toBe(spielerzahl - 1)
  })

  it.each(PARTIEN_ERWEITERUNG)('A7.10/A8.1/A8.2/A9 (X7): $spielerzahl Spieler, Saat $saat: Aufgabe eingelöst, geheime Aufgabe gewertet, Comeback, Risiko mit Erfolg und Misserfolg samt Gegnerwahl, Schlangenkorb', ({ saat, spielerzahl }) => {
    const { erweiterung, protokoll } = spiele(saat, spielerzahl, true)
    const { endwertung } = protokoll
    expect(erweiterung.AufgabeErfuellt, 'A9: eingelöste offene Aufgaben').toBeGreaterThan(0)
    const geheimGewertet = endwertung.spieler.filter((wertung) => wertung.aufgaben?.some((eintrag) => eintrag.geheim) === true)
    expect(geheimGewertet.length, 'A9/A11/D35: Spieler mit geheimer Aufgabe in der Endwertung').toBeGreaterThan(0)
    expect(erweiterung.GeheimeAufgabeErfuellt, 'D35: so viele geheime Aufgaben erfüllt, wie die Endwertung zählt').toBe(geheimGewertet.length)
    expect(erweiterung.ComebackEingesetzt, 'A8.1: eingesetzte Comeback-Karten').toBeGreaterThan(0)
    expect(erweiterung.RisikoErfolg, 'A8.2: Risiko-Karten mit Erfolg').toBeGreaterThan(0)
    expect(erweiterung.RisikoMisserfolg, 'A8.2: Risiko-Karten mit Misserfolg').toBeGreaterThan(0)
    expect(erweiterung.RisikoGegnerEntscheidet, 'A8.2/D52/D54: der begünstigte Gegner entscheidet bei Misserfolg').toBeGreaterThan(0)
    expect(erweiterung.SchlangenkorbGespielt, 'A7.10: der eine Schlangenkorb ist gespielt').toBe(1)
  })

  it('A10: gleiche Saat, gleiches Protokoll; andere Saat, anderes Protokoll', () => {
    const erste = spiele(5, 2).protokoll.text
    expect(protokolliere({ saat: 5, spielerzahl: 2, erweiterung: false }).text).toBe(erste)
    expect(protokolliere({ saat: 6, spielerzahl: 2, erweiterung: false }).text).not.toBe(erste)
  })
})
