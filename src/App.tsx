import { Fragment, useId, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  erstelleSpielzustand,
  starteAusspielphase,
  ermittleLegaleAktionen,
  ermittleNichtEnumerierteAktionenHinweise,
  ermittleReaktionsAktionen,
  anwendeAktion,
  beendeAusspielphase,
  beendeAufgabenpruefung,
  beendeZug,
  werfeUeberzaehligeHandkartenAb,
  HANDKARTENLIMIT,
  berechneSpielzustandGesamtwertung,
  berechneGewinner,
  erstelleSonderkarten,
  erstelleErweiterungsSonderkarten,
} from './engine'
import type { AufgabenkarteInfo, GewinnerEintrag, SpielAktion, SpielerWertungsEintrag, Spielzustand } from './engine'
import AktionenPanel from './components/AktionenPanel'
import DebugGruppe from './components/DebugGruppe'
import Spielerfuehrung from './components/Spielerfuehrung'
import useAktionszielFokus from './hooks/useAktionszielFokus'
import Zugfortschritt from './components/Zugfortschritt'
import HandkartenPanel from './components/HandkartenPanel'
import Schlangenbereich from './components/Schlangenbereich'
function kartenIds(karten: { id: string }[]): string {
  return karten.map(k => k.id).join(', ')
}

function aufgabenPunkteAnzeige(a: AufgabenkarteInfo, istEndspurt: boolean): string {
  if (!istEndspurt) return `${a.punkte} Punkte`
  return `${a.punkte} Punkte ×2 = ${a.punkte * 2} Punkte`
}

function aufgabeLabel(a: AufgabenkarteInfo, istEndspurt: boolean): string {
  return `${a.name} (${aufgabenPunkteAnzeige(a, istEndspurt)}): ${a.bedingung}`
}

function erweiterungsSonderkartenLabel(): string {
  const gruppen = new Map<string, number>()
  for (const karte of erstelleErweiterungsSonderkarten()) {
    gruppen.set(karte.name, (gruppen.get(karte.name) ?? 0) + 1)
  }

  return Array.from(gruppen.entries())
    .map(([name, anzahl]) => `${anzahl} ${name}`)
    .join(', ')
}

function basisSonderkartenLabel(): string {
  const gruppen = new Map<string, number>()
  for (const karte of erstelleSonderkarten()) {
    gruppen.set(karte.name, (gruppen.get(karte.name) ?? 0) + 1)
  }

  return Array.from(gruppen.entries())
    .map(([name, anzahl]) => `${anzahl} ${name}`)
    .join(', ')
}

const BASIS_SONDERKARTEN_LABEL = basisSonderkartenLabel()
const ERWEITERUNGS_SONDERKARTEN_LABEL = erweiterungsSonderkartenLabel()

function aktionsLabel(aktion: SpielAktion): string {
  switch (aktion.typ) {
    case 'NeueSchlangeStarten':
      return `Neue Schlange starten mit Karte ${aktion.handkartenId}`
    case 'KarteAnlegen':
      return `Karte ${aktion.handkartenId} an Schlange ${aktion.schlangenId} ${aktion.position} anlegen`
    case 'SonderkarteSpielen':
      return `Schlangengrube mit Karte ${aktion.handkartenId} auf ${aktion.zielSpielerId.replace(/^spieler-/, 'Spieler ')} spielen`
    case 'VerdopplerSpielen':
      return `Verdoppler mit Karte ${aktion.handkartenId} spielen`
    case 'SchlangenblockadeSpielen':
      return `Schlangenblockade mit Karte ${aktion.handkartenId} auf ${aktion.zielSpielerId.replace(/^spieler-/, 'Spieler ')} / Schlange ${aktion.zielSchlangenId} spielen`
    case 'SchlangenblockadeAbwehren':
      return `Schlangenblockade mit Farbenschutzkarte ${aktion.abwehrHandkartenId} abwehren`
    case 'SchlangenblockadeDurchlassen':
      return 'Schlangenblockade durchlassen'
    case 'SchlangengrubeAbwehren':
      return `Schlangengrube mit Farbenschutzkarte ${aktion.abwehrHandkartenId} abwehren`
    case 'SchlangengrubeDurchlassen':
      return 'Schlangengrube durchlassen'
    case 'VerdopplerAbwehren':
      return `Verdoppler mit Farbenschutzkarte ${aktion.abwehrHandkartenId} abwehren`
    case 'VerdopplerDurchlassen':
      return 'Verdoppler durchlassen'
    case 'FarbenschutzSpielen':
      return `Farbenschutz mit Karte ${aktion.handkartenId} auf Schlange ${aktion.zielSchlangenId} spielen`
    case 'FarbendiebSpielen':
      return `Farbendieb mit Karte ${aktion.handkartenId} von ${aktion.zielSpielerId.replace(/^spieler-/, 'Spieler ')} / Schlange ${aktion.zielSchlangenId} Karte ${aktion.zielKartenId} auf Schlange ${aktion.eigeneSchlangenId} an Position ${aktion.einfügeIndex + 1} spielen`
    case 'FarbendiebAbwehren':
      return `Farbendieb mit Farbenschutzkarte ${aktion.abwehrHandkartenId} abwehren`
    case 'FarbendiebDurchlassen':
      return 'Farbendieb durchlassen'
    case 'SchlangenhaeutungSpielen':
      return `Schlangenhäutung mit Karte ${aktion.handkartenId} auf Schlange ${aktion.schlangenId} spielen`
    case 'SchlangenfrassAbwehren':
      return `Schlangenfrass mit Farbenschutzkarte ${aktion.abwehrHandkartenId} abwehren`
    case 'SchlangenfrassDurchlassen':
      return 'Schlangenfrass durchlassen'
    case 'PflichtAbwurf':
      return `Karte ${aktion.handkartenId} abwerfen`
    default:
      return 'Unbekannte Aktion'
  }
}

function ueberhandAnzahl(zustand: Spielzustand): number {
  return Math.max(0, zustand.spieler[zustand.aktiverSpielerIndex].hand.length - HANDKARTENLIMIT)
}

function ueberhandAbwurfKartenIds(zustand: Spielzustand): string[] {
  const anzahl = ueberhandAnzahl(zustand)
  if (anzahl === 0) return []
  return zustand.spieler[zustand.aktiverSpielerIndex].hand.slice(-anzahl).map(k => k.id)
}

function zugfuehrungLabel(steuerung: Spielzustand['spieler'][number]['steuerung']): string {
  switch (steuerung) {
    case 'Mensch':
      return 'Du bist am Zug.'
    case 'KI':
      return 'KI ist am Zug.'
  }
}

function naechsterPflichtschrittLabel(
  zustand: Spielzustand,
  legaleAktionen: SpielAktion[],
  nichtEnumerierteAktionenHinweise: unknown[],
  ueberhand: number,
): string {
  if (zustand.zugphase === 'Spielende') return 'Partie beendet.'
  if (zustand.pendingReaktion) return 'Reaktionsaktion auswählen.'
  if (zustand.zugphase === 'Zugabschluss' && ueberhand > 0) {
    return 'Überzählige Karten abwerfen.'
  }
  if (zustand.zugphase === 'Ausspielphase' && zustand.zugpflichten.gespielteKarten > 0) {
    return 'Ausspielphase beenden.'
  }
  if (zustand.zugphase === 'Aufgabenpruefung') return 'Aufgabenprüfung beenden.'
  if (zustand.zugphase === 'Zugabschluss') return 'Zug beenden.'
  if (zustand.zugphase === 'Nachziehphase') return 'Ausspielphase starten.'
  if (legaleAktionen.length > 0) return 'Eine legale Aktion auswählen.'
  if (nichtEnumerierteAktionenHinweise.length > 0) return 'Schlangenhäutung vorbereiten.'
  return 'Derzeit keine legale Aktion verfügbar. Prüfe Phasenregeln oder Zugabschluss.'
}

interface AppProps {
  initialZustand?: Spielzustand
}

function App({ initialZustand }: AppProps) {
  const [zustand, setZustand] = useState(() => initialZustand ?? starteAusspielphase(erstelleSpielzustand(2)))
  const [letzteAktion, setLetzteAktion] = useState<string | null>(null)
  const [hervorgehobenesAktionszielId, setHervorgehobenesAktionszielId] = useState<string | null>(null)
  const [ausgewaehlteHandkarteAuswahl, setAusgewaehlteHandkarteAuswahl] = useState<{ spielerId: string; karteId: string } | null>(null)
  const gezogeneHandkarteIdRef = useRef<string | null>(null)
  const legaleAktionen = useMemo(() => ermittleLegaleAktionen(zustand), [zustand])
  const nichtEnumerierteAktionenHinweise = useMemo(() => ermittleNichtEnumerierteAktionenHinweise(zustand), [zustand])
  const reaktionsAktionen = useMemo(() => ermittleReaktionsAktionen(zustand), [zustand])
  const karteAnlegenAktionen = useMemo(
    () => legaleAktionen.filter(
      (aktion): aktion is Extract<SpielAktion, { typ: 'KarteAnlegen' }> => aktion.typ === 'KarteAnlegen',
    ),
    [legaleAktionen],
  )
  const neueSchlangeStartenAktionen = useMemo(
    () => legaleAktionen.filter(
      (aktion): aktion is Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }> => aktion.typ === 'NeueSchlangeStarten',
    ),
    [legaleAktionen],
  )
  const gesamtwertung = useMemo(() => berechneSpielzustandGesamtwertung(zustand), [zustand])
  const gewinnerErgebnis = useMemo(
    () => zustand.zugphase === 'Spielende' ? berechneGewinner(zustand.spieler) : null,
    [zustand.zugphase, zustand.spieler],
  )
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex]
  const gegnerSpieler = zustand.spieler.filter((spieler) => spieler.id !== aktiverSpieler.id)
  const ausgewaehlteHandkarte = ausgewaehlteHandkarteAuswahl?.spielerId === aktiverSpieler.id
    ? aktiverSpieler.hand.find((karte) => karte.id === ausgewaehlteHandkarteAuswahl.karteId) ?? null
    : null
  const spielerwertungen: SpielerWertungsEintrag[] = gesamtwertung.spielerwertungen
  const gewinnerListe: GewinnerEintrag[] = gewinnerErgebnis?.gewinner ?? []
  const aktiverSpielerWertung = useMemo(
    () => spielerwertungen.find((eintrag: SpielerWertungsEintrag) => eintrag.spielerId === aktiverSpieler.id) ?? null,
    [spielerwertungen, aktiverSpieler.id],
  )
  const istSpielende = zustand.zugphase === 'Spielende'
  const ueberhand = ueberhandAnzahl(zustand)
  const istEndspurt = zustand.spielphase === 'Endspurt'
  const gewinnerText = gewinnerListe.length > 0
    ? gewinnerListe.map(g => `${g.spielerId} (${g.gesamtPunkte} Punkte)`).join(', ')
    : 'keine'
  const ergebnisText = gewinnerListe.length > 1
    ? 'Gleichstand'
    : `Sieg für ${gewinnerListe[0]?.spielerId ?? 'unbekannt'}`
  const empfohleneAktionId = useId()
  const phasenaktionId = useId()
  const heroTitelId = useId()
  const spieltischTitelId = useId()
  const pflichtschrittLabel = naechsterPflichtschrittLabel(zustand, legaleAktionen, nichtEnumerierteAktionenHinweise, ueberhand)
  const empfohleneAktionLabel = legaleAktionen.length > 0 ? aktionsLabel(legaleAktionen[0]) : ''
  const hatSichtbarePhasenaktion = (zustand.zugphase === 'Ausspielphase' && zustand.zugpflichten.gespielteKarten > 0) || zustand.zugphase === 'Aufgabenpruefung' || zustand.zugphase === 'Zugabschluss' || zustand.zugphase === 'Nachziehphase'
  const spielerfuehrungAktionszielId = hatSichtbarePhasenaktion ? phasenaktionId : empfohleneAktionId
  const spielerfuehrungAktionszielSatzText = hatSichtbarePhasenaktion ? 'Phasenaktion' : 'empfohlene Aktion'
  const spielerfuehrungAktionszielLinkText = hatSichtbarePhasenaktion ? 'Phasenaktion' : 'empfohlenen Aktion'
  const zeigtSpielerfuehrungAktionslink = legaleAktionen.length > 0 || hatSichtbarePhasenaktion

  useAktionszielFokus(hervorgehobenesAktionszielId)

  function wechsleZustand(label: string, updater: (z: Spielzustand) => Spielzustand) {
    setLetzteAktion(label)
    setHervorgehobenesAktionszielId(null)
    setAusgewaehlteHandkarteAuswahl(null)
    setZustand(updater)
  }

  function fuhreAktionAus(aktion: SpielAktion) { wechsleZustand(aktionsLabel(aktion), z => anwendeAktion(z, aktion)) }
  function handleAusspielphaseBeenden() { wechsleZustand('Ausspielphase beenden', z => beendeAusspielphase(z)) }
  function handleAufgabenpruefungBeenden() { wechsleZustand('Aufgabenprüfung beenden', z => beendeAufgabenpruefung(z, { aufgabenGeprueft: true })) }
  function handleUeberzaehligeKartenAbwerfen() { wechsleZustand('Überzählige Karten abwerfen', z => werfeUeberzaehligeHandkartenAb(z, { kartenIds: ueberhandAbwurfKartenIds(z) })) }
  function handleZugBeenden() { wechsleZustand('Zug beenden', z => beendeZug(z, { pflichtenErfuellt: true })) }
  function handleAusspielphaseStarten() { wechsleZustand('Ausspielphase starten', z => starteAusspielphase(z)) }

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby={heroTitelId}>
        <p className="eyebrow">Das Kartenspiel</p>
        <h1 id={heroTitelId}>Schlangentanz</h1>
        <p>Bereit für deine nächste Schlange</p>
        <ul>
          <li>Baue farbige Schlangen</li>
          <li>Erfülle Aufgaben</li>
          <li>Nutze Sonderkarten</li>
        </ul>
      </section>
      <section className="spielbereich" aria-label="Legale Aktionen">
        <section className="info-panel" aria-label="Spielstatus">
          <h2>Spielstatus</h2>
          {/* ÄNDERUNG 08.06.2026: R120 benennt Entwicklungsdaten-Summaries nach Spielbereichen statt Statusdetails. */}
          <DebugGruppe titel="Spielphase">
            <p>Aktueller Spielschritt: {zustand.zugphase}</p>
            <p>Zugphase: {zustand.zugphase}</p>
            <p>Spielphase: {zustand.spielphase}</p>
            {istSpielende && <p>Spielende erreicht.</p>}
            {zustand.spielphase === 'Endspurt' && zustand.endrunde.ausloeserSpielerIndex !== null && (
              <>
                <p>Endrunde aktiv: ja</p>
                <p>Endrunde ausgelöst durch: {zustand.spieler[zustand.endrunde.ausloeserSpielerIndex].id}</p>
              </>
            )}
            {zustand.spielphase !== 'Normal' && (
              <p>
                Verbleibende Endrunde:{' '}
                {zustand.endrunde.verbleibendeSpielerIndizes.length > 0
                  ? zustand.endrunde.verbleibendeSpielerIndizes.map(i => zustand.spieler[i].id).join(', ')
                  : 'keine'}
              </p>
            )}
            {istEndspurt && (
              <>
                <p>Nachziehen in der Endrunde: aus</p>
                <p>Verbleibende Züge ohne Nachziehen: {zustand.endrunde.verbleibendeSpielerIndizes.length}</p>
              </>
            )}
            <p>Spieler am Zug: {zustand.aktiverSpielerIndex + 1}/{zustand.spieler.length}</p>
          </DebugGruppe>
          <Zugfortschritt zugphase={zustand.zugphase} />
        </section>
        <div className="spieltisch-gruppe">
          <section className="info-panel" aria-label="Aktiver Spieler" aria-live="polite">
            <h2>Aktiver Spieler</h2>
            <section className="spielbrett" aria-labelledby={spieltischTitelId}>
              <h3 id={spieltischTitelId}>Spieltisch</h3>
              <HandkartenPanel
                handkarten={aktiverSpieler.hand}
                ausgewaehlteHandkarte={ausgewaehlteHandkarte}
                onKarteWaehlen={(karteId) =>
                  setAusgewaehlteHandkarteAuswahl((aktuell) =>
                    aktuell?.spielerId === aktiverSpieler.id && aktuell.karteId === karteId ? null : { spielerId: aktiverSpieler.id, karteId },
                  )
                }
                onKarteDragStart={(karteId) => {
                  gezogeneHandkarteIdRef.current = karteId
                }}
                onKarteDragEnd={() => {
                  gezogeneHandkarteIdRef.current = null
                }}
              />
              <Schlangenbereich
                aktiverSpieler={aktiverSpieler}
                gegnerSpieler={gegnerSpieler}
                karteAnlegenAktionen={karteAnlegenAktionen}
                neueSchlangeStartenAktionen={neueSchlangeStartenAktionen}
                gezogeneHandkarteIdRef={gezogeneHandkarteIdRef}
                ausgewaehlteHandkarteId={ausgewaehlteHandkarte?.id ?? null}
                onAktion={fuhreAktionAus}
                aktionsLabel={aktionsLabel}
              />
            </section>
            <AktionenPanel
              zustand={zustand}
              legaleAktionen={legaleAktionen}
              nichtEnumerierteAktionenHinweise={nichtEnumerierteAktionenHinweise}
              reaktionsAktionen={reaktionsAktionen}
              ueberhand={ueberhand}
              istSpielende={istSpielende}
              steuerung={aktiverSpieler.steuerung}
              aktionsLabel={aktionsLabel}
              pflichtschrittLabel={pflichtschrittLabel}
              hervorgehobenesAktionszielId={hervorgehobenesAktionszielId}
              empfohleneAktionId={empfohleneAktionId}
              phasenaktionId={phasenaktionId}
              onAktionAusfuehren={fuhreAktionAus}
              onAusspielphaseBeenden={handleAusspielphaseBeenden}
              onAufgabenpruefungBeenden={handleAufgabenpruefungBeenden}
              onUeberzaehligeKartenAbwerfen={handleUeberzaehligeKartenAbwerfen}
              onZugBeenden={handleZugBeenden}
              onAusspielphaseStarten={handleAusspielphaseStarten}
            />
            <DebugGruppe titel="Aktiver Spieler">
              <p>Aktiver Spieler: {aktiverSpieler.id}</p>
              <p>Spielerprofil: {aktiverSpieler.id} — {aktiverSpieler.name} ({aktiverSpieler.steuerung})</p>
              <p>Zugführung: {zugfuehrungLabel(aktiverSpieler.steuerung)}</p>
              <p>
                Aktuelle Wertung:{' '}
                {aktiverSpielerWertung ? `${aktiverSpielerWertung.gesamtPunkte} Punkte` : 'keine'}
              </p>
              {ueberhand > 0 && <p>Überzählige Karten: {ueberhand} über dem Limit von {HANDKARTENLIMIT}.</p>}
              {letzteAktion && <p>Zuletzt ausgeführt: {letzteAktion}</p>}
              {istSpielende && (
                <>
                  <p>Spielende erreicht.</p>
                  <p>Gewinner: {gewinnerText}</p>
                </>
              )}
              {!istSpielende && legaleAktionen.length > 0 && <p>Nächste legale Aktion: {empfohleneAktionLabel}</p>}
              {reaktionsAktionen.length > 0 && <p>Nächste Reaktionsaktion: {aktionsLabel(reaktionsAktionen[0])}</p>}
              <p>Nächster Pflichtschritt: {pflichtschrittLabel}</p>
              <p>
                {aktiverSpieler.geheimeAufgabe
                  ? `Geheime Aufgabe: ${aufgabeLabel(aktiverSpieler.geheimeAufgabe, false)}`
                  : 'Geheime Aufgabe: keine'}
              </p>
            </DebugGruppe>
            {!istSpielende && aktiverSpieler.steuerung === 'Mensch' && (
              <Spielerfuehrung
                pflichtschrittLabel={pflichtschrittLabel}
                empfohleneAktionLabel={empfohleneAktionLabel}
                aktionszielId={spielerfuehrungAktionszielId}
                aktionszielSatzText={spielerfuehrungAktionszielSatzText}
                aktionszielLinkText={spielerfuehrungAktionszielLinkText}
                onAktionszielHervorheben={setHervorgehobenesAktionszielId}
                zeigtAktionslink={zeigtSpielerfuehrungAktionslink}
              />
            )}
          </section>
        </div>
        <section className="info-panel" aria-label="Spielerübersicht">
          <h2>Spielerübersicht</h2>
          <DebugGruppe titel="Spielerstatus">
            {zustand.spieler.map(spieler => {
              const istAktiv = spieler.id === aktiverSpieler.id

              return (
                <p key={spieler.id} aria-current={istAktiv ? 'true' : undefined}>
                  Spieler {spieler.id}: {spieler.name} ({spieler.steuerung}) — {spieler.hand.length} Handkarten, {spieler.schlangen.length} Schlangen{istAktiv ? ' — am Zug' : ''}
                </p>
              )
            })}
            {zustand.spieler.map(spieler => (
              <p key={`schlangen-${spieler.id}`}>
                Schlangen von {spieler.id}:{' '}
                {spieler.schlangen.length === 0
                  ? 'keine'
                  : spieler.schlangen.map(s => `${s.id} (${kartenIds(s.karten)})`).join('; ')}
              </p>
            ))}
            {zustand.spieler.flatMap(spieler =>
              spieler.schlangen.map(schlange => (
                <p key={`zustand-${spieler.id}-${schlange.id}`}>
                  Status von Schlange {spieler.id}/{schlange.id}: {schlange.zustand}
                </p>
              ))
            )}
            {zustand.spieler.map(spieler => (
              <p key={`aufgaben-${spieler.id}`}>
                Erfüllte Aufgaben {spieler.id}:{' '}
                {spieler.erfuellteAufgaben.length === 0
                  ? 'keine'
                  : `SchlangenSpass! ${spieler.erfuellteAufgaben.map(a => `${a.name} (${a.punkte} Punkte)`).join(', ')}`}
              </p>
            ))}
            <p>Schlangen insgesamt: {zustand.spieler.reduce((sum, s) => sum + s.schlangen.length, 0)}</p>
            <p>Handkarten insgesamt: {zustand.spieler.reduce((sum, s) => sum + s.hand.length, 0)}</p>
          </DebugGruppe>
        </section>
        <section className="info-panel" aria-label="Material und Aufgaben">
          <h2>Material und Aufgaben</h2>
          <DebugGruppe titel="Karten und Aufgaben">
            <p>Karten im Ablagestapel: {zustand.ablagestapel.length} Karten</p>
            <p>Karten auf dem Ablagestapel: {zustand.ablagestapel.length > 0 ? kartenIds(zustand.ablagestapel) : 'keine'}</p>
            <p>Karten im Nachziehstapel: {zustand.nachziehstapel.length} Karten</p>
            <p>Spielmaterial insgesamt: {zustand.nachziehstapel.length + zustand.ablagestapel.length} Karten</p>
            <p>Basis-Sonderkarten: {BASIS_SONDERKARTEN_LABEL}</p>
            <p>Erweiterungs-Sonderkarten: {ERWEITERUNGS_SONDERKARTEN_LABEL}</p>
            <p>Aufgaben im Stapel: {zustand.aufgabenStapel.length} Karten</p>
            <p>
              Aktuelle Aufgaben:{' '}
              {zustand.offeneAufgaben.length > 0
                ? zustand.offeneAufgaben.map(a => `${a.name} (${aufgabenPunkteAnzeige(a, istEndspurt)})`).join(', ')
                : 'keine'}
            </p>
            <p>
              Aufgabenziele:{' '}
              {zustand.offeneAufgaben.length > 0
                ? zustand.offeneAufgaben.map(a => aufgabeLabel(a, istEndspurt)).join('; ')
                : 'keine'}
            </p>
          </DebugGruppe>
          <section className="aufgabenkarten-bereich" aria-label="Aufgabenkarten">
            <h3>Aufgabenkarten</h3>
            {zustand.offeneAufgaben.length === 0 ? (
              <p>Keine offenen Aufgabenkarten.</p>
            ) : (
              <ul className="aufgabenkarten-liste">
                {zustand.offeneAufgaben.map(a => (
                  <li key={a.id} className="aufgabenkarte">
                    <strong>{a.name}</strong>
                    <span>{aufgabenPunkteAnzeige(a, istEndspurt)}</span>
                    <span>{a.bedingung}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
        <section className="info-panel" aria-label="Wertung">
          <h2>Wertung</h2>
          {istSpielende && (
            <>
              <p>Spielende erreicht.</p>
              <p>Ergebnis: {ergebnisText}</p>
            </>
          )}
          <DebugGruppe titel="Punkteübersicht">
            {gesamtwertung.spielerwertungen.map(eintrag => (
              <Fragment key={eintrag.spielerId}>
                <p>Wertung {eintrag.spielerId}: {eintrag.gesamtPunkte} Punkte</p>
                <p>
                  Punkteaufteilung {eintrag.spielerId}: Farbgruppen {eintrag.wertung.farbgruppenPunkte.gesamtPunkte} Punkte, Aufgaben {eintrag.wertung.aufgabenPunkte.gesamtPunkte} Punkte
                </p>
              </Fragment>
            ))}
          </DebugGruppe>
          <section className="scoreboard-bereich" aria-label="Scoreboard">
            <h3>Scoreboard</h3>
            <ul className="scoreboard-liste">
              {spielerwertungen.map(eintrag => {
                const spieler = zustand.spieler.find(s => s.id === eintrag.spielerId)

                return (
                  <li key={eintrag.spielerId} className="scoreboard-karte">
                    <strong>{spieler ? `${spieler.name} (${spieler.id})` : eintrag.spielerId}</strong>
                    <span>Gesamt: {eintrag.gesamtPunkte} Punkte</span>
                    <span>Farbgruppen: {eintrag.wertung.farbgruppenPunkte.gesamtPunkte} Punkte</span>
                    <span>Aufgaben: {eintrag.wertung.aufgabenPunkte.gesamtPunkte} Punkte</span>
                  </li>
                )
              })}
            </ul>
          </section>
          {gewinnerErgebnis && gewinnerErgebnis.gewinner.map(g => (
            <p key={g.spielerId}>Gewinner {g.spielerId}: {g.gesamtPunkte} Punkte</p>
          ))}
        </section>
      </section>
    </main>
  )
}

export default App
