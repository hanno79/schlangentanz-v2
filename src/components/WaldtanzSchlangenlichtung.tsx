/*
Author: rahn
Datum: 25.06.2026
Version: 1.0
Beschreibung: M1di — Waldtanz-Schlangenlichtung als primary board surface.
              Konsolidiert die frueher fragmentierten Sub-Overlays (Tischkarte,
              Magiekreise, Questband, Aktiver Tanz Schritt, Brettschritt-Stempel)
              in EINER grossen Stein-Flaeche mit EIGENER Header-Box.
              Engine-Logik bleibt unveraendert — nur Container-Wechsel.
*/
import type {
  SpielAktion,
  Spielzustand,
  Spieler,
} from '../engine'
import type { LetzteAktionZiel } from '../aktionsziel/extrahiereAktionZiel'
import type { MutableRefObject } from 'react'
import type { BrettschrittEintrag } from './WaldtanzBrettschrittStempel'
import Schlangenbereich from './Schlangenbereich'
import WaldtanzTischkarte from './WaldtanzTischkarte'
import WaldtanzMagiekreise from './WaldtanzMagiekreise'
import WaldtanzQuestband from './WaldtanzQuestband'
import WaldtanzAktiverTanzSchritt from './WaldtanzAktiverTanzSchritt'
import WaldtanzBrettschrittStempel from './WaldtanzBrettschrittStempel'
import WaldtanzKartenpop from './WaldtanzKartenpop'
import WaldtanzWaldtischHolzplakette from './WaldtanzWaldtischHolzplakette'

export interface WaldtanzSchlangenlichtungProps {
  zustand: Spielzustand
  aktiverSpieler: Spieler
  ausgewaehlteHandkarteId: string | null
  istGameRoute: boolean
  handkarteDragAktiv?: boolean
  zeigeSchlangenhaeutungBrettziel?: boolean
  versteckeKiEinzelaktionen: boolean
  karteAnlegenAktionen: Extract<SpielAktion, { typ: 'KarteAnlegen' }>[]
  neueSchlangeStartenAktionen: Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }>[]
  farbenschutzAktionen: Extract<SpielAktion, { typ: 'FarbenschutzSpielen' }>[]
  farbenfusionAktionen: Extract<SpielAktion, { typ: 'FarbenfusionSpielen' }>[]
  schlangenfrassAktionen: Extract<SpielAktion, { typ: 'SchlangenfrassSpielen' }>[]
  schlangenblockadeAktionen: Extract<SpielAktion, { typ: 'SchlangenblockadeSpielen' }>[]
  schlangengrubeAktionen: Extract<SpielAktion, { typ: 'SonderkarteSpielen' }>[]
  farbendiebAktionen: Extract<SpielAktion, { typ: 'FarbendiebSpielen' }>[]
  gezogeneHandkarteIdRef: MutableRefObject<string | null>
  onAktion: (aktion: SpielAktion) => void
  aktionsLabel: (aktion: SpielAktion) => string
  letzteAktion: string | null
  letzteAktionZiel?: LetzteAktionZiel | null
  istEndspurt: boolean
  ueberhand: number
  istSpielende: boolean
  kiZugLaeuft: boolean
  brettschrittEintraege: BrettschrittEintrag[]
  pflichtschrittLabel: string
}

export default function WaldtanzSchlangenlichtung(props: WaldtanzSchlangenlichtungProps) {
  const {
    zustand,
    aktiverSpieler,
    ausgewaehlteHandkarteId,
    istGameRoute,
    handkarteDragAktiv = false,
    versteckeKiEinzelaktionen,
    karteAnlegenAktionen,
    neueSchlangeStartenAktionen,
    farbenschutzAktionen,
    farbenfusionAktionen,
    schlangenfrassAktionen,
    schlangenblockadeAktionen,
    schlangengrubeAktionen,
    farbendiebAktionen,
    gezogeneHandkarteIdRef,
    onAktion,
    aktionsLabel,
    letzteAktion,
    letzteAktionZiel = null,
    istEndspurt,
    ueberhand,
    istSpielende,
    kiZugLaeuft,
    brettschrittEintraege,
    pflichtschrittLabel,
  } = props

  const aktiverSpielerName = aktiverSpieler.name
  const istMensch = aktiverSpieler.steuerung === 'Mensch'

  // Schlangenhäutung-Brettziel default = sichtbar nur wenn keine KI-Einzelaktionen
  // versteckt werden (gating für reaktive Sonderkarten-Buttons).
  const zeigeSchlangenhaeutungBrettziel = props.zeigeSchlangenhaeutungBrettziel ?? !versteckeKiEinzelaktionen

  const sichtbareMagiekreise = versteckeKiEinzelaktionen
    ? []
    : [...farbenschutzAktionen, ...farbenfusionAktionen, ...farbendiebAktionen, ...schlangenfrassAktionen, ...schlangenblockadeAktionen, ...schlangengrubeAktionen]

  return (
    <section
      className="waldtanz-schlangenlichtung waldtanz-arenastein__schlangenlichtung waldtanz-lichtungsbrett waldtanz-lichtungsstein"
      aria-label="Schlangenlichtung"
      data-waldtanz-spielplatz="waldlichtung"
      data-drag-aktiv={handkarteDragAktiv ? 'true' : 'false'}
    >
      <header className="waldtanz-schlangenlichtung__kopf">
        <div className="waldtanz-schlangenlichtung__kopf-text">
          <h3>Schlangenlichtung</h3>
          <p>Eigene Schlange, Gegner und Brett-Ziele auf einem Stein.</p>
        </div>
        <WaldtanzWaldtischHolzplakette
          spielerName={aktiverSpielerName}
          zugphase={zustand.zugphase}
          gespielteKarten={zustand.zugpflichten.gespielteKarten}
          handkarten={zustand.spieler[zustand.aktiverSpielerIndex]?.hand.length ?? 0}
          eigeneSchlangen={zustand.spieler[zustand.aktiverSpielerIndex]?.schlangen.length ?? 0}
          istGameRoute={istGameRoute}
        />
      </header>
      <div className="waldtanz-schlangenlichtung__spielflaeche">
        <div className="waldtanz-schlangenlichtung__overlays">
          {istGameRoute && !istEndspurt ? (
            <WaldtanzQuestband zustand={zustand} istEndspurt={istEndspurt} />
          ) : null}
          {istGameRoute ? (
            <WaldtanzAktiverTanzSchritt
              istSichtbar
              daten={{
                aktiverSpielerName,
                istMensch,
                spielerIndex: zustand.aktiverSpielerIndex,
                phase: zustand.zugphase,
                naechsterSchritt: pflichtschrittLabel,
                ueberhand,
                istSpielende,
                kiZugLaeuft,
              }}
            />
          ) : null}
          {istGameRoute ? (
            <WaldtanzBrettschrittStempel zustand={zustand} eintraege={brettschrittEintraege} />
          ) : null}
        </div>
        <div className="waldtanz-schlangenlichtung__schlangen">
          <WaldtanzTischkarte zustand={zustand} />
          <WaldtanzKartenpop aktionLabel={letzteAktion} />
          <WaldtanzMagiekreise
            ausgewaehlteHandkarteId={ausgewaehlteHandkarteId}
            neueSchlangeStartenAktionen={versteckeKiEinzelaktionen ? [] : neueSchlangeStartenAktionen}
            karteAnlegenAktionen={versteckeKiEinzelaktionen ? [] : karteAnlegenAktionen}
            sonderzauberAktionen={sichtbareMagiekreise}
            aktionsLabel={aktionsLabel}
            onAktion={onAktion}
          />
          <Schlangenbereich
            zustand={zustand}
            zeigeSchlangenhaeutungBrettziel={zeigeSchlangenhaeutungBrettziel}
            aktiverSpieler={aktiverSpieler}
            karteAnlegenAktionen={versteckeKiEinzelaktionen ? [] : karteAnlegenAktionen}
            neueSchlangeStartenAktionen={versteckeKiEinzelaktionen ? [] : neueSchlangeStartenAktionen}
            farbenschutzAktionen={versteckeKiEinzelaktionen ? [] : farbenschutzAktionen}
            farbenfusionAktionen={versteckeKiEinzelaktionen ? [] : farbenfusionAktionen}
            schlangenfrassAktionen={versteckeKiEinzelaktionen ? [] : schlangenfrassAktionen}
            schlangenblockadeAktionen={versteckeKiEinzelaktionen ? [] : schlangenblockadeAktionen}
            farbendiebAktionen={versteckeKiEinzelaktionen ? [] : farbendiebAktionen}
            gezogeneHandkarteIdRef={gezogeneHandkarteIdRef}
            ausgewaehlteHandkarteId={ausgewaehlteHandkarteId}
            onAktion={onAktion}
            aktionsLabel={aktionsLabel}
            letzteAktionZiel={letzteAktionZiel}
          />
        </div>
      </div>
    </section>
  )
}