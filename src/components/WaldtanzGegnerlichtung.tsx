/*
Author: rahn
Datum: 26.06.2026
Version: 1.1
Beschreibung: M1dp — Waldtanz-Gegnerlichtung als sichtbares oberes
              Brett-Cluster im Arenastein. Bündelt pro Gegner eine
              eigene Karte-Reihe mit Name, Punkten und Snake-Count
              und rendert die gegnerischen Schlangen als kartenartige
              Brettobjekte. Engine-Aktionen (Schlangenblockade, Fessel,
              Beutekorb, Bissspur) bleiben unverändert nutzbar.
              M8b: Hält den 2-Ziel-Schlangenfrass-State im Parent,
              damit alle GegnerSchlangenListe-Instanzen das Ziel-1 teilen.
*/
import { useState } from 'react'
import type { SpielAktion, Spieler, SpielerWertungsEintrag } from '../engine'
import GegnerSchlangenListe from './GegnerSchlangenListe'
import type { FrassAuswahl } from './GegnerSchlangenListe'
import type { LetzteAktionZiel } from '../aktionsziel/extrahiereAktionZiel'

interface WaldtanzGegnerlichtungProps {
  spieler: Spieler[]
  spielerwertungen: SpielerWertungsEintrag[]
  ausgewaehlteHandkarteId: string | null
  schlangenblockadeAktionen: Extract<SpielAktion, { typ: 'SchlangenblockadeSpielen' }>[]
  farbendiebAktionen: Extract<SpielAktion, { typ: 'FarbendiebSpielen' }>[]
  schlangenfrassAktionen: Extract<SpielAktion, { typ: 'SchlangenfrassSpielen' }>[]
  onAktion: (aktion: SpielAktion) => void
  aktionsLabel: (aktion: SpielAktion) => string
  aktiverZielspurKey?: string | null
  letzteAktionZiel?: LetzteAktionZiel | null
}

function punkteFuer(spielerId: string, wertungen: SpielerWertungsEintrag[]): number {
  return wertungen.find((wertung) => wertung.spielerId === spielerId)?.gesamtPunkte ?? 0
}

export default function WaldtanzGegnerlichtung({
  spieler,
  spielerwertungen,
  ausgewaehlteHandkarteId,
  schlangenblockadeAktionen,
  farbendiebAktionen,
  schlangenfrassAktionen,
  onAktion,
  aktionsLabel,
  aktiverZielspurKey = null,
  letzteAktionZiel = null,
}: WaldtanzGegnerlichtungProps) {
  const gegnerMitSchlangen = spieler.filter((eintrag) => eintrag.schlangen.length > 0)
  const anzahlLebenderGegnerschlangen = gegnerMitSchlangen.reduce(
    (summe, gegner) => summe + gegner.schlangen.length,
    0,
  )

  // M8b: Parent-State für die 2-Ziel-Schlangenfrass-Auswahl, damit alle
  // GegnerSchlangenListe-Instanzen das Ziel-1 teilen und die Sofortaktion
  // auf der zweiten Liste erscheint.
  const [erstesFrassZiel, setErstesFrassZiel] = useState<FrassAuswahl | null>(null)

  return (
    <section
      className="waldtanz-gegnerlichtung waldtanz-arenastein__gegnerlichtung"
      aria-label="Waldtanz-Gegnerlichtung"
      data-waldtanz-spielplatz="gegnerlichtung"
    >
      <header className="waldtanz-gegnerlichtung__kopf">
        <h3 className="waldtanz-gegnerlichtung__titel">Gegner-Schlangen</h3>
        <p className="waldtanz-gegnerlichtung__hinweis">
          {anzahlLebenderGegnerschlangen > 0
            ? `${anzahlLebenderGegnerschlangen} gegnerische ${anzahlLebenderGegnerschlangen === 1 ? 'Schlange' : 'Schlangen'} auf dem Brett.`
            : 'Noch keine gegnerischen Schlangen — sobald ein Gegner seine erste Karte legt, erscheint sie hier als Brettobjekt.'}
        </p>
      </header>
      {gegnerMitSchlangen.length === 0 ? (
        <p className="waldtanz-gegnerlichtung__leertext">Noch keine gegnerischen Schlangen.</p>
      ) : (
        <ol className="waldtanz-gegnerlichtung__liste">
          {gegnerMitSchlangen.map((gegner) => (
            <li
              key={gegner.id}
              className="waldtanz-gegnerlichtung__gegnerkarte"
              role="group"
              aria-label={`Gegner ${gegner.name} — ${gegner.schlangen.length} ${gegner.schlangen.length === 1 ? 'Schlange' : 'Schlangen'}, ${punkteFuer(gegner.id, spielerwertungen)} Punkte`}
              data-gegner-id={gegner.id}
            >
              <div className="waldtanz-gegnerlichtung__gegnerkarte-kopf">
                <span className="waldtanz-gegnerlichtung__avatar" aria-hidden="true">🦎</span>
                <div className="waldtanz-gegnerlichtung__gegnerkarte-meta">
                  <span className="waldtanz-gegnerlichtung__eyebrow">{gegner.steuerung === 'KI' ? 'KI-Gegner' : 'Gegner'}</span>
                  <strong className="waldtanz-gegnerlichtung__gegner-name">{gegner.name}</strong>
                </div>
                <div className="waldtanz-gegnerlichtung__gegnerkarte-pillen">
                  <span className="waldtanz-gegnerlichtung__punkte" aria-label={`${punkteFuer(gegner.id, spielerwertungen)} Punkte`}>
                    {punkteFuer(gegner.id, spielerwertungen)} P
                  </span>
                  <span className="waldtanz-gegnerlichtung__schlangenanzahl" aria-label={`${gegner.schlangen.length} Schlangen`}>
                    {gegner.schlangen.length} × 🐍
                  </span>
                </div>
              </div>
              <GegnerSchlangenListe
                spieler={[gegner]}
                ausgewaehlteHandkarteId={ausgewaehlteHandkarteId}
                schlangenblockadeAktionen={schlangenblockadeAktionen}
                farbendiebAktionen={farbendiebAktionen}
                schlangenfrassAktionen={schlangenfrassAktionen}
                onAktion={onAktion}
                aktionsLabel={aktionsLabel}
                aktiverZielspurKey={aktiverZielspurKey}
                letzteAktionZiel={letzteAktionZiel}
                erstesFrassZiel={erstesFrassZiel}
                setErstesFrassZiel={setErstesFrassZiel}
              />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
