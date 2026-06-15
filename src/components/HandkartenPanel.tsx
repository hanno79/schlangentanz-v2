/*
Author: rahn
Datum: 05.06.2026
Version: 1.1
Beschreibung: Spieltisch-Panel für die Handkarten des aktiven Spielers mit auswählbarer Detailkarte.
# ÄNDERUNG 07.06.2026: R110 erzeugt die Detail-Titel-ID komponentenlokal per useId(),
# damit mehrfach gerenderte Panels keine doppelten DOM-IDs erzeugen.
# ÄNDERUNG 07.06.2026: R159 entfernt das separate aria-label und benennt das Panel über sichtbaren Handkarten-Text.
# ÄNDERUNG 12.06.2026: R177 ergänzt farbspezifische Klassen für echte Kartenflächen statt generischer Klickkarten.
*/

import { useId } from 'react'
import type { QuestZugHinweis, SpielAktion, Spielkarte } from '../engine'
import { farbeCssKlasse } from '../kartenfarben'

interface HandkartenPanelProps {
  handkarten: Spielkarte[]
  ausgewaehlteHandkarte: Spielkarte | null
  legaleAktionen?: SpielAktion[]
  questHinweise?: QuestZugHinweis[]
  onKarteWaehlen: (karteId: string) => void
  onKarteDragStart: (karteId: string) => void
  onKarteDragEnd: () => void
}

function karteKurzLabel(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte'
    ? `Farbkarte ${karte.farbe} · ${karte.punkte} Punkte`
    : `Sonderkarte ${karte.name} · Sonderaktion`
}

function karteSymbol(karte: Spielkarte): string {
  if (karte.typ !== 'Farbkarte') return '✨'
  switch (karte.farbe) {
    case 'Blau': return '💧'
    case 'Rot': return '🔥'
    case 'Gelb': return '☀️'
    case 'Violett': return '🌙'
    case 'Braun': return '🌰'
    case 'Grün': return '🌿'
  }
}

function karteFarbklasse(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? ` handkarten-preview--farbe-${farbeCssKlasse(karte.farbe)}` : ' handkarten-preview--sonderkarte'
}

function nutztHandkarte(aktion: SpielAktion, karteId: string): boolean {
  if ('handkartenId' in aktion && aktion.handkartenId === karteId) return true
  return 'abwehrHandkartenId' in aktion && aktion.abwehrHandkartenId === karteId
}

function aktionenFuerHandkarte(legaleAktionen: SpielAktion[], karteId: string): SpielAktion[] {
  return legaleAktionen.filter((aktion) => nutztHandkarte(aktion, karteId))
}

function boardAktionenFuerHandkarte(legaleAktionen: SpielAktion[], karteId: string): SpielAktion[] {
  return aktionenFuerHandkarte(legaleAktionen, karteId).filter((aktion) => aktion.typ !== 'PflichtAbwurf')
}

function zielartLabel(aktion: SpielAktion): string | null {
  switch (aktion.typ) {
    case 'NeueSchlangeStarten': return 'Startkreis'
    case 'KarteAnlegen': return 'Schlangenende'
    case 'FarbenschutzSpielen': return 'Schutzring'
    case 'FarbenfusionSpielen': return 'Fusionspaar'
    case 'SchlangenhaeutungSpielen': return 'Häutungspfad'
    case 'SchlangenfrassSpielen': return 'Frass-Ziel'
    case 'SchlangenblockadeSpielen': return 'Blockadeziel'
    case 'FarbendiebSpielen': return 'Beutekarte'
    case 'SonderkarteSpielen': return 'Spielerziel'
    case 'VerdopplerSpielen': return 'Bonuszauber'
    case 'PflichtAbwurf':
    case 'SchlangengrubeAbwehren':
    case 'SchlangengrubeDurchlassen':
    case 'SchlangenblockadeAbwehren':
    case 'SchlangenblockadeDurchlassen':
    case 'FarbendiebAbwehren':
    case 'FarbendiebDurchlassen':
    case 'SchlangenfrassAbwehren':
    case 'SchlangenfrassDurchlassen':
    case 'VerdopplerAbwehren':
    case 'VerdopplerDurchlassen':
      return null
  }
}

function zielartenFuerAktionen(aktionen: SpielAktion[]): string[] {
  return Array.from(new Set(aktionen.map(zielartLabel).filter((label): label is string => label !== null)))
}

export default function HandkartenPanel({
  handkarten,
  ausgewaehlteHandkarte,
  legaleAktionen = [],
  questHinweise = [],
  onKarteWaehlen,
  onKarteDragStart,
  onKarteDragEnd,
}: HandkartenPanelProps) {
  const handkartenTitelId = useId()
  const detailTitelId = useId()
  const spielbareHandkarten = handkarten.filter((karte) => boardAktionenFuerHandkarte(legaleAktionen, karte.id).length > 0).length
  const ausgewaehlteZielAktionen = ausgewaehlteHandkarte ? boardAktionenFuerHandkarte(legaleAktionen, ausgewaehlteHandkarte.id) : []
  const ausgewaehlteZielarten = zielartenFuerAktionen(ausgewaehlteZielAktionen)
  const questHinweiseNachKarte = new Map(questHinweise.map((hinweis) => [hinweis.karteId, hinweis.labels]))
  const ausgewaehlteQuestLabels = ausgewaehlteHandkarte ? questHinweiseNachKarte.get(ausgewaehlteHandkarte.id) ?? [] : []

  return (
    <section className="handkarten-panel" aria-labelledby={handkartenTitelId}>
      <h4><span id={handkartenTitelId}>Handkarten</span> als Kartenleiste</h4>
      <p className="handkarten-spielbarkeit">{spielbareHandkarten} {spielbareHandkarten === 1 ? 'Karte' : 'Karten'} sofort spielbar</p>
      {ausgewaehlteHandkarte ? (
        <section className={`handkarten-detail handkarten-preview${karteFarbklasse(ausgewaehlteHandkarte)}`} aria-labelledby={detailTitelId}>
          <article className="handkarten-preview__karte" aria-label={`Vorschau ${ausgewaehlteHandkarte.id}`}>
            <span className="handkarten-preview__eyebrow">Zugkarte bereit</span>
            <span className="handkarten-preview__symbol" aria-hidden="true">{karteSymbol(ausgewaehlteHandkarte)}</span>
            <strong>{ausgewaehlteHandkarte.id}</strong>
            <span className="handkarten-preview__typ">
              {ausgewaehlteHandkarte.typ === 'Farbkarte'
                ? `Farbkarte ${ausgewaehlteHandkarte.farbe}`
                : `Sonderkarte ${ausgewaehlteHandkarte.name}`}
            </span>
            <span className="handkarten-preview__werteplakette">
              {ausgewaehlteHandkarte.typ === 'Farbkarte' ? `${ausgewaehlteHandkarte.punkte} Punkte` : 'Sonderaktion'}
            </span>
          </article>
          <div className="handkarten-preview__text">
            <h5 className="handkarten-detail__titel" id={detailTitelId}>Ausgewählte Handkarte: {ausgewaehlteHandkarte.id}</h5>
            <p className="handkarten-preview__headline">Aktuelle Karte am Waldtanz-Tisch</p>
            <p>{karteKurzLabel(ausgewaehlteHandkarte)}</p>
            <p>Ausgewählte Karte schwebt über dem Fächer.</p>
            <div className="handkarten-preview__zielkarte" role="note" aria-label="Brettziele der ausgewählten Karte">
              <span className="handkarten-preview__zielkarte-label">Brettzielkarte</span>
              <strong>{ausgewaehlteZielAktionen.length} {ausgewaehlteZielAktionen.length === 1 ? 'Brettziel' : 'Brettziele'} bereit</strong>
              {ausgewaehlteZielarten.length > 0 && (
                <ul className="handkarten-preview__zielliste" aria-label="Zielarten der ausgewählten Karte">
                  {ausgewaehlteZielarten.map((zielart) => (
                    <li key={zielart} className="handkarten-preview__zielchip">{zielart}</li>
                  ))}
                </ul>
              )}
              <p>Folge den leuchtenden Zielen im Spielbrett.</p>
            </div>
            {ausgewaehlteQuestLabels.length > 0 && (
              <div className="handkarten-preview__questkarte" role="note" aria-label="Questziele der ausgewählten Karte">
                <span className="handkarten-preview__questkarte-label">Questzielkarte</span>
                <ul className="handkarten-preview__questliste" aria-label="Quest-Fährten dieser Karte">
                  {ausgewaehlteQuestLabels.map((label) => (
                    <li key={label} className="handkarten-preview__questchip">{label}</li>
                  ))}
                </ul>
                <p>Diese Karte bringt offene Quest-Fährten direkt am Spielbrett näher.</p>
              </div>
            )}
            <p>Ziehe sie auf eine leuchtende Brettzone oder klicke ein Ziel im Schlangenbereich.</p>
            <p>Klicke dieselbe Karte erneut, um sie wieder abzuwählen.</p>
          </div>
        </section>
      ) : (
        <p className="handkarten-status">Keine Handkarte ausgewählt.</p>
      )}
      <ul className="handkartenleiste handkartenleiste--waldtanz-faecher">
        {handkarten.map((karte) => {
          const istFarbkarte = karte.typ === 'Farbkarte'
          const istAusgewaehlt = ausgewaehlteHandkarte?.id === karte.id
          const alleKartenAktionen = aktionenFuerHandkarte(legaleAktionen, karte.id)
          const zielAnzahl = alleKartenAktionen.filter((aktion) => aktion.typ !== 'PflichtAbwurf').length
          const istSpielbar = zielAnzahl > 0
          const hatPflichtAbwurf = !istSpielbar && alleKartenAktionen.some((aktion) => aktion.typ === 'PflichtAbwurf')
          const spielStatusText = istSpielbar ? 'Spielbar jetzt' : hatPflichtAbwurf ? 'Muss abgeworfen werden' : 'Wartet auf nächsten Schritt'
          const zielText = istSpielbar ? `${zielAnzahl} ${zielAnzahl === 1 ? 'Brettziel' : 'Brettziele'}` : hatPflichtAbwurf ? 'Abwurfpflicht' : ''
          const questLabels = questHinweiseNachKarte.get(karte.id) ?? []
          const questText = questLabels.length > 0 ? ` Questzug ${questLabels.join(', ')}` : ''

          return (
            <li
              key={karte.id}
              className={`handkarte handkarte--spielkarte handkarte--${istFarbkarte ? 'farbkarte' : 'sonderkarte'}${istFarbkarte ? ` handkarte--farbe-${farbeCssKlasse(karte.farbe)}` : ''}${istAusgewaehlt ? ' handkarte--ausgewaehlt' : ''}${istSpielbar ? ' handkarte--spielbar' : hatPflichtAbwurf ? ' handkarte--pflichtabwurf' : ' handkarte--wartet'}`}
            >
              <button
                type="button"
                className="handkarte__button handkarte__button--karte"
                draggable="true"
                aria-label={`${karte.id} ${istFarbkarte ? `Farbkarte ${karte.farbe}` : `Sonderkarte ${karte.name}`} ${istFarbkarte ? `${karte.punkte} Punkte` : 'Sonderaktion'} ${spielStatusText}${zielText ? ` ${zielText}` : ''}${questText}`}
                aria-pressed={istAusgewaehlt}
                onClick={() => onKarteWaehlen(karte.id)}
                onDragStart={(event) => {
                  event.dataTransfer.setData('text/plain', karte.id)
                  event.dataTransfer.effectAllowed = 'move'
                  onKarteDragStart(karte.id)
                }}
                onDragEnd={onKarteDragEnd}
              >
                <span className="handkarte__eyebrow">Waldtanzkarte</span>
                <span className="handkarte__symbol" aria-hidden="true">{karteSymbol(karte)}</span>
                <strong>{karte.id}</strong>
                <span className="handkarte__typ">{istFarbkarte ? `Farbkarte ${karte.farbe}` : `Sonderkarte ${karte.name}`}</span>
                <span className="handkarte__farbe">{istFarbkarte ? karte.farbe : karte.name}</span>
                <span className="handkarte__punkte">{istFarbkarte ? `${karte.punkte} Punkte` : 'Sonderaktion'}</span>
                <span className="handkarte__spielhinweis">Auswählen oder ziehen</span>
                <span className="handkarte__spielstatus">{spielStatusText}</span>
                {zielText && <span className="handkarte__spielziele">{zielText}</span>}
                {questLabels.length > 0 && (
                  <span className="handkarte__questzug">
                    <span>Quest-Zug</span>
                    {questLabels.map((label) => <strong key={label}>{label}</strong>)}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
