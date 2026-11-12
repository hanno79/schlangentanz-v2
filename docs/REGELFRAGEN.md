# Regelfragen an den Autor

Task P0.5 · Katalog aus `docs/UMSETZUNGSPLAN.md`, Abschnitt 9 · 38 Fragen:
F1–F15 zum Basis-Spiel, G1–G23 zur Erweiterung.

Die Website `https://schlangentanz.ch/rules` lässt diese Punkte offen. Jede
Frage nennt die Stelle in `docs/GAME_SPEC.md` mit dem wörtlichen Satz der
Website (Teil A) oder der Entscheidung aus Teil D, die Möglichkeiten mit ihrer
Folge fürs Spiel und einen Vorschlag.

## So antwortest du

- **Eine Zeile je Frage:** Nummer, Doppelpunkt, Buchstabe. Beispiel: `F1: a`.
- **Mehrteilige Fragen** haben je Teil eigene Buchstaben. Antworte mit einem
  Buchstaben je Teil, zum Beispiel `F4: a, c`.
- **Eigene Antwort:** Passt keine Möglichkeit, schreib sie aus, zum Beispiel
  `F9: Gleichstand gewinnt, wer mehr Farbgruppen hat`.
- **Sammelantwort:** `Alle Vorschläge F1–F15 übernehmen` genügt, auch mit
  Ausnahmen: `Alle Vorschläge F1–F15, aber F9: b`. Dasselbe für G1–G23.
- **Ein Vorschlag gilt erst mit deiner Antwort.** Bis dahin entsteht kein Code,
  der davon abhängt. Die Vorschläge zu F1–F15 stehen so im Umsetzungsplan; die
  zu G1–G23 hat der Orchestrator ergänzt und als solche gekennzeichnet.
- **Was blockiert wird:** Fragen F blockieren Tasks des Basis-Spiels (Engine,
  KI und Oberfläche bis Meilenstein M2). Fragen G blockieren nur die
  Erweiterung (X1–X6, K4, O10 bis Meilenstein M3).
- **Danach:** Deine Antwort kommt mit Datum in das Feld „Antwort“ der Frage,
  dann in `docs/GAME_SPEC.md` Teil D. Du bekommst einen Prompt, um die Website
  nachzuziehen.

## Übersicht

| Nr. | Frage in einem Satz | Vorschlag |
|---|---|---|
| F1 | Zwei Schlangengruben auf denselben Spieler: ein oder zwei Züge aussetzen? | b: zwei Züge |
| F2 | Wehrt ein Farbenschutz beide Karten ab, wenn Schlangenfrass c) zwei Karten desselben Spielers frisst? | a: ja, beide |
| F3 | Kann eine Sonderkarte, etwa die Regenbogenschlange, eine neue Schlange beginnen? | a: nein, nur eine Farbkarte |
| F4 | Wohin legt der Farbendieb die gestohlene Karte, und was gilt ohne eigene Schlange? | a, c: eigene Schlange, beliebige Stelle; ohne Schlange beginnt sie eine neue |
| F5 | Füllt ein aussetzender Spieler auf, und darf er mit Farbenschutz reagieren? | a, c: kein Auffüllen; Reaktion erlaubt |
| F6 | Darf man einem Gegner mit einer Farbkarte eine neue Schlange beginnen? | a: nein, nur an bestehende |
| F7 | Sind eine Farbkarte und eine Regenbogenschlange „zwei Karten gleicher Farbe“ für die Farbenfusion? | a: nein, nur zwei Farbkarten |
| F8 | Verfällt der letzte Zug bei Aussetzen in der Schlussrunde, und ist eine Grube auf jemanden ohne Zug erlaubt? | a, c: ja; nein |
| F9 | Ist Gleichstand bei den Punkten ein geteilter Sieg? | a: ja |
| F10 | Darf ein Verdoppler im zweiten Zug wirkungslos abgelegt werden? | a: ja, ohne weiteren Zug |
| F11 | Hat die längste Farbkette eine Mindestlänge, und was gilt ohne Kette? | a, d: Mindestlänge 2; ohne Kette kein Bonus |
| F12 | Darf man eine Sonderkarte mit möglichem Ziel trotzdem wirkungslos ablegen? | a: nein; nur ohne Ziel, Farbenschutz immer |
| F13 | Muss die Schlangenhäutung die Reihenfolge ändern? | a: ja |
| F14 | Ist im zweiten Zug nach einem Verdoppler eine weitere Farbenfusion erlaubt? | a: ja, je Zug eine |
| F15 | Sind die Ablagestapel für alle vollständig einsehbar? | a: ja, vollständig |
| G1 | Schaltet ein einziger Schalter alle Teile der Erweiterung? | a: ja, ein Schalter (Orchestrator) |
| G2 | Zählt die geheime Aufgabe, sobald sie einmal erfüllt war, oder nur am Spielende? | a: einmal erfüllt genügt (Orchestrator) |
| G3 | Was zählt bei „Schlangenmeister“ und „Schlangenrepertoire“ als ausgespielt? | a: jede aus der Hand gespielte Sonderkarte (Orchestrator) |
| G4 | „Schlangentanz“: nur eigene Häutung, und beide Gruppen aus einer Häutung? | a, c: ja, ja (Orchestrator) |
| G5 | Brauchen „Vielfaltskönig“ und „Farbenpracht“ zwei Schlangen? | b, c: Vielfaltskönig ja, Farbenpracht nein (Orchestrator) |
| G6 | „Symmetriemeister“: gerade Kartenzahl nötig, und welche Sonderkarten sind erlaubt? | b, c: ungerade erlaubt; Joker ja, andere Sonderkarten nein (Orchestrator) |
| G7 | „Schlangenbändiger“: muss das Muster direkt hintereinander liegen? | a: ja, direkt (Orchestrator) |
| G8 | „Farbkombination“ nebeneinander, und zählen Joker bei „Gelber Schatz“ und „Lila Riese“? | b, c: verteilt genügt; Joker zählen (Orchestrator) |
| G9 | Zählt eine Gruppe nur aus Jokern für Vielfaltbonus und „Farbharmonie“? | a: ja (Orchestrator) |
| G10 | Schlangenkorb: Handkarte, Sonderkarte des Zuges, vier Effekte vollständig? | a, c, e: ja, ja, ja (Orchestrator) |
| G11 | Korb „Ziehe 3, spiele bis zu 2“: zusätzlich, auch Verdoppler, und bei kleinem Stapel? | a, c, e: zusätzlich beliebig; kein Verdoppler; ziehen, was da ist (Orchestrator) |
| G12 | Korb „Tausche bis zu 2 Karten“: welche Karten, und wohin die getauschte? | a, d: nur Farbkarten; Platz gegen Platz, auf die Hand (Orchestrator) |
| G13 | Korb „Sonderkarte entfernen“: welche, abwehrbar, auf wessen Ablagestapel? | a, c, e: jede; abwehrbar; Nutzer (Orchestrator) |
| G14 | Korb „Zwei zusätzliche Aktionen“: welche, und gelten die Grenzen weiter? | a, c, f, g: wie Comeback; obendrauf; keine zweite Fusion; kein Verdoppler (Orchestrator) |
| G15 | Schliessen sich Verdoppler, Comeback und Schlangenkorb im selben Zug aus? | a: ja, alle drei (Orchestrator) |
| G16 | Comeback: wie wird die Schlangenlänge gezählt, und wann ist die Karte einsetzbar? | a, d, f: jede Karte eins; ohne Schlange null; im ganzen Zug (Orchestrator) |
| G17 | Comeback „Zwei abwerfen, drei ziehen“: Grenzfälle und zweimal? | a, c, e, g (Orchestrator) |
| G18 | Heisst „pro Runde eine Risiko-Karte“ pro eigenem Zug samt Verdoppler-Zweitzug? | a: ja (Orchestrator) |
| G19 | Wohin kommt die aufgedeckte Karte bei den Risiko-Aktionen 2, 3 und 4? | a, c, e, g (Orchestrator) |
| G20 | Risiko-Aktion 2: benennen, wer wählt, ohne Farbkarte, nur eigene Schlange? | a, c, e, g (Orchestrator) |
| G21 | Risiko-Aktion 3: welche Handkarte ersetzt, und wohin die zusätzliche Karte? | a, d (Orchestrator) |
| G22 | Risiko-Aktion 4: zählt die aufgedeckte Karte mit, leerer Ablagestapel, Widerspruch? | a, c, e (Orchestrator) |
| G23 | Risiko-Karte bei leerem Stapel, und wer löst die Schlussrunde aus? | a, c (Orchestrator) |

## Basis-Spiel (F1–F15)

### F1: Zwei Schlangengruben auf denselben Spieler

**Frage:** Treffen zwei Schlangengruben denselben Spieler, bevor er ausgesetzt hat: setzt er einen oder zwei Züge aus?

**Fundstelle:** A7.6 Schlangengrube

> Der gewählte Spieler muss seinen nächsten Zug komplett aussetzen.

> Die Schlangengrube wird nach dem ausgesetzten Zug auf den Ablagestapel gelegt

**Möglichkeiten:**

- **a)** Ein Zug: Die zweite Grube hat keine weitere Wirkung; beide gehen nach dem ausgesetzten Zug auf den Ablagestapel. Folge: Eine zweite Grube auf denselben Spieler ist verschenkt.
- **b)** Zwei Züge: Jede Grube kostet einen eigenen Zug und bleibt vor ihm liegen, bis er für sie ausgesetzt hat. Folge: Gruben stapeln sich; zu zweit kann ein Spieler zwei Züge hintereinander verlieren.
- **c)** Auf einen Spieler, vor dem schon eine Grube liegt, darf keine zweite gespielt werden. Folge: Dieses Ziel wird nicht angeboten.

**Vorschlag:** b. Aus dem Plan: „zwei“.

**Betroffene Tasks:** nennt die Frage: E4 (Grenzfall). Hängt davon ab: E2 (Aussetzen im Zugablauf), O6 (Anzeige des Aussetzens).

**Antwort:** —

**Datum:** —

### F2: Ein Farbenschutz gegen zwei gefressene Karten

**Frage:** Schlangenfrass c) frisst zwei Karten **desselben** Spielers: Wehrt ein Farbenschutz beide ab?

**Fundstelle:** A6 Sonderkarten-Timing, Beispiel 2; dazu A7.4 Schlangenfrass

> Der betroffene Spieler kann sofort mit einem Farbenschutz reagieren.

> Ein Farbenschutz schützt nur die eigene Schlange:

> Spielen beide einen Farbenschutz, wird keine Karte gefressen.

> Die Karten können aus einer oder zwei verschiedenen Schlangen stammen und von beliebigen Positionen entfernt werden.

**Möglichkeiten:**

- **a)** Ja: Ein Farbenschutz wehrt den ganzen Schlangenfrass für diesen Spieler ab, beide Karten bleiben liegen. Folge: Jeder betroffene Spieler entscheidet genau einmal, wie in Beispiel 2.
- **b)** Nein, je Karte ein Farbenschutz: Mit einem schützt er eine der beiden Karten nach seiner Wahl. Folge: Er kann zwei Farbenschutz brauchen; gefragt wird je Karte.
- **c)** Je Schlange ein Farbenschutz: Liegen beide Karten in derselben Schlange, schützt einer beide; liegen sie in seinen zwei Schlangen, nur eine. Folge: Die Abwehr richtet sich nach Schlangen statt nach Spielern.

**Vorschlag:** a. Aus dem Plan: „ja“.

**Betroffene Tasks:** nennt die Frage: E6 (Grenzfall). Hängt davon ab: E4 (Reaktionsablauf, jeder Betroffene einmal), K3 (Abwehr der KI), O6 (Abwehrfrage an den Menschen).

**Antwort:** —

**Datum:** —

### F3: Neue Schlange mit einer Sonderkarte beginnen

**Frage:** Kann eine Sonderkarte (etwa die Regenbogenschlange) eine neue Schlange beginnen?

**Fundstelle:** A5 Spielablauf (Schlangen); D9 in Teil D

> Eine neue Schlange kann begonnen werden, indem eine Farbkarte separat von bestehenden Schlangen gelegt wird.

> Optional eine Sonderkarte, um deren Effekt auszulösen (kann an beliebiger Stelle eingefügt werden)

> Ja, jede Karte in jede Schlange: Farbkarten an ein Ende, Sonderkarten an beliebiger Stelle.

**Möglichkeiten:**

- **a)** Nein, nur eine Farbkarte beginnt eine Schlange. Folge: Regenbogenschlange und Blockade brauchen eine bestehende Schlange; liegt keine am Tisch, sind sie nur wirkungslos ablegbar.
- **b)** Nur die Regenbogenschlange darf eine neue Schlange beginnen, weil sie als Farbe zählt. Folge: Eine Schlange kann mit einem Joker beginnen; andere Sonderkarten nicht.
- **c)** Jede Karte, die in einer Schlange liegen bleibt (auch Regenbogenschlange und Schlangenblockade), darf eine neue Schlange beginnen. Folge: Auch eine Blockade kann einen der zwei Schlangenplätze belegen.

**Vorschlag:** a. Aus dem Plan: „nein, nur eine Farbkarte“.

**Betroffene Tasks:** nennt die Frage: E5. Hängt davon ab: E1 (Aktionstypen), O5 (Ziel „neue Schlange“), K2 (Zugsuche).

**Antwort:** —

**Datum:** —

### F4: Wohin der Farbendieb die Karte legt

**Frage:** Farbendieb: Muss die gestohlene Karte in eine eigene Schlange, oder darf sie nach D9 in jede? Was gilt, wenn der Dieb keine Schlange hat?

**Fundstelle:** A7.1 Farbendieb; D9 in Teil D

> Erlaubt es, einem anderen Spieler eine Karte aus dessen Schlange wegzunehmen und sofort in die eigene Schlange einzufügen.

> Lege die Karte an eine beliebige Position in deiner Schlange

> Ja, jede Karte in jede Schlange: Farbkarten an ein Ende, Sonderkarten an beliebiger Stelle.

**Möglichkeiten:**

Teil 1, wohin die gestohlene Karte geht:

- **a)** Nur in eine eigene Schlange, an eine beliebige Stelle. Folge: Der Farbendieb stärkt immer den Dieb selbst.
- **b)** Nach D9 in jede Schlange am Tisch, an eine beliebige Stelle. Folge: Man kann einem Gegner eine Karte nehmen und sie einem anderen Gegner in die Schlange legen.

Teil 2, der Dieb hat keine eigene Schlange:

- **c)** Die gestohlene Karte beginnt eine neue eigene Schlange. Folge: Der Farbendieb ist auch ohne Schlange mit Wirkung spielbar.
- **d)** Ohne eigene Schlange hat der Farbendieb kein Ziel und ist nur wirkungslos ablegbar. Folge: Zu Spielbeginn ist er meist nutzlos.

**Vorschlag:** a, c. Aus dem Plan: „eigene Schlange, beliebige Stelle; ohne Schlange beginnt sie eine neue“.

**Betroffene Tasks:** nennt die Frage: E8 (Grenzfall). Hängt davon ab: O5 (Farbendieb: Karte, dann Platz), K3 (Angriff der KI).

**Antwort:** —

**Datum:** —

### F5: Auffüllen und Abwehr beim Aussetzen

**Frage:** Füllt ein aussetzender Spieler seine Hand auf? Darf er mit Farbenschutz reagieren?

**Fundstelle:** A7.6 Schlangengrube; dazu A5 und A6

> Während des Aussetzens darf der Spieler keine Aktionen durchführen - weder Karten ziehen noch Karten ausspielen.

> Kartenhand prüfen: Hast du ausserhalb deines Zuges Karten gespielt, zum Beispiel einen Farbenschutz zur Abwehr, ziehst du jetzt vom Nachziehstapel, bis du wieder 5 Handkarten hast.

> Der betroffene Spieler kann sofort mit einem Farbenschutz reagieren.

**Möglichkeiten:**

Teil 1, Auffüllen:

- **a)** Kein Auffüllen im ausgesetzten Zug; er füllt erst zu Beginn seines nächsten gespielten Zuges auf. Folge: Wer vorher abgewehrt hat, bleibt eine Runde länger mit kleiner Hand.
- **b)** Er füllt zu Beginn des ausgesetzten Zuges auf 5 auf, spielt aber nichts. Folge: Das Aussetzen kostet nur das Ausspielen, nicht das Ziehen.

Teil 2, Abwehr mit Farbenschutz:

- **c)** Abwehr bleibt erlaubt, auch zwischen Grube und ausgesetztem Zug. Folge: Das Aussetzen betrifft nur seinen eigenen Zug, nicht seine Reaktionen.
- **d)** Von der Grube bis zum Ende des ausgesetzten Zuges darf er nicht abwehren. Folge: Eine Grube macht ihn für den Rest der Runde wehrlos.

**Vorschlag:** a, c. Aus dem Plan: „kein Auffüllen; Reaktion erlaubt“.

**Betroffene Tasks:** nennt die Frage: E2 (Abnahmekriterium 10), E4 (Grenzfall). Hängt davon ab: O6 (Abnahmekriterium 4), K3 (Abwehr der KI).

**Antwort:** —

**Datum:** —

### F6: Einem Gegner eine neue Schlange beginnen

**Frage:** Farbkarte beim Gegner: nur an bestehende Schlangen, oder darf man ihm auch eine neue beginnen?

**Fundstelle:** D9 in Teil D; dazu A5 (Schlangen)

> Ja, jede Karte in jede Schlange: Farbkarten an ein Ende, Sonderkarten an beliebiger Stelle.

> Ein Spieler darf maximal 2 Schlangen haben.

> Eine neue Schlange kann begonnen werden, indem eine Farbkarte separat von bestehenden Schlangen gelegt wird.

**Möglichkeiten:**

- **a)** Nur an ein Ende einer bestehenden gegnerischen Schlange. Folge: Neue Schlangen beginnt jeder nur für sich selbst.
- **b)** Hat der Gegner weniger als zwei Schlangen, darf man ihm auch eine neue beginnen. Folge: Man kann den freien Schlangenplatz eines Gegners mit einer unpassenden Karte belegen.

**Vorschlag:** a. Aus dem Plan: „nur bestehende“.

**Betroffene Tasks:** nennt die Frage: E5 (Abnahmekriterium 1). Hängt davon ab: O5 (Abnahmekriterium 2), K3 (störende Farbkarte beim Gegner).

**Antwort:** —

**Datum:** —

### F7: Farbenfusion mit einer Regenbogenschlange

**Frage:** Farbenfusion: Gelten eine Farbkarte und eine Regenbogenschlange als „zwei Karten gleicher Farbe"?

**Fundstelle:** A7.7 Farbenfusion; dazu A7.3 Regenbogenschlange

> Zwei nebeneinanderliegende Karten der gleichen Farbe werden unter die Farbenfusionskarte gelegt.

> Bringt die Punkte beider fusionierter Karten

> Gilt als Karte der Farbe, die für den Spieler am vorteilhaftesten ist

**Möglichkeiten:**

- **a)** Nein, nur zwei Farbkarten derselben Farbe dürfen fusioniert werden. Folge: Eine Regenbogenschlange liegt nie unter einer Fusion.
- **b)** Ja, eine Regenbogenschlange darf als passende Farbe neben einer Farbkarte fusioniert werden. Folge: Die Fusion bringt dann nur die Punkte der einen Farbkarte, und ein Joker verschwindet unter ihr.

**Vorschlag:** a. Aus dem Plan: „nein, nur zwei Farbkarten“.

**Betroffene Tasks:** nennt die Frage: E7. Hängt davon ab: O5 (Farbenfusion: Kartenpaar wählen), K2 (Abnahmekriterium 4).

**Antwort:** —

**Datum:** —

### F8: Aussetzen in der Schlussrunde

**Frage:** Verfällt der letzte Zug eines Spielers, der in der Schlussrunde aussetzen muss? Darf man die Schlangengrube auf jemanden spielen, der keinen Zug mehr hat?

**Fundstelle:** A10 Spielende; A7.6 Schlangengrube

> Wer die letzte Karte vom Nachziehstapel zieht, spielt seinen Zug normal zu Ende. Danach machen alle anderen Spieler noch je einen letzten Zug, ohne nachzuziehen.

> Der Spieler, der die Schlangengrube spielt, wählt einen Mitspieler aus.

> Der gewählte Spieler muss seinen nächsten Zug komplett aussetzen.

**Möglichkeiten:**

Teil 1, Aussetzen in der Schlussrunde:

- **a)** Ja, sein letzter Zug verfällt. Folge: Eine Grube kurz vor Schluss nimmt dem Gegner seinen letzten Zug.
- **b)** Nein, in der Schlussrunde setzt niemand aus; die Grube bleibt ohne Wirkung. Folge: Jeder macht seinen letzten Zug sicher.

Teil 2, Grube auf jemanden ohne weiteren Zug:

- **c)** Nicht erlaubt: Ein Spieler ohne weiteren Zug ist kein Ziel der Grube. Folge: Dieses Ziel wird nicht angeboten; ohne anderes Ziel ist die Grube nur wirkungslos ablegbar.
- **d)** Erlaubt, aber ohne Wirkung; die Grube geht auf den Ablagestapel. Folge: Die Grube ist dann eine wirkungslos gespielte Sonderkarte mit Ziel.

**Vorschlag:** a, c. Aus dem Plan: „ja; nein“.

**Betroffene Tasks:** nennt die Frage: E2 (Abnahmekriterium 10), E4 (Grenzfall). Hängt davon ab: K3 (Schlussrunde), O6 (Anzeige des Aussetzens).

**Antwort:** —

**Datum:** —

### F9: Gleichstand beim Sieg

**Frage:** Gleichstand bei den Punkten: geteilter Sieg?

**Fundstelle:** A11 Punktezählung

> Nach Spielende werden die Punkte gezählt. Es gewinnt der Spieler mit den meisten Punkten.

> Bei Gleichstand erhalten alle beteiligten Spieler die vollen 5 Punkte.

Der zweite Satz gilt nur für die längste Farbkette; für den Sieg sagt die Website nichts zum Gleichstand.

**Möglichkeiten:**

- **a)** Geteilter Sieg: Alle Punktgleichen gewinnen. Folge: Die Wertung zeigt mehrere Sieger.
- **b)** Stichentscheid nach einer Regel, die du festlegst (etwa: mehr Punkte aus Farbgruppen); erst bei erneutem Gleichstand geteilter Sieg. Folge: Die Wertung braucht eine zusätzliche Regel.

**Vorschlag:** a. Aus dem Plan: „ja“.

**Betroffene Tasks:** nennt die Frage: E10 (Grenzfall). Hängt davon ab: O8 (Abnahmekriterium 3), K5 (Zählweise der Siege im Turnier).

**Antwort:** —

**Datum:** —

### F10: Verdoppler im zweiten Zug

**Frage:** Verdoppler im zweiten Zug: Darf er wirkungslos abgelegt werden?

**Fundstelle:** A7.8 Verdoppler; D11 und D13 in Teil D

> Kann nicht mit anderen zugerweiternden Effekten kombiniert werden

> Nein, nur ein Verdoppler pro Runde.

> Hat sie kein mögliches Ziel, kommt sie wirkungslos auf den eigenen Ablagestapel und zählt als Sonderkarte des Zuges.

**Möglichkeiten:**

- **a)** Ja: Im zweiten Zug darf er wirkungslos auf den eigenen Ablagestapel; er zählt als Sonderkarte dieses Zuges, ein weiterer Zug folgt nicht. Folge: Wer im zweiten Zug nur Verdoppler hält, kann trotzdem eine Karte spielen.
- **b)** Nein: Im zweiten Zug ist ein Verdoppler gar nicht spielbar und bleibt auf der Hand. Folge: Hält ein Spieler im zweiten Zug nur Verdoppler, bräuchte es eine weitere Regel für die Pflichtkarte.

**Vorschlag:** a. Aus dem Plan: „ja, ohne weiteren Zug“.

**Betroffene Tasks:** nennt die Frage: E3 (Abnahmekriterium 3). Hängt davon ab: E2 (wirkungslos ablegen), O5 (Abnahmekriterium 6), K2 (Abnahmekriterium 6).

**Antwort:** —

**Datum:** —

### F11: Mindestlänge der längsten Farbkette

**Frage:** Längste Farbkette: Gibt es eine Mindestlänge? Was gilt bei lauter Einzelkarten und für Spieler ohne Schlange?

**Fundstelle:** A11 Punktezählung, Punkt 3 (Längste Farbkette)

> Der Spieler mit der längsten ununterbrochenen Kette einer Farbe (ohne Sonderkarten!) erhält 5 Bonuspunkte.

> Bei Gleichstand erhalten alle beteiligten Spieler die vollen 5 Punkte.

> Eine Farbgruppe besteht aus mindestens drei nebeneinanderliegenden Karten derselben Farbe in einer Schlange.

**Möglichkeiten:**

Teil 1, Mindestlänge einer Kette:

- **a)** Mindestens 2 gleichfarbige Karten nebeneinander. Folge: Bei lauter Einzelkarten hat niemand eine Kette.
- **b)** Mindestens 3, wie bei einer Farbgruppe. Folge: Der Bonus geht nur an Spieler mit einer Farbgruppe.
- **c)** Keine Mindestlänge; auch eine Einzelkarte ist eine Kette der Länge 1. Folge: Haben alle nur Einzelkarten, bekommen alle mit einer Schlange je 5 Punkte.

Teil 2, niemand hat eine Kette der Mindestlänge (auch: Spieler ohne Schlange):

- **d)** Dann bekommt niemand den Bonus; wer keine Kette hat, bekommt ihn nie. Folge: Der Bonus kann ausfallen.
- **e)** Dann gilt es als Gleichstand, und alle bekommen 5 Punkte. Folge: Der Bonus fällt nie aus, verschiebt dann aber nichts.

**Vorschlag:** a, d. Aus dem Plan: „Mindestlänge 2; ohne Kette kein Bonus“.

**Betroffene Tasks:** nennt die Frage: E10 (Grenzfall). Hängt davon ab: O8 (Abnahmekriterium 1), K2 (Rennen um die längste Kette).

**Antwort:** —

**Datum:** —

### F12: Sonderkarte mit Ziel wirkungslos ablegen

**Frage:** Darf man eine Sonderkarte, die ein mögliches Ziel hätte, trotzdem ohne Wirkung ablegen?

**Fundstelle:** D13 in Teil D; dazu A5 und D4

> Ja, jederzeit, auch wenn man eine Farbkarte hätte. Hat sie kein mögliches Ziel, kommt sie wirkungslos auf den eigenen Ablagestapel und zählt als Sonderkarte des Zuges.

> Hast du nur Farbenschutz-Karten auf der Hand, legst du eine davon ohne Wirkung auf deinen Ablagestapel.

> Eine Sonderkarte muss gespielt werden, auch wenn sie wirkungslos ist.

**Möglichkeiten:**

- **a)** Nein: Wirkungslos ablegen geht nur, wenn die Karte kein mögliches Ziel hat; ein Farbenschutz darf immer wirkungslos abgelegt werden. Folge: Eine Sonderkarte mit Ziel wird man nur los, indem man sie mit Wirkung spielt, notfalls beim Gegner.
- **b)** Ja: Jede Sonderkarte darf jederzeit wirkungslos auf den eigenen Ablagestapel. Folge: Man kann die Hand gezielt ausdünnen; die Pflichtkarte ist immer leicht zu erfüllen.
- **c)** Nein, und auch ein Farbenschutz nur, wenn man ausschliesslich Farbenschutz hält (wie in A5). Folge: Ein Farbenschutz bleibt sonst auf der Hand, bis er abwehrt.

**Vorschlag:** a. Aus dem Plan: „nein; nur ohne Ziel, Farbenschutz immer“.

**Betroffene Tasks:** nennt die Frage: E2 (Abnahmekriterium 6). Hängt davon ab: O5 (wirkungslos ablegen), K2 (Abnahmekriterium 5).

**Antwort:** —

**Datum:** —

### F13: Schlangenhäutung ohne Änderung

**Frage:** Schlangenhäutung: Muss sich die Reihenfolge ändern?

**Fundstelle:** A7.9 Schlangenhäutung

> Ermöglicht es, einen Abschnitt von 3–5 Farbkarten in der Schlange neu anzuordnen

> Die Neuordnung erfolgt einmalig

> Neue Farbgruppen zählen für Aufgaben und Punktewertung (Aufgaben sind Erweiterungsinhalt)

**Möglichkeiten:**

- **a)** Ja, die Farbfolge im Abschnitt muss danach anders sein. Folge: Ein Abschnitt aus lauter gleichen Farben ist nicht wählbar; eine unveränderte Anordnung wird abgelehnt.
- **b)** Nein, die Reihenfolge darf gleich bleiben. Folge: Die Häutung lässt sich ohne Änderung spielen und zählt trotzdem als mit Wirkung gespielte Sonderkarte.

**Vorschlag:** a. Aus dem Plan: „ja“.

**Betroffene Tasks:** nennt die Frage: E9 (Grenzfall). Hängt davon ab: O7 (Abnahmekriterium 1), K4 (Abnahmekriterium 3), X2 (Aufgaben „Schlangentanz“ und „Schlangenrepertoire“).

**Antwort:** —

**Datum:** —

### F14: Zweite Farbenfusion im zweiten Zug

**Frage:** „Pro Zug nur eine Farbenfusion": Darf im zweiten Zug nach einem Verdoppler eine weitere gespielt werden?

**Fundstelle:** A7.7 Farbenfusion; dazu A7.8 Verdoppler

> Pro Zug darf nur eine Farbenfusion durchgeführt werden

> Der Verdoppler zählt als Sonderkarte deines Zuges.

> Damit ist dein erster Zug beendet: Du füllst deine Handkarten auf und spielst sofort einen zweiten Zug, wieder mit einer Farbkarte und optional einer Sonderkarte.

Hinweis des Orchestrators: Im Basis-Spiel ist der Verdoppler die Sonderkarte des ersten Zuges, eine Farbenfusion passt dort nicht mehr hinein. Mit Verdoppler gibt es im Basis-Spiel also ohnehin höchstens eine Fusion. Die Antwort wirkt erst, wenn Zusatzaktionen der Erweiterung weitere Sonderkarten erlauben (siehe G14).

**Möglichkeiten:**

- **a)** „Zug“ heisst Teilzug: Im zweiten Zug nach einem Verdoppler ist wieder eine Fusion erlaubt. Folge: Die Grenze zählt je Teilzug.
- **b)** „Zug“ heisst der ganze eigene Zug samt zweitem Zug: höchstens eine Fusion. Folge: Die Grenze zählt je Spieler und Runde.

**Vorschlag:** a. Aus dem Plan: „ja, je Zug eine“.

**Betroffene Tasks:** nennt die Frage: E7 (Abnahmekriterium 3). Hängt davon ab: E3 (Teilzug), X3 (Grenzen an einer Stelle), X6 (Zusatzaktionen des Schlangenkorbs).

**Antwort:** —

**Datum:** —

### F15: Einsicht in die Ablagestapel

**Frage:** Sind die Ablagestapel für alle vollständig einsehbar, oder nur die oberste Karte?

**Fundstelle:** A4 Spielvorbereitung; dazu A8.2 (Aktion 4)

> Jeder Spieler erhält einen eigenen Ablagestapel für gespielte Sonderkarten und abgelegte Karten.

> ODER eine beliebige Karte von deinem eigenen Ablagestapel auf die Hand nehmen

**Möglichkeiten:**

- **a)** Alle Ablagestapel sind für alle vollständig einsehbar. Folge: Die KI-Sicht enthält alle Ablagestapel; die Oberfläche zeigt sie aufklappbar.
- **b)** Nur die oberste Karte jedes Stapels ist sichtbar. Folge: Wer mehr wissen will, muss sich Abgelegtes merken; die KI-Sicht enthält nur die oberste Karte.
- **c)** Den eigenen Stapel sieht man ganz, fremde nur mit der obersten Karte. Folge: Die Sicht unterscheidet eigenen und fremden Stapel.

**Vorschlag:** a. Aus dem Plan: „vollständig einsehbar“.

**Betroffene Tasks:** nennt die Frage: K1 (Abnahmekriterium 1). Hängt davon ab: O3 (Tischansicht), O4 (Ablagestapel am Tisch), X5 (Aktion 4).

**Antwort:** —

**Datum:** —

## Erweiterung (G1–G23)

Zu G1–G23 nennt der Umsetzungsplan keinen Vorschlag. Die Vorschläge hier
stammen vom Orchestrator und sind je Frage so gekennzeichnet.

### G1: Ein Schalter für die ganze Erweiterung

**Frage:** Ohne Erweiterung gibt es keine Aufgaben, keine Schlangenhäutung, keinen Vielfaltbonus (ein Schalter für alles). Richtig?

**Fundstelle:** A1 Spielmaterial, A4 Spielvorbereitung, A11; B1 Umfang; D7 in Teil D

> Erweiterungsinhalte sind entsprechend gekennzeichnet und können optional hinzugefügt werden.

> Zusätzlich bei Verwendung der Aufgabenkarten:

> Hinweis: Dieser Punktebereich wird nur bei Verwendung der Erweiterung gewertet.

> Vor jeder Partie wählt der Spieler, ob er mit oder ohne Erweiterung spielt.

> Alle Teile; vor der Partie wählbar mit oder ohne Erweiterung.

**Möglichkeiten:**

- **a)** Ja, ein Schalter für alles: Ohne Erweiterung gibt es keine Aufgaben, keine Schlangenhäutung, keinen Schlangenkorb, keine Comeback- und Risiko-Karten und keinen Vielfaltbonus. Folge: Die Lobby hat genau einen Schalter.
- **b)** Die Teile sind einzeln wählbar, etwa Aufgaben ohne Comeback- und Risiko-Karten (A4 nennt die Aufgabenkarten gesondert). Folge: Mehrere Schalter und deutlich mehr Kombinationen zu prüfen.

**Vorschlag:** a. Vorschlag des Orchestrators: D7 und B1 nennen eine Wahl „mit oder ohne Erweiterung“; ein Schalter hält die Zahl der zu prüfenden Kombinationen klein.

**Betroffene Tasks:** nennt die Frage: X1. Hängt davon ab: E1 (Erweiterungs-Schalter, Abnahmekriterium 1), E10 (Vielfaltbonus nur mit Erweiterung), O2 (Lobby), O10 (Abnahmekriterium 4).

**Antwort:** —

**Datum:** —

### G2: Wann die geheime Aufgabe zählt

**Frage:** Geheime Aufgabe: Zählt sie, sobald sie in einem eigenen Zug einmal erfüllt war, oder muss sie am Spielende erfüllt sein?

**Fundstelle:** A9 Aufgabenkarten; A11 Punkt 4

> Alle Aufgaben funktionieren nach dem gleichen Prinzip - egal ob offen oder geheim.

> Geheime Aufgaben werden erst bei der Punktezählung aufgedeckt.

> Addiere die Punkte für die geheime Aufgabe, wenn diese erfüllt wurde.

> Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen.

**Möglichkeiten:**

- **a)** Sie zählt, sobald sie einmal in einem eigenen Zug erfüllt war, wie eine offene Aufgabe; das Spiel merkt sich das verdeckt. Folge: Ein Gegner kann sie danach nicht mehr zerstören.
- **b)** Sie zählt nur, wenn ihre Bedingung bei der Wertung am Spielende erfüllt ist. Folge: Gegner können sie bis zum Schluss durch Angriffe zunichtemachen.

**Vorschlag:** a. Vorschlag des Orchestrators: A9 sagt, offene und geheime Aufgaben funktionieren gleich, und A11 spricht in der Vergangenheit („erfüllt wurde“).

**Betroffene Tasks:** nennt die Frage: X1 (Abnahmekriterium 5). Hängt davon ab: E10 (Endwertung), K4 (Abnahmekriterium 1), O10.

**Antwort:** —

**Datum:** —

### G3: Was als „ausgespielt“ zählt

**Frage:** Zählen für „Schlangenmeister" und „Schlangenrepertoire" als „ausgespielt": ein zur Abwehr gespielter Farbenschutz, eine wirkungslos abgelegte und eine abgewehrte Sonderkarte, der Schlangenkorb?

**Fundstelle:** A9 Aufgabenkarten Nr. 9 und 10; dazu A5 und A6

> Habe min. 2 versch. Sonderkarten in deinen Schlangen und spiele min. 4 aus.

> Spiele min. 5 versch. Arten von Sonderkarten aus.

> Gespielte Farbenschutzkarten kommen auf den Ablagestapel ihres Spielers.

> Hast du nur Farbenschutz-Karten auf der Hand, legst du eine davon ohne Wirkung auf deinen Ablagestapel.

**Möglichkeiten:**

- **a)** Jede Sonderkarte, die der Spieler aus der Hand gespielt hat, zählt: auch ein Farbenschutz zur Abwehr, eine wirkungslos abgelegte, eine abgewehrte und der Schlangenkorb. Folge: Einfach nachzuzählen; die Aufgaben sind leichter.
- **b)** Es zählt, was er in seinem eigenen Zug als Sonderkarte gespielt hat, auch abgewehrt oder wirkungslos, und der Schlangenkorb; ein Farbenschutz zur Abwehr ausserhalb des Zuges zählt nicht. Folge: Nur eigene Züge bringen die Aufgabe voran.
- **c)** Es zählen nur Karten, deren Wirkung eingetreten ist: Abwehr-Farbenschutz und Schlangenkorb ja, abgewehrte und wirkungslos abgelegte nein. Folge: Die Aufgaben sind schwerer, und jede Abwehr eines Gegners bremst sie.

**Vorschlag:** a. Vorschlag des Orchestrators: Die Website nennt auch Abwehrkarten „gespielt“ (A6, Beispiel 2), und eine Zählung ohne Ausnahmen ist für den Spieler am leichtesten nachzuvollziehen.

**Betroffene Tasks:** nennt die Frage: X2. Hängt davon ab: X1 (Zählung gespielter Sonderkarten im Zustand), K4 (Abnahmekriterium 1).

**Antwort:** —

**Datum:** —

### G4: Aufgabe „Schlangentanz“

**Frage:** „Schlangentanz": Zählt nur eine Schlangenhäutung in der eigenen Schlange? Dürfen die zwei Gruppen aus zwei Häutungen stammen?

**Fundstelle:** A9 Aufgabenkarte Nr. 12 und ihr Beispiel

> Bilde durch Schlangenhäutung 2 neue Dreiergruppen.

> Er spielt die Sonderkarte Schlangenhäutung und wählt die letzten 5 Karten aus (Rot - Violet - Violet - Rot - Violet).

> Durch geschicktes Umordnen bildet er zwei neue Dreiergruppen:

**Möglichkeiten:**

Teil 1, welche Häutung zählt:

- **a)** Nur eine Häutung, die der Spieler selbst in einer eigenen Schlange spielt. Folge: Eine Häutung in einer gegnerischen Schlange erfüllt die Aufgabe für niemanden.
- **b)** Jede Häutung, die in einer Schlange des Spielers neue Gruppen bildet, auch wenn ein Gegner sie gespielt hat. Folge: Ein Gegner kann einem Spieler die Aufgabe ungewollt erfüllen.

Teil 2, eine oder zwei Häutungen:

- **c)** Beide Dreiergruppen müssen aus derselben Häutung entstehen, wie im Beispiel. Folge: Gezählt wird je Häutung; die Aufgabe ist schwer.
- **d)** Die zwei Gruppen dürfen aus zwei Häutungen stammen. Folge: Das Spiel zählt neue Gruppen über die Partie hinweg.

**Vorschlag:** a, c. Vorschlag des Orchestrators: Der Kartentext spricht den Spieler an („Bilde“), und das einzige Beispiel zeigt beide Gruppen aus einer Häutung; E9 hält die Zahl neuer Gruppen bereits je Häutung fest.

**Betroffene Tasks:** nennt die Frage: X2. Hängt davon ab: E9 (Abnahmekriterium 5), K4 (Abnahmekriterium 3).

**Antwort:** —

**Datum:** —

### G5: Eine oder zwei Schlangen bei „Vielfaltskönig“ und „Farbenpracht“

**Frage:** „Vielfaltskönig" und „Farbenpracht": Braucht es zwei Schlangen, oder genügt eine?

**Fundstelle:** A9 Aufgabenkarten Nr. 5 und 1

> Habe in jeder deiner Schlangen min. 4 versch. Farben.

> Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen.

> Habe in einer Schlange mindestens 4 verschiedene Farben, die direkt aufeinander folgen.

**Möglichkeiten:**

Teil 1, „Vielfaltskönig“:

- **a)** Eine Schlange genügt: „jeder deiner Schlangen“ meint die vorhandenen. Folge: Mit einer Schlange reichen vier Farben irgendwo darin, das ist leichter als „Farbwechsler“ (6 Punkte) und bringt 9.
- **b)** Es braucht zwei Schlangen mit je mindestens vier Farben. Folge: Die Aufgabe ist erst mit der zweiten Schlange erfüllbar.

Teil 2, „Farbenpracht“:

- **c)** Gezählt wird über alle vorhandenen Schlangen; eine genügt, wenn sie von jeder Farbe zwei Karten hat. Folge: Auch ein Spieler mit einer langen Schlange kann sie erfüllen.
- **d)** Es braucht zwei Schlangen. Folge: Mit einer Schlange ist die Aufgabe nie erfüllt.

**Vorschlag:** b, c. Vorschlag des Orchestrators: Bei „Vielfaltskönig“ wäre eine einzige Schlange leichter als „Farbwechsler“ bei mehr Punkten, das spricht für zwei Schlangen; bei „Farbenpracht“ ist „in deinen beiden Schlangen“ eine Summe über die Schlangen, die auch mit einer erreichbar ist.

**Betroffene Tasks:** nennt die Frage: X2. Hängt davon ab: K4 (Abnahmekriterium 1).

**Antwort:** —

**Datum:** —

### G6: Aufgabe „Symmetriemeister“

**Frage:** „Symmetriemeister": Muss die Kartenzahl gerade sein? Dürfen Joker oder andere Sonderkarten in der Schlange liegen?

**Fundstelle:** A9 Aufgabenkarte Nr. 13 und ihr Beispiel; A9 „Wichtig für Sonderkarten“

> Habe eine Schlange mit min. 8 Karten, bei der die erste Hälfte das Spiegelbild der zweiten ist.

> Die erste Hälfte (Blau - Rot - Gelb - Grün) ist das Spiegelbild der zweiten Hälfte (Grün - Gelb - Rot - Blau).

> Regenbogenschlange und Farbenfusion zählen für Aufgaben als Karte einer Farbe, und zwar als die Farbe, mit der die Aufgabe erfüllt ist.

> Andere Sonderkarten, etwa die Schlangenblockade, unterbrechen Farbreihen und zählen nur, wenn eine Aufgabe ausdrücklich Sonderkarten verlangt.

**Möglichkeiten:**

Teil 1, Kartenzahl:

- **a)** Die Kartenzahl muss gerade sein, damit es zwei gleiche Hälften gibt. Folge: Eine Schlange mit 9 Karten erfüllt die Aufgabe nie.
- **b)** Auch eine ungerade Zahl ist erlaubt; die mittlere Karte ist die Achse und gehört zu keiner Hälfte. Folge: Jede spiegelgleiche Schlange ab 8 Karten zählt, etwa Blau-Rot-Gelb-Grün-Violett-Grün-Gelb-Rot-Blau.

Teil 2, Sonderkarten in der Schlange:

- **c)** Joker zählen als die passende Farbe; liegt eine andere Sonderkarte (etwa eine Blockade) in der Schlange, ist die Aufgabe nicht erfüllt. Folge: Ein Gegner kann sie mit einer Blockade verhindern.
- **d)** Joker zählen als die passende Farbe; andere Sonderkarten werden übersprungen und zählen nicht zu den 8 Karten. Folge: Eine Blockade schadet der Aufgabe nicht.
- **e)** Nur Farbkarten: Jede Sonderkarte, auch ein Joker, verhindert die Aufgabe (so prüft der heutige Code, C23). Folge: Widerspricht der Jokerregel in A9.

**Vorschlag:** b, c. Vorschlag des Orchestrators: Die Website verlangt keine gerade Zahl (C23); bei den Sonderkarten ist c die engste Lesart, die der Jokerregel in A9 nicht widerspricht.

**Betroffene Tasks:** nennt die Frage: X2 (behebt C23). Hängt davon ab: K4 (Abnahmekriterium 1).

**Antwort:** —

**Datum:** —

### G7: Aufgabe „Schlangenbändiger“

**Frage:** „Schlangenbändiger": Muss das Muster zweimal direkt hintereinander liegen (ABCABC)?

**Fundstelle:** A9 Aufgabenkarte Nr. 11 und ihr Beispiel

> Habe in einer Schlange ein sich wiederholendes Muster aus min. 3 versch. Farben.

> Ein Spieler hat folgende Karten in seiner Schlange: Rot - Blau - Grün - Rot - Blau - Grün.

**Möglichkeiten:**

- **a)** Das Muster liegt mindestens zweimal direkt hintereinander; es ist eine beliebige Kartenfolge mit mindestens drei verschiedenen Farben (ABCABC, aber auch AABCAABC). Folge: Auch Muster mit Reihen zählen.
- **b)** Direkt hintereinander, und jede Farbe kommt im Muster genau einmal vor (ABCABC, ABCDABCD). Folge: Nur die Form aus dem Beispiel und ihre längeren Verwandten zählen.
- **c)** Die Wiederholung darf durch andere Karten getrennt sein (ABC … ABC). Folge: Die Aufgabe ist deutlich leichter.

**Vorschlag:** a. Vorschlag des Orchestrators: Das Beispiel zeigt eine direkte Wiederholung, der Kartentext verlangt aber nur drei verschiedene Farben im Muster, nicht jede Farbe genau einmal.

**Betroffene Tasks:** nennt die Frage: X2. Hängt davon ab: K4 (Abnahmekriterium 1).

**Antwort:** —

**Datum:** —

### G8: „Farbkombination“, „Gelber Schatz“ und „Lila Riese“

**Frage:** „Farbkombination": Müssen die fünf Karten nebeneinander liegen? Zählen Joker bei „Gelber Schatz" und „Lila Riese" mit?

**Fundstelle:** A9 Aufgabenkarten Nr. 3, 14 und 15; A9 Beispiel und „Wichtig für Sonderkarten“

> Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange.

> Ein Spieler hat bereits eine Vierergruppe blauer Karten.

> Bilde eine Gruppe aus min. 6 gelben Karten.

> Bilde eine ununterbrochene Reihe aus min. 5 violetten Karten.

> Regenbogenschlange und Farbenfusion zählen für Aufgaben als Karte einer Farbe, und zwar als die Farbe, mit der die Aufgabe erfüllt ist.

> Die Karten unter einer Farbenfusion zählen nicht einzeln.

**Möglichkeiten:**

Teil 1, „Farbkombination“:

- **a)** Die fünf Karten müssen nebeneinander liegen, also eine Gruppe von fünf bilden. Folge: Die Aufgabe ist eine Fünfergruppe beliebiger Farbe.
- **b)** Fünf Karten gleicher Farbe irgendwo in derselben Schlange genügen. Folge: Auch getrennte Gruppen derselben Farbe zählen zusammen.

Teil 2, Joker bei „Gelber Schatz“ und „Lila Riese“:

- **c)** Joker zählen mit, als Gelb beziehungsweise Violett; eine Farbenfusion zählt als eine Karte. Folge: Gilt wie bei allen Aufgaben nach A9.
- **d)** Nur echte gelbe beziehungsweise violette Farbkarten zählen. Folge: Ausnahme von der Jokerregel in A9 für diese zwei Aufgaben.

**Vorschlag:** b, c. Vorschlag des Orchestrators: Anders als „Gelber Schatz“ (Gruppe) und „Lila Riese“ (ununterbrochene Reihe) verlangt der Text von „Farbkombination“ kein Nebeneinander; Teil 2 folgt der allgemeinen Jokerregel in A9.

**Betroffene Tasks:** nennt die Frage: X2. Hängt davon ab: K4 (Abnahmekriterium 1).

**Antwort:** —

**Datum:** —

### G9: Gruppe nur aus Jokern

**Frage:** Zählt eine Gruppe nur aus Jokern (drei nebeneinander) für Vielfaltbonus und „Farbharmonie"?

**Fundstelle:** A11 Punkt 1 und 2 (Vielfaltbonus); A7.3; A9 Aufgabenkarte Nr. 2

> Regenbogenschlange und Farbenfusion zählen auch für den Vielfaltbonus als ihre Farbe. Eine Gruppe mit einem Joker ist also eine gültige Gruppe dieser Farbe.

> Regenbogenschlangen und Farbfusionen können als jede Farbe zählen, um eine Farbgruppe zu vervollständigen oder zu verlängern.

> Muss Teil einer Dreiergruppe (oder länger) sein, um die Gruppe zu vervollständigen

> Habe in deinen Schlangen mindestens eine Dreiergruppe jeder Farbe.

**Möglichkeiten:**

- **a)** Ja, drei Joker nebeneinander sind eine gültige Gruppe einer frei wählbaren Farbe, für den Vielfaltbonus und für „Farbharmonie“. Folge: Joker sind überall gleich behandelt.
- **b)** Nein, eine Gruppe braucht mindestens eine echte Farbkarte; reine Jokergruppen zählen weder für den Vielfaltbonus noch für „Farbharmonie“. Folge: Eine Zusatzregel für reine Jokergruppen.

Hinweis des Orchestrators: Drei Farbenfusionen nebeneinander bringen nach A11 Punkte. Die Antwort betrifft deshalb auch die Gruppenpunkte; sag bitte dazu, falls dort etwas anderes gelten soll.

**Vorschlag:** a. Vorschlag des Orchestrators: Nach A11 zählen Joker als jede Farbe; eine Sonderregel für reine Jokergruppen nennt die Website nicht, und eine einheitliche Regel für Wertung, Bonus und Aufgaben ist am leichtesten zu verstehen.

**Betroffene Tasks:** nennt die Frage: keine. Hängt davon ab: E10 (Vielfaltbonus, Jokergruppen), X2 („Farbharmonie“), E5 (Grenzfall „drei Joker nebeneinander“).

**Antwort:** —

**Datum:** —

### G10: Schlangenkorb als Karte

**Frage:** Schlangenkorb: Liegt er auf der Hand (zählt zu den 5)? Kostet sein Einsatz die Sonderkarte des Zuges? Sind die vier Beispiele die vollständige Liste der Effekte?

**Fundstelle:** A7.10 Schlangenkorb des Glücks; dazu A5

> Diese einzigartige Karte wird zu Beginn des Spiels unter die anderen Karten gemischt. Der Spieler, der sie zieht, kann sie einmal während des Spiels einsetzen, um einen der folgenden Boni zu erhalten.

> Wähle einen der verfügbaren Bonuseffekte

> Die Karte wird nach der Nutzung aus dem Spiel entfernt

> Optional eine Sonderkarte, um deren Effekt auszulösen (kann an beliebiger Stelle eingefügt werden)

**Möglichkeiten:**

Teil 1, wo der Korb liegt:

- **a)** Auf der Hand; er zählt zu den 5 Handkarten. Folge: Er belegt einen Handplatz, bis er eingesetzt ist.
- **b)** Er wird beim Ziehen offen vor den Spieler gelegt und sofort durch eine neue Karte ersetzt. Folge: Er kostet keinen Handplatz.

Teil 2, Einsatz im Zug:

- **c)** Der Einsatz ist die Sonderkarte des Zuges. Folge: In diesem Zug ist keine weitere Sonderkarte erlaubt.
- **d)** Der Einsatz kommt zusätzlich, wie bei Comeback- und Risiko-Karte. Folge: Daneben ist noch eine Sonderkarte erlaubt.

Teil 3, Liste der Effekte:

- **e)** Die vier genannten Boni sind die vollständige Liste. Folge: Genau vier Effekte werden gebaut.
- **f)** Es gibt weitere Boni; du nennst sie. Folge: Die Liste wird vor X6 ergänzt.

**Vorschlag:** a, c, e. Vorschlag des Orchestrators: A1 führt den Korb als Sonderkarte, die mit den anderen gemischt und gezogen wird; als Sonderkarte füllt er nach A5 den Sonderkarten-Platz des Zuges; eine weitere Liste nennt die Website nicht.

**Betroffene Tasks:** nennt die Frage: X6. Hängt davon ab: E1 (Material und Platzhalter), X3 (Zusatzaktionen), K4 (Abnahmekriterium 2), O10 (Abnahmekriterium 3).

**Antwort:** —

**Datum:** —

### G11: Korb „Ziehe 3, spiele bis zu 2“

**Frage:** „Ziehe 3 Karten und spiele sofort bis zu 2 davon": zusätzlich zu den Karten des Zuges, beliebige Arten, auch ein gezogener Verdoppler? Was bei weniger als 3 Karten im Stapel?

**Fundstelle:** A7.10 Schlangenkorb des Glücks; dazu A7.8, A5 und A10

> Ziehe 3 zusätzliche Karten und spiele sofort bis zu 2 davon aus

> Kann nicht mit anderen zugerweiternden Effekten kombiniert werden

> Hast du am Ende deines Zuges mehr als 5 Karten auf der Hand, lege die überzähligen Karten auf deinen Ablagestapel.

> Wer die letzte Karte vom Nachziehstapel zieht, spielt seinen Zug normal zu Ende.

**Möglichkeiten:**

Teil 1, zusätzlich und welche Arten:

- **a)** Die bis zu 2 Karten kommen zusätzlich zu den Karten des Zuges, in beliebiger Art (auch zwei Farbkarten oder zwei Sonderkarten). Folge: Ein starker Zug mit bis zu vier Karten.
- **b)** Zusätzlich, aber zusammen höchstens eine Farbkarte und eine Sonderkarte. Folge: Weniger stark, die Kartenarten bleiben ausgewogen.

Teil 2, ein gezogener Verdoppler:

- **c)** Er darf nicht mit Wirkung gespielt werden, weil der Korb schon den Zug erweitert (A7.8). Folge: Kein zweiter Zug über den Korb.
- **d)** Er darf gespielt werden und gibt einen zweiten Zug. Folge: Widerspricht „nicht kombinierbar“ in A7.8.

Teil 3, weniger als 3 Karten im Stapel:

- **e)** Man zieht, was da ist; wer so die letzte Karte zieht, spielt seinen Zug zu Ende, dann beginnt die Schlussrunde (A10). Folge: Der Korb kann das Spielende einleiten.
- **f)** Der Bonus ist nicht wählbar, wenn weniger als 3 Karten im Stapel liegen. Folge: Gegen Spielende fällt dieser Bonus weg.

Nicht gespielte gezogene Karten bleiben auf der Hand; über 5 Karten wird am Zugende abgelegt (A5).

**Vorschlag:** a, c, e. Vorschlag des Orchestrators: „zusätzliche Karten“ und „bis zu 2 davon“ nennen keine Arten; A7.8 schliesst einen Verdoppler neben einem anderen zugerweiternden Effekt aus; A10 regelt den leeren Stapel bereits.

**Betroffene Tasks:** nennt die Frage: X6. Hängt davon ab: X3 (Ziehen mitten im Zug, Auslöser der Schlussrunde), E2 (Schlussrunde).

**Antwort:** —

**Datum:** —

### G12: Korb „Tausche bis zu 2 Karten“

**Frage:** „Tausche bis zu 2 Karten aus deiner Schlange mit Handkarten": beliebige Karten, gleicher Platz, getauschte Karte auf die Hand?

**Fundstelle:** A7.10 Schlangenkorb des Glücks

> Tausche bis zu 2 Karten aus deiner Schlange mit Karten aus deiner Hand

> Entferne eine Schlangenblockade aus deiner Schlange ODER entferne eine Sonderkarte aus einer gegnerischen Schlange

**Möglichkeiten:**

Teil 1, welche Karten:

- **a)** Nur Farbkarten gegen Farbkarten. Folge: Blockaden, Joker und Fusionen bleiben, wo sie sind.
- **b)** Beliebige Karten in beide Richtungen, auch Sonderkarten aus der Schlange und von der Hand. Folge: Man kann damit auch eine Blockade aus der eigenen Schlange holen, was schon der dritte Bonus kann.
- **c)** Aus der Schlange jede Karte, von der Hand nur Farbkarten und Regenbogenschlangen. Folge: Die Schlange bleibt farbig, eine Blockade lässt sich gegen eine Farbkarte tauschen.

Teil 2, Platz und Verbleib:

- **d)** Die Handkarte kommt an den Platz der getauschten Karte; die getauschte Karte kommt auf die Hand. Folge: Die Handgrösse bleibt gleich.
- **e)** Die Handkarte kommt an den Platz; die getauschte Karte kommt auf den eigenen Ablagestapel. Folge: Die Hand wird kleiner und am Zugende aufgefüllt.

**Vorschlag:** a, d. Vorschlag des Orchestrators: „Tausche“ heisst Platz gegen Platz mit Rückgabe auf die Hand; Sonderkarten auszuschliessen vermeidet eine Überschneidung mit dem dritten Bonus.

**Betroffene Tasks:** nennt die Frage: X6. Hängt davon ab: K4 (Abnahmekriterium 2), O10 (Abnahmekriterium 3).

**Antwort:** —

**Datum:** —

### G13: Korb „Sonderkarte aus gegnerischer Schlange entfernen“

**Frage:** „Sonderkarte aus gegnerischer Schlange entfernen": welche Karten (auch Blockade), abwehrbar mit Farbenschutz, auf wessen Ablagestapel?

**Fundstelle:** A7.10 Schlangenkorb des Glücks; dazu A7.4, A6 und D10 in Teil D

> Entferne eine Schlangenblockade aus deiner Schlange ODER entferne eine Sonderkarte aus einer gegnerischen Schlange

> Schlangenblockaden in gegnerischen Schlangen können nicht mit Option c) entfernt werden

> Wird eine Farbenfusion entfernt, werden die darunter liegenden Karten wieder zu einzelnen Karten

> Gegen jede Sonderkarte eines Gegners, die mich oder meine Schlange trifft, auch Farbenfusion, Schlangenhäutung und Regenbogenschlange.

> Gefressene Karten kommen auf den Ablagestapel von Spieler A.

**Möglichkeiten:**

Teil 1, welche Sonderkarten:

- **a)** Jede Sonderkarte, auch eine Schlangenblockade, eine Regenbogenschlange oder eine Farbenfusion (deren Karten wieder einzeln liegen). Folge: Der Korb kann, anders als Schlangenfrass, gegnerische Blockaden entfernen.
- **b)** Jede ausser der Schlangenblockade, wie bei Schlangenfrass c). Folge: Gegnerische Blockaden bleiben unantastbar.

Teil 2, Abwehr:

- **c)** Abwehrbar mit Farbenschutz (D10). Folge: Der Gegner wird gefragt.
- **d)** Nicht abwehrbar. Folge: Ausnahme von D10.

Teil 3, Ablagestapel:

- **e)** Die entfernte Karte kommt auf den Ablagestapel des Spielers, der den Korb nutzt, wie gefressene Karten. Folge: Gleich wie Schlangenfrass.
- **f)** Sie kommt auf den Ablagestapel des Spielers, dem die Schlange gehört. Folge: Er könnte sie mit der Risiko-Aktion 4 zurückholen.

**Vorschlag:** a, c, e. Vorschlag des Orchestrators: Der Text sagt „eine Sonderkarte“ ohne Ausnahme; der Korb ist eine Sonderkarte und trifft eine gegnerische Schlange, also gilt D10; für entfernte Karten gibt A6 den Ablagestapel des Angreifers vor.

**Betroffene Tasks:** nennt die Frage: X6. Hängt davon ab: E4 (Reaktionsablauf), E6 (Entfernen einer Farbenfusion), K3 (Abwehr der KI).

**Antwort:** —

**Datum:** —

### G14: Korb „Zwei zusätzliche Aktionen“

**Frage:** „Zwei zusätzliche Aktionen": dieselben drei Möglichkeiten wie bei der Comeback-Karte? Gelten die Grenzen (eine Farbkarte, eine Sonderkarte) dann nicht? Zweite Farbenfusion, zweiter Verdoppler?

**Fundstelle:** A7.10 Schlangenkorb des Glücks; A8.1 Comeback-Karte; dazu A7.7 und A7.8

> Führe zwei zusätzliche Aktionen in diesem Zug aus

> Bei Aktivierung erhält der Spieler zwei zusätzliche Aktionen in seinem Zug. Diese zusätzlichen Aktionen können sein:

> Eine Farbkarte aus der Hand ausspielen

> Eine Sonderkarte aus der Hand ausspielen

> Zwei Karten abwerfen und drei neue vom Nachziehstapel ziehen

> Der Spieler kann diese zwei Aktionen in beliebiger Reihenfolge mit seinen normalen Zugaktionen ausführen und darf auch zweimal die gleiche Aktion wählen.

> Pro Zug darf nur eine Farbenfusion durchgeführt werden

> Kann nicht mit anderen zugerweiternden Effekten kombiniert werden

**Möglichkeiten:**

Teil 1, welche Aktionen:

- **a)** Dieselben drei wie bei der Comeback-Karte. Folge: Ein gemeinsamer Baustein für Korb und Comeback.
- **b)** Andere Aktionen; du nennst sie. Folge: Eigener Baustein für den Korb.

Teil 2, die Grenze von einer Farbkarte und einer Sonderkarte:

- **c)** Die Zusatzaktionen kommen obendrauf, auch zweimal dieselbe Art (wie A8.1). Folge: Bis zu zwei weitere Farb- oder Sonderkarten im Zug.
- **d)** Obendrauf, aber zusammen höchstens eine weitere Farbkarte und eine weitere Sonderkarte. Folge: Abweichung von A8.1 für den Korb.

Teil 3, eine zweite Farbenfusion:

- **e)** Erlaubt, wenn sie als Zusatzaktion gespielt wird. Folge: Zwei Fusionen in einem Zug sind möglich.
- **f)** Nicht erlaubt; „pro Zug nur eine Farbenfusion“ gilt weiter. Folge: Die Zusatzaktion braucht dann eine andere Sonderkarte.

Teil 4, ein Verdoppler als Zusatzaktion:

- **g)** Nicht mit Wirkung, weil der Verdoppler nicht mit anderen zugerweiternden Effekten kombinierbar ist. Folge: Kein zweiter Zug über den Korb.
- **h)** Mit Wirkung: Er gibt einen zweiten Zug. Folge: Widerspricht A7.8.

**Vorschlag:** a, c, f, g. Vorschlag des Orchestrators: Die Comeback-Karte gibt die einzige ausdrückliche Liste solcher Aktionen; die Grenzen aus A7.7 und A7.8 nennen keine Ausnahme.

**Betroffene Tasks:** nennt die Frage: X3. Hängt davon ab: X6 (Schlangenkorb), X4 (gemeinsamer Baustein mit Comeback), E7 (Grenze für die Farbenfusion, siehe F14).

**Antwort:** —

**Datum:** —

### G15: Zugerweiternde Effekte im selben Zug

**Frage:** „Nicht mit anderen zugerweiternden Effekten kombinierbar": Schliessen sich Verdoppler, Comeback und Schlangenkorb im selben Zug aus?

**Fundstelle:** A7.8 Verdoppler; A8 Erweiterung (A8.1 Comeback-Karte, A8.2 Risiko-Belohnungs-Karte)

> Kann nicht mit anderen zugerweiternden Effekten kombiniert werden

> Pro Spieler und Zug darf nur eine Comeback-Karte gespielt werden.

> Die Nutzung einer Comeback-Karte zählt nicht als reguläre Aktion in deinem Zug. Du darfst also zusätzlich zu dieser Sonderaktion deine normalen Zugaktionen durchführen.

> Die Nutzung einer Risiko-Belohnungs-Karte zählt nicht als reguläre Aktion in deinem Zug.

**Möglichkeiten:**

- **a)** Ja: Verdoppler, Comeback-Karte und die zugerweiternden Boni des Korbs („Ziehe 3, spiele bis zu 2“, „Zwei zusätzliche Aktionen“) schliessen sich gegenseitig aus; Risiko-Karten zählen nicht dazu. Folge: Je Zug höchstens eine dieser Erweiterungen.
- **b)** Nur der Verdoppler schliesst die anderen aus; Comeback und Korb dürfen zusammen genutzt werden. Folge: Sehr starke Aufholzüge sind möglich.
- **c)** Wie a, und auch die Risiko-Aktion 2 („Zusätzliche Farbkarte spielen“) zählt als zugerweiternd. Folge: Risiko-Karten sind neben Verdoppler, Comeback oder Korb nur eingeschränkt nutzbar.

**Vorschlag:** a. Vorschlag des Orchestrators: A7.8 spricht allgemein von „anderen zugerweiternden Effekten“; die Risiko-Karten haben mit „eine pro Runde“ eine eigene Grenze, und die Website erlaubt ihre normalen Zugaktionen ausdrücklich daneben.

**Betroffene Tasks:** nennt die Frage: X3. Hängt davon ab: E3 (Verdoppler), X4 (Comeback), X5 (Risiko), X6 (Schlangenkorb).

**Antwort:** —

**Datum:** —

### G16: Comeback-Bedingung und Zeitpunkt

**Frage:** Schlangenlänge für die Comeback-Bedingung: Zählt jede Karte eins, die Farbenfusion eins oder drei, ein Spieler ohne Schlange null? Ist die Karte später im Zug und im zweiten Zug nach Verdoppler einsetzbar?

**Fundstelle:** A8.1 Comeback-Karte; dazu A7.7

> Die Comeback-Karte kann nur gespielt werden, wenn die Bedingungen zu Beginn des eigenen Zuges erfüllt sind.

> Die Bedingung ist erfüllt, wenn die längste Schlange des Spielers mindestens 5 Karten kürzer ist als die längste Schlange auf dem Tisch.

> Nur während des eigenen Zuges spielbar.

> Die Farbenfusion liegt oben auf den fusionierten Karten und markiert diese als eine Einheit

**Möglichkeiten:**

Teil 1, Zählung der Schlangenlänge:

- **a)** Jede Karte in der Schlange zählt eins, auch Sonderkarten; eine Farbenfusion samt ihren zwei Karten zählt eins. Folge: Gezählt wird, was man in der Reihe sieht.
- **b)** Wie a, aber eine Farbenfusion zählt drei (die Fusion und ihre zwei Karten). Folge: Fusionen machen eine Schlange länger.
- **c)** Nur Farbkarten zählen, Sonderkarten nicht. Folge: Blockaden in der eigenen Schlange helfen beim Aufholen.

Teil 2, Spieler ohne Schlange:

- **d)** Er hat die Länge null; die Bedingung kann erfüllt sein. Folge: Wer keine Schlange hat, kann die Karte nutzen, sobald irgendwo eine Schlange mit 5 Karten liegt.
- **e)** Ohne Schlange ist die Karte nicht einsetzbar. Folge: Die Karte hilft nur, wer schon eine Schlange hat.

Teil 3, Zeitpunkt des Einsatzes:

- **f)** Die Bedingung wird zu Zugbeginn geprüft; ist sie erfüllt, darf die Karte irgendwann in diesem Zug eingesetzt werden, im zweiten Zug nach Verdoppler nur, wenn G15 das zulässt. Folge: Der Spieler kann erst eine Karte spielen und dann entscheiden.
- **g)** Nur gleich zu Zugbeginn, vor der ersten Karte. Folge: Die Entscheidung fällt vor jedem anderen Spielzug.

**Vorschlag:** a, d, f. Vorschlag des Orchestrators: Gezählt werden die Karten, die in der Reihe liegen, und A7.7 nennt die Fusion eine Einheit; die Website prüft die Bedingung zu Zugbeginn und erlaubt den Einsatz „während des eigenen Zuges“.

**Betroffene Tasks:** nennt die Frage: X4. Hängt davon ab: X3 (Zusatzaktionen), K4 (Abnahmekriterium 2), O10 (Abnahmekriterium 3).

**Antwort:** —

**Datum:** —

### G17: Comeback-Aktion „Zwei abwerfen, drei ziehen“

**Frage:** „Zwei Karten abwerfen, drei ziehen": mit weniger als zwei Handkarten, bei weniger als drei im Stapel, in der Schlussrunde, zweimal?

**Fundstelle:** A8.1 Comeback-Karte; dazu A10

> Zwei Karten abwerfen und drei neue vom Nachziehstapel ziehen

> Der Spieler kann diese zwei Aktionen in beliebiger Reihenfolge mit seinen normalen Zugaktionen ausführen und darf auch zweimal die gleiche Aktion wählen.

> Das Spiel endet, wenn der Nachziehstapel leer ist.

> Danach machen alle anderen Spieler noch je einen letzten Zug, ohne nachzuziehen.

**Möglichkeiten:**

Teil 1, weniger als zwei Handkarten:

- **a)** Nicht wählbar. Folge: Wer nur eine Karte hält, wählt eine andere Zusatzaktion.
- **b)** Man wirft ab, was man hat, und zieht trotzdem drei. Folge: Mit leerer Hand bringt die Aktion drei Karten geschenkt.

Teil 2, weniger als drei Karten im Stapel:

- **c)** Man zieht, was da ist; wer die letzte Karte zieht, spielt seinen Zug zu Ende, dann beginnt die Schlussrunde (A10). Folge: Die Aktion kann das Spielende einleiten.
- **d)** Nicht wählbar. Folge: Gegen Spielende fällt diese Aktion weg.

Teil 3, in der Schlussrunde (der Stapel ist dann leer):

- **e)** Nicht wählbar, weil nichts gezogen werden kann. Folge: In der Schlussrunde bleiben nur die beiden Ausspiel-Aktionen.
- **f)** Wählbar als blosses Abwerfen ohne Ziehen. Folge: Die Aktion dient nur noch dem Loswerden von Karten.

Teil 4, zweimal in einem Zug:

- **g)** Erlaubt, wie A8.1 es für alle Zusatzaktionen sagt. Folge: Bis zu vier Karten abwerfen und sechs ziehen.
- **h)** Diese Aktion nur einmal je Zug. Folge: Ausnahme von A8.1.

**Vorschlag:** a, c, e, g. Vorschlag des Orchestrators: „zwei Karten abwerfen“ setzt zwei Karten voraus; A10 regelt den leeren Stapel; A8.1 erlaubt ausdrücklich „zweimal die gleiche Aktion“.

**Betroffene Tasks:** nennt die Frage: X4. Hängt davon ab: X3 (Ziehen mitten im Zug, Auslöser der Schlussrunde), E2 (Schlussrunde).

**Antwort:** —

**Datum:** —

### G18: „Pro Runde eine Risiko-Karte“

**Frage:** „Pro Runde eine Risiko-Karte": pro eigenem Zug? Gilt der zweite Zug nach Verdoppler als neue Runde?

**Fundstelle:** A8.2 Risiko-Belohnungs-Karte; D11 in Teil D

> Pro Runde darfst du maximal eine Risiko-Belohnungs-Karte verwenden.

> Pro Runde darfst du nur eine Risiko-Belohnungs-Karte spielen.

> Die Risiko-Belohnungs-Karten bieten dir die Möglichkeit, eine zusätzliche Sonderaktion in deinem Zug durchzuführen.

> Nein, nur ein Verdoppler pro Runde.

**Möglichkeiten:**

- **a)** „Runde“ heisst der eigene Zug samt zweitem Zug nach einem Verdoppler: darin höchstens eine Risiko-Karte. Folge: Ein Verdoppler gibt keine zweite Risiko-Karte.
- **b)** „Runde“ heisst Teilzug: Im zweiten Zug nach einem Verdoppler ist eine weitere Risiko-Karte erlaubt. Folge: Mit Verdoppler können beide Risiko-Karten in einem Zug verbraucht werden.

**Vorschlag:** a. Vorschlag des Orchestrators: Bei D11 („nur ein Verdoppler pro Runde“) hast du „Runde“ für den ganzen eigenen Zug samt zweitem Zug verwendet.

**Betroffene Tasks:** nennt die Frage: X5. Hängt davon ab: E3 (Teilzug), K4 (Abnahmekriterium 2).

**Antwort:** —

**Datum:** —

### G19: Verbleib der aufgedeckten Karte bei den Risiko-Aktionen

**Frage:** Wohin kommt die aufgedeckte Karte bei Aktion 2 (Misserfolg), Aktion 3 (Erfolg, samt der ersetzten Schlangenkarte) und Aktion 4 (beide Fälle)?

**Fundstelle:** A8.2 Risiko-Belohnungs-Karte, Aktionen 1 bis 4

> Lege die gezogene Farbkarte auf deine Hand und ziehe anschliessend 2 weitere Karten.

> Die aufgedeckte Sonderkarte musst du einem Gegenspieler deiner Wahl geben.

> In jedem Fall behältst du die gezogene Farbkarte.

> Deine geplante Farbkarte wandert auf die Hand eines beliebigen Gegenspielers deiner Wahl.

> Die gezogene Karte ist eine Farbkarte mit dem gleichen Punktewert (1, 2 oder 3 Punkte) wie deine gewählte Schlange-Karte. Du darfst den Tausch ausführen.

> Sonderkarte: Die Aktion scheitert vollständig. Die Sonderkarte kommt auf deinen Ablagestapel. Die Schlange bleibt unverändert.

> Zwei Karten vom Nachziehstapel ziehen

**Möglichkeiten:**

Teil 1, Aktion 2 bei Misserfolg (aufgedeckte Sonderkarte):

- **a)** Auf den eigenen Ablagestapel, wie bei Aktion 3. Folge: Der Spieler verliert die Karte.
- **b)** Auf die eigene Hand. Folge: Der Misserfolg bringt dem Spieler trotzdem eine Karte.

Teil 2, Aktion 3 bei Erfolg, die aufgedeckte Farbkarte:

- **c)** Auf die eigene Hand, wie bei den Aktionen 1 und 2. Folge: Erfolg bringt zusätzlich eine Karte.
- **d)** Auf den eigenen Ablagestapel. Folge: Die aufgedeckte Karte dient nur der Prüfung.

Teil 3, Aktion 3 bei Erfolg, die ersetzte Schlangenkarte:

- **e)** Auf die eigene Hand; es ist ein Tausch. Folge: Die Handgrösse bleibt gleich.
- **f)** Auf den eigenen Ablagestapel. Folge: Die Hand wird kleiner.

Teil 4, Aktion 4, die aufgedeckte Karte:

- **g)** Bei Erfolg auf die eigene Hand, bei Misserfolg auf den eigenen Ablagestapel. Folge: Gleich wie bei den Aktionen 1 und 3.
- **h)** In beiden Fällen auf den eigenen Ablagestapel. Folge: Die aufgedeckte Karte dient nur der Prüfung.
- **i)** Bei Misserfolg an den begünstigten Gegner, wie bei Aktion 1. Folge: Der Gegner bekommt neben seiner Ersatzbelohnung noch eine Karte.

**Vorschlag:** a, c, e, g. Vorschlag des Orchestrators: Wo die Website es sagt (Aktionen 1 bis 3), behält der Spieler eine aufgedeckte Farbkarte und legt eine aufgedeckte Sonderkarte ab; „Karten tauschen“ heisst Platz gegen Hand.

**Betroffene Tasks:** nennt die Frage: X5. Hängt davon ab: X3 (Karten mitten im Zug aufdecken), O10 (Abnahmekriterium 3).

**Antwort:** —

**Datum:** —

### G20: Risiko-Aktion 2 „Zusätzliche Farbkarte spielen“

**Frage:** Aktion 2: Muss die „geplante Farbkarte" vorher benannt werden? Wer wählt bei Misserfolg zwischen ihr und der obersten Stapelkarte? Was gilt ohne Farbkarte auf der Hand? Nur eigene Schlange?

**Fundstelle:** A8.2 Risiko-Belohnungs-Karte, Aktion 2; zum Vergleich Aktion 3

> Du darfst versuchen, eine zusätzliche Farbkarte an ein beliebiges Ende deiner Schlange anzulegen.

> Du spielst sofort eine zusätzliche Farbkarte an deiner eigenen Schlange an. Du kannst dafür die gezogene Karte verwenden oder eine Karte aus deiner Hand nutzen.

> Deine geplante Farbkarte wandert auf die Hand eines beliebigen Gegenspielers deiner Wahl. Alternativ darf dieser Spieler die oberste Karte vom Nachziehstapel ziehen und sie auf die Hand nehmen.

> Benenne vor dem Risiko-Check, welche Karte in deiner Schlange du tauschen möchtest

**Möglichkeiten:**

Teil 1, Benennen der geplanten Farbkarte:

- **a)** Ja, vor dem Aufdecken benennt der Spieler eine Farbkarte seiner Hand, wie bei Aktion 3. Folge: Der Misserfolg trifft eine vorher bekannte Karte.
- **b)** Nein; erst bei Misserfolg wählt er, welche Farbkarte seiner Hand er abgibt. Folge: Er gibt dann die schwächste ab.

Teil 2, Wahl bei Misserfolg:

- **c)** Der begünstigte Gegner wählt zwischen der geplanten Farbkarte und der obersten Stapelkarte. Folge: Der Gegner muss gefragt werden.
- **d)** Der Spieler am Zug wählt. Folge: Der Gegner wird nicht gefragt.

Teil 3, keine Farbkarte auf der Hand:

- **e)** Aktion 2 ist dann nicht wählbar. Folge: Passt zum Benennen in Teil 1 a.
- **f)** Wählbar; bei Erfolg wird die aufgedeckte Karte gespielt, bei Misserfolg bekommt der Gegner die oberste Stapelkarte. Folge: Die Aktion geht auch mit einer Hand ohne Farbkarten.

Teil 4, Ziel der zusätzlichen Farbkarte:

- **g)** Nur ein Ende einer eigenen Schlange, wie der Text sagt. Folge: Ausnahme von D9 für diese Aktion.
- **h)** Jedes Ende jeder Schlange (D9). Folge: Die Aktion kann auch einen Gegner stören.

**Vorschlag:** a, c, e, g. Vorschlag des Orchestrators: Aktion 3 verlangt das Benennen vor der Prüfung ausdrücklich; „darf dieser Spieler“ gibt die Wahl dem Gegner; der Text nennt zweimal die eigene Schlange.

**Betroffene Tasks:** nennt die Frage: X5. Hängt davon ab: X3 (Entscheidung eines Gegners), O10 (Abnahmekriterium 3).

**Antwort:** —

**Datum:** —

### G21: Risiko-Aktion 3 „Karten tauschen“

**Frage:** Aktion 3: Welche Handkarte darf ersetzen, und wird bei „anderer Punktewert" die aufgedeckte Karte vor oder nach der gewählten Karte eingefügt?

**Fundstelle:** A8.2 Risiko-Belohnungs-Karte, Aktion 3

> Du möchtest eine Farbkarte in deiner Schlange durch eine Karte von deiner Hand ersetzen.

> Farbkarte mit anderem Punktewert: Lege sie zusätzlich an die Position der gewählten Karte. Du hast nun zwei Farbkarten hintereinander an dieser Stelle.

**Möglichkeiten:**

Teil 1, welche Handkarte ersetzt:

- **a)** Jede Farbkarte der Hand. Folge: Der Spieler wählt frei die passende Farbe.
- **b)** Jede Handkarte, auch eine Sonderkarte wie die Regenbogenschlange. Folge: Man kann eine Farbkarte durch einen Joker ersetzen.
- **c)** Nur eine Farbkarte mit demselben Punktewert wie die ersetzte. Folge: Getauscht wird nur innerhalb einer Wertklasse.

Teil 2, Platz der zusätzlichen Karte bei anderem Punktewert:

- **d)** Der Spieler wählt, ob davor oder dahinter. Folge: Er legt sie dorthin, wo sie ihm am meisten nützt.
- **e)** Immer direkt dahinter, in Leserichtung der Schlange. Folge: Fester Platz, keine Wahl.

**Vorschlag:** a, d. Vorschlag des Orchestrators: Der Text nennt eine Farbkarte in der Schlange und „eine Karte von deiner Hand“; Farbkarten auf beiden Seiten passen zur Prüfung über den Punktewert. „An die Position der gewählten Karte“ legt keine Seite fest.

**Betroffene Tasks:** nennt die Frage: X5. Hängt davon ab: O10 (Abnahmekriterium 3), K4 (Abnahmekriterium 2).

**Antwort:** —

**Datum:** —

### G22: Risiko-Aktion 4 „Karten aus Ablage- oder Nachziehstapel“

**Frage:** Aktion 4: Zählt die aufgedeckte Karte zu den „zwei Karten vom Nachziehstapel"? Was bei leerem Ablagestapel? Wie kann eine Risiko-Karte auf einem Ablagestapel liegen, wenn sie aus dem Spiel kommt?

**Fundstelle:** A8.2 Risiko-Belohnungs-Karte, Aktion 4 und Regeln für alle Risiko-Karten; zum Vergleich Aktion 1

> Zwei Karten vom Nachziehstapel ziehen

> Eine beliebige Karte aus seinem Ablagestapel auf die Hand nehmen

> Risiko-Belohnungs-Karte sowie Schlangenkorb des Glücks können nicht vom Ablagestapel genommen werden.

> Nach der Nutzung kommt die Karte aus dem Spiel.

> Wenn du diese Aktion wählst, ziehst du im Erfolgsfall drei Karten vom Nachziehstapel auf deine Hand.

**Möglichkeiten:**

Teil 1, die aufgedeckte Karte bei Erfolg:

- **a)** Sie ist die erste der zwei Karten; der Spieler zieht eine weitere. Folge: Wie bei Aktion 1, wo die aufgedeckte Karte zu den drei zählt.
- **b)** Sie zählt nicht mit; er zieht zwei weitere. Folge: Erfolg bringt drei Karten.

Teil 2, leerer Ablagestapel:

- **c)** Dann bleibt nur die andere Möglichkeit: Bei Erfolg zieht der Spieler vom Nachziehstapel, bei Misserfolg der Gegner die oberste Karte. Folge: Die Aktion ist immer wählbar, solange der Nachziehstapel Karten hat.
- **d)** Aktion 4 ist bei leerem eigenem Ablagestapel nicht wählbar. Folge: Zu Spielbeginn fällt die Aktion oft weg.

Teil 3, Risiko-Karte und Schlangenkorb auf einem Ablagestapel:

- **e)** Der Satz ist nur eine Klarstellung; beide Karten kommen nach der Nutzung aus dem Spiel und liegen nie auf einem Ablagestapel. Folge: Nichts zu bauen.
- **f)** Es gibt einen Fall, in dem sie doch auf einem Ablagestapel landen (etwa ein Schlangenkorb, der als Überhand abgelegt wird); du nennst ihn. Folge: Der Ablagestapel braucht eine Sperre für diese Karten.

**Vorschlag:** a, c, e. Vorschlag des Orchestrators: Aktion 1 zählt die aufgedeckte Karte ausdrücklich mit; c hält die Aktion spielbar; die Website nennt keinen Weg auf den Ablagestapel.

**Betroffene Tasks:** nennt die Frage: X5. Hängt davon ab: X6 (Schlangenkorb nicht vom Ablagestapel zurückholbar), E2 (Überhand abwerfen).

**Antwort:** —

**Datum:** —

### G23: Risiko-Karte und Spielende

**Frage:** Ist eine Risiko-Karte bei leerem Stapel oder in der Schlussrunde spielbar? Wer löst die Schlussrunde aus, wenn ein Effekt oder ein Gegner die letzte Karte nimmt?

**Fundstelle:** A8.2 Risiko-Belohnungs-Karte; A10 Spielende

> Sobald du eine Risiko-Belohnungs-Karte ausspielst, deckst du die oberste Karte vom Nachziehstapel auf:

> Der gewählte Spieler darf die Sonderkarte direkt auf die Hand nehmen.

> Das Spiel endet, wenn der Nachziehstapel leer ist. Wer die letzte Karte vom Nachziehstapel zieht, spielt seinen Zug normal zu Ende.

**Möglichkeiten:**

Teil 1, leerer Stapel und Schlussrunde:

- **a)** Nicht spielbar, weil keine Karte aufgedeckt werden kann. Folge: In der Schlussrunde sind Risiko-Karten wertlos.
- **b)** Spielbar; ohne aufzudeckende Karte gilt sie als gescheitert, ohne Ersatzbelohnung. Folge: Man kann sie zum Schluss nur noch verbrauchen.

Teil 2, wer die Schlussrunde auslöst:

- **c)** Der Spieler am Zug, gleich wer die letzte Karte nimmt (auch ein begünstigter Gegner); er spielt seinen Zug zu Ende, dann hat jeder andere noch einen Zug. Folge: Die Schlussrunde zählt immer vom Spieler am Zug aus.
- **d)** Wer die letzte Karte tatsächlich nimmt; ist das ein Gegner, zählt die Schlussrunde von ihm aus. Folge: Das Spiel endet, bevor dieser Gegner wieder an der Reihe wäre.

**Vorschlag:** a, c. Vorschlag des Orchestrators: Die Risikoprüfung braucht eine aufgedeckte Karte; c hält A10 einfach, weil der Zug, in dem der Stapel leer wird, normal zu Ende gespielt wird.

**Betroffene Tasks:** nennt die Frage: X5. Hängt davon ab: X3 (Abnahmekriterium 2, Auslöser der Schlussrunde), E2 (Schlussrunde), X4 und X6 (Ziehen durch Comeback und Korb).

**Antwort:** —

**Datum:** —
