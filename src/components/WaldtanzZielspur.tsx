/*
Author: rahn
Datum: 20.06.2026
Version: 1.1
Beschreibung: Board-nahe Zielspur für ausgewählte Handkarten mit sichtbaren Zielwahl-Fährten.
*/
import type { ZielspurFamilie, ZielspurObjekt } from './waldtanzZielspurLogik'

interface WaldtanzZielspurProps {
  karteId: string | null
  zielAnzahl: number
  familien?: ZielspurFamilie[]
  objekte?: ZielspurObjekt[]
}

export default function WaldtanzZielspur({ karteId, zielAnzahl, familien = [], objekte = [] }: WaldtanzZielspurProps) {
  if (!karteId) return null

  const zielText = `${zielAnzahl} ${zielAnzahl === 1 ? 'Brettziel leuchtet' : 'Brettziele leuchten'}`

  return (
    <div className="waldtanz-zielspur waldtanz-zielspur--rankenpfad waldtanz-zielspur--zielwahl-faehrten" role="note" aria-label="Waldtanz-Zielspur">
      <span className="waldtanz-zielspur__badge">Rankenpfad aktiv</span>
      <strong>Zielkarte: {karteId}</strong>
      <span className="waldtanz-zielspur__zaehler">{zielText}</span>
      <ol className="waldtanz-zielranken" aria-label="Waldtanz-Zielranken">
        <li className="waldtanz-zielranke">Handkarte</li>
        <li className="waldtanz-zielranke">Waldlichtung</li>
        <li className="waldtanz-zielranke">Brettziel</li>
      </ol>
      {familien.length > 0 && (
        <section className="waldtanz-zielspur__zielwahl" aria-label="Zielwahl am Brett">
          <h5>Zielwahl am Brett</h5>
          <ol className="waldtanz-zielspur__wege" aria-label="Spielbare Brettwege">
            {familien.map((familie) => (
              <li key={familie.key} className={`waldtanz-zielspur__weg waldtanz-zielspur__weg--${familie.key}`}>
                <span className="waldtanz-zielspur__weg-label">{familie.label}</span>
                <strong className="waldtanz-zielspur__weg-anzahl">{familie.anzahl}</strong>
                <span className="waldtanz-zielspur__weg-hilfe">{familie.hilfe}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
      {objekte.length > 0 && (
        <section className="waldtanz-zielspur__zauberwahl" aria-label="Zauberpfad am Brett">
          <h5>Zauberpfad am Brett</h5>
          <ol className="waldtanz-zielspur__zauberpfade" aria-label="Konkrete Zauberpfade">
            {objekte.map((objekt) => (
              <li key={objekt.key} className="waldtanz-zielspur__zauberpfad" aria-label={`${objekt.typ}-Zauberpfad`}>
                <span className="waldtanz-zielspur__zauberpfad-typ">{objekt.typ}</span>
                <strong>{objekt.ziel}</strong>
                <span>{objekt.ort}</span>
                <small>{objekt.hilfe}</small>
              </li>
            ))}
          </ol>
        </section>
      )}
      <p>Wähle eine leuchtende Fährte direkt auf Startkreis, Schlange oder Zauberziel.</p>
    </div>
  )
}
