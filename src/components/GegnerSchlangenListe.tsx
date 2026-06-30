/*
Author: rahn
Datum: 13.06.2026
Version: 1.1
Beschreibung: Gegnerische Schlangenreihe mit board-nahen Sonderkarten-Zielen für Waldtanz-Interaktionen.
              M8b: `erstesFrassZiel`/`setErstesFrassZiel` werden von der Parent-Komponente
              `WaldtanzGegnerlichtung` als Props geliefert, damit mehrere
              `GegnerSchlangenListe`-Instanzen den 2-Ziel-Schlangenfrass-State teilen.
*/
import { ermittleRegenbogenWildfarben } from '../engine'
import type { SpielAktion, Spieler } from '../engine'
import SchlangenPfadKarte from './SchlangenPfadKarte'
import FarbendiebBeutekorb from './FarbendiebBeutekorb'
import SchlangenblockadeFessel from './SchlangenblockadeFessel'
import SchlangenfrassBissspur from './SchlangenfrassBissspur'
import type { LetzteAktionZiel } from '../aktionsziel/extrahiereAktionZiel'

export type FrassZiel = { spielerId: string; schlangenId: string; kartenId: string }
export type FrassAuswahl = FrassZiel & { handkartenId: string }

interface GegnerSchlangenListeProps {
  spieler: Spieler[]
  ausgewaehlteHandkarteId: string | null
  schlangenblockadeAktionen: Extract<SpielAktion, { typ: 'SchlangenblockadeSpielen' }>[]
  farbendiebAktionen: Extract<SpielAktion, { typ: 'FarbendiebSpielen' }>[]
  schlangenfrassAktionen: Extract<SpielAktion, { typ: 'SchlangenfrassSpielen' }>[]
  onAktion: (aktion: SpielAktion) => void
  aktionsLabel: (aktion: SpielAktion) => string
  aktiverZielspurKey?: string | null
  // M1dc: Spielmoment-Puls-Ziel, das aus der letzten Aktion abgeleitet wurde.
  // Wird benoetigt, weil Schlangenblockade/Farbendieb/Schlangenfrass auf
  // gegnerische Schlangen zielen — diese sollen dann ebenfalls kurz pulsieren.
  letzteAktionZiel?: LetzteAktionZiel | null
  // M8b: Extern koordinierter 2-Ziel-Schlangenfrass-State. Wird in der
  // Parent-Komponente `WaldtanzGegnerlichtung` gehalten, damit alle
  // Listen das Ziel-1 sehen und die Sofortaktion anbieten koennen.
  erstesFrassZiel: FrassAuswahl | null
  setErstesFrassZiel: (ziel: FrassAuswahl | null) => void
}

function istGleichesFrassZiel(a: FrassZiel, b: FrassZiel) {
  return a.spielerId === b.spielerId && a.schlangenId === b.schlangenId && a.kartenId === b.kartenId
}

function enthaeltFrassZiel(aktion: Extract<SpielAktion, { typ: 'SchlangenfrassSpielen' }>, ziel: FrassZiel) {
  return aktion.ziele.some((eintrag) => istGleichesFrassZiel(eintrag, ziel))
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
  schlangenfrassAktionen,
  onAktion,
  aktionsLabel,
  aktiverZielspurKey = null,
  letzteAktionZiel = null,
  erstesFrassZiel,
  setErstesFrassZiel,
}: GegnerSchlangenListeProps) {
  const aktivesErstesFrassZiel = erstesFrassZiel?.handkartenId === ausgewaehlteHandkarteId ? erstesFrassZiel : null

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

  function findeSchlangenfrassZweiZielAktionen(ziel: FrassZiel) {
    if (!ausgewaehlteHandkarteId) return []
    return schlangenfrassAktionen.filter((aktion) =>
      aktion.handkartenId === ausgewaehlteHandkarteId && aktion.ziele.length === 2 && enthaeltFrassZiel(aktion, ziel),
    )
  }

  const hatGegnerZauberziel = Boolean(ausgewaehlteHandkarteId) && (
    schlangenblockadeAktionen.some((aktion) => aktion.handkartenId === ausgewaehlteHandkarteId) ||
    farbendiebAktionen.some((aktion) => aktion.handkartenId === ausgewaehlteHandkarteId) ||
    schlangenfrassAktionen.some((aktion) => aktion.handkartenId === ausgewaehlteHandkarteId)
  )

  if (!spieler.some((eintrag) => eintrag.schlangen.length > 0)) {
    return <p>Keine gegnerischen Schlangen.</p>
  }

  // M8b: Kompass nur in der Liste anzeigen, die das aktive Ziel-1 besitzt,
  // damit der Hinweis nicht in jeder gegner-Liste dupliziert wird.
  const kompassSpielerId = aktivesErstesFrassZiel?.spielerId
  const kompassGehoertZuDieserListe = kompassSpielerId !== undefined
    && spieler.some((eintrag) => eintrag.id === kompassSpielerId)

  return (
    <>
      {aktivesErstesFrassZiel && kompassGehoertZuDieserListe && (
        <div className="schlangenfrass-zweiziel-kompass">
          <p>Erstes Ziel: {aktivesErstesFrassZiel.kartenId}. Wähle eine zweite gegnerische Karte.</p>
          <button type="button" onClick={() => setErstesFrassZiel(null)}>Zielauswahl zurücksetzen</button>
        </div>
      )}
      <ul className={`schlangenleiste${hatGegnerZauberziel ? ' schlangenleiste--gegnerzauber' : ''}`} aria-label={hatGegnerZauberziel ? 'Gegner-Zauberziele' : undefined}>
      {spieler.flatMap((eintrag) =>
        eintrag.schlangen.map((schlange) => {
          const regenbogenWildfarben = ermittleRegenbogenWildfarben(schlange)
          const blockadeAktion = findeBlockadeAktion(eintrag.id, schlange.id)
          const hatKartenZauberziel = schlange.karten.some((karte) => {
            const frassZiel = { spielerId: eintrag.id, schlangenId: schlange.id, kartenId: karte.id }
            return findeFarbendiebAktionen(eintrag.id, schlange.id, karte.id).length > 0 || findeSchlangenfrassZweiZielAktionen(frassZiel).length > 0
          })
          const istGegnerZauberziel = Boolean(blockadeAktion || hatKartenZauberziel)

          return (
            <li key={schlange.id} className={`schlangekarte schlangekarte--gegner${blockadeAktion ? ' schlangekarte--blockade-ziel' : ''}${istGegnerZauberziel ? ' schlangekarte--gegnerzauber' : ''}`}
              data-letzte-aktion-ziel={letzteAktionZiel?.typ === 'schlange' && letzteAktionZiel.id === schlange.id ? `schlange-${schlange.id}` : undefined}
            >
              <strong>{schlange.id}</strong>
              <span>Gehört zu: {eintrag.name}</span>
              <span className="schlangekarte__badge">{schlange.karten.length} Karten</span>
              <div className="schlangekarte__kartenreihe schlangekarte__kartenreihe--pfad" role="list" aria-label={`Kartenreihe ${schlange.id}`}>
                {schlange.karten.map((karte, kartenIndex) => {
                  const frassZiel = { spielerId: eintrag.id, schlangenId: schlange.id, kartenId: karte.id }
                  const diebAktionen = findeFarbendiebAktionen(eintrag.id, schlange.id, karte.id)
                  const diebZielspurKey = diebAktionen.length > 0 ? `dieb:${eintrag.id}:${schlange.id}:${karte.id}` : undefined
                  const frassAktionen = findeSchlangenfrassZweiZielAktionen(frassZiel)
                  const istFrassZiel = frassAktionen.length > 0
                  const istFrassAusgewaehlt = Boolean(aktivesErstesFrassZiel && istGleichesFrassZiel(aktivesErstesFrassZiel, frassZiel))
                  const frassAusfuehrenAktion = aktivesErstesFrassZiel && !istFrassAusgewaehlt
                    ? frassAktionen.find((aktion) => enthaeltFrassZiel(aktion, aktivesErstesFrassZiel)) ?? null
                    : null
                  const istKopf = kartenIndex === 0
                  const istSchwanz = kartenIndex === schlange.karten.length - 1
                  return (
                    <SchlangenPfadKarte
                      key={karte.id}
                      karte={karte}
                      istKopf={istKopf}
                      istSchwanz={istSchwanz}
                      regenbogenWildfarbe={regenbogenWildfarben.get(karte.id)}
                      className={`${diebAktionen.length > 0 || istFrassZiel ? ' schlangekarte__karte--sonderaktion-ziel' : ''}${diebAktionen.length > 0 ? ' schlangekarte__karte--farbendieb-ziel' : ''}${istFrassZiel ? ' schlangekarte__karte--schlangenfrass-ziel' : ''}${istFrassAusgewaehlt ? ' schlangekarte__karte--schlangenfrass-ausgewaehlt' : ''}`}
                    >
                      <FarbendiebBeutekorb
                        aktionen={diebAktionen}
                        beuteKartenId={karte.id}
                        onAktion={onAktion}
                        aktionsLabel={aktionsLabel}
                        zielspurKey={diebZielspurKey}
                        hervorgehoben={aktiverZielspurKey === diebZielspurKey}
                      />
                      {istFrassZiel && !aktivesErstesFrassZiel && ausgewaehlteHandkarteId && (
                        <SchlangenfrassBissspur
                          zielKartenId={karte.id}
                          handkartenId={ausgewaehlteHandkarteId}
                          modus="erstes-ziel"
                          ariaLabel={`Schlangenfrass-Ziel 1 im Schlangenbereich wählen: ${karte.id}`}
                          onClick={() => setErstesFrassZiel({ ...frassZiel, handkartenId: ausgewaehlteHandkarteId })}
                        />
                      )}
                      {frassAusfuehrenAktion && aktivesErstesFrassZiel && (
                        <SchlangenfrassBissspur
                          zielKartenId={karte.id}
                          handkartenId={frassAusfuehrenAktion.handkartenId}
                          modus="zweites-ziel"
                          ariaLabel={`Schlangenfrass im Schlangenbereich mit Karte ${frassAusfuehrenAktion.handkartenId} auf Karten ${aktivesErstesFrassZiel.kartenId} und ${karte.id}`}
                          title={aktionsLabel(frassAusfuehrenAktion)}
                          onClick={() => {
                            setErstesFrassZiel(null)
                            onAktion(frassAusfuehrenAktion)
                          }}
                        />
                      )}
                    </SchlangenPfadKarte>
                  )
                })}
              </div>
              {blockadeAktion && (
                <SchlangenblockadeFessel
                  aktion={blockadeAktion}
                  zielSchlangenId={schlange.id}
                  onAktion={onAktion}
                  aktionsLabel={aktionsLabel}
                  zielspurKey={`blockade:${eintrag.id}:${schlange.id}`}
                  hervorgehoben={aktiverZielspurKey === `blockade:${eintrag.id}:${schlange.id}`}
                />
              )}
              <span>Status: {schlangenStatusLabel(schlange.zustand)}</span>
            </li>
          )
        }),
      )}
      </ul>
    </>
  )
}
