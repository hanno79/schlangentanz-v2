import '../tokens.css'
import './regeln.css'
import Rahmen from '../lobby/Rahmen'
import { ZURUECK_ZUR_LOBBY } from '../lobby/texte'
import Verweis from '../lobby/Verweis'
import Kartenuebersicht from './Kartenuebersicht'
import { REGELHILFE } from './texte'
import Zugablauf from './Zugablauf'

/**
 * Die Regelseite unter `/regeln` (O9): Verweis auf die verbindliche
 * Spielanleitung der Website, ein Zug in fünf Schritten und alle Karten mit
 * ihrem Text.
 */
export default function Regeln() {
  return (
    <Rahmen
      testId="regeln"
      titel={REGELHILFE.titel}
      text={REGELHILFE.text}
      fuss={
        <Verweis ziel="lobby" className="regelhilfe__lobby">
          {ZURUECK_ZUR_LOBBY}
        </Verweis>
      }
    >
      <div className="regelhilfe">
        <p className="regelhilfe__website">
          <a className="regelhilfe__website-verweis" href={REGELHILFE.websiteAdresse} target="_blank" rel="noopener noreferrer">
            {REGELHILFE.websiteVerweis}
          </a>
        </p>
        <Zugablauf />
        <Kartenuebersicht />
      </div>
    </Rahmen>
  )
}
