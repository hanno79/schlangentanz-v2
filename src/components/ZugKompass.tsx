/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Board-naher Zugkompass fuer gefuehrte Phasenwechsel im Waldtanz-Spieltisch.
*/

import type { Spielzustand } from '../engine'
import { zugphaseLabel } from '../zugphaseLabels'

interface ZugKompassProps {
  zustand: Spielzustand
  ueberhand: number
  zeigtKiVorspulen: boolean
  kiZugProtokoll: string[]
  onAusspielphaseBeenden: () => void
  onAufgabenpruefungBeenden: () => void
  onUeberzaehligeKartenAbwerfen: () => void
  onZugBeenden: () => void
  onAusspielphaseStarten: () => void
  onKiZugVorspulen: () => void
}

function statusLabel(zustand: Spielzustand, zeigtKiVorspulen: boolean): string {
  if (zustand.zugphase === 'Spielende') return 'Partie beendet'
  if (zustand.pendingReaktion) return 'Reaktion steht aus'
  if (zeigtKiVorspulen) return 'KI ist am Zug'
  return 'Du bist dran'
}

function hinweisLabel(zustand: Spielzustand, ueberhand: number, zeigtKiVorspulen: boolean): string {
  if (zustand.pendingReaktion) return 'Wähle zuerst eine Reaktionsaktion im Aktionenbereich, bevor der Zug weiterläuft.'
  if (zeigtKiVorspulen) return 'Spule die Gegnerzüge vor, bis der Waldpfad wieder bei dir landet.'
  switch (zustand.zugphase) {
    case 'Ausspielphase':
      return zustand.zugpflichten.gespielteKarten > 0
        ? 'Deine Karte liegt auf dem Brett. Führe den Zug zur Aufgabenprüfung weiter.'
        : 'Wähle eine Handkarte und spiele sie direkt im Schlangenbereich, bevor du den Zug weiterführst.'
    case 'Aufgabenpruefung':
      return 'Prüfe deine offenen und geheimen Aufgaben, dann geht es zum Zugabschluss.'
    case 'Zugabschluss':
      return ueberhand > 0
        ? 'Wirf zuerst überzählige Handkarten ab, dann kann der nächste Spieler losziehen.'
        : 'Dein Zug ist bereit für den nächsten Spieler auf dem Waldpfad.'
    case 'Nachziehphase':
      return 'Starte die Ausspielphase, sobald deine Hand bereit ist.'
    case 'Spielende':
      return 'Die Partie ist beendet. Die Sieger-Party zeigt das Ergebnis.'
  }
}

function zugknopf(label: string, onClick: () => void) {
  return (
    <button type="button" className="zugkompass__hauptaktion" aria-label={label} onClick={onClick}>
      <span aria-hidden="true" className="zugkompass__hauptaktion-kicker">Zugknopf</span>
      <span aria-hidden="true" className="zugkompass__hauptaktion-label">{label}</span>
      <span aria-hidden="true" className="zugkompass__hauptaktion-pfeil">→</span>
    </button>
  )
}

export default function ZugKompass({
  zustand,
  ueberhand,
  zeigtKiVorspulen,
  kiZugProtokoll,
  onAusspielphaseBeenden,
  onAufgabenpruefungBeenden,
  onUeberzaehligeKartenAbwerfen,
  onZugBeenden,
  onAusspielphaseStarten,
  onKiZugVorspulen,
}: ZugKompassProps) {
  const blockiertDurchReaktion = zustand.pendingReaktion !== null
  const zeigtWeiterZurAufgabenpruefung = !blockiertDurchReaktion && !zeigtKiVorspulen && zustand.zugphase === 'Ausspielphase' && zustand.zugpflichten.gespielteKarten > 0
  const zeigtGegnerzugStatus = !zeigtKiVorspulen && kiZugProtokoll.length > 0 && zustand.spieler[zustand.aktiverSpielerIndex].steuerung === 'Mensch'

  return (
    <section className="zugkompass" aria-label="Zugkompass">
      <div className="zugkompass__kopf">
        <h4>Zugkompass</h4>
        <span className="zugkompass__status">{statusLabel(zustand, zeigtKiVorspulen)}</span>
        <span className="zugkompass__phase">{zugphaseLabel(zustand.zugphase)}</span>
      </div>
      <p>{hinweisLabel(zustand, ueberhand, zeigtKiVorspulen)}</p>
      {zeigtGegnerzugStatus && <p className="zugkompass__feedback">Gegnerzug abgeschlossen. Du bist wieder dran.</p>}
      <div className="zugkompass__aktionen">
        {!blockiertDurchReaktion && zeigtKiVorspulen && zugknopf('Gegnerzüge bis zu deinem Zug abspielen', onKiZugVorspulen)}
        {zeigtWeiterZurAufgabenpruefung && zugknopf('Weiter zur Aufgabenprüfung', onAusspielphaseBeenden)}
        {!blockiertDurchReaktion && !zeigtKiVorspulen && zustand.zugphase === 'Aufgabenpruefung' && zugknopf('Weiter zum Zugabschluss', onAufgabenpruefungBeenden)}
        {!blockiertDurchReaktion && !zeigtKiVorspulen && zustand.zugphase === 'Zugabschluss' && ueberhand > 0 && zugknopf('Überzählige Karten abwerfen', onUeberzaehligeKartenAbwerfen)}
        {!blockiertDurchReaktion && !zeigtKiVorspulen && zustand.zugphase === 'Zugabschluss' && ueberhand === 0 && zugknopf('Zug an nächsten Spieler geben', onZugBeenden)}
        {!blockiertDurchReaktion && !zeigtKiVorspulen && zustand.zugphase === 'Nachziehphase' && zugknopf('Ausspielphase starten', onAusspielphaseStarten)}
      </div>
    </section>
  )
}
