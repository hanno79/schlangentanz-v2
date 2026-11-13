import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

/*
Liest `docs/GAME_SPEC.md` für Tests, die Anzeigetexte mit dem Wortlaut der
Spielanleitung vergleichen (O9). Die Texte kommen aus der Spec selbst, nicht aus
einer Kopie: Ändert sich Teil A, wird der Test rot, bis die Oberfläche folgt.

Verglichen wird ohne Markdown-Auszeichnung: Einzug, Listenzeichen,
Überschriftszeichen und `**` gehören zur Schreibweise der Spec, nicht zum
Wortlaut der Website.
*/

const SPEC = readFileSync(join(resolve(__dirname, '../..'), 'docs/GAME_SPEC.md'), 'utf8')

function teil(kennung: 'A' | 'D'): string {
  const start = SPEC.indexOf(`\n## Teil ${kennung} `)
  if (start < 0) throw new Error(`specText: Teil ${kennung} steht nicht in docs/GAME_SPEC.md`)
  const ende = SPEC.indexOf('\n## ', start + 1)
  return ende < 0 ? SPEC.slice(start) : SPEC.slice(start, ende)
}

const TEIL_A = teil('A')
const TEIL_D = teil('D')

/** Eine Zeile ohne Einzug, Überschrifts- und Listenzeichen und ohne `**`. */
export function ohneAuszeichnung(zeile: string): string {
  return zeile
    .trim()
    .replace(/^#{1,6}\s+/, '')
    .replace(/^(-|\d+\.)\s+/, '')
    .replaceAll('**', '')
    .trim()
}

/** Überschrift „A7.1 Farbendieb“ und Text eines Abschnitts von Teil A bis zur nächsten Überschrift gleicher oder höherer Ebene. */
export function abschnittA(nummer: string): { ueberschrift: string; text: string } {
  const zeilen = TEIL_A.split('\n')
  const start = zeilen.findIndex((zeile) => new RegExp(`^#{2,4} ${nummer.replace('.', '\\.')}( |$)`).test(zeile))
  if (start < 0) throw new Error(`abschnittA: Abschnitt ${nummer} steht nicht in Teil A von docs/GAME_SPEC.md`)
  const ebene = zeilen[start].match(/^#+/)![0].length
  const ende = zeilen.findIndex((zeile, i) => i > start && new RegExp(`^#{1,${ebene}} `).test(zeile))
  return {
    ueberschrift: ohneAuszeichnung(zeilen[start]),
    text: zeilen.slice(start + 1, ende < 0 ? undefined : ende).join('\n'),
  }
}

/** Die Nummer des Abschnitts von Teil A, dessen Überschrift genau „<Nummer> <Titel>“ lautet. */
export function abschnittsnummer(titel: string): string {
  const treffer = TEIL_A.split('\n')
    .map((zeile) => zeile.match(/^#{2,4} (A[\d.]+) (.+)$/))
    .find((teile) => teile !== null && teile[2].trim() === titel)
  if (treffer == null) throw new Error(`abschnittsnummer: keine Überschrift „${titel}“ in Teil A`)
  return treffer[1]
}

/** Alle nicht leeren Zeilen eines Texts, ohne Auszeichnung. */
export function zeilenOhneAuszeichnung(text: string): string[] {
  return text.split('\n').map(ohneAuszeichnung).filter((zeile) => zeile !== '')
}

/** Jede Aufzählung (aufeinanderfolgende Zeilen „- …“ gleichen Einzugs) als Liste ihrer Punkte. */
export function aufzaehlungen(text: string): string[][] {
  const listen: string[][] = []
  let aktuell: string[] = []
  let einzug = -1
  for (const zeile of text.split('\n')) {
    const punkt = zeile.match(/^(\s*)- (.*)$/)
    if (punkt !== null && (aktuell.length === 0 || punkt[1].length === einzug)) {
      aktuell.push(ohneAuszeichnung(punkt[2]))
      einzug = punkt[1].length
      continue
    }
    if (aktuell.length > 0) listen.push(aktuell)
    aktuell = []
    einzug = -1
    if (punkt !== null) {
      aktuell.push(ohneAuszeichnung(punkt[2]))
      einzug = punkt[1].length
    }
  }
  if (aktuell.length > 0) listen.push(aktuell)
  return listen
}

/** Die Aufzählung direkt unter der Zeile `**<titel>:**` (oder `**<titel>**`); `null`, wenn es keine gibt. */
export function aufzaehlungUnter(text: string, titel: string): string[] | null {
  const zeilen = text.split('\n')
  const start = zeilen.findIndex((zeile) => ohneAuszeichnung(zeile).replace(/:$/, '') === titel)
  if (start < 0) return null
  const rest = zeilen.slice(start + 1)
  const erste = rest.findIndex((zeile) => zeile.trim() !== '')
  if (erste < 0 || !/^\s*- /.test(rest[erste])) return null
  return aufzaehlungen(rest.slice(erste).join('\n'))[0]
}

/** Der Text nach „Kurzbeschreibung: “ in einem Abschnitt. */
export function kurzbeschreibung(text: string): string {
  const zeile = text.split('\n').find((z) => z.startsWith('Kurzbeschreibung: '))
  if (zeile === undefined) throw new Error('kurzbeschreibung: Der Abschnitt hat keine Zeile „Kurzbeschreibung: …“')
  return zeile.slice('Kurzbeschreibung: '.length).trim()
}

/** Die Zellen jeder Tabellenzeile (ohne Kopf und Trennzeile). */
export function tabellenzeilen(text: string): string[][] {
  return text
    .split('\n')
    .filter((zeile) => zeile.startsWith('|') && !/^\|\s*-/.test(zeile))
    .map((zeile) => zeile.slice(1, -1).split('|').map((zelle) => zelle.trim()))
    .slice(1)
}

/** Die Antwort des Autors zu einer Frage aus Teil D, etwa „D12“. */
export function antwortD(nummer: string): string {
  const zeile = tabellenzeilen(TEIL_D).find(([kennung]) => kennung === nummer)
  if (zeile === undefined) throw new Error(`antwortD: ${nummer} steht nicht in der Tabelle von Teil D`)
  return zeile[2]
}

/**
 * Steht `text` wörtlich in einer der Zeilen? Erlaubt sind nur zwei Abweichungen,
 * die beim Herauslösen eines Satzes entstehen: ein Punkt oder Doppelpunkt am
 * Ende und die Grossschreibung des ersten Buchstabens („Ja, jede Karte …“ →
 * „Jede Karte …“).
 */
export function stehtImSatz(text: string, zeilen: readonly string[]): boolean {
  const gesucht = text.trim().replace(/[.:]$/, '')
  const rest = gesucht.slice(1)
  return zeilen.some((zeile) => {
    for (let i = zeile.indexOf(rest, 1); i >= 1; i = zeile.indexOf(rest, i + 1)) {
      if (zeile[i - 1].toLowerCase() === gesucht[0].toLowerCase()) return true
    }
    return false
  })
}
