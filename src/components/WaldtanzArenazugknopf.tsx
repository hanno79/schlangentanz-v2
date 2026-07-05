/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Prominente Waldtanz-Zugaktion an der Hand-/Brettkante fuer den naechsten Phasenschritt.
*/
import type { Spielzustand } from '../engine'
import { ausspielphaseBeendbar } from '../spielLabelHelpers'

interface WaldtanzArenazugknopfProps {
  id?: string
  hervorgehoben?: boolean
  zustand: Spielzustand
  ueberhand: number
  zeigtKiVorspulen: boolean
  onAusspielphaseBeenden: () => void
  onAufgabenpruefungBeenden: () => void
  onUeberzaehligeKartenAbwerfen: () => void
  onZugBeenden: () => void
  onAusspielphaseStarten: () => void
}

type ArenazugAktion = { label: string; onClick: () => void }

function ermittleArenazugAktion({
  zustand,
  ueberhand,
  zeigtKiVorspulen,
  onAusspielphaseBeenden,
  onAufgabenpruefungBeenden,
  onUeberzaehligeKartenAbwerfen,
  onZugBeenden,
  onAusspielphaseStarten,
}: WaldtanzArenazugknopfProps): ArenazugAktion | null {
  if (zustand.pendingReaktion || zeigtKiVorspulen) return null
  if (ausspielphaseBeendbar(zustand)) return { label: 'Weiter zur Aufgabenprüfung', onClick: onAusspielphaseBeenden }
  if (zustand.zugphase === 'Aufgabenpruefung') return { label: 'Weiter zum Zugabschluss', onClick: onAufgabenpruefungBeenden }
  if (zustand.zugphase === 'Zugabschluss' && ueberhand > 0) return { label: 'Überzählige Karten abwerfen', onClick: onUeberzaehligeKartenAbwerfen }
  if (zustand.zugphase === 'Zugabschluss') return { label: 'Zug an nächsten Spieler geben', onClick: onZugBeenden }
  if (zustand.zugphase === 'Nachziehphase') return { label: 'Ausspielphase starten', onClick: onAusspielphaseStarten }
  return null
}

function statusText(zustand: Spielzustand, hatAktion: boolean, zeigtKiVorspulen: boolean): string {
  if (hatAktion) return 'Dein Brettzug ist bereit.'
  if (zeigtKiVorspulen) return 'Gegnerzug läuft über die Zugbühne.'
  if (zustand.pendingReaktion) return 'Reaktion zuerst im Zugkompass entscheiden.'
  if (zustand.zugphase === 'Spielende') return 'Die Sieger-Party läuft.'
  // M2x (2026-06-30): Default-Hinweis wechselt von "Spiele zuerst eine
  // Handkarte auf dem Brett." zu einem dezenten "Wähle eine Karte"-Hinweis
  // — die Handkarten-Bühne ist jetzt selbst der sichtbare Hinweis (mit
  // ihren 3 Karten, Eyebrow + Spielbarkeit-Pille). Der alte "Spiele
  // zuerst"-Satz war redundant und klang nach Click-Simulator-Belehrung.
  return 'Wähle eine Karte und nutze die leuchtenden Brettziele.'
}

export default function WaldtanzArenazugknopf(props: WaldtanzArenazugknopfProps) {
  const aktion = ermittleArenazugAktion(props)

  return (
    <section id={props.id} tabIndex={props.id ? -1 : undefined} className={`waldtanz-arenazug${aktion ? ' waldtanz-arenazug--bereit' : ' waldtanz-arenazug--wartet'}${props.hervorgehoben ? ' aktionen-gruppe--sprungziel' : ''}`} aria-label="Waldtanz-Zugaktion">
      <div className="waldtanz-arenazug__schild">
        <span className="waldtanz-arenazug__kicker">End Turn</span>
        <strong>{statusText(props.zustand, Boolean(aktion), props.zeigtKiVorspulen)}</strong>
      </div>
      {aktion ? (
        <button type="button" className="waldtanz-arenazug__hauptknopf" aria-label={aktion.label} onClick={aktion.onClick}>
          <span className="waldtanz-arenazug__knopftext">{aktion.label}</span>
          <span className="waldtanz-arenazug__pfeil" aria-hidden="true">→</span>
        </button>
      ) : (
        <p className="waldtanz-arenazug__wartehinweis">Wähle eine Karte und nutze die leuchtenden Brettziele.</p>
      )}
    </section>
  )
}
