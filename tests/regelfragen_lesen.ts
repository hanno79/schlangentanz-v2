import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Liest Umsetzungsplan, Spec und docs/REGELFRAGEN.md für die Tests zu P0.5.
// Ohne Zusicherungen: Was fehlt, kommt als leerer Text zurück, die Tests melden es.

const wurzel = resolve(__dirname, '..')
export const regelfragenPfad = resolve(wurzel, 'docs', 'REGELFRAGEN.md')

export const plan = readFileSync(resolve(wurzel, 'docs', 'UMSETZUNGSPLAN.md'), 'utf8')
export const spec = readFileSync(resolve(wurzel, 'docs', 'GAME_SPEC.md'), 'utf8')
export const regelfragen = existsSync(regelfragenPfad) ? readFileSync(regelfragenPfad, 'utf8') : ''

/** Task-IDs des Plans: P0.1 … P0.5, E1 …, X1 …, K1 …, O1 …, Z1 … */
export const TASK_ID = /\b(P0\.\d|[EXKOZ]\d+)\b/g
/** Fragennummern, auch Nachfragen („F8a“) und Bereiche („G3–G8“). */
const FRAGE_ODER_BEREICH = /\b([FG])(\d+)([a-z]?)(?:–\1(\d+))?\b/g
/** Antwortfeld, solange der Autor noch nicht geantwortet hat. */
export const OFFEN = '—'
/** Kennzeichen einer Antwort, die keiner Möglichkeit folgt. */
export const FREI = 'Freie Antwort'
/** Nachfrage: Nummer der Ausgangsfrage plus Kleinbuchstabe, etwa „F8a“. */
export const NACHFRAGE = /^([FG]\d+)[a-z]$/
/** Zitat in deutschen Anführungszeichen. */
export const ZITAT = /„[^“]+“/g

type PlanFrage = { nr: string; stelle: string; frage: string; vorschlag?: string }
type TeilDEintrag = { nr: string; frage: string; antwort: string; datum: string }

/** Fasst Leerraum zusammen, damit Zitate und Prosa über Zeilenumbrüche hinweg passen. */
export function normalisiert(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** Muster, das `text` als ganzes Wort findet. */
export function alsWort(text: string): RegExp {
  return new RegExp(`\\b${text}\\b`)
}

/** Zellen einer Markdown-Tabellenzeile, ohne die äusseren Striche, je getrimmt. */
function zellen(zeile: string): string[] {
  return zeile.trim().replace(/^\||\|$/g, '').split('|').map((zelle) => zelle.trim())
}

/** Kopf und Datenzeilen der Tabellenzeilen eines Texts, ohne Trennzeile. */
export function tabelle(text: string): { kopf: string[]; zeilen: string[][] } {
  const zeilen = text
    .split('\n')
    .filter((zeile) => zeile.trimStart().startsWith('|'))
    .map(zellen)
  return { kopf: zeilen[0] ?? [], zeilen: zeilen.slice(1).filter((z) => !z.every((zelle) => /^:?-+:?$/.test(zelle))) }
}

/** Text ab der Überschrift, die `titel` enthält, bis vor die nächste Überschrift gleicher Stufe. */
export function abschnitt(text: string, stufe: string, titel: string): string {
  const zeilen = text.split('\n')
  const start = zeilen.findIndex((zeile) => zeile.startsWith(`${stufe} `) && zeile.includes(titel))
  if (start < 0) {
    throw new Error(`abschnitt: Überschrift „${stufe} … ${titel}“ nicht gefunden`)
  }
  const rest = zeilen.slice(start + 1)
  const stopp = rest.findIndex((zeile) => zeile.startsWith(`${stufe} `))
  return (stopp < 0 ? rest : rest.slice(0, stopp)).join('\n')
}

/** Text des Feldes `**Name:** …` in einem Block, ohne den Namen; leer, wenn es fehlt. */
export function feld(block: string, name: string): string {
  return new RegExp(`^\\*\\*${name}:\\*\\* (.+)$`, 'm').exec(block)?.[1].trim() ?? ''
}

/** Buchstaben am Anfang eines Feldes („b“ oder „a, c“), sonst undefined. */
export function buchstabenAm(text: string): string | undefined {
  return /^([a-z](?:, [a-z])*)\b/.exec(text)?.[1]
}

/** Möglichkeiten `- **a)** …` in der Reihenfolge des Blocks: Buchstabe → Text. */
function moeglichkeitenMitText(block: string): Map<string, string> {
  return new Map([...block.matchAll(/^- \*\*([a-z])\)\*\* (\S.*)$/gm)].map((t) => [t[1], t[2].trim()]))
}

/** Buchstaben der Möglichkeiten in der Reihenfolge des Blocks. */
export function moeglichkeiten(block: string): string[] {
  return [...moeglichkeitenMitText(block).keys()]
}

/** Text der Möglichkeit ohne den Buchstaben; leer, wenn es sie nicht gibt. */
export function moeglichkeitText(block: string, buchstabe: string): string {
  return moeglichkeitenMitText(block).get(buchstabe) ?? ''
}

/** Was eine Antwort wählt: „Freie Antwort“ oder ihre Buchstaben („b“, „a, c“). */
export function gewaehlt(antwort: string): string | undefined {
  return antwort.startsWith(FREI) ? FREI : buchstabenAm(antwort)
}

/** Task-IDs im Teil „nennt die Frage: …“ des Feldes „Betroffene Tasks“. */
export function nennendeTasks(betroffen: string): string[] {
  const teil = /nennt die Frage: (.*?)(?:Hängt davon ab:|$)/.exec(betroffen)?.[1] ?? ''
  return [...teil.matchAll(TASK_ID)].map((treffer) => treffer[1])
}

/** Steht die Abschnittsnummer (A7.1, D9 …) als eigene Nummer im Text, nicht als Teil von A7.10? */
export function nenntStelle(text: string, stelle: string): boolean {
  const maskiert = stelle.replace(/\./g, '\\.')
  return new RegExp(`(?<![\\w.])${maskiert}(?!\\d|\\.\\d)`).test(text)
}

/** Die Fragen F und G aus den Tabellen des Abschnitts „Offene Regelfragen“ im Plan. */
function fragenAusPlan(): PlanFrage[] {
  return abschnitt(plan, '##', 'Offene Regelfragen')
    .split('\n')
    .filter((zeile) => /^\|\s*[FG]\d+\s*\|/.test(zeile))
    .map((zeile) => {
      const [nr, stelle, frage, vorschlag] = zellen(zeile)
      return { nr, stelle, frage, vorschlag }
    })
}

/** Alle Task-IDs, die im Plan als Überschrift vorkommen. */
function taskIdsAusPlan(): Set<string> {
  const ids = new Set<string>()
  for (const zeile of plan.split('\n').filter((z) => /^#{3,4} /.test(z))) {
    for (const treffer of zeile.matchAll(TASK_ID)) ids.add(treffer[1])
  }
  return ids
}

/** Text jedes Task-Blocks im Plan (Abschnitte 4 bis 8), je Task-ID. */
function taskBloeckeAusPlan(): Map<string, string> {
  const bloecke = new Map<string, string>()
  const beginn = plan.indexOf('\n## 4. ')
  const ende = plan.search(/^## .*Offene Regelfragen/m)
  let aktuell: string | undefined
  for (const zeile of plan.slice(beginn, ende).split('\n')) {
    const kopf = /^(?:#{3,4} |- \*\*)(P0\.\d|[EXKOZ]\d+)\b/.exec(zeile)
    if (kopf) aktuell = kopf[1]
    else if (/^#{2,4} /.test(zeile)) aktuell = undefined
    if (aktuell) bloecke.set(aktuell, `${bloecke.get(aktuell) ?? ''}${zeile}\n`)
  }
  return bloecke
}

/** Je Frage oder Nachfrage die Tasks, deren Block im Plan sie erwähnt. */
function nennendeTasksAusPlan(bloecke: Map<string, string>): Map<string, Set<string>> {
  const zuordnung = new Map<string, Set<string>>()
  const merke = (nr: string, task: string) => zuordnung.set(nr, (zuordnung.get(nr) ?? new Set<string>()).add(task))
  for (const [task, text] of bloecke) {
    for (const [, art, von, nachfrage, bis] of text.matchAll(FRAGE_ODER_BEREICH)) {
      if (nachfrage) merke(`${art}${von}${nachfrage}`, task)
      else for (let n = Number(von); n <= Number(bis ?? von); n++) merke(`${art}${n}`, task)
    }
  }
  return zuordnung
}

/** Fragenblöcke von docs/REGELFRAGEN.md, je ab `### F1: …` oder `### F8a: …`, in der Reihenfolge der Datei. */
function fragenbloeckeLesen(): Map<string, string> {
  const bloecke = new Map<string, string>()
  for (const teil of regelfragen.split(/^(?=#{2,3} )/m)) {
    const kopf = /^### ([FG]\d+[a-z]?): \S/.exec(teil)
    if (kopf) bloecke.set(kopf[1], teil)
  }
  return bloecke
}

/** Einträge in Teil D, die eine Regelfrage beantworten („F1: …?“ in der Spalte „Frage“), je Fragennummer. */
function beantworteteInTeilD(): Map<string, TeilDEintrag> {
  const { kopf, zeilen } = teilDTabelle
  const [nr, frage, antwort, datum] = ['Nr.', 'Frage', 'Antwort', 'Datum'].map((name) => kopf.indexOf(name))
  const eintraege = new Map<string, TeilDEintrag>()
  for (const zeile of zeilen) {
    const bezug = /^([FG]\d+[a-z]?): /.exec(zeile[frage] ?? '')
    if (!bezug) continue
    eintraege.set(bezug[1], {
      nr: zeile[nr] ?? '',
      frage: (zeile[frage] ?? '').slice(bezug[0].length),
      antwort: zeile[antwort] ?? '',
      datum: zeile[datum] ?? '',
    })
  }
  return eintraege
}

export const planFragen = fragenAusPlan()
export const planTaskIds = taskIdsAusPlan()
export const planBloecke = taskBloeckeAusPlan()
export const planNennungen = nennendeTasksAusPlan(planBloecke)
export const specNormalisiert = normalisiert(spec)
export const teilDTabelle = tabelle(abschnitt(spec, '##', 'Teil D'))
export const teilD = beantworteteInTeilD()
export const bloecke = fragenbloeckeLesen()
export const nachfragen = [...bloecke.keys()].filter((nr) => NACHFRAGE.test(nr))
/** Anleitung und Übersichtstabelle: alles vor der ersten Fragenüberschrift. */
export const kopf = regelfragen.split(/^### [FG]\d+: /m)[0]
