import '../tokens.css'
import '../tisch/karten.css'
import './ergebnis.css'
import Rahmen from '../lobby/Rahmen'
import Verweis from '../lobby/Verweis'
import type { ErgebnisAnsicht } from '../spiel/ergebnisAnsicht'
import { TISCH } from '../tisch/texte'
import { scrollFokus, useUeberlauf } from '../tisch/ueberlauf'
import { Weiter } from '../tisch/Weiter'
import { Rang } from './Rang'
import { ERGEBNIS, siegerText, siegerTitel } from './texte'

/*
Die Wertung nach Spielende (Plan O8, Entwurf „Ergebnis“ aus O1): oben wer
gewonnen hat, bei Gleichstand alle (D22), darunter die Rangliste mit der
Aufschlüsselung je Spieler und am Fuss „Zur Lobby“ und „Noch einmal“, der
Hauptknopf zuletzt (DESIGN.md „Kopf- und Aktionsleiste“). Wie im Entwurf
scrollt nur die Rangliste; Titel und Knöpfe bleiben im Bild, und das Zeichen
„mehr ↓“ sagt, dass darunter noch Spieler stehen.

Die Seite zeigt nur, was `ergebnisAnsicht` aus der Endwertung der Engine
liefert. Was „Noch einmal“ tut, entscheidet die Spielseite; hier wird nur
gemeldet, dass es gewählt wurde.
*/

interface ErgebnisEigenschaften {
  ergebnis: ErgebnisAnsicht
  /** Beginnt eine neue Partie mit denselben Einstellungen (Kriterium 4). */
  nochEinmal: () => void
}

export function Ergebnis({ ergebnis, nochEinmal }: ErgebnisEigenschaften) {
  const [liste, ueberlauf] = useUeberlauf<HTMLOListElement>()
  return (
    <Rahmen
      testId="ergebnis"
      klasse="rahmen--ergebnis"
      titel={siegerTitel(ergebnis.sieger)}
      text={siegerText(ergebnis.hoechstePunktzahl, ergebnis.du)}
      fuss={
        <>
          <Verweis ziel="lobby" className="rahmen-knopf">
            {TISCH.zurLobby}
          </Verweis>
          <button type="button" className="rahmen-knopf rahmen-knopf--haupt" onClick={nochEinmal}>
            {ERGEBNIS.nochEinmal}
          </button>
        </>
      }
    >
      <div className="erg-rangliste-rahmen">
        <ol ref={liste} className="erg-rangliste st-scrollt" aria-label={ERGEBNIS.rangliste} tabIndex={scrollFokus(ueberlauf)}>
          {ergebnis.rangliste.map((eintrag) => (
            <Rang key={eintrag.wertung.spielerId} eintrag={eintrag} />
          ))}
        </ol>
        <Weiter ueberlauf={ueberlauf} />
      </div>
    </Rahmen>
  )
}
