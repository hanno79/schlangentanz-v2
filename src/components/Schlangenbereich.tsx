/*
Author: rahn
Datum: 06.06.2026
Version: 1.4
Beschreibung: Schlangenbereich des Spieltischs mit sichtbaren Kartenreihen, expliziten Start-/Anlegeaktionen und Drop-/Klick-Fallback auf der gesamten Schlange.
*/

import { useState } from 'react'
import type { DragEvent, KeyboardEvent, MouseEvent, MutableRefObject } from 'react'
import type { SpielAktion, Spieler, Spielkarte } from '../engine'

interface SchlangenbereichProps {
  aktiverSpieler: Spieler
  gegnerSpieler: Spieler[]
  karteAnlegenAktionen: Extract<SpielAktion, { typ: 'KarteAnlegen' }> []
  neueSchlangeStartenAktionen: Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }> []
  gezogeneHandkarteIdRef: MutableRefObject<string | null>
  ausgewaehlteHandkarteId: string | null
  onAktion: (aktion: SpielAktion) => void
  aktionsLabel: (aktion: SpielAktion) => string
}

function schlangenKartenKurzlabel(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte'
    ? `${karte.farbe} · ${karte.punkte} Punkte`
    : `Sonderkarte ${karte.name}`
}

function schlangenKartenAriaLabel(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte'
    ? `Farbkarte ${karte.id}: ${karte.farbe} mit ${karte.punkte} Punkten`
    : `Sonderkarte ${karte.id}: ${karte.name}`
}

function erlaubeDrop(event: DragEvent<HTMLElement>) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

export default function Schlangenbereich({
  aktiverSpieler,
  gegnerSpieler,
  karteAnlegenAktionen,
  neueSchlangeStartenAktionen,
  gezogeneHandkarteIdRef,
  ausgewaehlteHandkarteId,
  onAktion,
  aktionsLabel,
}: SchlangenbereichProps) {
  const [dragOverZone, setDragOverZone] = useState<string | null>(null)

  function findeAktionFuerKarte(schlangeId: string, handkartenId: string | null) {
    if (!handkartenId) return null
    return karteAnlegenAktionen.find(
      (aktion) => aktion.schlangenId === schlangeId && aktion.handkartenId === handkartenId,
    ) ?? null
  }

  function findeNeueSchlangeAktion(handkartenId: string | null) {
    if (!handkartenId) return null
    return neueSchlangeStartenAktionen.find((aktion) => aktion.handkartenId === handkartenId) ?? neueSchlangeStartenAktionen[0] ?? null
  }

  function fuehreAktionAus(
    aktion: Extract<SpielAktion, { typ: 'KarteAnlegen' }> | null,
  ) {
    if (!aktion) return
    onAktion(aktion)
  }

  function fuehreNeueSchlangeAktionAus(
    aktion: Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }> | null,
  ) {
    if (!aktion) return
    onAktion(aktion)
  }

  function handleSchlangeClick(event: MouseEvent<HTMLElement>, schlangeId: string) {
    if ((event.target as HTMLElement).closest('button')) {
      return
    }

    fuehreAktionAus(findeAktionFuerKarte(schlangeId, ausgewaehlteHandkarteId))
  }

  function handleSchlangeKeyDown(event: KeyboardEvent<HTMLElement>, schlangeId: string) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    fuehreAktionAus(findeAktionFuerKarte(schlangeId, ausgewaehlteHandkarteId))
  }

  function handleSchlangeDragOver(event: DragEvent<HTMLElement>, schlangeId: string) {
    erlaubeDrop(event)
    setDragOverZone(schlangeId)
  }

  function handleSchlangeDrop(event: DragEvent<HTMLElement>, schlangeId: string) {
    event.preventDefault()
    const kartenId = event.dataTransfer.getData('text/plain') || gezogeneHandkarteIdRef.current
    fuehreAktionAus(findeAktionFuerKarte(schlangeId, kartenId))
    setDragOverZone(null)
  }

  function handleNeueSchlangeZoneClick(event: MouseEvent<HTMLElement>) {
    event.stopPropagation()

    const aktion = findeNeueSchlangeAktion(ausgewaehlteHandkarteId) ?? neueSchlangeStartenAktionen[0] ?? null
    fuehreNeueSchlangeAktionAus(aktion)
  }

  function handleNeueSchlangeZoneKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    fuehreNeueSchlangeAktionAus(findeNeueSchlangeAktion(ausgewaehlteHandkarteId))
  }

  function handleNeueSchlangeZoneDragOver(event: DragEvent<HTMLElement>) {
    erlaubeDrop(event)
    setDragOverZone('startzone')
  }

  function handleNeueSchlangeZoneDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    event.stopPropagation()
    const kartenId = event.dataTransfer.getData('text/plain') || gezogeneHandkarteIdRef.current
    fuehreNeueSchlangeAktionAus(findeNeueSchlangeAktion(kartenId))
    setDragOverZone(null)
  }

  const hatEigeneSchlangen = aktiverSpieler.schlangen.length > 0

  return (
    <section className="schlangenbereich" aria-labelledby="schlangenbereich-titel">
      <h4 id="schlangenbereich-titel">Schlangenbereich</h4>
      <section
        className="schlangen-gruppe"
        aria-labelledby="eigene-schlangen-titel"
        onClick={!hatEigeneSchlangen ? handleNeueSchlangeZoneClick : undefined}
        onDragOver={!hatEigeneSchlangen ? erlaubeDrop : undefined}
        onDrop={!hatEigeneSchlangen ? handleNeueSchlangeZoneDrop : undefined}
      >
        <h5 id="eigene-schlangen-titel">Eigene Schlangen</h5>
        <p className="schlangen-drop-hinweis">
          Ziehe eine Handkarte auf die gewünschte Schlange oder nutze die Startzone, um eine neue Schlange zu beginnen.
        </p>
        <div
          className={`schlangen-startzone${hatEigeneSchlangen ? '' : ' schlangen-startzone--leer'}${dragOverZone === 'startzone' ? ' schlangen-startzone--dragover' : ''}`}
          role="button"
          tabIndex={0}
          aria-label="Neue Schlange starten"
          aria-describedby={`schlange-startzone-hinweis-${aktiverSpieler.id}`}
          onClick={handleNeueSchlangeZoneClick}
          onKeyDown={handleNeueSchlangeZoneKeyDown}
          onDragOver={handleNeueSchlangeZoneDragOver}
          onDrop={handleNeueSchlangeZoneDrop}
        >
          <strong>Neue Schlange starten</strong>
          <p id={`schlange-startzone-hinweis-${aktiverSpieler.id}`} className="schlangen-drop-hinweis">
            Ziehe eine Farbkarte hierher oder klicke die passende Start-Schaltfläche.
          </p>
        </div>
        {neueSchlangeStartenAktionen.length > 0 && (
          <div className="schlangekarte__anlegeaktionen schlangekarte__anlegeaktionen--starten" aria-label={`Startaktionen für ${aktiverSpieler.id}`}>
            {neueSchlangeStartenAktionen.map((aktion) => (
              <button
                key={aktion.handkartenId}
                type="button"
                className="schlangekarte__anlegebutton schlangekarte__anlegebutton--start"
                aria-label={`Schlangenbereich-Start mit Karte ${aktion.handkartenId}`}
                title={`Schlangenbereich-Start mit Karte ${aktion.handkartenId}`}
                onClick={(event) => {
                  event.stopPropagation()
                  onAktion(aktion)
                }}
                onDragOver={erlaubeDrop}
                onDrop={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  const kartenId = event.dataTransfer.getData('text/plain') || gezogeneHandkarteIdRef.current
                  if (kartenId === aktion.handkartenId) {
                    onAktion(aktion)
                  }
                }}
              >
                {aktionsLabel(aktion)}
              </button>
            ))}
          </div>
        )}
        {hatEigeneSchlangen ? (
          <ul className="schlangenleiste">
            {aktiverSpieler.schlangen.map((schlange) => {
              const anlegeAktionen = karteAnlegenAktionen.filter((aktion) => aktion.schlangenId === schlange.id)

              return (
                <li
                  key={schlange.id}
                  className={`schlangekarte schlangekarte--eigene${dragOverZone === schlange.id ? ' schlangekarte--dragover' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`Schlange ${schlange.id}`}
                  aria-describedby={`schlange-${schlange.id}-anlegehilfe`}
                  onClick={(event) => handleSchlangeClick(event, schlange.id)}
                  onKeyDown={(event) => handleSchlangeKeyDown(event, schlange.id)}
                  onDragOver={(event) => handleSchlangeDragOver(event, schlange.id)}
                  onDrop={(event) => handleSchlangeDrop(event, schlange.id)}
                >
                  <strong>{schlange.id}</strong>
                  <span className="schlangekarte__badge">{schlange.karten.length} Karten</span>
                  <div className="schlangekarte__kartenreihe" role="list" aria-label={`Kartenreihe ${schlange.id}`}>
                    {schlange.karten.map((karte) => (
                      <div
                        key={karte.id}
                        className={`schlangekarte__karte schlangekarte__karte--${karte.typ === 'Farbkarte' ? 'farbkarte' : 'sonderkarte'}`}
                        role="listitem"
                        aria-label={schlangenKartenAriaLabel(karte)}
                      >
                        <strong>{karte.id}</strong>
                        <span>{schlangenKartenKurzlabel(karte)}</span>
                      </div>
                    ))}
                  </div>
                  <p id={`schlange-${schlange.id}-anlegehilfe`} className="schlangen-drop-hinweis">
                    Klicke auf eine Anlege-Schaltfläche oder lege die ausgewählte Karte direkt auf die Schlange.
                  </p>
                  {anlegeAktionen.length > 0 && (
                    <div className="schlangekarte__anlegeaktionen" aria-label={`Anlegeaktionen für ${schlange.id}`}>
                      {anlegeAktionen.map((aktion) => (
                        <button
                          key={`${aktion.handkartenId}-${aktion.schlangenId}-${aktion.position}`}
                          type="button"
                          className={`schlangekarte__anlegebutton schlangekarte__anlegebutton--${aktion.position}`}
                          aria-label={`Schlangenbereich: Karte ${aktion.handkartenId} ${aktion.position} anlegen`}
                          title={aktionsLabel(aktion)}
                          onClick={(event) => {
                            event.stopPropagation()
                            onAktion(aktion)
                          }}
                          onDragOver={erlaubeDrop}
                          onDrop={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            const kartenId = event.dataTransfer.getData('text/plain') || gezogeneHandkarteIdRef.current
                            if (kartenId === aktion.handkartenId) {
                              onAktion(aktion)
                            }
                          }}
                        >
                          {aktion.position === 'links' ? 'Links anlegen' : 'Rechts anlegen'}
                        </button>
                      ))}
                    </div>
                  )}
                  <span>Zustand: {schlange.zustand}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p>Keine eigenen Schlangen.</p>
        )}
      </section>
      <section className="schlangen-gruppe" aria-labelledby="gegnerische-schlangen-titel">
        <h5 id="gegnerische-schlangen-titel">Gegnerische Schlangen</h5>
        {gegnerSpieler.some((spieler) => spieler.schlangen.length > 0) ? (
          <ul className="schlangenleiste">
            {gegnerSpieler.flatMap((spieler) =>
              spieler.schlangen.map((schlange) => (
                <li key={schlange.id} className="schlangekarte schlangekarte--gegner">
                  <strong>{schlange.id}</strong>
                  <span>Spieler: {spieler.id}</span>
                  <span className="schlangekarte__badge">{schlange.karten.length} Karten</span>
                  <div className="schlangekarte__kartenreihe" role="list" aria-label={`Kartenreihe ${schlange.id}`}>
                    {schlange.karten.map((karte) => (
                      <div
                        key={karte.id}
                        className={`schlangekarte__karte schlangekarte__karte--${karte.typ === 'Farbkarte' ? 'farbkarte' : 'sonderkarte'}`}
                        role="listitem"
                        aria-label={schlangenKartenAriaLabel(karte)}
                      >
                        <strong>{karte.id}</strong>
                        <span>{schlangenKartenKurzlabel(karte)}</span>
                      </div>
                    ))}
                  </div>
                  <span>Zustand: {schlange.zustand}</span>
                </li>
              )),
            )}
          </ul>
        ) : (
          <p>Keine gegnerischen Schlangen.</p>
        )}
      </section>
    </section>
  )
}
