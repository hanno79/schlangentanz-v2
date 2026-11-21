import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { LOGO_BILD } from '../karten/kartenbilder'
import './lobby.css'
import './lobby-seite.css'
import { geheZu } from './navigation'
import { GEGNER_AUSWAHL, starteNeuePartie, useGespeichertePartie } from './partie'
import type { Einstellungen } from './partie'
import Rahmen from './Rahmen'
import { LOBBY, SPIELNAME, partieKurz } from './texte'
import Verweis from './Verweis'
import VerworfenHinweis from './VerworfenHinweis'
import { useWurfImZeichnen } from '../wurfImZeichnen'

/**
 * Die Startseite: Gegnerzahl und Erweiterung wählen, eine neue Partie beginnen
 * oder die gespeicherte fortsetzen. Ist die gespeicherte Partie beendet, gibt
 * es statt „Weiterspielen“ ihre Wertung zu sehen, und eine neue Partie beginnt
 * ohne Rückfrage (O8, Kriterium 4).
 *
 * Hier läuft keine Partie (O2 K5): Die Lobby liest den Spielstand einmal beim
 * Öffnen, um „Weiterspielen“ anzubieten oder zu sagen, dass er unlesbar war,
 * und ruft die Engine erst beim Klick auf „Neue Partie“.
 */
export default function Lobby() {
  const gespeichert = useGespeichertePartie()
  const laufend = gespeichert.art === 'laufend' ? gespeichert.partie : null
  const [gegner, setGegner] = useState(GEGNER_AUSWAHL[0])
  const [erweiterung, setErweiterung] = useState(false)
  const [fragtNach, setFragtNach] = useState(false)
  const halteFehlerFest = useWurfImZeichnen()
  const neuePartieKnopf = useRef<HTMLButtonElement>(null)
  const frageWarOffen = useRef(false)

  // Nach „Abbrechen“ kehrt der Fokus auf „Neue Partie“ zurück, statt im Nichts zu landen.
  useEffect(() => {
    if (!fragtNach && frageWarOffen.current) neuePartieKnopf.current?.focus()
    frageWarOffen.current = fragtNach
  }, [fragtNach])

  function beginne() {
    try {
      starteNeuePartie({ gegner, erweiterung })
    } catch (fehler) {
      halteFehlerFest(fehler)
      return
    }
    geheZu('spiel')
  }

  return (
    <Rahmen
      testId="lobby"
      klasse="rahmen--lobby"
      bild={<img className="lobby__logo" src={LOGO_BILD} alt="" width={521} height={672} />}
      titel={SPIELNAME}
      text={LOBBY.untertitel}
      // Unter dem Titel wie im Entwurf: so steht „Regeln“ auch in der Tab-Reihe vor der Wahl der Partie.
      kopfZusatz={<Verweis ziel="regeln">{LOBBY.regeln}</Verweis>}
    >
      <div className="lobby__inhalt">
        {gespeichert.art === 'verworfen' && <VerworfenHinweis lage={gespeichert} />}

        {(gespeichert.art === 'laufend' || gespeichert.art === 'beendet') && <GespeichertePartie lage={gespeichert} />}

        <form
          className="lobby__neu"
          onSubmit={(ereignis) => {
            ereignis.preventDefault()
            if (laufend !== null) setFragtNach(true)
            else beginne()
          }}
        >
          <fieldset className="lobby__gegner" role="radiogroup">
            <legend>{LOBBY.gegnerLegende}</legend>
            <div className="lobby__wahl">
              {GEGNER_AUSWAHL.map((anzahl) => (
                <label key={anzahl} className="lobby__segment">
                  {/* Sichtbar steht nur die Zahl wie im Entwurf; Name und Text heissen „2 Gegner“. */}
                  <input
                    type="radio"
                    className="nur-vorlesen"
                    name="gegner"
                    value={anzahl}
                    aria-label={LOBBY.gegner(anzahl)}
                    checked={gegner === anzahl}
                    onChange={() => setGegner(anzahl)}
                  />
                  <span>
                    {anzahl}
                    <span className="nur-vorlesen"> {LOBBY.gegnerLegende}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="lobby__schalter">
            <span>{LOBBY.erweiterung}</span>
            <input
              type="checkbox"
              className="nur-vorlesen"
              checked={erweiterung}
              onChange={(e) => setErweiterung(e.target.checked)}
            />
            {/* Der Zustand steht als Wort da, nicht nur als Farbe (DESIGN.md); vorgelesen wird er über das Kästchen. */}
            <span className="lobby__bahn" aria-hidden="true">
              {erweiterung ? LOBBY.an : LOBBY.aus}
            </span>
          </label>

          {fragtNach ? (
            <Rueckfrage onBestaetigen={beginne} onAbbrechen={() => setFragtNach(false)} />
          ) : (
            <button type="submit" ref={neuePartieKnopf} className={laufend === null ? 'rahmen-knopf rahmen-knopf--haupt' : 'rahmen-knopf'}>
              {LOBBY.neuePartie}
            </button>
          )}
        </form>
      </div>
    </Rahmen>
  )
}

/** Die gespeicherte Partie: laufend zum Weiterspielen, beendet zum Ansehen ihrer Wertung (O8). Beides führt auf `/spiel`. */
function GespeichertePartie({ lage }: { lage: { art: 'laufend' | 'beendet'; partie: Einstellungen } }) {
  const laufend = lage.art === 'laufend'
  const titel = laufend ? LOBBY.laufendePartie : LOBBY.letztePartie
  return (
    <section className="lobby__laufend" aria-label={titel}>
      <p data-testid={laufend ? 'laufende-partie' : 'beendete-partie'}>
        <strong>{titel}:</strong> {partieKurz(lage.partie.gegner, lage.partie.erweiterung)}
        {laufend ? '' : `, ${LOBBY.beendet}`}
      </p>
      <button type="button" className={laufend ? 'rahmen-knopf rahmen-knopf--haupt' : 'rahmen-knopf'} onClick={() => geheZu('spiel')}>
        {laufend ? LOBBY.weiterspielen : LOBBY.ergebnisAnsehen}
      </button>
    </section>
  )
}

function Rueckfrage({ onBestaetigen, onAbbrechen }: { onBestaetigen: () => void; onAbbrechen: () => void }) {
  const frage = useRef<HTMLDivElement>(null)
  const abbrechen = useRef<HTMLButtonElement>(null)

  // Der Fokus springt auf „Abbrechen“: Die Frage wird vorgelesen, und ein versehentliches Enter überschreibt nichts.
  useEffect(() => abbrechen.current?.focus(), [])

  /* Dreht jemand das Gerät, während die Frage offen ist, holt die Lobby sie
     wieder ins Bild (TF-APP-016). Der Fokus allein tut das nur beim Öffnen. */
  useEffect(() => {
    const holeInsBild = () => frage.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    window.addEventListener('resize', holeInsBild)
    return () => window.removeEventListener('resize', holeInsBild)
  }, [])

  function beiTaste(ereignis: KeyboardEvent) {
    if (ereignis.key === 'Escape') onAbbrechen()
  }

  return (
    <div ref={frage} className="lobby__frage" role="alertdialog" aria-labelledby="lobby-frage" onKeyDown={beiTaste}>
      <p id="lobby-frage">{LOBBY.frage}</p>
      <div className="lobby__knoepfe">
        <button type="button" className="rahmen-knopf rahmen-knopf--warnung" onClick={onBestaetigen}>
          {LOBBY.bestaetigen}
        </button>
        <button type="button" className="rahmen-knopf" ref={abbrechen} onClick={onAbbrechen}>
          {LOBBY.abbrechen}
        </button>
      </div>
    </div>
  )
}
