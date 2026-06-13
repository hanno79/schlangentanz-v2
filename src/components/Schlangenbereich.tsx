/*
Author: rahn
Datum: 07.06.2026
Version: 3.0
Beschreibung: Schlangenbereich des Spieltischs mit sichtbaren Kartenreihen, zugänglichem Drag-Status und legalen Start-/Anlegeaktionen.
# ÄNDERUNG 07.06.2026: R109 nutzt komponentenlokale DOM-IDs für aria-describedby statt fachlicher Spieler-/Schlangen-IDs.
# ÄNDERUNG 07.06.2026: R111 nutzt komponentenlokale DOM-IDs auch für aria-labelledby (Haupttitel und Untergruppentitel).
# ÄNDERUNG 12.06.2026: R177 ergänzt farbspezifische Klassen für sichtbare Karten in Schlangenreihen.
# ÄNDERUNG 12.06.2026: R178 markiert board-lokale Ziele für die ausgewählte Handkarte sichtbar.
# ÄNDERUNG 12.06.2026: R180 macht Farbenfusion-Zielpaare nach Auswahl board-nah spielbar.
# ÄNDERUNG 12./13.06.2026: R181-R183 machen Schlangenfrass, Farbenschutz und Farbendieb board-nah spielbar.
*/
import { useEffect, useId, useState } from 'react'
import type { DragEvent, KeyboardEvent, MouseEvent, MutableRefObject } from 'react'
import type { SpielAktion, Spieler, Spielkarte } from '../engine'
import { farbeCssKlasse } from '../kartenfarben'

interface SchlangenbereichProps {
  aktiverSpieler: Spieler
  gegnerSpieler: Spieler[]
  karteAnlegenAktionen: Extract<SpielAktion, { typ: 'KarteAnlegen' }>[]
  neueSchlangeStartenAktionen: Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }>[]
  farbenschutzAktionen?: Extract<SpielAktion, { typ: 'FarbenschutzSpielen' }>[]
  farbenfusionAktionen?: Extract<SpielAktion, { typ: 'FarbenfusionSpielen' }>[]
  schlangenfrassAktionen?: Extract<SpielAktion, { typ: 'SchlangenfrassSpielen' }>[]; farbendiebAktionen?: Extract<SpielAktion, { typ: 'FarbendiebSpielen' }>[]
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

function schlangenStatusLabel(zustand: Spieler['schlangen'][number]['zustand']): string {
  switch (zustand) {
    case 'aktiv':
      return 'spielbereit'
    case 'blockiert':
      return 'gerade blockiert'
    case 'geschuetzt':
      return 'geschützt'
  }

  const nichtErfassterZustand: never = zustand
  return nichtErfassterZustand
}

function erlaubeDrop(event: DragEvent<HTMLElement>) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

type DragTarget = { kind: 'startzone' } | { kind: 'schlange'; id: string } | { kind: 'ungueltig' }

function leseGezogeneKarteId(event: DragEvent<HTMLElement>, gezogeneHandkarteIdRef: MutableRefObject<string | null>) {
  return event.dataTransfer.getData('text/plain') || gezogeneHandkarteIdRef.current
}

export default function Schlangenbereich({
  aktiverSpieler,
  gegnerSpieler,
  karteAnlegenAktionen,
  neueSchlangeStartenAktionen,
  farbenschutzAktionen = [],
  farbenfusionAktionen = [], schlangenfrassAktionen = [], farbendiebAktionen = [],
  gezogeneHandkarteIdRef,
  ausgewaehlteHandkarteId,
  onAktion,
  aktionsLabel,
}: SchlangenbereichProps) {
  const komponentenId = useId()
  const [dragOverZone, setDragOverZone] = useState<DragTarget | null>(null)

  function findeAktionFuerKarte(schlangeId: string, handkartenId: string | null) {
    if (!handkartenId) return null
    return karteAnlegenAktionen.find(
      (aktion) => aktion.schlangenId === schlangeId && aktion.handkartenId === handkartenId,
    ) ?? null
  }

  function findeNeueSchlangeAktion(handkartenId: string | null) {
    if (!handkartenId) return null
    return neueSchlangeStartenAktionen.find((aktion) => aktion.handkartenId === handkartenId) ?? null
  }

  function findeFarbenschutzAktion(schlangeId: string, handkartenId: string | null) {
    if (!handkartenId) return null
    return farbenschutzAktionen.find(
      (aktion) => aktion.handkartenId === handkartenId && aktion.zielSchlangenId === schlangeId,
    ) ?? null
  }

  function findeFarbenfusionAktion(schlangeId: string, zielKartenId: string, handkartenId: string | null) {
    if (!handkartenId) return null
    return farbenfusionAktionen.find(
      (aktion) => aktion.handkartenId === handkartenId && aktion.zielSchlangenId === schlangeId && aktion.zielKartenId === zielKartenId,
    ) ?? null
  }

  function findeSchlangenfrassAktion(schlangeId: string, zielKartenId: string, handkartenId: string | null) {
    if (!handkartenId) return null
    return schlangenfrassAktionen.find((aktion) => {
      const [ziel] = aktion.ziele
      return aktion.handkartenId === handkartenId && aktion.ziele.length === 1 && ziel.schlangenId === schlangeId && ziel.kartenId === zielKartenId
    }) ?? null
  }

  function findeFarbendiebAktionen(zielSpielerId: string, zielSchlangenId: string, zielKartenId: string, handkartenId: string | null) {
    if (!handkartenId) return []
    return farbendiebAktionen.filter((aktion) => aktion.handkartenId === handkartenId && aktion.zielSpielerId === zielSpielerId && aktion.zielSchlangenId === zielSchlangenId && aktion.zielKartenId === zielKartenId)
  }

  function fuehreAktion(aktion: SpielAktion | null) {
    if (aktion) onAktion(aktion)
  }

  function handleSchlangeClick(event: MouseEvent<HTMLElement>, schlangeId: string) {
    if ((event.target as HTMLElement).closest('button')) {
      return
    }

    fuehreAktion(findeAktionFuerKarte(schlangeId, ausgewaehlteHandkarteId))
  }

  function handleSchlangeKeyDown(event: KeyboardEvent<HTMLElement>, schlangeId: string) {
    if ((event.target as HTMLElement).closest('button')) {
      return
    }
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    fuehreAktion(findeAktionFuerKarte(schlangeId, ausgewaehlteHandkarteId))
  }

  function handleSchlangeDragOver(event: DragEvent<HTMLElement>, schlangeId: string) {
    const kartenId = leseGezogeneKarteId(event, gezogeneHandkarteIdRef)
    if (!findeAktionFuerKarte(schlangeId, kartenId)) {
      if (dragOverZone?.kind !== 'ungueltig') setDragOverZone({ kind: 'ungueltig' })
      return
    }

    erlaubeDrop(event)
    if (dragOverZone?.kind !== 'schlange' || dragOverZone.id !== schlangeId) {
      setDragOverZone({ kind: 'schlange', id: schlangeId })
    }
  }

  function handleSchlangeDrop(event: DragEvent<HTMLElement>, schlangeId: string) {
    event.preventDefault()
    const kartenId = leseGezogeneKarteId(event, gezogeneHandkarteIdRef)
    const aktion = findeAktionFuerKarte(schlangeId, kartenId)
    fuehreAktion(aktion)
    setDragOverZone(aktion ? null : { kind: 'ungueltig' })
  }

  function handleNeueSchlangeZoneClick(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('button, li.schlangekarte--eigene')) {
      return
    }

    fuehreAktion(findeNeueSchlangeAktion(ausgewaehlteHandkarteId) ?? (ausgewaehlteHandkarteId ? null : neueSchlangeStartenAktionen[0] ?? null))
  }

  function handleNeueSchlangeZoneKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    fuehreAktion(findeNeueSchlangeAktion(ausgewaehlteHandkarteId))
  }

  function handleNeueSchlangeZoneDragOver(event: DragEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('li.schlangekarte--eigene')) {
      return
    }

    const kartenId = leseGezogeneKarteId(event, gezogeneHandkarteIdRef)
    if (!neueSchlangeStartenAktionen.some((aktion) => aktion.handkartenId === kartenId)) {
      if (dragOverZone?.kind !== 'ungueltig') setDragOverZone({ kind: 'ungueltig' })
      return
    }

    erlaubeDrop(event)
    if (dragOverZone?.kind !== 'startzone') setDragOverZone({ kind: 'startzone' })
  }

  function handleNeueSchlangeZoneDrop(event: DragEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('li.schlangekarte--eigene')) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    const kartenId = leseGezogeneKarteId(event, gezogeneHandkarteIdRef)
    const aktion = neueSchlangeStartenAktionen.find((eintrag) => eintrag.handkartenId === kartenId) ?? null
    fuehreAktion(aktion)
    setDragOverZone(aktion ? null : { kind: 'ungueltig' })
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      setDragOverZone(null)
    }
  }

  function makeAktionsButtonDragOver(aktionsKartenId: string, zone: DragTarget) {
    return (event: DragEvent<HTMLElement>) => {
      event.stopPropagation()
      const kartenId = leseGezogeneKarteId(event, gezogeneHandkarteIdRef)
      if (kartenId !== aktionsKartenId) {
        setDragOverZone({ kind: 'ungueltig' })
        return
      }
      erlaubeDrop(event)
      setDragOverZone(zone)
    }
  }

  function makeAktionsButtonDrop(findeAktion: (kartenId: string | null) => SpielAktion | null) {
    return (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      event.stopPropagation()
      const kartenId = leseGezogeneKarteId(event, gezogeneHandkarteIdRef)
      const zielAktion = findeAktion(kartenId)
      fuehreAktion(zielAktion)
      setDragOverZone(zielAktion ? null : { kind: 'ungueltig' })
    }
  }

  const hatEigeneSchlangen = aktiverSpieler.schlangen.length > 0

  const dragOverStatus =
    dragOverZone === null ? '' :
    dragOverZone.kind === 'startzone' ? 'Karte kann als neue Schlange gestartet werden.' :
    dragOverZone.kind === 'schlange' ? `Karte kann auf Schlange ${dragOverZone.id} abgelegt werden.` :
    'Karte kann hier nicht abgelegt werden.'

  useEffect(() => {
    const handleDragEnd = () => setDragOverZone(null)
    document.addEventListener('dragend', handleDragEnd)
    return () => document.removeEventListener('dragend', handleDragEnd)
  }, [])

  const titelId = `${komponentenId}-schlangenbereich-titel`
  const eigeneTitelId = `${komponentenId}-eigene-schlangen-titel`
  const startzoneTitelId = `${komponentenId}-startzone-titel`
  const gegnerTitelId = `${komponentenId}-gegnerische-schlangen-titel`
  const startzoneIstZielbereit = Boolean(findeNeueSchlangeAktion(ausgewaehlteHandkarteId))

  return (
    <section className="schlangenbereich" aria-labelledby={titelId}>
      <h4 id={titelId}>Schlangenbereich</h4>
      <p className="schlangen-dragstatus" role="status" aria-live="polite" aria-atomic="true">{dragOverStatus}</p>
      <section
        className="schlangen-gruppe"
        aria-labelledby={eigeneTitelId}
        onClick={handleNeueSchlangeZoneClick}
        onDragOver={handleNeueSchlangeZoneDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleNeueSchlangeZoneDrop}
      >
        <h5 id={eigeneTitelId}>Eigene Schlangen</h5>
        <p className="schlangen-drop-hinweis">
          Ziehe eine Handkarte auf die gewünschte Schlange oder nutze die Startzone, um eine neue Schlange zu beginnen.
        </p>
        <div
          className={`schlangen-startzone${hatEigeneSchlangen ? '' : ' schlangen-startzone--leer'}${startzoneIstZielbereit ? ' schlangen-startzone--zielbereit' : ''}${dragOverZone?.kind === 'startzone' ? ' schlangen-startzone--dragover' : ''}`}
          role="button"
          tabIndex={0}
          aria-labelledby={startzoneTitelId}
          aria-describedby={`${komponentenId}-startzone-hinweis`}
          onClick={(event) => {
            event.stopPropagation()
            handleNeueSchlangeZoneClick(event)
          }}
          onKeyDown={handleNeueSchlangeZoneKeyDown}
          onDragOver={(event) => {
            event.stopPropagation()
            handleNeueSchlangeZoneDragOver(event)
          }}
          onDrop={(event) => {
            event.stopPropagation()
            handleNeueSchlangeZoneDrop(event)
          }}
        >
          <strong id={startzoneTitelId}>Neue Schlange starten</strong>
          <p id={`${komponentenId}-startzone-hinweis`} className="schlangen-drop-hinweis">
            Ziehe eine Farbkarte hierher oder klicke die passende Start-Schaltfläche.
          </p>
          {startzoneIstZielbereit && (
            <span className="schlangen-zielhinweis">Ausgewählte Karte hier als neue Schlange starten.</span>
          )}
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
                onDragOver={makeAktionsButtonDragOver(aktion.handkartenId, { kind: 'startzone' })}
                onDrop={makeAktionsButtonDrop((kartenId) => (kartenId === aktion.handkartenId ? aktion : null))}
              >
                {aktionsLabel(aktion)}
              </button>
            ))}
          </div>
        )}
        {hatEigeneSchlangen ? (
          <ul className="schlangenleiste">
            {aktiverSpieler.schlangen.map((schlange, schlangeIndex) => {
              const anlegeAktionen = karteAnlegenAktionen.filter((aktion) => aktion.schlangenId === schlange.id)
              const istBoardZiel = Boolean(findeAktionFuerKarte(schlange.id, ausgewaehlteHandkarteId))
              const farbenschutzAktion = findeFarbenschutzAktion(schlange.id, ausgewaehlteHandkarteId)
              const schlangenLabelTypId = `${komponentenId}-schlange-${schlangeIndex}-label`
              const schlangenLabelNameId = `${komponentenId}-schlange-${schlangeIndex}-name`

              return (
                <li
                  key={schlange.id}
                  className={`schlangekarte schlangekarte--eigene${istBoardZiel ? ' schlangekarte--zielbereit' : ''}${farbenschutzAktion ? ' schlangekarte--farbenschutz-ziel' : ''}${dragOverZone?.kind === 'schlange' && dragOverZone.id === schlange.id ? ' schlangekarte--dragover' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-labelledby={`${schlangenLabelTypId} ${schlangenLabelNameId}`}
                  aria-describedby={`${komponentenId}-schlange-${schlangeIndex}-anlegehilfe`}
                  onClick={(event) => handleSchlangeClick(event, schlange.id)}
                  onKeyDown={(event) => handleSchlangeKeyDown(event, schlange.id)}
                  onDragOver={(event) => handleSchlangeDragOver(event, schlange.id)}
                  onDrop={(event) => handleSchlangeDrop(event, schlange.id)}
                >
                  <span id={schlangenLabelTypId}>Schlange</span>
                  <strong id={schlangenLabelNameId}>{schlange.id}</strong>
                  <span className="schlangekarte__badge">{schlange.karten.length} Karten</span>
                  <div className="schlangekarte__kartenreihe" role="list" aria-label={`Kartenreihe ${schlange.id}`}>
                    {schlange.karten.map((karte) => {
                      const farbenfusionAktion = findeFarbenfusionAktion(schlange.id, karte.id, ausgewaehlteHandkarteId)
                      const schlangenfrassAktion = findeSchlangenfrassAktion(schlange.id, karte.id, ausgewaehlteHandkarteId)
                      const istSonderaktionZiel = Boolean(farbenfusionAktion ?? schlangenfrassAktion)

                      return (
                        <div
                          key={karte.id}
                          className={`schlangekarte__karte schlangekarte__karte--${karte.typ === 'Farbkarte' ? `farbkarte schlangekarte__karte--farbe-${farbeCssKlasse(karte.farbe)}` : 'sonderkarte'}${istSonderaktionZiel ? ' schlangekarte__karte--sonderaktion-ziel' : ''}${farbenfusionAktion ? ' schlangekarte__karte--farbenfusion-ziel' : ''}${schlangenfrassAktion ? ' schlangekarte__karte--schlangenfrass-ziel' : ''}`}
                          role="listitem"
                          aria-label={schlangenKartenAriaLabel(karte)}
                        >
                          <strong>{karte.id}</strong>
                          <span>{schlangenKartenKurzlabel(karte)}</span>
                          {farbenfusionAktion && (
                            <button
                              type="button"
                              className="schlangekarte__sonderaktion-button"
                              aria-label={`Farbenfusion im Schlangenbereich mit Karte ${farbenfusionAktion.handkartenId} bei Karte ${farbenfusionAktion.zielKartenId}`}
                              title={aktionsLabel(farbenfusionAktion)}
                              onClick={(event) => {
                                event.stopPropagation()
                                onAktion(farbenfusionAktion)
                              }}
                            >
                              Farbenfusion hier spielen
                            </button>
                          )}
                          {schlangenfrassAktion && (
                            <button
                              type="button"
                              className="schlangekarte__sonderaktion-button schlangekarte__sonderaktion-button--frass"
                              aria-label={`Schlangenfrass im Schlangenbereich mit Karte ${schlangenfrassAktion.handkartenId} auf Karte ${karte.id}`}
                              title={aktionsLabel(schlangenfrassAktion)}
                              onClick={(event) => {
                                event.stopPropagation()
                                onAktion(schlangenfrassAktion)
                              }}
                            >
                              Schlangenfrass hier spielen
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <p id={`${komponentenId}-schlange-${schlangeIndex}-anlegehilfe`} className="schlangen-drop-hinweis">
                    Klicke auf eine Anlege-Schaltfläche oder lege die ausgewählte Karte direkt auf die Schlange.
                  </p>
                  {istBoardZiel && (
                    <span className="schlangen-zielhinweis">Ausgewählte Karte hier anlegen.</span>
                  )}
                  {farbenschutzAktion && (
                    <button
                      type="button"
                      className="schlangekarte__sonderaktion-button schlangekarte__sonderaktion-button--schutz"
                      aria-label={`Farbenschutz im Schlangenbereich mit Karte ${farbenschutzAktion.handkartenId} auf Schlange ${farbenschutzAktion.zielSchlangenId}`}
                      title={aktionsLabel(farbenschutzAktion)}
                      onClick={(event) => {
                        event.stopPropagation()
                        onAktion(farbenschutzAktion)
                      }}
                    >
                      Farbenschutz hier spielen
                    </button>
                  )}
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
                          onDragOver={makeAktionsButtonDragOver(aktion.handkartenId, { kind: 'schlange', id: schlange.id })}
                          onDrop={makeAktionsButtonDrop((kartenId) => (kartenId === aktion.handkartenId ? aktion : null))}
                        >
                          {aktion.position === 'links' ? 'Links anlegen' : 'Rechts anlegen'}
                        </button>
                      ))}
                    </div>
                  )}
                  <span>Status: {schlangenStatusLabel(schlange.zustand)}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p>Keine eigenen Schlangen.</p>
        )}
      </section>
      <section className="schlangen-gruppe" aria-labelledby={gegnerTitelId}>
        <h5 id={gegnerTitelId}>Gegnerische Schlangen</h5>
        {gegnerSpieler.some((spieler) => spieler.schlangen.length > 0) ? (
          <ul className="schlangenleiste">
            {gegnerSpieler.flatMap((spieler) =>
              spieler.schlangen.map((schlange) => (
                <li key={schlange.id} className="schlangekarte schlangekarte--gegner">
                  <strong>{schlange.id}</strong>
                  <span>Gehört zu: {spieler.name}</span>
                  <span className="schlangekarte__badge">{schlange.karten.length} Karten</span>
                  <div className="schlangekarte__kartenreihe" role="list" aria-label={`Kartenreihe ${schlange.id}`}>
                    {schlange.karten.map((karte) => {
                      const diebAktionen = findeFarbendiebAktionen(spieler.id, schlange.id, karte.id, ausgewaehlteHandkarteId)
                      return (
                        <div
                          key={karte.id}
                          className={`schlangekarte__karte schlangekarte__karte--${karte.typ === 'Farbkarte' ? `farbkarte schlangekarte__karte--farbe-${farbeCssKlasse(karte.farbe)}` : 'sonderkarte'}${diebAktionen.length > 0 ? ' schlangekarte__karte--sonderaktion-ziel schlangekarte__karte--farbendieb-ziel' : ''}`}
                          role="listitem"
                          aria-label={schlangenKartenAriaLabel(karte)}
                        >
                          <strong>{karte.id}</strong>
                          <span>{schlangenKartenKurzlabel(karte)}</span>
                          {diebAktionen.map((aktion) => (
                            <button
                              key={`${aktion.handkartenId}-${aktion.eigeneSchlangenId}-${aktion.einfügeIndex}`}
                              type="button"
                              className="schlangekarte__sonderaktion-button schlangekarte__sonderaktion-button--dieb"
                              aria-label={`Farbendieb im Schlangenbereich mit Karte ${aktion.handkartenId} von Schlange ${aktion.zielSchlangenId} Karte ${aktion.zielKartenId} auf Schlange ${aktion.eigeneSchlangenId} an Position ${aktion.einfügeIndex + 1}`}
                              title={aktionsLabel(aktion)}
                              onClick={() => onAktion(aktion)}
                            >
                              Farbendieb auf Position {aktion.einfügeIndex + 1}
                            </button>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                  <span>Status: {schlangenStatusLabel(schlange.zustand)}</span>
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
