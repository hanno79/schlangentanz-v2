/*
Author: Claude Code (G-12)
Datum: 01.08.2026
Version: 1.0
Beschreibung: Wem gehört ein offenes Reaktionsfenster?

Das Reaktionsfenster gehört dem **Angegriffenen**, nicht dem Zugspieler. Solange
eines offen ist, liefert `ermittleLegaleAktionen` ein leeres Array und die Engine
lehnt jede andere Aktion ab.

Diese Frage wurde an drei Stellen getrennt beantwortet — über einen `switch` in
`kiZug.ts`, über `ermittleReaktionsAktionen(...)[0].spielerId` im Hook und noch
einmal im Brett, um den Namen anzuzeigen. Drei Herleitungen sind drei
Gelegenheiten, eine neue Reaktionsart zu vergessen; genau daraus entstand der
Fehler vom 01.08.2026, bei dem der Mensch über den Farbenschutz eines Gegners
entscheiden sollte.

Hier steht sie einmal. Die Datei liegt in der gemeinsamen Logikschicht neben
`kiZug.ts`, nicht im Brett: Engine, KI-Automatik, Hook und Ansicht brauchen
dieselbe Antwort, und im Brett läge sie auf der falschen Seite der
Einbahnrichtung engine ← Logik ← Hooks ← Ansicht.
*/

import type { Spieler, Spielzustand } from './engine'

/**
 * Der Spieler, der gerade entscheiden muss — oder `null`, wenn niemand wartet.
 *
 * Abgeleitet direkt aus `pendingReaktion`, nicht aus den enumerierten
 * Reaktionsaktionen: Die Zuständigkeit steht im Zustand, die Aktionen sind nur
 * ihre Ausprägung. Der Verdoppler geht reihum, der Schlangenfrass pro Zielkarte
 * — bei beiden ist der Verteidiger der jeweils nächste in der Warteschlange.
 */
export function reaktionsVerteidiger(zustand: Spielzustand): Spieler | null {
  const pending = zustand.pendingReaktion
  if (pending === null) return null

  const index = (() => {
    switch (pending.typ) {
      case 'SchlangengrubeAbwehr':
      case 'SchlangenblockadeAbwehr':
      case 'FarbendiebAbwehr':
        return pending.zielSpielerIndex
      case 'VerdopplerAbwehr':
        return pending.verbleibendeSpielerIndizes[0] ?? null
      case 'SchlangenfrassAbwehr':
        return pending.verbleibendeZiele[0]?.spielerIndex ?? null
      default: {
        /* Eine neue Reaktionsart soll hier auffallen, solange sie noch
           kostenlos zu beheben ist: Der Compiler meldet sie, weil sie nicht
           mehr `never` ist. Genau das Vergessen einer Variante hat den Fehler
           vom 01.08.2026 erzeugt. */
        const nichtErfassterFall: never = pending
        return nichtErfassterFall
      }
    }
  })()

  return index === null ? null : (zustand.spieler[index] ?? null)
}

/**
 * Muss ein *Mensch* auf einen Angriff antworten?
 *
 * Ist der Angegriffene eine KI, entscheidet sie selbst. Dem Menschen die Knöpfe
 * hinzustellen hieße, ihn über den Farbenschutz auf einer fremden Hand
 * entscheiden zu lassen.
 */
export function mussMenschReagieren(zustand: Spielzustand): boolean {
  return reaktionsVerteidiger(zustand)?.steuerung === 'Mensch'
}
