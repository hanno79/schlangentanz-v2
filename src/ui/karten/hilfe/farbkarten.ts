import type { Farbe } from '../../../engine'
import { punkteText } from '../kartentexte'
import { hilfeId, type Kartenhilfe } from './typen'

/*
Farbkarten haben in der Spielanleitung keinen eigenen Abschnitt. Ihr Text kommt
aus der Materialliste (A1), dem Zugablauf (A5) und der Punktezählung (A11).
*/

const FARBGRUPPE = 'Eine Farbgruppe besteht aus mindestens drei nebeneinanderliegenden Karten derselben Farbe in einer Schlange.'
const ANLEGEN =
  'Eine Farbkarte, um eine Schlange zu beginnen oder fortzusetzen (muss an einem beliebigen Ende der Schlange angelegt werden)'

const PUNKTE_JE_KARTE: Readonly<Record<number, string>> = {
  1: 'Blau, Rot, Gelb: 1 Punkt pro Karte in der Gruppe.',
  2: 'Violett, Braun: 2 Punkte pro Karte in der Gruppe.',
  3: 'Grün: 3 Punkte pro Karte in der Gruppe.',
}

function farbkarte(farbe: Farbe, punkte: number): Kartenhilfe {
  return {
    karte: { typ: 'Farbkarte', id: hilfeId(farbe), farbe, punkte },
    quellen: ['A1', 'A5', 'A11'],
    kurz: `${farbe} (${punkteText(punkte)})`,
    abschnitte: [{ inhalt: [ANLEGEN, FARBGRUPPE, PUNKTE_JE_KARTE[punkte]] }],
  }
}

export const FARBKARTEN_HILFE: readonly Kartenhilfe[] = [
  farbkarte('Blau', 1),
  farbkarte('Rot', 1),
  farbkarte('Gelb', 1),
  farbkarte('Violett', 2),
  farbkarte('Braun', 2),
  farbkarte('Grün', 3),
]
