import { anwendeAktion, berechneZwischenstand, ermittleAktionen } from '../../engine'
import type { SchlangenhaeutungSpielenAktion, Spielzustand } from '../../engine'
import { menschVon, schlangenAnsicht } from './tischAnsicht'
import type { Person, SchlangeAnsicht } from './tischAnsicht'

/*
Was eine Schlangenhäutung bringt (Plan O7, Kriterium 3). Die Oberfläche rechnet
keine Punkte: Die Vorschau spielt die aufgezählte Häutung auf einer Abschrift
(`anwendeAktion` lässt den Zustand, wie er ist) und liest den Zwischenstand der
Engine aus deiner Sicht davor und danach, ohne Kettenbonus und ohne die
geheimen Aufgaben der Gegner (B2). In der Schlange eines Mitspielers ist die
Häutung erst angesagt (A6); gezeigt wird, was sie bewirkt, wenn er sie mit der
aufgezählten Reaktion durchlässt.

Den vollen Zustand hält nur die Partie-Steuerung; der Tisch bekommt die
Vorschau als Funktion und sieht nur ihr Ergebnis.
*/

/** Die Punkte des Besitzers einer Schlange vor und nach einer Schlangenhäutung. */
export interface HaeutungsVorschau {
  besitzer: Person
  vorher: number
  /** Die Punkte und die Schlange danach, wie die Engine sie wertet; `null` ohne Aktion. */
  nachher: { punkte: number; schlange: SchlangeAnsicht } | null
}

/** Die Vorschau für den Stand, den die Steuerung gerade hält. */
export type Haeutungsvorschauer = (schlangenId: string, aktion: SchlangenhaeutungSpielenAktion | null) => HaeutungsVorschau

export function haeutungsVorschau(zustand: Spielzustand, schlangenId: string, aktion: SchlangenhaeutungSpielenAktion | null): HaeutungsVorschau {
  const mensch = menschVon(zustand)
  const besitzer = zustand.spieler.findIndex((spieler) => spieler.schlangen.some((schlange) => schlange.id === schlangenId))
  if (besitzer < 0) throw new Error(`Die Schlange ${schlangenId} liegt nicht am Tisch.`)
  const betrachter = zustand.spieler[mensch].id
  const punkte = (stand: Spielzustand) => berechneZwischenstand(stand, betrachter).spieler[besitzer].summe
  const person: Person = { name: zustand.spieler[besitzer].name, ich: besitzer === mensch }
  const vorher = punkte(zustand)
  if (aktion === null) return { besitzer: person, vorher, nachher: null }
  if (aktion.schlangenId !== schlangenId) throw new Error(`Die Häutung gilt der Schlange ${aktion.schlangenId}, nicht ${schlangenId}.`)

  let danach = anwendeAktion(zustand, aktion).zustand
  if (danach.schwebend !== null) {
    const durchlassen = ermittleAktionen(danach).find((eintrag) => eintrag.typ === 'Reagieren' && eintrag.farbenschutzId === null)
    if (durchlassen === undefined) throw new Error(`Die Häutung der Schlange ${schlangenId} lässt sich nicht durchlassen; die Engine zählt kein „durchlassen“ auf.`)
    danach = anwendeAktion(danach, durchlassen).zustand
  }
  const schlangen = danach.spieler[besitzer].schlangen
  const schlange = schlangenAnsicht(schlangen, danach.erweiterung)[schlangen.findIndex((eintrag) => eintrag.id === schlangenId)]
  return { besitzer: person, vorher, nachher: { punkte: punkte(danach), schlange } }
}

/** Die Vorschau für diesen Stand, so wie die Partie-Steuerung sie dem Tisch gibt. */
export const vorschauFuer =
  (zustand: Spielzustand): Haeutungsvorschauer =>
  (schlangenId, aktion) =>
    haeutungsVorschau(zustand, schlangenId, aktion)
