import { useId } from 'react'

function Schlangenbuch() {
  const titelId = useId()

  return (
    <section className="schlangenbuch" aria-labelledby={titelId}>
      <div className="schlangenbuch__kopf">
        <span className="schlangenbuch__icon" aria-hidden="true">📖</span>
        <div>
          <p className="schlangenbuch__eyebrow">Regeln als Wald-Pop-up-Buch</p>
          <h2 id={titelId}>Das Schlangenbuch</h2>
        </div>
      </div>
      <ul className="schlangenbuch__tabs" aria-label="Regelkapitel">
        <li>Vorbereitung</li>
        <li>Zugablauf</li>
        <li>Wertung</li>
      </ul>
      <div className="schlangenbuch__seiten">
        <article className="schlangenbuch__seite schlangenbuch__seite--links" aria-label="Zugablauf im Waldtanz">
          <div className="regelkarte regelkarte--gold">
            <strong>1. Karte wählen</strong>
            <p>Wähle eine Handkarte und achte auf die leuchtenden Ziele im Waldtanz-Spielbrett.</p>
          </div>
          <div className="regelkarte regelkarte--gruen">
            <strong>2. Schlange bauen</strong>
            <p>Lege Zahlenkarten direkt an passende Schlangen an oder starte eine neue Schlange in der Lichtung.</p>
          </div>
          <div className="regelkarte regelkarte--rot">
            <strong>Sonderkarten</strong>
            <p>Schlangenfraß, Farbenfusion, Farbendieb und Blockade werden boardnah auf echte Schlangen-Ziele gespielt.</p>
          </div>
        </article>
        <article className="schlangenbuch__seite schlangenbuch__seite--rechts" aria-label="Aufgaben und Wertung">
          <div className="regelkarte regelkarte--gruen">
            <strong>3. Aufgabe erfüllen</strong>
            <p>Prüfe nach dem Ausspielen deine offenen Aufgaben und schließe erfüllte Waldaufträge ab.</p>
          </div>
          <div className="regelkarte regelkarte--gold">
            <strong>Punkte sammeln</strong>
            <p>Aufgaben bringen Punkte; Farbgruppen und lange Schlangen füllen die Punktetafel.</p>
          </div>
          <p className="schlangenbuch__merksatz">Tipp: Erst Karte wählen, dann direkt im Spielbrett auf die passende Schlange oder Lichtung klicken.</p>
        </article>
      </div>
    </section>
  )
}

export default Schlangenbuch
