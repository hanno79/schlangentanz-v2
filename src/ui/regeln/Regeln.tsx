import { REGELN, ZURUECK_ZUR_LOBBY } from '../lobby/texte'
import Rahmen from '../lobby/Rahmen'
import Verweis from '../lobby/Verweis'

/** Platzhalter unter `/regeln`, bis O9 die Regelhilfe baut: verweist auf die Regeln der Website. */
export default function Regeln() {
  return (
    <Rahmen
      testId="regeln"
      titel={REGELN.titel}
      text={REGELN.text}
      fuss={
        <>
          <a className="rahmen-verweis rahmen-verweis--haupt" href={REGELN.adresse} target="_blank" rel="noopener noreferrer">
            {REGELN.verweis}
          </a>
          <Verweis ziel="lobby">{ZURUECK_ZUR_LOBBY}</Verweis>
        </>
      }
    />
  )
}
