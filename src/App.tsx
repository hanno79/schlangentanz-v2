import { useId, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  erstelleSpielzustand,
  starteAusspielphase,
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
import type { SpielAktion, SpielerWertungsEintrag, Spielzustand } from './engine'
import useLegaleAktionenNachTyp from './hooks/useLegaleAktionenNachTyp'
import { useSpielLabels } from './hooks/useSpielLabels'
import AktionenPanel from './components/AktionenPanel'
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
import WaldtanzQuestband from './components/WaldtanzQuestband'
import WaldtanzKartenpop from './components/WaldtanzKartenpop'
import WaldtanzBonuszauber from './components/WaldtanzBonuszauber'
import WaldtanzTischkarte from './components/WaldtanzTischkarte'
import WaldtanzMagiekreise from './components/WaldtanzMagiekreise'
import WaldtanzArenazugknopf from './components/WaldtanzArenazugknopf'
import WaldtanzBrettschrittStempel from './components/WaldtanzBrettschrittStempel'
import type { BrettschrittEintrag } from './components/WaldtanzBrettschrittStempel'
import WaldtanzAktiverTanzSchritt from './components/WaldtanzAktiverTanzSchritt'
import WaldtanzSpielerplakette from './components/WaldtanzSpielerplakette'
import WaldtanzGegnerplakette from './components/WaldtanzGegnerplakette'
import WertungPanel from './components/WertungPanel'
import MaterialUndAufgabenPanel from './components/MaterialUndAufgabenPanel'
import SpieleruebersichtPanel from './components/SpieleruebersichtPanel'
import AktiverSpielerZugtafel from './components/AktiverSpielerZugtafel'
import WaldtanzAktiverSpielerDebug from './components/WaldtanzAktiverSpielerDebug'
import type { KiGegnerAnzahl } from './components/SonnigesNestLobby'
import { aktionsLabel } from './aktionsLabel'
import { spieleKiZuegeBisZumMenschen } from './kiZug'

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

interface AppProps {
  initialZustand?: Spielzustand
  initialBrettschrittEintraege?: BrettschrittEintrag[]
}

function App({ initialZustand, initialBrettschrittEintraege }: AppProps) {
  const istGameRoute = typeof window !== 'undefined' && (window.location.pathname === '/game' || window.location.pathname.startsWith('/game/'))
  const [startZustand] = useState(() => initialZustand ?? starteAusspielphase(erstelleSpielzustand(2)))
  const [zustand, setZustand] = useState<Spielzustand>(() => startZustand)
  const [letzteAktion, setLetzteAktion] = useState<string | null>(null)
  const [hervorgehobenesAktionszielId, setHervorgehobenesAktionszielId] = useState<string | null>(null)
  const [ausgewaehlteHandkarteAuswahl, setAusgewaehlteHandkarteAuswahl] = useState<{ spielerId: string; karteId: string } | null>(null)
  const [kiZugProtokoll, setKiZugProtokoll] = useState<string[]>([])
  const [brettschrittEintraege, setBrettschrittEintraege] = useState<BrettschrittEintrag[]>(() => {
    if (initialBrettschrittEintraege !== undefined) return initialBrettschrittEintraege
    const aktiverIndex = startZustand.aktiverSpielerIndex
    return startZustand.ablagestapel.slice(-3).map((karte) => ({
      karteId: karte.id,
      spielerId: startZustand.spieler[aktiverIndex]?.id ?? 'unbekannt',
      spielerIndex: aktiverIndex,
      phase: startZustand.zugphase,
    }))
  })
  const gezogeneHandkarteIdRef = useRef<string | null>(null)
  const {
    legaleAktionen,
    nichtEnumerierteAktionenHinweise,
    reaktionsAktionen,
    karteAnlegenAktionen,
    neueSchlangeStartenAktionen,
    farbenschutzAktionen,
    farbenfusionAktionen,
    schlangenfrassAktionen,
    schlangenblockadeAktionen,
    farbendiebAktionen,
    verdopplerAktionen,
    schlangengrubeAktionen,
  } = useLegaleAktionenNachTyp(zustand)
  const questZugHinweise = useMemo(() => ermittleQuestZugHinweise(zustand, legaleAktionen), [zustand, legaleAktionen])
  const gesamtwertung = useMemo(() => berechneSpielzustandGesamtwertung(zustand), [zustand])
  const gewinnerErgebnis = useMemo(() => zustand.zugphase === 'Spielende' ? berechneGewinner(zustand.spieler) : null, [zustand.zugphase, zustand.spieler])
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex]
  const gegnerSpieler = zustand.spieler.filter((spieler) => spieler.id !== aktiverSpieler.id)
  // M1cy: naechster Gegner im Uhrzeigersinn (aktiverIndex+1) mod spieler.length.
  // Bei 2 Spielern ist das der einzige Gegner; bei 3-4 Spielern ist es der naechste
  // kommende Gegner — Spieler sieht auf einen Blick, wer als naechstes an der Reihe ist.
  const naechsterGegnerIndex = (zustand.aktiverSpielerIndex + 1) % zustand.spieler.length
  const naechsterGegner = zustand.spieler[naechsterGegnerIndex]
  const versteckeKiEinzelaktionen = aktiverSpieler.steuerung === 'KI' && reaktionsAktionen.length === 0
  const ausgewaehlteHandkarte = ausgewaehlteHandkarteAuswahl?.spielerId === aktiverSpieler.id
    ? aktiverSpieler.hand.find((karte) => karte.id === ausgewaehlteHandkarteAuswahl.karteId) ?? null
    : null
  const spielerwertungen: SpielerWertungsEintrag[] = gesamtwertung.spielerwertungen
  const aktiverSpielerWertung = useMemo(
    () => spielerwertungen.find((eintrag: SpielerWertungsEintrag) => eintrag.spielerId === aktiverSpieler.id) ?? null,
    [spielerwertungen, aktiverSpieler.id],
  )
  const istSpielende = zustand.zugphase === 'Spielende'
  const ueberhand = ueberhandAnzahl(zustand)
  const istEndspurt = zustand.spielphase === 'Endspurt'
  const spielerNameFuerId = (spielerId: string) => zustand.spieler.find(spieler => spieler.id === spielerId)?.name ?? spielerId
  const empfohleneAktionId = useId(), phasenaktionId = useId(), heroTitelId = useId(), spielstatusTitelId = useId(), aktiverSpielerTitelId = useId(), spieltischTitelId = useId()
  const spieleruebersichtTitelId = useId()
  const {
    pflichtschrittLabel,
    empfohleneAktionLabel,
    geheimeAufgabeText,
    gewinnerText,
    ergebnisText,
    zeigtSpielerfuehrungAktionslink,
    spielerfuehrungAktionszielId,
    spielerfuehrungAktionszielSatzText,
    spielerfuehrungAktionszielLinkText,
  } = useSpielLabels(
    zustand,
    aktiverSpieler,
    legaleAktionen,
    reaktionsAktionen,
    nichtEnumerierteAktionenHinweise,
    ueberhand,
    gewinnerErgebnis,
    istGameRoute,
    empfohleneAktionId,
    phasenaktionId,
  )
  const wertungBrettFokus = istGameRoute
  const materialBrettFokus = istGameRoute
  const spieleruebersichtBrettFokus = istGameRoute

  useAktionszielFokus(hervorgehobenesAktionszielId)

  function wechsleZustand(label: string, updater: (z: Spielzustand) => Spielzustand) {
    setLetzteAktion(label)
    setKiZugProtokoll([])
    setHervorgehobenesAktionszielId(null)
    setAusgewaehlteHandkarteAuswahl(null)
    // Naechsten Zustand synchron aus dem Closure ableiten, damit wir die
    // Brettschritt-Eintraege ausserhalb eines setState-Updaters pflegen koennen
    // und kein setState-during-render Anti-Pattern entsteht.
    const vorherAb = zustand.ablagestapel
    const phaseVorher = zustand.zugphase
    const aktiverIndexVorher = zustand.aktiverSpielerIndex
    const aktiverVorher = zustand.spieler[aktiverIndexVorher]
    const naechster = updater(zustand)
    setZustand(naechster)
    const nachherAb = naechster.ablagestapel
    if (nachherAb.length > vorherAb.length) {
      const neueKarten = nachherAb.slice(vorherAb.length)
      const phase = phaseVorher
      const eintraege: BrettschrittEintrag[] = []
      for (const karte of neueKarten) {
        eintraege.push({
          karteId: karte.id,
          spielerId: naechster.spieler[aktiverIndexVorher]?.id ?? aktiverVorher.id,
          spielerIndex: aktiverIndexVorher,
          phase,
          konsequenz: label,
        })
      }
      setBrettschrittEintraege((bisher) => [...bisher, ...eintraege].slice(-3))
    } else if (nachherAb.length < vorherAb.length) {
      const entfernteIds = new Set(vorherAb.filter((k) => !nachherAb.some((n) => n.id === k.id)).map((k) => k.id))
      setBrettschrittEintraege((bisher) => bisher.filter((eintrag) => !entfernteIds.has(eintrag.karteId)))
    }
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
    // Brettschritt-Historie nach KI-Vorspulen neu aus dem sichtbaren ablagestapel aufbauen,
    // damit die naechsten 3 Stempel die aktuelle Lage wiedergeben. Spieler-Index wird auf den
    // aktiven Spieler gesetzt, weil die genaue Zuordnung im Vorspulen nicht rekonstruierbar ist.
    const aktiverIndex = ergebnis.zustand.spieler.findIndex((s) => s.steuerung === 'Mensch')
    const fallbackIndex = aktiverIndex >= 0 ? aktiverIndex : 0
    const eintraege: BrettschrittEintrag[] = ergebnis.zustand.ablagestapel.slice(-3).map((karte) => ({
      karteId: karte.id,
      spielerId: ergebnis.zustand.spieler[fallbackIndex]?.id ?? 'unbekannt',
      spielerIndex: fallbackIndex,
      phase: 'Zugabschluss',
      konsequenz: 'Gegnerzüge vorgespult',
    }))
    setBrettschrittEintraege(eintraege)
  }
  function handleNeuesLobbySpiel(kiGegner: KiGegnerAnzahl) {
    setLetzteAktion(`Neues Spiel: Du + ${kiGegner} KI`)
    setKiZugProtokoll([])
    setHervorgehobenesAktionszielId(null)
    setAusgewaehlteHandkarteAuswahl(null)
    gezogeneHandkarteIdRef.current = null
    setBrettschrittEintraege([])
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
        <WaldtanzSeitenmenue spielerName={aktiverSpieler.name} punkte={aktiverSpielerWertung?.gesamtPunkte ?? 0} zugphase={zustand.zugphase} handkarten={aktiverSpieler.hand.length} eigeneSchlangen={aktiverSpieler.schlangen.length} nachziehstapel={zustand.nachziehstapel.length} offeneAufgaben={zustand.offeneAufgaben.length} pflichtschritt={pflichtschrittLabel} kompakteRanke={istGameRoute} />
        <SpielstatusPanel zustand={zustand} titelId={spielstatusTitelId} istSpielende={istSpielende} istEndspurt={istEndspurt} entwicklungsdatenOffen={!istGameRoute} />
        <div className="spieltisch-gruppe">
          <section className="info-panel info-panel--waldtanz-arena" aria-labelledby={aktiverSpielerTitelId} aria-live="polite" aria-atomic="true">
            <h2 id={aktiverSpielerTitelId}>Aktiver Spieler</h2>
            <section className="spielbrett spielbrett--waldtanz" aria-labelledby={spieltischTitelId} aria-live="polite" aria-atomic="true">
              <h3 id={spieltischTitelId}>Spieltisch</h3>
              <WaldtanzSpielerrahmen zustand={zustand} spielerwertungen={spielerwertungen} kiZugProtokoll={kiZugProtokoll} schlangengrubeAktionen={versteckeKiEinzelaktionen ? [] : schlangengrubeAktionen} ausgewaehlteHandkarteId={ausgewaehlteHandkarte?.id ?? null} onAktion={fuhreAktionAus} />
              <aside className="waldtanz-zugseitenleiste" aria-label="Zugleiste">
                {istGameRoute && (
                  <div className="waldtanz-unterholzleiste" role="group" aria-label="Waldtanz-Unterholzleiste">
                    <strong>Unterholzleiste</strong>
                    <span>{pflichtschrittLabel}</span>
                  </div>
                )}
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
                {istGameRoute && <WaldtanzBrettschrittStempel zustand={zustand} eintraege={brettschrittEintraege} />}
                {istGameRoute && (
                  <WaldtanzQuestband
                    zustand={zustand}
                    istEndspurt={istEndspurt}
                  />
                )}
                {istGameRoute && (
                  <WaldtanzAktiverTanzSchritt
                    istSichtbar
                    daten={{
                      aktiverSpielerName: aktiverSpieler.name,
                      istMensch: aktiverSpieler.steuerung === 'Mensch',
                      spielerIndex: zustand.aktiverSpielerIndex,
                      phase: zustand.zugphase,
                      naechsterSchritt: pflichtschrittLabel,
                      ueberhand,
                      istSpielende,
                      kiZugLaeuft: versteckeKiEinzelaktionen,
                    }}
                  />
                )}
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
              {istGameRoute && (
                <WaldtanzSpielerplakette
                  spielerName={aktiverSpieler.name}
                  istMensch={aktiverSpieler.steuerung === 'Mensch'}
                  punkte={aktiverSpielerWertung?.gesamtPunkte ?? 0}
                  handkarten={aktiverSpieler.hand.length}
                />
              )}
              {istGameRoute && !istSpielende && zustand.spieler.length > 1 && (
                <WaldtanzGegnerplakette
                  spielerName={naechsterGegner.name}
                  istMensch={naechsterGegner.steuerung === 'Mensch'}
                  punkte={spielerwertungen.find((wertung) => wertung.spielerId === naechsterGegner.id)?.gesamtPunkte ?? 0}
                  handkarten={naechsterGegner.hand.length}
                />
              )}
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
            <WaldtanzAktiverSpielerDebug
              aktiverSpieler={aktiverSpieler}
              aktiverSpielerWertung={aktiverSpielerWertung}
              legaleAktionen={legaleAktionen}
              reaktionsAktionen={reaktionsAktionen}
              letzteAktion={letzteAktion}
              istSpielende={istSpielende}
              gewinnerText={gewinnerText}
              empfohleneAktionLabel={empfohleneAktionLabel}
              ueberhand={ueberhand}
              pflichtschrittLabel={pflichtschrittLabel}
              zugfuehrungLabel={zugfuehrungLabel(aktiverSpieler.steuerung)}
              geheimerAufgabeLabel={geheimeAufgabeText}
              standardOffen={!istGameRoute}
              kompakteSchublade={istGameRoute}
            />
          </section>
        </div>
        <SpieleruebersichtPanel zustand={zustand} spielerwertungen={spielerwertungen} aktiverSpielerId={aktiverSpieler.id} titelId={spieleruebersichtTitelId} entwicklungsdatenOffen={!istGameRoute} brettFokus={spieleruebersichtBrettFokus} />
        <MaterialUndAufgabenPanel zustand={zustand} istEndspurt={istEndspurt} entwicklungsdatenOffen={!istGameRoute} brettFokus={materialBrettFokus} />
        <WertungPanel zustand={zustand} spielerwertungen={spielerwertungen} gesamtwertung={gesamtwertung} gewinnerErgebnis={gewinnerErgebnis} istSpielende={istSpielende} ergebnisText={ergebnisText} spielerNameFuerId={spielerNameFuerId} entwicklungsdatenOffen={!istGameRoute} brettFokus={wertungBrettFokus} />
      </section>
    </main>
  )
}

export default App
