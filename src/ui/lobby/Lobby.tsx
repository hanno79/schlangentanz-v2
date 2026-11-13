import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { geheZu } from './navigation'
import { GEGNER_AUSWAHL, starteNeuePartie, useGespeichertePartie } from './partie'
import Rahmen from './Rahmen'
import { LOBBY, SPIELNAME, partieKurz } from './texte'
import Verweis from './Verweis'
import VerworfenHinweis from './VerworfenHinweis'

/**
 * Die Startseite: Gegnerzahl und Erweiterung wählen, eine neue Partie beginnen
 * oder die gespeicherte fortsetzen.
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
  /* Ein Wurf im Klick-Handler erreicht keine Fehlergrenze. Er wird deshalb
     festgehalten und beim nächsten Zeichnen geworfen; dann zeigt ihn der
     Fehlerfang im App-Rahmen und meldet ihn an den Fehlerdienst (O2 K4). */
  const [startfehler, setStartfehler] = useState<{ fehler: unknown } | null>(null)
  const neuePartieKnopf = useRef<HTMLButtonElement>(null)
  const frageWarOffen = useRef(false)

  // Nach „Abbrechen“ kehrt der Fokus auf „Neue Partie“ zurück, statt im Nichts zu landen.
  useEffect(() => {
    if (!fragtNach && frageWarOffen.current) neuePartieKnopf.current?.focus()
    frageWarOffen.current = fragtNach
  }, [fragtNach])

  if (startfehler !== null) throw startfehler.fehler

  function beginne() {
    try {
      starteNeuePartie({ gegner, erweiterung })
    } catch (fehler) {
      setStartfehler({ fehler })
      return
    }
    geheZu('spiel')
  }

  return (
    <Rahmen
      testId="lobby"
      titel={SPIELNAME}
      text={LOBBY.untertitel}
      fuss={<Verweis ziel="regeln">{LOBBY.regeln}</Verweis>}
    >
      {gespeichert.art === 'verworfen' && <VerworfenHinweis lage={gespeichert} />}

      {laufend !== null && (
        <section className="lobby__laufend" aria-label={LOBBY.laufendePartie}>
          <p data-testid="laufende-partie">
            <strong>{LOBBY.laufendePartie}:</strong> {partieKurz(laufend.gegner, laufend.erweiterung)}
          </p>
          <button type="button" className="knopf knopf--haupt" onClick={() => geheZu('spiel')}>
            {LOBBY.weiterspielen}
          </button>
        </section>
      )}

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
              <label key={anzahl} className="wahl">
                <input
                  type="radio"
                  name="gegner"
                  value={anzahl}
                  checked={gegner === anzahl}
                  onChange={() => setGegner(anzahl)}
                />
                <span>{LOBBY.gegner(anzahl)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="schalter">
          <input type="checkbox" checked={erweiterung} onChange={(e) => setErweiterung(e.target.checked)} />
          <span>{LOBBY.erweiterung}</span>
        </label>

        {fragtNach ? (
          <Rueckfrage onBestaetigen={beginne} onAbbrechen={() => setFragtNach(false)} />
        ) : (
          <button type="submit" ref={neuePartieKnopf} className={laufend === null ? 'knopf knopf--haupt' : 'knopf'}>
            {LOBBY.neuePartie}
          </button>
        )}
      </form>
    </Rahmen>
  )
}

function Rueckfrage({ onBestaetigen, onAbbrechen }: { onBestaetigen: () => void; onAbbrechen: () => void }) {
  const abbrechen = useRef<HTMLButtonElement>(null)

  // Der Fokus springt auf „Abbrechen“: Die Frage wird vorgelesen, und ein versehentliches Enter überschreibt nichts.
  useEffect(() => abbrechen.current?.focus(), [])

  function beiTaste(ereignis: KeyboardEvent) {
    if (ereignis.key === 'Escape') onAbbrechen()
  }

  return (
    <div className="lobby__frage" role="alertdialog" aria-labelledby="lobby-frage" onKeyDown={beiTaste}>
      <p id="lobby-frage">{LOBBY.frage}</p>
      <div className="lobby__knoepfe">
        <button type="button" className="knopf knopf--warnung" onClick={onBestaetigen}>
          {LOBBY.bestaetigen}
        </button>
        <button type="button" className="knopf" ref={abbrechen} onClick={onAbbrechen}>
          {LOBBY.abbrechen}
        </button>
      </div>
    </div>
  )
}
