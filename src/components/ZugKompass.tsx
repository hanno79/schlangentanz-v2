/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Board-naher Zugkompass fuer gefuehrte Phasenwechsel im Waldtanz-Spieltisch.
*/

import { ermittleReaktionsAktionen, type SpielAktion, type Spielzustand } from '../engine'
import { aktionsLabel } from '../aktionsLabel'
import { zugphaseLabel } from '../zugphaseLabels'
import { ausspielphaseBeendbar } from '../spielLabelHelpers'

interface ZugKompassProps {
  zustand: Spielzustand
  ueberhand: number
  zeigtKiVorspulen: boolean
  kiZugProtokoll: string[]
  zeigeHauptaktionen?: boolean
  onAusspielphaseBeenden: () => void
  onAufgabenpruefungBeenden: () => void
  onUeberzaehligeKartenAbwerfen: () => void
  onZugBeenden: () => void
  onAusspielphaseStarten: () => void
  onKiZugVorspulen: () => void
  onReaktionsAktion: (aktion: SpielAktion) => void
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
      if (zustand.zugpflichten.gespielteKarten > 0) return 'Deine Karte liegt auf dem Brett. Führe den Zug zur Aufgabenprüfung weiter.'
      if (zustand.spieler[zustand.aktiverSpielerIndex].hand.length === 0) return 'Keine Handkarten mehr — führe den Zug zur Aufgabenprüfung weiter.'
      return 'Wähle eine Handkarte und spiele sie direkt im Schlangenbereich, bevor du den Zug weiterführst.'
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

function spielerName(zustand: Spielzustand, index: number): string {
  return zustand.spieler[index]?.name ?? `Spieler ${index + 1}`
}

function reaktionsText(zustand: Spielzustand): string {
  const pending = zustand.pendingReaktion
  if (!pending) return ''
  switch (pending.typ) {
    case 'SchlangenblockadeAbwehr':
      return `${spielerName(zustand, pending.zielSpielerIndex)} verteidigt ${pending.zielSchlangenId} gegen Schlangenblockade.`
    case 'FarbendiebAbwehr':
      return `${spielerName(zustand, pending.zielSpielerIndex)} verteidigt ${pending.zielKartenId} gegen Farbendieb.`
    case 'SchlangenfrassAbwehr': {
      const ziel = pending.verbleibendeZiele[0]
      return ziel ? `${spielerName(zustand, ziel.spielerIndex)} verteidigt ${ziel.kartenId} gegen Schlangenfrass.` : 'Schlangenfrass-Reaktion offen.'
    }
    case 'SchlangengrubeAbwehr':
      return `${spielerName(zustand, pending.zielSpielerIndex)} verteidigt sich gegen Schlangengrube.`
    case 'VerdopplerAbwehr':
      return `${spielerName(zustand, pending.verbleibendeSpielerIndizes[0] ?? pending.angreifenderSpielerIndex)} entscheidet über Verdoppler.`
  }
}

function abwehrKartenId(aktionen: SpielAktion[]): string | null {
  const abwehr = aktionen.find((aktion) => 'abwehrHandkartenId' in aktion)
  return abwehr && 'abwehrHandkartenId' in abwehr ? abwehr.abwehrHandkartenId : null
}

function reaktionsButtonLabel(aktion: SpielAktion): string {
  const label = aktionsLabel(aktion)
  return 'abwehrHandkartenId' in aktion ? `Farbenschutz-Schild einsetzen: ${label}` : `Treffer zulassen: ${label}`
}

function reaktionsButtonKlasse(aktion: SpielAktion): string {
  return 'abwehrHandkartenId' in aktion ? 'reaktionsschild__button reaktionsschild__button--abwehr' : 'reaktionsschild__button reaktionsschild__button--durchlassen'
}

export default function ZugKompass({
  zustand,
  ueberhand,
  zeigtKiVorspulen,
  kiZugProtokoll,
  zeigeHauptaktionen = true,
  onAusspielphaseBeenden,
  onAufgabenpruefungBeenden,
  onUeberzaehligeKartenAbwerfen,
  onZugBeenden,
  onAusspielphaseStarten,
  onKiZugVorspulen,
  onReaktionsAktion,
}: ZugKompassProps) {
  const blockiertDurchReaktion = zustand.pendingReaktion !== null
  const reaktionsAktionen = blockiertDurchReaktion ? ermittleReaktionsAktionen(zustand) : []
  const farbenschutzId = abwehrKartenId(reaktionsAktionen)
  const zeigtWeiterZurAufgabenpruefung = !blockiertDurchReaktion && !zeigtKiVorspulen && ausspielphaseBeendbar(zustand)
  const zeigtGegnerzugStatus = !zeigtKiVorspulen && kiZugProtokoll.length > 0 && zustand.spieler[zustand.aktiverSpielerIndex].steuerung === 'Mensch'

  return (
    <section className="zugkompass" aria-label="Zugkompass">
      <div className="zugkompass__kopf">
        <h4>Zugkompass</h4>
        <span className="zugkompass__status">{statusLabel(zustand, zeigtKiVorspulen)}</span>
        <span className="zugkompass__phase">{zugphaseLabel(zustand.zugphase)}</span>
      </div>
      <p>{hinweisLabel(zustand, ueberhand, zeigtKiVorspulen)}</p>
      {blockiertDurchReaktion && (
        <section className="zugkompass__reaktionsschild" aria-label="Waldtanz-Reaktionsschild">
          <div className="reaktionsschild__kopf">
            <strong>{farbenschutzId ? 'Farbenschutz bereit' : 'Reaktion entscheiden'}</strong>
            <span>Reaktionsfenster</span>
          </div>
          <p>{reaktionsText(zustand)}</p>
          {farbenschutzId ? <p className="reaktionsschild__karte">Farbenschutzkarte: {farbenschutzId}</p> : <p className="reaktionsschild__karte">Kein Farbenschutz auf der Hand. Du kannst den Treffer nur zulassen.</p>}
          <div className="reaktionsschild__aktionen">
            {reaktionsAktionen.map((aktion) => {
              const buttonLabel = reaktionsButtonLabel(aktion)
              return (
                <button key={buttonLabel} type="button" className={reaktionsButtonKlasse(aktion)} aria-label={buttonLabel} onClick={() => onReaktionsAktion(aktion)}>
                  <span aria-hidden="true">{'abwehrHandkartenId' in aktion ? 'Schild einsetzen' : 'Treffer zulassen'}</span>
                  <span aria-hidden="true" className="reaktionsschild__button-label">{aktionsLabel(aktion)}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}
      {zeigtGegnerzugStatus && <p className="zugkompass__feedback">Gegnerzug abgeschlossen. Du bist wieder dran.</p>}
      {zeigeHauptaktionen && (
        <div className="zugkompass__aktionen">
          {!blockiertDurchReaktion && zeigtKiVorspulen && zugknopf('Gegnerzüge bis zu deinem Zug abspielen', onKiZugVorspulen)}
          {zeigtWeiterZurAufgabenpruefung && zugknopf('Weiter zur Aufgabenprüfung', onAusspielphaseBeenden)}
          {!blockiertDurchReaktion && !zeigtKiVorspulen && zustand.zugphase === 'Aufgabenpruefung' && zugknopf('Weiter zum Zugabschluss', onAufgabenpruefungBeenden)}
          {!blockiertDurchReaktion && !zeigtKiVorspulen && zustand.zugphase === 'Zugabschluss' && ueberhand > 0 && zugknopf('Überzählige Karten abwerfen', onUeberzaehligeKartenAbwerfen)}
          {!blockiertDurchReaktion && !zeigtKiVorspulen && zustand.zugphase === 'Zugabschluss' && ueberhand === 0 && zugknopf('Zug an nächsten Spieler geben', onZugBeenden)}
          {!blockiertDurchReaktion && !zeigtKiVorspulen && zustand.zugphase === 'Nachziehphase' && zugknopf('Ausspielphase starten', onAusspielphaseStarten)}
        </div>
      )}
    </section>
  )
}
