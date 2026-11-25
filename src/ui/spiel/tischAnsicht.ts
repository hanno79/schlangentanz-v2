import { berechneZwischenstand, ermittleAktionen, ermittleEntscheider, offeneHandkarteDer, zugBeendenGesperrt } from '../../engine'
import type {
  Ablehnung,
  AufgabenkarteInfo,
  Auslagekarte,
  Farbe,
  FarbkarteInfo,
  Partiephase,
  GewerteteGruppe,
  KartenAktion,
  Schlange,
  Sonderkartenname,
  SonderkarteInfo,
  SpielAktion,
  Spieler,
  Spielkarte,
  Spielzustand,
} from '../../engine'
import { grundFuerDich } from '../tisch/gruende'

/*
Was der Mensch am Tisch sehen darf (Plan O3 und O4, B2). Der Tisch zeichnet nur
diese Sicht und bekommt den vollen Zustand nie zu sehen: Was hier nicht steht,
kann er nicht verraten. Von den Gegnern stehen deshalb nur offene Dinge darin;
ihre Hand nur als Zahl, ihre geheime Aufgabe gar nicht.

O4 baut den Teil, den der Tisch zum Anzeigen braucht. O3 ergänzt, was die
Bedienung braucht: die Aktionen, die der Mensch jetzt wählen darf. Sie stehen
nur darin, solange er entscheidet; die Aktionen eines Gegners nennen dessen
Handkarten (B2, „auch nicht mittelbar über angebotene Aktionen“). Von der Karte
zur fertigen Aktion führt `auswahl.ts`.

Regeln stehen hier keine: Farbgruppen und Punkte kommen aus der Wertung der
Engine, wer entscheidet aus `ermittleEntscheider`. Die Punkte sind der
Zwischenstand aus deiner Sicht (O8, Kriterium 5): ohne Kettenbonus und ohne die
geheimen Aufgaben der Gegner. Nach Spielende ist niemand am Zug, auch wenn
`zug.spielerIndex` beim zuletzt Spielenden stehen bleibt.

Mit der Erweiterung (O10) kommt dazu, was offen am Tisch liegt: die erfüllten
Aufgaben jedes Spielers, die Auslage der Gegner (Comeback-Karte und Zahl der
Risiko-Karten), offen aufgedeckte Karten und eine offene Entscheidung. Von
einer fremden Hand steht darin nur die Farbkarte, die ein Spieler für
Risiko-Aktion 2 angesagt hat; sie ist eine offene Ansage (B2, D52, D77). Ob
deine geheime Aufgabe erfüllt ist, siehst nur du (D35).
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
  /** Nach Spielende bei niemandem. */
  amZug: boolean
  /** Der Zwischenstand der Engine aus deiner Sicht (`berechneZwischenstand`). */
  punkte: number
  /** Die offenen Aufgaben, die der Spieler erfüllt und zu sich genommen hat (A9). */
  erfuellteAufgaben: AufgabenkarteInfo[]
}

export interface GegnerAnsicht extends PlatzAnsicht {
  /** Nur die Zahl: Fremde Handkarten sieht der Mensch nie (B2). */
  handkarten: number
  /** Die Comeback-Karte liegt offen vor ihm (A4, A8.1); `null` ohne Erweiterung. */
  comeback: { verbraucht: boolean } | null
  /** Wie viele Risiko-Karten noch offen vor ihm liegen (A4, A8.2). */
  risikoKarten: number
}

export interface EigeneAnsicht extends PlatzAnsicht {
  hand: Spielkarte[]
  /** Dein ganzer Ablagestapel, unterste Karte zuerst; aus ihm wählst du bei Risiko-Aktion 4 (A8.2, D54). */
  ablagestapel: Spielkarte[]
  geheimeAufgabe: AufgabenkarteInfo | null
  /** D35: Ob deine geheime Aufgabe in einem deiner Züge erfüllt war; nur du siehst es. */
  geheimeAufgabeErfuellt: boolean
  comeback: { karte: Auslagekarte; verbraucht: boolean } | null
  risikoKarten: Auslagekarte[]
}

/** Eine offene Entscheidung (X3, A8.2): wer entscheidet, wer sie ausgelöst hat und was dabei offen genannt ist. */
export interface EntscheidungAnsicht {
  /** Die Art, wie sie offen in der Entscheidung steht (`entscheidungsarten.ts`). */
  art: string
  entscheidet: Person
  ausgeloestVon: Person
  /** D52, D77: die Farbkarte, die der Spieler für Risiko-Aktion 2 angesagt hat, offen für alle; sonst `null`. */
  angesagt: Spielkarte | null
  /** A8.2 Aktion 3: die Id der benannten Karte in der Schlange dessen, der entscheidet; sonst `null`. */
  schlangenkarte: string | null
}

export interface StatusAnsicht {
  partiephase: Partiephase
  /** `null` nach Spielende: Dann ist niemand mehr am Zug. */
  amZug: Person | null
  teilzug: 1 | 2
  abschnitt: 'Ausspielen' | 'Abwerfen'
  /**
   * Eine angesagte Sonderkarte, über die noch jemand entscheidet (A6). Karte und
   * Ansage liegen offen (B2: die Ansage ist die Auswahl von Karte und Ziel); die
   * Abwehrfrage nennt daraus Karte und Ziel (O6).
   */
  schwebend: { karte: Sonderkartenname; von: Person; entscheidet: Person; angesagt: SonderkarteInfo; ansage: KartenAktion } | null
  /** Wie viele Zusatzaktionen dieser Teilzug von Comeback-Karte oder Schlangenkorb bekommen hat (A8.1, A7.10). */
  zusatzaktionen: number
  /** Wer über eine offene Entscheidung der Erweiterung wählt (X3); sonst `null`. */
  entscheidet: Person | null
}

export interface TischAnsicht {
  erweiterung: boolean
  ich: EigeneAnsicht
  /** In Sitzordnung, beginnend beim Spieler nach dem Menschen (A5). */
  gegner: GegnerAnsicht[]
  nachziehstapel: number
  offeneAufgaben: AufgabenkarteInfo[]
  /** Offen vom Nachziehstapel aufgedeckt, bis eine Entscheidung sie weiterlegt (A8.2). */
  aufgedeckt: Spielkarte[]
  /** Eine offene Entscheidung, auch eine, die ein Gegner trifft; was er wählen kann, steht nicht darin (B2). */
  entscheidung: EntscheidungAnsicht | null
  status: StatusAnsicht
  /** Was du jetzt tun darfst, wie die Engine es aufzählt (U3); leer, solange ein Gegner entscheidet oder die Partie beendet ist. */
  aktionen: SpielAktion[]
  /** Warum du deinen Zug jetzt nicht beenden darfst, mit dem Grund der Engine in Du-Form (O5, O6); `null`, wenn du darfst oder nicht entscheidest. */
  zugBeendenGesperrt: string | null
}

/** Eine Schlange mit den Gruppen aus einer Wertung der Engine; auch die Wertung nach Spielende zeichnet so (O8). */
export function schlangeAnsicht(schlange: Schlange, gruppen: readonly GewerteteGruppe[]): SchlangeAnsicht {
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

/** Der Sitz des Menschen. Wirft, wenn nicht genau ein Mensch am Tisch sitzt (B2). */
export function menschIndex(zustand: Spielzustand): number {
  const menschen = zustand.spieler.flatMap((spieler, index) => (spieler.steuerung === 'Mensch' ? [index] : []))
  if (menschen.length !== 1) {
    throw new Error(`Am Tisch muss genau ein Mensch sitzen (B2), es sind ${menschen.length}.`)
  }
  return menschen[0]
}

/** Die Spieler nach ihrer Stelle in `spieler`, so wie der Mensch sie sieht. */
export function personen(zustand: Spielzustand): (index: number) => Person {
  const mensch = menschIndex(zustand)
  return (index) => ({ name: zustand.spieler[index].name, ich: index === mensch })
}

/** Der Grund einer Ablehnung, wie er am Tisch steht: in Du-Form, wenn er dich nennt (O6). */
export function grundAmTisch(zustand: Spielzustand, ablehnung: Ablehnung): string {
  return grundFuerDich(ablehnung, personen(zustand))
}

/** Die offene Entscheidung, wie jeder sie sehen darf (B2): Art, Beteiligte und die offen genannten Karten (D52, D77). */
function entscheidungAnsicht(zustand: Spielzustand, person: (index: number) => Person): EntscheidungAnsicht | null {
  const { entscheidung } = zustand
  if (entscheidung === null) return null
  const offen = offeneHandkarteDer(entscheidung)
  const angesagt = offen === null ? null : zustand.spieler[offen.spielerIndex].hand.find((karte) => karte.id === offen.karteId)
  if (angesagt === undefined) throw new Error(`Die angesagte Karte ${offen?.karteId} liegt nicht auf der Hand, die die Entscheidung nennt (D52).`)
  const { schlangenkarte } = entscheidung.daten
  return {
    art: entscheidung.art,
    entscheidet: person(entscheidung.entscheider),
    ausgeloestVon: person(entscheidung.ausgeloestVon),
    angesagt,
    schlangenkarte: schlangenkarte === undefined ? null : String(schlangenkarte),
  }
}

/** Die Sicht des Menschen auf den Zustand. Wirft, wenn nicht genau ein Mensch am Tisch sitzt (B2). */
export function tischAnsicht(zustand: Spielzustand): TischAnsicht {
  const mensch = menschIndex(zustand)
  const person = personen(zustand)
  const beendet = zustand.partiephase === 'Beendet'
  const zwischenstand = berechneZwischenstand(zustand, zustand.spieler[mensch].id).spieler

  const platz = (spieler: Spieler, index: number): PlatzAnsicht => ({
    id: spieler.id,
    name: spieler.name,
    // Die Gruppen kommen aus der Wertung der Engine; sie wertet alle Schlangen eines Spielers zusammen, weil die
    // Farbe eines Jokers mit Erweiterung vom Vielfaltbonus beider Schlangen abhängt.
    schlangen: spieler.schlangen.map((schlange, nummer) => schlangeAnsicht(schlange, zwischenstand[index].schlangen[nummer].gruppen)),
    ablage: { anzahl: spieler.ablagestapel.length, oben: spieler.ablagestapel.at(-1) ?? null },
    gruben: zustand.ausliegendeGruben.filter((grube) => grube.vor === index).map((grube) => ({ karte: grube.karte, von: person(grube.gespieltVon) })),
    amZug: !beendet && zustand.zug.spielerIndex === index,
    punkte: zwischenstand[index].summe,
    erfuellteAufgaben: spieler.erfuellteAufgaben,
  })

  const ich = zustand.spieler[mensch]
  const anzahl = zustand.spieler.length
  const gegner = Array.from({ length: anzahl - 1 }, (_, schritt) => (mensch + 1 + schritt) % anzahl).map((index) => ({
    ...platz(zustand.spieler[index], index),
    handkarten: zustand.spieler[index].hand.length,
    comeback: zustand.spieler[index].comeback === null ? null : { verbraucht: zustand.spieler[index].comeback.verbraucht },
    risikoKarten: zustand.spieler[index].risikoKarten.length,
  }))

  const { schwebend } = zustand
  const entscheider = ermittleEntscheider(zustand)
  const gesperrt = entscheider === mensch ? zugBeendenGesperrt(zustand) : null
  const angreifer = schwebend === null ? -1 : zustand.spieler.findIndex((spieler) => spieler.id === schwebend.aktion.spielerId)

  return {
    erweiterung: zustand.erweiterung,
    ich: {
      ...platz(ich, mensch),
      hand: ich.hand,
      ablagestapel: ich.ablagestapel,
      geheimeAufgabe: ich.geheimeAufgabe,
      geheimeAufgabeErfuellt: ich.geheimeAufgabeErfuellt,
      comeback: ich.comeback,
      risikoKarten: ich.risikoKarten,
    },
    gegner,
    nachziehstapel: zustand.nachziehstapel.length,
    offeneAufgaben: zustand.offeneAufgaben,
    aufgedeckt: zustand.aufgedeckt,
    entscheidung: entscheidungAnsicht(zustand, person),
    status: {
      partiephase: zustand.partiephase,
      amZug: beendet ? null : person(zustand.zug.spielerIndex),
      teilzug: zustand.zug.teilzug,
      abschnitt: zustand.zug.abschnitt,
      schwebend:
        schwebend === null || entscheider === null
          ? null
          : { karte: schwebend.karte.name, von: person(angreifer), entscheidet: person(entscheider), angesagt: schwebend.karte, ansage: schwebend.aktion },
      zusatzaktionen: beendet ? 0 : zustand.zug.zusatzaktionen.length,
      entscheidet: zustand.entscheidung === null ? null : person(zustand.entscheidung.entscheider),
    },
    aktionen: entscheider === mensch ? ermittleAktionen(zustand) : [],
    zugBeendenGesperrt: gesperrt === null ? null : grundFuerDich(gesperrt, person),
  }
}
