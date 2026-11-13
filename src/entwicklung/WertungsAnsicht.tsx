import { berechneEndwertung, berechneZwischenstand } from '../engine'
import type { Endwertung, SchlangenWertung, SpielerWertung, Spielzustand, Zwischenstand } from '../engine'
import { fehlertext } from './invarianten'

/*
Die Wertung am Entwicklertisch (E10): der Zwischenstand aus der Sicht von
Spieler 1, die Endwertung und je Spieler die Aufschlüsselung, so dass man jede
Zahl von Hand nachrechnen kann. Alle Zahlen kommen aus der Engine.
*/

type Ergebnis = { zwischenstand: Zwischenstand; endwertung: Endwertung } | { fehler: string }

/** Wirft die Engine beim Werten, steht ihr Grund da; die Invariante dazu ist dann rot. */
function werte(zustand: Spielzustand): Ergebnis {
  try {
    return { zwischenstand: berechneZwischenstand(zustand, zustand.spieler[0].id), endwertung: berechneEndwertung(zustand) }
  } catch (fehler) {
    return { fehler: fehlertext(fehler) }
  }
}

function zahlOder(wert: number | null, ohne: string): string {
  return wert === null ? ohne : String(wert)
}

function Tabelle({ wertungen, testid, titel }: { wertungen: SpielerWertung[]; testid: string; titel: string }) {
  return (
    <table className="et-tabelle" data-testid={testid}>
      <caption>{titel}</caption>
      <thead>
        <tr>
          <th>Spieler</th>
          <th title="Punkte aus Farbgruppen">Gruppen</th>
          <th title="Vielfaltbonus, nur mit Erweiterung">Vielfalt</th>
          <th title="Kettenbonus, erst nach Spielende">Kette</th>
          <th title="Punkte aus Aufgaben, nur mit Erweiterung">Aufg.</th>
          <th>Summe</th>
        </tr>
      </thead>
      <tbody>
        {wertungen.map((wertung) => (
          <tr key={wertung.spielerId}>
            <td>{wertung.name}</td>
            <td>{wertung.gruppenPunkte}</td>
            <td>{zahlOder(wertung.vielfaltBonus, '–')}</td>
            <td>{wertung.kette === null ? '–' : wertung.kette.bonus}</td>
            <td>{zahlOder(wertung.aufgaben === null ? null : wertung.aufgabenPunkte, '–')}</td>
            <td data-testid="summe">{wertung.summe}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function SchlangenZeile({ schlange }: { schlange: SchlangenWertung }) {
  const gruppen = schlange.gruppen.map((g) => `${g.farbe}×${g.laenge} = ${g.punkte}`).join(', ')
  const joker = schlange.joker
    .map((j) => `${j.art} (${j.karteId}) ${j.farbe === null ? 'in keiner Gruppe' : `als ${j.farbe}`}`)
    .join(', ')
  return (
    <li>
      {schlange.schlangenId}: Gruppen {gruppen === '' ? 'keine' : gruppen}, zusammen {schlange.gruppenPunkte}
      {joker === '' ? '' : `; Joker: ${joker}`}
      {schlange.vielfaltBonus === null
        ? ''
        : `; Farben mit Gruppe: ${schlange.vielfaltFarben.join(', ') || 'keine'}, Vielfalt ${schlange.vielfaltBonus}`}
    </li>
  )
}

function Aufschluesselung({ wertung }: { wertung: SpielerWertung }) {
  const aufgaben =
    wertung.aufgaben === null
      ? 'Aufgaben: ohne Erweiterung'
      : `Aufgaben: ${wertung.aufgaben.map((a) => `${a.name} ${a.punkte}${a.geheim ? ' (geheim)' : ''}`).join(', ') || 'keine'}`
  const kette =
    wertung.kette === null
      ? ''
      : wertung.kette.laenge === 0
        ? 'Kette: keine ab 3 Farbkarten'
        : `Kette ${wertung.kette.laenge}, Bonus ${wertung.kette.bonus}`
  return (
    <div data-testid="aufschluesselung">
      <strong>{wertung.name}</strong>
      {wertung.schlangen.length === 0 ? (
        <p className="et-leer">keine Schlange</p>
      ) : (
        <ul>
          {wertung.schlangen.map((schlange) => (
            <SchlangenZeile key={schlange.schlangenId} schlange={schlange} />
          ))}
        </ul>
      )}
      <p>
        {wertung.vielfaltBonus === null ? 'Vielfaltbonus: ohne Erweiterung' : `Vielfaltbonus ${wertung.vielfaltBonus}`}; {kette};{' '}
        {aufgaben}; Summe {wertung.summe}
      </p>
    </div>
  )
}

export function WertungsAnsicht({ zustand }: { zustand: Spielzustand }) {
  const ergebnis = werte(zustand)
  if ('fehler' in ergebnis) {
    return (
      <section className="et-abschnitt" data-testid="wertung">
        <h2>Wertung</h2>
        <p className="et-fehler">Die Wertung wirft: {ergebnis.fehler}</p>
      </section>
    )
  }
  const { zwischenstand, endwertung } = ergebnis
  const beendet = zustand.partiephase === 'Beendet'
  const gewinner = endwertung.spieler.filter((wertung) => endwertung.gewinner.includes(wertung.spielerId))
  return (
    <section className="et-abschnitt" data-testid="wertung">
      <h2>Wertung</h2>
      <Tabelle
        wertungen={zwischenstand.spieler}
        testid="zwischenstand"
        titel={`Zwischenstand (Sicht ${zustand.spieler[0].name}): ohne Kettenbonus, ohne fremde geheime Aufgaben`}
      />
      <Tabelle
        wertungen={endwertung.spieler}
        testid="endwertung"
        titel={beendet ? 'Endwertung' : 'Endwertung, wenn die Partie jetzt endete'}
      />
      <p data-testid="gewinner">
        {beendet ? 'Gewonnen' : 'Vorn'}: {gewinner.map((wertung) => `${wertung.name} (${wertung.summe})`).join(', ')}
      </p>
      <h3>Aufschlüsselung der Endwertung</h3>
      {endwertung.spieler.map((wertung) => (
        <Aufschluesselung key={wertung.spielerId} wertung={wertung} />
      ))}
    </section>
  )
}
