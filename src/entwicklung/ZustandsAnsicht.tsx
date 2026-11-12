import { berechneGewinner, berechneSpielzustandGesamtwertung } from '../engine'
import type { AufgabenkarteInfo, GewinnerEintrag, Spieler, SpielerWertungsEintrag, Spielzustand } from '../engine'
import { Kartenreihe } from './Karte'

/** Der ganze Spielzustand, lesbar: alle Hände offen, alle Stapel, Phase, Wertung. */
export function ZustandsAnsicht({ zustand }: { zustand: Spielzustand }) {
  return (
    <>
      <Kopf zustand={zustand} />
      <section className="et-abschnitt">
        <h2>Spieler</h2>
        <div className="et-spielerliste">
          {zustand.spieler.map((spieler, index) => (
            <SpielerAnsicht key={spieler.id} spieler={spieler} aktiv={index === zustand.aktiverSpielerIndex} />
          ))}
        </div>
      </section>
      <Stapel zustand={zustand} />
      <Wertung zustand={zustand} />
    </>
  )
}

function json(wert: unknown): string {
  return wert === undefined ? '—' : JSON.stringify(wert)
}

function Kopf({ zustand }: { zustand: Spielzustand }) {
  const aktiver = zustand.spieler[zustand.aktiverSpielerIndex]
  return (
    <section className="et-abschnitt">
      <h2>Lage</h2>
      <dl className="et-lage">
        <dt>Zugphase</dt>
        <dd data-testid="zugphase">{zustand.zugphase}</dd>
        <dt>Spielphase</dt>
        <dd>{zustand.spielphase}</dd>
        <dt>Am Zug</dt>
        <dd>
          {aktiver ? `${aktiver.name} (${aktiver.id})` : '—'}, Index {zustand.aktiverSpielerIndex}
        </dd>
        <dt>Zugpflichten</dt>
        <dd>{json(zustand.zugpflichten)}</dd>
        <dt>Reaktionsfenster</dt>
        <dd data-testid="reaktionsfenster">{zustand.pendingReaktion === null ? 'keins' : json(zustand.pendingReaktion)}</dd>
        <dt>Setzen aus</dt>
        <dd>{json(zustand.aussetzenSpielerIndizes)}</dd>
        <dt>Endrunde</dt>
        <dd>{json(zustand.endrunde)}</dd>
        <dt>Dürfen nachziehen</dt>
        <dd>{json(zustand.nachziehBerechtigteIndizes)}</dd>
      </dl>
    </section>
  )
}

function Aufgabe({ aufgabe }: { aufgabe: AufgabenkarteInfo }) {
  return (
    <span className="et-aufgabe">
      {aufgabe.name} ({aufgabe.punkte}) <small>{aufgabe.id}</small>
    </span>
  )
}

function Aufgabenliste({ aufgaben }: { aufgaben: AufgabenkarteInfo[] }) {
  if (aufgaben.length === 0) return <span className="et-leer">keine</span>
  return (
    <>
      {aufgaben.map((aufgabe) => (
        <Aufgabe key={aufgabe.id} aufgabe={aufgabe} />
      ))}
    </>
  )
}

function SpielerAnsicht({ spieler, aktiv }: { spieler: Spieler; aktiv: boolean }) {
  return (
    <article className={aktiv ? 'et-spieler et-spieler--aktiv' : 'et-spieler'} data-testid="spieler">
      <h3>
        {spieler.name} <small>{spieler.id}, {spieler.steuerung}</small>
        {aktiv ? <span className="et-marke">am Zug</span> : null}
      </h3>
      <p>
        <strong>Hand ({spieler.hand.length}):</strong>{' '}
        <span data-testid="hand" data-spieler-id={spieler.id}>
          <Kartenreihe karten={spieler.hand} />
        </span>
      </p>
      {spieler.schlangen.length === 0 ? (
        <p>
          <strong>Schlangen:</strong> <span className="et-leer">keine</span>
        </p>
      ) : (
        spieler.schlangen.map((schlange, index) => (
          <p key={schlange.id} data-testid="schlange">
            <strong>
              Schlange {index + 1} <small>{schlange.id}</small>, {schlange.zustand}:
            </strong>{' '}
            <Kartenreihe karten={schlange.karten} />
            {schlange.farbenfusionen && schlange.farbenfusionen.length > 0 ? (
              <small> Fusionen: {json(schlange.farbenfusionen)}</small>
            ) : null}
          </p>
        ))
      )}
      <p>
        <strong>Geheime Aufgabe:</strong> <Aufgabe aufgabe={spieler.geheimeAufgabe} />{' '}
        {spieler.geheimeAufgabeErfuellt === true ? 'erfüllt' : 'nicht erfüllt'}
      </p>
      <p>
        <strong>Erfüllte Aufgaben:</strong> <Aufgabenliste aufgaben={spieler.erfuellteAufgaben} />
        {spieler.endspurtVerdoppelteAufgabenIds && spieler.endspurtVerdoppelteAufgabenIds.length > 0 ? (
          <small> im Endspurt verdoppelt: {spieler.endspurtVerdoppelteAufgabenIds.join(', ')}</small>
        ) : null}
      </p>
      <p>
        <strong>Ausgespielte Sonderkarten:</strong>{' '}
        {spieler.ausgespielteSonderkartenNamen.length === 0 ? (
          <span className="et-leer">keine</span>
        ) : (
          spieler.ausgespielteSonderkartenNamen.join(', ')
        )}
        {' · '}Dreiergruppen durch Häutung: {spieler.schlangenhaeutungDreiergruppen}
      </p>
    </article>
  )
}

function Stapel({ zustand }: { zustand: Spielzustand }) {
  return (
    <section className="et-abschnitt">
      <h2>Stapel</h2>
      <details data-testid="nachziehstapel">
        <summary>Nachziehstapel: {zustand.nachziehstapel.length} Karten, oberste zuerst</summary>
        <Kartenreihe karten={zustand.nachziehstapel} leer="leer" />
      </details>
      <details data-testid="ablagestapel" open>
        <summary>Ablagestapel: {zustand.ablagestapel.length} Karten, unterste zuerst</summary>
        <Kartenreihe karten={zustand.ablagestapel} leer="leer" />
      </details>
      <p data-testid="offene-aufgaben">
        <strong>Offene Aufgaben ({zustand.offeneAufgaben.length}):</strong>{' '}
        <Aufgabenliste aufgaben={zustand.offeneAufgaben} />
      </p>
      <details>
        <summary>Aufgabenstapel: {zustand.aufgabenStapel.length} Karten</summary>
        <Aufgabenliste aufgaben={zustand.aufgabenStapel} />
      </details>
    </section>
  )
}

type Wertungsergebnis =
  | { wertungen: SpielerWertungsEintrag[]; gewinner: GewinnerEintrag[] | null }
  | { fehler: string }

/** Wirft die Engine beim Werten, steht ihr Grund da; die Invariante dazu ist dann rot. */
function werte(zustand: Spielzustand): Wertungsergebnis {
  try {
    return {
      wertungen: berechneSpielzustandGesamtwertung(zustand).spielerwertungen,
      gewinner: zustand.zugphase === 'Spielende' ? berechneGewinner(zustand.spieler).gewinner : null,
    }
  } catch (fehler) {
    return { fehler: fehler instanceof Error ? fehler.message : String(fehler) }
  }
}

function Wertung({ zustand }: { zustand: Spielzustand }) {
  const ergebnis = werte(zustand)
  return (
    <section className="et-abschnitt" data-testid="wertung">
      <h2>Wertung</h2>
      {'fehler' in ergebnis ? (
        <p className="et-fehler">Die Wertung wirft: {ergebnis.fehler}</p>
      ) : (
        <>
          <table className="et-tabelle">
            <thead>
              <tr>
                <th>Spieler</th>
                <th>Farbgruppen</th>
                <th>Aufgaben</th>
                <th>Kettenbonus</th>
                <th>Gesamt</th>
              </tr>
            </thead>
            <tbody>
              {ergebnis.wertungen.map((eintrag) => (
                <tr key={eintrag.spielerId}>
                  <td>{eintrag.name}</td>
                  <td>{eintrag.wertung.farbgruppenPunkte.gesamtPunkte}</td>
                  <td>{eintrag.wertung.aufgabenPunkte.gesamtPunkte}</td>
                  <td>{eintrag.kettenbonus}</td>
                  <td>{eintrag.gesamtPunkte}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ergebnis.gewinner === null ? null : (
            <p data-testid="gewinner">
              Gewonnen: {ergebnis.gewinner.map((g) => `${g.name} (${g.gesamtPunkte})`).join(', ')}
            </p>
          )}
        </>
      )}
    </section>
  )
}
