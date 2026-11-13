import { ermittleEntscheider, werteSchlangen } from '../../engine'
import type {
  AufgabenkarteInfo,
  Auslagekarte,
  Farbe,
  FarbkarteInfo,
  Partiephase,
  GewerteteGruppe,
  Schlange,
  Sonderkartenname,
  SonderkarteInfo,
  Spieler,
  Spielkarte,
  Spielzustand,
} from '../../engine'

/*
Was der Mensch am Tisch sehen darf (Plan O3 und O4, B2). Der Tisch zeichnet nur
diese Sicht und bekommt den vollen Zustand nie zu sehen: Was hier nicht steht,
kann er nicht verraten. Von den Gegnern stehen deshalb nur offene Dinge darin;
ihre Hand nur als Zahl, ihre geheime Aufgabe gar nicht.

O4 baut den Teil, den der Tisch zum Anzeigen braucht. Was die Bedienung braucht
(erlaubte Aktionen, Auswahl), ergänzt O3.

Regeln stehen hier keine: Farbgruppen kommen aus der Wertung der Engine, wer
entscheidet aus `ermittleEntscheider`.
*/

/** Ein Spieler, von dem die Sicht spricht; `ich` ist der Mensch. */
export interface Person {
  name: string
  ich: boolean
}

export interface KarteInSchlange {
  karte: Spielkarte
  /** Die Farbgruppe (ab 3 Karten, A11), zu der die Karte in der Wertung der Engine zählt. */
  gruppe: { farbe: Farbe; anfang: boolean; ende: boolean } | null
  /** Die zwei Farbkarten unter einer Farbenfusion (A7.7), sonst `null`. */
  unter: readonly [FarbkarteInfo, FarbkarteInfo] | null
}

export interface SchlangeAnsicht {
  id: string
  karten: KarteInSchlange[]
  farbgruppen: { farbe: Farbe; laenge: number }[]
}

export interface AblageAnsicht {
  anzahl: number
  /** Die oberste Karte; nur sie liegt offen (A4). */
  oben: Spielkarte | null
}

/** Eine Schlangengrube vor diesem Spieler, bis er ausgesetzt hat (A7.6). */
export interface GrubeAnsicht {
  karte: SonderkarteInfo
  von: Person
}

interface PlatzAnsicht {
  id: string
  name: string
  schlangen: SchlangeAnsicht[]
  ablage: AblageAnsicht
  gruben: GrubeAnsicht[]
  amZug: boolean
}

export interface GegnerAnsicht extends PlatzAnsicht {
  /** Nur die Zahl: Fremde Handkarten sieht der Mensch nie (B2). */
  handkarten: number
}

export interface EigeneAnsicht extends PlatzAnsicht {
  hand: Spielkarte[]
  geheimeAufgabe: AufgabenkarteInfo | null
  comeback: { karte: Auslagekarte; verbraucht: boolean } | null
  risikoKarten: Auslagekarte[]
}

export interface StatusAnsicht {
  partiephase: Partiephase
  amZug: Person
  teilzug: 1 | 2
  abschnitt: 'Ausspielen' | 'Abwerfen'
  /** Eine angesagte Sonderkarte, über die noch jemand entscheidet (A6). */
  schwebend: { karte: Sonderkartenname; von: Person; entscheidet: Person } | null
}

export interface TischAnsicht {
  erweiterung: boolean
  ich: EigeneAnsicht
  /** In Sitzordnung, beginnend beim Spieler nach dem Menschen (A5). */
  gegner: GegnerAnsicht[]
  nachziehstapel: number
  offeneAufgaben: AufgabenkarteInfo[]
  status: StatusAnsicht
}

function schlangeAnsicht(schlange: Schlange, gruppen: readonly GewerteteGruppe[]): SchlangeAnsicht {
  const gruppeVon = new Map<string, KarteInSchlange['gruppe']>()
  for (const gruppe of gruppen) {
    gruppe.kartenIds.forEach((id, stelle) => {
      gruppeVon.set(id, { farbe: gruppe.farbe, anfang: stelle === 0, ende: stelle === gruppe.kartenIds.length - 1 })
    })
  }
  return {
    id: schlange.id,
    karten: schlange.karten.map((karte) => ({
      karte,
      gruppe: gruppeVon.get(karte.id) ?? null,
      unter: schlange.fusionen.find((fusion) => fusion.karteId === karte.id)?.unter ?? null,
    })),
    farbgruppen: gruppen.map(({ farbe, laenge }) => ({ farbe, laenge })),
  }
}

/**
 * Die Schlangen eines Spielers mit ihren Farbgruppen. Die Gruppen kommen aus der
 * Wertung der Engine; sie wertet alle Schlangen eines Spielers zusammen, weil die
 * Farbe eines Jokers mit Erweiterung vom Vielfaltbonus beider Schlangen abhängt.
 */
function schlangenAnsicht(schlangen: readonly Schlange[], erweiterung: boolean): SchlangeAnsicht[] {
  const wertung = werteSchlangen(schlangen, erweiterung).schlangen
  return schlangen.map((schlange, index) => schlangeAnsicht(schlange, wertung[index].gruppen))
}

/** Die Sicht des Menschen auf den Zustand. Wirft, wenn nicht genau ein Mensch am Tisch sitzt (B2). */
export function tischAnsicht(zustand: Spielzustand): TischAnsicht {
  const menschen = zustand.spieler.flatMap((spieler, index) => (spieler.steuerung === 'Mensch' ? [index] : []))
  if (menschen.length !== 1) {
    throw new Error(`Am Tisch muss genau ein Mensch sitzen (B2), es sind ${menschen.length}.`)
  }
  const mensch = menschen[0]
  const person = (index: number): Person => ({ name: zustand.spieler[index].name, ich: index === mensch })

  const platz = (spieler: Spieler, index: number): PlatzAnsicht => ({
    id: spieler.id,
    name: spieler.name,
    schlangen: schlangenAnsicht(spieler.schlangen, zustand.erweiterung),
    ablage: { anzahl: spieler.ablagestapel.length, oben: spieler.ablagestapel.at(-1) ?? null },
    gruben: zustand.ausliegendeGruben.filter((grube) => grube.vor === index).map((grube) => ({ karte: grube.karte, von: person(grube.gespieltVon) })),
    amZug: zustand.zug.spielerIndex === index,
  })

  const ich = zustand.spieler[mensch]
  const anzahl = zustand.spieler.length
  const gegner = Array.from({ length: anzahl - 1 }, (_, schritt) => (mensch + 1 + schritt) % anzahl).map((index) => ({
    ...platz(zustand.spieler[index], index),
    handkarten: zustand.spieler[index].hand.length,
  }))

  const { schwebend } = zustand
  const entscheider = ermittleEntscheider(zustand)
  const angreifer = schwebend === null ? -1 : zustand.spieler.findIndex((spieler) => spieler.id === schwebend.aktion.spielerId)

  return {
    erweiterung: zustand.erweiterung,
    ich: {
      ...platz(ich, mensch),
      hand: ich.hand,
      geheimeAufgabe: ich.geheimeAufgabe,
      comeback: ich.comeback,
      risikoKarten: ich.risikoKarten,
    },
    gegner,
    nachziehstapel: zustand.nachziehstapel.length,
    offeneAufgaben: zustand.offeneAufgaben,
    status: {
      partiephase: zustand.partiephase,
      amZug: person(zustand.zug.spielerIndex),
      teilzug: zustand.zug.teilzug,
      abschnitt: zustand.zug.abschnitt,
      schwebend:
        schwebend === null || entscheider === null
          ? null
          : { karte: schwebend.karte.name, von: person(angreifer), entscheidet: person(entscheider) },
    },
  }
}
