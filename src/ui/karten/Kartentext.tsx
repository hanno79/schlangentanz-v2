import './kartentext.css'
import { Karte } from './Karte'
import type { Bildkarte } from './kartenbilder'
import { punkteText } from './kartentexte'
import { hilfetitel, kartenhilfe, reiheMitUnterschrift, reihenkarte, type Textbaustein } from './hilfe/kartenhilfe'
import { ERWEITERUNG_KENNUNG, KARTENHILFE_TEXTE } from './hilfe/texte'

/** Ein Satz der Spielanleitung; „[Erweiterung]“ am Ende wird zum Etikett. */
function Wortlaut({ text }: { text: string }) {
  if (!text.endsWith(ERWEITERUNG_KENNUNG)) return text
  return (
    <>
      {text.slice(0, -ERWEITERUNG_KENNUNG.length)}{' '}
      <span className="kartentext__etikett">{KARTENHILFE_TEXTE.erweiterung}</span>
    </>
  )
}

/** Eine Bildzeile der Spielanleitung als Reihe kleiner Kartenbilder. */
function Kartenreihe({ reihe }: { reihe: readonly string[] }) {
  return (
    <ul className="kartenreihe" aria-label={KARTENHILFE_TEXTE.kartenreihe}>
      {reihe.map((name, i) => (
        <li key={i} className="kartenreihe__platz">
          <Karte karte={reihenkarte(name)} />
          {reiheMitUnterschrift(name) && <span className="kartenreihe__unterschrift">{name}</span>}
        </li>
      ))}
    </ul>
  )
}

function Baustein({ baustein }: { baustein: Textbaustein }) {
  if (typeof baustein === 'string') {
    return (
      <p>
        <Wortlaut text={baustein} />
      </p>
    )
  }
  if ('reihe' in baustein) return <Kartenreihe reihe={baustein.reihe} />
  return (
    <ul>
      {baustein.map((punkt) => (
        <li key={punkt}>
          <Wortlaut text={punkt} />
        </li>
      ))}
    </ul>
  )
}

/**
 * Der Text einer Karte im Wortlaut der Spielanleitung (Teil A): Name, bei
 * Aufgaben die Punkte, Kurzbeschreibung und die Abschnitte darunter, Bildzeilen
 * als Reihe kleiner Karten, zuletzt Ergänzungen des Autors aus Teil D. Für die
 * Grossansicht und überall, wo eine Karte erklärt wird.
 */
export function Kartentext({ karte, titelId }: { karte: Bildkarte; titelId?: string }) {
  const hilfe = kartenhilfe(karte)
  return (
    <article className="kartentext">
      <h2 id={titelId} className="kartentext__titel">
        {hilfetitel(hilfe.karte)}
      </h2>
      {hilfe.karte.typ === 'Aufgabenkarte' && <p className="kartentext__punkte">{punkteText(hilfe.karte.punkte)}</p>}
      <p className="kartentext__kurz">
        <Wortlaut text={hilfe.kurz} />
      </p>
      {hilfe.abschnitte.map((abschnitt, i) => (
        <div key={abschnitt.titel ?? i} className="kartentext__abschnitt">
          {abschnitt.titel !== undefined && <h3 className="kartentext__zwischentitel">{abschnitt.titel}</h3>}
          {abschnitt.inhalt.map((baustein, j) => (
            <Baustein key={j} baustein={baustein} />
          ))}
        </div>
      ))}
      {hilfe.ergaenzungen?.map((satz) => (
        <p key={satz.text} className="kartentext__ergaenzung">
          <span>{satz.text}</span> <span className="kartentext__etikett">{KARTENHILFE_TEXTE.ergaenzung}</span>
        </p>
      ))}
    </article>
  )
}
