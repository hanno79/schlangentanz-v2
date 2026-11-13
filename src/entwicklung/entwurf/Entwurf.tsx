import '../../ui/tokens.css'
import './entwurf.css'
import type { EntwurfAnfrage } from '../adresse'
import { Fehler } from '../Fehler'
import { HAND } from './beispiel'
import { EntwurfErgebnis } from './Ergebnis'
import { EntwurfLobby } from './Lobby'
import { EntwurfTisch } from './Tisch'

/*
Entwurfsseiten für den Autor (O1): Lobby, Tisch und Ergebnis mit festen
Beispieldaten. Sie zeigen Gestaltung und Bedienung, bevor Engine und Spiel-
oberfläche fertig sind, und dienen der Freigabe. Erreichbar nur dort, wo der
Entwicklertisch erreichbar ist (Dev-Server und Testhook-Build).
*/
export function Entwurf({ anfrage }: { anfrage: EntwurfAnfrage }) {
  switch (anfrage.seite) {
    case 'uebersicht':
      return <Uebersicht />
    case 'lobby':
      return <EntwurfLobby />
    case 'ergebnis':
      return <EntwurfErgebnis />
    case 'tisch': {
      const gewaehlt = anfrage.karte === null ? null : HAND.find((eintrag) => eintrag.karte.id === anfrage.karte)
      if (gewaehlt === undefined) {
        const bekannte = HAND.map((eintrag) => eintrag.karte.id).join(', ')
        return <Fehler meldung={`Unbekannte Handkarte „${anfrage.karte}“. Im Entwurf gibt es: ${bekannte}.`} />
      }
      return <EntwurfTisch gegnerzahl={anfrage.gegner} vorgewaehlt={gewaehlt?.karte.id ?? null} />
    }
  }
}

const VERWEISE = [
  { adresse: '/dev/entwurf/lobby', titel: 'Lobby', text: 'Gegner wählen, Erweiterung, neue Partie oder weiterspielen.' },
  { adresse: '/dev/entwurf/tisch', titel: 'Tisch', text: 'Drei Gegner, Erweiterung an, noch keine Karte gewählt.' },
  { adresse: '/dev/entwurf/tisch?karte=rot-01', titel: 'Tisch: Farbkarte gewählt', text: 'Ziele an den Schlangenenden.' },
  {
    adresse: '/dev/entwurf/tisch?karte=farbendieb-01',
    titel: 'Tisch: Farbendieb gewählt',
    text: 'Ziele sind die Karten der Gegner.',
  },
  { adresse: '/dev/entwurf/tisch?gegner=1', titel: 'Tisch mit einem Gegner', text: 'Der kleinste Tisch.' },
  { adresse: '/dev/entwurf/ergebnis', titel: 'Ergebnis', text: 'Wertung je Spieler und Sieger.' },
]

function Uebersicht() {
  return (
    <div className="entwurf entwurf--seite" data-testid="entwurf-uebersicht">
      <main className="entwurf-inhalt entwurf-schmal">
        <h1 className="entwurf-titel">Entwürfe</h1>
        <p>
          Gestaltungsentwürfe mit festen Beispieldaten. Nichts hier ist eine laufende Partie; die Knöpfe zeigen nur,
          wie die Bedienung gedacht ist.
        </p>
        <ul className="entwurf-verweise">
          {VERWEISE.map((verweis) => (
            <li key={verweis.adresse}>
              <a href={verweis.adresse}>
                <strong>{verweis.titel}</strong>
                <span>{verweis.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
