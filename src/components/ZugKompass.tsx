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
        {!blockiertDurchReaktion && zeigtKiVorspulen && <button type="button" onClick={onKiZugVorspulen}>Gegnerzüge bis zu deinem Zug abspielen</button>}
        {zeigtWeiterZurAufgabenpruefung && <button type="button" onClick={onAusspielphaseBeenden}>Weiter zur Aufgabenprüfung</button>}
        {!blockiertDurchReaktion && !zeigtKiVorspulen && zustand.zugphase === 'Aufgabenpruefung' && <button type="button" onClick={onAufgabenpruefungBeenden}>Weiter zum Zugabschluss</button>}
        {!blockiertDurchReaktion && !zeigtKiVorspulen && zustand.zugphase === 'Zugabschluss' && ueberhand > 0 && <button type="button" onClick={onUeberzaehligeKartenAbwerfen}>Überzählige Karten abwerfen</button>}
        {!blockiertDurchReaktion && !zeigtKiVorspulen && zustand.zugphase === 'Zugabschluss' && ueberhand === 0 && <button type="button" onClick={onZugBeenden}>Zug an nächsten Spieler geben</button>}
        {!blockiertDurchReaktion && !zeigtKiVorspulen && zustand.zugphase === 'Nachziehphase' && <button type="button" onClick={onAusspielphaseStarten}>Ausspielphase starten</button>}
      </div>
    </section>
  )
}
