import { useGespeichertePartie } from '../lobby/partie'
import { SPIEL, ZURUECK_ZUR_LOBBY, erweiterungWort } from '../lobby/texte'
import Rahmen from '../lobby/Rahmen'
import Verweis from '../lobby/Verweis'
import VerworfenHinweis from '../lobby/VerworfenHinweis'

/**
 * Vorläufige Seite unter `/spiel`, bis O3 bis O8 den Spieltisch bauen: Sie
 * zeigt, dass die Partie angelegt ist und mit welchen Einstellungen, und führt
 * zurück in die Lobby. Es läuft hier nichts.
 */
export default function SpielImAufbau() {
  const gespeichert = useGespeichertePartie()
  const partie = gespeichert.art === 'laufend' ? gespeichert.partie : null

  return (
    <Rahmen
      testId="spiel"
      titel={SPIEL.titel}
      text={partie === null ? SPIEL.keinePartie : SPIEL.text}
      fuss={<Verweis ziel="lobby">{ZURUECK_ZUR_LOBBY}</Verweis>}
    >
      {gespeichert.art === 'verworfen' && <VerworfenHinweis lage={gespeichert} />}
      {partie !== null && (
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
      )}
    </Rahmen>
  )
}
