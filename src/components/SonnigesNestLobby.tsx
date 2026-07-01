import { useId, type ReactNode } from 'react'
import Schlangenbuch from './Schlangenbuch'

export type KiGegnerAnzahl = 1 | 2 | 3

interface SonnigesNestLobbyProps {
  aktiveKiGegner: number
  onNeuesSpiel: (kiGegner: KiGegnerAnzahl) => void
}

// M3c: SVG-Schlangen-Avatare (Stitch-inspirierte 2x2-Player-Cards) ersetzen
// die Emoji-Hoehlen aus M3a. Inline-SVG ohne externe Bild-URL.
// Schwierigkeiten sind visuelle Hinweise, keine Engine-Steuerung.
const kiSlots = [
  {
    name: 'Orange Crush',
    color: '#e8702c',
    accent: '#3a7a3f',
    schwierigkeit: 'mutig',
    svg: (
      <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <ellipse cx="32" cy="34" rx="22" ry="16" fill="#e8702c" />
        <path
          d="M10 34 Q32 18 54 34 Q32 50 10 34 Z"
          fill="none"
          stroke="#3a7a3f"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="22" cy="30" r="3" fill="#063907" />
        <circle cx="42" cy="30" r="3" fill="#063907" />
        <circle cx="22.5" cy="29" r="0.8" fill="#ecffe3" />
        <circle cx="42.5" cy="29" r="0.8" fill="#ecffe3" />
        <path
          d="M26 38 Q32 42 38 38"
          stroke="#063907"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M52 24 L58 18 L54 22 L60 22 L54 26 L58 30 Z" fill="#e8702c" stroke="#063907" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'Lime Loop',
    color: '#a4de02',
    accent: '#063907',
    schwierigkeit: 'listig',
    svg: (
      <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <ellipse cx="32" cy="34" rx="22" ry="16" fill="#a4de02" />
        <path
          d="M10 34 Q22 22 32 34 Q42 46 54 34"
          stroke="#063907"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="22" cy="30" r="3" fill="#063907" />
        <circle cx="42" cy="30" r="3" fill="#063907" />
        <circle cx="22.5" cy="29" r="0.8" fill="#ecffe3" />
        <circle cx="42.5" cy="29" r="0.8" fill="#ecffe3" />
        <path
          d="M26 38 Q32 41 38 38"
          stroke="#063907"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: 'Berry Boa',
    color: '#c3436e',
    accent: '#063907',
    schwierigkeit: 'fies',
    svg: (
      <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <ellipse cx="32" cy="34" rx="22" ry="16" fill="#c3436e" />
        <circle cx="20" cy="30" r="2.2" fill="#ffbcaa" />
        <circle cx="32" cy="38" r="2.2" fill="#ffbcaa" />
        <circle cx="44" cy="30" r="2.2" fill="#ffbcaa" />
        <circle cx="26" cy="42" r="1.8" fill="#ffbcaa" />
        <circle cx="40" cy="40" r="1.8" fill="#ffbcaa" />
        <circle cx="22" cy="30" r="3" fill="#063907" />
        <circle cx="42" cy="30" r="3" fill="#063907" />
        <circle cx="22.5" cy="29" r="0.8" fill="#ecffe3" />
        <circle cx="42.5" cy="29" r="0.8" fill="#ecffe3" />
        <path
          d="M24 40 Q32 36 40 40"
          stroke="#063907"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

function SchlangeAvatar({ name, svg, hostBadge }: { name: string; svg: ReactNode; hostBadge?: boolean }) {
  return (
    <div className="lobby-avatar">
      {/* SVG-Dekoration ist aria-hidden — der Spielername steht in
          der .lobby-slot__name-Pille, die fuer Screenreader lesbar ist. */}
      <span className="lobby-avatar__bild" aria-hidden="true">
        {svg}
      </span>
      {hostBadge ? (
        <span className="lobby-slot__badge" title="Host">
          <span aria-hidden="true">★</span>
        </span>
      ) : null}
      <span className="lobby-slot__name">{name}</span>
    </div>
  )
}

function kiStartLabel(kiGegner: KiGegnerAnzahl): string {
  if (kiGegner === 1) return 'Duell starten (1 KI)'
  if (kiGegner === 2) return 'Waldparty starten (2 KI)'
  return 'Große Runde starten (3 KI)'
}

function SonnigesNestLobby({ aktiveKiGegner, onNeuesSpiel }: SonnigesNestLobbyProps) {
  const titelId = useId()
  const aktiveKi = Math.max(1, Math.min(3, aktiveKiGegner))

  return (
    <section className="sonniges-nest" aria-label="Das sonnige Nest">
      <div className="lobby-code-schild" aria-label="Lobby Code">
        <span className="lobby-code-schild__label">Lobby Code</span>
        <strong className="lobby-code-schild__code">XK9-B4Z</strong>
      </div>
      <div className="lobby-baumhaus">
        <h2 id={titelId}>Bereit im sonnigen Nest</h2>
        <p className="lobby-status">Aktive Partie: Du + {aktiveKi} KI</p>
        <div className="lobby-spieler-grid" aria-label="Spielerplätze">
          <div className={`lobby-slot lobby-slot--host`}>
            <SchlangeAvatar
              name="Slippy Host"
              hostBadge
              svg={
                <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
                  <ellipse cx="32" cy="34" rx="22" ry="16" fill="#3a7a3f" />
                  <path d="M14 26 L26 22 L38 22 L50 26" stroke="#a22900" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <rect x="22" y="20" width="20" height="4" fill="#b12d00" />
                  <circle cx="14" cy="20" r="3" fill="#a22900" />
                  <circle cx="22" cy="30" r="3" fill="#063907" />
                  <circle cx="42" cy="30" r="3" fill="#063907" />
                  <circle cx="22.5" cy="29" r="0.8" fill="#ecffe3" />
                  <circle cx="42.5" cy="29" r="0.8" fill="#ecffe3" />
                  <path
                    d="M26 38 Q32 42 38 38"
                    stroke="#063907"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />
            <span className="lobby-slot__host-badge" aria-label="Du bist dieser Spieler">DU</span>
            <span className="lobby-slot__boden" aria-hidden="true" />
          </div>
          {kiSlots.map((slot, index) => {
            const istAktiv = index < aktiveKi
            return (
              <div
                className={`lobby-slot ${istAktiv ? 'lobby-slot--ki' : 'lobby-slot--wartet'}`}
                key={slot.name}
              >
                <SchlangeAvatar name={istAktiv ? slot.name : 'frei'} svg={slot.svg} />
                {istAktiv ? (
                  <span className="lobby-slot__difficulty" aria-label={`Schwierigkeit ${slot.schwierigkeit}`}>
                    {slot.schwierigkeit}
                  </span>
                ) : null}
                <span className="lobby-slot__boden" aria-hidden="true" />
              </div>
            )
          })}
        </div>
      </div>
      <div className="lobby-startreihe" aria-label="KI-Gegner wählen">
        {([1, 2, 3] as const).map(kiGegner => (
          <button className="lobby-startbutton" key={kiGegner} type="button" onClick={() => onNeuesSpiel(kiGegner)}>
            <span className="lobby-startbutton__icon" aria-hidden="true">▶</span>
            {kiStartLabel(kiGegner)}
          </button>
        ))}
      </div>
      <Schlangenbuch />
    </section>
  )
}

export default SonnigesNestLobby