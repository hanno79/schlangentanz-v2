import { useId, useMemo } from 'react'
import './App.css'
import {
  berechneSpielzustandGesamtwertung,
  berechneGewinner,
  ermittleQuestZugHinweise,
} from './engine'
import type { SpielerWertungsEintrag, Spielzustand, PflichtAbwurfAktion } from './engine'
import { usePartie } from './hooks/usePartie'
import Spielbrett from './spielbrett/Spielbrett'
import type { BrettschrittEintrag } from './hooks/usePartie'
import useLegaleAktionenNachTyp from './hooks/useLegaleAktionenNachTyp'
import useAktionenPanelProps from './hooks/useAktionenPanelProps'
import { useSpielLabels } from './hooks/useSpielLabels'
import AktionenPanel from './components/AktionenPanel'
import Spielerfuehrung from './components/Spielerfuehrung'
import useAktionszielFokus from './hooks/useAktionszielFokus'
import HandkartenPanel from './components/HandkartenPanel'
import SonnigesNestLobby from './components/SonnigesNestLobby'
import SiegerParty from './components/SiegerParty'
import KiZugBuehne from './components/KiZugBuehne'
import SpielstatusPanel from './components/SpielstatusPanel'
import Zugpfad from './components/Zugpfad'
import ZugKompass from './components/ZugKompass'
import Partiefortschritt from './components/Partiefortschritt'
import WaldtanzPartieUhr from './components/WaldtanzPartieUhr'
import WaldtanzSpielerrahmen from './components/WaldtanzSpielerrahmen'
import WaldtanzSeitenmenue from './components/WaldtanzSeitenmenue'
import WaldtanzAblage from './components/WaldtanzAblage'
import WaldtanzNachziehstapel from './components/WaldtanzNachziehstapel'
import WaldtanzZugspur from './components/WaldtanzZugspur'
import WaldtanzAufgabentafel from './components/WaldtanzAufgabentafel'
import WaldtanzBonuszauber from './components/WaldtanzBonuszauber'
import WaldtanzArenazugknopf from './components/WaldtanzArenazugknopf'
import WaldtanzSchlangenlichtung from './components/WaldtanzSchlangenlichtung'
import WaldtanzGegnerlichtung from './components/WaldtanzGegnerlichtung'
import WaldtanzPhasenBanner from './components/WaldtanzPhasenBanner'
import WaldtanzBrettrandQuestpille from './components/WaldtanzBrettrandQuestpille'
import WaldtanzLetzteAktionHinweis from './components/WaldtanzLetzteAktionHinweis'
import WaldtanzSpielerplakette from './components/WaldtanzSpielerplakette'
import WaldtanzGegnerplakette from './components/WaldtanzGegnerplakette'
import WertungPanel from './components/WertungPanel'
import MaterialUndAufgabenPanel from './components/MaterialUndAufgabenPanel'
import SpieleruebersichtPanel from './components/SpieleruebersichtPanel'
import AktiverSpielerZugtafel from './components/AktiverSpielerZugtafel'
import WaldtanzAktiverSpielerDebug from './components/WaldtanzAktiverSpielerDebug'

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
  /* ÄNDERUNG [31.07.2026]: G-2 — `/brett` zeigt das neue Spielbrett
     (docs/SPIELBRETT_SPEC.md). Die Route ist temporär: In Paket G-8 übernimmt
     das neue Brett `/game` und dieser Zweig entfällt wieder. Solange laufen
     beide Ansichten nebeneinander auf derselben Zustandsschicht. */
  const istBrettRoute = typeof window !== 'undefined' && window.location.pathname === '/brett'
  /* ÄNDERUNG [31.07.2026]: G-1 — die Zustandsschicht liegt jetzt in
     src/hooks/usePartie.ts. Sie stand vorher hier zwischen dem Markup; das neue
     Spielbrett soll dieselbe Quelle nutzen, damit während des Umbaus keine
     zweite Zustandsimplementierung entsteht. */
  const partie = usePartie({ initialZustand, initialBrettschrittEintraege })
  const {
    zustand,
    letzteAktion,
    letzteAktionZiel,
    hervorgehobenesAktionszielId,
    setHervorgehobenesAktionszielId,
    gegnerZielspurKey,
    setGegnerZielspurKey,
    ausgewaehlteHandkarteAuswahl,
    setAusgewaehlteHandkarteAuswahl,
    abwurfAuswahl,
    handkarteDragAktiv,
    setHandkarteDragAktiv,
    kiZugProtokoll,
    brettschrittEintraege,
    gezogeneHandkarteIdRef,
    aktionsLabel,
    ueberhand,
    fuhreAktionAus,
    handleAusspielphaseBeenden,
    handleAufgabenpruefungBeenden,
    handleUeberzaehligeKartenAbwerfen,
    handleAbwurfToggle,
    handleZugBeenden,
    handleAusspielphaseStarten,
    handleKiZugVorspulen,
    handleNeuesLobbySpiel,
  } = partie
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
    aktionsLabel,
  )
  const wertungBrettFokus = istGameRoute
  const materialBrettFokus = istGameRoute
  const spieleruebersichtBrettFokus = istGameRoute

  useAktionszielFokus(hervorgehobenesAktionszielId)


  const aktionenPanelProps = useAktionenPanelProps({
    zustand, legaleAktionen, nichtEnumerierteAktionenHinweise, reaktionsAktionen,
    ueberhand, istSpielende, steuerung: aktiverSpieler.steuerung,
    aktionsLabel, pflichtschrittLabel, hervorgehobenesAktionszielId,
    empfohleneAktionId, phasenaktionId,
    onAktionAusfuehren: fuhreAktionAus,
    onAusspielphaseBeenden: handleAusspielphaseBeenden,
    onAufgabenpruefungBeenden: handleAufgabenpruefungBeenden,
    onUeberzaehligeKartenAbwerfen: handleUeberzaehligeKartenAbwerfen,
    onZugBeenden: handleZugBeenden,
    onAusspielphaseStarten: handleAusspielphaseStarten,
    onKiZugVorspulen: handleKiZugVorspulen,
    istGameRoute,
  })

  /* Erst hier, nach allen Hook-Aufrufen: React verlangt, dass jeder Hook bei
     jedem Rendern in derselben Reihenfolge läuft. Ein früherer Ausstieg würde
     das brechen. */
  if (istBrettRoute) return <Spielbrett partie={partie} />

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
              {istGameRoute && !istSpielende && zustand.spieler.length > 1 && (
                <WaldtanzGegnerplakette
                  spielerName={naechsterGegner.name}
                  istMensch={naechsterGegner.steuerung === 'Mensch'}
                  punkte={spielerwertungen.find((wertung) => wertung.spielerId === naechsterGegner.id)?.gesamtPunkte ?? 0}
                  handkarten={naechsterGegner.hand.length}
                />
              )}
              {istGameRoute && <AktionenPanel {...aktionenPanelProps} />}
              <section className="waldtanz-arenastein" aria-label="Waldtanz-Arenastein">
                <div className="waldtanz-arenastein__kopf">
                  <div className="waldtanz-arenastein__kopf-titel">
                    <h4>Leuchtender Waldstein</h4>
                    <p>Magische Zielkreise leuchten im Brett.</p>
                  </div>
                </div>
                {istGameRoute && (
                  <WaldtanzPhasenBanner zugphase={zustand.zugphase} istSpielende={istSpielende} />
                )}
                {istGameRoute && (
                  <WaldtanzBrettrandQuestpille geheimeAufgabeText={geheimeAufgabeText} />
                )}
                {istGameRoute && (
                  <WaldtanzLetzteAktionHinweis letzteAktion={letzteAktion} />
                )}
                <div className="waldtanz-arenastein__spielfeld">
                  {istGameRoute && zustand.spieler.length > 1 && (
                    <WaldtanzGegnerlichtung
                      spieler={gegnerSpieler}
                      spielerwertungen={spielerwertungen}
                      ausgewaehlteHandkarteId={ausgewaehlteHandkarte?.id ?? null}
                      schlangenblockadeAktionen={schlangenblockadeAktionen}
                      farbendiebAktionen={farbendiebAktionen}
                      schlangenfrassAktionen={schlangenfrassAktionen}
                      onAktion={fuhreAktionAus}
                      aktionsLabel={aktionsLabel}
                      aktiverZielspurKey={gegnerZielspurKey}
                      letzteAktionZiel={letzteAktionZiel}
                    />
                  )}
                  <WaldtanzSchlangenlichtung
                    zustand={zustand}
                    aktiverSpieler={aktiverSpieler}
                    ausgewaehlteHandkarteId={ausgewaehlteHandkarte?.id ?? null}
                    istGameRoute={istGameRoute}
                    handkarteDragAktiv={handkarteDragAktiv}
                    versteckeKiEinzelaktionen={versteckeKiEinzelaktionen}
                    karteAnlegenAktionen={karteAnlegenAktionen}
                    neueSchlangeStartenAktionen={neueSchlangeStartenAktionen}
                    farbenschutzAktionen={farbenschutzAktionen}
                    farbenfusionAktionen={farbenfusionAktionen}
                    schlangenfrassAktionen={schlangenfrassAktionen}
                    schlangenblockadeAktionen={schlangenblockadeAktionen}
                    schlangengrubeAktionen={schlangengrubeAktionen}
                    farbendiebAktionen={farbendiebAktionen}
                    gezogeneHandkarteIdRef={gezogeneHandkarteIdRef}
                    onAktion={fuhreAktionAus}
                    aktionsLabel={aktionsLabel}
                    letzteAktion={letzteAktion}
                    letzteAktionZiel={letzteAktionZiel}
                    istEndspurt={istEndspurt}
                    ueberhand={ueberhand}
                    istSpielende={istSpielende}
                    kiZugLaeuft={versteckeKiEinzelaktionen}
                    brettschrittEintraege={brettschrittEintraege}
                    pflichtschrittLabel={pflichtschrittLabel}
                    onZielspurKeyChange={setGegnerZielspurKey}
                  />
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
                {istGameRoute && <WaldtanzPartieUhr zustand={zustand} />}
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
              {/* ÄNDERUNG [31.07.2026]: S-2c — Spielerplakette, Hand und Gegnerzug-Knopf
                  liegen jetzt in einer gemeinsamen Bodenleiste. Im Grid bildeten sie
                  schon immer eine Reihe ("sp-plakette hand arenazug"), im DOM standen
                  sie aber getrennt — die Plakette vor der Zugleiste, die anderen beiden
                  danach. Erst als ein Element lässt sich die Reihe geschlossen am
                  Viewport-Boden verankern; nur die Hand zu fixieren schob Plakette und
                  Gegnerzug-Knopf hinter sie (gemessen 745-889 px unter einer Hand ab
                  648 px). Vertrag: tests/layout/hand_am_brettrand.spec.ts */}
              <div className="waldtanz-brettrandleiste">
              {istGameRoute && (
                <WaldtanzSpielerplakette
                  spielerName={aktiverSpieler.name}
                  istMensch={aktiverSpieler.steuerung === 'Mensch'}
                  punkte={aktiverSpielerWertung?.gesamtPunkte ?? 0}
                  handkarten={aktiverSpieler.hand.length}
                />
              )}
              <HandkartenPanel
                handkarten={aktiverSpieler.hand}
                ausgewaehlteHandkarte={ausgewaehlteHandkarte}
                legaleAktionen={legaleAktionen}
                questHinweise={questZugHinweise}
                spielerName={aktiverSpieler.name}
                aktiverSpielerId={aktiverSpieler.id}
                punkte={aktiverSpielerWertung?.gesamtPunkte ?? 0}
                zugphase={zustand.zugphase}
                verdeckt={aktiverSpieler.steuerung === 'KI'}
                abwurfModus={zustand.zugphase === 'Zugabschluss' && ueberhand > 0 && aktiverSpieler.steuerung === 'Mensch'}
                abwurfAuswahl={abwurfAuswahl}
                abwurfAnzahl={ueberhand}
                onAbwurfToggle={handleAbwurfToggle}
                onAbwurfBestaetigen={handleUeberzaehligeKartenAbwerfen}
                endTurnVerfuegbar={
                  zustand.zugphase === 'Zugabschluss'
                  && ueberhand === 0
                  && aktiverSpieler.steuerung === 'Mensch'
                  && reaktionsAktionen.length === 0
                }
                pflichtAbwurfAktionen={legaleAktionen.filter((aktion): aktion is PflichtAbwurfAktion => aktion.typ === 'PflichtAbwurf')}
                onEndTurn={handleZugBeenden}
                onPflichtAbwurf={(karteId) => {
                  if (karteId) fuhreAktionAus({ typ: 'PflichtAbwurf', spielerId: aktiverSpieler.id, handkartenId: karteId })
                }}
                onKarteWaehlen={(karteId) =>
                  setAusgewaehlteHandkarteAuswahl((aktuell) =>
                    aktuell?.spielerId === aktiverSpieler.id && aktuell.karteId === karteId ? null : { spielerId: aktiverSpieler.id, karteId },
                  )
                }
                onKarteDragStart={(karteId) => { gezogeneHandkarteIdRef.current = karteId; setAusgewaehlteHandkarteAuswahl({ spielerId: aktiverSpieler.id, karteId }); setHandkarteDragAktiv(true) }}
                onKarteDragEnd={() => { gezogeneHandkarteIdRef.current = null; setAusgewaehlteHandkarteAuswahl(null); setHandkarteDragAktiv(false) }}
              />
              {istGameRoute && <WaldtanzArenazugknopf id={phasenaktionId} hervorgehoben={hervorgehobenesAktionszielId === phasenaktionId} zustand={zustand} ueberhand={ueberhand} zeigtKiVorspulen={versteckeKiEinzelaktionen} onAusspielphaseBeenden={handleAusspielphaseBeenden} onAufgabenpruefungBeenden={handleAufgabenpruefungBeenden} onUeberzaehligeKartenAbwerfen={handleUeberzaehligeKartenAbwerfen} onZugBeenden={handleZugBeenden} onAusspielphaseStarten={handleAusspielphaseStarten} />}
              </div>
            </section>
            {!istGameRoute && <AktionenPanel {...aktionenPanelProps} />}
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
            {!istGameRoute && (
              <WaldtanzAktiverSpielerDebug
                aktiverSpieler={aktiverSpieler}
                aktiverSpielerWertung={aktiverSpielerWertung}
                legaleAktionen={legaleAktionen}
                reaktionsAktionen={reaktionsAktionen}
                aktionsLabel={aktionsLabel}
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
            )}
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
