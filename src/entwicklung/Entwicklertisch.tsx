import './entwicklertisch.css'
import { SPIELER_MAX, SPIELER_MIN } from '../engine'
import { leseEntwicklerAnfrage } from './adresse'
import type { EntwicklerAnfrage } from './adresse'
import { starteEntwicklerPartie } from './partie'
import { findeSzenario, SZENARIEN } from './szenarien'
import { Tisch } from './Tisch'

/*
Der Entwicklertisch unter `/dev`: ein Prüfstand für die Engine, keine
Spieloberfläche. Er zeigt den ganzen Zustand offen und bietet genau das an, was
die Engine aufzählt.

`App.tsx` lädt ihn nur im Testhook-Build und im Dev-Server nach; im
Produktionsbuild entfällt der Import samt diesem Modul (geprüft in
`tests/entwicklertisch_bundle.test.ts`).

Navigiert wird mit echten Links. Jede Ansicht ist damit eine Adresse, die man
neu laden oder weitergeben kann, und nach dem Laden steht sie wieder genau so da.
*/
export default function Entwicklertisch() {
  const anfrage = leseEntwicklerAnfrage(window.location.pathname, window.location.search)
  return (
    <div className="entwicklertisch" data-testid="entwicklertisch">
      <nav className="et-navigation">
        <strong>Entwicklertisch</strong> <a href="/dev">Start</a> <a href="/dev/szenarien">Szenarien</a>
      </nav>
      <main>
        <Inhalt anfrage={anfrage} />
      </main>
    </div>
  )
}

function Inhalt({ anfrage }: { anfrage: EntwicklerAnfrage }) {
  switch (anfrage.art) {
    case 'start':
      return <Startseite />
    case 'szenarien':
      return <Szenarienliste />
    case 'szenario': {
      const szenario = findeSzenario(anfrage.name)
      if (szenario === undefined) {
        return <Fehler meldung={`Unbekanntes Szenario „${anfrage.name}“. Die Liste steht unter /dev/szenarien.`} />
      }
      return (
        <Tisch
          titel={`Szenario ${szenario.name}`}
          erzeuge={szenario.erzeuge}
          hinweis={
            <p className="et-hinweis">
              {szenario.beschreibung} <strong>Erwartet:</strong> {szenario.erwartet}
            </p>
          }
        />
      )
    }
    case 'partie':
      return (
        <Tisch
          titel={`Partie aus Saat ${anfrage.saat}, ${anfrage.spieler} Spieler`}
          erzeuge={() => starteEntwicklerPartie(anfrage.saat, anfrage.spieler)}
          hinweis={<ErweiterungsHinweis erweiterung={anfrage.erweiterung} />}
        />
      )
    case 'fehler':
      return <Fehler meldung={anfrage.meldung} />
  }
}

/*
Die heutige Engine hat keinen Schalter für die Erweiterung: Schlangenhäutung und
Aufgaben sind immer dabei, Comeback, Risiko-Belohnung und Schlangenkorb nie.
Der Parameter wird deshalb angenommen und angezeigt, ändert die Partie aber
nicht, bis X1 den Schalter in die Engine bringt. Das steht hier sichtbar, damit
niemand eine Basis-Partie für eine mit Erweiterung hält oder umgekehrt.
*/
function ErweiterungsHinweis({ erweiterung }: { erweiterung: 0 | 1 }) {
  return (
    <p className="et-hinweis" data-testid="hinweis-erweiterung">
      Erweiterung angefordert: {erweiterung}. Die Engine kennt diesen Schalter noch nicht (kommt mit X1); die Partie
      läuft mit dem heutigen Kartenmaterial, gleich welcher Wert hier steht.
    </p>
  )
}

function Fehler({ meldung }: { meldung: string }) {
  return (
    <p className="et-fehler" data-testid="fehlermeldung" role="alert">
      {meldung}
    </p>
  )
}

function Startseite() {
  return (
    <section className="et-abschnitt">
      <h1>Entwicklertisch</h1>
      <p>
        <a href="/dev/szenarien">Szenarien</a> mit Beschreibung und erwartetem Verhalten, oder eine Partie aus einer Saat:
      </p>
      <form method="get" action="/dev" className="et-formular">
        <label>
          Saat <input type="number" name="seed" min={0} step={1} defaultValue={1} required />
        </label>
        <label>
          Spieler{' '}
          <input type="number" name="spieler" min={SPIELER_MIN} max={SPIELER_MAX} step={1} defaultValue={2} required />
        </label>
        <label>
          Erweiterung{' '}
          <select name="erweiterung" defaultValue="0">
            <option value="0">0</option>
            <option value="1">1</option>
          </select>
        </label>
        <button type="submit">Partie starten</button>
      </form>
    </section>
  )
}

function Szenarienliste() {
  return (
    <section className="et-abschnitt">
      <h1>Szenarien ({SZENARIEN.length})</h1>
      <table className="et-tabelle">
        <thead>
          <tr>
            <th>Name</th>
            <th>Beschreibung</th>
            <th>Erwartet</th>
          </tr>
        </thead>
        <tbody>
          {SZENARIEN.map((szenario) => (
            <tr key={szenario.name} data-testid="szenario" data-name={szenario.name}>
              <td>
                <a href={`/dev?szenario=${szenario.name}`}>{szenario.name}</a>
              </td>
              <td>{szenario.beschreibung}</td>
              <td>{szenario.erwartet}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
