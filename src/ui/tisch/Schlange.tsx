import { Fragment } from 'react'
import { Karte } from '../karten/Karte'
import type { Wahl } from '../spiel/auswahl'
import type { AblageAnsicht, GrubeAnsicht, KarteInSchlange, Person, SchlangeAnsicht } from '../spiel/tischAnsicht'
import { KARTENGROESSE } from './groessen'
import { useUeberlauf } from './ueberlauf'
import { Weiter } from './Weiter'
import { TISCH, ablageText, grubeText, schlangenName, schlangenTitel } from './texte'
import { useZiele, zielDerArt, zieleDerSchlange } from './bedienung'
import { ZielKnopf } from './Ziele'
import { ZIELNAME } from './zugtexte'

/*
Bausteine, die beim Menschen und bei den Gegnern gleich aussehen: Schlangen,
Ablagestapel und eine ausliegende Schlangengrube. Die Grösse der Karten setzt
der umgebende Bereich (`--karte-breite` im CSS); `groesse` sagt dem Browser
dieselbe Obergrenze, damit er die passende Bildfassung lädt.
*/

function gliedKlasse({ gruppe }: KarteInSchlange): string | undefined {
  const klassen = [
    gruppe !== null ? 'st-in-gruppe' : '',
    gruppe?.anfang ? 'st-gruppe-anfang' : '',
    gruppe?.ende ? 'st-gruppe-ende' : '',
  ].filter(Boolean)
  return klassen.length === 0 ? undefined : klassen.join(' ')
}

/**
 * Eine Schlange als Reihe von Karten. Karten einer Farbgruppe tragen einen
 * durchgehenden Balken darunter, eine Farbenfusion zeigt die zwei Karten, auf
 * denen sie liegt. Der zugängliche Name sagt beides in Worten.
 *
 * Während der Zielwahl (O5) stehen hier die Ziele dieser Schlange: Felder „+“
 * an den Enden oder in den Lücken, Karten als Knöpfe, oder die ganze Schlange
 * als ein Ziel. Felder, die keine Karte sind, tragen `data-zielplatz`.
 */
export function Schlange({ schlange, titel, groesse }: { schlange: SchlangeAnsicht; titel: string; groesse: string }) {
  const [zeile, ueberlauf] = useUeberlauf<HTMLOListElement>()
  const bedienung = useZiele()
  const ziele = zieleDerSchlange(bedienung, schlange.id)
  const laenge = schlange.karten.length
  const ende = (seite: 'anfang' | 'ende') => {
    const wahl = zielDerArt(ziele, 'schlangenende', (ziel) => ziel.seite === seite)
    return wahl === undefined ? null : <Feld wahl={wahl} name={ZIELNAME.ende(titel, seite)} klasse="st-ziel--ende" />
  }
  const luecke = (position: number) => {
    const wahl = zielDerArt(ziele, 'luecke', (ziel) => ziel.position === position)
    return wahl === undefined ? null : <Feld wahl={wahl} name={ZIELNAME.luecke(titel, position, laenge)} klasse="st-ziel--luecke" />
  }
  const ganze = zielDerArt(ziele, 'schlange')
  const ganzeGewaehlt = ganze !== undefined && bedienung !== null && bedienung.gewaehlt(ganze)
  return (
    <div className={ganzeGewaehlt ? 'st-rolle st-rolle--gewaehlt' : 'st-rolle'}>
    <ol ref={zeile} className={ziele.length > 0 ? 'st-schlange st-schlange--ziele' : 'st-schlange'} aria-label={schlangenName(titel, laenge, schlange.farbgruppen)}>
      {ende('anfang')}
      {schlange.karten.map((glied, stelle) => {
        const karte = zielDerArt(ziele, 'schlangenkarte', (ziel) => ziel.karteId === glied.karte.id)
        return (
          <Fragment key={glied.karte.id}>
            {luecke(stelle)}
            <li className={gliedKlasse(glied)} data-gruppe={glied.gruppe?.farbe}>
              {karte === undefined ? (
                <Karte karte={glied.karte} sizes={groesse} />
              ) : (
                <ZielKnopf wahl={karte} name={ZIELNAME.karte(titel, stelle + 1, glied.karte)} klasse="st-ziel--karte">
                  <Karte karte={glied.karte} sizes={groesse} />
                </ZielKnopf>
              )}
              {glied.unter !== null && (
                <span className="st-fusion-unter" role="group" aria-label={TISCH.unterFusion}>
                  <Karte karte={glied.unter[0]} sizes={groesse} />
                  <Karte karte={glied.unter[1]} sizes={groesse} />
                </span>
              )}
            </li>
          </Fragment>
        )
      })}
      {luecke(laenge)}
      {ende('ende')}
    </ol>
    <Weiter ueberlauf={ueberlauf} />
    {ganze !== undefined && !ganzeGewaehlt && <ZielKnopf wahl={ganze} name={ZIELNAME.schlange(titel)} klasse="st-ziel--schlange" />}
    </div>
  )
}

/** Ein Feld „+“ in der Reihe einer Schlange: ein Ende oder eine Lücke. */
function Feld({ wahl, name, klasse }: { wahl: Wahl; name: string; klasse: string }) {
  return (
    <li className="st-zielplatz" data-zielplatz="">
      <ZielKnopf wahl={wahl} name={name} klasse={klasse}>
        <span aria-hidden="true">+</span>
      </ZielKnopf>
    </li>
  )
}

/** Alle Schlangen eines Spielers, oder ein Satz, wenn er noch keine hat. */
export function Schlangen({ schlangen, besitzer, groesse }: { schlangen: SchlangeAnsicht[]; besitzer: Person; groesse: string }) {
  if (schlangen.length === 0) return <p className="st-leer">{TISCH.keineSchlange}</p>
  return (
    <div className="st-schlangen">
      {schlangen.map((schlange, index) => (
        <Schlange key={schlange.id} schlange={schlange} titel={schlangenTitel(besitzer, index + 1)} groesse={groesse} />
      ))}
    </div>
  )
}

/** Ein Ablagestapel: oberste Karte und Anzahl; leer nur als Text. */
export function Ablage({ ablage, eigene }: { ablage: AblageAnsicht; eigene: boolean }) {
  return (
    <span className="st-ablage">
      {ablage.oben !== null && <Karte karte={ablage.oben} sizes={KARTENGROESSE.klein} />}
      <span>{ablageText(ablage.anzahl, eigene)}</span>
    </span>
  )
}

/** Eine Schlangengrube, die vor einem Spieler liegt, bis er ausgesetzt hat (A7.6). */
export function Grube({ grube }: { grube: GrubeAnsicht }) {
  return (
    <span className="st-grube">
      <Karte karte={grube.karte} sizes={KARTENGROESSE.klein} />
      <span>{grubeText(grube.von)}</span>
    </span>
  )
}
