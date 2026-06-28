import { useMemo } from 'react'
import { berechneGewinner, berechneSpielzustandGesamtwertung } from '../engine'
import type { GewinnerEintrag, SpielerWertungsEintrag, Spielzustand } from '../engine'
import type { KiGegnerAnzahl } from './SonnigesNestLobby'

interface SiegerPartyProps {
  zustand: Spielzustand
  onNeuesSpiel: (kiGegner: KiGegnerAnzahl) => void
}

function spielerNameFuerId(zustand: Spielzustand, spielerId: string): string {
  return zustand.spieler.find(spieler => spieler.id === spielerId)?.name ?? spielerId
}

function aktiveKiGegner(zustand: Spielzustand): KiGegnerAnzahl {
  const kiAnzahl = zustand.spieler.filter(spieler => spieler.steuerung === 'KI').length
  return Math.max(1, Math.min(3, kiAnzahl)) as KiGegnerAnzahl
}

function gewinnerNamen(zustand: Spielzustand, gewinner: GewinnerEintrag[]): string {
  if (gewinner.length === 0) return 'noch offen'
  return gewinner.map(eintrag => spielerNameFuerId(zustand, eintrag.spielerId)).join(', ')
}

function findeFinaleWertung(wertungen: SpielerWertungsEintrag[], gewinner: GewinnerEintrag[]): SpielerWertungsEintrag | null {
  return wertungen.find(eintrag => eintrag.spielerId === gewinner[0]?.spielerId) ?? wertungen[0] ?? null
}

function SiegerParty({ zustand, onNeuesSpiel }: SiegerPartyProps) {
  const gesamtwertung = useMemo(() => berechneSpielzustandGesamtwertung(zustand), [zustand])
  const gewinnerErgebnis = useMemo(() => berechneGewinner(zustand.spieler), [zustand.spieler])

  if (zustand.zugphase !== 'Spielende') return null

  const gewinner = gewinnerErgebnis.gewinner
  const finaleWertung = findeFinaleWertung(gesamtwertung.spielerwertungen, gewinner)
  const gewinnerLabel = gewinnerNamen(zustand, gewinner)
  const ergebnisLabel = gewinner.length > 1 ? 'Gleichstand' : `Sieg für ${gewinnerLabel}`
  const farbgruppenPunkte = finaleWertung?.wertung.farbgruppenPunkte.gesamtPunkte ?? 0
  const aufgabenPunkte = finaleWertung?.wertung.aufgabenPunkte.gesamtPunkte ?? 0
  const gesamtPunkte = finaleWertung?.gesamtPunkte ?? 0

  const konfettiStuecke = Array.from({ length: 10 }, (_, i) => i)
  const ballonStuecke = Array.from({ length: 6 }, (_, i) => i)

  return (
    <section className="sieger-party" aria-label="Sieger-Party">
      <div className="sieger-party__konfetti" aria-hidden="true">
        {konfettiStuecke.map(i => (
          <span key={i} className={`sieger-party__konfetti-stueck sieger-party__konfetti-stueck--${i % 4}`} />
        ))}
      </div>
      <div className="sieger-party__ballons" aria-hidden="true">
        {ballonStuecke.map(i => (
          <span key={i} className={`sieger-party__ballon sieger-party__ballon--${i % 3}`} />
        ))}
      </div>
      <div className="sieger-party__kopf">
        <p className="sieger-party__eyebrow">Finale Waldlichtung</p>
        <h2>Schlangentanz!</h2>
        <p className="sieger-party__ergebnis">{ergebnisLabel}</p>
      </div>
      <div className="sieger-party__portrait" role="region" aria-label="Gewinner-Portrait">
        <span className="sieger-party__korona" aria-hidden="true" />
        <span className="sieger-party__krone" aria-hidden="true">👑</span>
        <span className="sieger-party__schlange" aria-hidden="true">🐍</span>
        <span className="sieger-party__pokal" aria-hidden="true">🏆</span>
        <span className="sieger-party__leaderboard-badge" aria-hidden="true">🏅</span>
      </div>
      <div className="sieger-party__scorekarte">
        <h3>Finale Punktetafel</h3>
        <p>Gewinner: {gewinnerLabel}</p>
        <dl className="sieger-party__stats">
          <div>
            <dt>Gesamtpunkte</dt>
            <dd className="sieger-party__scorewert">{gesamtPunkte}</dd>
          </div>
          <div>
            <dt>Farbgruppen</dt>
            <dd className="sieger-party__scorewert">{farbgruppenPunkte}</dd>
          </div>
          <div>
            <dt>Aufgaben</dt>
            <dd className="sieger-party__scorewert">{aufgabenPunkte}</dd>
          </div>
        </dl>
      </div>
      <button className="sieger-party__neustart" type="button" onClick={() => onNeuesSpiel(aktiveKiGegner(zustand))}>
        <span className="sieger-party__neustart-icon" aria-hidden="true">↻</span>
        Noch einmal spielen
      </button>
    </section>
  )
}

export default SiegerParty
