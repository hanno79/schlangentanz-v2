import { useState } from 'react'
import { findeLaufendePartie } from '../lobby/partie'
import { SPIEL, ZURUECK_ZUR_LOBBY, erweiterungWort } from '../lobby/texte'
import Rahmen from '../lobby/Rahmen'
import Verweis from '../lobby/Verweis'

/**
 * Vorläufige Seite unter `/spiel`, bis O3 bis O8 den Spieltisch bauen: Sie
 * zeigt, dass die Partie angelegt ist und mit welchen Einstellungen, und führt
 * zurück in die Lobby. Es läuft hier nichts.
 */
export default function SpielImAufbau() {
  const [partie] = useState(findeLaufendePartie)

  return (
    <Rahmen
      testId="spiel"
      titel={SPIEL.titel}
      text={partie === null ? SPIEL.keinePartie : SPIEL.text}
      fuss={<Verweis ziel="lobby">{ZURUECK_ZUR_LOBBY}</Verweis>}
    >
      {partie !== null && (
        <>
          <dl className="einstellungen">
            <div>
              <dt>{SPIEL.gegner}</dt>
              <dd data-testid="einstellung-gegner">{partie.gegner}</dd>
            </div>
            <div>
              <dt>{SPIEL.erweiterung}</dt>
              <dd data-testid="einstellung-erweiterung">{erweiterungWort(partie.erweiterung)}</dd>
            </div>
          </dl>
          <p className="hinweis" data-testid="hinweis-erweiterung">
            {SPIEL.hinweisErweiterung}
          </p>
        </>
      )}
    </Rahmen>
  )
}
