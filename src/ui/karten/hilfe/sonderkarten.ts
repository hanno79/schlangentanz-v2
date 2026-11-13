import type { Sonderkartenname } from '../../../engine'
import { hilfeId, reihe, type Hilfeabschnitt, type Kartenhilfe, type Textbaustein } from './typen'

/* Die Sonderkarten aus A7, in der Reihenfolge der Materialliste (A1). */

function sonderkarte(
  name: Sonderkartenname,
  quelle: string,
  kurz: string,
  abschnitte: readonly Hilfeabschnitt[],
): Kartenhilfe {
  return { karte: { typ: 'Sonderkarte', id: hilfeId(name), name }, quellen: [quelle], kurz, abschnitte }
}

const regeln = (...punkte: string[]): Hilfeabschnitt => ({ titel: 'Wichtige Regeln', inhalt: [punkte] })
const beispiele = (...inhalt: Textbaustein[]): Hilfeabschnitt => ({ titel: 'Beispiele', inhalt })

const NUR_ERWEITERUNG =
  'Hinweis: Diese Karte ist Teil der Erweiterung "Schlangenkorb des Glücks" und wird nur bei Verwendung der Erweiterung verwendet.'

export const SONDERKARTEN_HILFE: readonly Kartenhilfe[] = [
  sonderkarte('Farbenschutz', 'A7.2', 'Schützt vor negativen Effekten einer Sonderkarte', [
    {
      inhalt: [
        'Eine defensive Karte, die vor den negativen Auswirkungen von Sonderkarten schützt und als Reaktion auf diese gespielt werden kann. Der Farbenschutz ist besonders wertvoll, wenn man wichtige Karten in seiner Schlange vor Angriffen schützen möchte.',
      ],
    },
    beispiele(
      'Spieler B spielt eine Schlangenblockade gegen Spieler A. Spieler A kann, wenn er möchte, einen Farbenschutz spielen, um die Schlangenblockade abzuwehren. Die Schlangenblockade wird auf den Ablagestapel von Spieler B gelegt, und Spieler A bleibt unberührt.',
      reihe('Farbenschutz', 'Schlangenblockade'),
    ),
    regeln(
      'Spiele als Reaktion auf eine Sonderkarte',
      'Lege den Farbenschutz auf deinen Ablagestapel',
      'Die abgewehrte Sonderkarte kommt auf den Ablagestapel des Angreifers',
      'Schützt vor allen negativen Effekten von Sonderkarten',
    ),
  ]),
  sonderkarte(
    'Regenbogenschlange',
    'A7.3',
    'Eine flexible Joker-Karte, die als Karte einer beliebigen Farbe eingesetzt werden kann',
    [
      {
        inhalt: [
          'Die Regenbogenschlange ist eine äusserst vielseitige Joker-Karte, die als Karte jeder beliebigen Farbe eingesetzt werden kann. Sie bietet maximale Flexibilität bei der Bildung von Farbgruppen und kann in verschiedenen Situationen strategisch eingesetzt werden.',
        ],
      },
      beispiele(
        'Eine Schlange hat folgende Karten: Blau - Blau - Regenbogenschlange. Die Regenbogenschlange wird als blaue Karte gewertet, um eine Dreiergruppe zu bilden. Diese Gruppe bringt 2 Punkte (1 Punkt pro blaue Karte, die Regenbogenschlange bringt keinen Punkt).',
        reihe('Blau', 'Blau', 'Regenbogenschlange'),
        "Ein Spieler hat die Aufgabe 'Farbvielfalt' (eine Karte jeder Farbe) und hat bereits Blau, Rot, Gelb, Braun und Grün in seiner Schlange. Er legt eine Regenbogenschlange an und nutzt sie als violette Karte, um die Aufgabe zu erfüllen. [Erweiterung]",
        reihe('Blau', 'Rot', 'Gelb', 'Braun', 'Grün', 'Regenbogenschlange'),
        'Eine Schlange hat: Rot - Rot - Regenbogenschlange - Braun - Braun. Diese Gruppe bringt 4 Punkte (2 × 2 Punkte für die braunen Karten, 0 Punkte für die Regenbogenschlange).',
        reihe('Rot', 'Rot', 'Regenbogenschlange', 'Braun', 'Braun'),
      ),
      regeln(
        'Gilt als Karte der Farbe, die für den Spieler am vorteilhaftesten ist',
        'Die Farbe ist nie festgelegt und kann sich während des Spiels ändern [Erweiterung]',
        'Verbindet Farbgruppen, indem sie als Karte der gewünschten Farbe zählt',
        'Die Regenbogenschlange bringt selbst keine Punkte',
        'Muss Teil einer Dreiergruppe (oder länger) sein, um die Gruppe zu vervollständigen',
        'Die anderen Karten der Gruppe bringen ihre normalen Punkte',
        'Zählt auch für den Vielfaltbonus als ihre Farbe [Erweiterung]',
        'Bei der Wertung am Spielende zählt sie als die Farbe, die dem Spieler die meisten Punkte bringt',
        'Kann als beliebige der sechs Farben gewertet werden, auch als grün',
        'Bei jeder Aufgabe zählt sie als die Farbe, mit der die Aufgabe erfüllt ist. Eine erfüllte Aufgabe bleibt erfüllt, auch wenn die Karte später anders zählt [Erweiterung]',
        'Unterbricht keine Farbreihen, wenn sie als passende Farbe genutzt wird',
      ),
    ],
  ),
  sonderkarte('Schlangenfrass', 'A7.4', 'Entfernt eine oder zwei Karten aus beliebigen Schlangen', [
    {
      inhalt: [
        'Der Spieler hat die Wahl zwischen drei Optionen: a) Entferne eine beliebige Karte aus deiner eigenen Schlange. b) Entferne eine Schlangenblockade aus deiner eigenen Schlange. c) Entferne zwei beliebige Karten aus den Schlangen der Mitspieler. Diese können Farbkarten, Regenbogenschlangen, Farbfusionen oder andere Sonderkarten sein, ausser Schlangenblockaden. Die Karten können aus einer oder zwei verschiedenen Schlangen stammen und von beliebigen Positionen entfernt werden.',
      ],
    },
    beispiele(
      'Option a): Ein Spieler entfernt eine rote Karte aus seiner eigenen Schlange, um Platz für eine besser passende Karte zu schaffen.',
      reihe('Schlangenfrass', 'Rot'),
      'Option b): Ein Spieler hat eine Schlangenblockade in seiner Schlange. Er spielt Schlangenfrass und wählt Option b), um die Schlangenblockade zu entfernen. Die Schlangenblockade kommt auf den Ablagestapel des Spielers, der Schlangenfrass gespielt hat.',
      reihe('Schlangenfrass', 'Schlangenblockade'),
      'Option c): Ein Spieler entfernt eine Regenbogenschlange und eine gelbe Farbkarte aus der Schlange eines Mitspielers. Es bleiben nur noch zwei gelbe Farbkarten die keine Punkte mehr zählen.',
      reihe('Schlangenfrass', 'Regenbogenschlange', 'Gelb', 'Gelb', 'Gelb'),
    ),
    regeln(
      'Die entfernten Karten kommen auf den Ablagestapel',
      'Bei Option c) müssen zwei Karten entfernt werden, sofern möglich',
      'Schlangenblockaden in gegnerischen Schlangen können nicht mit Option c) entfernt werden',
      'Beim Entfernen einer Farbfusionskarte wird nur die Farbfusionskarte selbst entfernt',
      'Die darunter liegenden fusionierten Karten werden wieder getrennt und bleiben an ihrer Position',
    ),
  ]),
  sonderkarte('Schlangenblockade', 'A7.5', 'Fügt der Schlange eine neutrale, nicht farbige Karte hinzu', [
    {
      inhalt: [
        'Fügt der Schlange eine neutrale, nicht farbige Karte hinzu. Die Schlangenblockade ist ein mächtiges taktisches Werkzeug, das den Spielfluss des Gegners erheblich einschränken kann. Sie kann durch Farbenschutz verhindert oder durch Schlangenfrass entfernt werden.',
      ],
    },
    beispiele(
      'Spieler B hat drei rote Karten in einer Reihe. Spieler A legt eine Schlangenblockade zwischen die erste und die zweite rote Karte: Rot – Schlangenblockade – Rot – Rot. Die Dreierreihe ist damit unterbrochen und zählt in der Wertung keine Punkte mehr, bis Spieler B die Schlangenblockade mit Schlangenfrass entfernt.',
      reihe('Rot', 'Schlangenblockade', 'Rot', 'Rot'),
    ),
    regeln(
      'Wähle eine Schlange aus',
      'Lege die Blockade an eine beliebige Stelle der Schlange',
      'Die Blockade bleibt bis zu ihrer Entfernung bestehen',
      'Kann durch Farbenschutz abgewehrt werden',
      'Kann nur durch Schlangenfrass oder spezielle Karteneffekte entfernt werden',
    ),
  ]),
  sonderkarte(
    'Farbendieb',
    'A7.1',
    'Erlaubt es, einem anderen Spieler eine Karte aus dessen Schlange wegzunehmen und sofort in die eigene Schlange einzufügen.',
    [
      {
        inhalt: [
          'Eine taktische Karte, die es ermöglicht, eine Karte aus der Schlange eines Mitspielers zu stehlen und für die eigene Strategie zu nutzen. Der Farbendieb ist besonders nützlich, wenn man eine bestimmte Farbe für eine Dreiergruppe benötigt oder die Strategie eines Gegners durchkreuzen möchte.',
        ],
      },
      beispiele(
        'Spieler A spielt Farbendieb. Er stiehlt eine blaue Karte aus der Schlange von Spieler B und fügt sie an seine eigene Schlange an.',
        reihe('Farbendieb', 'Blau'),
      ),
      regeln(
        'Wähle eine Karte aus einer gegnerischen Schlange',
        'Lege die Karte an eine beliebige Position in deiner Schlange',
        'Der Farbendieb kommt auf deinen Ablagestapel',
        'Kann durch Farbenschutz abgewehrt werden',
      ),
    ],
  ),
  sonderkarte('Schlangengrube', 'A7.6', 'Lässt einen Mitspieler deiner Wahl einen kompletten Zug aussetzen', [
    {
      inhalt: [
        'Der Spieler, der die Schlangengrube spielt, wählt einen Mitspieler aus. Der gewählte Spieler muss seinen nächsten Zug komplett aussetzen. Während des Aussetzens darf der Spieler keine Aktionen durchführen - weder Karten ziehen noch Karten ausspielen.',
      ],
    },
    beispiele(
      'Spieler A spielt eine Schlangengrube gegen Spieler B. Spieler B hat keinen Farbenschutz und muss seinen nächsten Zug komplett aussetzen. Nach dem ausgesetzten Zug wird die Schlangengrube auf den Ablagestapel gelegt.',
      'Spieler A spielt eine Schlangengrube gegen Spieler B. Spieler B hat einen Farbenschutz und spielt diesen als Reaktion. Die Schlangengrube wird wirkungslos auf den Ablagestapel gelegt, und Spieler B kann seinen Zug normal ausführen.',
      reihe('Schlangengrube', 'Farbenschutz'),
    ),
    regeln(
      'Der Spieler, der die Schlangengrube spielt, wählt einen Mitspieler aus',
      'Der gewählte Spieler muss seinen nächsten Zug komplett aussetzen',
      'Während des Aussetzens darf der Spieler keine Aktionen durchführen',
      'Die Schlangengrube wird nach dem ausgesetzten Zug auf den Ablagestapel gelegt',
      'Die Schlangengrube kann durch einen Farbenschutz abgewehrt werden',
      'Wird ein Farbenschutz gespielt, wird die Schlangengrube ohne Wirkung abgelegt',
      'Der ausgewählte Spieler darf dann seinen Zug normal durchführen',
    ),
  ]),
  sonderkarte(
    'Farbenfusion',
    'A7.7',
    'Zwei nebeneinanderliegende Karten der gleichen Farbe werden unter die Farbenfusionskarte gelegt',
    [
      {
        inhalt: [
          'Zwei nebeneinanderliegende Karten der gleichen Farbe werden unter die Farbenfusionskarte gelegt. Im Spiel liegen die Farbkarten übereinander und die Fusionskarte obenauf. Die Farbenfusion zählt als eine einzelne Karte einer beliebiger Farbe und muss Teil einer Dreiergruppe sein, um Punkte zu bringen.',
        ],
      },
      beispiele(
        'Ein Spieler hat folgende Karten in seiner Schlange: Blau - Blau - Gelb-Gelb. Er spielt Farbenfusion und legt sie auf die beiden gelben Karten. Diese beiden Karten gelten nun als eine Karte beliebiger Farbe (die am vorteilhaftesten ist).',
        reihe('Blau', 'Blau', 'Gelb + Farbenfusion + Gelb'),
        'Ein Spieler hat folgende Karten in seiner Schlange: Blau - Blau - Farbenfusion(fusionierte Gelb - Gelb) - Rot - Rot.',
        reihe('Blau', 'Blau', 'Gelb + Farbenfusion + Gelb', 'Rot', 'Rot'),
      ),
      regeln(
        'Pro Zug darf nur eine Farbenfusion durchgeführt werden',
        'Die Farbenfusion liegt oben auf den fusionierten Karten und markiert diese als eine Einheit',
        'Wird eine Farbenfusion entfernt, werden die darunter liegenden Karten wieder zu einzelnen Karten',
        'Die Farbenfusion zählt als eine einzelne Karte einer beliebigen Farbe',
        'Muss Teil einer Dreiergruppe sein, um Punkte zu bringen',
        'Bringt die Punkte beider fusionierter Karten',
        'Zählt nur als eine Farbe für den Vielfaltbonus [Erweiterung]',
        'Für den Vielfaltbonus zählt die Farbe, die die Fusion bei der Wertung hat [Erweiterung]',
        'Die Farbe der Fusion ist nie festgelegt. Bei jeder Aufgabe zählt sie als die Farbe, mit der die Aufgabe erfüllt ist, bei der Wertung als die Farbe, die dem Spieler die meisten Punkte bringt [Erweiterung]',
        'Die ursprünglichen Farben der fusionierten Karten spielen für Aufgaben keine Rolle mehr [Erweiterung]',
      ),
    ],
  ),
  sonderkarte(
    'Verdoppler',
    'A7.8',
    'Erlaubt dir, nach deinem Zug die Hand aufzufüllen und sofort einen zweiten Zug zu spielen',
    [
      {
        inhalt: [
          'Der Verdoppler zählt als Sonderkarte deines Zuges. Du spielst ihn zusammen mit einer Farbkarte, die Reihenfolge ist frei. Damit ist dein erster Zug beendet: Du füllst deine Handkarten auf und spielst sofort einen zweiten Zug, wieder mit einer Farbkarte und optional einer Sonderkarte. Neben dem Verdoppler spielst du so bis zu 3 Karten. Das ermöglicht eine schnellere Entwicklung der eigenen Schlange oder die Kombination mehrerer taktischer Züge.',
        ],
      },
      beispiele(
        'Ein Spieler spielt den Verdoppler und eine rote Karte. Er füllt seine Hand auf und spielt im zweiten Zug eine blaue Karte und Schlangenfrass. Neben dem Verdoppler hat er so drei Karten gespielt.',
      ),
      regeln(
        'Spiele den Verdoppler als Sonderkarte deines Zuges, vor oder nach deiner Farbkarte',
        'Fülle danach deine Handkarten auf',
        'Spiele sofort einen zweiten Zug mit einer Farbkarte und optional einer Sonderkarte',
        'Neben dem Verdoppler spielst du so bis zu 3 Karten',
        'Kann nicht mit anderen zugerweiternden Effekten kombiniert werden',
      ),
    ],
  ),
  sonderkarte(
    'Schlangenhäutung',
    'A7.9',
    'Ermöglicht es, einen Abschnitt von 3–5 Farbkarten in der Schlange neu anzuordnen',
    [
      {
        inhalt: [
          "Die Schlangenhäutung ist eine taktische Karte aus der Erweiterung 'Schlangenkorb des Glücks', die es ermöglicht, einen Abschnitt von 3–5 Farbkarten in der Schlange neu anzuordnen. Es dürfen nur Farbkarten neu angeordnet werden. Der gewählte Abschnitt muss 3–5 aufeinanderfolgende Farbkarten umfassen. Sonderkarten unterbrechen den Abschnitt und können nicht Teil der Neuordnung sein.",
        ],
      },
      beispiele(
        'Ein Spieler hat folgende Karten in seiner Schlange: Blau - Rot - Gelb - Rot - Gelb. Er spielt Schlangenhäutung und ordnet die Karten neu an, um eine gelbe und eine rote Gruppe zu bilden.',
        reihe('Blau', 'Rot', 'Gelb', 'Rot', 'Gelb'),
        'Ergebnis nach Anwendung der Schlangenhäutung',
        reihe('Gelb', 'Gelb', 'Blau', 'Rot', 'Rot'),
        'Ein Spieler hat eine Schlangenblockade in seiner Reihe. Diese unterbricht die möglichen Bereiche für die Schlangenhäutung. Da auch keine mindestens drei Farbkarten in einer Reihe liegen, kann die Schlangenhäutung nicht eingesetzt werden.',
        reihe('Blau', 'Violett', 'Schlangenblockade', 'Grün', 'Violett'),
      ),
      regeln(
        'Es dürfen nur Farbkarten neu angeordnet werden',
        'Der gewählte Abschnitt muss 3–5 aufeinanderfolgende Farbkarten umfassen',
        'Sonderkarten unterbrechen den Abschnitt',
        'Die Gesamtstruktur der Schlange bleibt erhalten',
        'Die Neuordnung erfolgt einmalig',
        'Die Karten dürfen nicht mehrfach verschoben werden',
        'Nur zusammenhängende Farbkarten dürfen gewählt werden',
        'Neue Farbgruppen zählen für Aufgaben und Punktewertung (Aufgaben sind Erweiterungsinhalt)',
        'Die Position von Sonderkarten bleibt unverändert',
      ),
      { inhalt: [NUR_ERWEITERUNG] },
    ],
  ),
  sonderkarte(
    'Schlangenkorb des Glücks',
    'A7.10',
    'Einmalig nutzbare Spezialkarte mit verschiedenen Bonuseffekten',
    [
      {
        inhalt: [
          'Diese einzigartige Karte wird zu Beginn des Spiels unter die anderen Karten gemischt. Der Spieler, der sie zieht, kann sie einmal während des Spiels einsetzen, um einen der folgenden Boni zu erhalten.',
        ],
      },
      beispiele(
        'Ziehe 3 zusätzliche Karten und spiele sofort bis zu 2 davon aus',
        'Tausche bis zu 2 Karten aus deiner Schlange mit Karten aus deiner Hand',
        'Entferne eine Schlangenblockade aus deiner Schlange ODER entferne eine Sonderkarte aus einer gegnerischen Schlange',
        'Führe zwei zusätzliche Aktionen in diesem Zug aus',
      ),
      regeln(
        'Wähle einen der verfügbaren Bonuseffekte',
        'Führe den gewählten Effekt sofort aus',
        'Die Karte wird nach der Nutzung aus dem Spiel entfernt',
      ),
      { inhalt: [NUR_ERWEITERUNG] },
    ],
  ),
]
