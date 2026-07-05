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

import { useId, type CSSProperties } from 'react'
import type { PflichtAbwurfAktion, QuestZugHinweis, SpielAktion, Spielkarte } from '../engine'
import { farbeCssKlasse } from '../kartenfarben'
import WaldtanzSonderkartenSpielmoment from './WaldtanzSonderkartenSpielmoment'

interface HandkartenPanelProps {
  handkarten: Spielkarte[]
  ausgewaehlteHandkarte: Spielkarte | null
  legaleAktionen?: SpielAktion[]
  questHinweise?: QuestZugHinweis[]
  spielerName?: string
  aktiverSpielerId?: string
  punkte?: number
  zugphase?: string
  verdeckt?: boolean
  endTurnVerfuegbar?: boolean
  pflichtAbwurfAktionen?: PflichtAbwurfAktion[]
  onKarteWaehlen: (karteId: string) => void
  onKarteDragStart: (karteId: string) => void
  onKarteDragEnd: () => void
  onEndTurn?: () => void
  onPflichtAbwurf?: (karteId: string) => void
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

function karteAnzeigename(karte: Spielkarte): string {
  if (karte.typ !== 'Farbkarte') return karte.name
  switch (karte.farbe) {
    case 'Blau': return 'Wasserwirbel'
    case 'Rot': return 'Feuerkeim'
    case 'Gelb': return 'Sonnenblatt'
    case 'Violett': return 'Mondranke'
    case 'Braun': return 'Wurzelpfad'
    case 'Grün': return 'Waldspross'
  }
}

function karteWertLabel(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? `${karte.punkte} Pkt` : 'Zauber'
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

function tiefenfaecherStyle(index: number, anzahl: number, istAusgewaehlt: boolean): CSSProperties {
  const maxAbstand = Math.max(1, (anzahl - 1) / 2)
  const abstand = index - (anzahl - 1) / 2
  const rotationsSchritt = Math.min(4, 16 / Math.max(1, anzahl - 1))
  const rotation = Number((abstand * rotationsSchritt).toFixed(2))
  const y = Number(((Math.abs(abstand) - maxAbstand) * 0.32).toFixed(2))
  const z = istAusgewaehlt ? 99 : Math.round((maxAbstand - Math.abs(abstand)) * 10) + 1

  return {
    '--hand-faecher-rotation': `${rotation}deg`,
    '--hand-faecher-y': `${y}rem`,
    '--hand-faecher-z': z,
  } as CSSProperties
}

export default function HandkartenPanel({
  handkarten,
  ausgewaehlteHandkarte,
  legaleAktionen = [],
  questHinweise = [],
  spielerName = 'Spieler',
  aktiverSpielerId,
  // M1g: Punkte werden in der linken Grid-Spielerplakette angezeigt
  // (Single Source of Truth), nicht mehr in der Handbuehnen-Spielerplakette.
  // Der Prop bleibt fuer Aufrufer-Kompatibilitaet erhalten.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  punkte: _punkte = 0,
  zugphase = 'Zugphase',
  verdeckt = false,
  endTurnVerfuegbar = false,
  pflichtAbwurfAktionen = [],
  onKarteWaehlen,
  onKarteDragStart,
  onKarteDragEnd,
  onEndTurn,
  onPflichtAbwurf,
}: HandkartenPanelProps) {
  const handkartenTitelId = useId()
  const detailTitelId = useId()

  // H3: Ist ein KI-Gegner am Zug, dürfen dessen Handkarten nicht sichtbar sein.
  // Es werden nur die Anzahl und verdeckte Kartenrücken gezeigt — keine Farbe,
  // kein Typ, kein Name, keine Auswahl/Drag-Interaktion.
  if (verdeckt) {
    return (
      <section className="handkarten-panel handkarten-panel--waldtanz-handbuehne handkarten-panel--verdeckt" aria-labelledby={handkartenTitelId}>
        <div className="handkarten-buehne" role="group" aria-label="Waldtanz-Handbühne">
          <div className="handkarten-buehne__spielerplakette">
            <strong className="handkarten-buehne__spielerplakette-titel">Hand — {spielerName}</strong>
          </div>
          <span className="handkarten-buehne__statuschip">{zugphase}</span>
          <span className="handkarten-buehne__statuschip">{handkarten.length} Handkarten verdeckt</span>
        </div>
        <h4><span id={handkartenTitelId}>Handkarten</span> verdeckt</h4>
        <ul className="handkartenleiste handkartenleiste--verdeckt" aria-label="Verdeckte Handkarten">
          {handkarten.map((_karte, index) => (
            <li key={index} className="handkarte handkarte--verdeckt">
              <span className="handkarte__ruecken" aria-hidden="true">🂠</span>
            </li>
          ))}
        </ul>
      </section>
    )
  }
  const spielbareHandkarten = handkarten.filter((karte) => boardAktionenFuerHandkarte(legaleAktionen, karte.id).length > 0).length
  const ausgewaehlteZielAktionen = ausgewaehlteHandkarte ? boardAktionenFuerHandkarte(legaleAktionen, ausgewaehlteHandkarte.id) : []
  const ausgewaehlteZielarten = zielartenFuerAktionen(ausgewaehlteZielAktionen)
  const questHinweiseNachKarte = new Map(questHinweise.map((hinweis) => [hinweis.karteId, hinweis.labels]))
  const ausgewaehlteQuestLabels = ausgewaehlteHandkarte ? questHinweiseNachKarte.get(ausgewaehlteHandkarte.id) ?? [] : []
  // M1dh: Wenn Pflicht-Abwurf anliegt (legaleAktionen enthält PflichtAbwurf-Aktionen
  // und keine Brettziele mehr spielbar sind), ist die prominente Pille sichtbar.
  const hatPflichtAbwurf = pflichtAbwurfAktionen.length > 0
  // M1dh: End-Turn nur sichtbar, wenn die End-Turn-Phase anliegt
  // (typisch: Phase === Zugabschluss, keine Pflicht-Abwurf-Schuld).
  const hatEndTurn = endTurnVerfuegbar === true

  return (
    <section className="handkarten-panel handkarten-panel--waldtanz-handbuehne" aria-labelledby={handkartenTitelId}>
      <div className="handkarten-buehne" role="group" aria-label="Waldtanz-Handbühne">
        <span className="handkarten-buehne__handsteg" aria-hidden="true" />
        <div className="handkarten-buehne__spielerplakette">
          <strong className="handkarten-buehne__spielerplakette-titel">Deine Hand — {spielerName}</strong>
        </div>
        <span className="handkarten-buehne__statuschip">{zugphase}</span>
        <span className="handkarten-buehne__statuschip">{handkarten.length} Handkarten bereit</span>
        <span className="handkarten-buehne__statuschip handkarten-buehne__statuschip--spielbar">
          Spielbar: {spielbareHandkarten} {spielbareHandkarten === 1 ? 'Karte' : 'Karten'}
        </span>
        {/* M1dq: Sichtbarer Spielmoment-Bubble in der Handbuehne.
            Wird NUR sichtbar, wenn eine Sonderkarte mit mindestens einer
            legalen Sonderkarten-Aktion ausgewaehlt ist. Liefert dem Spieler
            den konkreten Zielort direkt in der Handbuehne — kein Wechsel
            ins Seitenmenue noetig. */}
        {ausgewaehlteHandkarte && ausgewaehlteHandkarte.typ === 'Sonderkarte' && aktiverSpielerId && (
          <WaldtanzSonderkartenSpielmoment
            ausgewaehlteHandkarte={ausgewaehlteHandkarte}
            legaleAktionen={legaleAktionen ?? []}
            aktiverSpielerId={aktiverSpielerId}
          />
        )}
        {/* M1dh: Prominente Spielhandlungs-Pillen am Brettrand.
            Pflicht-Abwurf hat Vorrang (rot, dringend), End-Turn ist Standard-Abschluss. */}
        {hatPflichtAbwurf && (
          <button
            type="button"
            className="handkarten-buehne__spielhandlung handkarten-buehne__spielhandlung--pflichtabwurf handkarten-buehne__pflichtabwurf"
            aria-label={`Pflicht-Abwurf: noch ${pflichtAbwurfAktionen.length} Karte${pflichtAbwurfAktionen.length === 1 ? '' : 'n'} abwerfen (eine pro Klick)`}
            onClick={() => onPflichtAbwurf?.(pflichtAbwurfAktionen[0]?.handkartenId ?? '')}
          >
            <span className="handkarten-buehne__pflichtabwurf-icon" aria-hidden="true">!</span>
            <span>Abwerfen · noch {pflichtAbwurfAktionen.length}</span>
          </button>
        )}
        {hatEndTurn && (
          <button
            type="button"
            className="handkarten-buehne__spielhandlung handkarten-buehne__spielhandlung--endturn handkarten-buehne__endturn"
            aria-label="Zug an nächsten Spieler geben"
            onClick={() => onEndTurn?.()}
          >
            <span>Zug beenden</span>
            <span className="handkarten-buehne__endturn-icon" aria-hidden="true">→</span>
          </button>
        )}
      </div>
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
      <ul className="handkartenleiste handkartenleiste--waldtanz-faecher handkartenleiste--tiefenfaecher handkartenleiste--spielkartenfaecher" aria-label="Waldtanz-Spielkartenfächer" data-hat-ausgewaehlt={ausgewaehlteHandkarte ? 'true' : 'false'}>
        {handkarten.map((karte, index) => {
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
              style={tiefenfaecherStyle(index, handkarten.length, istAusgewaehlt)}
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
                <span className="handkarte__art" aria-hidden="true">
                  <span className="handkarte__symbol">{karteSymbol(karte)}</span>
                </span>
                <strong className="handkarte__titel">{karteAnzeigename(karte)}</strong>
                <span className="handkarte__idplakette">{karte.id}</span>
                <span className="handkarte__typ">{istFarbkarte ? `Farbkarte ${karte.farbe}` : `Sonderkarte ${karte.name}`}</span>
                <span className="handkarte__farbe">{istFarbkarte ? karte.farbe : karte.name}</span>
                <span className="handkarte__wertechip">{karteWertLabel(karte)}</span>
                <span className="handkarte__punkte">{istFarbkarte ? `${karte.punkte} Punkte` : 'Sonderaktion'}</span>
                <span className="handkarte__spielhinweis">Karte spielen →</span>
                {istAusgewaehlt && (
                  <span className="handkarte__bereit-badge" aria-hidden="true">BEREIT</span>
                )}
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
