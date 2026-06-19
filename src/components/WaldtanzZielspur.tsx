/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Board-nahe Zielspur für ausgewählte Handkarten im Waldtanz-Schlangenbereich.
*/

interface WaldtanzZielspurProps {
  karteId: string | null
  zielAnzahl: number
}

export default function WaldtanzZielspur({ karteId, zielAnzahl }: WaldtanzZielspurProps) {
  if (!karteId) return null

  const zielText = `${zielAnzahl} ${zielAnzahl === 1 ? 'Brettziel leuchtet' : 'Brettziele leuchten'}`

  return (
    <div className="waldtanz-zielspur waldtanz-zielspur--rankenpfad" role="note" aria-label="Waldtanz-Zielspur">
      <span className="waldtanz-zielspur__badge">Rankenpfad aktiv</span>
      <strong>Zielkarte: {karteId}</strong>
      <span className="waldtanz-zielspur__zaehler">{zielText}</span>
      <ol className="waldtanz-zielranken" aria-label="Waldtanz-Zielranken">
        <li className="waldtanz-zielranke">Handkarte</li>
        <li className="waldtanz-zielranke">Waldlichtung</li>
        <li className="waldtanz-zielranke">Brettziel</li>
      </ol>
      <p>Folge den sonnigen Ranken: leuchtende Startkreise, Schlangenenden und Zauberziele nehmen deine Karte direkt am Brett an.</p>
    </div>
  )
}
