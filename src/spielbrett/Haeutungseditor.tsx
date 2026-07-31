/*
Author: Claude Code (G-7)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Die Schlangenhäutung — beliebige Reihenfolge, nicht zwei Presets.

Diese Aktion ist der einzige Fall, den die Engine **nicht enumeriert**
(`legalActions.ts:293`): Eine Schlange aus n Karten hat n! mögliche neue
Reihenfolgen, die aufzuzählen wäre sinnlos. Stattdessen meldet die Engine nur
einen Hinweis, und die Oberfläche muss die Reihenfolge selbst anbieten.

Genau deshalb ist sie auf `/game` faktisch verlorengegangen. Dort blieben zwei
Presets am Brett (`SchlangenhaeutungBrettziel.tsx:32`) — „Umkehren" und „Erste
Karte ans Ende". Alle anderen Reihenfolgen waren unspielbar, weil der Ort, der
sie anbot (`AktionenPanel`), per CSS versteckt wurde.

Hier schiebt der Spieler die Karten einzeln, sieht die neue Reihenfolge in
Klartext und bestätigt. Geprüft wird gegen `pruefeAktion`, bevor der Knopf
freigibt — die Engine bleibt die Wahrheit.
*/

import { useState } from 'react'
import { pruefeAktion } from '../engine'
import type { Schlange, SpielAktion, Spielkarte, Spielzustand } from '../engine'
import { karteAnzeigename } from '../kartenTexte'

interface HaeutungseditorProps {
  zustand: Spielzustand
  schlange: Schlange
  /** Die Schlangenhäutung-Karte auf der Hand. */
  handkartenId: string
  onAusfuehren: (aktion: SpielAktion) => void
  onAbbrechen: () => void
}

function namenFolge(karten: Spielkarte[], reihenfolge: string[]): string {
  return reihenfolge
    .map((id) => karten.find((karte) => karte.id === id))
    .filter((karte): karte is Spielkarte => karte !== undefined)
    .map(karteAnzeigename)
    .join(' → ')
}

export default function Haeutungseditor({
  zustand,
  schlange,
  handkartenId,
  onAusfuehren,
  onAbbrechen,
}: HaeutungseditorProps) {
  const ursprung = schlange.karten.map((karte) => karte.id)
  const [reihenfolge, setReihenfolge] = useState<string[]>(ursprung)

  function verschiebe(von: number, nach: number) {
    if (nach < 0 || nach >= reihenfolge.length) return
    const neu = [...reihenfolge]
    const [karte] = neu.splice(von, 1)
    neu.splice(nach, 0, karte)
    setReihenfolge(neu)
  }

  const aktion: SpielAktion = {
    typ: 'SchlangenhaeutungSpielen',
    spielerId: zustand.spieler[zustand.aktiverSpielerIndex].id,
    handkartenId,
    schlangenId: schlange.id,
    kartenIdsInNeuerReihenfolge: reihenfolge,
  }
  const pruefung = pruefeAktion(zustand, aktion)
  const unveraendert = reihenfolge.join() === ursprung.join()

  return (
    <div className="brett-haeutung" role="group" aria-label="Schlangenhäutung — neue Reihenfolge">
      <span className="brett-bereich__titel">Neue Reihenfolge legen</span>

      <ol className="brett-haeutung__liste">
        {reihenfolge.map((karteId, index) => {
          const karte = schlange.karten.find((eintrag) => eintrag.id === karteId)
          if (!karte) return null
          const name = karteAnzeigename(karte)
          return (
            <li key={karteId} className="brett-haeutung__eintrag">
              <button
                type="button"
                className="brett-knopf brett-knopf--leise"
                aria-label={`${name} nach vorne schieben`}
                onClick={() => verschiebe(index, index - 1)}
                disabled={index === 0}
              >
                ◀
              </button>
              <span>
                {index + 1}. {name}
              </span>
              <button
                type="button"
                className="brett-knopf brett-knopf--leise"
                aria-label={`${name} nach hinten schieben`}
                onClick={() => verschiebe(index, index + 1)}
                disabled={index === reihenfolge.length - 1}
              >
                ▶
              </button>
            </li>
          )
        })}
      </ol>

      <p className="brett-leer">Vorher: {namenFolge(schlange.karten, ursprung)}</p>
      <p className="brett-leer" role="status" aria-live="polite">
        Nachher: {namenFolge(schlange.karten, reihenfolge)}
      </p>

      <div className="brett-haeutung__knoepfe">
        <button
          type="button"
          className="brett-knopf brett-knopf--leise"
          onClick={() => setReihenfolge([...reihenfolge].reverse())}
        >
          Umkehren
        </button>
        <button
          type="button"
          className="brett-knopf brett-knopf--leise"
          onClick={() => setReihenfolge(ursprung)}
          disabled={unveraendert}
        >
          Zurücksetzen
        </button>
        <button
          type="button"
          className="brett-knopf"
          onClick={() => onAusfuehren(aktion)}
          disabled={!pruefung.erlaubt || unveraendert}
        >
          Häutung ausführen
        </button>
        <button type="button" className="brett-knopf brett-knopf--leise" onClick={onAbbrechen}>
          Abbrechen
        </button>
      </div>

      {/* Der Grund kommt aus der Engine, nicht aus einer Vermutung der Oberfläche. */}
      {!pruefung.erlaubt && !unveraendert ? (
        <p className="brett-hand__hinweis">{pruefung.grund ?? 'Diese Reihenfolge ist nicht erlaubt.'}</p>
      ) : null}
      {unveraendert ? <p className="brett-leer">Noch nichts verändert.</p> : null}
    </div>
  )
}
