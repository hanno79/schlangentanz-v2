import { offeneHandkarteDer } from '../../engine'
import type { Ereignis, Spielkarte, Spielzustand, Versetzung } from '../../engine'

/*
Welche Karte eine Versetzung bewegt, wenn sie offen ist (O10, Hinweis aus X7).
Die Engine lässt die Id einer Karte weg, die danach auf einer Hand liegt (B2),
auch wenn die Karte vorher offen lag: die aufgedeckte Karte einer
Risiko-Aktion, die für Aktion 2 angesagte Karte (D52, D77), eine Karte aus
einer Schlange oder von einem Ablagestapel. Wer am Tisch sass, hat sie
gesehen; Protokoll und Entwicklertisch nennen sie deshalb beim Namen statt
„verdeckte Karte“. Bestimmt wird sie aus dem Stand vor der Aktion. Vom
Ablagestapel eines Gegners ist nur die oberste Karte offen (A4); deinen
eigenen kennst du ganz.
*/

/** Warum eine Karte offen ist, deren Id die Engine weglässt. */
export type Offenheit = 'aufgedeckt' | 'angesagt' | 'offen'

/** Die Karte mit dieser Id, wo immer sie vor der Aktion lag. */
export function karteMitId(zustand: Spielzustand, karteId: string): Spielkarte {
  const orte: readonly (readonly Spielkarte[])[] = [
    zustand.nachziehstapel,
    zustand.aufgedeckt,
    ...zustand.spieler.flatMap((spieler) => [spieler.hand, spieler.ablagestapel, ...spieler.schlangen.flatMap((schlange) => [schlange.karten, ...schlange.fusionen.map((fusion) => fusion.unter)])]),
  ]
  for (const ort of orte) {
    const karte = ort.find((eintrag) => eintrag.id === karteId)
    if (karte !== undefined) return karte
  }
  throw new Error(`Die Karte ${karteId} liegt vor der Aktion nirgends am Tisch.`)
}

/** Die Karte, die vor der Aktion an diesem offenen Ort lag; `null`, wenn der Ort verdeckt ist. */
function offenAmOrt(vorher: Spielzustand, ereignisse: readonly Ereignis[], { von }: Versetzung, mensch: number): { karte: Spielkarte; offenheit: Offenheit } | null {
  switch (von.ort) {
    case 'Aufgedeckt': {
      // Aufgedeckt in diesem Schritt oder in einem früheren, dessen Entscheidung jetzt fällt.
      const gespielt = ereignisse.find((ereignis) => ereignis.typ === 'RisikoKarteGespielt')
      const karte = vorher.aufgedeckt[von.position] ?? (gespielt?.typ === 'RisikoKarteGespielt' ? karteMitId(vorher, gespielt.aufgedeckt) : undefined)
      return karte === undefined ? null : { karte, offenheit: 'aufgedeckt' }
    }
    case 'Hand': {
      const angesagt = offeneHandkarteDer(vorher.entscheidung)
      if (angesagt === null || angesagt.spielerIndex !== von.spielerIndex) return null
      return { karte: karteMitId(vorher, angesagt.karteId), offenheit: 'angesagt' }
    }
    case 'Schlange': {
      const karte = vorher.spieler[von.spielerIndex].schlangen.find((schlange) => schlange.id === von.schlangenId)?.karten[von.position]
      return karte === undefined ? null : { karte, offenheit: 'offen' }
    }
    case 'UnterFusion': {
      const fusion = vorher.spieler[von.spielerIndex].schlangen.find((schlange) => schlange.id === von.schlangenId)?.fusionen.find((eintrag) => eintrag.karteId === von.fusionId)
      const karte = fusion?.unter[von.position]
      return karte === undefined ? null : { karte, offenheit: 'offen' }
    }
    case 'Ablagestapel': {
      const stapel = vorher.spieler[von.spielerIndex].ablagestapel
      const offen = von.spielerIndex === mensch || von.position === stapel.length - 1
      return offen && stapel[von.position] !== undefined ? { karte: stapel[von.position], offenheit: 'offen' } : null
    }
    default:
      return null
  }
}

/**
 * Die Karte einer Versetzung, wenn sie offen ist: mit der Id, die die Engine
 * nennt, oder aus ihrem offenen Ort vor der Aktion. `null`, wenn sie verdeckt
 * bleibt, etwa vom Nachziehstapel gezogen. `mensch` ist der Sitz dessen, für
 * den gezeigt wird; seinen Ablagestapel kennt er ganz.
 */
export function offeneKarte(vorher: Spielzustand, ereignisse: readonly Ereignis[], versetzung: Versetzung, mensch: number): { karte: Spielkarte; offenheit: Offenheit | null } | null {
  if (versetzung.karteId !== null) return { karte: karteMitId(vorher, versetzung.karteId), offenheit: null }
  return offenAmOrt(vorher, ereignisse, versetzung, mensch)
}
