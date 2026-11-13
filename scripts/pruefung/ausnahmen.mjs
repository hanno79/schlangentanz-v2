// Ausnahmeliste für den Altbestand (scripts/check_regeln_ausnahmen.json), gemeinsam
// für scripts/check_regeln.mjs (U1, U6, U7) und den Architekturtest (U4).
//
// Jeder geduldete Verstoss steht dort mit einem Merkmal, das ihn auch dann
// wiedererkennt, wenn er in eine andere Zeile rutscht: bei U1 der volle Testname,
// sonst der Inhalt der Zeile mit zusammengezogenem Leerraum. Geduldet ist genau
// diese Multimenge. Wer einen alten Verstoss behebt und einen neuen einbaut, fällt
// auf, auch wenn die Zahl gleich bleibt.
//
// Die Liste darf nur schrumpfen. `zuwachs` vergleicht sie mit der Fassung auf der
// Merge-Basis von HEAD und einem Vergleichsstand (Vorgabe origin/neuaufbau).

import { spawnSync } from 'node:child_process'

export const AUSNAHMEN_DATEI = 'scripts/check_regeln_ausnahmen.json'
export const VERGLEICH_VORGABE = 'origin/neuaufbau'
const REGELSCHLUESSEL = /^U\d+$/

function normalisiere(text) {
  return text.trim().replace(/\s+/g, ' ')
}

/** Merkmal eines Verstosses: Inhalt seiner Zeile (ab 1), Leerraum zusammengezogen. */
export function merkmalDerZeile(quelltext, zeile) {
  return normalisiere(quelltext.split('\n')[zeile - 1] ?? '')
}

/**
 * Gleicht gefundene Merkmale mit den erlaubten ab, beide als Multimenge.
 * `neu`: Stellen in `gefunden` ohne passendes erlaubtes Merkmal.
 * `veraltet`: erlaubte Merkmale, zu denen nichts gefunden wurde.
 */
export function abgleich(gefunden, erlaubt) {
  const offen = new Map()
  for (const merkmal of erlaubt) offen.set(merkmal, (offen.get(merkmal) ?? 0) + 1)
  const neu = []
  gefunden.forEach((merkmal, stelle) => {
    const anzahl = offen.get(merkmal) ?? 0
    if (anzahl > 0) offen.set(merkmal, anzahl - 1)
    else neu.push(stelle)
  })
  const veraltet = [...offen].flatMap(([merkmal, anzahl]) => Array(anzahl).fill(merkmal))
  return { neu, veraltet }
}

/** Regeln der Liste (`U1`, `U4` …), ohne Schlüssel wie `erklaerung`. */
function regelnDer(daten) {
  return Object.keys(daten).filter((schluessel) => REGELSCHLUESSEL.test(schluessel))
}

/** Wirft, wenn ein Eintrag keine Liste von Merkmalen ist (etwa noch eine Zahl wie vor P0.3b). */
export function pruefeFormat(daten) {
  for (const regel of regelnDer(daten)) {
    for (const [pfad, merkmale] of Object.entries(daten[regel] ?? {})) {
      if (!Array.isArray(merkmale) || !merkmale.every((merkmal) => typeof merkmal === 'string')) {
        throw new Error(`${AUSNAHMEN_DATEI}: ${regel} ${pfad} braucht je Verstoss ein Merkmal (Liste von Texten), gefunden ${JSON.stringify(merkmale)}`)
      }
    }
  }
}

/**
 * Merkmale, um die `aktuell` gegenüber `basis` gewachsen ist: neue Dateien, neue
 * Regeln, zusätzliche oder getauschte Merkmale. Steht in der Basis noch eine Zahl
 * (Format vor P0.3b), begrenzt sie nur die Anzahl.
 */
export function zuwachs(basis, aktuell) {
  const gewachsen = []
  for (const regel of regelnDer(aktuell)) {
    for (const [pfad, merkmale] of Object.entries(aktuell[regel] ?? {})) {
      const vorher = basis[regel]?.[pfad]
      const neu =
        typeof vorher === 'number'
          ? merkmale.slice(vorher)
          : abgleich(merkmale, Array.isArray(vorher) ? vorher : []).neu.map((stelle) => merkmale[stelle])
      for (const merkmal of neu) gewachsen.push({ regel, pfad, merkmal })
    }
  }
  return gewachsen
}

function git(wurzel, ...argumente) {
  const lauf = spawnSync('git', argumente, { cwd: wurzel, encoding: 'utf8' })
  return { ok: lauf.status === 0, ausgabe: (lauf.stdout ?? '').trim(), fehler: (lauf.stderr || lauf.error?.message || '').trim() }
}

/**
 * Fassung einer Ausnahmeliste (Vorgabe: die von check:regeln) auf der Merge-Basis
 * von HEAD und `vergleich`. Liefert `{ basis, daten }`; fehlt die Datei dort, ist
 * `daten` leer. Wirft mit einer Erklärung, wenn kein Repository oder der
 * Vergleichsstand fehlt.
 */
export function basisAusnahmen(wurzel, vergleich, liste = AUSNAHMEN_DATEI) {
  const mergeBasis = git(wurzel, 'merge-base', 'HEAD', vergleich)
  if (!mergeBasis.ok) {
    const repo = git(wurzel, 'rev-parse', '--is-inside-work-tree')
    if (!repo.ok) throw new Error(`kein git-Repository unter ${wurzel} (${repo.fehler || 'git fehlt'})`)
    throw new Error(`keine Merge-Basis von HEAD und „${vergleich}“ (${mergeBasis.fehler || 'Stand unbekannt'})`)
  }
  const basis = mergeBasis.ausgabe
  const datei = git(wurzel, 'show', `${basis}:./${liste}`)
  return { basis, daten: datei.ok ? JSON.parse(datei.ausgabe) : {} }
}
