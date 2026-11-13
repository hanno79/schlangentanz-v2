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
      klasse="regelseite"
      titel={REGELHILFE.titel}
      text={REGELHILFE.text}
      kopfZusatz={
        <p className="regelseite__website">
          <a
            className="rahmen-verweis rahmen-verweis--haupt"
            href={REGELHILFE.websiteAdresse}
            target="_blank"
            rel="noopener noreferrer"
          >
            {REGELHILFE.websiteVerweis}
          </a>
        </p>
      }
      fuss={<Verweis ziel="lobby">{ZURUECK_ZUR_LOBBY}</Verweis>}
    >
      <div className="regelhilfe">
        <Zugablauf />
        <Kartenuebersicht />
      </div>
    </Rahmen>
  )
}
