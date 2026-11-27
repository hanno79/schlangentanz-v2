import { Karte, Kartenrueckseite } from '../karten/Karte'
import type { Bildkarte } from '../karten/kartenbilder'
import { kartenname } from '../karten/kartentexte'
import type { EigeneAnsicht, GegnerAnsicht, TischAnsicht } from '../spiel/tischAnsicht'
import { useZiele } from './bedienung'
import { ERWEITERUNG, GEGNER_AUSLAGE } from './erweiterungstexte'
import { KARTENGROESSE } from './groessen'
import { GrossKnopf } from './Kartenknopf'
import { TISCH, geheimeAufgabeName } from './texte'

/*
Was mit der Erweiterung offen am Tisch liegt (A4, A8, A9; O10).

- Deine Auslage: geheime Aufgabe (bei dir mit „erfüllt“, D35), Comeback-Karte
  mit „einsetzbar“ oder „verbraucht“ und die Risiko-Karten, dazu die Aufgaben,
  die du erfüllt hast. „Einsetzbar“ steht nur, wenn die Engine den Einsatz
  jetzt anbietet; eine verbrauchte Karte heisst nie so (Prüfprotokoll X4).
- Die Auslage eines Gegners in seinem Kopf: Comeback-Karte offen oder
  verbraucht, Zahl seiner Risiko-Karten und seine erfüllten Aufgaben. Seine
  geheime Aufgabe steht nirgends (B2).
- Offen aufgedeckte Karten in der Tischmitte, solange eine Entscheidung auf
  sie wartet (A8.2).

Ohne Erweiterung zeichnet der Tisch nichts davon.
*/

export function Auslage({ ich, zeigeGross }: { ich: EigeneAnsicht; zeigeGross: (karte: Bildkarte) => void }) {
  const bedienung = useZiele()
  const einsetzbar = ich.comeback !== null && bedienung?.spielbar(ich.comeback.karte.id) === true
  return (
    <section className="st-auslage" aria-label={TISCH.auslage}>
      <h2 className="st-bereichstitel">{TISCH.auslage}</h2>
      <ul className="st-kartenreihe">
        {ich.geheimeAufgabe !== null && (
          <li className="st-mit-unterschrift">
            <GrossKnopf karte={ich.geheimeAufgabe} name={geheimeAufgabeName(kartenname(ich.geheimeAufgabe))} zeigeGross={zeigeGross} />
            <span>{ich.geheimeAufgabeErfuellt ? ERWEITERUNG.geheimErfuellt : TISCH.geheim}</span>
          </li>
        )}
        {ich.comeback !== null && (
          <li className="st-mit-unterschrift">
            {/* A8.1: „Die Comeback-Karte wird umgedreht, um anzuzeigen, dass sie verwendet wurde.“ */}
            {ich.comeback.verbraucht ? (
              <>
                <Kartenrueckseite name={ERWEITERUNG.comebackUmgedreht} />
                <span>{TISCH.verbraucht}</span>
              </>
            ) : (
              <>
                <Karte karte={ich.comeback.karte} sizes={KARTENGROESSE.eigene} />
                {einsetzbar && <span>{ERWEITERUNG.einsetzbar}</span>}
              </>
            )}
          </li>
        )}
        {ich.risikoKarten.map((karte) => (
          <li key={karte.id}>
            <Karte karte={karte} sizes={KARTENGROESSE.eigene} />
          </li>
        ))}
      </ul>
      {ich.erfuellteAufgaben.length > 0 && (
        <>
          <h3 className="st-bereichstitel">{ERWEITERUNG.erfuellteAufgaben}</h3>
          <ul className="st-kartenreihe" aria-label={ERWEITERUNG.erfuellteAufgaben}>
            {ich.erfuellteAufgaben.map((aufgabe) => (
              <li key={aufgabe.id}>
                <GrossKnopf karte={aufgabe} zeigeGross={zeigeGross} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

/** Die offene Auslage eines Gegners als kurze Zeile in seinem Kopf; ohne Erweiterung nichts. */
export function GegnerAuslage({ gegner }: { gegner: GegnerAnsicht }) {
  if (gegner.comeback === null) return null
  const teile = [GEGNER_AUSLAGE.comeback(gegner.comeback.verbraucht), GEGNER_AUSLAGE.risiko(gegner.risikoKarten)]
  if (gegner.erfuellteAufgaben.length > 0) teile.push(GEGNER_AUSLAGE.aufgaben(gegner.erfuellteAufgaben.map((aufgabe) => aufgabe.name)))
  return <span className="st-gegner-info">{teile.join(' · ')}</span>
}

/** Offen aufgedeckte Karten in der Tischmitte (A8.2); nichts, solange keine aufgedeckt ist. */
export function Aufgedeckt({ ansicht }: { ansicht: TischAnsicht }) {
  if (ansicht.aufgedeckt.length === 0) return null
  return (
    <section className="st-aufgedeckt" aria-label={ERWEITERUNG.aufgedeckt}>
      <h2 className="st-bereichstitel">{ERWEITERUNG.aufgedeckt}</h2>
      <ul className="st-kartenreihe">
        {ansicht.aufgedeckt.map((karte) => (
          <li key={karte.id}>
            <Karte karte={karte} sizes={KARTENGROESSE.mitte} />
          </li>
        ))}
      </ul>
    </section>
  )
}
