import { useId } from 'react'
import type { GegnerAnsicht } from '../spiel/tischAnsicht'
import { KARTENGROESSE } from './groessen'
import { Ablage, Grube, Schlangen } from './Schlange'
import { TISCH, handkartenText } from './texte'

/**
 * Ein Gegner oben am Tisch: Name, Zahl seiner Handkarten, oberste Karte seines
 * Ablagestapels, eine Grube vor ihm und seine Schlangen. Seine Handkarten
 * stehen nur als Zahl da; die Sicht kennt sie gar nicht (B2).
 */
export function Gegner({ gegner }: { gegner: GegnerAnsicht }) {
  const kennung = useId()
  return (
    <article className={gegner.amZug ? 'st-gegner st-gegner--dran' : 'st-gegner'} aria-labelledby={kennung}>
      <header className="st-gegner-kopf">
        <h2 id={kennung} className="st-gegner-name">
          {gegner.name}
        </h2>
        {gegner.amZug && <span className="st-abzeichen">{TISCH.istDran}</span>}
        <span className="st-gegner-info">{handkartenText(gegner.handkarten)}</span>
        <Ablage ablage={gegner.ablage} eigene={false} />
        {gegner.gruben.map((grube) => (
          <Grube key={grube.karte.id} grube={grube} />
        ))}
      </header>
      <Schlangen schlangen={gegner.schlangen} besitzer={{ name: gegner.name, ich: false }} groesse={KARTENGROESSE.gegner} />
    </article>
  )
}
