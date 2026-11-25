/*
Der Ansager (Plan O11, Kriterium 2): die eine Stelle am Tisch, die ein
Bildschirmleser von selbst vorliest. Sie ist nicht zu sehen; was sie sagt,
steht sichtbar im Protokoll und in der Zugleiste.

Vorgelesen werden der jüngste Schritt (ein Gegnerzug, ein Angriff, eine
erfüllte Aufgabe, aber auch deine eigene Aktion) und, wenn du entscheidest,
was jetzt zu tun ist. Jeder Teil steckt in einem eigenen Knoten mit
Schlüssel: Ein neuer Schritt wird auch dann vorgelesen, wenn sein Text dem
vorigen gleicht, und ändert sich nur, was zu tun ist, wird der alte Schritt
nicht wiederholt. Die anderen Bereiche des Tischs lesen nicht von selbst vor
(`aria-live` fehlt oder steht auf „off“), sonst hörte man dasselbe doppelt.
Ausgenommen sind modale Dialoge: „Gewählt: n von m“ im Dialog „Zu viele
Handkarten“ liest der Dialog selbst vor, solange er offen ist.
*/

export interface AngesagterSchritt {
  /** Der wievielte Schritt dieser Seite; ein neuer Schritt bekommt einen neuen Knoten. */
  nummer: number
  text: string
}

export function Ansager({ schritt, jetzt }: { schritt: AngesagterSchritt | null; jetzt: string | null }) {
  return (
    <p className="nur-vorlesen" aria-live="polite" data-testid="ansager">
      {schritt !== null && <span key={`schritt-${schritt.nummer}`}>{schritt.text} </span>}
      {jetzt !== null && <span key={jetzt}>{jetzt}</span>}
    </p>
  )
}
