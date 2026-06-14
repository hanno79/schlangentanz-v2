/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Board-naher Zielkompass für ausgewählte Handkarten im Waldtanz-Schlangenbereich.
*/

import type { SpielAktion } from '../engine'

interface WaldtanzZielkompassProps {
  ausgewaehlteHandkarteId: string | null
  karteAnlegenAktionen: Extract<SpielAktion, { typ: 'KarteAnlegen' }>[]
  neueSchlangeStartenAktionen: Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }>[]
  farbenschutzAktionen: Extract<SpielAktion, { typ: 'FarbenschutzSpielen' }>[]
  farbenfusionAktionen: Extract<SpielAktion, { typ: 'FarbenfusionSpielen' }>[]
  schlangenfrassAktionen: Extract<SpielAktion, { typ: 'SchlangenfrassSpielen' }>[]
  schlangenblockadeAktionen: Extract<SpielAktion, { typ: 'SchlangenblockadeSpielen' }>[]
  farbendiebAktionen: Extract<SpielAktion, { typ: 'FarbendiebSpielen' }>[]
}

function plural(anzahl: number, singular: string, pluralText: string) {
  return anzahl === 1 ? singular : pluralText
}

export default function WaldtanzZielkompass({
  ausgewaehlteHandkarteId,
  karteAnlegenAktionen,
  neueSchlangeStartenAktionen,
  farbenschutzAktionen,
  farbenfusionAktionen,
  schlangenfrassAktionen,
  schlangenblockadeAktionen,
  farbendiebAktionen,
}: WaldtanzZielkompassProps) {
  const gewaehlt = ausgewaehlteHandkarteId
  const startZiel = Boolean(gewaehlt && neueSchlangeStartenAktionen.some(a => a.handkartenId === gewaehlt))
  const eigeneSchlangenZiele = new Set([
    ...karteAnlegenAktionen.filter(a => a.handkartenId === gewaehlt).map(a => a.schlangenId),
    ...farbenschutzAktionen.filter(a => a.handkartenId === gewaehlt).map(a => a.zielSchlangenId),
  ])
  const eigeneKartenZiele = new Set([
    ...farbenfusionAktionen.filter(a => a.handkartenId === gewaehlt).map(a => `${a.zielSchlangenId}:${a.zielKartenId}`),
    ...schlangenfrassAktionen
      .filter(a => a.handkartenId === gewaehlt && a.ziele.length === 1)
      .flatMap(a => a.ziele.map(z => `${z.spielerId}:${z.schlangenId}:${z.kartenId}`)),
  ])
  const gegnerZiele = new Set([
    ...schlangenblockadeAktionen.filter(a => a.handkartenId === gewaehlt).map(a => `${a.zielSpielerId}:${a.zielSchlangenId}`),
    ...farbendiebAktionen.filter(a => a.handkartenId === gewaehlt).map(a => `${a.zielSpielerId}:${a.zielSchlangenId}:${a.zielKartenId}`),
  ])
  const zielChips = [
    ...(startZiel ? ['Neue Schlange'] : []),
    ...(eigeneSchlangenZiele.size > 0 ? ['Eigene Schlange'] : []),
    ...(eigeneKartenZiele.size > 0 ? ['Karten-Ziel'] : []),
    ...(gegnerZiele.size > 0 ? ['Gegner-Ziel'] : []),
  ]
  const zielAnzahl = (startZiel ? 1 : 0) + eigeneSchlangenZiele.size + eigeneKartenZiele.size + gegnerZiele.size

  return (
    <section className="schlangen-zielkompass" aria-label="Waldtanz-Zielkompass">
      {gewaehlt ? (
        <>
          <p><strong>Ausgewählt: {gewaehlt}</strong></p>
          <p>{zielAnzahl} {plural(zielAnzahl, 'Brettziel', 'Brettziele')} bereit</p>
          {zielChips.length > 0 ? (
            <ul className="schlangen-zielkompass__chips">
              {zielChips.map(label => <li key={label} className="schlangen-zielkompass__chip">{label}</li>)}
            </ul>
          ) : <p>Für diese Karte leuchtet gerade kein Brettziel.</p>}
          <p>Leuchtende Ziele sind direkt auf dem Brett spielbar.</p>
        </>
      ) : (
        <p>Wähle oder ziehe eine Handkarte, dann leuchten die passenden Brettziele auf.</p>
      )}
    </section>
  )
}
