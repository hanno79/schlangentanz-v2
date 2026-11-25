import '../tokens.css'
import './tisch.css'
import './karten.css'
import './quer.css'
import './bedienung.css'
import './protokoll.css'
import './erweiterung.css'
import { useState } from 'react'
import type { SpielAktion } from '../../engine'
import { Grossansicht } from '../karten/Grossansicht'
import { Kartenrueckseite } from '../karten/Karte'
import type { Bildkarte } from '../karten/kartenbilder'
import Verweis from '../lobby/Verweis'
import type { Haeutungsvorschauer } from '../spiel/haeutungsvorschau'
import type { StatusAnsicht, TischAnsicht } from '../spiel/tischAnsicht'
import type { Verlauf } from '../spiel/useSpiel'
import { Aufgedeckt, Auslage } from './Auslage'
import { useBedienung, ZielKontext } from './bedienung'
import { Gegner } from './Gegner'
import { HaeutungKontext, useHaeutung } from './haeutung'
import { Hand } from './Hand'
import { GrossKnopf } from './Kartenknopf'
import { useFokusHalten } from './fokus'
import { scrollFokus, useUeberlauf } from './ueberlauf'
import { UeberhandDialog } from './UeberhandDialog'
import { Weiter } from './Weiter'
import { KARTENGROESSE } from './groessen'
import { Punkte, Schlangen } from './Schlange'
import { TISCH, statusText } from './texte'
import { NeueSchlangeZiel } from './Ziele'
import { Zugleiste } from './Zugleiste'
import { Zugprotokoll } from './Zugprotokoll'

/*
Der Spieltisch (Plan O4, DESIGN.md „Tisch“). Feste Sicht: Der Mensch sitzt
immer unten. Von oben nach unten: Statuszeile, Tischfläche mit Gegnern,
Tischmitte und Auslage (scrollt), unten fest der eigene Platz mit Schlangen,
Hand und Ablagestapel. Im Querformat niedriger Schirme steht der eigene Platz
über die ganze Höhe rechts neben der Tischfläche, damit für beide Höhe bleibt.
Die Zahl des Nachziehstapels steht auch in der Kopfleiste, damit man sie ohne
Scrollen liest.

Was der Tisch zeigt, kommt aus der Sicht des Menschen (`tischAnsicht`), nie
aus dem vollen Zustand. Bedienen lässt er sich mit O5: Karte wählen, Ziel
wählen, Ansage bestätigen; die Bedienung liegt im Kontext der Ziele, die
Zugleiste steht unten bei deinem Platz (DESIGN.md „Zugleiste“). Eine laufende
Schlangenhäutung (O7) liegt in einem eigenen Kontext. Mit O6 kommen
Abwehrfrage, Protokoll und „Schneller“ dazu; sie brauchen den Verlauf der
Partie (`useSpiel`). Ein Tisch ohne Verlauf zeigt nur den Stand.

Mit O11 hält der Tisch den Fokus bei sich (`useFokusHalten`), und jeder
Bereich, der gerade scrollt, nimmt den Fokus an, damit er sich auch mit den
Pfeiltasten scrollen lässt.
*/

interface TischEigenschaften {
  ansicht: TischAnsicht
  /** Führt eine Aktion des Menschen aus, eine aus `ansicht.aktionen` (useSpiel). */
  fuehreAus: (aktion: SpielAktion) => void
  /** Der Grund, wenn die Engine die letzte Aktion des Menschen abgelehnt hat. */
  ablehnung: string | null
  /** Was eine Schlangenhäutung bringt, aus dem Zwischenstand der Engine (useSpiel, O7). */
  haeutungsVorschau: Haeutungsvorschauer
  /** Protokoll, Aussetzen und „Schneller“ der laufenden Partie (O6); ohne ihn zeigt der Tisch nur den Stand. */
  verlauf?: Verlauf
}

export function Tisch({ ansicht, fuehreAus, ablehnung, haeutungsVorschau, verlauf }: TischEigenschaften) {
  const bedienung = useBedienung(ansicht.aktionen, ansicht.entscheidung?.art ?? null)
  const haeutung = useHaeutung(bedienung, ansicht, haeutungsVorschau)
  const [gross, setzeGross] = useState<Bildkarte | null>(null)
  // Der Dialog zum Abwerfen ist offen, bis du ihn für diesen Stand schliesst.
  const [abwerfenZu, setzeAbwerfenZu] = useState<SpielAktion[] | null>(null)
  const [flaeche, flaecheUeberlauf] = useUeberlauf<HTMLDivElement>()
  const wurzel = useFokusHalten()
  return (
    <ZielKontext.Provider value={bedienung}>
    <HaeutungKontext.Provider value={haeutung}>
    <div ref={wurzel} className={bedienung.ziele.length > 0 ? 'spieltisch spieltisch--zielwahl' : 'spieltisch'} data-testid="spiel">
      <header className="st-kopf">
        <Statuszeile status={ansicht.status} />
        <p className="st-kopf-stapel">
          {TISCH.stapel} <strong>{ansicht.nachziehstapel > 0 ? ansicht.nachziehstapel : TISCH.leer}</strong>
        </p>
        <Verweis ziel="lobby" className="st-knopf">
          {TISCH.zurLobby}
        </Verweis>
      </header>

      <div className="st-flaeche-rahmen">
      <div ref={flaeche} className="st-flaeche st-scrollt" role="region" aria-label={TISCH.flaeche} tabIndex={scrollFokus(flaecheUeberlauf)}>
        <section className="st-gegnerliste" aria-label={TISCH.gegner}>
          {ansicht.gegner.map((gegner) => (
            <Gegner key={gegner.id} gegner={gegner} />
          ))}
        </section>
        <Mitte ansicht={ansicht} zeigeGross={setzeGross} />
        {ansicht.erweiterung && <Auslage ich={ansicht.ich} zeigeGross={setzeGross} />}
        {verlauf !== undefined && <Zugprotokoll verlauf={verlauf} />}
      </div>
      <Weiter ueberlauf={flaecheUeberlauf} />
      </div>

      {/* Vor deinem Platz: So folgt die Tab-Reihe dem Bild in Handy hochkant (Leiste über den Schlangen)
          und Handy quer (Leiste links unter der Tischfläche), und der Satz, was zu tun ist, kommt vor den Karten (O11 K1). */}
      <Zugleiste
        ansicht={ansicht}
        bedienung={bedienung}
        fuehreAus={fuehreAus}
        ablehnung={ablehnung}
        verlauf={verlauf}
        zeigeGross={setzeGross}
        oeffneAbwerfen={() => setzeAbwerfenZu(null)}
      />

      <section className="st-unten" aria-label={TISCH.deinPlatz}>
        <section className="st-eigene" aria-label={TISCH.deineSchlangen}>
          <div className="st-eigene-kopf">
            <h2 className="st-bereichstitel">{TISCH.deineSchlangen}</h2>
            <Punkte punkte={ansicht.ich.punkte} />
            <NeueSchlangeZiel />
          </div>
          <Schlangen schlangen={ansicht.ich.schlangen} besitzer={{ name: ansicht.ich.name, ich: true }} groesse={KARTENGROESSE.eigene} />
        </section>
        <Hand ich={ansicht.ich} />
      </section>

      {gross !== null && <Grossansicht karte={gross} schliesse={() => setzeGross(null)} />}
      {bedienung.abwerfen > 0 && abwerfenZu !== ansicht.aktionen && (
        <UeberhandDialog hand={ansicht.ich.hand} bedienung={bedienung} fuehreAus={fuehreAus} schliesse={() => setzeAbwerfenZu(ansicht.aktionen)} />
      )}
    </div>
    </HaeutungKontext.Provider>
    </ZielKontext.Provider>
  )
}

/**
 * Wer ist dran, was steht an. Vorgelesen wird es nicht von selbst
 * (`aria-live="off"`): Wer dran ist und was zu entscheiden ist, sagt der
 * Ansager in der Zugleiste schon (O11 K2); zweimal dasselbe hilft niemandem.
 */
function Statuszeile({ status }: { status: StatusAnsicht }) {
  const { titel, text } = statusText(status)
  return (
    <div className="st-statuszeile" role="status" aria-live="off">
      <span className="st-statuszeile-titel">{titel}</span>
      {status.partiephase === 'Schlussrunde' && <span className="st-abzeichen">{TISCH.schlussrunde}</span>}
      {text !== '' && <span className="st-statuszeile-text">{text}</span>}
    </div>
  )
}

function Mitte({ ansicht, zeigeGross }: { ansicht: TischAnsicht; zeigeGross: (karte: Bildkarte) => void }) {
  return (
    <section className="st-mitte" aria-label={TISCH.mitte}>
      <div className="st-stapel">
        {ansicht.nachziehstapel > 0 ? (
          <>
            <Kartenrueckseite />
            <span>
              {TISCH.nachziehstapel} <strong>{ansicht.nachziehstapel}</strong>
            </span>
          </>
        ) : (
          <span className="st-leer">{TISCH.nachziehstapelLeer}</span>
        )}
      </div>
      <Aufgedeckt ansicht={ansicht} />
      {ansicht.erweiterung && (
        <section className="st-aufgaben" aria-label={TISCH.offeneAufgaben}>
          <h2 className="st-bereichstitel">{TISCH.offeneAufgaben}</h2>
          <ul className="st-kartenreihe">
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
