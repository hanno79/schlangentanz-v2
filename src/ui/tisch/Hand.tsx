import type { CSSProperties } from 'react'
import type { Spielkarte } from '../../engine'
import { Karte } from '../karten/Karte'
import { kartenname } from '../karten/kartentexte'
import type { EigeneAnsicht } from '../spiel/tischAnsicht'
import { wahlSchluessel } from '../spiel/auswahl'
import type { Wahl } from '../spiel/auswahl'
import { useZiele, zielDerArt } from './bedienung'
import type { Bedienung } from './bedienung'
import { KARTENGROESSE } from './groessen'
import { Ablage, Grube } from './Schlange'
import { TISCH, deineHandTitel } from './texte'
import { scrollFokus, useUeberlauf } from './ueberlauf'
import { Weiter } from './Weiter'
import { ZielKnopf } from './Ziele'
import { ZIELNAME, gesperrteKarte } from './zugtexte'

/*
Deine Hand, unten fest (Plan O4, O5). Die Karten teilen sich die Breite, damit
keine angeschnitten ist. Entscheidest du gerade über deine Karten, ist jede
Handkarte ein Knopf: Spielbar sind die Karten, die die Engine aufzählt; die
anderen sind gesperrt und sagen es im Namen. Die gewählte Karte ist gedrückt,
angehoben und umrandet. Hat die Karte kein Ziel, wird deine Ablage zum Ziel
(D13).

Sonst, und während des Abwerfens (das im Dialog läuft), zeigt die Hand nur an.

Mit der Erweiterung (O10) trifft eine Handkarte je nach Schritt eine andere
Wahl: Sie wird für Risiko-Aktion 2 angesagt (A8.2, D52), für „Zwei Karten
abwerfen, drei ziehen“ abgeworfen (D49) oder kommt beim Tausch des Korbs an
den Platz der gemerkten Karte der Schlange (D44). Welche, sagt `handwahl`.
*/

/** Die Wahl, die das Antippen dieser Handkarte jetzt trifft; `null`, wenn sie jetzt nichts trifft. */
function handwahl(bedienung: Bedienung, karteId: string): Wahl | null {
  const tausch = bedienung.tausch.mitHandkarte(karteId)
  if (tausch !== null) return tausch
  for (const wahl of [{ art: 'benannt', karteId }, { art: 'abwerfen', karteId }] as const) {
    if (bedienung.angeboten(wahl) || bedienung.gewaehlt(wahl)) return wahl
  }
  const karte: Wahl = { art: 'karte', karteId }
  return bedienung.spielbar(karteId) || bedienung.gewaehlt(karte) ? karte : null
}

export function Hand({ ich }: { ich: EigeneAnsicht }) {
  const anzahl = { '--hand-anzahl': ich.hand.length } as CSSProperties
  const [reihe, ueberlauf] = useUeberlauf<HTMLUListElement>()
  const kontext = useZiele()
  // Je Handkarte die Wahl, die ihr Antippen trifft, einmal je Zeichnen.
  const wahlen = kontext?.ausspielen === true ? ich.hand.map((karte) => handwahl(kontext, karte.id)) : []
  // Bei einer Entscheidung, die keine Handkarte braucht (etwa die Wahl des Gegners), zeigt die Hand nur an.
  const ohneHand = kontext?.entscheidet === true && wahlen.every((wahl) => wahl === null)
  const bedienung = kontext?.ausspielen === true && !ohneHand ? kontext : null
  const ablage = bedienung === null ? undefined : zielDerArt(bedienung.ziele, 'ablage')
  return (
    <section className="st-hand" aria-label={TISCH.deineHand}>
      <div className="st-hand-kopf">
        <h2 className="st-bereichstitel">{deineHandTitel(ich.hand.length)}</h2>
        {ich.gruben.map((grube) => (
          <Grube key={grube.karte.id} grube={grube} />
        ))}
        {ablage === undefined ? (
          <Ablage ablage={ich.ablage} eigene />
        ) : (
          <ZielKnopf wahl={ablage} name={ZIELNAME.ablage} klasse="st-ziel--ablage">
            <Ablage ablage={ich.ablage} eigene />
          </ZielKnopf>
        )}
      </div>
      {ich.hand.length === 0 ? (
        <p className="st-leer">{TISCH.keineHandkarte}</p>
      ) : (
        <div className="st-rolle">
          <ul ref={reihe} className="st-hand-karten st-scrollt" aria-label={TISCH.handkartenListe} style={anzahl} tabIndex={scrollFokus(ueberlauf)}>
            {ich.hand.map((karte, stelle) => (
              <li key={karte.id}>
                {bedienung === null ? <Karte karte={karte} sizes={KARTENGROESSE.hand} /> : <Handkarte karte={karte} wahl={wahlen[stelle]} bedienung={bedienung} />}
              </li>
            ))}
          </ul>
          <Weiter ueberlauf={ueberlauf} />
        </div>
      )}
    </section>
  )
}

function Handkarte({ karte, wahl, bedienung }: { karte: Spielkarte; wahl: Wahl | null; bedienung: Bedienung }) {
  const name = kartenname(karte)
  return (
    <button
      type="button"
      className="st-handkarte"
      aria-label={wahl === null ? gesperrteKarte(name) : name}
      aria-pressed={wahl === null ? undefined : bedienung.gewaehlt(wahl)}
      disabled={wahl === null}
      data-wahl={wahl === null ? undefined : wahlSchluessel(wahl)}
      onClick={() => wahl !== null && bedienung.tippe(wahl)}
    >
      <Karte karte={karte} sizes={KARTENGROESSE.hand} />
    </button>
  )
}
