# Nachtrag für die Website schlangentanz.ch/rules

Stand 21.11.2026. Diese Antworten hat der Autor gegeben; sie gelten im Spiel schon, stehen aber noch nicht auf der Website. Quelle ist Teil D von `docs/GAME_SPEC.md` (dort „Website folgt“). Die Nummer in Klammern ist der Eintrag in Teil D.

Sobald ein Punkt auf der Website steht, übernimmt `npm run abgleich:website` ihn in Teil A, und in Teil D wird „Website folgt“ durch „Website übernommen am …“ ersetzt.

## Basis-Spiel

**Gibt ein Verdoppler im zweiten Zug einen dritten Zug?** (D11)  
Nein, nur ein Verdoppler pro Runde.

**Treffen zwei Schlangengruben denselben Spieler, bevor er ausgesetzt hat: setzt er einen oder zwei Züge aus?** (D14)  
Zwei Züge: Jede Schlangengrube kostet einen eigenen Zug und bleibt vor ihm liegen, bis er für sie ausgesetzt hat.

**Schlangenfrass c) frisst zwei Karten desselben Spielers: Wehrt ein Farbenschutz beide ab?** (D15)  
Ja: Ein Farbenschutz wehrt den ganzen Schlangenfrass für diesen Spieler ab, beide Karten bleiben liegen.

**Kann eine Sonderkarte (etwa die Regenbogenschlange) eine neue Schlange beginnen?** (D16)  
Nein, nur eine Farbkarte beginnt eine Schlange. Regenbogenschlange und Schlangenblockade brauchen eine bestehende Schlange.

**Farbendieb: Muss die gestohlene Karte in eine eigene Schlange, oder darf sie nach D9 in jede? Was gilt, wenn der Dieb keine Schlange hat?** (D17)  
Nur in eine eigene Schlange, an eine beliebige Stelle. Hat der Dieb keine Schlange, beginnt die gestohlene Karte eine neue eigene Schlange.

**Füllt ein aussetzender Spieler seine Hand auf? Darf er mit Farbenschutz reagieren?** (D18)  
Kein Auffüllen im ausgesetzten Zug; er füllt erst zu Beginn seines nächsten gespielten Zuges auf. Abwehr mit Farbenschutz bleibt erlaubt, auch zwischen Grube und ausgesetztem Zug.

**Farbenfusion: Gelten eine Farbkarte und eine Regenbogenschlange als „zwei Karten gleicher Farbe"?** (D20)  
Nein, nur zwei Farbkarten derselben Farbe dürfen fusioniert werden.

**Verfällt der letzte Zug eines Spielers, der in der Schlussrunde aussetzen muss? Darf man die Schlangengrube auf jemanden spielen, der keinen Zug mehr hat?** (D21)  
Ja, der letzte Zug verfällt. Die Schlangengrube darf auch in der Schlussrunde gespielt werden; trifft sie einen Spieler, der noch einen Zug hätte, setzt er aus und hat keinen letzten Zug mehr. Er darf sich mit Farbenschutz verteidigen.

**Gleichstand bei den Punkten: geteilter Sieg?** (D22)  
Ja, alle Punktgleichen gewinnen.

**Verdoppler im zweiten Zug: Darf er wirkungslos abgelegt werden?** (D23)  
Ja: Im zweiten Zug darf er wirkungslos auf den eigenen Ablagestapel; er zählt als Sonderkarte dieses Zuges, ein weiterer Zug folgt nicht. „Im zweiten Zug darfst du keinen weiteren Verdoppler spielen“ (A7.8) heisst also: kein weiterer Verdoppler mit Wirkung, kein weiterer Zug.

**Längste Farbkette: Gibt es eine Mindestlänge? Was gilt bei lauter Einzelkarten und für Spieler ohne Schlange?** (D24)  
Eine Kette zählt erst ab 3 Farbkarten derselben Farbe nebeneinander, nicht schon ab 2; Sonderkarten zählen nicht mit und unterbrechen sie (A11). Hat niemand eine solche Kette, bekommt niemand den Bonus; wer keine hat, bekommt ihn nie.

**Darf man eine Sonderkarte, die ein mögliches Ziel hätte, trotzdem ohne Wirkung ablegen?** (D25)  
Nein. Wirkungslos ablegen geht nur, wenn die Karte kein mögliches Ziel hat; ein Farbenschutz darf immer wirkungslos abgelegt werden.

**Schlangenhäutung: Muss sich die Reihenfolge ändern?** (D26)  
Ja, die Farbfolge im Abschnitt muss danach anders sein; eine unveränderte Anordnung wird abgelehnt.

**„Pro Zug nur eine Farbenfusion": Darf im zweiten Zug nach einem Verdoppler eine weitere gespielt werden?** (D27)  
Ja, je Zug eine: Im zweiten Zug nach einem Verdoppler ist wieder eine Farbenfusion erlaubt.

**Sind die Ablagestapel für alle vollständig einsehbar, oder nur die oberste Karte?** (D28)  
Alle Ablagestapel sind für alle vollständig einsehbar.

**Darf man die Schlangengrube auf einen Spieler spielen, der seinen letzten Zug schon gemacht hat?** (D29)  
Ja, erlaubt: Die Grube darf ihn treffen und geht ohne Wirkung auf den Ablagestapel.

**Wert einer Farbenfusion in einer Gruppe: wie eine Karte der Gruppenfarbe, oder die Summe der beiden Karten darunter?** (D30)  
Die Summe der beiden Karten darunter, nicht der Wert einer Karte der Gruppenfarbe. Die Fusion belegt einen Platz in der Gruppe und zählt dort als eine einzelne Karte (A7.7); eine Fusion über zwei roten Karten bildet allein also noch keine rote Dreiergruppe, sie braucht zwei weitere Karten.

**Zählt eine Gruppe nur aus Jokern (drei nebeneinander) für Vielfaltbonus und „Farbharmonie"?** (D31)  
Ja: Drei Joker nebeneinander sind eine gültige Gruppe einer frei wählbaren Farbe, für die Gruppenpunkte und für „Farbharmonie“, etwa drei Regenbogenschlangen in Folge oder zwei Regenbogenschlangen und eine Farbenfusion. Drei Regenbogenschlangen nebeneinander sind eine Gruppe mit 0 Punkten; Regenbogenschlange, Farbenfusion aus Grün und Grün, Regenbogenschlange ist eine Gruppe mit 6 Punkten. Für den Vielfaltbonus siehe die nächste Frage.

**Zählt eine Gruppe nur aus Regenbogenschlangen beim Vielfaltbonus als eigene Farbe?** (D32)  
Nein: Eine Gruppe nur aus Regenbogenschlangen bringt keine Farbe für den Vielfaltbonus; für die Gruppenwertung bleibt sie eine Gruppe mit 0 Punkten. In einer Gruppe mit Farbkarten zählt die Regenbogenschlange als deren Farbe, so wie Rot, Regenbogenschlange, Rot eine rote Gruppe ist. Eine Gruppe aus Regenbogenschlangen und einer Farbenfusion zählt beim Vielfaltbonus als die Farbe der Fusion, etwa Regenbogenschlange, Farbenfusion aus Grün und Grün, Regenbogenschlange als Grün.

## Erweiterung

**Ohne Erweiterung gibt es keine Aufgaben, keine Schlangenhäutung, keinen Vielfaltbonus (ein Schalter für alles). Richtig?** (D34)  
Ja, ein Schalter für die ganze Erweiterung: Ohne Erweiterung gibt es keine Aufgaben, keine Schlangenhäutung, keinen Schlangenkorb, keine Comeback- und Risiko-Karten und keinen Vielfaltbonus. Die Lobby hat genau einen Schalter.

**Geheime Aufgabe: Zählt sie, sobald sie in einem eigenen Zug einmal erfüllt war, oder muss sie am Spielende erfüllt sein?** (D35)  
Die geheime Aufgabe zählt, sobald sie einmal in einem eigenen Zug erfüllt war, wie eine offene Aufgabe; das Spiel merkt sich das verdeckt. Ein Gegner kann sie danach nicht mehr zerstören.

**Zählen für „Schlangenmeister" und „Schlangenrepertoire" als „ausgespielt": ein zur Abwehr gespielter Farbenschutz, eine wirkungslos abgelegte und eine abgewehrte Sonderkarte, der Schlangenkorb?** (D36)  
Für „Schlangenmeister“ und „Schlangenrepertoire“ zählt als ausgespielt jede Sonderkarte, die der Spieler aus der Hand gespielt hat: auch ein Farbenschutz zur Abwehr, eine wirkungslos abgelegte, eine abgewehrte und der Schlangenkorb.

**„Schlangentanz": Zählt nur eine Schlangenhäutung in der eigenen Schlange? Dürfen die zwei Gruppen aus zwei Häutungen stammen?** (D37)  
Für „Schlangentanz“ zählt nur eine Schlangenhäutung, die der Spieler selbst in einer eigenen Schlange spielt; eine Häutung in einer gegnerischen Schlange erfüllt die Aufgabe für niemanden. Beide Dreiergruppen müssen aus derselben Häutung entstehen, wie im Beispiel.

**„Vielfaltskönig" und „Farbenpracht": Braucht es zwei Schlangen, oder genügt eine?** (D38)  
„Vielfaltskönig“ braucht zwei Schlangen mit je mindestens vier Farben. Bei „Farbenpracht“ wird über alle vorhandenen Schlangen gezählt; eine genügt, wenn sie von jeder Farbe zwei Karten hat.

**„Symmetriemeister": Muss die Kartenzahl gerade sein? Dürfen Joker oder andere Sonderkarten in der Schlange liegen?** (D39)  
„Symmetriemeister“: Auch eine ungerade Kartenzahl ist erlaubt; die mittlere Karte ist die Achse und gehört zu keiner Hälfte. Joker zählen als die passende Farbe; liegt eine andere Sonderkarte (etwa eine Blockade) in der Schlange, ist die Aufgabe nicht erfüllt.

**„Schlangenbändiger": Muss das Muster zweimal direkt hintereinander liegen (ABCABC)?** (D40)  
„Schlangenbändiger“: Das Muster liegt mindestens zweimal direkt hintereinander. Es ist eine beliebige Kartenfolge mit mindestens drei verschiedenen Farben, also ABCABC, aber auch AABCAABC.

**„Farbkombination": Müssen die fünf Karten nebeneinander liegen? Zählen Joker bei „Gelber Schatz" und „Lila Riese" mit?** (D41)  
„Farbkombination“: Fünf Karten gleicher Farbe irgendwo in derselben Schlange genügen; auch getrennte Gruppen derselben Farbe zählen zusammen. Bei „Gelber Schatz“ und „Lila Riese“ zählen Joker mit, als Gelb beziehungsweise Violett; eine Farbenfusion zählt als eine Karte.

**Schlangenkorb: Liegt er auf der Hand (zählt zu den 5)? Kostet sein Einsatz die Sonderkarte des Zuges? Sind die vier Beispiele die vollständige Liste der Effekte?** (D42)  
Der Schlangenkorb liegt auf der Hand und zählt zu den 5 Handkarten. Sein Einsatz ist die Sonderkarte des Zuges; daneben ist keine weitere Sonderkarte erlaubt. Die vier genannten Boni sind die vollständige Liste.

**„Ziehe 3 Karten und spiele sofort bis zu 2 davon": zusätzlich zu den Karten des Zuges, beliebige Arten, auch ein gezogener Verdoppler? Was bei weniger als 3 Karten im Stapel?** (D43)  
Korb „Ziehe 3, spiele bis zu 2“: Die bis zu 2 Karten kommen zusätzlich zu den Karten des Zuges, in beliebiger Art, auch zwei Farbkarten oder zwei Sonderkarten. Ein so gezogener Verdoppler darf nicht mit Wirkung gespielt werden, weil der Korb schon den Zug erweitert (A7.8). Liegen weniger als 3 Karten im Stapel, zieht man, was da ist; wer so die letzte Karte zieht, spielt seinen Zug zu Ende, dann beginnt die Schlussrunde (A10).

**„Tausche bis zu 2 Karten aus deiner Schlange mit Handkarten": beliebige Karten, gleicher Platz, getauschte Karte auf die Hand?** (D44)  
Korb „Tausche bis zu 2 Karten“: Getauscht werden nur Farbkarten gegen Farbkarten. Die Handkarte kommt an den Platz der getauschten Karte, die getauschte Karte kommt auf die Hand; die Handgrösse bleibt gleich.

**„Sonderkarte aus gegnerischer Schlange entfernen": welche Karten (auch Blockade), abwehrbar mit Farbenschutz, auf wessen Ablagestapel?** (D45)  
Korb „Sonderkarte aus gegnerischer Schlange entfernen“: Entfernt werden darf jede Sonderkarte, auch eine Schlangenblockade, eine Regenbogenschlange oder eine Farbenfusion, deren Karten dann wieder einzeln liegen. Der Gegner wird gefragt, der Effekt ist mit Farbenschutz abwehrbar. Die entfernte Karte kommt auf den Ablagestapel des Spielers, der den Korb nutzt, wie gefressene Karten.

**„Zwei zusätzliche Aktionen": dieselben drei Möglichkeiten wie bei der Comeback-Karte? Gelten die Grenzen (eine Farbkarte, eine Sonderkarte) dann nicht? Zweite Farbenfusion, zweiter Verdoppler?** (D46)  
Korb „Zwei zusätzliche Aktionen“: Es sind dieselben drei wie bei der Comeback-Karte. Sie kommen obendrauf, auch zweimal dieselbe Art (wie A8.1), also bis zu zwei weitere Farb- oder Sonderkarten im Zug. Eine zweite Farbenfusion ist nicht erlaubt; „pro Zug nur eine Farbenfusion“ gilt weiter. Ein Verdoppler als Zusatzaktion wirkt nicht, weil er nicht mit anderen zugerweiternden Effekten kombinierbar ist.

**„Nicht mit anderen zugerweiternden Effekten kombinierbar": Schliessen sich Verdoppler, Comeback und Schlangenkorb im selben Zug aus?** (D47)  
Verdoppler, Comeback-Karte und die zugerweiternden Boni des Korbs („Ziehe 3, spiele bis zu 2“, „Zwei zusätzliche Aktionen“) schliessen sich gegenseitig aus; Risiko-Karten zählen nicht dazu. Je Zug gibt es höchstens eine dieser Erweiterungen.

**Schlangenlänge für die Comeback-Bedingung: Zählt jede Karte eins, die Farbenfusion eins oder drei, ein Spieler ohne Schlange null? Ist die Karte später im Zug und im zweiten Zug nach Verdoppler einsetzbar?** (D48)  
Für die Comeback-Bedingung gilt: Jede Karte in der Schlange zählt eins, auch Sonderkarten; eine Farbenfusion samt ihren zwei Karten zählt eins. Ein Spieler ohne Schlange hat die Länge null; die Bedingung kann für ihn erfüllt sein. Die Bedingung wird zu Zugbeginn geprüft; ist sie erfüllt, darf die Karte irgendwann in diesem Zug eingesetzt werden. Im zweiten Zug nach einem Verdoppler ist sie nicht einsetzbar, weil sich Verdoppler und Comeback-Karte ausschliessen (vorige Frage).

**„Zwei Karten abwerfen, drei ziehen": mit weniger als zwei Handkarten, bei weniger als drei im Stapel, in der Schlussrunde, zweimal?** (D49)  
Comeback-Aktion „Zwei Karten abwerfen, drei ziehen“: Mit weniger als zwei Handkarten ist sie nicht wählbar: Wer nur eine Karte hält, wählt eine andere Zusatzaktion. Liegen weniger als drei Karten im Stapel, zieht man, was da ist; wer die letzte Karte zieht, spielt seinen Zug zu Ende, dann beginnt die Schlussrunde (A10). In der Schlussrunde ist sie nicht wählbar, weil nichts gezogen werden kann. Zweimal in einem Zug ist sie erlaubt, wie A8.1 es für alle Zusatzaktionen sagt.

**„Pro Runde eine Risiko-Karte": pro eigenem Zug? Gilt der zweite Zug nach Verdoppler als neue Runde?** (D50)  
Eine Runde ist der eigene Zug samt zweitem Zug nach einem Verdoppler; darin ist höchstens eine Risiko-Karte erlaubt. Ein Verdoppler gibt keine zweite Risiko-Karte.

**Wohin kommt die aufgedeckte Karte bei Aktion 2 (Misserfolg), Aktion 3 (Erfolg, samt der ersetzten Schlangenkarte) und Aktion 4 (beide Fälle)?** (D51)  
Risiko-Aktion 2, Misserfolg: Die aufgedeckte Sonderkarte kommt auf den eigenen Ablagestapel, wie bei Aktion 3; der Spieler verliert die Karte. Risiko-Aktion 3, Erfolg: Die aufgedeckte Farbkarte kommt auf die eigene Hand, wie bei den Aktionen 1 und 2. Die ersetzte Schlangenkarte kommt ebenfalls auf die eigene Hand; es ist ein Tausch. Risiko-Aktion 4: Die aufgedeckte Karte kommt bei Erfolg auf die eigene Hand, bei Misserfolg auf den eigenen Ablagestapel.

**Aktion 2: Muss die „geplante Farbkarte" vorher benannt werden? Wer wählt bei Misserfolg zwischen ihr und der obersten Stapelkarte? Was gilt ohne Farbkarte auf der Hand? Nur eigene Schlange?** (D52)  
Risiko-Aktion 2: Vor dem Aufdecken benennt der Spieler eine Farbkarte seiner Hand, wie bei Aktion 3. Bei Misserfolg wählt der begünstigte Gegner zwischen der geplanten Farbkarte und der obersten Stapelkarte. Ohne Farbkarte auf der Hand ist Aktion 2 nicht wählbar. Die zusätzliche Farbkarte kommt nur an ein Ende einer eigenen Schlange; für diese Aktion gilt D9 nicht.

**Aktion 3: Welche Handkarte darf ersetzen, und wird bei „anderer Punktewert" die aufgedeckte Karte vor oder nach der gewählten Karte eingefügt?** (D53)  
Risiko-Aktion 3: Ersetzen darf jede Farbkarte der Hand. Bei anderem Punktewert wählt der Spieler, ob er die zusätzliche Karte davor oder dahinter legt.

**Aktion 4: Zählt die aufgedeckte Karte zu den „zwei Karten vom Nachziehstapel"? Was bei leerem Ablagestapel? Wie kann eine Risiko-Karte auf einem Ablagestapel liegen, wenn sie aus dem Spiel kommt?** (D54)  
Risiko-Aktion 4: Bei Erfolg ist die aufgedeckte Karte die erste der zwei Karten; der Spieler zieht eine weitere. Ist der eigene Ablagestapel leer, bleibt nur die andere Möglichkeit: Bei Erfolg zieht der Spieler vom Nachziehstapel, bei Misserfolg der Gegner die oberste Karte. Risiko-Karte und Schlangenkorb kommen nach der Nutzung aus dem Spiel und liegen nie auf einem Ablagestapel; der Satz dazu in A8.2 ist nur eine Klarstellung.

**Ist eine Risiko-Karte bei leerem Stapel oder in der Schlussrunde spielbar? Wer löst die Schlussrunde aus, wenn ein Effekt oder ein Gegner die letzte Karte nimmt?** (D55)  
Bei leerem Stapel und in der Schlussrunde ist eine Risiko-Karte nicht spielbar, weil keine Karte aufgedeckt werden kann. Die Schlussrunde löst der Spieler am Zug aus, gleich wer die letzte Karte nimmt (auch ein begünstigter Gegner); er spielt seinen Zug zu Ende, dann hat jeder andere noch einen Zug.
