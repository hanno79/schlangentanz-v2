# Schlangentanz Game Spec

Status: **Abgeglichen mit der Website am 12.11.2026.**

Teil A gibt die Spielanleitung von `https://schlangentanz.ch/rules` wörtlich wieder
(Stand der Website: 12.11.2026 abends, Bundle `index-ZK016NK3.js`).

## Rangfolge der Quellen

1. **Die Website `https://schlangentanz.ch/rules` ist die einzige verbindliche
   Regelquelle.** Der Autor des Spiels pflegt sie.
2. **Dieses Dokument spiegelt die Website.** Weicht es von ihr ab, gilt die
   Website, und dieses Dokument wird nachgezogen. Nie umgekehrt.
3. **Alles andere ist keine Regelquelle:** Dart-Tasks und Dart-Dokumente,
   `docs/release_status_*`, `docs/slice_plan_*`, `docs/PLAYABILITY_GATE.md`,
   `docs/rules_source_2026-06-02_r78.md` und Kommentare im Code. Steht dort eine
   andere Regel, ist sie überholt.

### Verfahren bei Änderungen

- **Regeln ändern sich nur auf der Website.** Danach wird Teil A aus ihrem
  Wortlaut neu übernommen, nicht von Hand umformuliert:
  `npm run abgleich:website` prüft, ob Teil A mit der Website übereinstimmt;
  mit `-- --schreiben` übernimmt es den neuen Wortlaut.
- **Teil A enthält keine Auslegung.** Digitale Festlegungen stehen in Teil B,
  offene Fragen in Teil D.
- **Was die Website nicht hergibt, wird nicht geraten.** Es kommt als Frage in
  Teil D, bevor jemand Code anfasst.
- **Ein Widerspruch zwischen Website und Code ist ein Fehler im Code.** Er kommt
  in Teil C, bis er behoben ist.
- Jede Änderung dieses Dokuments steht mit Datum und Anlass in Teil E.

### Aufbau

| Teil | Inhalt |
|---|---|
| A | Regeln: wörtlicher Spiegel der Website |
| B | Digitale Fassung: Umfang und Festlegungen, die die Website offenlässt |
| C | Abweichungen der heutigen Engine von Teil A (Arbeitsliste) |
| D | Offene Auslegungsfragen an den Autor |
| E | Frühere R-Nummern, Stand und Verlauf |

Schreibweise in Teil A: `[Erweiterung]` steht für das Erweiterungs-Etikett der
Website. Kartenbilder in Beispielen sind als `[Blau] [Rot] …` wiedergegeben.
Gliederung und Abschnittsnummern (A1 bis A11) kommen von diesem Dokument, der
Wortlaut von der Website.

## Teil A — Regeln (Spiegel der Website)

### A1 Spielmaterial

**Wichtig:** Diese Anleitung beschreibt sowohl das Basis-Spiel als auch die Erweiterung "Schlangenkorb des Glücks". Erweiterungsinhalte sind entsprechend gekennzeichnet und können optional hinzugefügt werden.

| Kategorie | Anzahl | Beschreibung |
|---|---|---|
| Farbkarten | 15 | Blau (1 Punkt) |
| Farbkarten | 15 | Rot (1 Punkt) |
| Farbkarten | 15 | Gelb (1 Punkt) |
| Farbkarten | 12 | Violett (2 Punkte) |
| Farbkarten | 12 | Braun (2 Punkte) |
| Farbkarten | 9 | Grün (3 Punkte) |
| Sonderkarten | 4 | Farbenschutz |
| Sonderkarten | 4 | Regenbogenschlange |
| Sonderkarten | 4 | Schlangenfrass |
| Sonderkarten | 3 | Schlangenblockade |
| Sonderkarten | 4 | Farbendieb |
| Sonderkarten | 3 | Schlangengrube |
| Sonderkarten | 4 | Farbenfusion |
| Sonderkarten | 4 | Verdoppler |
| Sonderkarten | 3 | Schlangenhäutung [Erweiterung] |
| Sonderkarten | 1 | Schlangenkorb des Glücks [Erweiterung] |
| Aufgabenkarten [Erweiterung] | 15 | Aufgabenkarten (verschiedene Ziele) |
| Zusätzliches Spielmaterial [Erweiterung] | 4 | Comeback-Karten (1 pro Spieler) |
| Zusätzliches Spielmaterial [Erweiterung] | 8 | Risiko-Belohnungs-Karten (2 pro Spieler) |
| Weitere Karten je Box | 1 | Titelkarte der jeweiligen Edition |
| Weitere Karten je Box | 1 | QR-Regelkarte (Link zur Spielanleitung) |

Basis-Spiel: 110 Karten: 108 Spielkarten (78 Farbkarten + 30 Sonderkarten), Titelkarte und QR-Regelkarte

Erweiterung "Schlangenkorb des Glücks": 33 Karten: 31 Spielkarten, Titelkarte und QR-Regelkarte

Deluxe-Edition (Basis und Erweiterung): 141 Karten: alle 139 Spielkarten, Titelkarte und QR-Regelkarte

### A2 Spieler

2–4 Spieler, ab 6 Jahren, ca. 30–60 Minuten Spielzeit

### A3 Spielziel

Bilde Farbgruppen in deinen Schlangen, erfülle Aufgaben und sammle die meisten Punkte, um das Spiel zu gewinnen.

### A4 Spielvorbereitung

#### [Erweiterung] Nur bei Verwendung der Erweiterung:

1. Gib jedem Spieler 1 Comeback-Karte und 2 Risiko-Belohnungs-Karten. Diese werden offen vor dem Spieler ausgelegt.
2. Mische die Schlangenhäutung-Karten (3 Stück) und den Schlangenkorb des Glücks (1 Stück) mit den Sonderkarten zusammen.

#### Immer (Basis-Spiel und Erweiterung):

1. Mische alle Farb- und Sonderkarten gut (die Aufgabenkarten nicht, falls die Erweiterung gespielt wird).
2. Teile jedem Spieler 5 Karten aus.
3. Lege die restlichen Karten als verdeckten Nachziehstapel in die Tischmitte.
4. Jeder Spieler erhält einen eigenen Ablagestapel für gespielte Sonderkarten und abgelegte Karten.

#### [Erweiterung] Zusätzlich bei Verwendung der Aufgabenkarten:

1. Mische die Aufgabenkarten separat (nicht mit anderen Karten mischen!).
2. Lege 3 Aufgabenkarten offen neben den Spielbereich, die übrigen als verdeckten Stapel daneben.
3. Gib jedem Spieler eine geheime Aufgabenkarte, die verdeckt vor ihm liegt.

### A5 Spielablauf

#### Basis-Spiel:

1. Der jüngste Spieler beginnt. Danach wird im Uhrzeigersinn gespielt. In deinem Zug führst du folgende Aktionen aus:

   - Kartenhand prüfen: Hast du ausserhalb deines Zuges Karten gespielt, zum Beispiel einen Farbenschutz zur Abwehr, ziehst du jetzt vom Nachziehstapel, bis du wieder 5 Handkarten hast.
   - Karten ausspielen: Du musst mindestens 1 Karte und darfst maximal 2 Karten ausspielen:

     - Eine Farbkarte, um eine Schlange zu beginnen oder fortzusetzen (muss an einem beliebigen Ende der Schlange angelegt werden)
     - Optional eine Sonderkarte, um deren Effekt auszulösen (kann an beliebiger Stelle eingefügt werden)
     - Du darfst die Farbkarte und die Sonderkarte in beliebiger Reihenfolge spielen
     - Ist deine Sonderkarte der Verdoppler, füllst du nach diesem Zug deine Handkarten auf und spielst sofort einen zweiten Zug. Neben dem Verdoppler spielst du so bis zu 3 Karten
   - Zug beenden: Ziehe Karten vom Nachziehstapel, bis du wieder 5 Handkarten hast. Danach ist der nächste Spieler an der Reihe.
2. Hast du am Ende deines Zuges mehr als 5 Karten auf der Hand, lege die überzähligen Karten auf deinen Ablagestapel.

#### [Erweiterung] Zusätzlich bei Verwendung der Aufgabenkarten:

In deinem Zug kommt folgende Möglichkeit hinzu:

- Aufgabe erfüllen: Wenn du die Bedingungen einer offenen Aufgabenkarte erfüllst, rufe "Schlangenspass!" und nimm die Aufgabe zu dir. Lege dann eine neue Aufgabenkarte vom Stapel auf. Deine geheime Aufgabe deckst du erst bei der Wertung auf.

Wichtig: Du musst immer mindestens eine Karte spielen. Wenn du nur Sonderkarten auf der Hand hast, musst du eine davon spielen, auch wenn sie keinen optimalen Effekt in deiner eigenen Schlange hat. In diesem Fall kannst du sie auch bei einem Gegner ausspielen. Hast du nur Farbenschutz-Karten auf der Hand, legst du eine davon ohne Wirkung auf deinen Ablagestapel. Danach ziehst du eine Karte nach, und dein Zug ist beendet. Die neue Karte darfst du erst im nächsten Zug ausspielen.

Schlangen:

- Ein Spieler darf maximal 2 Schlangen haben.
- Eine neue Schlange kann begonnen werden, indem eine Farbkarte separat von bestehenden Schlangen gelegt wird.
- Es gibt keine Begrenzung für die Länge einer Schlange.

### A6 Sonderkarten-Timing und Beispiele

#### Grundregeln für Sonderkarten:

- Sonderkarten werden immer mit klarer Ansage gespielt: Der Spieler benennt das Ziel seiner Aktion.
- Der betroffene Spieler kann sofort mit einem Farbenschutz reagieren. Eine andere Karte ist als Reaktion nicht erlaubt.
- Gespielte Sonderkarten kommen auf den Ablagestapel des Spielers, der sie gespielt hat.
- Wer ausserhalb seines Zuges eine Karte spielt, zieht nicht gleich nach, sondern füllt erst zu Beginn seines nächsten Zuges auf 5 Karten auf. Wer in einer Runde zweimal angegriffen wird, kann deshalb nicht mit einem eben nachgezogenen Farbenschutz ein zweites Mal abwehren.
- Schlangenfrass ist keine Reaktion: Mit ihm entfernst du in deinem eigenen Zug Karten, die bereits in einer Schlange liegen.

#### Beispiel 1: Schlangenblockade und Farbenschutz:

1. Spieler A sagt an: "Ich spiele eine Schlangenblockade auf die erste Schlange von Spieler B."
2. Spieler B kann nun einen Farbenschutz spielen.
3. Spielt Spieler B einen Farbenschutz:

   - Die Schlangenblockade ist wirkungslos.
   - Beide Karten kommen auf den Ablagestapel ihres Spielers.
   - Spieler A darf die Schlangenblockade nicht gegen einen anderen Spieler richten.
4. Spieler A füllt seine Hand am Ende seines Zuges auf, Spieler B zu Beginn seines nächsten Zuges.

[Schlangenblockade] [Farbenschutz]

#### Beispiel 2: Schlangenfrass mit mehreren Zielen:

1. Spieler A sagt an: "Ich spiele Schlangenfrass und fresse je eine Karte von Spieler B und Spieler C."
2. Die Abwehr wird im Uhrzeigersinn abgehandelt:

   - Zuerst entscheidet Spieler B, ob er einen Farbenschutz spielt.
   - Dann entscheidet Spieler C, ob er einen Farbenschutz spielt.
3. Ein Farbenschutz schützt nur die eigene Schlange:

   - Spielt nur Spieler B einen Farbenschutz, bleibt seine Karte liegen. Die Karte von Spieler C wird trotzdem entfernt.
   - Spielen beide einen Farbenschutz, wird keine Karte gefressen.
4. Karten kommen auf die Ablagestapel:

   - Schlangenfrass kommt auf den Ablagestapel von Spieler A.
   - Gespielte Farbenschutzkarten kommen auf den Ablagestapel ihres Spielers.
   - Gefressene Karten kommen auf den Ablagestapel von Spieler A.
5. Spieler A füllt am Ende seines Zuges auf. Spieler B und C füllen erst zu Beginn ihres nächsten Zuges auf.

Situation:

[Schlangenfrass] [Farbenschutz]

#### Timing-Regeln:

- Zuerst wird die Aktion vollständig angesagt.
- Dann können die betroffenen Spieler im Uhrzeigersinn mit einem Farbenschutz reagieren.
- Erst danach tritt der Effekt der Sonderkarte ein.
- Der Spieler am Zug füllt seine Hand am Ende seines Zuges auf 5 Karten auf.
- Wer ausserhalb seines Zuges Karten gespielt hat, füllt zu Beginn seines nächsten Zuges auf 5 Karten auf.

### A7 Sonderkarten

#### A7.1 Farbendieb

Kurzbeschreibung: Erlaubt es, einem anderen Spieler eine Karte aus dessen Schlange wegzunehmen und sofort in die eigene Schlange einzufügen.

Eine taktische Karte, die es ermöglicht, eine Karte aus der Schlange eines Mitspielers zu stehlen und für die eigene Strategie zu nutzen. Der Farbendieb ist besonders nützlich, wenn man eine bestimmte Farbe für eine Dreiergruppe benötigt oder die Strategie eines Gegners durchkreuzen möchte.

**Beispiele:**

Spieler A spielt Farbendieb. Er stiehlt eine blaue Karte aus der Schlange von Spieler B und fügt sie an seine eigene Schlange an.

[Farbendieb] [Blau]

**Wichtige Regeln:**

- Wähle eine Karte aus einer gegnerischen Schlange
- Lege die Karte an eine beliebige Position in deiner Schlange
- Der Farbendieb kommt auf deinen Ablagestapel
- Kann durch Farbenschutz abgewehrt werden

#### A7.2 Farbenschutz

Kurzbeschreibung: Schützt vor negativen Effekten einer Sonderkarte

Eine defensive Karte, die vor den negativen Auswirkungen von Sonderkarten schützt und als Reaktion auf diese gespielt werden kann. Der Farbenschutz ist besonders wertvoll, wenn man wichtige Karten in seiner Schlange vor Angriffen schützen möchte.

**Beispiele:**

Spieler B spielt eine Schlangenblockade gegen Spieler A. Spieler A kann, wenn er möchte, einen Farbenschutz spielen, um die Schlangenblockade abzuwehren. Die Schlangenblockade wird auf den Ablagestapel von Spieler B gelegt, und Spieler A bleibt unberührt.

[Farbenschutz] [Schlangenblockade]

**Wichtige Regeln:**

- Spiele als Reaktion auf eine Sonderkarte
- Lege den Farbenschutz auf deinen Ablagestapel
- Die abgewehrte Sonderkarte kommt auf den Ablagestapel des Angreifers
- Schützt vor allen negativen Effekten von Sonderkarten

#### A7.3 Regenbogenschlange

Kurzbeschreibung: Eine flexible Joker-Karte, die als Karte einer beliebigen Farbe eingesetzt werden kann

Die Regenbogenschlange ist eine äusserst vielseitige Joker-Karte, die als Karte jeder beliebigen Farbe eingesetzt werden kann. Sie bietet maximale Flexibilität bei der Bildung von Farbgruppen und kann in verschiedenen Situationen strategisch eingesetzt werden.

**Beispiele:**

Eine Schlange hat folgende Karten: Blau - Blau - Regenbogenschlange. Die Regenbogenschlange wird als blaue Karte gewertet, um eine Dreiergruppe zu bilden. Diese Gruppe bringt 2 Punkte (1 Punkt pro blaue Karte, die Regenbogenschlange bringt keinen Punkt).

[Blau] [Blau] [Regenbogenschlange]

Ein Spieler hat die Aufgabe 'Farbvielfalt' (eine Karte jeder Farbe) und hat bereits Blau, Rot, Gelb, Braun und Grün in seiner Schlange. Er legt eine Regenbogenschlange an und nutzt sie als violette Karte, um die Aufgabe zu erfüllen. [Erweiterung]

[Blau] [Rot] [Gelb] [Braun] [Grün] [Regenbogenschlange]

Eine Schlange hat: Rot - Rot - Regenbogenschlange - Braun - Braun. Diese Gruppe bringt 4 Punkte (2 × 2 Punkte für die braunen Karten, 0 Punkte für die Regenbogenschlange).

[Rot] [Rot] [Regenbogenschlange] [Braun] [Braun]

**Wichtige Regeln:**

- Gilt als Karte der Farbe, die für den Spieler am vorteilhaftesten ist
- Die Farbe ist nie festgelegt und kann sich während des Spiels ändern [Erweiterung]
- Verbindet Farbgruppen, indem sie als Karte der gewünschten Farbe zählt
- Die Regenbogenschlange bringt selbst keine Punkte
- Muss Teil einer Dreiergruppe (oder länger) sein, um die Gruppe zu vervollständigen
- Die anderen Karten der Gruppe bringen ihre normalen Punkte
- Zählt auch für den Vielfaltbonus als ihre Farbe [Erweiterung]
- Bei der Wertung am Spielende zählt sie als die Farbe, die dem Spieler die meisten Punkte bringt
- Kann als beliebige der sechs Farben gewertet werden, auch als grün
- Bei jeder Aufgabe zählt sie als die Farbe, mit der die Aufgabe erfüllt ist. Eine erfüllte Aufgabe bleibt erfüllt, auch wenn die Karte später anders zählt [Erweiterung]
- Unterbricht keine Farbreihen, wenn sie als passende Farbe genutzt wird

#### A7.4 Schlangenfrass

Kurzbeschreibung: Entfernt eine oder zwei Karten aus beliebigen Schlangen

Der Spieler hat die Wahl zwischen drei Optionen: a) Entferne eine beliebige Karte aus deiner eigenen Schlange. b) Entferne eine Schlangenblockade aus deiner eigenen Schlange. c) Entferne zwei beliebige Karten aus den Schlangen der Mitspieler. Diese können Farbkarten, Regenbogenschlangen, Farbfusionen oder andere Sonderkarten sein, ausser Schlangenblockaden. Die Karten können aus einer oder zwei verschiedenen Schlangen stammen und von beliebigen Positionen entfernt werden.

**Beispiele:**

Option a): Ein Spieler entfernt eine rote Karte aus seiner eigenen Schlange, um Platz für eine besser passende Karte zu schaffen.

[Schlangenfrass] [Rot]

Option b): Ein Spieler hat eine Schlangenblockade in seiner Schlange. Er spielt Schlangenfrass und wählt Option b), um die Schlangenblockade zu entfernen. Die Schlangenblockade kommt auf den Ablagestapel des Spielers, der Schlangenfrass gespielt hat.

[Schlangenfrass] [Schlangenblockade]

Option c): Ein Spieler entfernt eine Regenbogenschlange und eine gelbe Farbkarte aus der Schlange eines Mitspielers. Es bleiben nur noch zwei gelbe Farbkarten die keine Punkte mehr zählen.

[Schlangenfrass] [Regenbogenschlange] [Gelb] [Gelb] [Gelb]

**Wichtige Regeln:**

- Die entfernten Karten kommen auf den Ablagestapel
- Bei Option c) müssen zwei Karten entfernt werden, sofern möglich
- Schlangenblockaden in gegnerischen Schlangen können nicht mit Option c) entfernt werden
- Beim Entfernen einer Farbfusionskarte wird nur die Farbfusionskarte selbst entfernt
- Die darunter liegenden fusionierten Karten werden wieder getrennt und bleiben an ihrer Position

#### A7.5 Schlangenblockade

Kurzbeschreibung: Fügt der Schlange eine neutrale, nicht farbige Karte hinzu

Fügt der Schlange eine neutrale, nicht farbige Karte hinzu. Die Schlangenblockade ist ein mächtiges taktisches Werkzeug, das den Spielfluss des Gegners erheblich einschränken kann. Sie kann durch Farbenschutz verhindert oder durch Schlangenfrass entfernt werden.

**Beispiele:**

Spieler B hat drei rote Karten in einer Reihe. Spieler A legt eine Schlangenblockade zwischen die erste und die zweite rote Karte: Rot – Schlangenblockade – Rot – Rot. Die Dreierreihe ist damit unterbrochen und zählt in der Wertung keine Punkte mehr, bis Spieler B die Schlangenblockade mit Schlangenfrass entfernt.

[Rot] [Schlangenblockade] [Rot] [Rot]

**Wichtige Regeln:**

- Wähle eine Schlange aus
- Lege die Blockade an eine beliebige Stelle der Schlange
- Die Blockade bleibt bis zu ihrer Entfernung bestehen
- Kann durch Farbenschutz abgewehrt werden
- Kann nur durch Schlangenfrass oder spezielle Karteneffekte entfernt werden

#### A7.6 Schlangengrube

Kurzbeschreibung: Lässt einen Mitspieler deiner Wahl einen kompletten Zug aussetzen

Der Spieler, der die Schlangengrube spielt, wählt einen Mitspieler aus. Der gewählte Spieler muss seinen nächsten Zug komplett aussetzen. Während des Aussetzens darf der Spieler keine Aktionen durchführen - weder Karten ziehen noch Karten ausspielen.

**Beispiele:**

Spieler A spielt eine Schlangengrube gegen Spieler B. Spieler B hat keinen Farbenschutz und muss seinen nächsten Zug komplett aussetzen. Nach dem ausgesetzten Zug wird die Schlangengrube auf den Ablagestapel gelegt.

Spieler A spielt eine Schlangengrube gegen Spieler B. Spieler B hat einen Farbenschutz und spielt diesen als Reaktion. Die Schlangengrube wird wirkungslos auf den Ablagestapel gelegt, und Spieler B kann seinen Zug normal ausführen.

[Schlangengrube] [Farbenschutz]

**Wichtige Regeln:**

- Der Spieler, der die Schlangengrube spielt, wählt einen Mitspieler aus
- Der gewählte Spieler muss seinen nächsten Zug komplett aussetzen
- Während des Aussetzens darf der Spieler keine Aktionen durchführen
- Die Schlangengrube wird nach dem ausgesetzten Zug auf den Ablagestapel gelegt
- Die Schlangengrube kann durch einen Farbenschutz abgewehrt werden
- Wird ein Farbenschutz gespielt, wird die Schlangengrube ohne Wirkung abgelegt
- Der ausgewählte Spieler darf dann seinen Zug normal durchführen

#### A7.7 Farbenfusion

Kurzbeschreibung: Zwei nebeneinanderliegende Karten der gleichen Farbe werden unter die Farbenfusionskarte gelegt

Zwei nebeneinanderliegende Karten der gleichen Farbe werden unter die Farbenfusionskarte gelegt. Im Spiel liegen die Farbkarten übereinander und die Fusionskarte obenauf. Die Farbenfusion zählt als eine einzelne Karte einer beliebiger Farbe und muss Teil einer Dreiergruppe sein, um Punkte zu bringen.

**Beispiele:**

Ein Spieler hat folgende Karten in seiner Schlange: Blau - Blau - Gelb-Gelb. Er spielt Farbenfusion und legt sie auf die beiden gelben Karten. Diese beiden Karten gelten nun als eine Karte beliebiger Farbe (die am vorteilhaftesten ist).

[Blau] [Blau] [Gelb + Farbenfusion + Gelb]

Ein Spieler hat folgende Karten in seiner Schlange: Blau - Blau - Farbenfusion(fusionierte Gelb - Gelb) - Rot - Rot.

[Blau] [Blau] [Gelb + Farbenfusion + Gelb] [Rot] [Rot]

**Wichtige Regeln:**

- Pro Zug darf nur eine Farbenfusion durchgeführt werden
- Die Farbenfusion liegt oben auf den fusionierten Karten und markiert diese als eine Einheit
- Wird eine Farbenfusion entfernt, werden die darunter liegenden Karten wieder zu einzelnen Karten
- Die Farbenfusion zählt als eine einzelne Karte einer beliebigen Farbe
- Muss Teil einer Dreiergruppe sein, um Punkte zu bringen
- Bringt die Punkte beider fusionierter Karten
- Zählt nur als eine Farbe für den Vielfaltbonus [Erweiterung]
- Für den Vielfaltbonus zählt die Farbe, die die Fusion bei der Wertung hat [Erweiterung]
- Die Farbe der Fusion ist nie festgelegt. Bei jeder Aufgabe zählt sie als die Farbe, mit der die Aufgabe erfüllt ist, bei der Wertung als die Farbe, die dem Spieler die meisten Punkte bringt [Erweiterung]
- Die ursprünglichen Farben der fusionierten Karten spielen für Aufgaben keine Rolle mehr [Erweiterung]

#### A7.8 Verdoppler

Kurzbeschreibung: Erlaubt dir, nach deinem Zug die Hand aufzufüllen und sofort einen zweiten Zug zu spielen

Der Verdoppler zählt als Sonderkarte deines Zuges. Du spielst ihn zusammen mit einer Farbkarte, die Reihenfolge ist frei. Damit ist dein erster Zug beendet: Du füllst deine Handkarten auf und spielst sofort einen zweiten Zug, wieder mit einer Farbkarte und optional einer Sonderkarte. Neben dem Verdoppler spielst du so bis zu 3 Karten. Das ermöglicht eine schnellere Entwicklung der eigenen Schlange oder die Kombination mehrerer taktischer Züge.

**Beispiele:**

Ein Spieler spielt den Verdoppler und eine rote Karte. Er füllt seine Hand auf und spielt im zweiten Zug eine blaue Karte und Schlangenfrass. Neben dem Verdoppler hat er so drei Karten gespielt.

**Wichtige Regeln:**

- Spiele den Verdoppler als Sonderkarte deines Zuges, vor oder nach deiner Farbkarte
- Fülle danach deine Handkarten auf
- Spiele sofort einen zweiten Zug mit einer Farbkarte und optional einer Sonderkarte
- Neben dem Verdoppler spielst du so bis zu 3 Karten
- Kann nicht mit anderen zugerweiternden Effekten kombiniert werden

#### A7.9 Schlangenhäutung

Kurzbeschreibung: Ermöglicht es, einen Abschnitt von 3–5 Farbkarten in der Schlange neu anzuordnen

Die Schlangenhäutung ist eine taktische Karte aus der Erweiterung 'Schlangenkorb des Glücks', die es ermöglicht, einen Abschnitt von 3–5 Farbkarten in der Schlange neu anzuordnen. Es dürfen nur Farbkarten neu angeordnet werden. Der gewählte Abschnitt muss 3–5 aufeinanderfolgende Farbkarten umfassen. Sonderkarten unterbrechen den Abschnitt und können nicht Teil der Neuordnung sein.

**Beispiele:**

Ein Spieler hat folgende Karten in seiner Schlange: Blau - Rot - Gelb - Rot - Gelb. Er spielt Schlangenhäutung und ordnet die Karten neu an, um eine gelbe und eine rote Gruppe zu bilden.

[Blau] [Rot] [Gelb] [Rot] [Gelb]

Ergebnis nach Anwendung der Schlangenhäutung

[Gelb] [Gelb] [Blau] [Rot] [Rot]

Ein Spieler hat eine Schlangenblockade in seiner Reihe. Diese unterbricht die möglichen Bereiche für die Schlangenhäutung. Da auch keine mindestens drei Farbkarten in einer Reihe liegen, kann die Schlangenhäutung nicht eingesetzt werden.

[Blau] [Violett] [Schlangenblockade] [Grün] [Violett]

**Wichtige Regeln:**

- Es dürfen nur Farbkarten neu angeordnet werden
- Der gewählte Abschnitt muss 3–5 aufeinanderfolgende Farbkarten umfassen
- Sonderkarten unterbrechen den Abschnitt
- Die Gesamtstruktur der Schlange bleibt erhalten
- Die Neuordnung erfolgt einmalig
- Die Karten dürfen nicht mehrfach verschoben werden
- Nur zusammenhängende Farbkarten dürfen gewählt werden
- Neue Farbgruppen zählen für Aufgaben und Punktewertung (Aufgaben sind Erweiterungsinhalt)
- Die Position von Sonderkarten bleibt unverändert

**Hinweis:** Diese Karte ist Teil der Erweiterung "Schlangenkorb des Glücks" und wird nur bei Verwendung der Erweiterung verwendet.

#### A7.10 Schlangenkorb des Glücks

Kurzbeschreibung: Einmalig nutzbare Spezialkarte mit verschiedenen Bonuseffekten

Diese einzigartige Karte wird zu Beginn des Spiels unter die anderen Karten gemischt. Der Spieler, der sie zieht, kann sie einmal während des Spiels einsetzen, um einen der folgenden Boni zu erhalten.

**Beispiele:**

Ziehe 3 zusätzliche Karten und spiele sofort bis zu 2 davon aus

Tausche bis zu 2 Karten aus deiner Schlange mit Karten aus deiner Hand

Entferne eine Schlangenblockade aus deiner Schlange ODER entferne eine Sonderkarte aus einer gegnerischen Schlange

Führe zwei zusätzliche Aktionen in diesem Zug aus

**Wichtige Regeln:**

- Wähle einen der verfügbaren Bonuseffekte
- Führe den gewählten Effekt sofort aus
- Die Karte wird nach der Nutzung aus dem Spiel entfernt

**Hinweis:** Diese Karte ist Teil der Erweiterung "Schlangenkorb des Glücks" und wird nur bei Verwendung der Erweiterung verwendet.

### A8 Erweiterung: Schlangenkorb des Glücks

Die folgenden Karten sind Teil der Erweiterung "Schlangenkorb des Glücks" und können optional zum Basis-Spiel hinzugefügt werden.

Die Comeback-Karte ist deine zweite Chance! Jeder Spieler erhält zu Spielbeginn eine Comeback-Karte.

#### A8.1 Comeback-Karte

Kurzbeschreibung: Ermöglicht zwei zusätzliche Aktionen, wenn man im Rückstand ist Liegt deine längste Schlange zu Beginn deines Zuges mindestens 5 Karten hinter der längsten Schlange auf dem Tisch, kannst du deine Comeback-Karte einsetzen und erhältst zwei zusätzliche Aktionen. Danach ist sie verbraucht.

Ermöglicht zwei zusätzliche Aktionen, wenn man im Rückstand ist

**Auslösebedingung**

- Die Comeback-Karte kann nur gespielt werden, wenn die Bedingungen zu Beginn des eigenen Zuges erfüllt sind.
- Die Bedingung ist erfüllt, wenn die längste Schlange des Spielers mindestens 5 Karten kürzer ist als die längste Schlange auf dem Tisch.

**Zeitpunkt der Aktivierung**

- Nur während des eigenen Zuges spielbar.
- Pro Spieler und Zug darf nur eine Comeback-Karte gespielt werden.
- Mehrere Spieler dürfen nacheinander in ihren jeweiligen Zügen Comeback-Karten spielen, wenn die Bedingungen jeweils erfüllt sind.

**Bonuseffekt**

Bei Aktivierung erhält der Spieler zwei zusätzliche Aktionen in seinem Zug. Diese zusätzlichen Aktionen können sein:

- Eine Farbkarte aus der Hand ausspielen
- Eine Sonderkarte aus der Hand ausspielen
- Zwei Karten abwerfen und drei neue vom Nachziehstapel ziehen

Der Spieler kann diese zwei Aktionen in beliebiger Reihenfolge mit seinen normalen Zugaktionen ausführen und darf auch zweimal die gleiche Aktion wählen.

**Wichtig**

Die Nutzung einer Comeback-Karte zählt nicht als reguläre Aktion in deinem Zug. Du darfst also zusätzlich zu dieser Sonderaktion deine normalen Zugaktionen durchführen.

**Nach der Nutzung**

Die Comeback-Karte wird umgedreht, um anzuzeigen, dass sie verwendet wurde. Sie kann nicht erneut aktiviert werden, auch wenn die Bedingung später wieder erfüllt sein sollte.

Die Risiko-Belohnungs-Karten bieten dir die Möglichkeit, eine zusätzliche Sonderaktion in deinem Zug durchzuführen. Dabei gehst du jedoch ein kalkuliertes Risiko ein: Bei jeder Nutzung wird geprüft, ob du die Belohnung erhältst oder ein Gegenspieler davon profitiert.

#### A8.2 Risiko-Belohnungs-Karte

Kurzbeschreibung: Ermöglicht eine zusätzliche Aktion mit besonderen Effekten Jeder Spieler erhält zu Beginn des Spiels 2 Risiko-Belohnungs-Karten. Nach dem Ausspielen wird eine Risiko-Belohnungs-Karte aus dem Spiel entfernt. Pro Runde darfst du maximal eine Risiko-Belohnungs-Karte verwenden.

Die Risiko-Belohnungs-Karten bieten dir die Möglichkeit, eine zusätzliche Sonderaktion in deinem Zug durchzuführen. Dabei gehst du jedoch ein kalkuliertes Risiko ein: Bei jeder Nutzung wird geprüft, ob du die Belohnung erhältst oder ein Gegenspieler davon profitiert.

Jeder Spieler erhält zu Beginn des Spiels 2 Risiko-Belohnungs-Karten. Nach dem Ausspielen wird eine Risiko-Belohnungs-Karte aus dem Spiel entfernt. Pro Runde darfst du maximal eine Risiko-Belohnungs-Karte verwenden.

**Allgemeine Regel zur Risikoprüfung**

Sobald du eine Risiko-Belohnungs-Karte ausspielst, deckst du die oberste Karte vom Nachziehstapel auf:

**Farbkarte:** Die Aktion ist erfolgreich – du erhältst die volle Belohnung.

**Sonderkarte:** Die Aktion scheitert – stattdessen profitiert ein Gegenspieler.

Wenn die Aktion fehlschlägt, darfst du entscheiden, welchem deiner Gegenspieler die angegebene Ersatzbelohnung zugutekommt. Dies fördert gezielt das Aufholen im Spiel, weil du dem Spieler helfen kannst, der zurückliegt.

**Die vier Risiko-Belohnungs-Aktionen**

**Aktion 1: Zusätzliche Karten ziehen**

Wenn du diese Aktion wählst, ziehst du im Erfolgsfall drei Karten vom Nachziehstapel auf deine Hand.

**Erfolg:** Lege die gezogene Farbkarte auf deine Hand und ziehe anschliessend 2 weitere Karten.

**Misserfolg:** Die aufgedeckte Sonderkarte musst du einem Gegenspieler deiner Wahl geben. Der gewählte Spieler darf die Sonderkarte direkt auf die Hand nehmen.

**Wichtig:** Wenn du oder der Gegenspieler durch diese Aktion mehr als 5 Handkarten habt, reduziert jeder am Ende seines eigenen Zuges wieder auf maximal 5 Karten.

**Aktion 2: Zusätzliche Farbkarte spielen**

Du darfst versuchen, eine zusätzliche Farbkarte an ein beliebiges Ende deiner Schlange anzulegen.

**Erfolg:** Du spielst sofort eine zusätzliche Farbkarte an deiner eigenen Schlange an. Du kannst dafür die gezogene Karte verwenden oder eine Karte aus deiner Hand nutzen. In jedem Fall behältst du die gezogene Farbkarte.

**Misserfolg:** Deine geplante Farbkarte wandert auf die Hand eines beliebigen Gegenspielers deiner Wahl. Alternativ darf dieser Spieler die oberste Karte vom Nachziehstapel ziehen und sie auf die Hand nehmen.

**Aktion 3: Karten tauschen**

Du möchtest eine Farbkarte in deiner Schlange durch eine Karte von deiner Hand ersetzen.

**Ablauf:**

- Benenne vor dem Risiko-Check, welche Karte in deiner Schlange du tauschen möchtest
- Decke eine Karte vom Nachziehstapel auf

**Erfolg:** Die gezogene Karte ist eine Farbkarte mit dem gleichen Punktewert (1, 2 oder 3 Punkte) wie deine gewählte Schlange-Karte. Du darfst den Tausch ausführen.

**Misserfolg:**

- Farbkarte mit anderem Punktewert: Lege sie zusätzlich an die Position der gewählten Karte. Du hast nun zwei Farbkarten hintereinander an dieser Stelle.
- Sonderkarte: Die Aktion scheitert vollständig. Die Sonderkarte kommt auf deinen Ablagestapel. Die Schlange bleibt unverändert.

**Aktion 4: Karten aus dem Ablagestapel oder Nachziehstapel nehmen**

Diese Aktion ermöglicht dir mehr Flexibilität:

**Erfolg:** Du wählst:

- Zwei Karten vom Nachziehstapel ziehen
- **ODER eine beliebige Karte von deinem eigenen Ablagestapel auf die Hand nehmen**

**Misserfolg:** Der Gegenspieler deiner Wahl darf:

- Eine beliebige Karte aus seinem Ablagestapel auf die Hand nehmen
- **ODER die oberste Karte vom Nachziehstapel ziehen**

**Wichtig:** Risiko-Belohnungs-Karte sowie Schlangenkorb des Glücks können nicht vom Ablagestapel genommen werden.

**Wichtige Regeln für alle Risiko-Belohnungs-Karten:**

- Die Nutzung einer Risiko-Belohnungs-Karte zählt nicht als reguläre Aktion in deinem Zug.
- Du darfst weiterhin deine normalen Aktionen im selben Zug ausführen.
- **Pro Runde darfst du nur eine Risiko-Belohnungs-Karte spielen.**
- Nach der Nutzung kommt die Karte aus dem Spiel.
- **Handkarten-Limit: Wenn du oder ein Gegenspieler durch eine Aktion mehr als 5 Handkarten erhaltet, wird am Ende des jeweils eigenen Zuges wieder auf maximal 5 Karten reduziert.**
- **Freie Wahl bei Misserfolg: Bei gescheiterten Aktionen darfst du immer frei wählen, welcher Gegenspieler von der Ersatzbelohnung profitiert.**

### A9 Aufgabenkarten [Erweiterung]

#### Allgemeine Regeln für Aufgabenkarten:

- Zu Beginn des Spiels werden 3 offene Aufgabenkarten ausgelegt.
- Jeder Spieler erhält zusätzlich eine geheime Aufgabenkarte.
- Alle Aufgaben funktionieren nach dem gleichen Prinzip - egal ob offen oder geheim.
- Eine Aufgabe kann erfüllt werden, sobald ein Spieler die Bedingungen erfüllt und am Zug ist.
- Die Bedingungen dürfen im selben Zug geschaffen und die Aufgabe direkt erfüllt werden.

#### Ablauf der Aufgabenerfüllung:

- Bei offenen Aufgaben ruft der Spieler "Schlangenspass!", wenn er eine Aufgabe erfüllt.
- Die erfüllte offene Aufgabe wandert zum Spieler und wird durch eine neue vom Stapel ersetzt.
- Geheime Aufgaben werden erst bei der Punktezählung aufgedeckt.
- Jede Aufgabe kann nur einmal erfüllt werden. Die Punkte bekommt, wer die Bedingungen zuerst erfüllt und am Zug ist.
- Wenn der Aufgabenkartenstapel leer ist, werden keine neuen Aufgaben mehr aufgedeckt.

#### Wichtig für Sonderkarten:

Regenbogenschlange und Farbenfusion zählen für Aufgaben als Karte einer Farbe, und zwar als die Farbe, mit der die Aufgabe erfüllt ist. Diese Farbe ist nicht festgelegt: Bei einer anderen Aufgabe und bei der Punktewertung darf die Karte als andere Farbe zählen. Die Karten unter einer Farbenfusion zählen nicht einzeln. Andere Sonderkarten, etwa die Schlangenblockade, unterbrechen Farbreihen und zählen nur, wenn eine Aufgabe ausdrücklich Sonderkarten verlangt.

#### Beispiel:

Ein Spieler hat bereits eine Vierergruppe blauer Karten. Als offene Aufgabe liegt "Farbkombination" (5 Karten gleicher Farbe). In seinem Zug legt er eine weitere blaue Karte an und erfüllt damit die Bedingung. Er darf sofort "Schlangenspass!" rufen und die Aufgabe für sich beanspruchen, auch wenn ein anderer Spieler ebenfalls kurz davor war.

Vorher:

[Blau] [Blau] [Blau] [Blau]

Nach Anlegen der fünften Karte:

[Blau] [Blau] [Blau] [Blau] [Blau]

#### Verfügbare Aufgabenkarten

| Nr. | Name | Punkte | Bedingung (Kartentext) |
|---|---|---|---|
| 1 | Farbenpracht | 8 | Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen. |
| 2 | Farbharmonie | 10 | Habe in deinen Schlangen mindestens eine Dreiergruppe jeder Farbe. |
| 3 | Farbkombination | 5 | Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange. |
| 4 | Farbvielfalt | 9 | Bilde eine Kette aus je einer Karte aller 6 Farben. |
| 5 | Vielfaltskönig | 9 | Habe in jeder deiner Schlangen min. 4 versch. Farben. |
| 6 | Farbwechsler | 6 | Habe in einer Schlange mindestens 4 verschiedene Farben, die direkt aufeinander folgen. Es müssen nicht einzelne Farben aufeinander folgen. Es gelten auch Reihen. |
| 7 | Fusionsexperte | 6 | Habe eine Schlange mit mindestens 2 Farbfusionen. |
| 8 | Schlangenbeschwörer | 7 | Habe min. 4 Sonderkarten in deinen Schlangen. |
| 9 | Schlangenmeister | 4 | Habe min. 2 versch. Sonderkarten in deinen Schlangen und spiele min. 4 aus. |
| 10 | Schlangenrepertoire | 4 | Spiele min. 5 versch. Arten von Sonderkarten aus. |
| 11 | Schlangenbändiger | 7 | Habe in einer Schlange ein sich wiederholendes Muster aus min. 3 versch. Farben. |
| 12 | Schlangentanz | 7 | Bilde durch Schlangenhäutung 2 neue Dreiergruppen. |
| 13 | Symmetriemeister | 10 | Habe eine Schlange mit min. 8 Karten, bei der die erste Hälfte das Spiegelbild der zweiten ist. |
| 14 | Gelber Schatz | 5 | Bilde eine Gruppe aus min. 6 gelben Karten. |
| 15 | Lila Riese | 5 | Bilde eine ununterbrochene Reihe aus min. 5 violetten Karten. |

#### Beispiele zu einzelnen Aufgabenkarten

**Farbharmonie:** Ein Spieler hat zwei Schlangen. In Schlange 1 hat er: Blau - Blau - Blau - Rot - Rot - Rot - Grün - Grün - Grün. In Schlange 2 hat er: Gelb - Gelb - Gelb - Braun - Braun - Braun - Violett - Violett - Violett. Er erfüllt diese Aufgabe und erhält 10 Punkte. [Blau] [Blau] [Blau] [Rot] [Rot] [Rot] [Grün] [Grün] [Grün] [Gelb] [Gelb] [Gelb] [Braun] [Braun] [Braun] [Violett] [Violett] [Violett]

**Farbkombination:** Ein Spieler hat folgende Karten in seiner Schlange: Blau - Blau - Blau - Blau - Blau. Er erfüllt diese Aufgabe und erhält 5 Punkte. [Blau] [Blau] [Blau] [Blau] [Blau]

**Farbvielfalt:** Ein Spieler hat folgende Karten in seiner Schlange: Blau - Rot - Gelb - Braun - Violett - Grün. Er erfüllt diese Aufgabe und erhält 9 Punkte. Eine Regenbogenschlange oder eine Farbenfusion in der Kette würde als die Farbe zählen, die dem Spieler noch fehlt. [Blau] [Rot] [Gelb] [Braun] [Violett] [Grün]

**Farbwechsler:** Ein Spieler hat folgende Karten in seiner Schlange: Blau - Rot - Gelb - Grün - Blau. Er erfüllt diese Aufgabe, da er vier verschiedene Farben direkt hintereinander in der Schlange liegen hat und erhält 6 Punkte. [Blau] [Rot] [Gelb] [Grün] [Blau]

**Schlangenbändiger:** Ein Spieler hat folgende Karten in seiner Schlange: Rot - Blau - Grün - Rot - Blau - Grün. Er erfüllt diese Aufgabe und erhält 7 Punkte. [Rot] [Blau] [Grün] [Rot] [Blau] [Grün]

**Schlangentanz:** Ein Spieler hat folgende Karten in seiner Schlange: Blau - Grün - Grün - Blau - Grün - Rot - Rot - Violet - Violet - Rot - Violet. Er spielt die Sonderkarte Schlangenhäutung und wählt die letzten 5 Karten aus (Rot - Violet - Violet - Rot - Violet). Durch geschicktes Umordnen bildet er zwei neue Dreiergruppen: Blau - Grün - Grün - Blau - Grün - Rot - Rot - Rot - Violet - Violet - Violet. Er ruft "Schlangenspass!" und erfüllt die Aufgabe "Schlangentanz". #### Vorher: [Blau] [Grün] [Grün] [Blau] [Grün] [Rot] [Rot] [Violett] [Violett] [Rot] [Violett] #### Nachher: [Blau] [Grün] [Grün] [Blau] [Grün] [Rot] [Rot] [Rot] [Violett] [Violett] [Violett]

**Symmetriemeister:** Ein Spieler hat am Ende des Spiels folgende Schlange: Blau - Rot - Gelb - Grün - Grün - Gelb - Rot - Blau. Die erste Hälfte (Blau - Rot - Gelb - Grün) ist das Spiegelbild der zweiten Hälfte (Grün - Gelb - Rot - Blau). Der Spieler erhält 10 Punkte. [Blau] [Rot] [Gelb] [Grün] [Grün] [Gelb] [Rot] [Blau]

### A10 Spielende

Das Spiel endet, wenn der Nachziehstapel leer ist. Wer die letzte Karte vom Nachziehstapel zieht, spielt seinen Zug normal zu Ende. Danach machen alle anderen Spieler noch je einen letzten Zug, ohne nachzuziehen. Wäre der Spieler mit der letzten Karte wieder an der Reihe, endet das Spiel und es folgt die Wertung. Seine zuletzt gezogenen Karten kann er nur noch ausserhalb seines Zuges einsetzen, etwa einen Farbenschutz zur Abwehr.

### A11 Punktezählung

Nach Spielende werden die Punkte gezählt. Es gewinnt der Spieler mit den meisten Punkten.

1. Farbgruppen:

   - Eine Farbgruppe besteht aus mindestens drei nebeneinanderliegenden Karten derselben Farbe in einer Schlange.
   - Jede Gruppe wird nur einmal gewertet, mit ihrer ganzen Länge. Eine Vierergruppe zählt also nicht zusätzlich als Dreiergruppe, eine Fünfergruppe nicht als Dreier- und Vierergruppe, usw. Hat ein Spieler mehrere getrennte Gruppen derselben Farbe, auch in verschiedenen Schlangen, wird jede davon gewertet. Beispiel: Rot-Rot-Rot-Blau-Rot-Rot-Rot-Rot bringt für Rot 3 + 4 = 7 Punkte.
   - Punkte für Farbgruppen werden anhand der Anzahl an Karten in der Gruppe und der Farbe der Karten berechnet:

     - Blau, Rot, Gelb: 1 Punkt pro Karte in der Gruppe.
     - Violett, Braun: 2 Punkte pro Karte in der Gruppe.
     - Grün: 3 Punkte pro Karte in der Gruppe.
   - Sonderkarten in Farbgruppen:

     - Regenbogenschlangen und Farbfusionen können als jede Farbe zählen, um eine Farbgruppe zu vervollständigen oder zu verlängern. Sie zählen als die Farbe, die dem Spieler insgesamt die meisten Punkte bringt. Wofür sie während des Spiels bei Aufgaben gezählt haben, spielt dabei keine Rolle.
     - Regenbogenschlangen selbst bringen keine Punkte, ermöglichen aber das Erreichen einer längeren Farbgruppe.
     - Farbfusionen bringen die Punkte der beiden fusionierten Karten, wenn sie als Teil einer Dreier- oder längeren Gruppe zählen.

   **Beispiele für Farbgruppen:**

   **1. Beispiel (Einfache Farbgruppen):**

   Ein Spieler hat folgende Schlange: Blau-Blau-Blau-Rot-Rot-Rot-Rot

   [Blau] [Blau] [Blau] [Rot] [Rot] [Rot] [Rot]

   Punktzahl: 7 Punkte (3 Punkte für blaue Gruppe [3 × 1 Punkt] + 4 Punkte für rote Gruppe [4 × 1 Punkt])

   **2. Beispiel (Farbenfusion):**

   Ein Spieler hat folgende Schlange mit einer Farbenfusion zwischen blauen Karten

   [Blau] [Blau] [Blau + Farbenfusion + Blau] [Violett] [Violett]

   Punktzahl: 6 Punkte (die Farbenfusion wird als violette Karte genutzt, um eine violette Dreiergruppe zu bilden [3 × 2 Punkte]. Die fusionierten blauen Karten können nicht mehr als blaue Gruppe gewertet werden, da sie jetzt als Teil der violetten Gruppe zählen.)
2. Vielfaltbonus [Erweiterung]:

   Am Ende des Spiels wird für jede Schlange ein Vielfaltbonus berechnet. Es gilt der höchste erreichte Bonus einer Schlange.

   - Voraussetzung für den Vielfaltbonus sind Farbgruppen (mindestens 3 Karten) von verschiedenen Farben.
   - Regenbogenschlange und Farbenfusion zählen auch für den Vielfaltbonus als ihre Farbe. Eine Gruppe mit einem Joker ist also eine gültige Gruppe dieser Farbe.
   - Für die Berechnung zählt nur die längste gültige Gruppe jeder Farbe.
   - Der Bonus wird für jede Schlange separat ermittelt, aber nur der höchste Bonus einer Schlange zählt:

     - 2 verschiedene Farben mit gültigen Gruppen: 1 Bonuspunkt
     - 3 verschiedene Farben mit gültigen Gruppen: 2 Bonuspunkte
     - 4 verschiedene Farben mit gültigen Gruppen: 3 Bonuspunkte
     - 5 oder mehr verschiedene Farben mit gültigen Gruppen: 4 Bonuspunkte

   Wichtiger Hinweis zur Gruppenwertung:

   Eine Gruppe besteht aus mindestens drei nebeneinanderliegenden Karten einer Farbe. Regenbogenschlange und Farbenfusion zählen dabei als ihre Farbe, für die Punktewertung wie für den Vielfaltbonus.

   **Beispiele für Vielfaltbonus:**

   **1. Beispiel (Mehrere Farbgruppen):**

   Ein Spieler hat eine Schlange mit Dreiergruppen in Rot, Violett und Braun

   [Rot] [Rot] [Rot] [Violett] [Violett] [Violett] [Braun] [Braun] [Braun]

   Punktzahl: 2 Bonuspunkte (drei verschiedene Farben mit gültigen Gruppen)

   **2. Beispiel (Sonderkarten):**

   Ein Spieler hat folgende Schlange mit einer Regenbogenschlange, die als rote Karte zählt:

   [Blau] [Blau] [Blau] [Rot] [Regenbogenschlange] [Rot] [Violett] [Violett] [Violett]

   Punktzahl: 2 Bonuspunkte (Dreiergruppen in Blau, Rot und Violett, also drei verschiedene Farben; die Regenbogenschlange vervollständigt die rote Gruppe)
3. Längste Farbkette:

   Der Spieler mit der längsten ununterbrochenen Kette einer Farbe (ohne Sonderkarten!) erhält 5 Bonuspunkte. Bei Gleichstand erhalten alle beteiligten Spieler die vollen 5 Punkte. Getrennte Gruppen derselben Farbe werden dabei nicht zusammengezählt; es zählt die längste einzelne Kette. Anders als bei Farbgruppen zählen Regenbogenschlange und Farbenfusion hier nicht mit und unterbrechen die Kette: Bei Rot-Rot-Rot-Regenbogenschlange-Rot-Rot-Rot-Rot ist die längste Kette 4 Karten lang. Für die Punktewertung bringen die roten Karten trotzdem 7 Punkte.
4. Aufgabenkarten [Erweiterung]:

   - Zähle die Punkte für erfüllte offene Aufgaben.
   - Addiere die Punkte für die geheime Aufgabe, wenn diese erfüllt wurde.
   - Hinweis: Dieser Punktebereich wird nur bei Verwendung der Erweiterung gewertet.

## Teil B — Digitale Fassung

Teil B legt fest, was die Website offenlässt, weil sie ein Spiel am Tisch
beschreibt. Nichts hier ändert eine Regel aus Teil A.

### B1 Umfang

Der Autor hat entschieden (12.11.2026): Alle Teile der Erweiterung gehören in die
digitale Fassung. Vor jeder Partie wählt der Spieler, ob er mit oder ohne
Erweiterung spielt. Die Tabelle zeigt, was davon am 12.11.2026 umgesetzt ist.

| Bestandteil | Website | Digital heute |
|---|---|---|
| 78 Farbkarten, 30 Sonderkarten | Basis-Spiel | ja, mit abweichenden Stückzahlen (C1) |
| 15 Aufgabenkarten | Erweiterung | ja, 14 von 15 (C1) |
| Schlangenhäutung | Erweiterung | ja, mit abweichender Wirkung (C9) |
| Schlangenkorb des Glücks | Erweiterung | nein |
| Comeback-Karten | Erweiterung | nein |
| Risiko-Belohnungs-Karten | Erweiterung | nein |
| Vielfaltbonus | Erweiterung | nein |

### B2 Festlegungen

- **Erweiterung:** wählbar vor jeder Partie, mit oder ohne (B1).
- **Spielerzahl:** ein Mensch gegen 1, 2 oder 3 KI-Gegner. Die Website nennt 2–4 Spieler.
- **Startspieler:** Der Mensch beginnt. Die Website lässt den jüngsten Spieler beginnen.
- **Mischen:** Fisher-Yates oder ein gleichwertiges Verfahren.
- **Verdeckte Information:** Handkarten und geheime Aufgabe der KI-Gegner sind für
  den Menschen nie sichtbar, auch nicht mittelbar über angebotene Aktionen.
- **„Schlangenspass!":** wird nicht gerufen. Das Spiel erkennt eine erfüllte
  Aufgabe selbst und zeigt sie sichtbar an.
- **Ansage (A6):** Die „klare Ansage" ist digital die Auswahl von Karte und Ziel
  vor dem Ausführen. Danach lässt sich das Ziel nicht mehr wechseln.
- **Unerlaubte Aktionen:** werden nicht angeboten. Lehnt das Spiel eine Aktion
  dennoch ab, zeigt die Oberfläche den Grund auf Deutsch.
- **Zeit:** Es gibt kein Zeitlimit.

## Teil C — Abweichungen der heutigen Engine von Teil A

Arbeitsliste, Stand 12.11.2026. Jede Zeile ist ein Fehler im Code, nicht in der
Website. Geprüft heißt: am Code gelesen, mit einem Test nachgestellt oder im
laufenden Spiel beobachtet.

| Nr. | Thema | Website (Teil A) | Engine heute | Fundstelle |
|---|---|---|---|---|
| C1 | Stückzahlen | Schlangenblockade 3, Schlangengrube 3, Schlangenhäutung 3, Aufgabenkarten 15 (A1) | je 4 Blockaden, Gruben und Häutungen; 14 Aufgaben, „Vielfaltskönig" fehlt | `src/engine/deck.ts`, `src/engine/aufgabenKarten.ts`, `src/engine/constants.ts` |
| C2 | Regenbogenschlange | Sonderkarte, die als Karte beliebiger Farbe in die Schlange kommt, an beliebiger Stelle (A5, A7.3) | lässt sich nicht ausspielen; es gibt keine Aktion dafür, nur den Abwurf | `src/engine/legalActions.ts` (per Test nachgestellt) |
| C3 | Nachziehen im eigenen Zug | am Ende des eigenen Zuges auf 5 auffüllen (A5) | aufgefüllt wird erst beim Wechsel, für den nächsten Spieler | `src/engine/turnState.ts` (`beendeZug`) |
| C4 | Nachziehen nach Sonderkarte | wer ausserhalb seines Zuges spielt, füllt erst zu Beginn seines nächsten Zuges auf; kein sofortiges Nachziehen (A6) | jeder zieht sofort eine Karte je gespielter Sonderkarte | `src/engine/turnState.ts` (`zieheOffeneNachziehungen`) |
| C5 | Ablagestapel | jeder Spieler hat einen eigenen; gefressene Karten gehen auf den Stapel des Angreifers (A4, A6) | ein gemeinsamer Stapel | `src/engine/types.ts` (`ablagestapel`) |
| C6 | Farbenschutz | nur als Reaktion auf eine Sonderkarte (A7.2), und zwar gegen jede Sonderkarte eines Gegners, die mich oder meine Schlange trifft, nie gegen Farbkarten (D10); wer nur Farbenschutz hält, legt einen ohne Wirkung ab, zieht eine Karte und beendet den Zug (A5) | lässt sich zusätzlich im eigenen Zug auf eine eigene Schlange spielen und setzt sie auf „geschützt"; abwehrbar sind nur Blockade, Farbendieb, Schlangenfrass, Schlangengrube und Verdoppler | `src/engine/kartenwirkungen.ts` (`spieleFarbenschutz`) |
| C7 | Verdoppler | ist die Sonderkarte des Zuges und wird mit einer Farbkarte gespielt, Reihenfolge frei; danach Hand auffüllen und sofort ein zweiter Zug mit Farbkarte und optional Sonderkarte; neben dem Verdoppler bis zu 3 Karten; betrifft keinen Mitspieler (A5, A7.8) | nur als erste Karte des Zuges; danach eine zusätzliche Karte im selben Zug ohne Auffüllen, höchstens 3 Karten einschliesslich Verdoppler; Mitspieler dürfen ihn mit Farbenschutz abwehren, der Mensch wird bei jedem Verdoppler gefragt | `src/engine/legalActions.ts`, `src/engine/kartenwirkungen.ts` (`spieleVerdoppler`), `src/engine/reaktionsaufloesung.ts` |
| C8 | Schlangenfrass | a) eine eigene Karte, b) eine eigene Blockade, c) zwei Karten der Mitspieler „sofern möglich", keine gegnerische Blockade (A7.4) | genau eine eigene oder genau zwei gegnerische Karten; gegnerische Blockaden sind nicht ausgenommen | `src/engine/legalActions.ts`, `src/engine/kartenwirkungen.ts` |
| C9 | Schlangenhäutung | ordnet einen Abschnitt von 3–5 aufeinanderfolgenden Farbkarten neu; Sonderkarten bleiben liegen (A7.9) | ordnet die ganze Schlange neu, Sonderkarten eingeschlossen | `src/engine/kartenwirkungen.ts` (`spieleSchlangenhaeutung`) |
| C10 | Joker in Aufgaben | Regenbogenschlange und Farbenfusion zählen bei jeder Aufgabe als die Farbe, mit der die Aufgabe erfüllt ist; ihre Farbe ist nie festgelegt; eine erfüllte Aufgabe bleibt erfüllt (A7.3, A7.7, A9) | Sonderkarten unterbrechen in Aufgaben immer, auch Regenbogenschlange und Farbenfusion | `src/engine/aufgabenPruefung.ts`, `src/engine/colorGroups.ts` |
| C11 | Schlussrunde | nach der letzten Karte je ein letzter Zug ohne Nachziehen (A10); eine Verdopplung von Aufgaben kennt die Website nicht | offene Aufgaben zählen in der Schlussrunde doppelt | `src/engine/aufgabenPruefung.ts`, `src/engine/scoring.ts` |
| C12 | Pflichtkarte | mindestens eine, höchstens zwei Karten, davon höchstens eine Farbkarte und eine Sonderkarte; eine Karte genügt, egal welcher Art (A5, D12); eine Sonderkarte darf jederzeit gespielt werden, auch ohne Nutzen, und kommt ohne Ziel wirkungslos auf den eigenen Ablagestapel (D4, D13) | ohne erlaubte Aktion wird eine beliebige Karte abgeworfen | `src/engine/turnState.ts` (`werfeKarteMangelsSpielbarerAktionAb`) |
| C13 | Längste Farbkette | 5 Bonuspunkte in der Punktezählung nach Spielende (A11) | wird laufend angezeigt, schon ab einer einzelnen Karte; der Punktestand springt dadurch | `src/engine/scoring.ts` (im Spiel beobachtet) |
| C14 | Lila Riese | ununterbrochene Reihe aus mindestens 5 violetten Karten (A9) | jede violette Gruppe ab 3 Karten genügt | `src/engine/aufgabenPruefung.ts` (`pruefeLilaRiese`) |
| C15 | Neu aufgedeckte Aufgabe | darf sofort eingelöst werden (Antwort des Autors zu D5) | die nachgezogene Aufgabe wird in derselben Prüfung nicht mehr geprüft | `src/engine/aufgabenPruefung.ts` (`erfuelleOffeneAufgaben`) |
| C16 | Farbenfusion | die zwei Farbkarten liegen unter der Fusion; wird sie entfernt, liegen beide wieder einzeln an ihrer Stelle (A7.7, A7.4) | die zwei Farbkarten kommen auf den Ablagestapel, nur ihre Punktsumme bleibt gespeichert; beim Entfernen kehren sie nicht zurück | `src/engine/kartenwirkungen.ts` (`spieleFarbenfusion`), `src/engine/zugHelfer.ts` (`bereinigeFarbenfusionen`) |
| C17 | Abwehr bei Schlangenfrass | jeder betroffene Spieler entscheidet einmal; die Wirkung tritt erst nach allen Reaktionen ein (A6, Beispiel 2) | gefragt wird je Zielkarte; ungeschützte Ziele werden sofort entfernt | `src/engine/reaktionsaufloesung.ts`, `src/engine/kartenwirkungen.ts` (`spieleSchlangenfrass`) |
| C18 | Schlangengrube | kommt erst nach dem ausgesetzten Zug auf den Ablagestapel (A7.6) | kommt sofort auf den Ablagestapel | `src/engine/kartenwirkungen.ts` (`spieleSchlangengrube`) |
| C19 | Karten in gegnerische Schlangen | jede Karte darf in jede Schlange, Farbkarten an ein Ende, Sonderkarten an beliebiger Stelle (D9) | Farbkarte, Farbenfusion und Schlangenhäutung nur in eigene Schlangen | `src/engine/legalActions.ts`, `src/engine/turnState.ts`, `src/engine/kartenwirkungen.ts` |
| C20 | Zeitpunkt der Aufgabenprüfung | eine Aufgabe kann erfüllt werden, sobald die Bedingung gilt und der Spieler am Zug ist (A9) | geprüft wird nur einmal am Ende der Ausspielphase | `src/engine/turnState.ts` (`beendeAufgabenpruefung`) |
| C21 | Farbwechsler | „Es gelten auch Reihen" (A9) | geprüft werden vier verschiedene Einzelkarten direkt nacheinander | `src/engine/aufgabenPruefung.ts` (`pruefeFarbwechsler`) |
| C22 | Erweiterungsmaterial | Comeback- und Risiko-Belohnungs-Karten liegen offen vor dem Spieler, sie sind kein Teil des Kartenstapels (A1, A4) | stehen als Sonderkarten im Deckmodul | `src/engine/deck.ts` |
| C23 | Symmetriemeister | „min. 8 Karten, erste Hälfte Spiegelbild der zweiten" (A9); gerade Länge und Sonderkarten sagt die Website nicht | verlangt gerade Länge und ausschliesslich Farbkarten (Auslegung offen, Umsetzungsplan Frage G6) | `src/engine/aufgabenPruefung.ts` (`pruefeSymmetriemeister`) |

Mit Teil A übereinstimmend geprüft: höchstens zwei Karten pro Zug (eine Farbkarte,
eine Sonderkarte), höchstens zwei Schlangen,
Handlimit 5, Abwehr nur mit Farbenschutz, Schlangenblockade an beliebiger
Stelle jeder Schlange, Joker in der Wertung (zählen als die Farbe mit den meisten
Punkten), Joker unterbrechen die längste Farbkette, mehrere Gruppen derselben
Farbe zählen je voll, Ablauf der Schlussrunde.

Nicht geprüft und deshalb nicht bewertet: Einzelheiten der KI
(`src/kiZug.ts`) und jede Regel der nicht umgesetzten Erweiterungsteile (B1).

## Teil D — Offene Auslegungsfragen an den Autor

Hier kommen Stellen hin, die der Wortlaut der Website in zwei Richtungen lesen
lässt. Bis zur Antwort bleibt das heutige Verhalten stehen.

Offen sind die Fragen F1–F15 (Basis-Spiel) und G1–G23 (Erweiterung) aus
`docs/UMSETZUNGSPLAN.md`, Abschnitt 9. Sie werden mit Task P0.5 beantwortet
und dann hier eingetragen.

### Beantwortet

Antworten des Autors vom 12.11.2026. Wo die Website es selbst sagt, steht die
Fundstelle in Teil A; wo nicht, gilt die Antwort, bis die Website sie aufnimmt.
Die Antworten zu D1 und D8 hat der Autor am selben Abend auf die Website
übernommen.

| Nr. | Frage | Antwort | Folge |
|---|---|---|---|
| D1 | Zählen zwei getrennte Gruppen derselben Farbe beide? | Website geändert: Jede Gruppe zählt voll, auch über beide Schlangen; eine Vierergruppe nicht zusätzlich als Dreiergruppe. Für die längste Farbkette zählt nur die längste einzelne Kette (A11). | Engine stimmt überein |
| D2 | Darf der Farbendieb Sonderkarten stehlen? | Nein, nur Farbkarten. | Engine stimmt überein |
| D3 | Lila Riese: genügt eine Kette ab 3? | Website geändert: mindestens 5 violette Karten in einer Reihe (A9). | C14 |
| D4 | Was gilt, wenn keine Sonderkarte spielbar ist? | Eine Sonderkarte muss gespielt werden, auch wenn sie wirkungslos ist. Pflicht ist mindestens eine Karte pro Zug. | C12 |
| D5 | Neu aufgedeckte Aufgabe im selben Zug? | Darf sofort eingelöst werden. | C15 |
| D6 | Zählt der Verdoppler zu den drei Karten? | Website geändert: nein, neben dem Verdoppler bis zu 3 Karten in zwei Zügen (A5, A7.8). | C7 |
| D7 | Umfang der Erweiterung? | Alle Teile; vor der Partie wählbar mit oder ohne Erweiterung. | B1 |
| D8 | Wer legt die Farbe eines Jokers fest, und wann? | Website geändert: Die Farbe ist nie festgelegt. Bei jeder Aufgabe zählt der Joker als die Farbe, mit der sie erfüllt ist, bei der Wertung als die Farbe mit den meisten Punkten (A7.3, A7.7, A9, A11). | C10 |
| D9 | Darf man Karten in gegnerische Schlangen spielen? | Ja, jede Karte in jede Schlange: Farbkarten an ein Ende, Sonderkarten an beliebiger Stelle. Eine Regenbogenschlange beim Gegner ist erlaubt, nützt aber ihm. Website folgt. | C19 |
| D10 | Wogegen wirkt Farbenschutz? | Gegen jede Sonderkarte eines Gegners, die mich oder meine Schlange trifft, auch Farbenfusion, Schlangenhäutung und Regenbogenschlange. Gegen Farbkarten gibt es keine Abwehr. Website folgt. | C6 |
| D11 | Gibt ein Verdoppler im zweiten Zug einen dritten Zug? | Nein, nur ein Verdoppler pro Runde. Website folgt. | C7 |
| D12 | Muss man eine Farbkarte spielen, wenn man eine hat? | Nein. Mindestens eine, höchstens zwei Karten, davon höchstens eine Farbkarte und eine Sonderkarte; eine Karte genügt, egal welcher Art. Website folgt. | C12 |
| D13 | Darf man eine Sonderkarte spielen, die einem nichts bringt? | Ja, jederzeit, auch wenn man eine Farbkarte hätte. Hat sie kein mögliches Ziel, kommt sie wirkungslos auf den eigenen Ablagestapel und zählt als Sonderkarte des Zuges. Website folgt. | C12 |

## Teil E — Frühere R-Nummern, Stand und Verlauf

### Frühere R-Nummern

Code-Kommentare und ältere Dokumente verweisen auf R-Nummern der Fassung bis
04.08.2026. Sie finden sich hier wieder:

| Früher | Jetzt |
|---|---|
| R1.1, R1.2, R4.1 Kartenmaterial | A1 |
| R1.2a Umfang der digitalen Fassung | B1 |
| R1.3, R1.4 Startkarten, Aufgaben auslegen | A4 |
| R2, R2.1 bis R2.6 Zugstruktur | A5 |
| R2.3a Nachziehen nach einer Sonderkarte | entfällt, siehe A6 und C4 |
| R3.1 bis R3.5 Schlangenbau | A5 (Schlangen), A11 (Farbgruppen) |
| R3.5a Zustand „blockiert" | entfällt; die Website kennt keinen Schlangenzustand (C6) |
| R6, R6.1 bis R6.3 Aufgabenkarten | A9 |
| R6.2a Auslegung „Lila Riese" | A9, C14 |
| R6.4 Endspurt-Verdopplung | entfällt, siehe C11 |
| R7.1 Sonderkartenwirkungen | A6, A7 |
| R7.1a Einfügeposition der Schlangenblockade (O-1) | A7.5 |
| R8.4 Punktwertung | A11 |
| R8.4a Längste Farbkette | A11, C13 |
| O-3 eigener Ablagestapel je Spieler | A4, C5 |
| O-4 zweite Spielende-Bedingung | entfällt; A10 nennt nur den leeren Nachziehstapel |

### Stand und Verlauf

- **12.11.2026, Umsetzungsplan:** D9–D13 (Antworten des Autors, Website folgt)
  aufgenommen; C6 und C12 danach neu gefasst; C16–C23 beim Planen am Code
  gefunden. Offene Fragen stehen in `docs/UMSETZUNGSPLAN.md`, Abschnitt 9.
  Teil A ist reproduzierbar: `npm run abgleich:website`.
- **12.11.2026 abends:** Zweiter Abgleich nach Überarbeitung der Website
  (Verdoppler als zweiter Zug, Lila Riese ab 5 Karten, Schlangenfrass ohne
  gegnerische Blockaden, neue Beispiele). Antworten des Autors zu D1 bis D7
  aufgenommen; C14, C15 neu; C7 neu gefasst. Danach dritter Abgleich: Jokerfarbe
  nie festgelegt (D8 beantwortet, C10 neu gefasst), mehrere Gruppen derselben
  Farbe zählen je voll (D1).
- **12.11.2026:** Neu gefasst als Spiegel der Website. Anlass: Der Autor hat die
  Spielanleitung auf der Website überarbeitet und sie zur einzigen verbindlichen
  Quelle erklärt. Die Fassung vom 03./04.08.2026 beruhte auf einem älteren Stand
  der Website und auf Dart; sie wich in Stückzahlen, Nachziehen, Schlussrunde,
  Jokern und mehreren Sonderkarten ab. Ihr Wortlaut steht in der Git-Historie.
- **03.08.2026:** Frühere Fassung gesperrt.
- **04.08.2026:** Freie Einfügeposition der Schlangenblockade (O-1) aufgenommen.
