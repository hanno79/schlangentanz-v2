import { ermittleEntscheider, istAuslagekarte } from '../engine'
import type { AufgabenkarteInfo, Auslagekarte, Schlange, Spieler, Spielzustand } from '../engine'
import { name } from './namen'
import { Karte, Kartenreihe } from './Karte'
import { WertungsAnsicht } from './WertungsAnsicht'

/** Der ganze Spielzustand, lesbar: alle Hände offen, alle Stapel, Partiephase, Zug, Wertung. */
export function ZustandsAnsicht({ zustand }: { zustand: Spielzustand }) {
  return (
    <>
      <Kopf zustand={zustand} />
      <section className="et-abschnitt">
        <h2>Spieler</h2>
        <div className="et-spielerliste">
          {zustand.spieler.map((spieler, index) => (
            <SpielerAnsicht key={spieler.id} spieler={spieler} aktiv={index === zustand.zug.spielerIndex} />
          ))}
        </div>
      </section>
      <Tischmitte zustand={zustand} />
      <WertungsAnsicht zustand={zustand} />
    </>
  )
}

function json(wert: unknown): string {
  return JSON.stringify(wert)
}

function Kopf({ zustand }: { zustand: Spielzustand }) {
  const { zug } = zustand
  return (
    <section className="et-abschnitt">
      <h2>Lage</h2>
      <dl className="et-lage">
        <dt>Erweiterung</dt>
        <dd data-testid="erweiterung">{zustand.erweiterung ? 'mit' : 'ohne'}</dd>
        <dt>Partiephase</dt>
        <dd data-testid="partiephase">{zustand.partiephase}</dd>
        <dt>Am Zug</dt>
        <dd data-testid="zug">
          {name(zustand, zug.spielerIndex)}, Teilzug {zug.teilzug}, {zug.abschnitt}; gespielt: {zug.gespielteFarbkarten}{' '}
          Farbkarte(n), {zug.gespielteSonderkarten} Sonderkarte(n)
          {zug.verdopplerGespielt ? ', Verdoppler' : ''}
          {zug.farbenfusionGespielt ? ', Farbenfusion' : ''}
        </dd>
        <dt>Entscheidet</dt>
        <dd data-testid="entscheider">{name(zustand, ermittleEntscheider(zustand))}</dd>
        <dt>Schlussrunde</dt>
        <dd>
          {zustand.schlussrundeAusloeser === null ? 'nein' : `ausgelöst von ${name(zustand, zustand.schlussrundeAusloeser)}`}
        </dd>
        <dt>Schwebend</dt>
        <dd>
          {zustand.schwebend === null ? (
            'keine Karte'
          ) : (
            <span data-testid="schwebend">
              <Karte karte={zustand.schwebend.karte} /> {json(zustand.schwebend.aktion)}; entscheiden noch:{' '}
              {zustand.schwebend.ausstehend.map((index) => name(zustand, index)).join(', ') || 'niemand'}; abgewehrt:{' '}
              {zustand.schwebend.abgewehrt.map((index) => name(zustand, index)).join(', ') || 'niemand'}
            </span>
          )}
        </dd>
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

function Auslage({ karte }: { karte: Auslagekarte }) {
  return (
    <span className="et-aufgabe">
      {karte.typ} <small>{karte.id}</small>
    </span>
  )
}

function SchlangenAnsicht({ schlange, nummer }: { schlange: Schlange; nummer: number }) {
  return (
    <div data-testid="schlange">
      <p>
        <strong>
          Schlange {nummer} <small>{schlange.id}</small>:
        </strong>{' '}
        <Kartenreihe karten={schlange.karten} />
      </p>
      {schlange.fusionen.map((fusion) => (
        <p key={fusion.karteId} data-testid="fusion">
          <small>Unter {fusion.karteId}:</small> <Kartenreihe karten={fusion.unter} />
        </p>
      ))}
    </div>
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
        spieler.schlangen.map((schlange, index) => <SchlangenAnsicht key={schlange.id} schlange={schlange} nummer={index + 1} />)
      )}
      <details data-testid="ablagestapel" open={spieler.ablagestapel.length > 0}>
        <summary>Ablagestapel: {spieler.ablagestapel.length} Karten, unterste zuerst</summary>
        <Kartenreihe karten={spieler.ablagestapel} leer="leer" />
      </details>
      {spieler.geheimeAufgabe === null ? null : (
        <p>
          <strong>Geheime Aufgabe:</strong> <Aufgabe aufgabe={spieler.geheimeAufgabe} />{' '}
          {spieler.geheimeAufgabeErfuellt ? 'erfüllt' : 'nicht erfüllt'}
        </p>
      )}
      {spieler.comeback === null && spieler.risikoKarten.length === 0 ? null : (
        <p>
          <strong>Offen vor sich:</strong>{' '}
          {spieler.comeback === null ? null : (
            <>
              <Auslage karte={spieler.comeback.karte} /> {spieler.comeback.verbraucht ? '(verbraucht)' : ''}{' '}
            </>
          )}
          {spieler.risikoKarten.map((karte) => (
            <Auslage key={karte.id} karte={karte} />
          ))}
        </p>
      )}
      <p>
        <strong>Erfüllte Aufgaben:</strong> <Aufgabenliste aufgaben={spieler.erfuellteAufgaben} />
      </p>
      <p>
        <strong>Ausgespielte Sonderkarten:</strong>{' '}
        {spieler.ausgespielteSonderkarten.length === 0 ? (
          <span className="et-leer">keine</span>
        ) : (
          spieler.ausgespielteSonderkarten.join(', ')
        )}
        {' · '}Dreiergruppen durch Häutung: {spieler.schlangenhaeutungDreiergruppen}
      </p>
    </article>
  )
}

function Tischmitte({ zustand }: { zustand: Spielzustand }) {
  return (
    <section className="et-abschnitt">
      <h2>Tischmitte</h2>
      <details data-testid="nachziehstapel">
        <summary>Nachziehstapel: {zustand.nachziehstapel.length} Karten, oberste zuerst</summary>
        <Kartenreihe karten={zustand.nachziehstapel} leer="leer" />
      </details>
      <p data-testid="gruben">
        <strong>Ausliegende Schlangengruben:</strong>{' '}
        {zustand.ausliegendeGruben.length === 0 ? (
          <span className="et-leer">keine</span>
        ) : (
          zustand.ausliegendeGruben.map((grube) => (
            <span key={grube.karte.id}>
              <Karte karte={grube.karte} /> vor {name(zustand, grube.vor)}, gespielt von {name(zustand, grube.gespieltVon)}{' '}
            </span>
          ))
        )}
      </p>
      <p data-testid="aus-dem-spiel">
        <strong>Aus dem Spiel:</strong>{' '}
        {zustand.ausDemSpiel.length === 0 ? (
          <span className="et-leer">nichts</span>
        ) : (
          zustand.ausDemSpiel.map((karte) =>
            istAuslagekarte(karte) ? <Auslage key={karte.id} karte={karte} /> : <Karte key={karte.id} karte={karte} />,
          )
        )}
      </p>
      <p data-testid="offene-aufgaben">
        <strong>Offene Aufgaben ({zustand.offeneAufgaben.length}):</strong> <Aufgabenliste aufgaben={zustand.offeneAufgaben} />
      </p>
      <details>
        <summary>Aufgabenstapel: {zustand.aufgabenStapel.length} Karten</summary>
        <Aufgabenliste aufgaben={zustand.aufgabenStapel} />
      </details>
    </section>
  )
}
