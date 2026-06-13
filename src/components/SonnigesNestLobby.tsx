import { useId } from 'react'
import Schlangenbuch from './Schlangenbuch'

export type KiGegnerAnzahl = 1 | 2 | 3

interface SonnigesNestLobbyProps {
  aktiveKiGegner: number
  onNeuesSpiel: (kiGegner: KiGegnerAnzahl) => void
}

const kiSlots = [
  { name: 'Orange Crush', icon: '🟠' },
  { name: 'Lime Loop', icon: '🟢' },
  { name: 'Berry Boa', icon: '🟣' },
]

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
        <ul className="lobby-slots" aria-label="Spielerplätze">
          <li className="lobby-slot lobby-slot--host">
            <span className="lobby-slot__hoehle" aria-hidden="true">🐍</span>
            <strong>Slippy Host</strong>
          </li>
          {kiSlots.map((slot, index) => {
            const istAktiv = index < aktiveKi
            return (
              <li className={`lobby-slot ${istAktiv ? 'lobby-slot--ki' : 'lobby-slot--wartet'}`} key={slot.name}>
                <span className="lobby-slot__hoehle" aria-hidden="true">{istAktiv ? slot.icon : '+'}</span>
                <strong>{istAktiv ? slot.name : 'wartet auf KI-Schlange'}</strong>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="lobby-startreihe" aria-label="KI-Gegner wählen">
        {([1, 2, 3] as const).map(kiGegner => (
          <button className="lobby-startbutton" key={kiGegner} type="button" onClick={() => onNeuesSpiel(kiGegner)}>
            {kiStartLabel(kiGegner)}
          </button>
        ))}
      </div>
      <Schlangenbuch />
    </section>
  )
}

export default SonnigesNestLobby
