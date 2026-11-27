import './abwerfen.css'
import { useEffect, useId, useRef } from 'react'
import type { SpielAktion, Spielkarte } from '../../engine'
import { Karte } from '../karten/Karte'
import { kartenname } from '../karten/kartentexte'
import type { Bedienung } from './bedienung'
import { KnopfMitGrund } from './KnopfMitGrund'
import { ABWERFEN } from './zugtexte'

/*
Zu viele Handkarten am Zugende (Plan O5, Kriterium 8; A5): Der Mensch wählt
selbst, welche Karten er auf seinen Ablagestapel legt. Die Engine zählt jede
erlaubte Auswahl als eigene Aktion auf; der Dialog nimmt die Wahl über
`auswahl` entgegen und bietet „Ablegen“ erst an, wenn sie eine dieser Aktionen
vollständig beschreibt. Mit so vielen gewählten Karten ist keine weitere
wählbar; eine gewählte wieder anzutippen nimmt sie zurück.

Ein modaler Dialog, der den Tisch dahinter zeigt. „Zum Tisch“ und Escape
schliessen ihn, ohne die Wahl zu verlieren; die Zugleiste öffnet ihn wieder.
*/

interface DialogEigenschaften {
  hand: readonly Spielkarte[]
  bedienung: Bedienung
  fuehreAus: (aktion: SpielAktion) => void
  schliesse: () => void
}

export function UeberhandDialog({ hand, bedienung, fuehreAus, schliesse }: DialogEigenschaften) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titelId = useId()
  const { abwerfen } = bedienung
  if (abwerfen === 0) throw new Error('Der Dialog zum Abwerfen ist offen, aber die Engine verlangt kein Abwerfen (A5).')
  const gewaehlt = bedienung.auswahl.length
  const { fertig } = bedienung

  useEffect(() => {
    const element = dialog.current
    if (element !== null && !element.open) element.showModal()
  }, [])

  return (
    <dialog ref={dialog} className="st-abwerfen" aria-labelledby={titelId} onClose={schliesse}>
      <div className="st-abwerfen-koerper">
        <h2 id={titelId} className="st-abwerfen-titel">
          {ABWERFEN.titel}
        </h2>
        <p>{ABWERFEN.text(hand.length, abwerfen)}</p>
        <ul className="st-abwerfen-karten">
          {hand.map((karte) => {
            const wahl = { art: 'abwerfen', karteId: karte.id } as const
            const gedrueckt = bedienung.gewaehlt(wahl)
            return (
              <li key={karte.id}>
                <button
                  type="button"
                  className="st-handkarte"
                  aria-label={kartenname(karte)}
                  aria-pressed={gedrueckt}
                  disabled={!gedrueckt && !bedienung.angeboten(wahl)}
                  onClick={() => bedienung.tippe(wahl)}
                >
                  <Karte karte={karte} sizes="80px" />
                </button>
              </li>
            )
          })}
        </ul>
        <p className="st-abwerfen-zahl" aria-live="polite">
          {ABWERFEN.gewaehlt(gewaehlt, abwerfen)}
        </p>
      </div>
      <div className="st-abwerfen-fuss">
        <button type="button" className="st-knopf st-knopf--leise" onClick={() => dialog.current?.close()}>
          {ABWERFEN.zumTisch}
        </button>
        <KnopfMitGrund klasse="st-knopf st-knopf--haupt" aktion={fertig} grund={ABWERFEN.noch(abwerfen - gewaehlt)} fuehreAus={fuehreAus}>
          {ABWERFEN.ablegen}
        </KnopfMitGrund>
      </div>
    </dialog>
  )
}
