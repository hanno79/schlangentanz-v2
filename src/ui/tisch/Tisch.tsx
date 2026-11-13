import '../tokens.css'
import './tisch.css'
import './karten.css'
import type { CSSProperties } from 'react'
import { useState } from 'react'
import { Karte, Kartenrueckseite } from '../karten/Karte'
import type { Bildkarte } from '../karten/kartenbilder'
import { kartenname } from '../karten/kartentexte'
import Verweis from '../lobby/Verweis'
import type { EigeneAnsicht, StatusAnsicht, TischAnsicht } from '../spiel/tischAnsicht'
import { Gegner } from './Gegner'
import { GrossKnopf, Lupe } from './Lupe'
import { KARTENGROESSE } from './groessen'
import { Ablage, Grube, Schlangen } from './Schlange'
import { TISCH, deineHandTitel, geheimeAufgabeName, statusText } from './texte'

/*
Der Spieltisch (Plan O4, DESIGN.md „Tisch“). Feste Sicht: Der Mensch sitzt
immer unten. Von oben nach unten: Statuszeile, Tischfläche mit Gegnern,
Tischmitte und Auslage (scrollt), unten fest der eigene Platz mit Schlangen,
Hand und Ablagestapel. Im Querformat niedriger Schirme steht der eigene Platz
rechts neben der Tischfläche, damit für beide Höhe bleibt.

Der Tisch zeigt nur an. Was er zeigt, kommt aus der Sicht des Menschen
(`tischAnsicht`), nie aus dem vollen Zustand.
*/

export function Tisch({ ansicht }: { ansicht: TischAnsicht }) {
  const [gross, setzeGross] = useState<Bildkarte | null>(null)
  return (
    <div className="tisch" data-testid="spiel">
      <header className="tisch-kopf">
        <Statuszeile status={ansicht.status} />
        <Verweis ziel="lobby" className="tisch-knopf">
          {TISCH.zurLobby}
        </Verweis>
      </header>

      <div className="tisch-flaeche">
        <section className="gegnerliste" aria-label={TISCH.gegner}>
          {ansicht.gegner.map((gegner) => (
            <Gegner key={gegner.id} gegner={gegner} />
          ))}
        </section>
        <Mitte ansicht={ansicht} zeigeGross={setzeGross} />
        {ansicht.erweiterung && <Auslage ich={ansicht.ich} zeigeGross={setzeGross} />}
      </div>

      <section className="tisch-unten" aria-label={TISCH.deinPlatz}>
        <section className="eigene" aria-label={TISCH.deineSchlangen}>
          <h2 className="bereichstitel">{TISCH.deineSchlangen}</h2>
          <Schlangen schlangen={ansicht.ich.schlangen} besitzer={{ name: ansicht.ich.name, ich: true }} groesse={KARTENGROESSE.eigene} />
        </section>
        <Hand ich={ansicht.ich} />
      </section>

      {gross !== null && <Lupe karte={gross} schliesse={() => setzeGross(null)} />}
    </div>
  )
}

/** Wer ist dran, was steht an; wird vorgelesen, wenn es sich ändert. */
function Statuszeile({ status }: { status: StatusAnsicht }) {
  const { titel, text } = statusText(status)
  return (
    <div className="statuszeile" role="status" aria-live="polite">
      <span className="statuszeile-titel">{titel}</span>
      {status.partiephase === 'Schlussrunde' && <span className="abzeichen">{TISCH.schlussrunde}</span>}
      {text !== '' && <span className="statuszeile-text">{text}</span>}
    </div>
  )
}

function Mitte({ ansicht, zeigeGross }: { ansicht: TischAnsicht; zeigeGross: (karte: Bildkarte) => void }) {
  return (
    <section className="mitte" aria-label={TISCH.mitte}>
      <div className="stapel">
        {ansicht.nachziehstapel > 0 ? (
          <>
            <Kartenrueckseite />
            <span>
              {TISCH.nachziehstapel} <strong>{ansicht.nachziehstapel}</strong>
            </span>
          </>
        ) : (
          <span className="leer">{TISCH.nachziehstapelLeer}</span>
        )}
      </div>
      {ansicht.erweiterung && (
        <section className="aufgaben" aria-label={TISCH.offeneAufgaben}>
          <h2 className="bereichstitel">{TISCH.offeneAufgaben}</h2>
          <ul className="kartenreihe">
            {ansicht.offeneAufgaben.map((aufgabe) => (
              <li key={aufgabe.id}>
                <GrossKnopf karte={aufgabe} zeigeGross={zeigeGross} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  )
}

/** Was mit Erweiterung offen vor dem Menschen liegt: geheime Aufgabe, Comeback- und Risiko-Karten (A4). */
function Auslage({ ich, zeigeGross }: { ich: EigeneAnsicht; zeigeGross: (karte: Bildkarte) => void }) {
  return (
    <section className="auslage" aria-label={TISCH.auslage}>
      <h2 className="bereichstitel">{TISCH.auslage}</h2>
      <ul className="kartenreihe">
        {ich.geheimeAufgabe !== null && (
          <li className="mit-unterschrift">
            <GrossKnopf karte={ich.geheimeAufgabe} name={geheimeAufgabeName(kartenname(ich.geheimeAufgabe))} zeigeGross={zeigeGross} />
            <span>{TISCH.geheim}</span>
          </li>
        )}
        {ich.comeback !== null && (
          <li className="mit-unterschrift">
            <Karte karte={ich.comeback.karte} sizes={KARTENGROESSE.eigene} />
            {ich.comeback.verbraucht && <span>{TISCH.verbraucht}</span>}
          </li>
        )}
        {ich.risikoKarten.map((karte) => (
          <li key={karte.id}>
            <Karte karte={karte} sizes={KARTENGROESSE.eigene} />
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Deine Hand, unten fest; die Karten teilen sich die Breite, damit keine angeschnitten ist. */
function Hand({ ich }: { ich: EigeneAnsicht }) {
  const anzahl = { '--hand-anzahl': ich.hand.length } as CSSProperties
  return (
    <section className="hand" aria-label={TISCH.deineHand}>
      <div className="hand-kopf">
        <h2 className="bereichstitel">{deineHandTitel(ich.hand.length)}</h2>
        {ich.gruben.map((grube) => (
          <Grube key={grube.karte.id} grube={grube} />
        ))}
        <Ablage ablage={ich.ablage} eigene />
      </div>
      {ich.hand.length === 0 ? (
        <p className="leer">{TISCH.keineHandkarte}</p>
      ) : (
        <ul className="hand-karten" aria-label={TISCH.handkartenListe} style={anzahl}>
          {ich.hand.map((karte) => (
            <li key={karte.id}>
              <Karte karte={karte} sizes={KARTENGROESSE.hand} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
