// Probe-Bäume im Temp-Ordner für die Tests der Prüfwerkzeuge: Dateien anlegen, ein
// Werkzeug darauf laufen lassen, danach aufräumen.

import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

export const WURZEL = resolve(__dirname, '..')

/**
 * Zeitgrenze für Tests, die node-, git- oder python-Prozesse starten. Im vollen
 * Lauf teilen sie sich die Maschine mit allen anderen Testdateien; unter Windows
 * braucht ein Fall mit mehreren Prozessen dann länger als die Vorgabe von 5 s.
 */
export const MIT_PROZESSEN = { timeout: 30_000 }

const angelegt: string[] = []

/** Schreibt die Dateien unter `wurzel`; Schlüssel sind Pfade relativ zur Wurzel. */
export function schreibe(wurzel: string, dateien: Record<string, string>): void {
  for (const [pfad, inhalt] of Object.entries(dateien)) {
    const ziel = join(wurzel, pfad)
    mkdirSync(dirname(ziel), { recursive: true })
    writeFileSync(ziel, inhalt)
  }
}

/** Legt einen Probe-Baum im Temp-Ordner an; `raeumeAuf` löscht ihn wieder. */
export function legeAn(dateien: Record<string, string>): string {
  const wurzel = mkdtempSync(join(tmpdir(), 'probebaum-'))
  angelegt.push(wurzel)
  schreibe(wurzel, dateien)
  return wurzel
}

export function raeumeAuf(): void {
  for (const wurzel of angelegt.splice(0)) rmSync(wurzel, { recursive: true, force: true })
}

/** Umgebung ohne GIT_*-Variablen, damit ein äusserer git-Aufruf (Hook) die Probe nicht umlenkt. */
const umgebungOhneGit = () => Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith('GIT_')))

/** Führt ein Programm aus und liefert Exit-Code und Ausgabe (stdout und stderr). */
export function fuehreAus(programm: string, argumente: string[], cwd = WURZEL) {
  const lauf = spawnSync(programm, argumente, { cwd, encoding: 'utf8', env: umgebungOhneGit() })
  return { code: lauf.status, ausgabe: `${lauf.stdout}\n${lauf.stderr}` }
}

/** `node scripts/check_regeln.mjs --wurzel <wurzel> …` */
export function pruefeRegeln(wurzel: string, ...argumente: string[]) {
  return fuehreAus(process.execPath, [join(WURZEL, 'scripts', 'check_regeln.mjs'), '--wurzel', wurzel, ...argumente])
}

/** git im Probe-Baum, mit festem Namen für Commits; bricht bei einem Fehler ab. */
export function git(wurzel: string, ...argumente: string[]): void {
  const { code, ausgabe } = fuehreAus('git', ['-c', 'user.name=Probe', '-c', 'user.email=probe@example.invalid', ...argumente], wurzel)
  if (code !== 0) throw new Error(`git ${argumente.join(' ')}: ${ausgabe}`)
}

export function leseJson<T>(wurzel: string, pfad: string): T {
  return JSON.parse(readFileSync(join(wurzel, pfad), 'utf8')) as T
}
