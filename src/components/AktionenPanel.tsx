/*
Author: rahn
Datum: 04.06.2026
Version: 1.16
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
Änderung v1.15: R176 – Phasenaktion als höfliche atomare Live-Region angekündigt.
Änderung v1.16: M1b – Aktionsdock gruppiert schnelle Kontextaktionen board-nah vor der Fallback-Liste.
*/

import { useId } from 'react'
import type { NichtEnumerierteAktionHinweis, SpielAktion, Spielzustand } from '../engine'
import { MAX_KARTEN_PRO_ZUG, MINDESTHANDKARTEN } from '../engine'
import SchlangenhaeutungReihenfolgeAuswahl from './SchlangenhaeutungReihenfolgeAuswahl'
import { ausspielphaseBeendbar } from '../spielLabelHelpers'
import { gruppiereWirkungsgleicheAktionen } from '../aktionsGruppen'


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

function aktionsButtonInhalt(label: string, index: number, total: number, anzahlKarten = 1) {
  return (
    <>
      <span aria-hidden="true">Jetzt ausführen</span>
      <span aria-hidden="true" className="aktions-button__meta">Aktion {index} von {total}</span>
      <span className="aktions-button__label">{label}</span>
      {/* ÄNDERUNG [30.07.2026]: AP-3 — wirkungsgleiche Aktionen sind zu einer
          zusammengefasst. Der Chip zeigt, wie viele gleichwertige Karten dafür
          bereitliegen, damit die Zusammenfassung nicht wie ein Verlust wirkt. */}
      {anzahlKarten > 1 && (
        <span className="aktions-button__kartenzahl">{anzahlKarten} gleichwertige Karten</span>
      )}
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

function PhasenregelnBereich({
  titelId,
  zustand,
  ueberhand,
  legaleAktionen,
  aktionsLabel,
  verbergeAktionsLabels = false,
}: {
  titelId: string
  zustand: Spielzustand
  ueberhand: number
  legaleAktionen: SpielAktion[]
  aktionsLabel: (aktion: SpielAktion) => string
  verbergeAktionsLabels?: boolean
}) {
  return (
    <section aria-labelledby={titelId}>
      <h3 id={titelId}>Phasenregeln</h3>
      <ul>
        {phasenregeln(zustand, ueberhand).map(regel => (
          <li key={regel}>{regel}</li>
        ))}
      </ul>
      <h4>Spielbare Aktionen in dieser Phase</h4>
      <ul>
        {/* H3: Während des KI-Zuges dürfen keine konkreten Aktions-Labels (mit Kartendaten der
            KI-Hand) angezeigt werden — nur die Anzahl. */}
        {verbergeAktionsLabels ? (
          <li>{legaleAktionen.length} Aktion{legaleAktionen.length === 1 ? '' : 'en'} verfügbar — Details während des Gegnerzugs verborgen.</li>
        ) : legaleAktionen.length > 0 ? (
          legaleAktionen.map(aktion => <li key={JSON.stringify(aktion)}>{aktionsLabel(aktion)}</li>)
        ) : (
          <li>Aktuell keine spielbaren Aktionen in dieser Phase.</li>
        )}
      </ul>
    </section>
  )
}

export interface AktionenPanelProps {
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
  onKiZugVorspulen: () => void
  kompakterBrettFallback?: boolean
  brettinline?: boolean
  zeigePhasenaktion?: boolean
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
  onKiZugVorspulen,
  kompakterBrettFallback = false,
  brettinline = false,
  zeigePhasenaktion = true,
}: AktionenPanelProps) {
  const aktionenTitelId = useId()
  const empfohleneAktionTitelId = useId()
  const weitereAktionenTitelId = useId()
  const weitereVerfuegbareAktionenTitelId = useId()
  const phasenaktionTitelId = useId()
  const endphaseTitelId = useId()
  const phasenregelnTitelId = useId()
  // ÄNDERUNG [30.07.2026]: AP-3 — die Engine enumeriert eine Aktion pro Handkarte;
  // fünf blaue Handkarten ergeben fünf wirkungsgleiche Aktionen. Für die Anzeige
  // werden sie zusammengefasst. Bewusst NUR hier und nicht auf `legaleAktionen`
  // insgesamt: das Handkarten-Panel leitet aus derselben Liste ab, welche Karte
  // spielbar ist — global entdoppelt gälten vier von fünf blauen Karten als
  // unspielbar.
  const aktionsGruppen = gruppiereWirkungsgleicheAktionen(
    legaleAktionen,
    zustand.spieler[zustand.aktiverSpielerIndex].hand,
  )
  const empfohleneGruppe = aktionsGruppen[0]
  const empfohlenLabel = empfohleneGruppe ? aktionsLabel(empfohleneGruppe.aktion) : ''
  const hatReaktionsaktion = reaktionsAktionen.length > 0
  const weitereAktionenBereich = (
    <section className="aktionen-gruppe aktionen-gruppe--weitere" aria-labelledby={weitereAktionenTitelId} aria-live="polite" aria-atomic="true">
      <h3 id={weitereAktionenTitelId}>Weitere Aktionen</h3>
      {aktionsGruppen.length > 1 ? (
        <ol className="aktions-liste" start={2}>
          {aktionsGruppen.slice(1).map((gruppe, i: number) => {
            const label = aktionsLabel(gruppe.aktion)
            return (
              <li key={`${label}-${i}`}>
                <button
                  aria-label={label}
                  className="aktions-button"
                  onClick={() => onAktionAusfuehren(gruppe.aktion)}
                >
                  {aktionsButtonInhalt(label, i + 2, aktionsGruppen.length, gruppe.anzahl)}
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
  )
  const statusUndRegelnInhalt = (
    <>
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
      <PhasenregelnBereich
        titelId={phasenregelnTitelId}
        zustand={zustand}
        ueberhand={ueberhand}
        legaleAktionen={legaleAktionen}
        aktionsLabel={aktionsLabel}
        verbergeAktionsLabels={steuerung === 'KI'}
      />
    </>
  )
  const fallbackInhalt = (
    <>
      {weitereAktionenBereich}
      {statusUndRegelnInhalt}
    </>
  )

  return (
    <section className={`info-panel aktionen-panel--waldtanz-dock${kompakterBrettFallback ? ' aktionen-panel--brettfallback' : ''}${brettinline ? ' aktionen-panel--brettinline' : ''}`} aria-labelledby={aktionenTitelId} aria-live="polite" aria-atomic="true">
      <h2 id={aktionenTitelId}>Aktionen</h2>
      <div className="aktionen-dock__kopf">
        {/* ÄNDERUNG [30.07.2026]: AP-3 — gezählt werden die angezeigten Aktionen, nicht
            die Engine-Enumeration. Sonst stünde „Spielbare Aktionen: 5" über einem
            einzigen Knopf, weil fünf gleichwertige Handkarten zusammengefasst sind. */}
        <p>Spielbare Aktionen: {aktionsGruppen.length}</p>
        {!istSpielende && <p>Nächster Pflichtschritt: {pflichtschrittLabel}</p>}
      </div>
      {istSpielende ? (
        <>
          <p>Keine weiteren Aktionen. Die Partie ist beendet.</p>
          <PhasenregelnBereich
            titelId={phasenregelnTitelId}
            zustand={zustand}
            ueberhand={ueberhand}
            legaleAktionen={legaleAktionen}
            aktionsLabel={aktionsLabel}
          />
        </>
      ) : (
        <>
          {steuerung === 'KI' && !hatReaktionsaktion && !kompakterBrettFallback && (
            <section className="aktionen-gruppe aktionen-gruppe--ki-zug" aria-label="Gegnerzug-Steuerung">
              <p>Die KI spielt ihren Zug automatisch über die Engine.</p>
              <button onClick={onKiZugVorspulen}>
                Gegnerzüge bis zu deinem Zug abspielen
              </button>
            </section>
          )}
          {steuerung === 'KI' && reaktionsAktionen.length === 0 ? (
            <>
              <p className="aktionen-dock__ki-hinweis">Einzelne KI-Aktionsbuttons sind ausgeblendet. Nutze den Gegnerzug, damit das Spiel bis zu deinem nächsten Zug weiterläuft.</p>
              {statusUndRegelnInhalt}
            </>
          ) : (
            <>
              <div className="aktionen-dock__schnellzug">
            <section id={empfohleneAktionId} className={`aktionen-gruppe aktionen-gruppe--empfohlen${hervorgehobenesAktionszielId === empfohleneAktionId ? ' aktionen-gruppe--sprungziel' : ''}`} aria-labelledby={empfohleneAktionTitelId} aria-live="polite" aria-atomic="true" tabIndex={-1}>
              <h3 id={empfohleneAktionTitelId}>Empfohlene Aktion</h3>
              {empfohleneGruppe ? (
                <button
                  aria-label={empfohlenLabel}
                  className="aktions-button aktions-button--empfohlen aktions-button--hervorgehoben"
                  onClick={() => onAktionAusfuehren(empfohleneGruppe.aktion)}
                >
                  <span className="aktions-button__badge" aria-hidden="true">Empfohlen</span>
                  {aktionsButtonInhalt(empfohlenLabel, 1, aktionsGruppen.length, empfohleneGruppe.anzahl)}
                </button>
              ) : (
                <p>Keine empfohlene Aktion verfügbar.</p>
              )}
            </section>
            {zeigePhasenaktion && (
            <section
              id={phasenaktionId}
              className={`aktionen-gruppe aktionen-gruppe--phasenaktion${hervorgehobenesAktionszielId === phasenaktionId ? ' aktionen-gruppe--sprungziel' : ''}`}
              aria-labelledby={phasenaktionTitelId}
              aria-live="polite"
              aria-atomic="true"
              tabIndex={-1}
            >
              <h3 id={phasenaktionTitelId}>Phasenaktion</h3>
              {ausspielphaseBeendbar(zustand) && !hatReaktionsaktion && (
                <button onClick={onAusspielphaseBeenden}>
                  Ausspielphase beenden
                </button>
              )}
              {zustand.zugphase === 'Aufgabenpruefung' && !hatReaktionsaktion && (
                <button onClick={onAufgabenpruefungBeenden}>
                  Aufgabenprüfung beenden
                </button>
              )}
              {zustand.zugphase === 'Zugabschluss' && ueberhand > 0 && !hatReaktionsaktion && (
                <button onClick={onUeberzaehligeKartenAbwerfen}>
                  Überzählige Karten abwerfen
                </button>
              )}
              {zustand.zugphase === 'Zugabschluss' && ueberhand === 0 && !hatReaktionsaktion && (
                <button onClick={onZugBeenden}>
                  Zug beenden
                </button>
              )}
              {zustand.zugphase === 'Nachziehphase' && !hatReaktionsaktion && (
                <button onClick={onAusspielphaseStarten}>
                  Ausspielphase starten
                </button>
              )}
            </section>
            )}
          </div>
          {kompakterBrettFallback ? (
            <details className="aktionen-fallback">
              <summary>Brett-Fallback: weitere Aktionen und Regeln</summary>
              {fallbackInhalt}
            </details>
          ) : fallbackInhalt}
            </>
          )}
        </>
      )}
    </section>
  )
}
