import { useId } from 'react'
import type { SpielAktion, Spielkarte } from '../../engine'
import { Karte } from '../karten/Karte'
import type { Bildkarte } from '../karten/kartenbilder'
import type { TischAnsicht } from '../spiel/tischAnsicht'
import type { Verlauf } from '../spiel/useSpiel'
import { Ansager } from './Ansager'
import type { AngesagterSchritt } from './Ansager'
import { abwehrfrageOffen, reaktionenVon, schutzHinweis } from './bedienung'
import type { Bedienung } from './bedienung'
import { useLaufendeHaeutung } from './haeutung'
import type { Haeutung } from './haeutung'
import { KnopfMitGrund } from './KnopfMitGrund'
import { ABWEHRFRAGE, PROTOKOLL, ansageSatz } from './protokolltexte'
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

Mit O11 liest der Ansager hier vor, was geschieht und was du jetzt
entscheidest; der sichtbare Satz liest nicht mehr selbst vor. Ist eine Karte
gewählt, trägt die Leiste `st-zugleiste--auswahl`; daran blendet Handy quer
ein gesperrtes „Zug beenden“ aus (quer.css).
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
function juengsterSchritt(verlauf: Verlauf | undefined): AngesagterSchritt | null {
  const eintraege = verlauf?.eintraege ?? []
  const nummer = eintraege.at(-1)?.schritt
  if (nummer === undefined) return null
  let anfang = eintraege.length - 1
  while (anfang > 0 && eintraege[anfang - 1].schritt === nummer) anfang -= 1
  return { nummer, text: eintraege.slice(anfang).map((eintrag) => eintrag.text).join(' ') }
}

/** Was die Leiste sagt; ohne Entscheidung des Menschen, was gerade geschieht. */
function satz(ansicht: TischAnsicht, bedienung: Bedienung, karte: Spielkarte | null, fertig: SpielAktion | null, haeutung: Haeutung | null, schritt: AngesagterSchritt | null): string {
  const { abwerfen } = bedienung
  if (ansicht.status.partiephase === 'Beendet') return statusText(ansicht.status).titel
  if (bedienung.aktionen.length === 0) return schritt?.text ?? ZUGLEISTE.warten
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
  const schritt = juengsterSchritt(verlauf)
  const text = satz(ansicht, bedienung, karte, fertig, haeutung, schritt)
  // Was du jetzt entscheidest, liest der Ansager vor; spielt ein Gegner, ist der Satz sein Schritt, und den liest er schon.
  let jetzt: string | null = null
  const ansage = frage ? ansageSatz(ansicht) : null
  if (ansage !== null) {
    const hinweis = `${ABWEHRFRAGE.titel}: ${schutzHinweis(reaktionenVon(ansicht).abwehren)}`
    // Nach dem Neuladen beginnt das Protokoll leer; dann nennt er die Ansage selbst.
    jetzt = schritt === null ? `${ansage} ${hinweis}` : hinweis
  }
  else if (bedienung.aktionen.length > 0) jetzt = text

  return (
    <>
    {/* Neben der Leiste, nicht in ihr: Sonst stünde jeder Satz der Leiste darin zweimal. */}
    <Ansager schritt={schritt} jetzt={jetzt} />
    {/* tabIndex -1: Steht hier kein bedienbarer Knopf, nimmt die Leiste selbst den Fokus, wenn er sonst verloren ginge (fokus.ts). */}
    <section className={karte === null ? 'st-zugleiste' : 'st-zugleiste st-zugleiste--auswahl'} aria-label={ZUGLEISTE.titel} tabIndex={-1}>
      {grosseKarte !== null && (
        <div className="st-zugleiste-vorschau" aria-hidden="true">
          <Karte karte={grosseKarte} sizes="150px" />
        </div>
      )}
      <div className="st-zugleiste-inhalt">
        {verlauf?.ausgesetzt === true && <p className="st-zugleiste-hinweis">{PROTOKOLL.ausgesetzt}</p>}
        {frage ? (
          <ReaktionsDialog ansicht={ansicht} frage={ansage ?? ''} fuehreAus={fuehreAus} />
        ) : (
          <p id={satzId} className="st-zugleiste-text">
            {text}
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
            <KnopfMitGrund klasse="st-knopf" aktion={zugBeenden} grund={ansicht.zugBeendenGesperrt} fuehreAus={fuehreAus}>
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
    </>
  )
}
