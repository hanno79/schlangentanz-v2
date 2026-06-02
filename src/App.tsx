import { Fragment, useMemo, useState } from 'react'
import './App.css'
import {
  erstelleSpielzustand,
  starteAusspielphase,
  ermittleLegaleAktionen,
  anwendeAktion,
  beendeAusspielphase,
  beendeAufgabenpruefung,
  beendeZug,
  werfeUeberzaehligeHandkartenAb,
  HANDKARTENLIMIT,
  MINDESTHANDKARTEN,
  MAX_KARTEN_PRO_ZUG,
  berechneSpielzustandGesamtwertung,
  berechneGewinner,
  erstelleSonderkarten,
  erstelleErweiterungsSonderkarten,
} from './engine'
import type { AufgabenkarteInfo, GewinnerEintrag, SpielAktion, SpielerWertungsEintrag, Spielzustand } from './engine'

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
    case 'FarbenschutzSpielen':
      return `Farbenschutz mit Karte ${aktion.handkartenId} auf Schlange ${aktion.zielSchlangenId} spielen`
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

function phasenregeln(zugphase: Spielzustand['zugphase'], ueberhand: number): string[] {
  switch (zugphase) {
    case 'Nachziehphase':
      return [`Nachziehphase: Auf ${MINDESTHANDKARTEN} Handkarten nachziehen, falls unter ${MINDESTHANDKARTEN} und der Stapel noch Karten hat.`]
    case 'Ausspielphase':
      return [
        `Ausspielphase: Mindestens 1 Karte spielen oder abwerfen, höchstens ${MAX_KARTEN_PRO_ZUG} Karten insgesamt.`,
        'Pro Zug höchstens 1 Farbkarte und höchstens 1 Sonderkarte.',
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

interface AppProps {
  initialZustand?: Spielzustand
}

function App({ initialZustand }: AppProps) {
  const [zustand, setZustand] = useState(() =>
    initialZustand ?? starteAusspielphase(erstelleSpielzustand(2))
  )
  const [letzteAktion, setLetzteAktion] = useState<string | null>(null)
  const legaleAktionen = useMemo(() => ermittleLegaleAktionen(zustand), [zustand])
  const gesamtwertung = useMemo(() => berechneSpielzustandGesamtwertung(zustand), [zustand])
  const gewinnerErgebnis = useMemo(
    () => zustand.zugphase === 'Spielende' ? berechneGewinner(zustand.spieler) : null,
    [zustand.zugphase, zustand.spieler],
  )
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex]
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
      <section aria-label="Legale Aktionen">
        <section aria-label="Spielstatus">
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
        <section aria-label="Aktiver Spieler" aria-live="polite">
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
                  .map(k =>
                    k.typ === 'Farbkarte'
                      ? `${k.id} (Farbkarte ${k.farbe}, ${k.punkte} Punkte)`
                      : `${k.id} (Sonderkarte ${k.name})`
                  )
                  .join(', ')}
          </p>
        </section>
        <section aria-label="Spielerübersicht">
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
        </section>
        <section aria-label="Material und Aufgaben">
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
        </section>
        <section aria-label="Wertung">
          <h2>Wertung</h2>
          {gesamtwertung.spielerwertungen.map(eintrag => (
            <Fragment key={eintrag.spielerId}>
              <p>Wertung {eintrag.spielerId}: {eintrag.gesamtPunkte} Punkte</p>
              <p>
                Wertungsdetails {eintrag.spielerId}: Farbgruppen {eintrag.wertung.farbgruppenPunkte.gesamtPunkte} Punkte, Aufgaben {eintrag.wertung.aufgabenPunkte.gesamtPunkte} Punkte
              </p>
            </Fragment>
          ))}
          {gewinnerErgebnis && gewinnerErgebnis.gewinner.map(g => (
            <p key={g.spielerId}>Gewinner {g.spielerId}: {g.gesamtPunkte} Punkte</p>
          ))}
        </section>
        <section aria-label="Aktionen">
          <h2>Aktionen</h2>
          <p>Legale Aktionen: {legaleAktionen.length}</p>
          {istSpielende ? (
            <p>Keine weiteren Aktionen. Die Partie ist beendet.</p>
          ) : (
            <>
              <p>Nächster Pflichtschritt: {naechsterPflichtschrittLabel(zustand, legaleAktionen, ueberhand)}</p>
              <div className="aktions-liste">
                {aktiverSpieler.steuerung === 'KI' && legaleAktionen.length > 0 && (
                  <button onClick={() => fuhreAktionAus(legaleAktionen[0])}>
                    KI-Aktion ausführen
                  </button>
                )}
                {legaleAktionen.map((aktion: SpielAktion, index) => (
                  <button
                    key={aktionsLabel(aktion)}
                    className={index === 0 ? 'aktions-button--empfohlen' : undefined}
                    onClick={() => fuhreAktionAus(aktion)}
                  >
                    {aktionsLabel(aktion)}
                  </button>
                ))}
                {zustand.zugphase === 'Ausspielphase' && zustand.zugpflichten.gespielteKarten > 0 && (
                  <button onClick={() => {
                    setLetzteAktion('Ausspielphase beenden')
                    setZustand(z => beendeAusspielphase(z))
                  }}>
                    Ausspielphase beenden
                  </button>
                )}
                {zustand.zugphase === 'Aufgabenpruefung' && (
                  <button onClick={() => {
                    setLetzteAktion('Aufgabenprüfung beenden')
                    setZustand(z => beendeAufgabenpruefung(z, { aufgabenGeprueft: true }))
                  }}>
                    Aufgabenprüfung beenden
                  </button>
                )}
                {zustand.zugphase === 'Zugabschluss' && ueberhand > 0 && (
                  <button
                    onClick={() => {
                      setLetzteAktion('Überzählige Karten abwerfen')
                      setZustand(z =>
                        werfeUeberzaehligeHandkartenAb(z, { kartenIds: ueberhandAbwurfKartenIds(z) })
                      )
                    }}
                  >
                    Überzählige Karten abwerfen
                  </button>
                )}
                {zustand.zugphase === 'Zugabschluss' && ueberhand === 0 && (
                  <button onClick={() => {
                    setLetzteAktion('Zug beenden')
                    setZustand(z => beendeZug(z, { pflichtenErfuellt: true }))
                  }}>
                    Zug beenden
                  </button>
                )}
                {zustand.zugphase === 'Nachziehphase' && (
                  <button onClick={() => {
                    setLetzteAktion('Ausspielphase starten')
                    setZustand(z => starteAusspielphase(z))
                  }}>
                    Ausspielphase starten
                  </button>
                )}
              </div>
              <p>Gespielte Karten: {zustand.zugpflichten.gespielteKarten}/{MAX_KARTEN_PRO_ZUG}</p>
              <p>Gespielte Kartenarten: {zustand.zugpflichten.gespielteFarbkarten} Farbkarten, {zustand.zugpflichten.gespielteSonderkarten} Sonderkarten</p>
              {legaleAktionen.length === 0 && <p>Keine weiteren legalen Aktionen.</p>}
            </>
          )}
          <section aria-label="Phasenregeln">
            <h3>Phasenregeln</h3>
            <ul>
              {phasenregeln(zustand.zugphase, ueberhand).map(regel => (
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
          <p>Quelle: engine.ermittleLegaleAktionen</p>
        </section>
      </section>
    </main>
  )
}

export default App
