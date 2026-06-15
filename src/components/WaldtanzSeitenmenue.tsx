/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Google-Stitch-inspiriertes Seitenmenü als spielnaher Rahmen für die Waldtanz-Arena.
*/

interface WaldtanzSeitenmenueProps {
  spielerName: string
  punkte: number
  zugphase: string
  handkarten: number
  eigeneSchlangen: number
  nachziehstapel: number
  offeneAufgaben: number
  pflichtschritt: string
}

const navigation = [
  { label: 'Karte', icon: '🗺️' },
  { label: 'Quest', icon: '⛰️', current: true },
  { label: 'Inventar', icon: '🎒' },
  { label: 'Zauber', icon: '🪄' },
]

export default function WaldtanzSeitenmenue({
  spielerName,
  punkte,
  zugphase,
  handkarten,
  eigeneSchlangen,
  nachziehstapel,
  offeneAufgaben,
  pflichtschritt,
}: WaldtanzSeitenmenueProps) {
  return (
    <aside className="waldtanz-seitenmenue" aria-label="Waldtanz-Spielrahmen">
      <div className="waldtanz-seitenmenue__marke">
        <h2>Schlangentanz</h2>
      </div>
      <section className="waldtanz-seitenmenue__profil" aria-label="Spielprofil">
        <span className="waldtanz-seitenmenue__avatar" aria-hidden="true">🧝</span>
        <div>
          <strong>Spielprofil</strong>
          <span>{spielerName} · {punkte} Punkte</span>
          <span>Forest Spirit</span>
        </div>
      </section>
      <section className="waldtanz-seitenmenue__kompass" aria-label="Waldtanz-Kompass">
        <strong>Waldtanz-Kompass</strong>
        <div className="waldtanz-seitenmenue__statgitter">
          <span className="waldtanz-seitenmenue__statkarte">Phase: {zugphase}</span>
          <span className="waldtanz-seitenmenue__statkarte">Handkarten: {handkarten}</span>
          <span className="waldtanz-seitenmenue__statkarte">Eigene Schlangen: {eigeneSchlangen}</span>
          <span className="waldtanz-seitenmenue__statkarte">Nachziehstapel: {nachziehstapel}</span>
          <span className="waldtanz-seitenmenue__statkarte">Offene Quests: {offeneAufgaben}</span>
        </div>
        <p>Nächster Schritt: {pflichtschritt}</p>
      </section>
      <ul className="waldtanz-seitenmenue__liste">
        {navigation.map((item) => (
          <li key={item.label}>
            <span
              className={item.current ? 'waldtanz-seitenmenue__punkt waldtanz-seitenmenue__punkt--aktiv' : 'waldtanz-seitenmenue__punkt'}
              aria-current={item.current ? 'true' : undefined}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="waldtanz-seitenmenue__hilfen" aria-label="Spielhilfen">
        <span className="waldtanz-seitenmenue__hilfe">⚙️<span>Einstellungen</span></span>
        <span className="waldtanz-seitenmenue__hilfe">?<span>Hilfe</span></span>
      </div>
    </aside>
  )
}
