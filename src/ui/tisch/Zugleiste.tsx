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
bedienbar, wenn die Engine es aufzählt. Lehnt die Engine eine Aktion ab, steht
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
function satz(ansicht: TischAnsicht, bedienung: Bedienung, karte: Spielkarte | null, abwerfen: number): string {
  if (ansicht.status.partiephase === 'Beendet') return ZUGLEISTE.beendet
  if (bedienung.aktionen.length === 0) return ansicht.status.schwebend?.entscheidet.ich ? statusText(ansicht.status).text : ZUGLEISTE.warten
  if (abwerfen > 0) return ABWERFEN.zugleiste(abwerfen)
  if (karte === null) {
    const karten = bedienung.angebote.some((wahl) => wahl.art === 'karte')
    const beenden = bedienung.aktionen.some((aktion) => aktion.typ === 'ZugBeenden')
    if (karten && beenden) return ZUGLEISTE.karteOderBeenden
    return karten ? ZUGLEISTE.karteWaehlen : ZUGLEISTE.nurBeenden
  }
  if (bedienung.fertig !== null) return `${ZUGLEISTE.ansage} ${ansage(bedienung.fertig, tischnamen(ansicht))}`
  return auftrag(bedienung.angebote, karte)
}

export function Zugleiste({ ansicht, bedienung, fuehreAus, ablehnung, zeigeGross, oeffneAbwerfen }: ZugleisteEigenschaften) {
  const karte = ansicht.ich.hand.find((handkarte) => handkarte.id === bedienung.karteId) ?? null
  const abwurf = bedienung.aktionen.find((aktion) => aktion.typ === 'UeberhandAbwerfen')
  const abwerfen = abwurf === undefined ? 0 : abwurf.karteIds.length
  const ausspielen = bedienung.aktionen.length > 0 && abwerfen === 0
  const zugBeenden = bedienung.aktionen.find((aktion) => aktion.typ === 'ZugBeenden')
  // Nur solange gewählt wird; die gewählte Möglichkeit nennt danach der Satz, und „Abbrechen“ führt zurück.
  const optionen = bedienung.angebote.filter((wahl) => wahl.art === 'frass')
  const { fertig } = bedienung

  return (
    <section className="st-zugleiste" aria-label={ZUGLEISTE.titel}>
      {karte !== null && (
        <div className="st-zugleiste-vorschau" aria-hidden="true">
          <Karte karte={karte} sizes="150px" />
        </div>
      )}
      <div className="st-zugleiste-inhalt">
        <p className="st-zugleiste-text" aria-live="polite">
          {satz(ansicht, bedienung, karte, abwerfen)}
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
            <span className="st-zugleiste-beenden">
              {zugBeenden === undefined && karte === null && <span className="st-zugleiste-grund">{ZUGLEISTE.mindestensEine}</span>}
              <button type="button" className="st-knopf" disabled={zugBeenden === undefined} onClick={() => zugBeenden !== undefined && fuehreAus(zugBeenden)}>
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
