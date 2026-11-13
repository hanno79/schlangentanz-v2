/*
Alle Anzeigetexte des App-Rahmens an einer Stelle: Lobby, vorläufiger
Spieltisch, Regelseite und die Seite für unbekannte Adressen.
*/

export const SPIELNAME = 'Schlangentanz'

export const SEITENTITEL = {
  lobby: SPIELNAME,
  spiel: `Spieltisch · ${SPIELNAME}`,
  regeln: `Regeln · ${SPIELNAME}`,
  unbekannt: `Seite nicht gefunden · ${SPIELNAME}`,
} as const

export const ZURUECK_ZUR_LOBBY = 'Zurück zur Lobby'

export const LOBBY = {
  untertitel: 'Du gegen bis zu drei KI-Gegner',
  gegnerLegende: 'Gegner',
  gegner: (anzahl: number) => `${anzahl} Gegner`,
  erweiterung: 'Mit Erweiterung',
  an: 'An',
  aus: 'Aus',
  neuePartie: 'Neue Partie',
  weiterspielen: 'Weiterspielen',
  laufendePartie: 'Laufende Partie',
  regeln: 'Regeln',
  frage: 'Es läuft schon eine Partie. Eine neue Partie überschreibt sie.',
  bestaetigen: 'Ja, neue Partie',
  abbrechen: 'Abbrechen',
}

/** „an“ oder „aus“. */
export function erweiterungWort(erweiterung: boolean): string {
  return erweiterung ? 'an' : 'aus'
}

export function partieKurz(gegner: number, erweiterung: boolean): string {
  return `${LOBBY.gegner(gegner)}, Erweiterung ${erweiterungWort(erweiterung)}`
}

/** Hinweis, wenn sich die gespeicherte Partie beim Öffnen nicht lesen liess und verworfen wurde. */
export function verworfenHinweis(grund: 'aelteres-format' | 'beschaedigt', meldung: string): string {
  const warum =
    grund === 'aelteres-format'
      ? 'Sie stammt aus einem älteren Speicherformat, das diese Fassung des Spiels nicht mehr liest.'
      : `Der Spielstand ist beschädigt (${meldung.replace(/\.$/, '')}).`
  return `Die gespeicherte Partie liess sich nicht laden. ${warum} Sie wurde verworfen; starte eine neue Partie.`
}

export const SPIEL = {
  titel: 'Spieltisch im Aufbau',
  text: 'Die Partie ist angelegt und gespeichert. Den Spieltisch gibt es noch nicht; bis dahin lässt sie sich hier nicht spielen.',
  gegner: 'Gegner',
  erweiterung: 'Erweiterung',
  keinePartie: 'Es läuft keine Partie. Starte in der Lobby eine neue.',
}

export const REGELN = {
  titel: 'Regeln',
  text: 'Diese Seite entsteht gerade. Die vollständigen Spielregeln stehen auf der Website des Spiels.',
  verweis: 'Spielregeln auf schlangentanz.ch',
  adresse: 'https://schlangentanz.ch/rules',
}

export const UNBEKANNT = {
  titel: 'Diese Seite gibt es nicht',
  text: (pfad: string) => `Unter ${pfad} ist nichts zu finden.`,
}
