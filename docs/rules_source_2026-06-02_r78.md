# Rules Source 2026-06-02 R78 — Sonderkarten-Timing und Farbenschutz

Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: Extrakt der verbindlichen Regeln von schlangentanz.ch/rules für R78 Farbenschutz-Abwehr.

## Quelle

- URL: `https://schlangentanz.ch/rules`
- Abruf: 02.06.2026 per Playwright, Seite ohne Console-/Page-Errors geladen.
- Relevanter Abschnitt: `Spielablauf und Timing von Sonderkarten` sowie `Sonderkarten und ihre Effekte`.

## Extrahierte verbindliche Regeln

- Sonderkarten müssen immer mit klarer Ansage gespielt werden; der Spieler benennt das Ziel seiner Aktion.
- Der betroffene Spieler hat danach die Möglichkeit, mit einem Farbenschutz zu reagieren.
- Gespielte Sonderkarten kommen auf den Ablagestapel des Spielers, der sie gespielt hat.
- Beispiel `Schlangenblockade` laut Quelle:
  - Spieler A sagt die Schlangenblockade auf eine konkrete Schlange von Spieler B an.
  - Spieler B darf Farbenschutz spielen.
  - Wenn Spieler B Farbenschutz spielt, ist die Schlangenblockade wirkungslos.
  - Beide Karten kommen auf die jeweiligen Ablagestapel.
  - Spieler A darf die Schlangenblockade nicht auf einen anderen Spieler umlegen.
- Beispiel `Schlangenfrass` laut Quelle:
  - Bei mehreren Zielen wird die Abwehr im Uhrzeigersinn abgehandelt.
  - Ein Farbenschutz schützt nur die eigene Schlange bzw. den eigenen betroffenen Anteil.
  - Nicht geschützte Zielkarten anderer Spieler werden trotzdem entfernt.
- Timing laut Quelle:
  - Zuerst muss die Aktion vollständig angesagt werden.
  - Danach reagieren betroffene Spieler im Uhrzeigersinn.
  - Nach Abhandlung aller Effekte werden neue Karten im Uhrzeigersinn nachgezogen.
- Sonderkartenübersicht laut Quelle:
  - `Farbendieb`: nimmt einem anderen Spieler eine Karte aus dessen Schlange und fügt sie sofort in die eigene Schlange ein.
  - `Farbenschutz`: schützt vor negativen Effekten einer Sonderkarte.
  - `Schlangenfrass`: entfernt eine oder zwei Karten aus beliebigen Schlangen.
  - `Schlangenblockade`: fügt der Schlange eine neutrale, nicht farbige Karte hinzu.
  - `Schlangengrube`: lässt einen Mitspieler nach Wahl einen kompletten Zug aussetzen.

## R78-Implementierungsschnitt

- R78 implementiert die Farbenschutz-Abwehr für die bereits vorhandene digitale Angriffskarte `Schlangengrube`.
- Bei `Schlangengrube` mit `abwehrHandkartenId` gilt:
  - Nur der Zielspieler darf mit einer eigenen `Farbenschutz`-Handkarte abwehren.
  - Schlangengrube und Farbenschutz werden abgelegt.
  - Der Zielspieler wird nicht zum Aussetzen markiert.
  - Der Angriff darf nicht umgelegt werden.
- Farbendieb, Schlangenblockade und Schlangenfrass bleiben als noch nicht implementierte Angriffskarten für Folgeslices offen; die obigen Quellenregeln sind die Spezifikationsbasis dafür.
