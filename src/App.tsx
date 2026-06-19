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
  ermittleQuestZugHinweise,
} from './engine'
import type { AufgabenkarteInfo, GewinnerEintrag, SpielAktion, SpielerWertungsEintrag, Spielzustand } from './engine'
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
import WaldtanzNachziehstapel from './components/WaldtanzNachziehstapel'
import WaldtanzZugspur from './components/WaldtanzZugspur'
import WaldtanzAufgabentafel from './components/WaldtanzAufgabentafel'
import WaldtanzKartenpop from './components/WaldtanzKartenpop'
import WaldtanzBonuszauber from './components/WaldtanzBonuszauber'
import WaldtanzTischkarte from './components/WaldtanzTischkarte'
import WaldtanzMagiekreise from './components/WaldtanzMagiekreise'
import WaldtanzArenazugknopf from './components/WaldtanzArenazugknopf'
import WertungPanel from './components/WertungPanel'
import MaterialUndAufgabenPanel from './components/MaterialUndAufgabenPanel'
import SpieleruebersichtPanel from './components/SpieleruebersichtPanel'
import AktiverSpielerZugtafel from './components/AktiverSpielerZugtafel'
import type { KiGegnerAnzahl } from './components/SonnigesNestLobby'
import { aktionsLabel } from './aktionsLabel'
import { spieleKiZuegeBisZumMenschen } from './kiZug'

function aufgabenPunkteAnzeige(a: AufgabenkarteInfo, istEndspurt: boolean): string {
  if (!istEndspurt) return `${a.punkte} Punkte`
  return `${a.punkte} Punkte ×2 = ${a.punkte * 2} Punkte`
}

function aufgabeLabel(a: AufgabenkarteInfo, istEndspurt: boolean): string {
  return `${a.name} (${aufgabenPunkteAnzeige(a, istEndspurt)}): ${a.bedingung}`
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
  if (legaleAktionen.length > 0) return 'Eine spielbare Aktion auswählen.'
  if (nichtEnumerierteAktionenHinweise.length > 0) return 'Schlangenhäutung vorbereiten.'
  return 'Derzeit keine spielbare Aktion verfügbar. Prüfe Phasenregeln oder Zugabschluss.'
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
  const spieleruebersichtTitelId = useId()
  const pflichtschrittLabel = naechsterPflichtschrittLabel(zustand, legaleAktionen, nichtEnumerierteAktionenHinweise, ueberhand)
  const empfohleneAktionLabel = legaleAktionen.length > 0 ? aktionsLabel(legaleAktionen[0]) : ''
  const hatSichtbarePhasenaktion = reaktionsAktionen.length === 0 && ((zustand.zugphase === 'Ausspielphase' && zustand.zugpflichten.gespielteKarten > 0) || zustand.zugphase === 'Aufgabenpruefung' || zustand.zugphase === 'Zugabschluss' || zustand.zugphase === 'Nachziehphase')
  const spielerfuehrungAktionszielId = hatSichtbarePhasenaktion ? phasenaktionId : empfohleneAktionId
  const spielerfuehrungAktionszielSatzText = hatSichtbarePhasenaktion ? (istGameRoute ? 'Brett-Zugaktion' : 'Phasenaktion') : 'empfohlene Aktion'
  const spielerfuehrungAktionszielLinkText = hatSichtbarePhasenaktion ? (istGameRoute ? 'Brett-Zugaktion' : 'Phasenaktion') : 'empfohlenen Aktion'
  const zeigtSpielerfuehrungAktionslink = legaleAktionen.length > 0 || hatSichtbarePhasenaktion
  const geheimeAufgabeText = aktiverSpieler.geheimeAufgabe ? aufgabeLabel(aktiverSpieler.geheimeAufgabe, false) : 'keine'

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
        <SpielstatusPanel zustand={zustand} titelId={spielstatusTitelId} istSpielende={istSpielende} istEndspurt={istEndspurt} entwicklungsdatenOffen={!istGameRoute} />
        <div className="spieltisch-gruppe">
          <section className="info-panel info-panel--waldtanz-arena" aria-labelledby={aktiverSpielerTitelId} aria-live="polite" aria-atomic="true">
            <h2 id={aktiverSpielerTitelId}>Aktiver Spieler</h2>
            <section className="spielbrett spielbrett--waldtanz" aria-labelledby={spieltischTitelId} aria-live="polite" aria-atomic="true">
              <h3 id={spieltischTitelId}>Spieltisch</h3>
              <WaldtanzSpielerrahmen zustand={zustand} spielerwertungen={spielerwertungen} kiZugProtokoll={kiZugProtokoll} schlangengrubeAktionen={versteckeKiEinzelaktionen ? [] : schlangengrubeAktionen} ausgewaehlteHandkarteId={ausgewaehlteHandkarte?.id ?? null} onAktion={fuhreAktionAus} />
              <aside className="waldtanz-zugseitenleiste" aria-label="Zugleiste">
                <Zugpfad zustand={zustand} kiZugProtokoll={kiZugProtokoll} />
                {istGameRoute && !istSpielende && (
                  <aside className="waldtanz-spielhilfe" aria-label="Waldtanz-Spielhilfe">
                    <AktiverSpielerZugtafel
                      spieler={aktiverSpieler}
                      punkte={aktiverSpielerWertung?.gesamtPunkte ?? 0}
                      pflichtschrittLabel={pflichtschrittLabel}
                      zugfuehrungLabel={zugfuehrungLabel(aktiverSpieler.steuerung)}
                      letzteAktion={letzteAktion}
                      geheimeAufgabeText={geheimeAufgabeText}
                    />
                    {aktiverSpieler.steuerung === 'Mensch' && (
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
                  </aside>
                )}
                <KiZugBuehne spielerName={aktiverSpieler.name} steuerung={aktiverSpieler.steuerung} protokoll={kiZugProtokoll} onKiZugVorspulen={handleKiZugVorspulen} />
                <ZugKompass
                  zustand={zustand}
                  ueberhand={ueberhand}
                  zeigtKiVorspulen={versteckeKiEinzelaktionen}
                  kiZugProtokoll={kiZugProtokoll}
                  zeigeHauptaktionen={!istGameRoute}
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
                  <section className="waldtanz-arenastein__schlangenlichtung waldtanz-lichtungsbrett" aria-label="Schlangenlichtung">
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
                  <aside className="waldtanz-arenastein__waldobjekte waldtanz-waldtaschen" aria-label="Waldobjekte">
                    {istGameRoute && (
                      <div className="waldtanz-waldtaschen__kopf">
                        <h4>Waldtaschen</h4>
                        <p>Ziehstapel · Ablage · Zugspur · Quests</p>
                      </div>
                    )}
                    <WaldtanzNachziehstapel zustand={zustand} />
                    <WaldtanzAblage zustand={zustand} />
                    <WaldtanzZugspur zustand={zustand} letzteAktion={letzteAktion} pflichtschrittLabel={pflichtschrittLabel} />
                    <WaldtanzAufgabentafel zustand={zustand} istEndspurt={istEndspurt} onAufgabenpruefungBeenden={handleAufgabenpruefungBeenden} zeigeDirektesEinsammeln={!istGameRoute} />
                  </aside>
                </div>
              </section>
              <HandkartenPanel
                handkarten={aktiverSpieler.hand}
                ausgewaehlteHandkarte={ausgewaehlteHandkarte}
                legaleAktionen={legaleAktionen}
                questHinweise={questZugHinweise}
                spielerName={aktiverSpieler.name}
                punkte={aktiverSpielerWertung?.gesamtPunkte ?? 0}
                zugphase={zustand.zugphase}
                onKarteWaehlen={(karteId) =>
                  setAusgewaehlteHandkarteAuswahl((aktuell) =>
                    aktuell?.spielerId === aktiverSpieler.id && aktuell.karteId === karteId ? null : { spielerId: aktiverSpieler.id, karteId },
                  )
                }
                onKarteDragStart={(karteId) => { gezogeneHandkarteIdRef.current = karteId; setAusgewaehlteHandkarteAuswahl({ spielerId: aktiverSpieler.id, karteId }) }}
                onKarteDragEnd={() => { gezogeneHandkarteIdRef.current = null; setAusgewaehlteHandkarteAuswahl(null) }}
              />
              {istGameRoute && <WaldtanzArenazugknopf id={phasenaktionId} hervorgehoben={hervorgehobenesAktionszielId === phasenaktionId} zustand={zustand} ueberhand={ueberhand} zeigtKiVorspulen={versteckeKiEinzelaktionen} onAusspielphaseBeenden={handleAusspielphaseBeenden} onAufgabenpruefungBeenden={handleAufgabenpruefungBeenden} onUeberzaehligeKartenAbwerfen={handleUeberzaehligeKartenAbwerfen} onZugBeenden={handleZugBeenden} onAusspielphaseStarten={handleAusspielphaseStarten} />}
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
              zeigePhasenaktion={!istGameRoute}
            />
            {!istGameRoute && (
              <AktiverSpielerZugtafel
                spieler={aktiverSpieler}
                punkte={aktiverSpielerWertung?.gesamtPunkte ?? 0}
                pflichtschrittLabel={pflichtschrittLabel}
                zugfuehrungLabel={zugfuehrungLabel(aktiverSpieler.steuerung)}
                letzteAktion={letzteAktion}
                geheimeAufgabeText={geheimeAufgabeText}
              />
            )}
            {!istGameRoute && !istSpielende && aktiverSpieler.steuerung === 'Mensch' && (
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
            <DebugGruppe titel="Aktiver Spieler" standardOffen={!istGameRoute} kompakteSchublade={istGameRoute}>
              <p>Aktiver Spieler: {aktiverSpieler.name}</p>
              <p>Spielerprofil: {aktiverSpieler.name} — {zugfuehrungLabel(aktiverSpieler.steuerung)}</p>
              <p>Zugführung: {zugfuehrungLabel(aktiverSpieler.steuerung)}</p>
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
          </section>
        </div>
        <SpieleruebersichtPanel zustand={zustand} spielerwertungen={spielerwertungen} aktiverSpielerId={aktiverSpieler.id} titelId={spieleruebersichtTitelId} entwicklungsdatenOffen={!istGameRoute} />
        <MaterialUndAufgabenPanel zustand={zustand} istEndspurt={istEndspurt} entwicklungsdatenOffen={!istGameRoute} />
        <WertungPanel zustand={zustand} spielerwertungen={spielerwertungen} gesamtwertung={gesamtwertung} gewinnerErgebnis={gewinnerErgebnis} istSpielende={istSpielende} ergebnisText={ergebnisText} spielerNameFuerId={spielerNameFuerId} entwicklungsdatenOffen={!istGameRoute} />
      </section>
    </main>
  )
}

export default App
