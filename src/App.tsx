import { useId, useMemo, useRef, useState } from 'react'
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
  ermittleQuestZugHinweise,
} from './engine'
import type { AufgabenkarteInfo, GewinnerEintrag, SchlangenZustand, SpielAktion, SpielerWertungsEintrag, Spielzustand } from './engine'
import AktionenPanel from './components/AktionenPanel'
import DebugGruppe from './components/DebugGruppe'
import Spielerfuehrung from './components/Spielerfuehrung'
import useAktionszielFokus from './hooks/useAktionszielFokus'
import HandkartenPanel from './components/HandkartenPanel'
import Schlangenbereich from './components/Schlangenbereich'
import SonnigesNestLobby from './components/SonnigesNestLobby'
import SiegerParty from './components/SiegerParty'
import KiZugBuehne from './components/KiZugBuehne'
import SpielstatusPanel from './components/SpielstatusPanel'
import Zugpfad from './components/Zugpfad'
import ZugKompass from './components/ZugKompass'
import Partiefortschritt from './components/Partiefortschritt'
import WaldtanzSpielerrahmen from './components/WaldtanzSpielerrahmen'
import WaldtanzSeitenmenue from './components/WaldtanzSeitenmenue'
import WaldtanzAblage from './components/WaldtanzAblage'
import WaldtanzZugspur from './components/WaldtanzZugspur'
import WaldtanzAufgabentafel from './components/WaldtanzAufgabentafel'
import WaldtanzKartenpop from './components/WaldtanzKartenpop'
import WaldtanzBonuszauber from './components/WaldtanzBonuszauber'
import WaldtanzTischkarte from './components/WaldtanzTischkarte'
import WaldtanzMagiekreise from './components/WaldtanzMagiekreise'
import WertungPanel from './components/WertungPanel'
import type { KiGegnerAnzahl } from './components/SonnigesNestLobby'
import { aktionsLabel } from './aktionsLabel'
import { spieleKiZuegeBisZumMenschen } from './kiZug'
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
  if (legaleAktionen.length > 0) return 'Eine spielbare Aktion auswählen.'
  if (nichtEnumerierteAktionenHinweise.length > 0) return 'Schlangenhäutung vorbereiten.'
  return 'Derzeit keine spielbare Aktion verfügbar. Prüfe Phasenregeln oder Zugabschluss.'
}

function schlangenZustandLabel(zustand: SchlangenZustand): string {
  if (zustand === 'aktiv') return 'spielbereit'
  if (zustand === 'blockiert') return 'gerade blockiert'
  return 'geschützt'
}

interface AppProps {
  initialZustand?: Spielzustand
}

function App({ initialZustand }: AppProps) {
  const istGameRoute = typeof window !== 'undefined' && (window.location.pathname === '/game' || window.location.pathname.startsWith('/game/'))
  const [zustand, setZustand] = useState(() => initialZustand ?? starteAusspielphase(erstelleSpielzustand(2)))
  const [letzteAktion, setLetzteAktion] = useState<string | null>(null)
  const [hervorgehobenesAktionszielId, setHervorgehobenesAktionszielId] = useState<string | null>(null)
  const [ausgewaehlteHandkarteAuswahl, setAusgewaehlteHandkarteAuswahl] = useState<{ spielerId: string; karteId: string } | null>(null)
  const [kiZugProtokoll, setKiZugProtokoll] = useState<string[]>([])
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
  const farbenschutzAktionen = useMemo(
    () => legaleAktionen.filter(
      (aktion): aktion is Extract<SpielAktion, { typ: 'FarbenschutzSpielen' }> => aktion.typ === 'FarbenschutzSpielen',
    ),
    [legaleAktionen],
  )
  const farbenfusionAktionen = useMemo(
    () => legaleAktionen.filter(
      (aktion): aktion is Extract<SpielAktion, { typ: 'FarbenfusionSpielen' }> => aktion.typ === 'FarbenfusionSpielen',
    ),
    [legaleAktionen],
  )
  const schlangenfrassAktionen = useMemo(
    () => legaleAktionen.filter(
      (aktion): aktion is Extract<SpielAktion, { typ: 'SchlangenfrassSpielen' }> => aktion.typ === 'SchlangenfrassSpielen',
    ),
    [legaleAktionen],
  )
  const schlangenblockadeAktionen = useMemo(
    () => legaleAktionen.filter(
      (aktion): aktion is Extract<SpielAktion, { typ: 'SchlangenblockadeSpielen' }> => aktion.typ === 'SchlangenblockadeSpielen',
    ),
    [legaleAktionen],
  )
  const farbendiebAktionen = useMemo(
    () => legaleAktionen.filter(
      (aktion): aktion is Extract<SpielAktion, { typ: 'FarbendiebSpielen' }> => aktion.typ === 'FarbendiebSpielen',
    ),
    [legaleAktionen],
  )
  const verdopplerAktionen = useMemo(() => legaleAktionen.filter((aktion): aktion is Extract<SpielAktion, { typ: 'VerdopplerSpielen' }> => aktion.typ === 'VerdopplerSpielen'), [legaleAktionen])
  const schlangengrubeAktionen = useMemo(() => legaleAktionen.filter((aktion): aktion is Extract<SpielAktion, { typ: 'SonderkarteSpielen' }> => aktion.typ === 'SonderkarteSpielen'), [legaleAktionen])
  const questZugHinweise = useMemo(() => ermittleQuestZugHinweise(zustand, legaleAktionen), [zustand, legaleAktionen])
  const gesamtwertung = useMemo(() => berechneSpielzustandGesamtwertung(zustand), [zustand])
  const gewinnerErgebnis = useMemo(() => zustand.zugphase === 'Spielende' ? berechneGewinner(zustand.spieler) : null, [zustand.zugphase, zustand.spieler])
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex]
  const gegnerSpieler = zustand.spieler.filter((spieler) => spieler.id !== aktiverSpieler.id)
  const versteckeKiEinzelaktionen = aktiverSpieler.steuerung === 'KI' && reaktionsAktionen.length === 0
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
  const spielerNameFuerId = (spielerId: string) => zustand.spieler.find(spieler => spieler.id === spielerId)?.name ?? spielerId
  const gewinnerText = gewinnerListe.length > 0
    ? gewinnerListe.map(g => `${spielerNameFuerId(g.spielerId)} (${g.gesamtPunkte} Punkte)`).join(', ')
    : 'keine'
  const ergebnisText = gewinnerListe.length > 1
    ? 'Gleichstand'
    : `Sieg für ${gewinnerListe[0] ? spielerNameFuerId(gewinnerListe[0].spielerId) : 'unbekannt'}`
  const empfohleneAktionId = useId(), phasenaktionId = useId(), heroTitelId = useId(), spielstatusTitelId = useId(), aktiverSpielerTitelId = useId(), spieltischTitelId = useId()
  const spieleruebersichtTitelId = useId(), materialUndAufgabenTitelId = useId(), aufgabenkartenTitelId = useId()
  const pflichtschrittLabel = naechsterPflichtschrittLabel(zustand, legaleAktionen, nichtEnumerierteAktionenHinweise, ueberhand)
  const empfohleneAktionLabel = legaleAktionen.length > 0 ? aktionsLabel(legaleAktionen[0]) : ''
  const hatSichtbarePhasenaktion = reaktionsAktionen.length === 0 && ((zustand.zugphase === 'Ausspielphase' && zustand.zugpflichten.gespielteKarten > 0) || zustand.zugphase === 'Aufgabenpruefung' || zustand.zugphase === 'Zugabschluss' || zustand.zugphase === 'Nachziehphase')
  const spielerfuehrungAktionszielId = hatSichtbarePhasenaktion ? phasenaktionId : empfohleneAktionId
  const spielerfuehrungAktionszielSatzText = hatSichtbarePhasenaktion ? 'Phasenaktion' : 'empfohlene Aktion'
  const spielerfuehrungAktionszielLinkText = hatSichtbarePhasenaktion ? 'Phasenaktion' : 'empfohlenen Aktion'
  const zeigtSpielerfuehrungAktionslink = legaleAktionen.length > 0 || hatSichtbarePhasenaktion

  useAktionszielFokus(hervorgehobenesAktionszielId)

  function wechsleZustand(label: string, updater: (z: Spielzustand) => Spielzustand) {
    setLetzteAktion(label)
    setKiZugProtokoll([])
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
  function handleKiZugVorspulen() {
    const ergebnis = spieleKiZuegeBisZumMenschen(zustand)
    setLetzteAktion('Gegnerzüge vorgespult')
    setKiZugProtokoll(ergebnis.protokoll)
    setHervorgehobenesAktionszielId(null)
    setAusgewaehlteHandkarteAuswahl(null)
    gezogeneHandkarteIdRef.current = null
    setZustand(ergebnis.zustand)
  }
  function handleNeuesLobbySpiel(kiGegner: KiGegnerAnzahl) {
    setLetzteAktion(`Neues Spiel: Du + ${kiGegner} KI`)
    setKiZugProtokoll([])
    setHervorgehobenesAktionszielId(null)
    setAusgewaehlteHandkarteAuswahl(null)
    gezogeneHandkarteIdRef.current = null
    setZustand(starteAusspielphase(erstelleSpielzustand(kiGegner + 1)))
  }

  return (
    <main className={`app-shell${istGameRoute ? ' app-shell--game' : ''}`}>
      {!istGameRoute && (
        <>
          <section className="hero" aria-labelledby={heroTitelId}>
            <p className="eyebrow">Das Kartenspiel</p>
            <h1 className="app-title" id={heroTitelId}>Schlangentanz</h1>
            <p>Bereit für deine nächste Schlange</p>
            <ul><li>Baue farbige Schlangen</li><li>Erfülle Aufgaben</li><li>Nutze Sonderkarten</li></ul>
          </section>
          <SonnigesNestLobby aktiveKiGegner={zustand.spieler.filter(spieler => spieler.steuerung === 'KI').length} onNeuesSpiel={handleNeuesLobbySpiel} />
        </>
      )}
      <section id="spielbereich" className={`spielbereich spielbereich--waldtanz${istGameRoute ? ' spielbereich--game-route' : ''}${istSpielende ? ' spielbereich--mit-sieger-party' : ''}`} aria-label="Spielbereich">
        <SiegerParty zustand={zustand} onNeuesSpiel={handleNeuesLobbySpiel} />
        <WaldtanzSeitenmenue spielerName={aktiverSpieler.name} punkte={aktiverSpielerWertung?.gesamtPunkte ?? 0} zugphase={zustand.zugphase} handkarten={aktiverSpieler.hand.length} eigeneSchlangen={aktiverSpieler.schlangen.length} nachziehstapel={zustand.nachziehstapel.length} offeneAufgaben={zustand.offeneAufgaben.length} pflichtschritt={pflichtschrittLabel} />
        <SpielstatusPanel zustand={zustand} titelId={spielstatusTitelId} istSpielende={istSpielende} istEndspurt={istEndspurt} />
        <div className="spieltisch-gruppe">
          <section className="info-panel info-panel--waldtanz-arena" aria-labelledby={aktiverSpielerTitelId} aria-live="polite" aria-atomic="true">
            <h2 id={aktiverSpielerTitelId}>Aktiver Spieler</h2>
            <section className="spielbrett spielbrett--waldtanz" aria-labelledby={spieltischTitelId} aria-live="polite" aria-atomic="true">
              <h3 id={spieltischTitelId}>Spieltisch</h3>
              <WaldtanzSpielerrahmen zustand={zustand} spielerwertungen={spielerwertungen} kiZugProtokoll={kiZugProtokoll} schlangengrubeAktionen={versteckeKiEinzelaktionen ? [] : schlangengrubeAktionen} ausgewaehlteHandkarteId={ausgewaehlteHandkarte?.id ?? null} onAktion={fuhreAktionAus} />
              <aside className="waldtanz-zugseitenleiste" aria-label="Zugleiste">
                <Zugpfad zustand={zustand} kiZugProtokoll={kiZugProtokoll} />
                <KiZugBuehne spielerName={aktiverSpieler.name} steuerung={aktiverSpieler.steuerung} protokoll={kiZugProtokoll} onKiZugVorspulen={handleKiZugVorspulen} />
                <ZugKompass
                  zustand={zustand}
                  ueberhand={ueberhand}
                  zeigtKiVorspulen={versteckeKiEinzelaktionen}
                  kiZugProtokoll={kiZugProtokoll}
                  onAusspielphaseBeenden={handleAusspielphaseBeenden}
                  onAufgabenpruefungBeenden={handleAufgabenpruefungBeenden}
                  onUeberzaehligeKartenAbwerfen={handleUeberzaehligeKartenAbwerfen}
                  onZugBeenden={handleZugBeenden}
                  onAusspielphaseStarten={handleAusspielphaseStarten}
                  onKiZugVorspulen={handleKiZugVorspulen}
                  onReaktionsAktion={fuhreAktionAus}
                />
                <Partiefortschritt zustand={zustand} spielerwertungen={spielerwertungen} />
                <WaldtanzBonuszauber aktionen={versteckeKiEinzelaktionen ? [] : verdopplerAktionen} ausgewaehlteHandkarteId={ausgewaehlteHandkarte?.id ?? null} onAktion={fuhreAktionAus} />
              </aside>
              <section className="waldtanz-arenastein" aria-label="Waldtanz-Arenastein">
                <div className="waldtanz-arenastein__kopf">
                  <h4>Leuchtender Waldstein</h4>
                  <p>Magische Zielkreise leuchten im Brett.</p>
                </div>
                <div className="waldtanz-arenastein__spielfeld">
                  <section className="waldtanz-arenastein__schlangenlichtung" aria-label="Schlangenlichtung">
                    <WaldtanzTischkarte zustand={zustand} />
                    <WaldtanzKartenpop aktionLabel={letzteAktion} />
                    <WaldtanzMagiekreise
                      ausgewaehlteHandkarteId={ausgewaehlteHandkarte?.id ?? null}
                      neueSchlangeStartenAktionen={versteckeKiEinzelaktionen ? [] : neueSchlangeStartenAktionen}
                      karteAnlegenAktionen={versteckeKiEinzelaktionen ? [] : karteAnlegenAktionen}
                      sonderzauberAktionen={versteckeKiEinzelaktionen ? [] : [...farbenschutzAktionen, ...farbenfusionAktionen, ...farbendiebAktionen, ...schlangenfrassAktionen, ...schlangenblockadeAktionen, ...schlangengrubeAktionen]}
                      aktionsLabel={aktionsLabel}
                      onAktion={fuhreAktionAus}
                    />
                    <Schlangenbereich
                      zustand={zustand} zeigeSchlangenhaeutungBrettziel={!versteckeKiEinzelaktionen}
                      aktiverSpieler={aktiverSpieler}
                      gegnerSpieler={gegnerSpieler}
                      karteAnlegenAktionen={versteckeKiEinzelaktionen ? [] : karteAnlegenAktionen}
                      neueSchlangeStartenAktionen={versteckeKiEinzelaktionen ? [] : neueSchlangeStartenAktionen}
                      farbenschutzAktionen={versteckeKiEinzelaktionen ? [] : farbenschutzAktionen}
                      farbenfusionAktionen={versteckeKiEinzelaktionen ? [] : farbenfusionAktionen}
                      schlangenfrassAktionen={versteckeKiEinzelaktionen ? [] : schlangenfrassAktionen}
                      schlangenblockadeAktionen={versteckeKiEinzelaktionen ? [] : schlangenblockadeAktionen}
                      farbendiebAktionen={versteckeKiEinzelaktionen ? [] : farbendiebAktionen}
                      gezogeneHandkarteIdRef={gezogeneHandkarteIdRef}
                      ausgewaehlteHandkarteId={ausgewaehlteHandkarte?.id ?? null}
                      onAktion={fuhreAktionAus} aktionsLabel={aktionsLabel}
                    />
                  </section>
                  <aside className="waldtanz-arenastein__waldobjekte" aria-label="Waldobjekte">
                    <WaldtanzAblage zustand={zustand} />
                    <WaldtanzZugspur zustand={zustand} letzteAktion={letzteAktion} pflichtschrittLabel={pflichtschrittLabel} />
                    <WaldtanzAufgabentafel zustand={zustand} istEndspurt={istEndspurt} onAufgabenpruefungBeenden={handleAufgabenpruefungBeenden} />
                  </aside>
                </div>
              </section>
              <HandkartenPanel
                handkarten={aktiverSpieler.hand}
                ausgewaehlteHandkarte={ausgewaehlteHandkarte}
                legaleAktionen={legaleAktionen}
                questHinweise={questZugHinweise}
                onKarteWaehlen={(karteId) =>
                  setAusgewaehlteHandkarteAuswahl((aktuell) =>
                    aktuell?.spielerId === aktiverSpieler.id && aktuell.karteId === karteId ? null : { spielerId: aktiverSpieler.id, karteId },
                  )
                }
                onKarteDragStart={(karteId) => { gezogeneHandkarteIdRef.current = karteId; setAusgewaehlteHandkarteAuswahl({ spielerId: aktiverSpieler.id, karteId }) }}
                onKarteDragEnd={() => { gezogeneHandkarteIdRef.current = null; setAusgewaehlteHandkarteAuswahl(null) }}
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
              onKiZugVorspulen={handleKiZugVorspulen}
              kompakterBrettFallback={istGameRoute}
            />
            <DebugGruppe titel="Aktiver Spieler">
              <p>Aktiver Spieler: {aktiverSpieler.name}</p>
              <p>Spielerprofil: {aktiverSpieler.name} — {zugfuehrungLabel(aktiverSpieler.steuerung)}</p>
              <p>Zugführung: {zugfuehrungLabel(aktiverSpieler.steuerung)}</p>
              {/* ÄNDERUNG 08.06.2026: R125 benennt die aktive Spielerwertung als spielerfreundlichen Punktestand. */}
              <p>Aktueller Punktestand: {aktiverSpielerWertung ? `${aktiverSpielerWertung.gesamtPunkte} Punkte` : 'keine'}</p>
              {ueberhand > 0 && <p>Überzählige Karten: {ueberhand} über dem Limit von {HANDKARTENLIMIT}.</p>}
              {letzteAktion && <p>Zuletzt ausgeführt: {letzteAktion}</p>}
              {istSpielende && (
                <>
                  <p>Spielende erreicht.</p>
                  <p>Gewinner: {gewinnerText}</p>
                </>
              )}
              {!istSpielende && legaleAktionen.length > 0 && <p>Empfohlene Aktion: {empfohleneAktionLabel}</p>}
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
        <section className="info-panel info-panel--spieleruebersicht waldtanz-hud waldtanz-hud--spieler" aria-labelledby={spieleruebersichtTitelId} aria-live="polite" aria-atomic="true">
          <h2 id={spieleruebersichtTitelId}>Spielerübersicht</h2>
          <DebugGruppe titel="Spielerstatus">
            {zustand.spieler.map(spieler => {
              const istAktiv = spieler.id === aktiverSpieler.id

              return (
                <p key={spieler.id} aria-current={istAktiv ? 'true' : undefined}>
                  {spieler.name}: {spieler.hand.length} Handkarten, {spieler.schlangen.length} {spieler.schlangen.length === 1 ? 'Schlange' : 'Schlangen'}{istAktiv ? ' — am Zug' : ''}
                </p>
              )
            })}
            {zustand.spieler.flatMap(spieler =>
              spieler.schlangen.map((schlange, index) => (
                <p key={`zustand-${spieler.id}-${schlange.id}`}>
                  Schlange {index + 1} von {spieler.name}: {schlangenZustandLabel(schlange.zustand)}.
                </p>
              ))
            )}
            {zustand.spieler.map(spieler => (
              <p key={`aufgaben-${spieler.id}`}>
                {spieler.name} — erfüllte Aufgaben:{' '}
                {spieler.erfuellteAufgaben.length === 0
                  ? 'keine'
                  : spieler.erfuellteAufgaben.map(a => `${a.name} (${a.punkte} Punkte)`).join(', ')}
              </p>
            ))}
            <p>Schlangen insgesamt: {zustand.spieler.reduce((sum, s) => sum + s.schlangen.length, 0)}</p>
            <p>Handkarten insgesamt: {zustand.spieler.reduce((sum, s) => sum + s.hand.length, 0)}</p>
          </DebugGruppe>
        </section>
        <section className="info-panel info-panel--material waldtanz-hud waldtanz-hud--material" aria-labelledby={materialUndAufgabenTitelId} aria-live="polite" aria-atomic="true">
          <h2 id={materialUndAufgabenTitelId}>Material und Aufgaben</h2>
          <section className="aufgabenkarten-bereich" aria-labelledby={aufgabenkartenTitelId} aria-live="polite" aria-atomic="true">
            <h3 id={aufgabenkartenTitelId}>Aufgabenkarten</h3>
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
        </section>
        <WertungPanel zustand={zustand} spielerwertungen={spielerwertungen} gesamtwertung={gesamtwertung} gewinnerErgebnis={gewinnerErgebnis} istSpielende={istSpielende} ergebnisText={ergebnisText} spielerNameFuerId={spielerNameFuerId} />
      </section>
    </main>
  )
}

export default App
