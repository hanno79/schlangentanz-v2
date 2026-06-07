/*
Author: rahn
Datum: 04.06.2026
Version: 1.3
Beschreibung: Aktionenbereich-Komponente für Schlangentanz v2 – empfohlene Aktion,
weitere legale Aktionen, Phasenaktion, Endphase-Hinweis, No-Draw-Status und Phasenregeln.
Änderung v1.3: Weitere legale Aktionen als semantische geordnete Liste (ol/li) dargestellt (F30).
*/

import type { NichtEnumerierteAktionHinweis, SpielAktion, Spielzustand } from '../engine'
import { MAX_KARTEN_PRO_ZUG, MINDESTHANDKARTEN } from '../engine'

export const EMPFOHLENE_AKTION_ID = 'empfohlene-aktion'
export const PHASENAKTION_ID = 'phasenaktion'

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
      return 'Du hast eine Schlangenhäutung und mindestens eine eigene aktive Schlange zum Neuordnen. Die konkrete Reihenfolge wählst du in einem folgenden UI-Slice.'
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
  onAktionAusfuehren,
  onAusspielphaseBeenden,
  onAufgabenpruefungBeenden,
  onUeberzaehligeKartenAbwerfen,
  onZugBeenden,
  onAusspielphaseStarten,
}: AktionenPanelProps) {
  const empfohlenLabel = legaleAktionen.length > 0 ? aktionsLabel(legaleAktionen[0]) : ''
  return (
    <section className="info-panel" aria-label="Aktionen">
      <h2>Aktionen</h2>
      <p>Legale Aktionen: {legaleAktionen.length}</p>
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
          <section id={EMPFOHLENE_AKTION_ID} className={`aktionen-gruppe aktionen-gruppe--empfohlen${hervorgehobenesAktionszielId === EMPFOHLENE_AKTION_ID ? ' aktionen-gruppe--sprungziel' : ''}`} aria-label="Empfohlene Aktion" tabIndex={-1}>
            <h3>Empfohlene Aktion</h3>
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
          <section className="aktionen-gruppe aktionen-gruppe--weitere" aria-label="Weitere Aktionen">
            <h3>Weitere legale Aktionen</h3>
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
              <p>Keine weiteren legalen Aktionen.</p>
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
            <p>Quelle: engine.ermittleLegaleAktionen</p>
          </section>
          {nichtEnumerierteAktionenHinweise.length > 0 && (
            <section className="aktionen-gruppe aktionen-gruppe--hinweise" aria-label="Weitere verfügbare Aktionen">
              <h3>Weitere verfügbare Aktionen</h3>
              <ul>
                {nichtEnumerierteAktionenHinweise.map((hinweis) => (
                  <li key={hinweis.typ}>
                    <strong>{aktionsHinweisTitel(hinweis)}</strong>
                    <p>{aktionsHinweisBeschreibung(hinweis)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section
            id={PHASENAKTION_ID}
            className={`aktionen-gruppe aktionen-gruppe--phasenaktion${hervorgehobenesAktionszielId === PHASENAKTION_ID ? ' aktionen-gruppe--sprungziel' : ''}`}
            aria-label="Phasenaktion"
            tabIndex={-1}
          >
            <h3>Phasenaktion</h3>
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
            <section className="aktionen-gruppe aktionen-gruppe--endphase" aria-label="Endphase">
              <h3>Endphase</h3>
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
      <section aria-label="Phasenregeln">
        <h3>Phasenregeln</h3>
        <ul>
          {phasenregeln(zustand, ueberhand).map(regel => (
            <li key={regel}>{regel}</li>
          ))}
        </ul>
        <h4>Legale Aktionen dieser Phase</h4>
        <ul>
          {legaleAktionen.length > 0 ? (
            legaleAktionen.map(aktion => <li key={JSON.stringify(aktion)}>{aktionsLabel(aktion)}</li>)
          ) : (
            <li>Aktuell keine legalen Aktionen in dieser Phase.</li>
          )}
        </ul>
      </section>
    </section>
  )
}
