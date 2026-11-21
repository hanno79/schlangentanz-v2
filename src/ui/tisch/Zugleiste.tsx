import { useId } from 'react'
import type { SpielAktion, Spielkarte } from '../../engine'
import { Karte } from '../karten/Karte'
import type { Bildkarte } from '../karten/kartenbilder'
import type { TischAnsicht } from '../spiel/tischAnsicht'
import type { Bedienung } from './bedienung'
import { statusText } from './texte'
import { ZielKnopf } from './Ziele'
import { ABWERFEN, FRASS_OPTION, ZUGLEISTE, ansage, auftrag, tischnamen } from './zugtexte'

/*
Die Zugleiste (Plan O5, DESIGN.md „Zugleiste“): ein Satz, was jetzt zu tun ist,
darunter die möglichen Schritte. Mit gewählter Karte: „Ansehen“, „Abbrechen“
und, sobald die Auswahl eine Aktion der Engine vollständig beschreibt, die
Ansage mit „Ausführen“ (B2: Karte und Ziel stehen vor dem Ausführen fest);
der Hauptknopf steht zuletzt.
„Zug beenden“ steht da, solange du deine Karten spielst, und ist genau dann
bedienbar, wenn die Engine es aufzählt; gesperrt steht der Grund der Engine
daneben. Lehnt die Engine eine Aktion ab, steht
ihr Grund hier.

Ab 700 px Breite steht die Leiste rechts neben Schlangen und Hand und zeigt
die gewählte Karte gross.
*/

interface ZugleisteEigenschaften {
  ansicht: TischAnsicht
  bedienung: Bedienung
  fuehreAus: (aktion: SpielAktion) => void
  ablehnung: string | null
  zeigeGross: (karte: Bildkarte) => void
  /** Öffnet den Dialog zum Abwerfen wieder, wenn er geschlossen wurde. */
  oeffneAbwerfen: () => void
}

/** Was die Leiste sagt; ohne Entscheidung des Menschen, was gerade geschieht. */
function satz(ansicht: TischAnsicht, bedienung: Bedienung, karte: Spielkarte | null): string {
  const { abwerfen } = bedienung
  if (ansicht.status.partiephase === 'Beendet') return statusText(ansicht.status).titel
  if (bedienung.aktionen.length === 0) return ansicht.status.schwebend?.entscheidet.ich ? statusText(ansicht.status).text : ZUGLEISTE.warten
  if (abwerfen > 0) return ABWERFEN.zugleiste(abwerfen)
  if (karte === null) {
    const karten = bedienung.angebote.some((wahl) => wahl.art === 'karte')
    if (karten && bedienung.zugBeenden !== null) return ZUGLEISTE.karteOderBeenden
    return karten ? ZUGLEISTE.karteWaehlen : ZUGLEISTE.nurBeenden
  }
  if (bedienung.fertig !== null) return `${ZUGLEISTE.ansage} ${ansage(bedienung.fertig, tischnamen(ansicht))}`
  return auftrag(bedienung.angebote, karte)
}

export function Zugleiste({ ansicht, bedienung, fuehreAus, ablehnung, zeigeGross, oeffneAbwerfen }: ZugleisteEigenschaften) {
  const karte = ansicht.ich.hand.find((handkarte) => handkarte.id === bedienung.karteId) ?? null
  // Nur solange gewählt wird; die gewählte Möglichkeit nennt danach der Satz, und „Abbrechen“ führt zurück.
  const optionen = bedienung.angebote.filter((wahl) => wahl.art === 'frass')
  const { fertig, zugBeenden, abwerfen, ausspielen } = bedienung
  // Der Grund der Engine, warum „Zug beenden“ gesperrt ist; er steht daneben, ob eine Karte gewählt ist oder nicht.
  const gesperrt = zugBeenden === null ? ansicht.zugBeendenGesperrt : null
  const grundId = useId()

  return (
    <section className="st-zugleiste" aria-label={ZUGLEISTE.titel}>
      {karte !== null && (
        <div className="st-zugleiste-vorschau" aria-hidden="true">
          <Karte karte={karte} sizes="150px" />
        </div>
      )}
      <div className="st-zugleiste-inhalt">
        <p className="st-zugleiste-text" aria-live="polite">
          {satz(ansicht, bedienung, karte)}
        </p>
        {ablehnung !== null && (
          <p className="st-zugleiste-fehler" role="alert">
            {ablehnung}
          </p>
        )}
        {optionen.length > 0 && (
          <div className="st-zugleiste-optionen">
            {optionen.map((wahl) => (
              <ZielKnopf key={wahl.option} wahl={wahl} name={FRASS_OPTION[wahl.option]} klasse="st-ziel--option">
                {FRASS_OPTION[wahl.option]}
              </ZielKnopf>
            ))}
          </div>
        )}
        <div className="st-zugleiste-knoepfe">
          {abwerfen > 0 && (
            <button type="button" className="st-knopf" onClick={oeffneAbwerfen}>
              {ZUGLEISTE.kartenWaehlen}
            </button>
          )}
          {ausspielen && (
            <span className={gesperrt === null ? 'st-zugleiste-beenden' : 'st-zugleiste-beenden st-zugleiste-beenden--gesperrt'}>
              {gesperrt !== null && (
                <span id={grundId} className="st-zugleiste-grund">
                  {gesperrt}
                </span>
              )}
              <button
                type="button"
                className="st-knopf"
                disabled={zugBeenden === null}
                aria-describedby={gesperrt === null ? undefined : grundId}
                onClick={() => zugBeenden !== null && fuehreAus(zugBeenden)}
              >
                {ZUGLEISTE.zugBeenden}
              </button>
            </span>
          )}
          {karte !== null && (
            <>
              <button type="button" className="st-knopf st-knopf--leise" onClick={() => zeigeGross(karte)}>
                {ZUGLEISTE.ansehen}
              </button>
              <button type="button" className="st-knopf" onClick={bedienung.hebeAuf}>
                {ZUGLEISTE.abbrechen}
              </button>
              {fertig !== null && (
                <button type="button" className="st-knopf st-knopf--haupt" onClick={() => fuehreAus(fertig)}>
                  {ZUGLEISTE.ausfuehren}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
