import { Karte } from '../karten/Karte'
import type { AblageAnsicht, GrubeAnsicht, KarteInSchlange, Person, SchlangeAnsicht } from '../spiel/tischAnsicht'
import { KARTENGROESSE } from './groessen'
import { TISCH, ablageText, grubeText, schlangenName, schlangenTitel } from './texte'

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
 */
export function Schlange({ schlange, titel, groesse }: { schlange: SchlangeAnsicht; titel: string; groesse: string }) {
  return (
    <ol className="st-schlange" aria-label={schlangenName(titel, schlange.karten.length, schlange.farbgruppen)}>
      {schlange.karten.map((glied) => (
        <li key={glied.karte.id} className={gliedKlasse(glied)} data-gruppe={glied.gruppe?.farbe}>
          <Karte karte={glied.karte} sizes={groesse} />
          {glied.unter !== null && (
            <span className="st-fusion-unter" role="group" aria-label={TISCH.unterFusion}>
              <Karte karte={glied.unter[0]} sizes={groesse} />
              <Karte karte={glied.unter[1]} sizes={groesse} />
            </span>
          )}
        </li>
      ))}
    </ol>
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
