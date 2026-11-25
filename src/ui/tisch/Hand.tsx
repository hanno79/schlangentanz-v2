import type { CSSProperties } from 'react'
import type { Spielkarte } from '../../engine'
import { Karte } from '../karten/Karte'
import { kartenname } from '../karten/kartentexte'
import type { EigeneAnsicht } from '../spiel/tischAnsicht'
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
*/

export function Hand({ ich }: { ich: EigeneAnsicht }) {
  const anzahl = { '--hand-anzahl': ich.hand.length } as CSSProperties
  const [reihe, ueberlauf] = useUeberlauf<HTMLUListElement>()
  const kontext = useZiele()
  const bedienung = kontext?.ausspielen === true ? kontext : null
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
            {ich.hand.map((karte) => (
              <li key={karte.id}>{bedienung === null ? <Karte karte={karte} sizes={KARTENGROESSE.hand} /> : <Handkarte karte={karte} bedienung={bedienung} />}</li>
            ))}
          </ul>
          <Weiter ueberlauf={ueberlauf} />
        </div>
      )}
    </section>
  )
}

function Handkarte({ karte, bedienung }: { karte: Spielkarte; bedienung: Bedienung }) {
  const name = kartenname(karte)
  const spielbar = bedienung.spielbar(karte.id)
  return (
    <button
      type="button"
      className="st-handkarte"
      aria-label={spielbar ? name : gesperrteKarte(name)}
      aria-pressed={spielbar ? bedienung.karteId === karte.id : undefined}
      disabled={!spielbar}
      onClick={() => bedienung.tippe({ art: 'karte', karteId: karte.id })}
    >
      <Karte karte={karte} sizes={KARTENGROESSE.hand} />
    </button>
  )
}
