import { useState } from 'react'
import { LOGO_BILD } from '../../ui/karten/kartenbilder'
import { GESPEICHERTE_PARTIE } from './beispiel'

const GEGNERZAHLEN = [1, 2, 3]

/** Entwurf der Lobby: weiterspielen oder eine neue Partie einstellen und starten. */
export function EntwurfLobby() {
  const [gegner, setzeGegner] = useState(2)
  const [erweiterung, setzeErweiterung] = useState(false)
  const [hinweis, setzeHinweis] = useState<string | null>(null)
  const partie = GESPEICHERTE_PARTIE

  return (
    <div className="entwurf entwurf--seite" data-testid="entwurf-lobby">
      <main className="entwurf-inhalt entwurf-schmal lobby">
        <header className="lobby-kopf">
          <img className="lobby-logo" src={LOGO_BILD} alt="" width={521} height={672} />
          <h1 className="entwurf-titel entwurf-titel--gross">Schlangentanz</h1>
          <p className="leise">Das farbenfrohe Kartenspiel</p>
          <a className="verweis" href="https://schlangentanz.ch/rules" target="_blank" rel="noreferrer">
            Spielregeln auf schlangentanz.ch
          </a>
        </header>

        <div className="lobby-wahl">
          <section className="flaeche" aria-labelledby="lobby-weiter">
            <h2 id="lobby-weiter">Deine Partie</h2>
            <p className="leise">
              Vom {partie.datum} · {partie.gegner} Gegner · {partie.erweiterung ? 'mit' : 'ohne'} Erweiterung · Zug{' '}
              {partie.zug}
            </p>
            <button type="button" className="knopf knopf--haupt" onClick={() => setzeHinweis('Weiterspielen')}>
              Weiterspielen
            </button>
          </section>

          <section className="flaeche" aria-labelledby="lobby-neu">
            <h2 id="lobby-neu">Neue Partie</h2>
            <div className="lobby-zeile">
              <span id="lobby-gegner">Gegner</span>
              <div className="segmente" role="group" aria-labelledby="lobby-gegner">
                {GEGNERZAHLEN.map((zahl) => (
                  <button
                    key={zahl}
                    type="button"
                    className="segment"
                    aria-label={`${zahl} Gegner`}
                    aria-pressed={gegner === zahl}
                    onClick={() => setzeGegner(zahl)}
                  >
                    {zahl}
                  </button>
                ))}
              </div>
            </div>
            <div className="lobby-zeile">
              <span id="lobby-erweiterung">
                Erweiterung
                <small className="leise">Schlangenkorb des Glücks: Aufgaben, Comeback und Risiko</small>
              </span>
              <button
                type="button"
                role="switch"
                className="schalter"
                aria-labelledby="lobby-erweiterung"
                aria-checked={erweiterung}
                onClick={() => setzeErweiterung(!erweiterung)}
              >
                <span className="schalter-text">{erweiterung ? 'An' : 'Aus'}</span>
              </button>
            </div>
            <button type="button" className="knopf knopf--zweit" onClick={() => setzeHinweis('Neue Partie')}>
              Neue Partie
            </button>
          </section>

          {hinweis !== null && (
            <p className="hinweis" role="status">
              Entwurf: „{hinweis}“ startet hier nichts.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
