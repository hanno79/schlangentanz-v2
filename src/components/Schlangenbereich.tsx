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
import type { MutableRefObject } from 'react'
import { ermittleRegenbogenWildfarben } from '../engine'
import type { SpielAktion, Spieler, Spielzustand } from '../engine'
import WaldtanzZielkompass from './WaldtanzZielkompass'
import SchlangenhaeutungBrettziel from './SchlangenhaeutungBrettziel'
import WaldtanzZielspur from './WaldtanzZielspur'
import SchlangenPfadKarte from './SchlangenPfadKarte'
import WaldtanzFarbgruppenband from './WaldtanzFarbgruppenband'
import SchlangenWertungsplakette from './SchlangenWertungsplakette'
import { frassKey, fusionKey, schutzKey } from './zielspurKey'
import useSchlangenDragDrop from '../hooks/useSchlangenDragDrop'
import SchlangenStartzone from './SchlangenStartzone'
import WaldtanzErsteSchlangeOnboarding from './WaldtanzErsteSchlangeOnboarding'
import { hatSchlangenhaeutungBrettziel } from './schlangenhaeutungBrettzielLogik'
import { hatSichtbaresEigenesSchlangenziel, zaehleZielspurBrettziele, ermittleZielspurFamilien, ermittleZielspurObjekte, ermittleAutoHighlightZielspurKey } from './waldtanzZielspurLogik'
import FarbenfusionPaarziel from './FarbenfusionPaarziel'
import FarbenschutzSchild from './FarbenschutzSchild'
import SchlangenfrassBissspur from './SchlangenfrassBissspur'
import { ermittleFarbenfusionPaarInfo } from './farbenfusionPaarInfo'
import type { LetzteAktionZiel } from '../aktionsziel/extrahiereAktionZiel'

interface SchlangenbereichProps {
  zustand: Spielzustand
  zeigeSchlangenhaeutungBrettziel?: boolean
  aktiverSpieler: Spieler
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
  // M1dc: Spielmoment-Puls-Ziel, das aus der letzten Aktion abgeleitet wurde.
  letzteAktionZiel?: LetzteAktionZiel | null
  // M1dp-Fix: Meldet den effektiven Zielspur-Highlight-Key nach oben, damit
  // die Schwester-Gegnerlichtung (App-Ebene) dasselbe Brettziel hervorhebt.
  onZielspurKeyChange?: (key: string | null) => void
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

function zielspurKeySelector(key: string) {
  const escaped = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(key) : key.replace(/["\\]/g, '\\$&')
  return `[data-zielspur-key="${escaped}"]`
}

export default function Schlangenbereich({
  zustand,
  zeigeSchlangenhaeutungBrettziel = true,
  aktiverSpieler,
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
  letzteAktionZiel = null,
  onZielspurKeyChange,
}: SchlangenbereichProps) {
  const komponentenId = useId()
  const [aktiverZielspurKey, setAktiverZielspurKey] = useState<string | null>(null)

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

  // ÄNDERUNG [30.07.2026]: AP-4 — das Drag-&-Drop-Verhalten liegt jetzt in
  // useSchlangenDragDrop. Reines Verschieben entlang einer vorhandenen Naht:
  // ein Stück Zustand plus die Handler, die es setzen.
  const {
    dragOverZone,
    setDragOverZone,
    handleSchlangeClick,
    handleSchlangeKeyDown,
    handleSchlangeDragOver,
    handleSchlangeDrop,
    handleNeueSchlangeZoneClick,
    handleNeueSchlangeZoneKeyDown,
    handleNeueSchlangeZoneDragOver,
    handleNeueSchlangeZoneDrop,
    handleDragLeave,
    makeAktionsButtonDragOver,
    makeAktionsButtonDrop,
  } = useSchlangenDragDrop({
    gezogeneHandkarteIdRef,
    ausgewaehlteHandkarteId,
    neueSchlangeStartenAktionen,
    findeAktionFuerKarte,
    findeNeueSchlangeAktion,
    fuehreAktion,
  })

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
    // setDragOverZone stammt aus useState und ist stabil; seit AP-4 kommt es aus
    // dem Hook und muss deshalb in der Abhängigkeitsliste stehen.
  }, [setDragOverZone])

  const titelId = `${komponentenId}-schlangenbereich-titel`
  const eigeneTitelId = `${komponentenId}-eigene-schlangen-titel`
  const startzoneTitelId = `${komponentenId}-startzone-titel`
  const startzoneIstZielbereit = Boolean(findeNeueSchlangeAktion(ausgewaehlteHandkarteId))
  const istGameRoute = typeof window !== 'undefined' && (window.location.pathname === '/game' || window.location.pathname.startsWith('/game/'))
  const haeutungZielAnzahl = zeigeSchlangenhaeutungBrettziel ? aktiverSpieler.schlangen.filter(schlange => hatSchlangenhaeutungBrettziel(zustand, schlange, ausgewaehlteHandkarteId)).length : 0
  const zielspurAnzahl = zaehleZielspurBrettziele({ handkartenId: ausgewaehlteHandkarteId, aktiverSpielerId: aktiverSpieler.id, aktiverSpielerSchlangen: aktiverSpieler.schlangen, karteAnlegenAktionen, neueSchlangeStartenAktionen, farbenschutzAktionen, farbenfusionAktionen, schlangenfrassAktionen, schlangenblockadeAktionen, farbendiebAktionen, haeutungZielAnzahl })
  const zielspurFamilien = ermittleZielspurFamilien({ handkartenId: ausgewaehlteHandkarteId, aktiverSpielerId: aktiverSpieler.id, aktiverSpielerSchlangen: aktiverSpieler.schlangen, karteAnlegenAktionen, neueSchlangeStartenAktionen, farbenschutzAktionen, farbenfusionAktionen, schlangenfrassAktionen, schlangenblockadeAktionen, farbendiebAktionen, haeutungZielAnzahl })
  const zielspurObjekte = ermittleZielspurObjekte({ handkartenId: ausgewaehlteHandkarteId, aktiverSpielerId: aktiverSpieler.id, aktiverSpielerSchlangen: aktiverSpieler.schlangen, karteAnlegenAktionen, neueSchlangeStartenAktionen, farbenschutzAktionen, farbenfusionAktionen, schlangenfrassAktionen, schlangenblockadeAktionen, farbendiebAktionen, haeutungZielAnzahl })

  // M2a: Auto-Highlight fuer Sonderkarten-Brettziele. Wenn der Spieler
  // eine Sonderkarte auswaehlt und ein legales Ziel existiert, wird
  // das passende Brett-Ziel automatisch aktiv hervorgehoben. Bei
  // Farbkarten-Auswahl KEIN Auto-Highlight (die nutzen den Anlegeplatz-Pfad).
  // Wir berechnen den Auto-Key als derived value und mergen ihn mit dem
  // manuellen Highlight-State (M1dq-Spielmoment-Klick).
  const ausgewaehlteKarte = ausgewaehlteHandkarteId
    ? aktiverSpieler.hand.find((karte) => karte.id === ausgewaehlteHandkarteId) ?? null
    : null
  const istSonderkarte = ausgewaehlteKarte?.typ === 'Sonderkarte'
  const autoHighlightKey = istSonderkarte && ausgewaehlteHandkarteId
    ? ermittleAutoHighlightZielspurKey({
        ausgewaehlteHandkarteId,
        aktiverSpielerId: aktiverSpieler.id,
        aktiverSpielerSchlangen: aktiverSpieler.schlangen,
        farbenschutzAktionen: farbenschutzAktionen ?? [],
        farbenfusionAktionen: farbenfusionAktionen ?? [],
        schlangenfrassAktionen: schlangenfrassAktionen ?? [],
        farbendiebAktionen: farbendiebAktionen ?? [],
        schlangenblockadeAktionen: schlangenblockadeAktionen ?? [],
      })
    : null
  // Kimi-Review-Blocker 4: Ghost-Highlight-Bereinigung. Statt eines
  // useEffect+setState nutzen wir Auto-Highlight-Vorrang, wenn der
  // User eine Sonderkarte explizit selektiert. Der manuelle Key
  // (M1dq-Bubble) bleibt nur sichtbar, wenn der User explizit auf
  // die Bubble klickt; sobald die Sonderkarte gewechselt wird,
  // ueberschreibt autoHighlightKey den M1dq-Key.
  const effektiverZielspurKey = autoHighlightKey ?? aktiverZielspurKey

  // Scroll-into-view fuer effektiven Highlight-Key (manuell M1dq ODER auto M2a).
  useEffect(() => {
    if (!effektiverZielspurKey) return
    const ziel = document.querySelector(zielspurKeySelector(effektiverZielspurKey))
    if (!(ziel instanceof HTMLElement)) return
    ziel.scrollIntoView?.({ block: 'center', inline: 'nearest' })
    const fokus = ziel.querySelector('button') ?? ziel
    if (fokus instanceof HTMLElement) fokus.focus({ preventScroll: true })
  }, [effektiverZielspurKey])

  // M1dp-Fix: Den effektiven Highlight-Key an die App-Ebene melden, damit die
  // Schwester-Gegnerlichtung (Farbendieb-Beutekorb/Blockade-Fessel) dasselbe
  // Brettziel hervorhebt wie der Schlangenbereich.
  useEffect(() => {
    onZielspurKeyChange?.(effektiverZielspurKey)
  }, [effektiverZielspurKey, onZielspurKeyChange])

  return (
    <section className={`schlangenbereich schlangenbereich--waldlichtung${ausgewaehlteHandkarteId ? ' schlangenbereich--karte-ausgewaehlt' : ''}`} aria-labelledby={titelId}>
      <h4 id={titelId}>Schlangenbereich</h4>
      <p className="schlangen-dragstatus" role="status" aria-live="polite" aria-atomic="true">{dragOverStatus}</p>
      <section
        className="schlangen-gruppe schlangen-gruppe--eigene-lichtung"
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
        <SchlangenStartzone
          komponentenId={komponentenId}
          startzoneTitelId={startzoneTitelId}
          hatEigeneSchlangen={hatEigeneSchlangen}
          startzoneIstZielbereit={startzoneIstZielbereit}
          dragOverStartzone={dragOverZone?.kind === 'startzone'}
          ausgewaehlteHandkarteId={ausgewaehlteHandkarteId}
          letzteAktionZiel={letzteAktionZiel}
          startfaehrten={istGameRoute ? neueSchlangeStartenAktionen.map((aktion) => ({
            kartenId: aktion.handkartenId,
            onAuswaehlen: () => onAktion(aktion),
          })) : []}
          onClick={(event) => { event.stopPropagation(); handleNeueSchlangeZoneClick(event) }}
          onKeyDown={handleNeueSchlangeZoneKeyDown}
          onDragOver={(event) => { event.stopPropagation(); handleNeueSchlangeZoneDragOver(event) }}
          onDrop={(event) => { event.stopPropagation(); handleNeueSchlangeZoneDrop(event) }}
        />
        {!istGameRoute && neueSchlangeStartenAktionen.length > 0 && (
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
          <>
          <ul className="schlangenleiste">
            {aktiverSpieler.schlangen.map((schlange, schlangeIndex) => {
              const regenbogenWildfarben = ermittleRegenbogenWildfarben(schlange)
              const anlegeAktionen = karteAnlegenAktionen.filter((aktion) => aktion.schlangenId === schlange.id)
              const istBoardZiel = Boolean(findeAktionFuerKarte(schlange.id, ausgewaehlteHandkarteId))
              const farbenschutzAktion = findeFarbenschutzAktion(schlange.id, ausgewaehlteHandkarteId)
              const istHaeutungZiel = zeigeSchlangenhaeutungBrettziel && hatSchlangenhaeutungBrettziel(zustand, schlange, ausgewaehlteHandkarteId)
              const hatSonderkartenZiel = hatSichtbaresEigenesSchlangenziel({ handkartenId: ausgewaehlteHandkarteId, spielerId: aktiverSpieler.id, schlangenId: schlange.id, farbenfusionAktionen, schlangenfrassAktionen })
              const istNichtZiel = Boolean(ausgewaehlteHandkarteId) && !istBoardZiel && !farbenschutzAktion && !istHaeutungZiel && !hatSonderkartenZiel
              const schlangenLabelTypId = `${komponentenId}-schlange-${schlangeIndex}-label`
              const schlangenLabelNameId = `${komponentenId}-schlange-${schlangeIndex}-name`
              const schlangenWertungId = `${komponentenId}-schlange-${schlangeIndex}-wertung`

              const istSolo = schlange.karten.length === 1
              // M1dt: Eigene Schlange = Schlange des aktiven Spielers. Nur eigene Schlangen
              // bekommen Augen/Mund (Stitch-Stil) und werden in der Ausspielphase gewriggelt.
              const istEigeneSchlange = aktiverSpieler.schlangen.includes(schlange)
              // M1dt: Wriggle nur in der Ausspielphase, nicht in Aufgabenprüfung oder Nachziehphase.
              const istAusspielphase = zustand.zugphase === 'Ausspielphase'
              const sollWriggeln = istEigeneSchlange && istAusspielphase

              return (
                <li
                  key={schlange.id}
                  className={`schlangekarte schlangekarte--eigene${istBoardZiel ? ' schlangekarte--zielbereit' : ''}${farbenschutzAktion ? ' schlangekarte--farbenschutz-ziel' : ''}${istHaeutungZiel ? ' schlangekarte--haeutung-ziel' : ''}${istNichtZiel ? ' schlangekarte--nichtziel' : ''}${dragOverZone?.kind === 'schlange' && dragOverZone.id === schlange.id ? ' schlangekarte--dragover' : ''}${istSolo ? ' schlangekarte--solo' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-labelledby={`${schlangenLabelTypId} ${schlangenLabelNameId}`}
                  aria-describedby={`${komponentenId}-schlange-${schlangeIndex}-anlegehilfe ${schlangenWertungId}`}
                  data-letzte-aktion-ziel={letzteAktionZiel?.typ === 'schlange' && letzteAktionZiel.id === schlange.id ? `schlange-${schlange.id}` : undefined}
                  data-wriggle-aktiv={sollWriggeln ? 'true' : undefined}
                  onClick={(event) => handleSchlangeClick(event, schlange.id)}
                  onKeyDown={(event) => handleSchlangeKeyDown(event, schlange.id)}
                  onDragOver={(event) => handleSchlangeDragOver(event, schlange.id)}
                  onDrop={(event) => handleSchlangeDrop(event, schlange.id)}
                >
                  <span id={schlangenLabelTypId} className="schlangekarte__typ">Schlange</span>
                  <strong id={schlangenLabelNameId} className="schlangekarte__name">{schlange.id}</strong>
                  <span className="schlangekarte__badge">{schlange.karten.length} Karten</span>
                  <SchlangenWertungsplakette id={schlangenWertungId} schlange={schlange} />
                  <div
                    className={`schlangekarte__kartenreihe schlangekarte__kartenreihe--pfad${sollWriggeln ? ' schlangekarte--wriggle' : ''}`}
                    role="list"
                    aria-label={`Kartenreihe ${schlange.id}`}
                  >
                    {schlange.karten.map((karte, kartenIndex) => {
                      const farbenfusionPaar = ermittleFarbenfusionPaarInfo(schlange.karten, kartenIndex, schlange.id, ausgewaehlteHandkarteId, farbenfusionAktionen)
                      const farbenfusionAktion = farbenfusionPaar?.istStartkarte ? farbenfusionPaar.aktion : null
                      const schlangenfrassAktion = findeSchlangenfrassAktion(schlange.id, karte.id, ausgewaehlteHandkarteId)
                      const farbenfusionZielspurKey = farbenfusionAktion ? fusionKey(schlange.id, karte.id) : undefined
                      const schlangenfrassZielspurKey = schlangenfrassAktion ? frassKey(aktiverSpieler.id, schlange.id, karte.id) : undefined
                      const istFarbenfusionPaar = Boolean(farbenfusionPaar)
                      const istSonderaktionZiel = Boolean(farbenfusionAktion || istFarbenfusionPaar || schlangenfrassAktion)
                      const istKopf = kartenIndex === 0
                      const istSchwanz = kartenIndex === schlange.karten.length - 1

                      return (
                        <SchlangenPfadKarte
                          key={karte.id}
                          karte={karte}
                          istKopf={istKopf}
                          istSchwanz={istSchwanz}
                          regenbogenWildfarbe={regenbogenWildfarben.get(karte.id)}
                          zeigeKopfGesicht={istEigeneSchlange}
                          zeigeSchwanzCurl={istEigeneSchlange}
                          className={`${istSonderaktionZiel ? ' schlangekarte__karte--sonderaktion-ziel' : ''}${farbenfusionAktion ? ' schlangekarte__karte--farbenfusion-ziel' : ''}${istFarbenfusionPaar ? ' schlangekarte__karte--farbenfusion-paar' : ''}${schlangenfrassAktion ? ' schlangekarte__karte--schlangenfrass-ziel' : ''}`}
                        >
                          <FarbenfusionPaarziel paar={farbenfusionPaar} onAktion={onAktion} zielspurKey={farbenfusionZielspurKey} hervorgehoben={effektiverZielspurKey === farbenfusionZielspurKey} />
                          {schlangenfrassAktion && (
                            <SchlangenfrassBissspur
                              zielKartenId={karte.id}
                              handkartenId={schlangenfrassAktion.handkartenId}
                              modus="einzelziel"
                              ariaLabel={`Schlangenfrass im Schlangenbereich mit Karte ${schlangenfrassAktion.handkartenId} auf Karte ${karte.id}`}
                              title={aktionsLabel(schlangenfrassAktion)}
                              zielspurKey={schlangenfrassZielspurKey}
                              hervorgehoben={effektiverZielspurKey === schlangenfrassZielspurKey}
                              onClick={() => onAktion(schlangenfrassAktion)}
                            />
                          )}
                        </SchlangenPfadKarte>
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
                    <FarbenschutzSchild
                      aktion={farbenschutzAktion}
                      label={aktionsLabel(farbenschutzAktion)}
                      onAktion={onAktion}
                      zielspurKey={schutzKey(schlange.id)}
                      hervorgehoben={effektiverZielspurKey === schutzKey(schlange.id)}
                    />
                  )}
                  {zeigeSchlangenhaeutungBrettziel && (
                    <SchlangenhaeutungBrettziel
                      zustand={zustand}
                      schlange={schlange}
                      ausgewaehlteHandkarteId={ausgewaehlteHandkarteId}
                      onAktion={onAktion}
                    />
                  )}
                  {istGameRoute && !ausgewaehlteHandkarteId && anlegeAktionen.length > 0 && (
                    <ol className="schlangekarte__wachstumsfaehrten" aria-label={`Wachstumsfährten für ${schlange.id}`}>
                      {anlegeAktionen.map((aktion) => (
                        <li key={`${aktion.handkartenId}-${aktion.schlangenId}-${aktion.position}`} className="schlangekarte__wachstumsfaehrte">
                          <button
                            type="button"
                            className={`schlangekarte__wachstumsfaehrte-button schlangekarte__wachstumsfaehrte-button--${aktion.position}`}
                            aria-label={`Wachstumsfährte ${aktion.handkartenId} für Pfad ${schlange.id} ${aktion.position} anlegen`}
                            title={aktionsLabel(aktion)}
                            onClick={(event) => {
                              event.stopPropagation()
                              onAktion(aktion)
                            }}
                            onDragOver={makeAktionsButtonDragOver(aktion.handkartenId, { kind: 'schlange', id: schlange.id })}
                            onDrop={makeAktionsButtonDrop((kartenId) => (kartenId === aktion.handkartenId ? aktion : null))}
                          >
                            <span>Wachstumsfährte</span>
                            <strong>{aktion.handkartenId}</strong>
                            <span>{aktion.position === 'links' ? 'Linkes Ende' : 'Rechtes Ende'}</span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}
                  {(!istGameRoute || ausgewaehlteHandkarteId) && anlegeAktionen.length > 0 && (
                    <div className={`schlangekarte__anlegeaktionen schlangekarte__anlegeplaetze${ausgewaehlteHandkarteId ? ' schlangekarte__anlegeplaetze--vorschau' : ''}`} aria-label={`Waldtanz-Anlegeplätze für ${schlange.id}`}>
                      {anlegeAktionen.map((aktion, anlegeIndex) => {
                        const istAusgewaehlterAnlegeplatz = aktion.handkartenId === ausgewaehlteHandkarteId
                        const anlegeVorschauId = `${komponentenId}-schlange-${schlangeIndex}-anlege-${anlegeIndex}-vorschau`
                        const richtung = aktion.position === 'links' ? 'links' : 'rechts'

                        return (
                          <button
                            key={`${aktion.handkartenId}-${aktion.schlangenId}-${aktion.position}`}
                            type="button"
                            className={`schlangekarte__anlegebutton schlangekarte__anlegebutton--${aktion.position} schlangekarte__anlegeplatz schlangekarte__anlegeplatz--${aktion.position}${istAusgewaehlterAnlegeplatz ? ' schlangekarte__anlegeplatz--ausgewaehlt schlangekarte__anlegeplatz--ziel-puls' : ''}`}
                            aria-label={`Schlangenbereich: Karte ${aktion.handkartenId} ${aktion.position} anlegen`}
                            aria-describedby={istAusgewaehlterAnlegeplatz ? anlegeVorschauId : undefined}
                            title={aktionsLabel(aktion)}
                            onClick={(event) => {
                              event.stopPropagation()
                              onAktion(aktion)
                            }}
                            onDragOver={makeAktionsButtonDragOver(aktion.handkartenId, { kind: 'schlange', id: schlange.id })}
                            onDrop={makeAktionsButtonDrop((kartenId) => (kartenId === aktion.handkartenId ? aktion : null))}
                          >
                            <span className="schlangekarte__anlegeplatz-kopfzeile">
                              <span className="schlangekarte__anlegeplatz-pfeil" aria-hidden="true">
                                {aktion.position === 'links' ? '←' : '→'}
                              </span>
                              <span className="schlangekarte__anlegeplatz-richtung">
                                {aktion.position === 'links' ? 'Linkes Ende' : 'Rechtes Ende'}
                              </span>
                            </span>
                            {istAusgewaehlterAnlegeplatz ? (
                              <span id={anlegeVorschauId} className="schlangekarte__anlegeplatz-vorschau">
                                <span className="schlangekarte__anlegeplatz-vorschau-label">Anlegekarte</span>
                                <strong className="schlangekarte__anlegeplatz-karte schlangekarte__anlegeplatz-vorschau-id">{aktion.handkartenId}</strong>
                                <span className="schlangekarte__anlegeplatz-vorschau-hinweis">
                                  <span className="schlangekarte__anlegeplatz-pfeil" aria-hidden="true">
                                    {aktion.position === 'links' ? '←' : '→'}
                                  </span>
                                  Klick legt die Karte {richtung} an.
                                </span>
                              </span>
                            ) : (
                              <>
                                <span className="schlangekarte__anlegeplatz-karte">{aktion.handkartenId}</span>
                                <span className="schlangekarte__anlegeplatz-hinweis">Karte dort anlegen</span>
                              </>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  <span className="schlangekarte__status">Status: {schlangenStatusLabel(schlange.zustand)}</span>
                </li>
              )
            })}
          </ul>
          <div className="waldtanz-farbgruppenband-ablage" aria-label="Farbgruppenbänder eigener Schlangen">
            {aktiverSpieler.schlangen.map((schlange) => (
              <WaldtanzFarbgruppenband key={schlange.id} schlange={schlange} offeneAufgaben={zustand.offeneAufgaben} />
            ))}
          </div>
          </>
        ) : istGameRoute ? (
          <WaldtanzErsteSchlangeOnboarding />
        ) : (
          <p>Keine eigenen Schlangen.</p>
        )}
      </section>
      <WaldtanzZielspur karteId={ausgewaehlteHandkarteId} zielAnzahl={zielspurAnzahl} familien={zielspurFamilien} objekte={zielspurObjekte} aktiverZielKey={aktiverZielspurKey} onZielAktivieren={setAktiverZielspurKey} />
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
      {/* M1dp: gegnerische Schlangen sind in die neue WaldtanzGegnerlichtung
          im Arenastein gewandert und werden hier nicht mehr gerendert. */}
    </section>
  )
}
