import { useId } from 'react'
import type { ReactNode } from 'react'
import type { SpielAktion, Spielkarte } from '../../engine'
import { Karte } from '../karten/Karte'
import type { Bildkarte } from '../karten/kartenbilder'
import type { TischAnsicht } from '../spiel/tischAnsicht'
import type { Verlauf } from '../spiel/useSpiel'
import { abwehrfrageOffen } from './bedienung'
import type { Bedienung } from './bedienung'
import { useLaufendeHaeutung } from './haeutung'
import type { Haeutung } from './haeutung'
import { PROTOKOLL } from './protokolltexte'
import { ReaktionsDialog } from './ReaktionsDialog'
import { statusText } from './texte'
import { ZielKnopf } from './Ziele'
import { ABWERFEN, FRASS_OPTION, HAEUTUNG, ZUGLEISTE, ansage, auftrag, tischnamen } from './zugtexte'

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

Beim Ordnen einer Schlangenhäutung (O7) stehen hier die Punkte des Besitzers
vorher und nachher, aus der Vorschau der Engine. Solange die Farbfolge
dieselbe ist, steht „Ausführen“ gesperrt in der Reihe der Knöpfe, und der Satz
darüber nennt den Grund (D26); eine eigene Zeile dafür nähme der Tischfläche in
Handy quer zu viel Höhe.

Ab 700 px Breite steht die Leiste rechts neben Schlangen und Hand und zeigt
die gewählte Karte gross.

Mit O6: Greift dich ein Gegner an, steht hier die Abwehrfrage, die angesagte
Karte gross daneben. Spielt ein Gegner, steht hier sein jüngster Schritt aus
dem Protokoll und „Schneller“. Hast du ausgesetzt, sagt es ein Hinweis, bis du
wieder handelst.
*/

interface ZugleisteEigenschaften {
  ansicht: TischAnsicht
  bedienung: Bedienung
  fuehreAus: (aktion: SpielAktion) => void
  ablehnung: string | null
  verlauf: Verlauf | undefined
  zeigeGross: (karte: Bildkarte) => void
  /** Öffnet den Dialog zum Abwerfen wieder, wenn er geschlossen wurde. */
  oeffneAbwerfen: () => void
}

/** Der jüngste Schritt aus dem Protokoll, alle seine Sätze; `null`, wenn noch keiner da ist. */
function juengsterSchritt(verlauf: Verlauf | undefined): string | null {
  const eintraege = verlauf?.eintraege ?? []
  const schritt = eintraege.at(-1)?.schritt
  if (schritt === undefined) return null
  let anfang = eintraege.length - 1
  while (anfang > 0 && eintraege[anfang - 1].schritt === schritt) anfang -= 1
  return eintraege.slice(anfang).map((eintrag) => eintrag.text).join(' ')
}

/** Was die Leiste sagt; ohne Entscheidung des Menschen, was gerade geschieht. */
function satz(ansicht: TischAnsicht, bedienung: Bedienung, karte: Spielkarte | null, fertig: SpielAktion | null, haeutung: Haeutung | null, verlauf: Verlauf | undefined): string {
  const { abwerfen } = bedienung
  if (ansicht.status.partiephase === 'Beendet') return statusText(ansicht.status).titel
  if (bedienung.aktionen.length === 0) return juengsterSchritt(verlauf) ?? ZUGLEISTE.warten
  if (abwerfen > 0) return ABWERFEN.zugleiste(abwerfen)
  if (karte === null) {
    const karten = bedienung.angebote.some((wahl) => wahl.art === 'karte')
    if (karten && bedienung.zugBeenden !== null) return ZUGLEISTE.karteOderBeenden
    return karten ? ZUGLEISTE.karteWaehlen : ZUGLEISTE.nurBeenden
  }
  if (fertig !== null) return `${ZUGLEISTE.ansage} ${ansage(fertig, tischnamen(ansicht))}`
  if (haeutung !== null) {
    // Ohne neue Farbfolge sagt der Satz zugleich, warum „Ausführen“ gesperrt ist (D26).
    if (haeutung.stufe === 'ordnen') return `${HAEUTUNG.ordnen} ${HAEUTUNG.gleicheFolge}`
    return haeutung.gedrueckt === null ? HAEUTUNG.abschnitt : HAEUTUNG.anderesEnde
  }
  return auftrag(bedienung.angebote, karte)
}

/** Ein Knopf der Leiste; ist er gesperrt, steht sein Grund daneben, und der Knopf verweist darauf (DESIGN.md, „Komponenten“). */
function KnopfMitGrund({ klasse, grund, onClick, children }: { klasse: string; grund: string | null; onClick?: () => void; children: ReactNode }) {
  const grundId = useId()
  return (
    <span className={grund === null ? 'st-zugleiste-mitgrund' : 'st-zugleiste-mitgrund st-zugleiste-mitgrund--gesperrt'}>
      {grund !== null && (
        <span id={grundId} className="st-zugleiste-grund">
          {grund}
        </span>
      )}
      <button type="button" className={klasse} disabled={onClick === undefined} aria-describedby={grund === null ? undefined : grundId} onClick={onClick}>
        {children}
      </button>
    </span>
  )
}

export function Zugleiste({ ansicht, bedienung, fuehreAus, ablehnung, verlauf, zeigeGross, oeffneAbwerfen }: ZugleisteEigenschaften) {
  const karte = ansicht.ich.hand.find((handkarte) => handkarte.id === bedienung.karteId) ?? null
  const haeutung = useLaufendeHaeutung()
  const frage = abwehrfrageOffen(ansicht)
  // Gross steht die gewählte Handkarte, während der Abwehrfrage die angesagte Karte.
  const grosseKarte = frage ? (ansicht.status.schwebend?.angesagt ?? null) : karte
  // „Schneller“ nur, solange ein Gegner spielt (O6 K1).
  const gegnerSpielt = ansicht.aktionen.length === 0 && ansicht.status.partiephase !== 'Beendet'
  // Nur solange gewählt wird; die gewählte Möglichkeit nennt danach der Satz, und „Abbrechen“ führt zurück.
  const optionen = bedienung.angebote.filter((wahl) => wahl.art === 'frass')
  const { zugBeenden, abwerfen, ausspielen } = bedienung
  const fertig = haeutung?.fertig ?? bedienung.fertig
  // Beim Ordnen der Häutung stehen hier die Punkte; der Satz verweist ein gesperrtes „Ausführen“ auf seinen Grund.
  const vorschau = haeutung?.stufe === 'ordnen' ? haeutung.vorschau : null
  const satzId = useId()

  return (
    <section className="st-zugleiste" aria-label={ZUGLEISTE.titel}>
      {grosseKarte !== null && (
        <div className="st-zugleiste-vorschau" aria-hidden="true">
          <Karte karte={grosseKarte} sizes="150px" />
        </div>
      )}
      <div className="st-zugleiste-inhalt">
        {verlauf?.ausgesetzt === true && (
          <p className="st-zugleiste-hinweis" aria-live="polite">
            {PROTOKOLL.ausgesetzt}
          </p>
        )}
        {frage ? (
          <ReaktionsDialog ansicht={ansicht} fuehreAus={fuehreAus} />
        ) : (
          <p id={satzId} className="st-zugleiste-text" aria-live="polite">
            {satz(ansicht, bedienung, karte, fertig, haeutung, verlauf)}
          </p>
        )}
        {vorschau !== null && (
          <>
            <p className="st-zugleiste-klein st-zugleiste-pfeiltasten">{HAEUTUNG.pfeiltasten}</p>
            <p className="st-zugleiste-klein">{HAEUTUNG.punkte(vorschau.besitzer, vorschau.vorher, vorschau.nachher?.punkte ?? null)}</p>
          </>
        )}
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
          {verlauf !== undefined && gegnerSpielt && (
            <button type="button" className="st-knopf" aria-pressed={verlauf.schneller} onClick={verlauf.schalteSchneller}>
              {PROTOKOLL.schneller}
            </button>
          )}
          {abwerfen > 0 && (
            <button type="button" className="st-knopf" onClick={oeffneAbwerfen}>
              {ZUGLEISTE.kartenWaehlen}
            </button>
          )}
          {ausspielen && (
            // Der Grund der Engine, warum „Zug beenden“ gesperrt ist; er steht daneben, ob eine Karte gewählt ist oder nicht.
            <KnopfMitGrund klasse="st-knopf" grund={zugBeenden === null ? ansicht.zugBeendenGesperrt : null} onClick={zugBeenden === null ? undefined : () => fuehreAus(zugBeenden)}>
              {ZUGLEISTE.zugBeenden}
            </KnopfMitGrund>
          )}
          {karte !== null && (
            <>
              <button type="button" className="st-knopf st-knopf--leise" onClick={() => zeigeGross(karte)}>
                {ZUGLEISTE.ansehen}
              </button>
              <button type="button" className="st-knopf" onClick={bedienung.hebeAuf}>
                {ZUGLEISTE.abbrechen}
              </button>
              {fertig !== null ? (
                <button type="button" className="st-knopf st-knopf--haupt" onClick={() => fuehreAus(fertig)}>
                  {ZUGLEISTE.ausfuehren}
                </button>
              ) : (
                vorschau !== null && (
                  // Gesperrt, solange die Farbfolge dieselbe ist; den Grund sagt der Satz oben.
                  <button type="button" className="st-knopf st-knopf--haupt" disabled aria-describedby={satzId}>
                    {ZUGLEISTE.ausfuehren}
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
