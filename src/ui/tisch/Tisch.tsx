import '../tokens.css'
import './tisch.css'
import './karten.css'
import './quer.css'
import './bedienung.css'
import { useState } from 'react'
import type { SpielAktion } from '../../engine'
import { Grossansicht } from '../karten/Grossansicht'
import { Karte, Kartenrueckseite } from '../karten/Karte'
import type { Bildkarte } from '../karten/kartenbilder'
import { kartenname } from '../karten/kartentexte'
import Verweis from '../lobby/Verweis'
import type { EigeneAnsicht, StatusAnsicht, TischAnsicht } from '../spiel/tischAnsicht'
import { useBedienung, ZielKontext } from './bedienung'
import { Gegner } from './Gegner'
import { Hand } from './Hand'
import { GrossKnopf } from './Kartenknopf'
import { useUeberlauf } from './ueberlauf'
import { UeberhandDialog } from './UeberhandDialog'
import { Weiter } from './Weiter'
import { KARTENGROESSE } from './groessen'
import { Schlangen } from './Schlange'
import { TISCH, geheimeAufgabeName, statusText } from './texte'
import { NeueSchlangeZiel } from './Ziele'
import { Zugleiste } from './Zugleiste'

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
Zugleiste steht unten bei deinem Platz (DESIGN.md „Zugleiste“).
*/

interface TischEigenschaften {
  ansicht: TischAnsicht
  /** Führt eine Aktion des Menschen aus, eine aus `ansicht.aktionen` (useSpiel). */
  fuehreAus: (aktion: SpielAktion) => void
  /** Der Grund, wenn die Engine die letzte Aktion des Menschen abgelehnt hat. */
  ablehnung: string | null
}

export function Tisch({ ansicht, fuehreAus, ablehnung }: TischEigenschaften) {
  const bedienung = useBedienung(ansicht.aktionen)
  const [gross, setzeGross] = useState<Bildkarte | null>(null)
  // Der Dialog zum Abwerfen ist offen, bis du ihn für diesen Stand schliesst.
  const [abwerfenZu, setzeAbwerfenZu] = useState<SpielAktion[] | null>(null)
  const [flaeche, flaecheUeberlauf] = useUeberlauf<HTMLDivElement>()
  return (
    <ZielKontext.Provider value={bedienung}>
    <div className={bedienung.ziele.length > 0 ? 'spieltisch spieltisch--zielwahl' : 'spieltisch'} data-testid="spiel">
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
      <div ref={flaeche} className="st-flaeche">
        <section className="st-gegnerliste" aria-label={TISCH.gegner}>
          {ansicht.gegner.map((gegner) => (
            <Gegner key={gegner.id} gegner={gegner} />
          ))}
        </section>
        <Mitte ansicht={ansicht} zeigeGross={setzeGross} />
        {ansicht.erweiterung && <Auslage ich={ansicht.ich} zeigeGross={setzeGross} />}
      </div>
      <Weiter ueberlauf={flaecheUeberlauf} />
      </div>

      <section className="st-unten" aria-label={TISCH.deinPlatz}>
        <section className="st-eigene" aria-label={TISCH.deineSchlangen}>
          <div className="st-eigene-kopf">
            <h2 className="st-bereichstitel">{TISCH.deineSchlangen}</h2>
            <NeueSchlangeZiel />
          </div>
          <Schlangen schlangen={ansicht.ich.schlangen} besitzer={{ name: ansicht.ich.name, ich: true }} groesse={KARTENGROESSE.eigene} />
        </section>
        <Hand ich={ansicht.ich} />
      </section>

      <Zugleiste
        ansicht={ansicht}
        bedienung={bedienung}
        fuehreAus={fuehreAus}
        ablehnung={ablehnung}
        zeigeGross={setzeGross}
        oeffneAbwerfen={() => setzeAbwerfenZu(null)}
      />

      {gross !== null && <Grossansicht karte={gross} schliesse={() => setzeGross(null)} />}
      {bedienung.abwerfen > 0 && abwerfenZu !== ansicht.aktionen && (
        <UeberhandDialog hand={ansicht.ich.hand} bedienung={bedienung} fuehreAus={fuehreAus} schliesse={() => setzeAbwerfenZu(ansicht.aktionen)} />
      )}
    </div>
    </ZielKontext.Provider>
  )
}

/** Wer ist dran, was steht an; wird vorgelesen, wenn es sich ändert. */
function Statuszeile({ status }: { status: StatusAnsicht }) {
  const { titel, text } = statusText(status)
  return (
    <div className="st-statuszeile" role="status" aria-live="polite">
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

/** Was mit Erweiterung offen vor dem Menschen liegt: geheime Aufgabe, Comeback- und Risiko-Karten (A4). */
function Auslage({ ich, zeigeGross }: { ich: EigeneAnsicht; zeigeGross: (karte: Bildkarte) => void }) {
  return (
    <section className="st-auslage" aria-label={TISCH.auslage}>
      <h2 className="st-bereichstitel">{TISCH.auslage}</h2>
      <ul className="st-kartenreihe">
        {ich.geheimeAufgabe !== null && (
          <li className="st-mit-unterschrift">
            <GrossKnopf karte={ich.geheimeAufgabe} name={geheimeAufgabeName(kartenname(ich.geheimeAufgabe))} zeigeGross={zeigeGross} />
            <span>{TISCH.geheim}</span>
          </li>
        )}
        {ich.comeback !== null && (
          <li className="st-mit-unterschrift">
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
