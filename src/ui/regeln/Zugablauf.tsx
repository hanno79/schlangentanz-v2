import { useId } from 'react'
import { REGELHILFE } from './texte'
import { istErgaenzungDesAutors, ZUGSCHRITTE, type Satz } from './zugschritte'

/** Ein Satz der Zusammenfassung; eine Ergänzung des Autors trägt ein sichtbares Etikett. */
function Zugsatz({ satz }: { satz: Satz }) {
  if (!istErgaenzungDesAutors(satz)) return <span>{satz.text}</span>
  return (
    <span className="zugablauf__ergaenzung">
      <span>{satz.text}</span> <span className="zugablauf__etikett">{REGELHILFE.ergaenzung}</span>
    </span>
  )
}

/** Ein Zug in fünf Schritten (O9, Kriterium 2). */
export default function Zugablauf() {
  const titelId = useId()
  return (
    <section className="regelhilfe__abschnitt" aria-labelledby={titelId}>
      <h2 id={titelId} className="regelhilfe__titel">
        {REGELHILFE.zugTitel}
      </h2>
      <p className="regelhilfe__hinweis">{REGELHILFE.zugHinweis}</p>
      <ol className="zugablauf">
        {ZUGSCHRITTE.map((schritt) => (
          <li key={schritt.titel} className="zugablauf__schritt">
            <h3 className="zugablauf__titel">
              {schritt.titel}
              {schritt.nurErweiterung === true && (
                <>
                  {' '}
                  <span className="zugablauf__erweiterung">{REGELHILFE.nurErweiterung}</span>
                </>
              )}
            </h3>
            <p className="zugablauf__text">
              {schritt.saetze.map((satz, i) => (
                <span key={satz.text}>
                  {i > 0 && ' '}
                  <Zugsatz satz={satz} />
                </span>
              ))}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
