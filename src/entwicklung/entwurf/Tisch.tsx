import './tisch.css'
import { useState } from 'react'
import type { Bildkarte } from '../../ui/karten/kartenbilder'
import { Karte } from '../../ui/karten/Karte'
import { kartenkurzname, kartenname } from '../../ui/karten/kartentexte'
import { GEGNER, HAND } from './beispiel'
import type { BeispielHandkarte } from './beispiel'
import { Lupe } from './Lupe'
import type { Ziel } from './Schlange'
import { EigeneSchlangen, Tischflaeche } from './Tischflaeche'

/** Was die Zugleiste sagt: ohne Wahl die letzte Meldung, mit Karte ihr Auftrag, mit Ziel die ganze Aktion. */
function zugleistenText(handkarte: BeispielHandkarte | null, ziel: Ziel | null, meldung: string | null): string {
  if (handkarte === null) return meldung ?? 'Wähle eine Karte aus deiner Hand.'
  if (ziel === null) return handkarte.auftrag
  return `${kartenkurzname(handkarte.karte)}: ${ziel.beschreibung}.`
}

interface TischEigenschaften {
  gegnerzahl: number
  /** Handkarte, die beim Öffnen schon gewählt ist (`?karte=`), für Fotos und Messungen. */
  vorgewaehlt: string | null
}

/**
 * Entwurf des Spieltischs. Der Mensch sitzt unten: eigene Schlangen, Hand und
 * Zugleiste stehen fest, Gegner, Tischmitte und Auslage scrollen darüber. Bedienung: Karte wählen, dann Ziel wählen,
 * dann ausführen. Welche Ziele erscheinen, steht fest in den Beispieldaten.
 */
export function EntwurfTisch({ gegnerzahl, vorgewaehlt }: TischEigenschaften) {
  const [gewaehlt, setzeGewaehlt] = useState<string | null>(vorgewaehlt)
  const [ziel, setzeZiel] = useState<Ziel | null>(null)
  const [gross, setzeGross] = useState<Bildkarte | null>(null)
  const [meldung, setzeMeldung] = useState<string | null>(null)

  const handkarte = HAND.find((eintrag) => eintrag.karte.id === gewaehlt) ?? null
  const zielart = handkarte?.zielart ?? null
  const zielwahl = { gewaehlt: ziel?.id ?? null, waehle: setzeZiel }
  const waehleKarte = (id: string) => {
    setzeGewaehlt(id === gewaehlt ? null : id)
    setzeZiel(null)
    setzeMeldung(null)
  }
  const abbrechen = () => {
    setzeGewaehlt(null)
    setzeZiel(null)
  }
  const ausfuehren = () => {
    abbrechen()
    setzeMeldung('Entwurf: Hier wird nichts ausgeführt. Im Spiel führt die Engine die Aktion aus.')
  }

  return (
    <div className={`entwurf entwurf--rahmen tisch${handkarte === null ? '' : ' tisch--zielwahl'}`} data-testid="entwurf-tisch">
      <header className="kopfleiste">
        <span className="kopfleiste-titel">Du bist dran</span>
        <span className="kopfleiste-info">Zug 14 · 0 von 2 Karten</span>
        <a className="knopf knopf--leise" href="/dev/entwurf">
          Menü
        </a>
      </header>

      <Tischflaeche gegner={GEGNER.slice(0, gegnerzahl)} zielart={zielart} zielwahl={zielwahl} zeigeGross={setzeGross} />

      <div className="tisch-unten">
        <EigeneSchlangen zielart={zielart} zielwahl={zielwahl} />
        <section className="hand" aria-label="Deine Hand">
          <h2 className="bereichstitel">Deine Hand · {HAND.length} Karten</h2>
          <ul className="hand-karten">
            {HAND.map(({ karte }) => (
              <li key={karte.id}>
                <button
                  type="button"
                  className="handkarte"
                  aria-label={kartenname(karte)}
                  aria-pressed={karte.id === gewaehlt}
                  onClick={() => waehleKarte(karte.id)}
                >
                  <Karte karte={karte} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="zugleiste" aria-label="Zugleiste" aria-live="polite">
          {handkarte !== null && (
            // Ab Tablet ist neben der Hand Platz: die gewählte Karte gross, damit man sie lesen kann.
            <div className="zugleiste-vorschau" aria-hidden="true">
              <Karte karte={handkarte.karte} />
            </div>
          )}
          <p className="zugleiste-text">{zugleistenText(handkarte, ziel, meldung)}</p>
          <div className="zugleiste-knoepfe">
            {handkarte === null ? (
              <button type="button" className="knopf knopf--zweit" onClick={() => setzeMeldung('Entwurf: Der Zug endet hier nicht.')}>
                Zug beenden
              </button>
            ) : (
              <>
                <button type="button" className="knopf knopf--leise" onClick={() => setzeGross(handkarte.karte)}>
                  Ansehen
                </button>
                <button type="button" className="knopf knopf--zweit" onClick={abbrechen}>
                  Abbrechen
                </button>
                {ziel !== null && (
                  <button type="button" className="knopf knopf--haupt" onClick={ausfuehren}>
                    Ausführen
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {gross !== null && <Lupe karte={gross} schliesse={() => setzeGross(null)} />}
    </div>
  )
}
