import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="title">
        <p className="eyebrow">Neues Projekt · neues GitHub-Repo · neues Vercel-Projekt</p>
        <h1 id="title">Schlangentanz v2 Greenfield Rebuild</h1>
        <p>
          Dieses Repository ist der saubere Neustart. Es übernimmt keinen alten
          Paperclip- oder Schlangentanz-v1-Code. Die Umsetzung beginnt erst nach
          Freigabe der <code>docs/GAME_SPEC.md</code>.
        </p>
        <ul>
          <li>Hermes orchestriert und prüft die Gates.</li>
          <li>Claude Code baut kleine, getestete Slices.</li>
          <li>Codex reviewed adversarial gegen Spec und Tests.</li>
        </ul>
      </section>
    </main>
  )
}

export default App
