import { Fragment, useMemo, useState } from 'react'
import './App.css'
import {
  erstelleSpielzustand,
  starteAusspielphase,
  ermittleLegaleAktionen,
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

function naechsterPflichtschrittLabel(zustand: Spielzustand, legaleAktionen: SpielAktion[], ueberhand: number): string {
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
  return 'Keine Aktion verfügbar.'
}

interface AppProps {
  initialZustand?: Spielzustand
}

function App({ initialZustand }: AppProps) {
  const [zustand, setZustand] = useState(() =>
    initialZustand ?? starteAusspielphase(erstelleSpielzustand(2))
  )
  const [letzteAktion, setLetzteAktion] = useState<string | null>(null)
  const legaleAktionen = useMemo(() => ermittleLegaleAktionen(zustand), [zustand])
  const reaktionsAktionen = useMemo(() => ermittleReaktionsAktionen(zustand), [zustand])
  const gesamtwertung = useMemo(() => berechneSpielzustandGesamtwertung(zustand), [zustand])
  const gewinnerErgebnis = useMemo(
    () => zustand.zugphase === 'Spielende' ? berechneGewinner(zustand.spieler) : null,
    [zustand.zugphase, zustand.spieler],
  )
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex]
  const gegnerSpieler = zustand.spieler.filter((spieler) => spieler.id !== aktiverSpieler.id)
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

  function fuhreAktionAus(aktion: SpielAktion) {
    setLetzteAktion(aktionsLabel(aktion))
    setZustand(z => anwendeAktion(z, aktion))
  }

  function handleAusspielphaseBeenden() {
    setLetzteAktion('Ausspielphase beenden')
    setZustand(z => beendeAusspielphase(z))
  }

  function handleAufgabenpruefungBeenden() {
    setLetzteAktion('Aufgabenprüfung beenden')
    setZustand(z => beendeAufgabenpruefung(z, { aufgabenGeprueft: true }))
  }

  function handleUeberzaehligeKartenAbwerfen() {
    setLetzteAktion('Überzählige Karten abwerfen')
    setZustand(z => werfeUeberzaehligeHandkartenAb(z, { kartenIds: ueberhandAbwurfKartenIds(z) }))
  }

  function handleZugBeenden() {
    setLetzteAktion('Zug beenden')
    setZustand(z => beendeZug(z, { pflichtenErfuellt: true }))
  }

  function handleAusspielphaseStarten() {
    setLetzteAktion('Ausspielphase starten')
    setZustand(z => starteAusspielphase(z))
  }

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="title">
        <p className="eyebrow">Neues Projekt · neues GitHub-Repo · neues Vercel-Projekt</p>
        <h1 id="title">Schlangentanz v2 Greenfield Rebuild</h1>
        <p>
          Dieses Repository ist der saubere Neustart. Es übernimmt keinen alten
          Paperclip- oder Schlangentanz-v1-Code. Die Umsetzung beginnt erst nach
          Freigabe der <code>docs/GAME_SPEC.md</code>.
        </p>
        <ul>
          <li>Hermes orchestriert und prüft die Gates.</li>
          <li>Claude Code baut kleine, getestete Slices.</li>
          <li>Codex reviewed adversarial gegen Spec und Tests.</li>
        </ul>
      </section>
      <section className="spielbereich" aria-label="Legale Aktionen">
        <section className="info-panel" aria-label="Spielstatus">
          <h2>Spielstatus</h2>
          <p>Engine-Demo: {zustand.zugphase}</p>
          <p>Zugphase: {zustand.zugphase}</p>
          <p>Spielphase: {zustand.spielphase}</p>
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
          <p>Spieler am Zug: {zustand.aktiverSpielerIndex + 1}/{zustand.spieler.length}</p>
        </section>
        <section className="info-panel" aria-label="Aktiver Spieler" aria-live="polite">
          <h2>Aktiver Spieler</h2>
          <p>Aktiver Spieler: {aktiverSpieler.id}</p>
          <p>Aktiver Spieler-Details: {aktiverSpieler.id} — {aktiverSpieler.name} ({aktiverSpieler.steuerung})</p>
          <p>Zugführung: {zugfuehrungLabel(aktiverSpieler.steuerung)}</p>
          <p>
            Aktuelle Wertung:{' '}
            {aktiverSpielerWertung ? `${aktiverSpielerWertung.gesamtPunkte} Punkte` : 'keine'}
          </p>
          {ueberhand > 0 && (
            <p>Überzählige Karten: {ueberhand} über dem Limit von {HANDKARTENLIMIT}.</p>
          )}
          {letzteAktion && <p>Zuletzt ausgeführt: {letzteAktion}</p>}
          {istSpielende && (
            <>
              <p>Spielende erreicht.</p>
              <p>Gewinner: {gewinnerText}</p>
            </>
          )}
          {!istSpielende && legaleAktionen.length > 0 && (
            <p>Nächste legale Aktion: {aktionsLabel(legaleAktionen[0])}</p>
          )}
          {reaktionsAktionen.length > 0 && (
            <p>Nächste Reaktionsaktion: {aktionsLabel(reaktionsAktionen[0])}</p>
          )}
          <p>Nächster Pflichtschritt: {naechsterPflichtschrittLabel(zustand, legaleAktionen, ueberhand)}</p>
          {!istSpielende && aktiverSpieler.steuerung === 'KI' && <p>Nächster Schritt: KI-Aktion ausführen.</p>}
          <p>
            {aktiverSpieler.geheimeAufgabe
              ? `Geheime Aufgabe: ${aufgabeLabel(aktiverSpieler.geheimeAufgabe, false)}`
              : 'Geheime Aufgabe: keine'}
          </p>
          {aktiverSpieler.schlangen.map(schlange => (
            <p key={schlange.id}>
              Schlange {schlange.id}: {kartenIds(schlange.karten)}
            </p>
          ))}
          <p>
            Handkarten:{' '}
            {aktiverSpieler.hand.length > 0 ? kartenIds(aktiverSpieler.hand) : 'keine'}
          </p>
          <p>
            Handkarten-Details:{' '}
            {aktiverSpieler.hand.length === 0
              ? 'keine'
              : aktiverSpieler.hand
                  .map((k) =>
                    k.typ === 'Farbkarte'
                      ? `${k.id} (Farbkarte ${k.farbe}, ${k.punkte} Punkte)`
                      : `${k.id} (Sonderkarte ${k.name})`,
                  )
                  .join(', ')}
          </p>
          <section className="handkarten-panel" aria-label="Handkarten">
            <h3>Handkarten als Kartenleiste</h3>
            <ul className="handkartenleiste">
              {aktiverSpieler.hand.map((karte) => {
                const istFarbkarte = karte.typ === 'Farbkarte'

                return (
                  <li
                    key={karte.id}
                    className={`handkarte handkarte--${istFarbkarte ? 'farbkarte' : 'sonderkarte'}`}
                  >
                    <strong>{karte.id}</strong>
                    <span>{istFarbkarte ? `Farbkarte ${karte.farbe}` : `Sonderkarte ${karte.name}`}</span>
                    <span>{istFarbkarte ? `${karte.punkte} Punkte` : 'Sonderaktion'}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        </section>
        <section className="info-panel" aria-label="Spielerübersicht">
          <h2>Spielerübersicht</h2>
          {zustand.spieler.map(spieler => {
            const istAktiv = spieler.id === aktiverSpieler.id

            return (
              <p key={spieler.id} aria-current={istAktiv ? 'true' : undefined}>
                Spielerübersicht {spieler.id}: {spieler.name} ({spieler.steuerung}) — {spieler.hand.length} Handkarten, {spieler.schlangen.length} Schlangen{istAktiv ? ' — am Zug' : ''}
              </p>
            )
          })}
          {zustand.spieler.map(spieler => (
            <p key={`schlangen-${spieler.id}`}>
              Schlangenübersicht {spieler.id}:{' '}
              {spieler.schlangen.length === 0
                ? 'keine'
                : spieler.schlangen.map(s => `${s.id} (${kartenIds(s.karten)})`).join('; ')}
            </p>
          ))}
          {zustand.spieler.flatMap(spieler =>
            spieler.schlangen.map(schlange => (
              <p key={`zustand-${spieler.id}-${schlange.id}`}>
                Schlangenzustand {spieler.id}/{schlange.id}: {schlange.zustand}
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
          <p>Schlangen gesamt: {zustand.spieler.reduce((sum, s) => sum + s.schlangen.length, 0)}</p>
          <p>Handkarten gesamt: {zustand.spieler.reduce((sum, s) => sum + s.hand.length, 0)}</p>
          <section className="schlangenbereich" aria-labelledby="schlangenbereich-titel">
            <h2 id="schlangenbereich-titel">Schlangenbereich</h2>
            <section className="schlangen-gruppe" aria-labelledby="eigene-schlangen-titel">
              <h3 id="eigene-schlangen-titel">Eigene Schlangen</h3>
              {aktiverSpieler.schlangen.length > 0 ? (
                <ul className="schlangenleiste">
                  {aktiverSpieler.schlangen.map((schlange) => (
                    <li key={schlange.id} className="schlangekarte schlangekarte--eigene">
                      <strong>{schlange.id}</strong>
                      <span>
                        {schlange.karten.length > 0 ? kartenIds(schlange.karten) : 'keine Karten'}
                      </span>
                      <span>Zustand: {schlange.zustand}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Keine eigenen Schlangen.</p>
              )}
            </section>
            <section className="schlangen-gruppe" aria-labelledby="gegnerische-schlangen-titel">
              <h3 id="gegnerische-schlangen-titel">Gegnerische Schlangen</h3>
              {gegnerSpieler.some((spieler) => spieler.schlangen.length > 0) ? (
                <ul className="schlangenleiste">
                  {gegnerSpieler.flatMap((spieler) =>
                    spieler.schlangen.map((schlange) => (
                      <li key={schlange.id} className="schlangekarte schlangekarte--gegner">
                        <strong>{schlange.id}</strong>
                        <span>Spieler: {spieler.id}</span>
                        <span>
                          {schlange.karten.length > 0 ? kartenIds(schlange.karten) : 'keine Karten'}
                        </span>
                        <span>Zustand: {schlange.zustand}</span>
                      </li>
                    )),
                  )}
                </ul>
              ) : (
                <p>Keine gegnerischen Schlangen.</p>
              )}
            </section>
          </section>
        </section>
        <section className="info-panel" aria-label="Material und Aufgaben">
          <h2>Material und Aufgaben</h2>
          <p>Ablagestapelgröße: {zustand.ablagestapel.length} Karten</p>
          <p>Ablagestapel: {zustand.ablagestapel.length > 0 ? kartenIds(zustand.ablagestapel) : 'keine'}</p>
          <p>Nachziehstapel: {zustand.nachziehstapel.length} Karten</p>
          <p>Materialstapel gesamt: {zustand.nachziehstapel.length + zustand.ablagestapel.length} Karten</p>
          <p>Sonderkarten: {basisSonderkartenLabel()}</p>
          <p>Erweiterungssonderkarten: {erweiterungsSonderkartenLabel()}</p>
          <p>Aufgabenstapel: {zustand.aufgabenStapel.length} Karten</p>
          <p>
            Offene Aufgaben:{' '}
            {zustand.offeneAufgaben.length > 0
              ? zustand.offeneAufgaben.map(a => `${a.name} (${aufgabenPunkteAnzeige(a, istEndspurt)})`).join(', ')
              : 'keine'}
          </p>
          <p>
            Offene Aufgaben-Details:{' '}
            {zustand.offeneAufgaben.length > 0
              ? zustand.offeneAufgaben.map(a => aufgabeLabel(a, istEndspurt)).join('; ')
              : 'keine'}
          </p>
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
          {gesamtwertung.spielerwertungen.map(eintrag => (
            <Fragment key={eintrag.spielerId}>
              <p>Wertung {eintrag.spielerId}: {eintrag.gesamtPunkte} Punkte</p>
              <p>
                Wertungsdetails {eintrag.spielerId}: Farbgruppen {eintrag.wertung.farbgruppenPunkte.gesamtPunkte} Punkte, Aufgaben {eintrag.wertung.aufgabenPunkte.gesamtPunkte} Punkte
              </p>
            </Fragment>
          ))}
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
        <AktionenPanel
          zustand={zustand}
          legaleAktionen={legaleAktionen}
          reaktionsAktionen={reaktionsAktionen}
          ueberhand={ueberhand}
          istSpielende={istSpielende}
          steuerung={aktiverSpieler.steuerung}
          aktionsLabel={aktionsLabel}
          pflichtschrittLabel={naechsterPflichtschrittLabel(zustand, legaleAktionen, ueberhand)}
          onAktionAusfuehren={fuhreAktionAus}
          onAusspielphaseBeenden={handleAusspielphaseBeenden}
          onAufgabenpruefungBeenden={handleAufgabenpruefungBeenden}
          onUeberzaehligeKartenAbwerfen={handleUeberzaehligeKartenAbwerfen}
          onZugBeenden={handleZugBeenden}
          onAusspielphaseStarten={handleAusspielphaseStarten}
        />
      </section>
    </main>
  )
}

export default App
