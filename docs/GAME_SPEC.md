# Schlangentanz Game Spec

Status: **Abgeglichen mit der Website am 13.11.2026.**

Teil A gibt die Spielanleitung von `https://schlangentanz.ch/rules` wörtlich wieder
(Stand der Website: 13.11.2026, Bundle `index-EH-TKokX.js`).

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

     - Eine Farbkarte, um eine eigene Schlange zu beginnen oder eine beliebige Schlange fortzusetzen, auch die eines Mitspielers (muss an einem Ende der Schlange angelegt werden)
     - Optional eine Sonderkarte, um deren Effekt auszulösen (kann an beliebiger Stelle jeder Schlange eingefügt werden, auch bei einem Mitspieler)
     - Du darfst die Farbkarte und die Sonderkarte in beliebiger Reihenfolge spielen
     - Ist deine Sonderkarte der Verdoppler, füllst du nach diesem Zug deine Handkarten auf und spielst sofort einen zweiten Zug. Neben dem Verdoppler spielst du so bis zu 3 Karten
   - Zug beenden: Ziehe Karten vom Nachziehstapel, bis du wieder 5 Handkarten hast. Danach ist der nächste Spieler an der Reihe.
2. Hast du am Ende deines Zuges mehr als 5 Karten auf der Hand, lege die überzähligen Karten auf deinen Ablagestapel.

#### [Erweiterung] Zusätzlich bei Verwendung der Aufgabenkarten:

In deinem Zug kommt folgende Möglichkeit hinzu:

- Aufgabe erfüllen: Wenn du die Bedingungen einer offenen Aufgabenkarte erfüllst, rufe "Schlangenspass!" und nimm die Aufgabe zu dir. Lege dann eine neue Aufgabenkarte vom Stapel auf. Deine geheime Aufgabe deckst du erst bei der Wertung auf.

Wichtig: Du musst immer mindestens eine Karte spielen. Welche, ist dir überlassen: Eine Sonderkarte allein genügt, auch wenn du eine Farbkarte hättest. Du darfst auch eine Sonderkarte spielen, die dir gerade nichts bringt. Hat sie kein mögliches Ziel, legst du sie ohne Wirkung auf deinen Ablagestapel; sie zählt dann als die Sonderkarte deines Zuges. Hast du nur Farbenschutz-Karten auf der Hand, legst du eine davon ohne Wirkung auf deinen Ablagestapel. Danach ziehst du eine Karte nach, und dein Zug ist beendet. Die neue Karte darfst du erst im nächsten Zug ausspielen.

Schlangen:

- Ein Spieler darf maximal 2 Schlangen haben.
- Eine neue Schlange kann begonnen werden, indem eine Farbkarte separat von bestehenden Schlangen gelegt wird.
- Es gibt keine Begrenzung für die Länge einer Schlange.

### A6 Sonderkarten-Timing und Beispiele

#### Grundregeln für Sonderkarten:

- Sonderkarten werden immer mit klarer Ansage gespielt: Der Spieler benennt das Ziel seiner Aktion.
- Der betroffene Spieler kann sofort mit einem Farbenschutz reagieren. Das gilt für jede Sonderkarte, die ein Mitspieler gegen ihn oder in seine Schlange spielt. Gegen Farbkarten gibt es keine Abwehr. Eine andere Karte als Farbenschutz ist als Reaktion nicht erlaubt.
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

Kurzbeschreibung: Wehrt eine Sonderkarte eines Mitspielers ab

Eine defensive Karte, die als Reaktion auf jede Sonderkarte gespielt werden kann, die ein Mitspieler gegen dich oder in deine Schlange spielt. Der Farbenschutz ist besonders wertvoll, wenn man wichtige Karten in seiner Schlange vor Angriffen schützen möchte.

**Beispiele:**

Spieler B spielt eine Schlangenblockade gegen Spieler A. Spieler A kann, wenn er möchte, einen Farbenschutz spielen, um die Schlangenblockade abzuwehren. Die Schlangenblockade wird auf den Ablagestapel von Spieler B gelegt, und Spieler A bleibt unberührt.

[Farbenschutz] [Schlangenblockade]

**Wichtige Regeln:**

- Spiele als Reaktion auf eine Sonderkarte
- Lege den Farbenschutz auf deinen Ablagestapel
- Die abgewehrte Sonderkarte kommt auf den Ablagestapel des Angreifers
- Wirkt gegen jede Sonderkarte, die ein Mitspieler gegen dich oder in deine Schlange spielt, auch gegen Farbenfusion, Schlangenhäutung und Regenbogenschlange
- Gegen Farbkarten gibt es keine Abwehr

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

Der Verdoppler zählt als Sonderkarte deines Zuges. Du spielst ihn zusammen mit höchstens einer Farbkarte, die Reihenfolge ist frei. Damit ist dein erster Zug beendet: Du füllst deine Handkarten auf und spielst sofort einen zweiten Zug. Er läuft wie ein normaler Zug ab: mindestens eine Karte, höchstens eine Farbkarte und eine Sonderkarte. Neben dem Verdoppler spielst du so bis zu 3 Karten. Das ermöglicht eine schnellere Entwicklung der eigenen Schlange oder die Kombination mehrerer taktischer Züge.

**Beispiele:**

Ein Spieler spielt den Verdoppler und eine rote Karte. Er füllt seine Hand auf und spielt im zweiten Zug eine blaue Karte und Schlangenfrass. Neben dem Verdoppler hat er so drei Karten gespielt.

**Wichtige Regeln:**

- Spiele den Verdoppler als Sonderkarte deines Zuges, mit höchstens einer Farbkarte davor oder danach
- Fülle danach deine Handkarten auf
- Spiele sofort einen zweiten Zug, der wie ein normaler Zug abläuft
- Neben dem Verdoppler spielst du so bis zu 3 Karten
- Kann nicht mit anderen zugerweiternden Effekten kombiniert werden
- Im zweiten Zug darfst du keinen weiteren Verdoppler spielen

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
Erweiterung spielt. Die Tabelle zeigt den Stand vom 24.11.2026.

| Bestandteil | Website | Digital heute |
|---|---|---|
| 78 Farbkarten, 30 Sonderkarten | Basis-Spiel | ja |
| 15 Aufgabenkarten | Erweiterung | ja: Prüfung und Einlösen nach A9 (X1, 23.11.2026); alle 15 Bedingungen nach A9 (X2b, X2c, 23.11.2026; X2a, 24.11.2026) |
| Schlangenhäutung | Erweiterung | ja |
| Schlangenkorb des Glücks | Erweiterung | ja (X6, 24.11.2026) |
| Comeback-Karten | Erweiterung | ja (X4, 24.11.2026) |
| Risiko-Belohnungs-Karten | Erweiterung | ja (X5, 24.11.2026) |
| Vielfaltbonus | Erweiterung | ja (E10, 13.11.2026; E10b, 20.11.2026) |

### B2 Festlegungen

- **Erweiterung:** wählbar vor jeder Partie, mit oder ohne (B1).
- **Spielerzahl:** ein Mensch gegen 1, 2 oder 3 KI-Gegner. Die Website nennt 2–4 Spieler.
- **Startspieler:** Der Mensch beginnt. Die Website lässt den jüngsten Spieler beginnen.
- **Mischen:** Fisher-Yates oder ein gleichwertiges Verfahren.
- **Verdeckte Information:** Handkarten und geheime Aufgabe der KI-Gegner sind für
  den Menschen nie sichtbar, auch nicht mittelbar über angebotene Aktionen.
  Ausnahme ist die Farbkarte, die ein Spieler für Risiko-Aktion 2
  benennt: Sie ist eine offene Ansage (D52, D77). Ebenso offen ist die Karte,
  die beim Ausspielen einer Risiko-Belohnungs-Karte vom Nachziehstapel
  aufgedeckt wird, auch wenn sie danach auf die Hand eines Gegners kommt
  (A8.2; Entscheid des Autors vom 27.11.2026).
- **„Schlangenspass!":** wird nicht gerufen. Das Spiel erkennt eine erfüllte
  Aufgabe selbst und zeigt sie sichtbar an.
- **Ansage (A6):** Die „klare Ansage" ist digital die Auswahl von Karte und Ziel
  vor dem Ausführen. Danach lässt sich das Ziel nicht mehr wechseln.
- **Unerlaubte Aktionen:** werden nicht angeboten. Lehnt das Spiel eine Aktion
  dennoch ab, zeigt die Oberfläche den Grund auf Deutsch.
- **Zeit:** Es gibt kein Zeitlimit.

## Teil C — Abweichungen der heutigen Engine von Teil A

Arbeitsliste, Stand 24.11.2026. Behoben und gestrichen: C5 und C22 (E1, 13.11.2026), C11 und C13 (E10, 13.11.2026), C3, C4 und C12 (E2, 20.11.2026), C7 (E3, 20.11.2026), C6 und C18 (E4, 21.11.2026), C8 und C17 (E6, 21.11.2026), C16 (E7, 21.11.2026), C2 (E5, 21.11.2026), C9 und C19 (E9, 21.11.2026), C1 bis auf die Aufgabenkarten (E11, 21.11.2026), C1, C15 und C20 (X1, 23.11.2026), C21 und C23 (X2b, 23.11.2026); C10 teilweise (X2b, X2c, 23.11.2026); C10 und C14 (X2a, 24.11.2026). Jede Zeile ist ein Fehler im Code, nicht in der
Website. Geprüft heißt: am Code gelesen, mit einem Test nachgestellt oder im
laufenden Spiel beobachtet.

Offene Abweichungen gibt es keine.

| Nr. | Thema | Website (Teil A) | Engine heute | Fundstelle |
|---|---|---|---|---|

Mit Teil A übereinstimmend geprüft: höchstens zwei Karten pro Zug (eine Farbkarte,
eine Sonderkarte), höchstens zwei Schlangen,
Handlimit 5, Abwehr nur mit Farbenschutz, Schlangenblockade an beliebiger
Stelle jeder Schlange, Joker in der Wertung (zählen als die Farbe mit den meisten
Punkten), Joker unterbrechen die längste Farbkette, mehrere Gruppen derselben
Farbe zählen je voll, Ablauf der Schlussrunde.

Nicht geprüft und deshalb nicht bewertet: Einzelheiten der KI unter `src/ki/`.
Teil C vergleicht nur die Engine mit Teil A; alle Teile der Erweiterung sind
umgesetzt (B1).

## Teil D — Offene Auslegungsfragen an den Autor

Hier kommen Stellen hin, die der Wortlaut der Website in zwei Richtungen lesen
lässt. Bis zur Antwort bleibt das heutige Verhalten stehen.

Offene Fragen gibt es keine. Der Autor hat alle Regelfragen aus
`docs/UMSETZUNGSPLAN.md`, Abschnitt 9, beantwortet; Fragen, Möglichkeiten und
Vorschläge stehen in `docs/REGELFRAGEN.md`.

### Beantwortet

Wo die Website es selbst sagt, steht die Fundstelle in Teil A; wo nicht, gilt
die Antwort, bis die Website sie aufnimmt („Website folgt“). Die Antworten zu
D1 und D8 hat der Autor am 12.11.2026 abends auf die Website übernommen, D9,
D10, D12, D13 und D19 am 13.11.2026 (Bundle `index-EH-TKokX.js`, Wortlaut in A5,
A6, A7.2 und A7.8). D11 steht ebenfalls auf der Website (A7.8). Was dort „keinen
weiteren Verdoppler“ heisst, präzisiert D23 nach einer Rückfrage vom 20.11.2026;
bei D11 und D23 steht deshalb „Website folgt“.
D14–D29 beantworten die Regelfragen F1–F15 und die Nachfrage F8a aus
`docs/REGELFRAGEN.md`, D31 die Frage G9 und D34–D55 die übrigen Fragen zur
Erweiterung, in der Reihenfolge G1–G8 und G10–G23. Für diese hat der Autor am
21.11.2026 mit einer Sammelantwort die Vorschläge des Orchestrators bestätigt.
D56–D57 sind Rückfragen aus der Umsetzung (Task X3), die der Autor am
22.11.2026 beantwortet hat; sie haben keine Nummer in `docs/REGELFRAGEN.md`.
D58–D67 sind Rückfragen aus den Prüfungen von X2 und X3 (D66 aus der Prüfung
dieses Nachtrags, P0.5g), die der Autor am 23.11.2026 beantwortet hat; auch
sie haben keine Nummer in `docs/REGELFRAGEN.md`. Eine Antwort vom selben Tag
ergänzt D48.
D68–D79 sind Rückfragen aus X4, X5, X6 und der Prüfung von P0.5g, die der
Autor am 24.11.2026 beantwortet hat; auch sie haben keine Nummer in
`docs/REGELFRAGEN.md`.
Die Nummer der Regelfrage steht vor der Frage. Die Spalte „Folge“ nennt dort
den Task, der die Antwort umsetzt.

| Nr. | Frage | Antwort | Folge | Datum |
|---|---|---|---|---|
| D1 | Zählen zwei getrennte Gruppen derselben Farbe beide? | Website geändert: Jede Gruppe zählt voll, auch über beide Schlangen; eine Vierergruppe nicht zusätzlich als Dreiergruppe. Für die längste Farbkette zählt nur die längste einzelne Kette (A11). | Engine stimmt überein | 12.11.2026 |
| D2 | Darf der Farbendieb Sonderkarten stehlen? | Nein, nur Farbkarten. | Engine stimmt überein | 12.11.2026 |
| D3 | Lila Riese: genügt eine Kette ab 3? | Website geändert: mindestens 5 violette Karten in einer Reihe (A9). | C14 | 12.11.2026 |
| D4 | Was gilt, wenn keine Sonderkarte spielbar ist? | Eine Sonderkarte muss gespielt werden, auch wenn sie wirkungslos ist. Pflicht ist mindestens eine Karte pro Zug. | C12 | 12.11.2026 |
| D5 | Neu aufgedeckte Aufgabe im selben Zug? | Darf sofort eingelöst werden. | C15 | 12.11.2026 |
| D6 | Zählt der Verdoppler zu den drei Karten? | Website geändert: nein, neben dem Verdoppler bis zu 3 Karten in zwei Zügen (A5, A7.8). | C7 | 12.11.2026 |
| D7 | Umfang der Erweiterung? | Alle Teile; vor der Partie wählbar mit oder ohne Erweiterung. | B1 | 12.11.2026 |
| D8 | Wer legt die Farbe eines Jokers fest, und wann? | Website geändert: Die Farbe ist nie festgelegt. Bei jeder Aufgabe zählt der Joker als die Farbe, mit der sie erfüllt ist, bei der Wertung als die Farbe mit den meisten Punkten (A7.3, A7.7, A9, A11). | C10 | 12.11.2026 |
| D9 | Darf man Karten in gegnerische Schlangen spielen? | Ja, jede Karte in jede Schlange: Farbkarten an ein Ende, Sonderkarten an beliebiger Stelle. Eine Regenbogenschlange beim Gegner ist erlaubt, nützt aber ihm. Website übernommen am 13.11.2026. | C19 | 12.11.2026 |
| D10 | Wogegen wirkt Farbenschutz? | Gegen jede Sonderkarte eines Gegners, die mich oder meine Schlange trifft, auch Farbenfusion, Schlangenhäutung und Regenbogenschlange. Gegen Farbkarten gibt es keine Abwehr. Website übernommen am 13.11.2026. | C6 | 12.11.2026 |
| D11 | Gibt ein Verdoppler im zweiten Zug einen dritten Zug? | Nein, nur ein Verdoppler pro Runde. Website folgt. | C7 | 12.11.2026 |
| D12 | Muss man eine Farbkarte spielen, wenn man eine hat? | Nein. Mindestens eine, höchstens zwei Karten, davon höchstens eine Farbkarte und eine Sonderkarte; eine Karte genügt, egal welcher Art. Website übernommen am 13.11.2026. | C12 | 12.11.2026 |
| D13 | Darf man eine Sonderkarte spielen, die einem nichts bringt? | Ja, jederzeit, auch wenn man eine Farbkarte hätte. Hat sie kein mögliches Ziel, kommt sie wirkungslos auf den eigenen Ablagestapel und zählt als Sonderkarte des Zuges. Website übernommen am 13.11.2026. | C12 | 12.11.2026 |
| D14 | F1: Treffen zwei Schlangengruben denselben Spieler, bevor er ausgesetzt hat: setzt er einen oder zwei Züge aus? | Zwei Züge: Jede Schlangengrube kostet einen eigenen Zug und bleibt vor ihm liegen, bis er für sie ausgesetzt hat. Website folgt. | E4 | 13.11.2026 |
| D15 | F2: Schlangenfrass c) frisst zwei Karten **desselben** Spielers: Wehrt ein Farbenschutz beide ab? | Ja: Ein Farbenschutz wehrt den ganzen Schlangenfrass für diesen Spieler ab, beide Karten bleiben liegen. Website folgt. | E6 | 13.11.2026 |
| D16 | F3: Kann eine Sonderkarte (etwa die Regenbogenschlange) eine neue Schlange beginnen? | Nein, nur eine Farbkarte beginnt eine Schlange. Regenbogenschlange und Schlangenblockade brauchen eine bestehende Schlange. Website folgt. | E5 | 13.11.2026 |
| D17 | F4: Farbendieb: Muss die gestohlene Karte in eine eigene Schlange, oder darf sie nach D9 in jede? Was gilt, wenn der Dieb keine Schlange hat? | Nur in eine eigene Schlange, an eine beliebige Stelle. Hat der Dieb keine Schlange, beginnt die gestohlene Karte eine neue eigene Schlange. Website folgt. | E8 | 13.11.2026 |
| D18 | F5: Füllt ein aussetzender Spieler seine Hand auf? Darf er mit Farbenschutz reagieren? | Kein Auffüllen im ausgesetzten Zug; er füllt erst zu Beginn seines nächsten gespielten Zuges auf. Abwehr mit Farbenschutz bleibt erlaubt, auch zwischen Grube und ausgesetztem Zug. Website folgt. | E2, E4 | 13.11.2026 |
| D19 | F6: Farbkarte beim Gegner: nur an bestehende Schlangen, oder darf man ihm auch eine neue beginnen? | Nur an ein Ende einer bestehenden gegnerischen Schlange. Eine neue Schlange beginnt jeder nur für sich selbst. Website übernommen am 13.11.2026. | E5 | 13.11.2026 |
| D20 | F7: Farbenfusion: Gelten eine Farbkarte und eine Regenbogenschlange als „zwei Karten gleicher Farbe"? | Nein, nur zwei Farbkarten derselben Farbe dürfen fusioniert werden. Website folgt. | E7 | 13.11.2026 |
| D21 | F8: Verfällt der letzte Zug eines Spielers, der in der Schlussrunde aussetzen muss? Darf man die Schlangengrube auf jemanden spielen, der keinen Zug mehr hat? | Ja, der letzte Zug verfällt. Die Schlangengrube darf auch in der Schlussrunde gespielt werden; trifft sie einen Spieler, der noch einen Zug hätte, setzt er aus und hat keinen letzten Zug mehr. Er darf sich mit Farbenschutz verteidigen. Wortlaut: „man darf auch in der letzten Runde einen Spieler aussetzen lassen. Er hat dann keinen letzetn Zug mehr. Er darf aber verteidigen mit Farbenschutz“. Ob die Grube einen Spieler treffen darf, der keinen Zug mehr hat, beantwortet D29 (Nachfrage F8a). Website folgt. | E2, E4 | 13.11.2026 |
| D22 | F9: Gleichstand bei den Punkten: geteilter Sieg? | Ja, alle Punktgleichen gewinnen. Website folgt. | E10 | 13.11.2026 |
| D23 | F10: Verdoppler im zweiten Zug: Darf er wirkungslos abgelegt werden? | Ja: Im zweiten Zug darf er wirkungslos auf den eigenen Ablagestapel; er zählt als Sonderkarte dieses Zuges, ein weiterer Zug folgt nicht. Rückfrage vom 20.11.2026 zu A7.8, nach dem man im zweiten Zug keinen weiteren Verdoppler spielen darf, und zum Fall, dass im zweiten Zug nur Verdoppler auf der Hand sind. Wortlaut: „Ja, wirkungslos“. A7.8 heisst also: kein weiterer Verdoppler mit Wirkung, kein weiterer Zug. Website folgt. | E3 | 13.11.2026 |
| D24 | F11: Längste Farbkette: Gibt es eine Mindestlänge? Was gilt bei lauter Einzelkarten und für Spieler ohne Schlange? | Eine Kette zählt erst ab 3 Farbkarten derselben Farbe nebeneinander, nicht schon ab 2; Sonderkarten zählen nicht mit und unterbrechen sie (A11). Hat niemand eine solche Kette, bekommt niemand den Bonus; wer keine hat, bekommt ihn nie. Wortlaut: „längste Schlange muss mindestens aus 3 Farbkarten bestehen nicht nur 2. sonst ok“; auf die Rückfrage „Bonus erst ab 3 gleichfarbigen Karten in einer ununterbrochenen Reihe, also Rot-Rot noch nicht, Rot-Rot-Rot schon?“ bestätigt am 13.11.2026: „Ja, genau so“. Website folgt. | E10 | 13.11.2026 |
| D25 | F12: Darf man eine Sonderkarte, die ein mögliches Ziel hätte, trotzdem ohne Wirkung ablegen? | Nein. Wirkungslos ablegen geht nur, wenn die Karte kein mögliches Ziel hat; ein Farbenschutz darf immer wirkungslos abgelegt werden. Website folgt. | E2 | 13.11.2026 |
| D26 | F13: Schlangenhäutung: Muss sich die Reihenfolge ändern? | Ja, die Farbfolge im Abschnitt muss danach anders sein; eine unveränderte Anordnung wird abgelehnt. Website folgt. | E9 | 13.11.2026 |
| D27 | F14: „Pro Zug nur eine Farbenfusion": Darf im zweiten Zug nach einem Verdoppler eine weitere gespielt werden? | Ja, je Zug eine: Im zweiten Zug nach einem Verdoppler ist wieder eine Farbenfusion erlaubt. Website folgt. | E7 | 13.11.2026 |
| D28 | F15: Sind die Ablagestapel für alle vollständig einsehbar, oder nur die oberste Karte? | Alle Ablagestapel sind für alle vollständig einsehbar. Website folgt. | K1 | 13.11.2026 |
| D29 | F8a: Darf man die Schlangengrube auf einen Spieler spielen, der seinen letzten Zug schon gemacht hat? | Ja, erlaubt: Die Grube darf ihn treffen und geht ohne Wirkung auf den Ablagestapel. Wortlaut: „Ja, ohne Wirkung“. Website folgt. | E4 | 13.11.2026 |
| D30 | Wert einer Farbenfusion in einer Gruppe: wie eine Karte der Gruppenfarbe, oder die Summe der beiden Karten darunter? | Die Summe der beiden Karten darunter, nicht der Wert einer Karte der Gruppenfarbe. Gefragt mit dem Beispiel „zwei grüne Karten je 3 → 6 bei a, 10 bei b“. Wortlaut: „Summe darunter“. Präzisierung vom 20.11.2026, Wortlaut: „1. Bei einer Fusion vervollständigen die beiden zusammen gelegten Karten die Dreierreihe. Die jeweiligen 2 Karten allein würden ja sonst gar nicht zählen. Durch die Fusion von zwei Karten zahlt es als Dreierreihe. Bei der Schlusswertung zählen dann auch die Werte der Farbkarten die unter der Fusion liegen.“ Die Fusion belegt also einen Platz in der Gruppe und bringt die Summe der Karten darunter. Beispiel: Regenbogenschlange, Farbenfusion aus Grün und Grün, Regenbogenschlange: eine Gruppe mit 6 Punkten (D31). So sagen es auch A7.7 („Bringt die Punkte beider fusionierter Karten“) und A11; die Rechnung in A11, Beispiel 2 („[3 × 2 Punkte]“), lässt beide Lesarten zu, weil zwei blaue Karten zusammen so viel bringen wie eine violette. Website folgt. Rückfrage vom 20.11.2026 „Bildet eine Fusion über zwei Roten allein schon eine rote Dreiergruppe?“, Wortlaut: „Nein, braucht 2 weitere“ (wie A7.7: die Fusion zählt als eine einzelne Karte). | E10 (die Wertung rechnet bereits so) | 20.11.2026 |
| D31 | G9: Zählt eine Gruppe nur aus Jokern (drei nebeneinander) für Vielfaltbonus und „Farbharmonie"? | Ja: Drei Joker nebeneinander sind eine gültige Gruppe einer frei wählbaren Farbe, für die Gruppenpunkte, für den Vielfaltbonus und für „Farbharmonie“, etwa drei Regenbogenschlangen in Folge oder zwei Regenbogenschlangen und eine Farbenfusion. Gefragt als „Bilden drei Joker nebeneinander allein eine Farbgruppe?“. Wortlaut: „Ja, als Gruppe“. Präzisierung vom 20.11.2026, Wortlaut: „2. Drei Joker nebeneinander zählen zwar als farbreihe aber eine Regenbogenschlange zählt ja nicht für die Wertung. Man dürfte aber durchaus eine farbfusion und Regenbogen mischen. Sobald es mindestens drei Karten sind zählen dann wie im Beispiel zuvor die Kartenwerte unter der Fusion.“ Also: Drei Regenbogenschlangen nebeneinander: eine Gruppe mit 0 Punkten; Regenbogenschlange, Farbenfusion aus Grün und Grün, Regenbogenschlange: eine Gruppe mit 6 Punkten. Für den Vielfaltbonus schränkt D32 das ein. Website folgt. | E10 (die Wertung rechnet bereits so), X2 | 20.11.2026 |
| D32 | Zählt eine Gruppe nur aus Regenbogenschlangen beim Vielfaltbonus als eigene Farbe? | Nein: Eine Gruppe nur aus Regenbogenschlangen bringt keine Farbe für den Vielfaltbonus. Gefragt als „Zählt eine reine Joker-Gruppe (z. B. drei Regenbogenschlangen) beim Vielfaltbonus als eigene Farbe?“. Wortlaut: „Nein. Eine Regenbogenschlange zählt nicht beim Vielfalt Bonus“. Für die Gruppenwertung bleibt sie eine Gruppe mit 0 Punkten (D31). In einer Gruppe mit Farbkarten zählt die Regenbogenschlange weiter als deren Farbe, so wie Rot, Regenbogenschlange, Rot in A11 (Vielfalt, Beispiel 2) eine rote Gruppe ist. Rückfrage vom 20.11.2026 „Zählt Regenbogenschlange, Farbenfusion aus Grün und Grün, Regenbogenschlange beim Vielfaltbonus als Grün oder gar nicht?“, Wortlaut: „Zählt als grün.“ Eine Gruppe aus Regenbogenschlangen und einer Farbenfusion zählt also beim Vielfaltbonus als Farbe. Zu „Farbharmonie“ sagt die Antwort nichts, dort steht weiter D31. Website folgt. | E10b | 20.11.2026 |
| D33 | Wer wird bei einer angesagten Sonderkarte gefragt: nur, wer Farbenschutz hält, oder jeder Betroffene? | Jeder Betroffene wird gefragt, im Uhrzeigersinn ab dem Angreifer, jeder einmal (A6). Abwehren wird nur angeboten, wer Farbenschutz hält; wer keinen hält, kann nur durchlassen. So verrät die Frage keine Handkarte (B2): Fragte die Engine allein die Spieler mit Farbenschutz, sähe der Angreifer schon an der offenen Frage, dass das Ziel einen hält. Digitale Festlegung, Entscheidung des Autors vom 21.11.2026: Gefragt als „Soll beim Ausspielen einer Sonderkarte jeder Betroffene gefragt werden (B, verrät nichts), oder nur wer Farbenschutz hält (A)?“, Wortlaut: „B“; die Website beschreibt das Spiel am Tisch und sagt dazu nichts. | E4 | 21.11.2026 |
| D34 | G1: Ohne Erweiterung gibt es keine Aufgaben, keine Schlangenhäutung, keinen Vielfaltbonus (ein Schalter für alles). Richtig? | Ja, ein Schalter für die ganze Erweiterung: Ohne Erweiterung gibt es keine Aufgaben, keine Schlangenhäutung, keinen Schlangenkorb, keine Comeback- und Risiko-Karten und keinen Vielfaltbonus. Die Lobby hat genau einen Schalter. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X1 | 21.11.2026 |
| D35 | G2: Geheime Aufgabe: Zählt sie, sobald sie in einem eigenen Zug einmal erfüllt war, oder muss sie am Spielende erfüllt sein? | Die geheime Aufgabe zählt, sobald sie einmal in einem eigenen Zug erfüllt war, wie eine offene Aufgabe; das Spiel merkt sich das verdeckt. Ein Gegner kann sie danach nicht mehr zerstören. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X1 | 21.11.2026 |
| D36 | G3: Zählen für „Schlangenmeister" und „Schlangenrepertoire" als „ausgespielt": ein zur Abwehr gespielter Farbenschutz, eine wirkungslos abgelegte und eine abgewehrte Sonderkarte, der Schlangenkorb? | Für „Schlangenmeister“ und „Schlangenrepertoire“ zählt als ausgespielt jede Sonderkarte, die der Spieler aus der Hand gespielt hat: auch ein Farbenschutz zur Abwehr, eine wirkungslos abgelegte, eine abgewehrte und der Schlangenkorb. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X2 | 21.11.2026 |
| D37 | G4: „Schlangentanz": Zählt nur eine Schlangenhäutung in der eigenen Schlange? Dürfen die zwei Gruppen aus zwei Häutungen stammen? | Für „Schlangentanz“ zählt nur eine Schlangenhäutung, die der Spieler selbst in einer eigenen Schlange spielt; eine Häutung in einer gegnerischen Schlange erfüllt die Aufgabe für niemanden. Beide Dreiergruppen müssen aus derselben Häutung entstehen, wie im Beispiel. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X2 | 21.11.2026 |
| D38 | G5: „Vielfaltskönig" und „Farbenpracht": Braucht es zwei Schlangen, oder genügt eine? | „Vielfaltskönig“ braucht zwei Schlangen mit je mindestens vier Farben. Bei „Farbenpracht“ wird über alle vorhandenen Schlangen gezählt; eine genügt, wenn sie von jeder Farbe zwei Karten hat. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X2 | 21.11.2026 |
| D39 | G6: „Symmetriemeister": Muss die Kartenzahl gerade sein? Dürfen Joker oder andere Sonderkarten in der Schlange liegen? | „Symmetriemeister“: Auch eine ungerade Kartenzahl ist erlaubt; die mittlere Karte ist die Achse und gehört zu keiner Hälfte. Joker zählen als die passende Farbe; liegt eine andere Sonderkarte (etwa eine Blockade) in der Schlange, ist die Aufgabe nicht erfüllt. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X2 (C23) | 21.11.2026 |
| D40 | G7: „Schlangenbändiger": Muss das Muster zweimal direkt hintereinander liegen (ABCABC)? | „Schlangenbändiger“: Das Muster liegt mindestens zweimal direkt hintereinander. Es ist eine beliebige Kartenfolge mit mindestens drei verschiedenen Farben, also ABCABC, aber auch AABCAABC. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X2 | 21.11.2026 |
| D41 | G8: „Farbkombination": Müssen die fünf Karten nebeneinander liegen? Zählen Joker bei „Gelber Schatz" und „Lila Riese" mit? | „Farbkombination“: Fünf Karten gleicher Farbe irgendwo in derselben Schlange genügen; auch getrennte Gruppen derselben Farbe zählen zusammen. Bei „Gelber Schatz“ und „Lila Riese“ zählen Joker mit, als Gelb beziehungsweise Violett; eine Farbenfusion zählt als eine Karte. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X2 | 21.11.2026 |
| D42 | G10: Schlangenkorb: Liegt er auf der Hand (zählt zu den 5)? Kostet sein Einsatz die Sonderkarte des Zuges? Sind die vier Beispiele die vollständige Liste der Effekte? | Der Schlangenkorb liegt auf der Hand und zählt zu den 5 Handkarten. Sein Einsatz ist die Sonderkarte des Zuges; daneben ist keine weitere Sonderkarte erlaubt. Die vier genannten Boni sind die vollständige Liste. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X6 | 21.11.2026 |
| D43 | G11: „Ziehe 3 Karten und spiele sofort bis zu 2 davon": zusätzlich zu den Karten des Zuges, beliebige Arten, auch ein gezogener Verdoppler? Was bei weniger als 3 Karten im Stapel? | Korb „Ziehe 3, spiele bis zu 2“: Die bis zu 2 Karten kommen zusätzlich zu den Karten des Zuges, in beliebiger Art, auch zwei Farbkarten oder zwei Sonderkarten. Ein so gezogener Verdoppler darf nicht mit Wirkung gespielt werden, weil der Korb schon den Zug erweitert (A7.8). Liegen weniger als 3 Karten im Stapel, zieht man, was da ist; wer so die letzte Karte zieht, spielt seinen Zug zu Ende, dann beginnt die Schlussrunde (A10). Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X6 | 21.11.2026 |
| D44 | G12: „Tausche bis zu 2 Karten aus deiner Schlange mit Handkarten": beliebige Karten, gleicher Platz, getauschte Karte auf die Hand? | Korb „Tausche bis zu 2 Karten“: Getauscht werden nur Farbkarten gegen Farbkarten. Die Handkarte kommt an den Platz der getauschten Karte, die getauschte Karte kommt auf die Hand; die Handgrösse bleibt gleich. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X6 | 21.11.2026 |
| D45 | G13: „Sonderkarte aus gegnerischer Schlange entfernen": welche Karten (auch Blockade), abwehrbar mit Farbenschutz, auf wessen Ablagestapel? | Korb „Sonderkarte aus gegnerischer Schlange entfernen“: Entfernt werden darf jede Sonderkarte, auch eine Schlangenblockade, eine Regenbogenschlange oder eine Farbenfusion, deren Karten dann wieder einzeln liegen. Der Gegner wird gefragt, der Effekt ist abwehrbar mit Farbenschutz (D10). Die entfernte Karte kommt auf den Ablagestapel des Spielers, der den Korb nutzt, wie gefressene Karten. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X6 | 21.11.2026 |
| D46 | G14: „Zwei zusätzliche Aktionen": dieselben drei Möglichkeiten wie bei der Comeback-Karte? Gelten die Grenzen (eine Farbkarte, eine Sonderkarte) dann nicht? Zweite Farbenfusion, zweiter Verdoppler? | Korb „Zwei zusätzliche Aktionen“: Es sind dieselben drei wie bei der Comeback-Karte. Sie kommen obendrauf, auch zweimal dieselbe Art (wie A8.1), also bis zu zwei weitere Farb- oder Sonderkarten im Zug. Eine zweite Farbenfusion ist nicht erlaubt; „pro Zug nur eine Farbenfusion“ gilt weiter. Ein Verdoppler als Zusatzaktion wirkt nicht, weil er nicht mit anderen zugerweiternden Effekten kombinierbar ist. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X3 | 21.11.2026 |
| D47 | G15: „Nicht mit anderen zugerweiternden Effekten kombinierbar": Schliessen sich Verdoppler, Comeback und Schlangenkorb im selben Zug aus? | Verdoppler, Comeback-Karte und die zugerweiternden Boni des Korbs („Ziehe 3, spiele bis zu 2“, „Zwei zusätzliche Aktionen“) schliessen sich gegenseitig aus; Risiko-Karten zählen nicht dazu. Je Zug gibt es höchstens eine dieser Erweiterungen. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X3 | 21.11.2026 |
| D48 | G16: Schlangenlänge für die Comeback-Bedingung: Zählt jede Karte eins, die Farbenfusion eins oder drei, ein Spieler ohne Schlange null? Ist die Karte später im Zug und im zweiten Zug nach Verdoppler einsetzbar? | Für die Comeback-Bedingung gilt: Jede Karte in der Schlange zählt eins, auch Sonderkarten; eine Farbenfusion samt ihren zwei Karten zählt eins. Ein Spieler ohne Schlange hat die Länge null; die Bedingung kann für ihn erfüllt sein. Die Bedingung wird zu Zugbeginn geprüft; ist sie erfüllt, darf die Karte irgendwann in diesem Zug eingesetzt werden, im zweiten Zug nach Verdoppler nur, wenn G15 das zulässt (D47). Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Rückfrage vom 23.11.2026: Weil sich Verdoppler, Comeback-Karte und die zugerweiternden Boni des Korbs ausschliessen (D47), ist die Comeback-Karte im zweiten Zug nach einem Verdoppler nie einsetzbar. Antwort des Autors, gewählte Möglichkeit: „Ja, nie möglich“. Website folgt. | X4 | 21.11.2026 |
| D49 | G17: „Zwei Karten abwerfen, drei ziehen": mit weniger als zwei Handkarten, bei weniger als drei im Stapel, in der Schlussrunde, zweimal? | Comeback-Aktion „Zwei Karten abwerfen, drei ziehen“: Mit weniger als zwei Handkarten ist sie nicht wählbar: Wer nur eine Karte hält, wählt eine andere Zusatzaktion. Liegen weniger als drei Karten im Stapel, zieht man, was da ist; wer die letzte Karte zieht, spielt seinen Zug zu Ende, dann beginnt die Schlussrunde (A10). In der Schlussrunde ist sie nicht wählbar, weil nichts gezogen werden kann. Zweimal in einem Zug ist sie erlaubt, wie A8.1 es für alle Zusatzaktionen sagt. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X4 | 21.11.2026 |
| D50 | G18: „Pro Runde eine Risiko-Karte": pro eigenem Zug? Gilt der zweite Zug nach Verdoppler als neue Runde? | Eine Runde ist der eigene Zug samt zweitem Zug nach einem Verdoppler; darin ist höchstens eine Risiko-Karte erlaubt. Ein Verdoppler gibt keine zweite Risiko-Karte. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X5 | 21.11.2026 |
| D51 | G19: Wohin kommt die aufgedeckte Karte bei Aktion 2 (Misserfolg), Aktion 3 (Erfolg, samt der ersetzten Schlangenkarte) und Aktion 4 (beide Fälle)? | Risiko-Aktion 2, Misserfolg: Die aufgedeckte Sonderkarte kommt auf den eigenen Ablagestapel, wie bei Aktion 3; der Spieler verliert die Karte. Risiko-Aktion 3, Erfolg: Die aufgedeckte Farbkarte kommt auf die eigene Hand, wie bei den Aktionen 1 und 2. Die ersetzte Schlangenkarte kommt ebenfalls auf die eigene Hand; es ist ein Tausch. Risiko-Aktion 4: Die aufgedeckte Karte kommt bei Erfolg auf die eigene Hand, bei Misserfolg auf den eigenen Ablagestapel. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X5 | 21.11.2026 |
| D52 | G20: Aktion 2: Muss die „geplante Farbkarte" vorher benannt werden? Wer wählt bei Misserfolg zwischen ihr und der obersten Stapelkarte? Was gilt ohne Farbkarte auf der Hand? Nur eigene Schlange? | Risiko-Aktion 2: Vor dem Aufdecken benennt der Spieler eine Farbkarte seiner Hand, wie bei Aktion 3. Bei Misserfolg wählt der begünstigte Gegner zwischen der geplanten Farbkarte und der obersten Stapelkarte. Ohne Farbkarte auf der Hand ist Aktion 2 nicht wählbar. Die zusätzliche Farbkarte kommt nur an ein Ende einer eigenen Schlange; für diese Aktion gilt D9 nicht. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X5 | 21.11.2026 |
| D53 | G21: Aktion 3: Welche Handkarte darf ersetzen, und wird bei „anderer Punktewert" die aufgedeckte Karte vor oder nach der gewählten Karte eingefügt? | Risiko-Aktion 3: Ersetzen darf jede Farbkarte der Hand. Bei anderem Punktewert wählt der Spieler, ob er die zusätzliche Karte davor oder dahinter legt. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X5 | 21.11.2026 |
| D54 | G22: Aktion 4: Zählt die aufgedeckte Karte zu den „zwei Karten vom Nachziehstapel"? Was bei leerem Ablagestapel? Wie kann eine Risiko-Karte auf einem Ablagestapel liegen, wenn sie aus dem Spiel kommt? | Risiko-Aktion 4: Bei Erfolg ist die aufgedeckte Karte die erste der zwei Karten; der Spieler zieht eine weitere. Ist der eigene Ablagestapel leer, bleibt nur die andere Möglichkeit: Bei Erfolg zieht der Spieler vom Nachziehstapel, bei Misserfolg der Gegner die oberste Karte. Risiko-Karte und Schlangenkorb kommen nach der Nutzung aus dem Spiel und liegen nie auf einem Ablagestapel; der Satz dazu in A8.2 ist nur eine Klarstellung. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Präzisiert durch D69 (24.11.2026): „Nie auf einem Ablagestapel“ gilt für die genutzte Karte; ein ungenutzt abgeworfener Schlangenkorb liegt auf dem Ablagestapel, und dort greift der Satz aus A8.2, dass er nicht vom Ablagestapel genommen werden kann. Website folgt. | X5 | 21.11.2026 |
| D55 | G23: Ist eine Risiko-Karte bei leerem Stapel oder in der Schlussrunde spielbar? Wer löst die Schlussrunde aus, wenn ein Effekt oder ein Gegner die letzte Karte nimmt? | Bei leerem Stapel und in der Schlussrunde ist eine Risiko-Karte nicht spielbar, weil keine Karte aufgedeckt werden kann. Die Schlussrunde löst der Spieler am Zug aus, gleich wer die letzte Karte nimmt (auch ein begünstigter Gegner); er spielt seinen Zug zu Ende, dann hat jeder andere noch einen Zug. Sammelantwort des Autors, Wortlaut: „ja zu deinen vorschlägen.“ Website folgt. | X5 | 21.11.2026 |
| D56 | Pro Zug ist nur eine Farbenfusion erlaubt: Verbraucht eine Farbenfusion, die ein Gegner mit Farbenschutz abwehrt, schon die Fusion des Zuges? | Ja: Wer eine Farbenfusion ausgespielt hat, hat die Fusion dieses Zuges verbraucht, auch wenn ein Gegner sie mit Farbenschutz abwehrt; eine zweite Farbenfusion ist in diesem Zug nicht möglich, auch nicht über eine Zusatzaktion (Schlangenkorb, Comeback-Karte). Antwort des Autors auf eine Rückfrage aus X3, gewählte Möglichkeit: „Ja, gespielt ist gespielt“. Website folgt. | X3 | 22.11.2026 |
| D57 | Zieht ein Spieler mitten in seinem Zug die letzte Karte vom Nachziehstapel (etwa über Schlangenkorb oder Comeback-Karte): Darf er die eben gezogenen Karten noch im selben Zug ausspielen? | Ja: Wer mitten in seinem Zug die letzte Karte vom Nachziehstapel zieht, etwa über Schlangenkorb oder Comeback-Karte, spielt seinen Zug zu Ende (A10) und darf dabei auch die eben gezogenen Karten einsetzen; danach beginnt die Schlussrunde. Das passt zu D43, D49 und D55. Antwort des Autors auf eine Rückfrage aus X3, gewählte Möglichkeit: „Ja, im selben Zug“. Der Satz in A10 „Seine zuletzt gezogenen Karten kann er nur noch ausserhalb seines Zuges einsetzen“ meint die Karten, die er beim Auffüllen am Ende seines Zuges zieht (A5, „Zug beenden“); danach folgt kein Zug mehr. D57 regelt den anderen Fall, dass er mitten im Zug über eine Erweiterung zieht; beim Schlangenkorb verlangt A7.10 selbst, sofort auszuspielen („Ziehe 3 zusätzliche Karten und spiele sofort bis zu 2 davon aus“). Zieht er die letzte Karte beim Auffüllen zwischen den beiden Zügen eines Verdopplers, spielt er den zweiten Zug noch, der wie ein normaler Zug abläuft (A7.8: „Du füllst deine Handkarten auf und spielst sofort einen zweiten Zug“). Die Website soll A10 mit D57 klarstellen. Website folgt. | X3 | 22.11.2026 |
| D58 | „Farbvielfalt“ („Bilde eine Kette aus je einer Karte aller 6 Farben.“): Darf eine Farbe in der Kette doppelt liegen, etwa Blau, Rot, Rot, Gelb, Braun, Violett, Grün? | Nein: Die Kette für „Farbvielfalt“ besteht aus sechs Karten direkt hintereinander in einer Schlange, jede Farbe genau einmal. Blau, Rot, Rot, Gelb, Braun, Violett, Grün erfüllt die Aufgabe nicht, ebenso wenig Blau, Rot, Gelb, Rot, Braun, Violett, Grün. Ein Joker zählt in der Kette als die Farbe, die noch fehlt (A9, Beispiel). Antwort des Autors auf eine Rückfrage aus X2, gewählte Möglichkeit: „Nein, je genau einmal“. Website folgt. | X2 | 23.11.2026 |
| D59 | „Farbenpracht“ („Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen.“): Wird die Bedingung nach jeder Aktion geprüft oder nur am Ende des eigenen Zuges? | Nur am Ende des eigenen Zuges, nicht nach jeder Aktion: Wer die Bedingung von „Farbenpracht“ mitten im Zug erfüllt und im selben Zug wieder zerstört, bekommt die Aufgabe nicht. Das gilt nur für „Farbenpracht“, deren Kartentext das Zugende nennt; die übrigen Aufgaben prüft das Spiel weiter nach A9 („sobald ein Spieler die Bedingungen erfüllt und am Zug ist“). Als geheime Aufgabe zählt „Farbenpracht“ damit, sobald sie an einem eigenen Zugende erfüllt war (D35). Über wie viele Schlangen gezählt wird, regelt D38. Antwort des Autors auf eine Rückfrage aus X2, gewählte Möglichkeit: „Nur am Zugende“. Website folgt. | X2 | 23.11.2026 |
| D60 | „Farbenpracht“ nennt auch das Ende des Spiels: Wird bei Spielende zusätzlich für jeden Spieler geprüft, auch für den, der nicht am Zug ist? | Nein: Bei Spielende gibt es für „Farbenpracht“ keine zusätzliche Prüfung für die anderen Spieler; es genügt das Ende des letzten eigenen Zuges (D59). Die Worte „am Ende des Spiels“ im Kartentext heissen also: am Ende des letzten eigenen Zuges. Legt ein Gegner danach noch die fehlende Karte in die eigene Schlange (D9), bringt das „Farbenpracht“ nicht mehr. Antwort des Autors auf eine Rückfrage aus X2, gewählte Möglichkeit: „Nur eigenes Zugende“. Website folgt. | X2 | 23.11.2026 |
| D61 | Zählen Joker bei „Gelber Schatz“, „Lila Riese“, „Farbkombination“ und „Farbenpracht“ auch dann, wenn eine Reihe nur aus Jokern besteht (Regenbogenschlangen und Farbenfusionen, ohne Farbkarte der Farbe)? | Ja: Bei „Gelber Schatz“, „Lila Riese“, „Farbkombination“ und „Farbenpracht“ zählen Joker immer als die Farbe der Aufgabe, auch wenn eine Reihe nur aus Jokern besteht und keine Farbkarte dieser Farbe enthält; bei „Farbenpracht“ dürfen also auch beide Karten einer Farbe Joker sein. Eine Farbenfusion zählt dabei als eine Karte (D41). Das führt D41 weiter und passt zu D31; die Einschränkung aus D32 gilt nur für den Vielfaltbonus. Antwort des Autors auf eine Rückfrage aus X2, gewählte Möglichkeit: „Ja, Joker zählen immer“. Website folgt. | X2 | 23.11.2026 |
| D62 | „Schlangentanz“ („Bilde durch Schlangenhäutung 2 neue Dreiergruppen.“): Wann ist eine Dreiergruppe nach der Häutung „neu“? | Neu ist jede Dreiergruppe nach der Häutung, in der keine Gruppe von vor der Häutung weiterlebt. Löst eine Häutung eine Dreiergruppe auf und bildet zwei neue, ist „Schlangentanz“ erfüllt; es zählt nicht die Zahl der Gruppen nachher abzüglich der Zahl vorher. Eine Gruppe, die nur verlängert wurde, ist nicht neu. Wessen Häutung zählt und dass beide Gruppen aus derselben Häutung stammen, regelt D37. Antwort des Autors auf eine Rückfrage aus X2, gewählte Möglichkeit: „Jede neu entstandene“. Website folgt. | X2 | 23.11.2026 |
| D63 | „Schlangentanz“: Muss die Häutung mit zwei neuen Dreiergruppen in dem Zug liegen, in dem der Spieler die Aufgabe einlöst, oder genügt eine frühere Häutung? | Eine frühere Häutung genügt: Hat der Spieler einmal mit einer Schlangenhäutung zwei neue Dreiergruppen gebildet (D37, D62), gilt das für „Schlangentanz“ die ganze Partie; die Häutung muss nicht im Zug des Einlösens liegen. Die beiden Gruppen müssen beim Einlösen nicht mehr liegen; hat ein Gegner eine davon zerstört, zählt die Häutung trotzdem. Wird „Schlangentanz“ erst danach aufgedeckt, löst er die Aufgabe ein, sobald er am Zug ist (A9). Antwort des Autors auf eine Rückfrage aus X2, gewählte Möglichkeit: „Gilt die ganze Partie“. Website folgt. | X2 | 23.11.2026 |
| D64 | „Schlangenmeister“ („Habe min. 2 versch. Sonderkarten in deinen Schlangen und spiele min. 4 aus.“): Heisst „2 versch. Sonderkarten“ zwei verschiedene Arten, und zählt eine Schlangenblockade mit, die ein Gegner in die eigene Schlange gelegt hat? | Ja: „2 versch. Sonderkarten“ heisst zwei verschiedene Arten von Sonderkarten in den eigenen Schlangen; zwei Regenbogenschlangen genügen nicht, eine Regenbogenschlange und eine Farbenfusion schon. Eine Schlangenblockade, die ein Gegner in die eigene Schlange gelegt hat, zählt mit. Was als ausgespielt zählt, regelt D36. Antwort des Autors auf eine Rückfrage aus X2, gewählte Möglichkeit: „Zwei Arten“. Website folgt. | X2 | 23.11.2026 |
| D65 | Pro Zug ist nur eine Farbenfusion erlaubt: Verbraucht auch eine Farbenfusion, die wirkungslos abgelegt wird, weil sie kein mögliches Ziel hat (D25), die Fusion des Zuges? | Ja: Auch eine Farbenfusion, die wirkungslos auf den eigenen Ablagestapel kommt, weil sie kein mögliches Ziel hat (D13, D25), verbraucht die Fusion dieses Zuges, wie eine abgewehrte (D56); eine zweite Farbenfusion ist in diesem Zug nicht möglich. Das passt zu D36, nach dem eine wirkungslos abgelegte Sonderkarte als ausgespielt zählt. Antwort des Autors auf eine Rückfrage aus X3, gewählte Möglichkeit: „Ja, verbraucht“. Website folgt. | X3 | 23.11.2026 |
| D66 | „Farbenpracht“ nach einem Verdoppler: Wird am Ende des ersten Zuges geprüft oder erst nach dem zweiten? | Am Ende jedes der zwei Züge: Nach einem Verdoppler wird „Farbenpracht“ am Ende des ersten und am Ende des zweiten Zuges geprüft, denn A7.8 sagt „Damit ist dein erster Zug beendet“. Ist die Bedingung am Ende des ersten Zuges erfüllt, bekommt der Spieler die Aufgabe dort. Das ergänzt D59. Antwort des Autors auf eine Rückfrage aus X2, gewählte Möglichkeit: „Nach jedem der zwei“. Website folgt. | X2 | 23.11.2026 |
| D67 | „Farbharmonie“ („Habe in deinen Schlangen mindestens eine Dreiergruppe jeder Farbe.“): Zählt eine Vierer- oder Fünfergruppe als „Dreiergruppe“ ihrer Farbe? | Ja: Für „Farbharmonie“ zählt jede Farbgruppe ab drei Karten als Dreiergruppe ihrer Farbe, auch eine Vierer- oder Fünfergruppe; eine Farbgruppe besteht nach A11 aus mindestens drei nebeneinanderliegenden Karten derselben Farbe. Dass eine Vierergruppe in der Wertung nicht zusätzlich als Dreiergruppe zählt (A11), betrifft nur die Punkte. Für Gruppen nur aus Jokern gilt D31. Antwort des Autors auf eine Rückfrage aus X2, gewählte Möglichkeit: „Ja, ab drei Karten“. Website folgt. | X2 | 23.11.2026 |
| D68 | Comeback-Karte: Darf der Spieler mit der Zusatzaktion „Eine Sonderkarte aus der Hand ausspielen“ eine Sonderkarte wirkungslos ablegen, etwa einen Farbenschutz? | Ja: Auch mit der Zusatzaktion „Eine Sonderkarte aus der Hand ausspielen“ der Comeback-Karte darf der Spieler eine Sonderkarte wirkungslos auf den eigenen Ablagestapel legen, etwa einen Farbenschutz. Wann das geht, regelt D25 wie für die Sonderkarte des Zuges; ein Farbenschutz darf immer wirkungslos abgelegt werden. Für „Schlangenmeister“ und „Schlangenrepertoire“ zählt die so abgelegte Karte als ausgespielt (D36). Dasselbe gilt für die Zusatzaktionen des Schlangenkorbs, denn nach D46 sind es „dieselben drei wie bei der Comeback-Karte“. Antwort des Autors auf eine Rückfrage aus X4, gewählte Möglichkeit: „Ja, erlaubt“. Website folgt. | X4 | 24.11.2026 |
| D69 | Schlangenkorb: Wohin kommt er, wenn der Spieler ihn ungenutzt abwirft, als überzählige Karte am Zugende (A5) oder über die Comeback-Aktion „Zwei Karten abwerfen, drei ziehen“? | Auf den Ablagestapel: Wirft der Spieler den Schlangenkorb ungenutzt ab, als überzählige Karte am Ende seines Zuges (A5) oder über „Zwei Karten abwerfen, drei ziehen“ (D49), kommt er wie jede abgeworfene Karte auf seinen eigenen Ablagestapel und nicht aus dem Spiel. Von dort darf ihn niemand zurückholen, auch nicht mit Risiko-Aktion 4, denn A8.2 sagt „Risiko-Belohnungs-Karte sowie Schlangenkorb des Glücks können nicht vom Ablagestapel genommen werden“. Aus dem Spiel kommt der Korb nur nach der Nutzung (A7.10, D54). Antwort des Autors auf eine Rückfrage aus X6, gewählte Möglichkeit: „Auf den Ablagestapel“. Website folgt. | X6 | 24.11.2026 |
| D70 | Schlangenkorb „Tausche bis zu 2 Karten aus deiner Schlange mit Karten aus deiner Hand“: Muss der Spieler mindestens eine Karte tauschen, oder darf er den Bonus auch ohne Tausch nutzen? | Mindestens einen Tausch: Wer den Bonus wählt, tauscht eine oder zwei Farbkarten nach D44; ein Einsatz ohne Tausch ist nicht möglich. Abgeleitet aus A7.10 („Wähle einen der verfügbaren Bonuseffekte“): Ist kein Tausch möglich, ist der Bonus nicht wählbar. Antwort des Autors auf eine Rückfrage aus X6, gewählte Möglichkeit: „Mindestens ein Tausch“. Website folgt. | X6 | 24.11.2026 |
| D71 | Schlangenkorb „Ziehe 3 zusätzliche Karten und spiele sofort bis zu 2 davon aus“: Darf eine der gezogenen Farbkarten zugleich die reguläre Farbkarte des Zuges sein, sodass der Spieler bis zu drei der gezogenen Karten spielt? | Ja: Eine gezogene Farbkarte darf auch die reguläre Farbkarte des Zuges sein. So kann der Spieler bis zu drei der gezogenen Karten spielen: bis zu zwei zusätzlich über den Korb, in beliebiger Art (D43), und eine als Farbkarte des Zuges. Die Sonderkarte des Zuges ist der Korb selbst (D42). Antwort des Autors auf eine Rückfrage aus X6, gewählte Möglichkeit: „Ja, drei möglich“. Website folgt. | X6 | 24.11.2026 |
| D72 | Schlangenkorb „spiele sofort bis zu 2 davon aus“: Heisst „sofort“ direkt nach dem Ziehen, vor jeder anderen Aktion, oder irgendwann im selben Zug? | Im selben Zug: „Sofort“ heisst beim Korb, dass der Spieler die bis zu zwei gezogenen Karten irgendwann in diesem Zug spielt, nicht unbedingt direkt nach dem Ziehen; dazwischen darf er andere Aktionen seines Zuges ausführen, etwa die Farbkarte des Zuges legen. Das passt zu D57. Antwort des Autors auf eine Rückfrage aus X6, gewählte Möglichkeit: „Im selben Zug“. Website folgt. | X6 | 24.11.2026 |
| D73 | „Schlangentanz“ („Bilde durch Schlangenhäutung 2 neue Dreiergruppen.“): Zählt eine neue Vierer- oder Fünfergruppe als „Dreiergruppe“? | Ja: Für „Schlangentanz“ zählt jede neue Farbgruppe ab drei Karten als Dreiergruppe, auch eine Vierer- oder Fünfergruppe, wie für „Farbharmonie“ (D67). Wann eine Gruppe neu ist, regelt D62, wessen Häutung zählt, D37, und dass eine frühere Häutung genügt, D63. Antwort des Autors auf eine Rückfrage aus X2, gewählte Möglichkeit: „Ja, ab drei Karten“. Website folgt. | X2 | 24.11.2026 |
| D74 | Risiko-Aktion 2 („Zusätzliche Farbkarte spielen“): Ist sie wählbar, wenn der Spieler keine eigene Schlange hat? | Nein: Ohne eigene Schlange ist Risiko-Aktion 2 nicht wählbar, denn die zusätzliche Farbkarte kommt nur an ein Ende einer eigenen Schlange (D52) und beginnt keine neue Schlange. Dasselbe gilt ohne Farbkarte auf der Hand (D52). Antwort des Autors auf eine Rückfrage aus X5, gewählte Möglichkeit: „Nicht wählbar“. Website folgt. | X5 | 24.11.2026 |
| D75 | Risiko-Aktion 3 („Karten tauschen“), Erfolg: Muss der Spieler den Tausch ausführen, oder darf er darauf verzichten? | Freiwillig: Bei Erfolg darf der Spieler tauschen, muss aber nicht; A8.2 sagt „Du darfst den Tausch ausführen“. Verzichtet er, bleibt die Schlange unverändert. Abgeleitet aus D51: Die aufgedeckte Farbkarte kommt auch dann auf die eigene Hand. Welche Handkarte ersetzen darf, regelt D53. Antwort des Autors auf eine Rückfrage aus X5, gewählte Möglichkeit: „Freiwillig“. Website folgt. | X5 | 24.11.2026 |
| D76 | Risiko-Aktion 2: Erfüllt die zusätzlich gelegte Farbkarte die Pflicht, in jedem Zug mindestens eine Karte zu spielen (A5, D12), obwohl der Einsatz der Risiko-Karte nicht als reguläre Aktion zählt? | Ja: Legt der Spieler bei Erfolg von Risiko-Aktion 2 die zusätzliche Farbkarte an, zählt sie für die Pflicht, in jedem Zug mindestens eine Karte zu spielen (A5, D12), obwohl der Einsatz der Risiko-Karte nicht als reguläre Aktion zählt (A8.2). Es zählt die gelegte Farbkarte, nicht der Einsatz der Risiko-Karte; bei Misserfolg wird keine Farbkarte gelegt. Abgeleitet aus A8.2 („Zusätzliche Farbkarte spielen“): Die Karte bleibt zusätzlich und belegt nicht den Platz der Farbkarte des Zuges. Antwort des Autors auf eine Rückfrage aus X5, gewählte Möglichkeit: „Ja, zählt“. Website folgt. | X5 | 24.11.2026 |
| D77 | Risiko-Aktion 2: Ist die Farbkarte, die der Spieler vor dem Aufdecken benennt (D52), eine Ansage, die alle Spieler sehen? | Ja: Die Farbkarte, die der Spieler vor dem Aufdecken für Risiko-Aktion 2 benennt, ist eine Ansage wie in A6 („Der Spieler benennt das Ziel seiner Aktion“) und für alle Spieler offen, auch wenn ein KI-Gegner sie benennt. Nur so kann der begünstigte Gegner bei Misserfolg zwischen ihr und der obersten Stapelkarte wählen (D52). Legt der Spieler bei Erfolg eine andere Karte an, bleibt die benannte bekannt auf seiner Hand. Für diese eine Handkarte gilt die verdeckte Information aus B2 deshalb nicht. Antwort des Autors auf eine Rückfrage aus X5, gewählte Möglichkeit: „Ja, offen für alle“. Website folgt. | X5 | 24.11.2026 |
| D78 | Risiko-Aktion 1 („Zusätzliche Karten ziehen“), Misserfolg: Muss der gewählte Spieler die aufgedeckte Sonderkarte auf die Hand nehmen, oder darf er sie ablehnen? | Er muss sie nehmen: Bei Misserfolg von Risiko-Aktion 1 nimmt der gewählte Spieler die aufgedeckte Sonderkarte auf die Hand; das ist Pflicht, ablehnen kann er nicht. Das „darf“ in A8.2 („Der gewählte Spieler darf die Sonderkarte direkt auf die Hand nehmen“) lässt ihm also keine Wahl. Hat er danach mehr als 5 Handkarten, baut er sie am Ende seines eigenen Zuges ab (A8.2). Antwort des Autors auf eine Rückfrage aus X5, gewählte Möglichkeit: „Pflicht“. Website folgt. | X5 | 24.11.2026 |
| D79 | Risiko-Aktion 4, Misserfolg: Was bekommt der gewählte Gegner, wenn er weder eine Karte von seinem Ablagestapel nehmen noch die oberste Karte vom Nachziehstapel ziehen kann? | Er bekommt nichts: Kann der gewählte Gegner bei Misserfolg von Risiko-Aktion 4 weder eine Karte von seinem Ablagestapel nehmen, weil dort keine liegt, die er nehmen darf (A8.2, D69), noch die oberste Karte vom Nachziehstapel ziehen, weil der Stapel leer ist, geht er leer aus. Das führt D54 weiter, nach dem bei leerem Ablagestapel nur die andere Möglichkeit bleibt. Die Schlussrunde löst der Spieler am Zug aus (D55). Antwort des Autors auf eine Rückfrage aus X5, gewählte Möglichkeit: „Er bekommt nichts“. Website folgt. | X5 | 24.11.2026 |

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

- **25.11.2026, Task P0.5h:** Antworten des Autors vom 24.11.2026 auf
  Rückfragen aus X4, X5, X6 und der Prüfung von P0.5g als D68–D79
  aufgenommen (Website folgt). Folge X4: Auch eine Comeback-Zusatzaktion darf
  eine Sonderkarte wirkungslos ablegen, etwa einen Farbenschutz (D68). Folge
  X6: Ein ungenutzt abgeworfener Schlangenkorb kommt auf den eigenen
  Ablagestapel, und Risiko-Aktion 4 holt ihn nach A8.2 nicht zurück (D69);
  „Tausche bis zu 2 Karten“ verlangt mindestens einen Tausch (D70); von den
  gezogenen Karten des Korbs darf eine zusätzlich die Farbkarte des Zuges
  sein (D71); „sofort“ heisst im selben Zug (D72). Folge X2: Bei
  „Schlangentanz“ zählt jede neue Gruppe ab drei Karten als Dreiergruppe
  (D73). Folge X5: Risiko-Aktion 2 ist ohne eigene Schlange nicht wählbar
  (D74), ihre gelegte Farbkarte zählt für die Pflicht zur Karte im Zug (D76),
  und die benannte Farbkarte ist eine offene Ansage (D77); der Tausch bei
  Aktion 3 ist freiwillig (D75); bei Aktion 1 nimmt der Gegner die Sonderkarte
  auf jeden Fall (D78), und bei Aktion 4 geht er leer aus, wenn er weder vom
  Ablagestapel nehmen noch ziehen kann (D79). D54 sagt, Risiko-Karte und
  Schlangenkorb lägen nie auf einem Ablagestapel, und nennt den Satz aus A8.2
  nur eine Klarstellung. Für den genutzten Korb stimmt das; der ungenutzt
  abgeworfene liegt nach D69 aber auf einem Ablagestapel, und dort wirkt der
  Satz aus A8.2. Nach dem Entscheid des Orchestrators vom 25.11.2026 geht
  D69 als jüngere Antwort vor: D54 ist um die Präzisierung durch D69 ergänzt,
  der bisherige Wortlaut bleibt, wie bei D23 und D48. B2 nennt die nach D52
  und D77 benannte Farbkarte als einzige Ausnahme von der verdeckten
  Information, D68 verweist auf D46, und D70, D75 und D76 kennzeichnen, aus
  welcher Stelle ihr nicht gewählter, sondern abgeleiteter Satz folgt
  (A7.10, D51, A8.2). Die übrigen Einträge, auf die D68–D79 verweisen,
  stimmen damit überein und bleiben unverändert. Teil C ist leer:
  C10 und C14 sind gestrichen, weil X2a sie behoben hat. B1 nennt
  Aufgabenkarten, Schlangenkorb, Comeback- und Risiko-Karten als umgesetzt,
  Stand 24.11.2026, dazu den Vielfaltbonus, den die Wertung seit E10 und
  E10b rechnet. Der Kopf von Teil C nennt den Stand vom 24.11.2026, der
  Schlusssatz die KI unter `src/ki/` statt der nicht mehr vorhandenen
  `src/kiZug.ts`. Teil A unverändert. Der Task nennt `docs/GAME_SPEC.md`
  ausdrücklich (U13).
- **23.11.2026, Task P0.5g:** Rückfragen aus den Prüfungen von X2 und X3, die
  der Autor am 23.11.2026 beantwortet hat, als D58–D65 aufgenommen (Website
  folgt). Folge X2: „Farbvielfalt“ verlangt jede Farbe genau einmal (D58).
  „Farbenpracht“ wird nur am Ende des eigenen Zuges geprüft und bei Spielende
  nicht noch einmal für die anderen Spieler (D59, D60). Joker zählen bei
  „Gelber Schatz“, „Lila Riese“, „Farbkombination“ und „Farbenpracht“ auch in
  reinen Jokerreihen (D61). Bei „Schlangentanz“ ist jede Gruppe neu, in der
  keine Gruppe von vorher weiterlebt, und eine frühere Häutung gilt die ganze
  Partie (D62, D63). „Schlangenmeister“ verlangt zwei Arten von Sonderkarten
  (D64). Folge X3: Auch eine wirkungslos abgelegte Farbenfusion verbraucht die
  Fusion des Zuges (D65). D48 ist um die Antwort ergänzt, dass die
  Comeback-Karte im zweiten Zug nach einem Verdoppler nie einsetzbar ist; der
  bisherige Wortlaut bleibt. D31, D32, D35 bis D38, D41 und D56 stimmen mit
  den neuen Einträgen überein und bleiben unverändert. In Teil C sind C21 und
  C23 gestrichen, weil X2b sie behoben hat. C10 ist für die zehn Aufgaben aus
  X2b und X2c behoben und bleibt wie C14 stehen, bis X2a gemergt ist; beide
  Zeilen nennen jetzt die Platzhalter als Fundstelle. B1 nennt den Stand nach
  X2b und X2c. Teil A unverändert. Der Task nennt `docs/GAME_SPEC.md`
  ausdrücklich (U13). In Iteration 2 (24.11.2026) sagt D63 auch, was die
  Wahl ausschliesst: Die beiden Gruppen müssen beim Einlösen nicht mehr
  liegen. Zwei weitere Antworten vom 23.11.2026 stehen als D66 und D67 da:
  Nach einem Verdoppler wird „Farbenpracht“ am Ende jedes der zwei Züge
  geprüft, und für „Farbharmonie“ zählt jede Gruppe ab drei Karten als
  Dreiergruppe. Im Website-Nachtrag enden die Fragezeilen D58–D65 jetzt wie
  alle anderen mit zwei Leerzeichen, und B1 nennt den Stand vom 23.11.2026.
- **23.11.2026, Task P0.5f:** Zwei Rückfragen aus X3, die der Autor am
  22.11.2026 beantwortet hat, als D56 und D57 aufgenommen (Folge X3, Website
  folgt). D56: Eine Farbenfusion, die ein Gegner mit Farbenschutz abwehrt,
  verbraucht die Fusion des Zuges („Ja, gespielt ist gespielt“). D57: Wer
  mitten im Zug die letzte Karte zieht, darf die eben gezogenen Karten noch im
  selben Zug spielen („Ja, im selben Zug“). D43, D49 und D55 stimmen damit
  überein und bleiben unverändert. Teil A unverändert. Der Task nennt
  `docs/GAME_SPEC.md` ausdrücklich (U13). In Iteration 2 ordnet D57 nach dem
  Muster von D23 den Satz aus A10 zu den zuletzt gezogenen Karten ein: Er
  meint das Auffüllen am Ende des Zuges; D57 gilt fürs Ziehen mitten im Zug,
  und zwischen den beiden Zügen eines Verdopplers spielt man den zweiten Zug
  noch (A7.8). Die Website soll A10 mit D57 klarstellen. Dazu sind C1, C15
  und C20 aus Teil C gestrichen, weil X1 sie behoben hat, und B1 nennt den
  Stand nach X1.
- **21.11.2026, Task P0.5e:** Sammelantwort des Autors zu G1–G8 und G10–G23
  („ja zu deinen vorschlägen.“) als D34–D55 aufgenommen. Es gilt bei jeder
  Frage der Vorschlag des Orchestrators aus `docs/REGELFRAGEN.md`, als Regel
  ohne Buchstaben formuliert; Website folgt. Die Spalte „Folge“ nennt den
  Task, der die Frage nennt, bei G4 also X2, wohin der Zähler für
  „Schlangentanz“ aus E9 verschoben wurde. Teil D hat keine offenen Fragen
  mehr; C23 verweist auf D39. Nach den Prüfungen steht in D34–D55 je
  gewähltem Teil ein eigener Satz; dafür übernehmen D46, D48, D49 und D51 den
  Satz der gewählten Möglichkeit, und D43 nennt den Hinweis zu A5 nicht mehr,
  weil er zu keinem Teil gehört und in A5 selbst steht. Teil A unverändert.
  Freigabe des Orchestrators nach U13.
- **21.11.2026, Task E4:** Entscheidung des Autors zur Frage, wer bei einer
  angesagten Sonderkarte gefragt wird, als D33 aufgenommen: jeder Betroffene;
  abwehren kann nur, wer Farbenschutz hält. Sie steht in Teil D und nicht in
  Teil B, weil Teil D die Entscheidungen des Autors mit Datum und Folge führt;
  Teil B hält Festlegungen ohne solche Herkunft fest. Plan E4, Kriterium 3 ist
  angeglichen. Teil A unverändert. Freigabe des Orchestrators nach U13.
- **20.11.2026, Task E10b:** Antwort des Autors zum Vielfaltbonus einer Gruppe
  nur aus Regenbogenschlangen als D32 aufgenommen („Nein“, Website folgt); D31
  verweist darauf. Offen bleibt die Gruppe aus Regenbogenschlangen und
  Farbenfusionen. Teil A unverändert.
- **20.11.2026, Task P0.5d, Iteration 2:** Antworten des Autors vom selben Tag
  aufgenommen. D23: Rückfrage zu A7.8, „Ja, wirkungslos“; der Widerspruch zu
  D11 ist aufgelöst, C7 nachgezogen. D30 und D31: Präzisierung im Wortlaut,
  dazu die Folgerungen, die der Text trägt (Fusion belegt einen Platz und
  bringt die Summe darunter; drei Regenbogenschlangen sind eine Gruppe mit
  0 Punkten). D19 steht seit dem 13.11.2026 in A5 und trägt jetzt
  „Website übernommen“. Teil A unverändert.
- **20.11.2026, Task P0.5d:** Antwort des Autors zu G9 als D31 aufgenommen
  („Ja, als Gruppe“: drei Joker nebeneinander sind eine Gruppe, auch für
  Vielfaltbonus und „Farbharmonie“; Website folgt). Teil A unverändert.
- **20.11.2026, Task P0.5d:** Antwort des Autors zum Wert einer Farbenfusion in
  einer Gruppe als D30 aufgenommen („Summe darunter“, Website folgt). Sie
  stimmt mit A7.7 und A11 überein; die Wertung (E10) rechnet schon so. Teil A
  unverändert.
- **13.11.2026, Task P0.5d:** Teil A an die Website angeglichen (Bundle
  `index-EH-TKokX.js`): Der Autor hat D9–D13 übernommen. Neuer Wortlaut in
  A5 (Karten ausspielen, „Wichtig“), A6 (Grundregeln für Sonderkarten), A7.2
  (Farbenschutz) und A7.8 (Verdoppler); Abschnittsnummern unverändert. D9,
  D10, D12 und D13 stimmen mit Teil D überein: „Website übernommen am
  13.11.2026“. D11 bleibt „Website folgt“: A7.8 sagt „Im zweiten Zug darfst du
  keinen weiteren Verdoppler spielen“, D23 lässt ihn dort wirkungslos ablegen;
  das entscheidet der Autor. Teil C: C6, C7, C12 und C19 auf den neuen
  Wortlaut verwiesen, Spalte „Engine heute“ unverändert. Die Abdeckungsprüfung
  liest nur noch Teil A; `npm run abgleich:website` meldet volle Abdeckung.
  Freigabe des Orchestrators nach U13.
- **13.11.2026, Task P0.5:** Antworten des Autors auf die Regelfragen F1–F15
  als D14–D28 aufgenommen (Website folgt), Teil D um die Spalte „Datum“
  ergänzt. Abweichend vom Vorschlag: F8 (Grube in der Schlussrunde nimmt den
  letzten Zug, Abwehr erlaubt) und F11 (Kette ab 3 Farbkarten). Die
  Nachfrage F8a (Grube auf einen Spieler, der seinen letzten Zug gemacht hat)
  hat der Autor am selben Tag beantwortet: D29, erlaubt, ohne Wirkung. Teil A
  unverändert.
- **13.11.2026, Task P0.5, Iteration 2:** D24 nennt die Bestätigung des Autors
  zu F11 („Ja, genau so“). Teil C verweist auf die Folgen von D14–D29 (C2, C6,
  C7, C9, C12, C13, C17, C18, C19); Freigabe des Orchestrators nach U13.
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
