import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

/*
Liest `docs/GAME_SPEC.md` für Tests, die Anzeigetexte und Material mit dem
Wortlaut der Spielanleitung vergleichen (O1, O9). Die Texte kommen aus der Spec
selbst, nicht aus einer Kopie: Ändert sich Teil A, wird der Test rot, bis die
Oberfläche folgt.

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

const ZEILEN_A = teil('A').split('\n')
const TEIL_D = teil('D')

/** Überschriften von Teil A: Zeile, Ebene, Nummer („A7.1“) und Titel („Farbendieb“). */
const UEBERSCHRIFTEN = ZEILEN_A.flatMap((zeile, index) => {
  const teile = zeile.match(/^(#{2,4}) (A[\d.]+) (.+)$/)
  return teile === null ? [] : [{ index, ebene: teile[1].length, nummer: teile[2], titel: teile[3].trim() }]
})

/** Eine Zeile ohne Einzug, Überschrifts- und Listenzeichen und ohne `**`. */
function ohneAuszeichnung(zeile: string): string {
  return zeile
    .trim()
    .replace(/^#{1,6}\s+/, '')
    .replace(/^(-|\d+\.)\s+/, '')
    .replaceAll('**', '')
    .trim()
}

/** Text eines Abschnitts von Teil A („A7.1“) bis zur nächsten Überschrift gleicher oder höherer Ebene. */
export function abschnittA(nummer: string): string {
  const start = UEBERSCHRIFTEN.find((ueberschrift) => ueberschrift.nummer === nummer)
  if (start === undefined) throw new Error(`abschnittA: Abschnitt ${nummer} steht nicht in Teil A von docs/GAME_SPEC.md`)
  const ende = ZEILEN_A.findIndex((zeile, i) => i > start.index && /^#{1,6} /.test(zeile) && zeile.indexOf(' ') <= start.ebene)
  return ZEILEN_A.slice(start.index + 1, ende < 0 ? undefined : ende).join('\n')
}

/** Ein Absatz im Fliesstext, kein Titel, keine Liste, keine Bildzeile und keine fett eingeleitete Zeile. */
const istEinleitung = (zeile: string) => zeile.trim() !== '' && !/^\s*(#|-|\*\*|\[|\d+\.)/.test(zeile)

/**
 * Alle Zeilen, die zum Text einer Karte gehören, ohne Auszeichnung. Das ist ihr
 * Abschnitt, mit einer Regel der Website: Ein Absatz direkt vor der Überschrift
 * einer Karte leitet diese Karte ein („Die Comeback-Karte ist deine zweite
 * Chance! …“ vor A8.1). Er gehört deshalb zur folgenden Karte und nicht zum
 * Abschnitt, an dessen Ende er steht.
 */
export function kartenabschnittZeilen(nummer: string): string[] {
  const start = UEBERSCHRIFTEN.find((ueberschrift) => ueberschrift.nummer === nummer)
  if (start === undefined) throw new Error(`kartenabschnittZeilen: Abschnitt ${nummer} steht nicht in Teil A`)
  const einleitungVor = (index: number): number | null => {
    let i = index - 1
    while (i >= 0 && ZEILEN_A[i].trim() === '') i--
    return i >= 0 && istEinleitung(ZEILEN_A[i]) ? i : null
  }
  const zeilen = abschnittA(nummer).split('\n')
  const naechste = UEBERSCHRIFTEN.find((ueberschrift) => ueberschrift.index > start.index)
  const fremd = naechste === undefined ? null : einleitungVor(naechste.index)
  if (fremd !== null && fremd > start.index) zeilen.splice(fremd - start.index - 1, 1)
  const eigen = einleitungVor(start.index)
  return zeilenOhneAuszeichnung([...(eigen === null ? [] : [ZEILEN_A[eigen]]), ...zeilen].join('\n'))
}

/** Eine Zeile, die nur Kartenbilder zeigt, etwa `[Blau] [Blau] [Gelb + Farbenfusion + Gelb]`. */
export const istBildzeile = (zeile: string) => /^(\[[^\]]+\]\s*)+$/.test(zeile.trim())

/** Die Karten einer Bildzeile in ihrer Reihenfolge: `Blau`, `Gelb + Farbenfusion + Gelb`. */
export const bildreihe = (zeile: string): string[] => [...zeile.matchAll(/\[([^\]]+)\]/g)].map((treffer) => treffer[1])

/**
 * Ein Beispiel zu einer Aufgabe (A9) zerlegt in Text und Bildreihen. Die Spec
 * schreibt es als eine Zeile: „**Name:** Text [Blau] [Rot] #### Vorher: [Blau] …“.
 */
export function beispielTeile(zeile: string): (string | string[])[] {
  const ohneName = ohneAuszeichnung(zeile).replace(/^[^:]+:\s*/, '')
  return ohneName
    .split(/\s*#{2,6}\s+/)
    .flatMap((stueck) => {
      const bilder = stueck.indexOf(' [')
      const text = (bilder < 0 ? stueck : stueck.slice(0, bilder)).trim()
      const reihe = bilder < 0 ? [] : bildreihe(stueck.slice(bilder))
      return [...(text === '' ? [] : [text]), ...(reihe.length === 0 ? [] : [reihe])]
    })
}

/** Die Zeile mit dem Beispiel zu einer Aufgabe; `undefined`, wenn Teil A keines hat. */
export function aufgabenbeispiel(name: string): string | undefined {
  return abschnittA('A9')
    .split('\n')
    .find((zeile) => zeile.startsWith(`**${name}:** `))
}

/** Die Nummer des Abschnitts von Teil A, dessen Überschrift genau „<Nummer> <Titel>“ lautet. */
export function abschnittsnummer(titel: string): string {
  const treffer = UEBERSCHRIFTEN.find((ueberschrift) => ueberschrift.titel === titel)
  if (treffer === undefined) throw new Error(`abschnittsnummer: keine Überschrift „${titel}“ in Teil A`)
  return treffer.nummer
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
    if (aktuell.length > 0 && (punkt === null || punkt[1].length !== einzug)) {
      listen.push(aktuell)
      aktuell = []
    }
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

/** Materialliste (A1) und Aufgabentabelle (A9) als Zeilen ihrer Zellen. */
export const A1_TABELLE = tabellenzeilen(abschnittA('A1'))
export const AUFGABEN_TABELLE = tabellenzeilen(abschnittA('A9').split('#### Verfügbare Aufgabenkarten')[1])

const ohneEtikett = (name: string) => name.replace(/\s*\[Erweiterung\]$/, '')
const nachArt = (art: string) => A1_TABELLE.filter(([kategorie]) => kategorie === art)

/** Die Karten des Materials in der Reihenfolge der Spec: Farben, Sonderkarten, Zusatzmaterial, Aufgaben. */
export const SPEC_FARBEN = nachArt('Farbkarten').map(([, , text]) => text.split(' ')[0])
export const SPEC_SONDERKARTEN = nachArt('Sonderkarten').map(([, , name]) => ohneEtikett(name))
export const SPEC_ZUSATZ = A1_TABELLE.filter(([kategorie]) => kategorie.startsWith('Zusätzliches Spielmaterial')).map(
  ([, , text]) => text,
)
export const SPEC_AUFGABEN = AUFGABEN_TABELLE.map(([, name]) => name)

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
  const fassungen = [gesucht[0].toLowerCase(), gesucht[0].toUpperCase()].map((anfang) => anfang + gesucht.slice(1))
  return zeilen.some((zeile) => fassungen.some((fassung) => zeile.includes(fassung)))
}
