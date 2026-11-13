import { useState } from 'react'
import { WERTUNG } from './beispiel'

const POSTEN = [
  { schluessel: 'farbgruppen', titel: 'Farbgruppen' },
  { schluessel: 'vielfalt', titel: 'Vielfalt' },
  { schluessel: 'kette', titel: 'Längste Kette' },
  { schluessel: 'aufgaben', titel: 'Aufgaben' },
] as const

/** Entwurf des Ergebnisses: Rangliste mit Punkten je Wertungsposten, Sieger als Text. */
export function EntwurfErgebnis() {
  const [hinweis, setzeHinweis] = useState<string | null>(null)
  const rangliste = WERTUNG.map((eintrag) => ({
    ...eintrag,
    gesamt: POSTEN.reduce((summe, { schluessel }) => summe + eintrag[schluessel], 0),
  }))
  const sieger = rangliste[0]
  const du = rangliste.findIndex((eintrag) => eintrag.name === 'Du')

  return (
    <div className="entwurf entwurf--rahmen" data-testid="entwurf-ergebnis">
      <header className="kopfleiste">
        <span className="kopfleiste-titel">Partie beendet</span>
      </header>
      <main className="entwurf-inhalt entwurf-schmal ergebnis">
        <section className="ergebnis-sieger" aria-labelledby="ergebnis-titel">
          <h1 id="ergebnis-titel" className="entwurf-titel entwurf-titel--gross">
            {sieger.name} gewinnt!
          </h1>
          <p>
            mit {sieger.gesamt} Punkten. Du bist auf Platz {du + 1} mit {rangliste[du].gesamt} Punkten.
          </p>
        </section>
        <ol className="rangliste" aria-label="Wertung">
          {rangliste.map((eintrag, index) => (
            <li key={eintrag.name} className={index === 0 ? 'rang rang--sieger' : 'rang'}>
              <div className="rang-kopf">
                <span className="rang-platz">{index + 1}.</span>
                <span className="rang-name">
                  {eintrag.name}
                  {index === 0 && <span className="abzeichen">Sieger</span>}
                </span>
                <span className="rang-gesamt">{eintrag.gesamt} Punkte</span>
              </div>
              <dl className="rang-posten">
                {POSTEN.map(({ schluessel, titel }) => (
                  <div key={schluessel}>
                    <dt>{titel}</dt>
                    <dd>{eintrag[schluessel]}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
        {hinweis !== null && (
          <p className="hinweis" role="status">
            Entwurf: „{hinweis}“ startet hier nichts.
          </p>
        )}
      </main>
      <footer className="aktionsleiste">
        <a className="knopf knopf--zweit" href="/dev/entwurf/lobby">
          Zur Lobby
        </a>
        <button type="button" className="knopf knopf--haupt" onClick={() => setzeHinweis('Neue Partie')}>
          Neue Partie
        </button>
      </footer>
    </div>
  )
}
