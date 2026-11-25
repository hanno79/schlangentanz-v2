import type { Korbbonus, Risikoaktion } from '../../engine'
import type { Person } from '../spiel/tischAnsicht'

/*
Die Texte der Erweiterung am Tisch (O10) an einer Stelle (docs/regeln/web.md,
„Texte“): Auslage, Aufgaben, Comeback-Karte, Risiko-Belohnungs-Karte und
Schlangenkorb. Was eine Entscheidung fragt und wie ihre Wahl heisst, steht in
`entscheidungstexte.ts`. Wo ein Satz aus der Spielanleitung stammt, steht der
Abschnitt daneben; eine Regel steht hier keine.
*/

export const ERWEITERUNG = {
  erfuellteAufgaben: 'Erfüllte Aufgaben',
  // D35: Ob deine geheime Aufgabe erfüllt ist, siehst nur du.
  geheimErfuellt: 'geheim, erfüllt',
  einsetzbar: 'einsetzbar',
  aufgedeckt: 'Aufgedeckt',
  aufgabeErfuellt: 'Aufgabe erfüllt',
  comebackEinsetzen: 'Comeback einsetzen',
  risikoSpielen: 'Risiko spielen',
  // A8.1, D49: die Zusatzaktion ohne Karte.
  zweiAbwerfen: '2 abwerfen, 3 ziehen',
}

/** Was im Kopf eines Gegners von seiner Auslage steht (A4): Comeback-Karte, Risiko-Karten, erfüllte Aufgaben. */
export const GEGNER_AUSLAGE = {
  comeback: (verbraucht: boolean) => `Comeback ${verbraucht ? 'verbraucht' : 'offen'}`,
  risiko: (anzahl: number) => (anzahl === 1 ? '1 Risiko-Karte' : `${anzahl} Risiko-Karten`),
  aufgaben: (namen: readonly string[]) => `Aufgaben: ${namen.join(', ')}`,
}

/**
 * Die vier Boni des Schlangenkorbs und die vier Risiko-Aktionen, kurz für die
 * Knöpfe, damit sie in Handy quer nebeneinander passen. Den ganzen Wortlaut
 * sagt danach die Ansage, die Grossansicht zeigt den Kartentext (A7.10, A8.2).
 */
export const KORB_BONUS: Readonly<Record<Korbbonus['art'], string>> = {
  ziehen: 'Ziehe 3 Karten, spiele 2',
  tauschen: 'Tausche bis zu 2 Karten',
  entfernen: 'Entferne eine Sonderkarte',
  aktionen: 'Zwei zusätzliche Aktionen',
}

export const RISIKOAKTION: Readonly<Record<Risikoaktion, string>> = {
  1: 'Aktion 1: Karten ziehen',
  2: 'Aktion 2: Farbkarte spielen',
  3: 'Aktion 3: Karten tauschen',
  4: 'Aktion 4: Karte nehmen',
}

/** Was im nächsten Schritt der Erweiterung zu wählen ist (Zugleiste). */
export const AUFTRAG = {
  risikoaktion: 'Wähle die Risiko-Aktion.',
  // A8.2, D52: „Vor dem Aufdecken benennt der Spieler eine Farbkarte seiner Hand“; die Ansage ist offen (D77).
  benanntHand: 'Sage die Farbkarte deiner Hand an, die du zusätzlich anlegen willst. Die Ansage ist für alle offen.',
  // A8.2 Aktion 3: „Benenne vor dem Risiko-Check, welche Karte in deiner Schlange du tauschen möchtest“.
  benanntSchlange: 'Wähle die Farbkarte deiner Schlange, die du tauschen willst.',
  korbbonus: 'Wähle einen der Boni des Schlangenkorbs.',
  tausch: 'Tippe eine Farbkarte deiner Schlange an, dann die Handkarte, die an ihren Platz kommt.',
  tauschHand: 'Tippe die Handkarte an, die an ihren Platz kommt.',
  zweiterTausch: 'Du kannst noch eine zweite Karte tauschen.',
  entfernen: 'Wähle die Karte, die der Schlangenkorb entfernt.',
  // D49: Wie viele Karten es sind, sagt die Engine mit ihren Aktionen; „Ausführen“ steht da, sobald die Auswahl vollständig ist.
  abwerfen: 'Wähle die Karten, die du abwirfst.',
}

/** Die Ansagen der Erweiterung vor dem Ausführen (B2). */
export const ERWEITERUNG_ANSAGE = {
  // A8.1: „Bei Aktivierung erhält der Spieler zwei zusätzliche Aktionen in seinem Zug.“
  comeback: 'Comeback-Karte: zwei zusätzliche Aktionen in diesem Zug.',
  risiko: (aktion: string, benannt: string | null) => `Risiko-Belohnungs-Karte: ${aktion}${benannt === null ? '' : `, angesagt: ${benannt}`}.`,
  zweiAbwerfen: (karten: readonly string[]) => `${karten.join(' und ')} abwerfen, dann drei Karten ziehen.`,
  korbZiehen: (korb: string) => `${korb}: 3 Karten ziehen und bis zu 2 davon ausspielen.`,
  korbAktionen: (korb: string) => `${korb}: zwei zusätzliche Aktionen in diesem Zug.`,
  korbTausch: (korb: string, tausch: readonly string[]) => `${korb}: ${tausch.join(' und ')}.`,
  korbEntfernen: (korb: string, karte: string, schlange: string) => `${korb}: ${karte} aus ${schlange} entfernen.`,
}

/** Die Zusatzaktionen des Teilzugs in der Statuszeile (A8.1, A7.10). */
export const zusatzaktionenText = (anzahl: number): string => (anzahl === 1 ? '1 Zusatzaktion' : `${anzahl} Zusatzaktionen`)

/** „Du“ oder der Name, am Satzanfang mit dem passenden Verb. */
export const satzanfang = (person: Person, du: string, er: string): string => (person.ich ? du : `${person.name} ${er}`)

/** „deine Hand“ oder „die Hand von KI-Gegner 1“ (Akkusativ, weiblich). */
const dieVon = (wer: Person, ding: string): string => (wer.ich ? `deine ${ding}` : `die ${ding} von ${wer.name}`)

/** Die Sätze des Protokolls zur Risiko-Belohnungs-Karte und zu offenen Karten, die wandern (A8.2, D51). */
export const RISIKO_SCHRITT = {
  aufgedeckt: (karte: string, erfolg: boolean) => `Aufgedeckt wird ${karte}: ${erfolg ? 'Erfolg' : 'Misserfolg'}.`,
  aufHand: (karte: string, wer: Person) => `${karte} kommt auf ${dieVon(wer, 'Hand')}.`,
  aufAblage: (karte: string, wer: Person) => `${karte} kommt auf ${dieVon(wer, 'Ablage')}.`,
  /** `schlange` im Akkusativ: „deine Schlange 1“ (`schlangeImSatz`). */
  inSchlange: (karte: string, schlange: string) => `${karte} kommt in ${schlange}.`,
  verdecktAufHand: (anzahl: number, wer: Person) => `${anzahl === 1 ? 'Eine Karte kommt' : `${anzahl} Karten kommen`} auf ${dieVon(wer, 'Hand')}.`,
}
