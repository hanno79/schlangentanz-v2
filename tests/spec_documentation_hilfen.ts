import { readFileSync } from 'node:fs'
import { expect } from 'vitest'

/*
Hilfen für die Tests, die festhalten, dass `docs/GAME_SPEC.md` die Regeln der
Website wiedergibt und ihren Aufbau behält. Je Teil der Spec eine Testdatei:
`spec_documentation.test.ts` (Rangfolge der Quellen) und
`spec_documentation_teil_a.test.ts` bis `spec_documentation_teil_e.test.ts`.

Diese Tests ersetzen keinen Abgleich mit der Website (`npm run
abgleich:website`). Sie verhindern nur, dass Kernaussagen still aus dem
Dokument verschwinden oder die Rangfolge der Quellen wieder verwässert wird.
Geprüft werden deshalb wenige, tragende Sätze und Zahlen, nicht jeder Absatz.

Zwei Regeln für jede Zusicherung, beide gegen Brüchigkeit:
- Sätze werden im Fliesstext gesucht. Ein Neuumbruch ändert keine Aussage.
- Tabellen werden zellenweise gelesen. Ausrichtung und zusätzliche Spalten
  ändern keine Aussage.
*/

export const spec = readFileSync('docs/GAME_SPEC.md', 'utf8')

/** Whitespace zu einzelnen Leerzeichen zusammengezogen. */
export function fliesstext(text: string): string {
  return text.replace(/\s+/g, ' ')
}

/**
 * Die Sätze, die im Text fehlen. Leer heisst: alle da.
 *
 * Als Liste und nicht als `toContain` je Satz: So zeigt ein Fehlschlag alle
 * fehlenden Sätze auf einmal und nicht den ganzen Teil als „received".
 */
export function fehlende(text: string, saetze: string[]): string[] {
  const gesucht = fliesstext(text)
  return saetze.filter((satz) => !gesucht.includes(satz))
}

/** Der Text eines Teils („A" bis „E") bis zur nächsten Teil-Überschrift. */
export function teil(buchstabe: string): string {
  const start = spec.indexOf(`## Teil ${buchstabe} `)
  expect(start, `Teil ${buchstabe} fehlt`).toBeGreaterThan(-1)
  const ende = spec.indexOf('\n## Teil ', start + 1)
  return spec.slice(start, ende === -1 ? undefined : ende)
}

export interface Tabelle {
  kopf: string[]
  zeilen: string[][]
}

/** Alle Markdown-Tabellen eines Texts, zellenweise und ohne Trennzeile. */
export function tabellen(text: string): Tabelle[] {
  const gefunden: Tabelle[] = []
  let offene: Tabelle | null = null
  for (const zeile of text.split('\n')) {
    if (!zeile.trimStart().startsWith('|')) {
      offene = null
      continue
    }
    const zellen = zeile
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((zelle) => zelle.trim())
    if (zellen.every((zelle) => /^:?-+:?$/.test(zelle))) continue
    if (offene === null) {
      offene = { kopf: zellen, zeilen: [] }
      gefunden.push(offene)
    } else {
      offene.zeilen.push(zellen)
    }
  }
  return gefunden
}

/** Die Tabelle eines Teils, deren Kopf diese Spalte führt. */
export function tabelleMitSpalte(text: string, spalte: string): Tabelle {
  const treffer = tabellen(text).find((tabelle) => tabelle.kopf.includes(spalte))
  expect(treffer, `keine Tabelle mit Spalte „${spalte}"`).toBeDefined()
  return treffer as Tabelle
}

/** Die Werte der genannten Spalten je Datenzeile, in dieser Reihenfolge. */
export function spalten(tabelle: Tabelle, ...namen: string[]): string[][] {
  const stellen = namen.map((name) => tabelle.kopf.indexOf(name))
  return tabelle.zeilen.map((zeile) => stellen.map((stelle) => zeile[stelle] ?? ''))
}

/** Frage (wie in der Tabelle), Antwort (Leerraum zusammengezogen, klein geschrieben), Datum und Folge eines Eintrags in Teil D. */
export function eintragD(nummer: string): { frage: string; antwort: string; datum: string; folge: string } {
  const zeile = spalten(tabelleMitSpalte(teil('D'), 'Antwort'), 'Nr.', 'Frage', 'Antwort', 'Datum', 'Folge').find(([nr]) => nr === nummer)
  expect(zeile, `${nummer} fehlt in Teil D`).toBeDefined()
  const [, frage, antwort, datum, folge] = zeile as string[]
  return { frage, antwort: fliesstext(antwort).toLowerCase(), datum, folge }
}

export const websiteNachtrag = readFileSync('docs/WEBSITE_NACHTRAG.md', 'utf8')

/** Eintrag in `docs/WEBSITE_NACHTRAG.md`: fette Frage mit „(Dnn)“, darunter die Antwort. */
export function nachtragEintrag(nummer: string): { frage: string; antwort: string } {
  const treffer = new RegExp(`^\\*\\*(.+)\\*\\* \\(${nummer}\\)\\s*\\n(.+)$`, 'm').exec(websiteNachtrag)
  expect(treffer, `${nummer} fehlt in docs/WEBSITE_NACHTRAG.md`).not.toBeNull()
  return { frage: treffer?.[1] ?? '', antwort: treffer?.[2] ?? '' }
}

/** Jede Fragezeile `**…** (Dnn)` im Website-Nachtrag: Nummer und ob sie mit zwei Leerzeichen (hartem Umbruch) endet. */
export function nachtragFragezeilen(): { nummer: string; harterUmbruch: boolean }[] {
  return [...websiteNachtrag.matchAll(/^\*\*.+\*\* \((D\d+)\)( *)$/gm)].map(([, nummer, leer]) => ({ nummer, harterUmbruch: leer.length >= 2 }))
}

/** Kernaussagen stehen im Eintrag, die Gegenteile nicht. */
export function pruefeKern(nummer: string, antwort: string, kern: string[], verboten: string[]): void {
  for (const aussage of kern) expect(antwort, `${nummer} ohne Kernaussage „${aussage}“`).toContain(aussage.toLowerCase())
  for (const aussage of verboten) expect(antwort, `${nummer} enthält „${aussage}“`).not.toContain(aussage.toLowerCase())
}
