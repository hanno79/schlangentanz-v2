import { SPIELER_MAX, SPIELER_MIN } from '../engine'

/** Was eine Adresse unter `/dev` verlangt. */
export type EntwicklerAnfrage =
  | { art: 'start' }
  | { art: 'szenarien' }
  | { art: 'szenario'; name: string }
  | { art: 'partie'; saat: number; spieler: number; erweiterung: 0 | 1 }
  | EntwurfAnfrage
  | { art: 'fehler'; meldung: string }

/** Eine Entwurfsseite unter `/dev/entwurf` (O1): Lobby, Tisch oder Ergebnis mit festen Beispieldaten. */
export type EntwurfAnfrage =
  | { art: 'entwurf'; seite: 'uebersicht' | 'lobby' | 'ergebnis' }
  | { art: 'entwurf'; seite: 'tisch'; gegner: number; karte: string | null }

const GROESSTE_SAAT = 2 ** 32 - 1

function fehler(meldung: string): EntwicklerAnfrage {
  return { art: 'fehler', meldung }
}

/**
 * Liest Pfad und Suchteil einer Adresse unter `/dev`.
 *
 * Ungültiges wird nie still ersetzt: Eine falsche Saat soll nicht unbemerkt eine
 * andere Partie zeigen, sondern sagen, was falsch ist. Einzig `erweiterung`
 * darf fehlen und gilt dann als 0, weil Kriterium 1 des Plans die Adresse ohne
 * diesen Parameter nennt.
 */
export function leseEntwicklerAnfrage(pfad: string, suche: string): EntwicklerAnfrage {
  // Ein Schrägstrich am Ende ist dieselbe Seite: `/dev/` wie `/dev`, `/dev/szenarien/` wie `/dev/szenarien`.
  const seite = pfad.replace(/\/+$/, '')
  if (seite === '/dev/szenarien') return { art: 'szenarien' }
  if (seite === '/dev/entwurf' || seite.startsWith('/dev/entwurf/')) return leseEntwurf(seite, pfad, suche)
  if (seite !== '/dev') return fehler(`Unbekannte Seite ${pfad}. Es gibt /dev, /dev/szenarien und /dev/entwurf.`)

  const parameter = new URLSearchParams(suche)
  const szenario = parameter.get('szenario')
  const saat = parameter.get('seed')
  const spieler = parameter.get('spieler')
  const erweiterung = parameter.get('erweiterung')
  const hatPartieParameter = saat !== null || spieler !== null || erweiterung !== null

  if (szenario !== null) {
    if (hatPartieParameter) {
      return fehler('Parameter szenario lässt sich nicht mit seed, spieler oder erweiterung kombinieren.')
    }
    if (szenario === '') return fehler('Parameter szenario ist leer.')
    return { art: 'szenario', name: szenario }
  }

  if (!hatPartieParameter) return { art: 'start' }

  if (saat === null) return fehler('Parameter seed fehlt.')
  if (!/^\d+$/.test(saat) || Number(saat) > GROESSTE_SAAT) {
    return fehler(`Parameter seed muss eine ganze Zahl von 0 bis ${GROESSTE_SAAT} sein, erhalten: „${saat}“.`)
  }
  const bereich = `${SPIELER_MIN} bis ${SPIELER_MAX}`
  if (spieler === null) return fehler(`Parameter spieler fehlt (${bereich}).`)
  const anzahl = /^\d+$/.test(spieler) ? Number(spieler) : NaN
  if (!(anzahl >= SPIELER_MIN && anzahl <= SPIELER_MAX)) {
    return fehler(`Parameter spieler muss eine Zahl von ${bereich} sein, erhalten: „${spieler}“.`)
  }
  if (erweiterung !== null && erweiterung !== '0' && erweiterung !== '1') {
    return fehler(`Parameter erweiterung muss 0 oder 1 sein, erhalten: „${erweiterung}“.`)
  }

  return {
    art: 'partie',
    saat: Number(saat),
    spieler: anzahl,
    erweiterung: erweiterung === '1' ? 1 : 0,
  }
}

const ENTWURFSSEITEN = ['lobby', 'tisch', 'ergebnis'] as const

/** `/dev/entwurf[/<seite>]`; nur der Tisch nimmt Parameter (`gegner`, `karte`). */
function leseEntwurf(seite: string, pfad: string, suche: string): EntwicklerAnfrage {
  const name = seite.slice('/dev/entwurf/'.length)
  if (seite === '/dev/entwurf') return { art: 'entwurf', seite: 'uebersicht' }
  if (name === 'lobby' || name === 'ergebnis') return { art: 'entwurf', seite: name }
  if (name !== 'tisch') {
    return fehler(`Unbekannte Entwurfsseite ${pfad}. Es gibt ${ENTWURFSSEITEN.map((s) => `/dev/entwurf/${s}`).join(', ')}.`)
  }

  const parameter = new URLSearchParams(suche)
  const gegner = parameter.get('gegner') ?? '3'
  if (!/^[123]$/.test(gegner)) return fehler(`Parameter gegner muss 1, 2 oder 3 sein, erhalten: „${gegner}“.`)
  const karte = parameter.get('karte')
  if (karte === '') return fehler('Parameter karte ist leer.')
  return { art: 'entwurf', seite: 'tisch', gegner: Number(gegner), karte }
}
