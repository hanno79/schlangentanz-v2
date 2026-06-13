/*
Author: rahn
Datum: 13.06.2026
Version: 1.0
Beschreibung: Sichtbare Waldtanz-Buehne fuer zusammengefasste KI-Gegnerzuege.
*/

import type { Steuerung } from '../engine/types'

interface KiZugBuehneProps {
  spielerName: string
  steuerung: Steuerung
  protokoll: string[]
}

export default function KiZugBuehne({ spielerName, steuerung, protokoll }: KiZugBuehneProps) {
  const istKiAmZug = steuerung === 'KI'
  const hatProtokoll = protokoll.length > 0

  return (
    <section className={`ki-zug-buehne${istKiAmZug ? ' ki-zug-buehne--aktiv' : ''}`} aria-label="Gegnerzug">
      <h3>Gegnerzug</h3>
      {istKiAmZug && <p>{spielerName} wartet auf den Gegnerzug.</p>}
      {!istKiAmZug && hatProtokoll && <p>Gegnerzug abgeschlossen. Du bist wieder dran.</p>}
      {!istKiAmZug && !hatProtokoll && <p>Keine Gegneraktion ausstehend.</p>}
      {hatProtokoll && (
        <ol className="ki-zug-buehne__protokoll">
          {protokoll.map((eintrag, index) => <li key={`${eintrag}-${index}`}>{eintrag}</li>)}
        </ol>
      )}
    </section>
  )
}
