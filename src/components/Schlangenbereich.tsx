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
import type { SpielAktion, Spieler, Spielkarte, Spielzustand } from '../engine'
import { farbeCssKlasse } from '../kartenfarben'
import GegnerSchlangenListe from './GegnerSchlangenListe'
import WaldtanzZielkompass from './WaldtanzZielkompass'
import SchlangenhaeutungBrettziel from './SchlangenhaeutungBrettziel'
import { hatSchlangenhaeutungBrettziel } from './schlangenhaeutungBrettzielLogik'
import FarbenfusionPaarziel from './FarbenfusionPaarziel'
import { ermittleFarbenfusionPaarInfo } from './farbenfusionPaarInfo'

interface SchlangenbereichProps {
  zustand: Spielzustand
  zeigeSchlangenhaeutungBrettziel?: boolean
  aktiverSpieler: Spieler
  gegnerSpieler: Spieler[]
  karteAnlegenAktionen: Extract<SpielAktion, { typ: 'KarteAnlegen' }>[]
  neueSchlangeStartenAktionen: Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }>[]
  farbenschutzAktionen?: Extract<SpielAktion, { typ: 'FarbenschutzSpielen' }>[]
  farbenfusionAktionen?: Extract<SpielAktion, { typ: 'FarbenfusionSpielen' }>[]
  schlangenfrassAktionen?: Extract<SpielAktion, { typ: 'SchlangenfrassSpielen' }>[]
  schlangenblockadeAktionen?: Extract<SpielAktion, { typ: 'SchlangenblockadeSpielen' }>[]
  farbendiebAktionen?: Extract<SpielAktion, { typ: 'FarbendiebSpielen' }>[]
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
  zustand,
  zeigeSchlangenhaeutungBrettziel = true,
  aktiverSpieler,
  gegnerSpieler,
  karteAnlegenAktionen,
  neueSchlangeStartenAktionen,
  farbenschutzAktionen = [],
  farbenfusionAktionen = [],
  schlangenfrassAktionen = [],
  schlangenblockadeAktionen = [],
  farbendiebAktionen = [],
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

  function findeSchlangenfrassAktion(schlangeId: string, zielKartenId: string, handkartenId: string | null) {
    if (!handkartenId) return null
    return schlangenfrassAktionen.find((aktion) => {
      const [ziel] = aktion.ziele
      return aktion.handkartenId === handkartenId && aktion.ziele.length === 1 && ziel.schlangenId === schlangeId && ziel.kartenId === zielKartenId
    }) ?? null
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
    <section className="schlangenbereich schlangenbereich--waldlichtung" aria-labelledby={titelId}>
      <h4 id={titelId}>Schlangenbereich</h4>
      <p className="schlangen-dragstatus" role="status" aria-live="polite" aria-atomic="true">{dragOverStatus}</p>
      <WaldtanzZielkompass
        ausgewaehlteHandkarteId={ausgewaehlteHandkarteId}
        karteAnlegenAktionen={karteAnlegenAktionen}
        neueSchlangeStartenAktionen={neueSchlangeStartenAktionen}
        farbenschutzAktionen={farbenschutzAktionen}
        farbenfusionAktionen={farbenfusionAktionen}
        schlangenfrassAktionen={schlangenfrassAktionen}
        schlangenblockadeAktionen={schlangenblockadeAktionen}
        farbendiebAktionen={farbendiebAktionen}
      />
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
          className={`schlangen-startzone schlangen-startzone--magiekreis${hatEigeneSchlangen ? '' : ' schlangen-startzone--leer'}${startzoneIstZielbereit ? ' schlangen-startzone--zielbereit' : ''}${dragOverZone?.kind === 'startzone' ? ' schlangen-startzone--dragover' : ''}`}
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
          <span className="schlangen-startzone__badge">Startkreis</span>
          <strong id={startzoneTitelId} className="schlangen-startzone__titel">Neue Schlange starten</strong>
          <span className="schlangen-startzone__titel">Leuchtender Startplatz</span>
          <p id={`${komponentenId}-startzone-hinweis`} className="schlangen-drop-hinweis">
            Ziehe eine Farbkarte hierher oder klicke die passende Start-Schaltfläche.
          </p>
          {startzoneIstZielbereit && (
            <>
              <span className="schlangen-startzone__karte">Bereit: {ausgewaehlteHandkarteId}</span>
              <span className="schlangen-zielhinweis">Karte loslassen oder klicken, um die erste Schlange zu legen.</span>
            </>
          )}
        </div>
        {neueSchlangeStartenAktionen.length > 0 && (
          <div className="schlangekarte__anlegeaktionen schlangekarte__anlegeaktionen--starten" aria-label="Waldtanz-Startkreise">
            {neueSchlangeStartenAktionen.map((aktion) => (
              <button
                key={aktion.handkartenId}
                type="button"
                className="schlangekarte__anlegebutton schlangekarte__anlegebutton--start schlangen-startkreis-button"
                aria-label={`Startkreis mit Karte ${aktion.handkartenId}`}
                title={`Schlangenbereich-Start mit Karte ${aktion.handkartenId}`}
                onClick={(event) => {
                  event.stopPropagation()
                  onAktion(aktion)
                }}
                onDragOver={makeAktionsButtonDragOver(aktion.handkartenId, { kind: 'startzone' })}
                onDrop={makeAktionsButtonDrop((kartenId) => (kartenId === aktion.handkartenId ? aktion : null))}
              >
                <span>In den Startkreis</span>
                <strong>{aktion.handkartenId}</strong>
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
              const istHaeutungZiel = zeigeSchlangenhaeutungBrettziel && hatSchlangenhaeutungBrettziel(zustand, schlange, ausgewaehlteHandkarteId)
              const schlangenLabelTypId = `${komponentenId}-schlange-${schlangeIndex}-label`
              const schlangenLabelNameId = `${komponentenId}-schlange-${schlangeIndex}-name`

              return (
                <li
                  key={schlange.id}
                  className={`schlangekarte schlangekarte--eigene${istBoardZiel ? ' schlangekarte--zielbereit' : ''}${farbenschutzAktion ? ' schlangekarte--farbenschutz-ziel' : ''}${istHaeutungZiel ? ' schlangekarte--haeutung-ziel' : ''}${dragOverZone?.kind === 'schlange' && dragOverZone.id === schlange.id ? ' schlangekarte--dragover' : ''}`}
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
                  <div className="schlangekarte__kartenreihe schlangekarte__kartenreihe--pfad" role="list" aria-label={`Kartenreihe ${schlange.id}`}>
                    {schlange.karten.map((karte, kartenIndex) => {
                      const farbenfusionPaar = ermittleFarbenfusionPaarInfo(schlange.karten, kartenIndex, schlange.id, ausgewaehlteHandkarteId, farbenfusionAktionen)
                      const farbenfusionAktion = farbenfusionPaar?.istStartkarte ? farbenfusionPaar.aktion : null
                      const schlangenfrassAktion = findeSchlangenfrassAktion(schlange.id, karte.id, ausgewaehlteHandkarteId)
                      const istFarbenfusionPaar = Boolean(farbenfusionPaar)
                      const istSonderaktionZiel = Boolean(farbenfusionAktion || istFarbenfusionPaar || schlangenfrassAktion)
                      const istKopf = kartenIndex === 0
                      const istSchwanz = kartenIndex === schlange.karten.length - 1
                      const pfadKlasse = `${istKopf ? ' schlangekarte__karte--kopf' : ''}${istSchwanz ? ' schlangekarte__karte--schwanz' : ''}${!istKopf && !istSchwanz ? ' schlangekarte__karte--koerper' : ''}`

                      return (
                        <div
                          key={karte.id}
                          className={`schlangekarte__karte${pfadKlasse} schlangekarte__karte--${karte.typ === 'Farbkarte' ? `farbkarte schlangekarte__karte--farbe-${farbeCssKlasse(karte.farbe)}` : 'sonderkarte'}${istSonderaktionZiel ? ' schlangekarte__karte--sonderaktion-ziel' : ''}${farbenfusionAktion ? ' schlangekarte__karte--farbenfusion-ziel' : ''}${istFarbenfusionPaar ? ' schlangekarte__karte--farbenfusion-paar' : ''}${schlangenfrassAktion ? ' schlangekarte__karte--schlangenfrass-ziel' : ''}`}
                          role="listitem"
                          aria-label={schlangenKartenAriaLabel(karte)}
                        >
                          <strong>{karte.id}</strong>
                          {istKopf && istSchwanz ? <span className="schlangekarte__pfadmarke">Kopf & Schwanz</span> : null}
                          {istKopf && !istSchwanz ? <span className="schlangekarte__pfadmarke">Kopf</span> : null}
                          {istSchwanz && !istKopf ? <span className="schlangekarte__pfadmarke">Schwanz</span> : null}
                          <span>{schlangenKartenKurzlabel(karte)}</span>
                          <FarbenfusionPaarziel paar={farbenfusionPaar} onAktion={onAktion} />
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
                  {zeigeSchlangenhaeutungBrettziel && (
                    <SchlangenhaeutungBrettziel
                      zustand={zustand}
                      schlange={schlange}
                      ausgewaehlteHandkarteId={ausgewaehlteHandkarteId}
                      onAktion={onAktion}
                    />
                  )}
                  {anlegeAktionen.length > 0 && (
                    <div className="schlangekarte__anlegeaktionen schlangekarte__anlegeplaetze" aria-label={`Waldtanz-Anlegeplätze für ${schlange.id}`}>
                      {anlegeAktionen.map((aktion) => (
                        <button
                          key={`${aktion.handkartenId}-${aktion.schlangenId}-${aktion.position}`}
                          type="button"
                          className={`schlangekarte__anlegebutton schlangekarte__anlegebutton--${aktion.position} schlangekarte__anlegeplatz schlangekarte__anlegeplatz--${aktion.position}`}
                          aria-label={`Schlangenbereich: Karte ${aktion.handkartenId} ${aktion.position} anlegen`}
                          title={aktionsLabel(aktion)}
                          onClick={(event) => {
                            event.stopPropagation()
                            onAktion(aktion)
                          }}
                          onDragOver={makeAktionsButtonDragOver(aktion.handkartenId, { kind: 'schlange', id: schlange.id })}
                          onDrop={makeAktionsButtonDrop((kartenId) => (kartenId === aktion.handkartenId ? aktion : null))}
                        >
                          <span className="schlangekarte__anlegeplatz-richtung">
                            {aktion.position === 'links' ? 'Linkes Ende' : 'Rechtes Ende'}
                          </span>
                          <span className="schlangekarte__anlegeplatz-karte">{aktion.handkartenId}</span>
                          <span className="schlangekarte__anlegeplatz-hinweis">Karte dort anlegen</span>
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
        <GegnerSchlangenListe
          spieler={gegnerSpieler}
          ausgewaehlteHandkarteId={ausgewaehlteHandkarteId}
          schlangenblockadeAktionen={schlangenblockadeAktionen}
          farbendiebAktionen={farbendiebAktionen}
          schlangenfrassAktionen={schlangenfrassAktionen}
          onAktion={onAktion}
          aktionsLabel={aktionsLabel}
        />
      </section>
    </section>
  )
}
