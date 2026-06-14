/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Google-Stitch-inspiriertes Seitenmenü als spielnaher Rahmen für die Waldtanz-Arena.
*/

const navigation = [
  { label: 'Karte', icon: '🗺️' },
  { label: 'Quest', icon: '⛰️', current: true },
  { label: 'Inventar', icon: '🎒' },
  { label: 'Zauber', icon: '🪄' },
]

export default function WaldtanzSeitenmenue() {
  return (
    <aside className="waldtanz-seitenmenue" aria-label="Waldtanz-Spielrahmen">
      <div className="waldtanz-seitenmenue__marke">
        <h2>Schlangentanz</h2>
      </div>
      <section className="waldtanz-seitenmenue__profil" aria-label="Spielprofil">
        <span className="waldtanz-seitenmenue__avatar" aria-hidden="true">🧝</span>
        <div>
          <strong>Stats</strong>
          <span>Forest Spirit</span>
        </div>
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
