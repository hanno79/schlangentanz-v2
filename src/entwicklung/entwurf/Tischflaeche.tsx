import type { AufgabenkarteInfo, Spielkarte } from '../../engine'
import { Karte, Kartenrueckseite } from '../../ui/karten/Karte'
import { kartenname } from '../../ui/karten/kartentexte'
import {
  EIGENE_ABLAGE,
  EIGENE_SCHLANGEN,
  GEHEIME_AUFGABE,
  NACHZIEHSTAPEL,
  OFFENE_AUFGABEN,
  ZUSATZKARTEN,
} from './beispiel'
import type { BeispielGegner, Zielart } from './beispiel'
import { Schlange, ZielKnopf } from './Schlange'
import type { Zielwahl } from './Schlange'

interface FlaecheEigenschaften {
  gegner: BeispielGegner[]
  /** Welche Art Ziel die gewählte Handkarte anbietet; `null` ohne Wahl. */
  zielart: Zielart | null
  zielwahl: Zielwahl
  zeigeGross: (karte: Spielkarte | AufgabenkarteInfo) => void
}

/** Alles zwischen Kopfleiste und eigenem Bereich: Gegner, Tischmitte und Auslage. Scrollt bei Bedarf. */
export function Tischflaeche({ gegner, zielart, zielwahl, zeigeGross }: FlaecheEigenschaften) {
  return (
    <div className="tisch-flaeche">
      <section className="gegnerliste" aria-label="Gegner">
        {gegner.map((spieler) => (
          <Gegner key={spieler.name} spieler={spieler} zielart={zielart} zielwahl={zielwahl} />
        ))}
      </section>

      <section className="mitte" aria-label="Tischmitte">
        <div className="stapel">
          <Kartenrueckseite />
          <span>
            Nachziehstapel <strong>{NACHZIEHSTAPEL}</strong>
          </span>
        </div>
        <div className="aufgaben">
          <h2 className="bereichstitel">Offene Aufgaben</h2>
          <ul className="kartenreihe">
            {OFFENE_AUFGABEN.map((aufgabe) => (
              <li key={aufgabe.id}>
                <GrossKnopf karte={aufgabe} zeigeGross={zeigeGross} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="auslage" aria-label="Deine Auslage">
        <h2 className="bereichstitel">Deine Auslage</h2>
        <ul className="kartenreihe">
          <li className="mit-unterschrift">
            <GrossKnopf karte={GEHEIME_AUFGABE} zeigeGross={zeigeGross} name={`Deine geheime ${kartenname(GEHEIME_AUFGABE)}`} />
            <span>geheim</span>
          </li>
          {ZUSATZKARTEN.map((karte) => (
            <li key={karte.id}>
              <GrossKnopf karte={karte} zeigeGross={zeigeGross} />
            </li>
          ))}
          <li className="mit-unterschrift">
            {zielart === 'ablage' ? (
              <ZielKnopf
                ziel={{ id: 'ablage', beschreibung: 'ohne Wirkung auf deine Ablage' }}
                zielwahl={zielwahl}
                klasse="ziel--karte"
                name="Ohne Wirkung auf deine Ablage legen"
              >
                <Karte karte={EIGENE_ABLAGE.oben} />
              </ZielKnopf>
            ) : (
              <Karte karte={EIGENE_ABLAGE.oben} />
            )}
            <span>Ablage {EIGENE_ABLAGE.anzahl}</span>
          </li>
        </ul>
      </section>
    </div>
  )
}

/** Die eigenen Schlangen stehen unten fest bei der Hand, damit sie nie aus dem Blick geraten (Plan O4.1). */
export function EigeneSchlangen({ zielart, zielwahl }: { zielart: Zielart | null; zielwahl: Zielwahl }) {
  return (
    <section className="eigene" aria-label="Deine Schlangen">
      <h2 className="bereichstitel">Deine Schlangen</h2>
      {EIGENE_SCHLANGEN.map((schlange, index) => (
        <Schlange
          key={schlange.id}
          schlange={schlange}
          titel={`deine Schlange ${index + 1}`}
          endenAlsZiel={zielart === 'schlangenenden'}
          kartenAlsZiel={false}
          zielwahl={zielwahl}
        />
      ))}
    </section>
  )
}

function Gegner({ spieler, zielart, zielwahl }: { spieler: BeispielGegner; zielart: Zielart | null; zielwahl: Zielwahl }) {
  const kennung = `gegner-${spieler.name}`
  return (
    <article className="gegner" aria-labelledby={kennung}>
      <header className="gegner-kopf">
        <h2 id={kennung} className="gegner-name">
          {spieler.name}
        </h2>
        <span className="gegner-info">{spieler.handkarten} Handkarten</span>
        {zielart === 'gegner' && (
          <ZielKnopf
            ziel={{ id: `gegner:${spieler.name}`, beschreibung: `${spieler.name} setzt einen Zug aus` }}
            zielwahl={zielwahl}
            klasse="ziel--gegner"
            name={`${spieler.name} wählen`}
          >
            Wählen
          </ZielKnopf>
        )}
        <span className="gegner-ablage">
          <Karte karte={spieler.ablage.oben} />
          <span>Ablage {spieler.ablage.anzahl}</span>
        </span>
      </header>
      {spieler.schlangen.map((schlange, index) => (
        <Schlange
          key={schlange.id}
          schlange={schlange}
          titel={`${spieler.name}s Schlange ${index + 1}`}
          endenAlsZiel={zielart === 'schlangenenden'}
          kartenAlsZiel={zielart === 'gegnerkarten'}
          zielwahl={zielwahl}
        />
      ))}
    </article>
  )
}

/** Eine offen liegende Karte, die man zum Lesen gross ansehen kann. */
function GrossKnopf({
  karte,
  zeigeGross,
  name,
}: {
  karte: Spielkarte | AufgabenkarteInfo
  zeigeGross: (karte: Spielkarte | AufgabenkarteInfo) => void
  name?: string
}) {
  return (
    <button type="button" className="kartenknopf" aria-label={name ?? kartenname(karte)} onClick={() => zeigeGross(karte)}>
      <Karte karte={karte} />
    </button>
  )
}
