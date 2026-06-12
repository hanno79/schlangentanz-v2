/*
Author: rahn
Datum: 04.06.2026
Version: 1.13
Beschreibung: Aktionenbereich-Komponente für Schlangentanz v2 – empfohlene Aktion,
weitere Aktionen, Phasenaktion, Endphase-Hinweis, No-Draw-Status und Phasenregeln.
Änderung v1.3: Weitere Aktionen als semantische geordnete Liste (ol/li) dargestellt (F30).
Änderung v1.4: R113 – empfohleneAktionId/phasenaktionId als Props; DOM-sichere IDs bei parallelen App-Instanzen.
Änderung v1.5: R141 – sichtbare Aktionen-Copy spielerfreundlich ohne Legalitätsjargon.
Änderung v1.6: R145 – Aktionenbereich per sichtbarer Überschrift labeln.
Änderung v1.7: R153 – Weitere Aktionen per sichtbarer Überschrift labeln.
Änderung v1.8: R154 – Phasenaktion per sichtbarer Überschrift labeln.
Änderung v1.9: R155 – Weitere verfügbare Aktionen per sichtbarer Überschrift labeln.
Änderung v1.10: R156 – Endphase per sichtbarer Überschrift labeln.
Änderung v1.11: R157 – Phasenregeln per sichtbarer Überschrift labeln.
Änderung v1.12: R173 – Aktionenbereich als höfliche atomare Live-Region angekündigt.
Änderung v1.13: R174 – Empfohlene Aktion als höfliche atomare Live-Region angekündigt.
Änderung v1.14: R175 – Weitere Aktionen als höfliche atomare Live-Region angekündigt.
*/

import { useId } from 'react'
import type { NichtEnumerierteAktionHinweis, SpielAktion, Spielzustand } from '../engine'
import { MAX_KARTEN_PRO_ZUG, MINDESTHANDKARTEN } from '../engine'
import SchlangenhaeutungReihenfolgeAuswahl from './SchlangenhaeutungReihenfolgeAuswahl'


function erlaubteKartenProZug(zustand: Spielzustand): number {
  return MAX_KARTEN_PRO_ZUG + (zustand.zugpflichten.verdopplerBonusAktiv === true ? 1 : 0)
}

function maxKartenartProZug(zustand: Spielzustand): number {
  return zustand.zugpflichten.verdopplerBonusAktiv === true ? 2 : 1
}

function phasenregeln(zustand: Spielzustand, ueberhand: number): string[] {
  switch (zustand.zugphase) {
    case 'Nachziehphase':
      return [`Nachziehphase: Auf ${MINDESTHANDKARTEN} Handkarten nachziehen, falls unter ${MINDESTHANDKARTEN} und der Stapel noch Karten hat.`]
    case 'Ausspielphase':
      return [
        `Ausspielphase: Mindestens 1 Karte spielen oder abwerfen, höchstens ${erlaubteKartenProZug(zustand)} Karten insgesamt.`,
        `Pro Zug höchstens ${maxKartenartProZug(zustand)} Farbkarten und höchstens ${maxKartenartProZug(zustand)} Sonderkarten.`,
      ]
    case 'Aufgabenpruefung':
      return ['Aufgabenprüfung: Offene und geheime Aufgaben prüfen.']
    case 'Zugabschluss':
      return ueberhand > 0
        ? ['Zugabschluss: Zuerst überzählige Karten abwerfen, dann Zug beenden.']
        : ['Zugabschluss: Zug beenden und Spielerwechsel durchführen.']
    case 'Spielende':
      return ['Spielende: Keine weiteren Aktionen.']
  }
}

function aktionsButtonInhalt(label: string, index: number, total: number) {
  return (
    <>
      <span aria-hidden="true">Jetzt ausführen</span>
      <span aria-hidden="true" className="aktions-button__meta">Aktion {index} von {total}</span>
      <span className="aktions-button__label">{label}</span>
    </>
  )
}

function aktionsHinweisTitel(hinweis: NichtEnumerierteAktionHinweis): string {
  switch (hinweis.typ) {
    case 'Schlangenhaeutung':
      return 'Schlangenhäutung verfügbar'
  }
}

function aktionsHinweisBeschreibung(hinweis: NichtEnumerierteAktionHinweis): string {
  switch (hinweis.typ) {
    case 'Schlangenhaeutung':
      return 'Du hast eine Schlangenhäutung und mindestens eine eigene aktive Schlange zum Neuordnen. Wähle eine verfügbare Neuordnung und führe sie über die Schlangenhäutung aus.'
  }
}

interface AktionenPanelProps {
  zustand: Spielzustand
  legaleAktionen: SpielAktion[]
  nichtEnumerierteAktionenHinweise: NichtEnumerierteAktionHinweis[]
  reaktionsAktionen: SpielAktion[]
  ueberhand: number
  istSpielende: boolean
  steuerung: Spielzustand['spieler'][number]['steuerung']
  aktionsLabel: (aktion: SpielAktion) => string
  pflichtschrittLabel: string
  hervorgehobenesAktionszielId: string | null
  empfohleneAktionId: string
  phasenaktionId: string
  onAktionAusfuehren: (aktion: SpielAktion) => void
  onAusspielphaseBeenden: () => void
  onAufgabenpruefungBeenden: () => void
  onUeberzaehligeKartenAbwerfen: () => void
  onZugBeenden: () => void
  onAusspielphaseStarten: () => void
}

export default function AktionenPanel({
  zustand,
  legaleAktionen,
  nichtEnumerierteAktionenHinweise,
  reaktionsAktionen,
  ueberhand,
  istSpielende,
  steuerung,
  aktionsLabel,
  pflichtschrittLabel,
  hervorgehobenesAktionszielId,
  empfohleneAktionId,
  phasenaktionId,
  onAktionAusfuehren,
  onAusspielphaseBeenden,
  onAufgabenpruefungBeenden,
  onUeberzaehligeKartenAbwerfen,
  onZugBeenden,
  onAusspielphaseStarten,
}: AktionenPanelProps) {
  const aktionenTitelId = useId()
  const empfohleneAktionTitelId = useId()
  const weitereAktionenTitelId = useId()
  const weitereVerfuegbareAktionenTitelId = useId()
  const phasenaktionTitelId = useId()
  const endphaseTitelId = useId()
  const phasenregelnTitelId = useId()
  const empfohlenLabel = legaleAktionen.length > 0 ? aktionsLabel(legaleAktionen[0]) : ''
  return (
    <section className="info-panel" aria-labelledby={aktionenTitelId} aria-live="polite" aria-atomic="true">
      <h2 id={aktionenTitelId}>Aktionen</h2>
      <p>Spielbare Aktionen: {legaleAktionen.length}</p>
      {istSpielende ? (
        <p>Keine weiteren Aktionen. Die Partie ist beendet.</p>
      ) : (
        <>
          <p>Nächster Pflichtschritt: {pflichtschrittLabel}</p>
          {steuerung === 'KI' && legaleAktionen.length > 0 && (
            <button onClick={() => onAktionAusfuehren(legaleAktionen[0])}>
              KI-Aktion ausführen
            </button>
          )}
          <section id={empfohleneAktionId} className={`aktionen-gruppe aktionen-gruppe--empfohlen${hervorgehobenesAktionszielId === empfohleneAktionId ? ' aktionen-gruppe--sprungziel' : ''}`} aria-labelledby={empfohleneAktionTitelId} aria-live="polite" aria-atomic="true" tabIndex={-1}>
            <h3 id={empfohleneAktionTitelId}>Empfohlene Aktion</h3>
            {legaleAktionen.length > 0 ? (
              <button
                aria-label={empfohlenLabel}
                className="aktions-button aktions-button--empfohlen aktions-button--hervorgehoben"
                onClick={() => onAktionAusfuehren(legaleAktionen[0])}
              >
                <span className="aktions-button__badge" aria-hidden="true">Empfohlen</span>
                {aktionsButtonInhalt(empfohlenLabel, 1, legaleAktionen.length)}
              </button>
            ) : (
              <p>Keine empfohlene Aktion verfügbar.</p>
            )}
          </section>
          <section className="aktionen-gruppe aktionen-gruppe--weitere" aria-labelledby={weitereAktionenTitelId} aria-live="polite" aria-atomic="true">
            <h3 id={weitereAktionenTitelId}>Weitere Aktionen</h3>
            {legaleAktionen.length > 1 ? (
              <ol className="aktions-liste" start={2}>
                {legaleAktionen.slice(1).map((aktion: SpielAktion, i: number) => {
                  const label = aktionsLabel(aktion)
                  return (
                    <li key={`${label}-${i}`}>
                      <button
                        aria-label={label}
                        className="aktions-button"
                        onClick={() => onAktionAusfuehren(aktion)}
                      >
                        {aktionsButtonInhalt(label, i + 2, legaleAktionen.length)}
                      </button>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p>Keine weiteren Aktionen.</p>
            )}
            {reaktionsAktionen.length > 0 && (
              <>
                <p className="aktions-hinweis">Reaktionsaktion auswählen:</p>
                {reaktionsAktionen.map((aktion: SpielAktion) => (
                  <button
                    key={aktionsLabel(aktion)}
                    className="aktions-button--reaktion"
                    onClick={() => onAktionAusfuehren(aktion)}
                  >
                    {aktionsLabel(aktion)}
                  </button>
                ))}
              </>
            )}
            <p>Spielregeln prüfen jede Aktion vor dem Ausführen.</p>
          </section>
          {nichtEnumerierteAktionenHinweise.length > 0 && (
            <section className="aktionen-gruppe aktionen-gruppe--hinweise" aria-labelledby={weitereVerfuegbareAktionenTitelId}>
              <h3 id={weitereVerfuegbareAktionenTitelId}>Weitere verfügbare Aktionen</h3>
              <ul>
                {nichtEnumerierteAktionenHinweise.map((hinweis) => (
                  <li key={hinweis.typ}>
                    <strong>{aktionsHinweisTitel(hinweis)}</strong>
                    <p>{aktionsHinweisBeschreibung(hinweis)}</p>
                    {hinweis.typ === 'Schlangenhaeutung' && (
                      <SchlangenhaeutungReihenfolgeAuswahl
                        zustand={zustand}
                        onAktionAusfuehren={onAktionAusfuehren}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section
            id={phasenaktionId}
            className={`aktionen-gruppe aktionen-gruppe--phasenaktion${hervorgehobenesAktionszielId === phasenaktionId ? ' aktionen-gruppe--sprungziel' : ''}`}
            aria-labelledby={phasenaktionTitelId}
            tabIndex={-1}
          >
            <h3 id={phasenaktionTitelId}>Phasenaktion</h3>
            {zustand.zugphase === 'Ausspielphase' && zustand.zugpflichten.gespielteKarten > 0 && (
              <button onClick={onAusspielphaseBeenden}>
                Ausspielphase beenden
              </button>
            )}
            {zustand.zugphase === 'Aufgabenpruefung' && (
              <button onClick={onAufgabenpruefungBeenden}>
                Aufgabenprüfung beenden
              </button>
            )}
            {zustand.zugphase === 'Zugabschluss' && ueberhand > 0 && (
              <button onClick={onUeberzaehligeKartenAbwerfen}>
                Überzählige Karten abwerfen
              </button>
            )}
            {zustand.zugphase === 'Zugabschluss' && ueberhand === 0 && (
              <button onClick={onZugBeenden}>
                Zug beenden
              </button>
            )}
            {zustand.zugphase === 'Nachziehphase' && (
              <button onClick={onAusspielphaseStarten}>
                Ausspielphase starten
              </button>
            )}
          </section>
          {zustand.spielphase === 'Endspurt' && (
            <section className="aktionen-gruppe aktionen-gruppe--endphase" aria-labelledby={endphaseTitelId}>
              <h3 id={endphaseTitelId}>Endphase</h3>
              <p>
                Der letzte Zieher hat den Nachziehstapel geleert. Danach erhält jeder verbleibende Spieler genau
                noch einen Zug ohne Nachziehen.
              </p>
            </section>
          )}
          <p>Gespielte Karten: {zustand.zugpflichten.gespielteKarten}/{erlaubteKartenProZug(zustand)}</p>
          <p>
            Gespielte Kartenarten: {zustand.zugpflichten.gespielteFarbkarten} Farbkarten, {zustand.zugpflichten.gespielteSonderkarten} Sonderkarten
          </p>
        </>
      )}
      <section aria-labelledby={phasenregelnTitelId}>
        <h3 id={phasenregelnTitelId}>Phasenregeln</h3>
        <ul>
          {phasenregeln(zustand, ueberhand).map(regel => (
            <li key={regel}>{regel}</li>
          ))}
        </ul>
        <h4>Spielbare Aktionen in dieser Phase</h4>
        <ul>
          {legaleAktionen.length > 0 ? (
            legaleAktionen.map(aktion => <li key={JSON.stringify(aktion)}>{aktionsLabel(aktion)}</li>)
          ) : (
            <li>Aktuell keine spielbaren Aktionen in dieser Phase.</li>
          )}
        </ul>
      </section>
    </section>
  )
}
