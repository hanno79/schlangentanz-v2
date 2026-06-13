/*
Author: rahn
Datum: 13.06.2026
Version: 1.0
Beschreibung: Gegnerische Schlangenreihe mit board-nahen Sonderkarten-Zielen für Waldtanz-Interaktionen.
*/
import type { SpielAktion, Spieler, Spielkarte } from '../engine'
import { farbeCssKlasse } from '../kartenfarben'

interface GegnerSchlangenListeProps {
  spieler: Spieler[]
  ausgewaehlteHandkarteId: string | null
  schlangenblockadeAktionen: Extract<SpielAktion, { typ: 'SchlangenblockadeSpielen' }>[]
  farbendiebAktionen: Extract<SpielAktion, { typ: 'FarbendiebSpielen' }>[]
  onAktion: (aktion: SpielAktion) => void
  aktionsLabel: (aktion: SpielAktion) => string
}

function schlangenKartenKurzlabel(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? `${karte.farbe} · ${karte.punkte} Punkte` : `Sonderkarte ${karte.name}`
}

function schlangenKartenAriaLabel(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte'
    ? `Farbkarte ${karte.id}: ${karte.farbe} mit ${karte.punkte} Punkten`
    : `Sonderkarte ${karte.id}: ${karte.name}`
}

function schlangenStatusLabel(zustand: Spieler['schlangen'][number]['zustand']): string {
  switch (zustand) {
    case 'aktiv': return 'spielbereit'
    case 'blockiert': return 'gerade blockiert'
    case 'geschuetzt': return 'geschützt'
  }
  const nichtErfassterZustand: never = zustand
  return nichtErfassterZustand
}

export default function GegnerSchlangenListe({
  spieler,
  ausgewaehlteHandkarteId,
  schlangenblockadeAktionen,
  farbendiebAktionen,
  onAktion,
  aktionsLabel,
}: GegnerSchlangenListeProps) {
  function findeBlockadeAktion(zielSpielerId: string, zielSchlangenId: string) {
    if (!ausgewaehlteHandkarteId) return null
    return schlangenblockadeAktionen.find(
      (aktion) => aktion.handkartenId === ausgewaehlteHandkarteId && aktion.zielSpielerId === zielSpielerId && aktion.zielSchlangenId === zielSchlangenId,
    ) ?? null
  }

  function findeFarbendiebAktionen(zielSpielerId: string, zielSchlangenId: string, zielKartenId: string) {
    if (!ausgewaehlteHandkarteId) return []
    return farbendiebAktionen.filter((aktion) => aktion.handkartenId === ausgewaehlteHandkarteId && aktion.zielSpielerId === zielSpielerId && aktion.zielSchlangenId === zielSchlangenId && aktion.zielKartenId === zielKartenId)
  }

  if (!spieler.some((eintrag) => eintrag.schlangen.length > 0)) {
    return <p>Keine gegnerischen Schlangen.</p>
  }

  return (
    <ul className="schlangenleiste">
      {spieler.flatMap((eintrag) =>
        eintrag.schlangen.map((schlange) => {
          const blockadeAktion = findeBlockadeAktion(eintrag.id, schlange.id)

          return (
            <li key={schlange.id} className={`schlangekarte schlangekarte--gegner${blockadeAktion ? ' schlangekarte--blockade-ziel' : ''}`}>
              <strong>{schlange.id}</strong>
              <span>Gehört zu: {eintrag.name}</span>
              <span className="schlangekarte__badge">{schlange.karten.length} Karten</span>
              <div className="schlangekarte__kartenreihe" role="list" aria-label={`Kartenreihe ${schlange.id}`}>
                {schlange.karten.map((karte) => {
                  const diebAktionen = findeFarbendiebAktionen(eintrag.id, schlange.id, karte.id)
                  return (
                    <div
                      key={karte.id}
                      className={`schlangekarte__karte schlangekarte__karte--${karte.typ === 'Farbkarte' ? `farbkarte schlangekarte__karte--farbe-${farbeCssKlasse(karte.farbe)}` : 'sonderkarte'}${diebAktionen.length > 0 ? ' schlangekarte__karte--sonderaktion-ziel schlangekarte__karte--farbendieb-ziel' : ''}`}
                      role="listitem"
                      aria-label={schlangenKartenAriaLabel(karte)}
                    >
                      <strong>{karte.id}</strong>
                      <span>{schlangenKartenKurzlabel(karte)}</span>
                      {diebAktionen.map((aktion) => (
                        <button
                          key={`${aktion.handkartenId}-${aktion.eigeneSchlangenId}-${aktion.einfügeIndex}`}
                          type="button"
                          className="schlangekarte__sonderaktion-button schlangekarte__sonderaktion-button--dieb"
                          aria-label={`Farbendieb im Schlangenbereich mit Karte ${aktion.handkartenId} von Schlange ${aktion.zielSchlangenId} Karte ${aktion.zielKartenId} auf Schlange ${aktion.eigeneSchlangenId} an Position ${aktion.einfügeIndex + 1}`}
                          title={aktionsLabel(aktion)}
                          onClick={() => onAktion(aktion)}
                        >
                          Farbendieb auf Position {aktion.einfügeIndex + 1}
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
              {blockadeAktion && (
                <button
                  type="button"
                  className="schlangekarte__sonderaktion-button schlangekarte__sonderaktion-button--blockade"
                  aria-label={`Schlangenblockade im Schlangenbereich mit Karte ${blockadeAktion.handkartenId} auf Schlange ${blockadeAktion.zielSchlangenId}`}
                  title={aktionsLabel(blockadeAktion)}
                  onClick={() => onAktion(blockadeAktion)}
                >
                  Schlangenblockade hier spielen
                </button>
              )}
              <span>Status: {schlangenStatusLabel(schlange.zustand)}</span>
            </li>
          )
        }),
      )}
    </ul>
  )
}
