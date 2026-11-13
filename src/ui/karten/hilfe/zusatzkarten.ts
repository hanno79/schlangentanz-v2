import { hilfeId, type Kartenhilfe } from './typen'

/* Comeback- und Risiko-Belohnungs-Karte aus A8 (Erweiterung). */

const COMEBACK: Kartenhilfe = {
  karte: { typ: 'Comeback', id: hilfeId('comeback') },
  quellen: ['A8.1'],
  kurz: 'Ermöglicht zwei zusätzliche Aktionen, wenn man im Rückstand ist',
  abschnitte: [
    {
      inhalt: [
        'Liegt deine längste Schlange zu Beginn deines Zuges mindestens 5 Karten hinter der längsten Schlange auf dem Tisch, kannst du deine Comeback-Karte einsetzen und erhältst zwei zusätzliche Aktionen. Danach ist sie verbraucht.',
      ],
    },
    {
      titel: 'Auslösebedingung',
      inhalt: [
        [
          'Die Comeback-Karte kann nur gespielt werden, wenn die Bedingungen zu Beginn des eigenen Zuges erfüllt sind.',
          'Die Bedingung ist erfüllt, wenn die längste Schlange des Spielers mindestens 5 Karten kürzer ist als die längste Schlange auf dem Tisch.',
        ],
      ],
    },
    {
      titel: 'Zeitpunkt der Aktivierung',
      inhalt: [
        [
          'Nur während des eigenen Zuges spielbar.',
          'Pro Spieler und Zug darf nur eine Comeback-Karte gespielt werden.',
          'Mehrere Spieler dürfen nacheinander in ihren jeweiligen Zügen Comeback-Karten spielen, wenn die Bedingungen jeweils erfüllt sind.',
        ],
      ],
    },
    {
      titel: 'Bonuseffekt',
      inhalt: [
        'Bei Aktivierung erhält der Spieler zwei zusätzliche Aktionen in seinem Zug. Diese zusätzlichen Aktionen können sein:',
        [
          'Eine Farbkarte aus der Hand ausspielen',
          'Eine Sonderkarte aus der Hand ausspielen',
          'Zwei Karten abwerfen und drei neue vom Nachziehstapel ziehen',
        ],
        'Der Spieler kann diese zwei Aktionen in beliebiger Reihenfolge mit seinen normalen Zugaktionen ausführen und darf auch zweimal die gleiche Aktion wählen.',
      ],
    },
    {
      titel: 'Wichtig',
      inhalt: [
        'Die Nutzung einer Comeback-Karte zählt nicht als reguläre Aktion in deinem Zug. Du darfst also zusätzlich zu dieser Sonderaktion deine normalen Zugaktionen durchführen.',
      ],
    },
    {
      titel: 'Nach der Nutzung',
      inhalt: [
        'Die Comeback-Karte wird umgedreht, um anzuzeigen, dass sie verwendet wurde. Sie kann nicht erneut aktiviert werden, auch wenn die Bedingung später wieder erfüllt sein sollte.',
      ],
    },
  ],
}

const RISIKO_BELOHNUNG: Kartenhilfe = {
  karte: { typ: 'Risiko-Belohnung', id: hilfeId('risiko-belohnung') },
  quellen: ['A8.2'],
  kurz: 'Ermöglicht eine zusätzliche Aktion mit besonderen Effekten',
  abschnitte: [
    {
      inhalt: [
        'Die Risiko-Belohnungs-Karten bieten dir die Möglichkeit, eine zusätzliche Sonderaktion in deinem Zug durchzuführen. Dabei gehst du jedoch ein kalkuliertes Risiko ein: Bei jeder Nutzung wird geprüft, ob du die Belohnung erhältst oder ein Gegenspieler davon profitiert.',
        'Jeder Spieler erhält zu Beginn des Spiels 2 Risiko-Belohnungs-Karten. Nach dem Ausspielen wird eine Risiko-Belohnungs-Karte aus dem Spiel entfernt. Pro Runde darfst du maximal eine Risiko-Belohnungs-Karte verwenden.',
      ],
    },
    {
      titel: 'Allgemeine Regel zur Risikoprüfung',
      inhalt: [
        'Sobald du eine Risiko-Belohnungs-Karte ausspielst, deckst du die oberste Karte vom Nachziehstapel auf:',
        'Farbkarte: Die Aktion ist erfolgreich – du erhältst die volle Belohnung.',
        'Sonderkarte: Die Aktion scheitert – stattdessen profitiert ein Gegenspieler.',
        'Wenn die Aktion fehlschlägt, darfst du entscheiden, welchem deiner Gegenspieler die angegebene Ersatzbelohnung zugutekommt. Dies fördert gezielt das Aufholen im Spiel, weil du dem Spieler helfen kannst, der zurückliegt.',
      ],
    },
    {
      titel: 'Aktion 1: Zusätzliche Karten ziehen',
      inhalt: [
        'Wenn du diese Aktion wählst, ziehst du im Erfolgsfall drei Karten vom Nachziehstapel auf deine Hand.',
        'Erfolg: Lege die gezogene Farbkarte auf deine Hand und ziehe anschliessend 2 weitere Karten.',
        'Misserfolg: Die aufgedeckte Sonderkarte musst du einem Gegenspieler deiner Wahl geben. Der gewählte Spieler darf die Sonderkarte direkt auf die Hand nehmen.',
        'Wichtig: Wenn du oder der Gegenspieler durch diese Aktion mehr als 5 Handkarten habt, reduziert jeder am Ende seines eigenen Zuges wieder auf maximal 5 Karten.',
      ],
    },
    {
      titel: 'Aktion 2: Zusätzliche Farbkarte spielen',
      inhalt: [
        'Du darfst versuchen, eine zusätzliche Farbkarte an ein beliebiges Ende deiner Schlange anzulegen.',
        'Erfolg: Du spielst sofort eine zusätzliche Farbkarte an deiner eigenen Schlange an. Du kannst dafür die gezogene Karte verwenden oder eine Karte aus deiner Hand nutzen. In jedem Fall behältst du die gezogene Farbkarte.',
        'Misserfolg: Deine geplante Farbkarte wandert auf die Hand eines beliebigen Gegenspielers deiner Wahl. Alternativ darf dieser Spieler die oberste Karte vom Nachziehstapel ziehen und sie auf die Hand nehmen.',
      ],
    },
    {
      titel: 'Aktion 3: Karten tauschen',
      inhalt: [
        'Du möchtest eine Farbkarte in deiner Schlange durch eine Karte von deiner Hand ersetzen.',
        [
          'Benenne vor dem Risiko-Check, welche Karte in deiner Schlange du tauschen möchtest',
          'Decke eine Karte vom Nachziehstapel auf',
        ],
        'Erfolg: Die gezogene Karte ist eine Farbkarte mit dem gleichen Punktewert (1, 2 oder 3 Punkte) wie deine gewählte Schlange-Karte. Du darfst den Tausch ausführen.',
        'Misserfolg:',
        [
          'Farbkarte mit anderem Punktewert: Lege sie zusätzlich an die Position der gewählten Karte. Du hast nun zwei Farbkarten hintereinander an dieser Stelle.',
          'Sonderkarte: Die Aktion scheitert vollständig. Die Sonderkarte kommt auf deinen Ablagestapel. Die Schlange bleibt unverändert.',
        ],
      ],
    },
    {
      titel: 'Aktion 4: Karten aus dem Ablagestapel oder Nachziehstapel nehmen',
      inhalt: [
        'Diese Aktion ermöglicht dir mehr Flexibilität:',
        'Erfolg: Du wählst:',
        ['Zwei Karten vom Nachziehstapel ziehen', 'ODER eine beliebige Karte von deinem eigenen Ablagestapel auf die Hand nehmen'],
        'Misserfolg: Der Gegenspieler deiner Wahl darf:',
        ['Eine beliebige Karte aus seinem Ablagestapel auf die Hand nehmen', 'ODER die oberste Karte vom Nachziehstapel ziehen'],
        'Wichtig: Risiko-Belohnungs-Karte sowie Schlangenkorb des Glücks können nicht vom Ablagestapel genommen werden.',
      ],
    },
    {
      titel: 'Wichtige Regeln für alle Risiko-Belohnungs-Karten',
      inhalt: [
        [
          'Die Nutzung einer Risiko-Belohnungs-Karte zählt nicht als reguläre Aktion in deinem Zug.',
          'Du darfst weiterhin deine normalen Aktionen im selben Zug ausführen.',
          'Pro Runde darfst du nur eine Risiko-Belohnungs-Karte spielen.',
          'Nach der Nutzung kommt die Karte aus dem Spiel.',
          'Handkarten-Limit: Wenn du oder ein Gegenspieler durch eine Aktion mehr als 5 Handkarten erhaltet, wird am Ende des jeweils eigenen Zuges wieder auf maximal 5 Karten reduziert.',
          'Freie Wahl bei Misserfolg: Bei gescheiterten Aktionen darfst du immer frei wählen, welcher Gegenspieler von der Ersatzbelohnung profitiert.',
        ],
      ],
    },
  ],
}

export const ZUSATZKARTEN_HILFE: readonly Kartenhilfe[] = [COMEBACK, RISIKO_BELOHNUNG]
