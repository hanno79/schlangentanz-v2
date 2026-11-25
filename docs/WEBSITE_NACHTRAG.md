# Nachtrag für die Website schlangentanz.ch/rules

Stand 24.11.2026. Diese Antworten hat der Autor gegeben; sie gelten im Spiel schon, stehen aber noch nicht auf der Website. Quelle ist Teil D von `docs/GAME_SPEC.md` (dort „Website folgt“). Die Nummer in Klammern ist der Eintrag in Teil D.

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

**Pro Zug ist nur eine Farbenfusion erlaubt: Verbraucht eine Farbenfusion, die ein Gegner mit Farbenschutz abwehrt, schon die Fusion des Zuges?** (D56)  
Ja: Wer eine Farbenfusion ausgespielt hat, hat die Fusion dieses Zuges verbraucht, auch wenn ein Gegner sie mit Farbenschutz abwehrt; eine zweite Farbenfusion ist in diesem Zug nicht möglich, auch nicht über eine Zusatzaktion (Schlangenkorb, Comeback-Karte).

**Zieht ein Spieler mitten in seinem Zug die letzte Karte vom Nachziehstapel (etwa über Schlangenkorb oder Comeback-Karte): Darf er die eben gezogenen Karten noch im selben Zug ausspielen?** (D57)  
Ja: Wer mitten in seinem Zug die letzte Karte vom Nachziehstapel zieht, etwa über Schlangenkorb oder Comeback-Karte, spielt seinen Zug zu Ende (A10) und darf dabei auch die eben gezogenen Karten einsetzen; danach beginnt die Schlussrunde. „Seine zuletzt gezogenen Karten kann er nur noch ausserhalb seines Zuges einsetzen“ (A10) meint also die Karten, die er beim Auffüllen am Ende seines Zuges zieht (A5, „Zug beenden“); danach folgt kein Zug mehr. Beim Schlangenkorb verlangt A7.10 selbst, sofort auszuspielen („Ziehe 3 zusätzliche Karten und spiele sofort bis zu 2 davon aus“). Zieht er die letzte Karte beim Auffüllen zwischen den beiden Zügen eines Verdopplers, spielt er den zweiten Zug noch, der wie ein normaler Zug abläuft (A7.8: „Du füllst deine Handkarten auf und spielst sofort einen zweiten Zug“).

**„Farbvielfalt“ („Bilde eine Kette aus je einer Karte aller 6 Farben.“): Darf eine Farbe in der Kette doppelt liegen, etwa Blau, Rot, Rot, Gelb, Braun, Violett, Grün?** (D58)  
Nein: Die Kette für „Farbvielfalt“ besteht aus sechs Karten direkt hintereinander in einer Schlange, jede Farbe genau einmal. Blau, Rot, Rot, Gelb, Braun, Violett, Grün erfüllt die Aufgabe nicht, ebenso wenig Blau, Rot, Gelb, Rot, Braun, Violett, Grün. Ein Joker zählt in der Kette als die Farbe, die noch fehlt (A9, Beispiel).

**„Farbenpracht“ („Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen.“): Wird die Bedingung nach jeder Aktion geprüft oder nur am Ende des eigenen Zuges?** (D59)  
Nur am Ende des eigenen Zuges, nicht nach jeder Aktion: Wer die Bedingung von „Farbenpracht“ mitten im Zug erfüllt und im selben Zug wieder zerstört, bekommt die Aufgabe nicht. Das gilt nur für „Farbenpracht“, deren Kartentext das Zugende nennt; die übrigen Aufgaben prüft das Spiel weiter nach A9 („sobald ein Spieler die Bedingungen erfüllt und am Zug ist“). Als geheime Aufgabe zählt „Farbenpracht“ damit, sobald sie an einem eigenen Zugende erfüllt war (D35).

**„Farbenpracht“ nennt auch das Ende des Spiels: Wird bei Spielende zusätzlich für jeden Spieler geprüft, auch für den, der nicht am Zug ist?** (D60)  
Nein: Bei Spielende gibt es für „Farbenpracht“ keine zusätzliche Prüfung für die anderen Spieler; es genügt das Ende des letzten eigenen Zuges. Die Worte „am Ende des Spiels“ im Kartentext heissen also: am Ende des letzten eigenen Zuges. Legt ein Gegner danach noch die fehlende Karte in die eigene Schlange, bringt das „Farbenpracht“ nicht mehr.

**Zählen Joker bei „Gelber Schatz“, „Lila Riese“, „Farbkombination“ und „Farbenpracht“ auch dann, wenn eine Reihe nur aus Jokern besteht (Regenbogenschlangen und Farbenfusionen, ohne Farbkarte der Farbe)?** (D61)  
Ja: Bei „Gelber Schatz“, „Lila Riese“, „Farbkombination“ und „Farbenpracht“ zählen Joker immer als die Farbe der Aufgabe, auch wenn eine Reihe nur aus Jokern besteht und keine Farbkarte dieser Farbe enthält; bei „Farbenpracht“ dürfen also auch beide Karten einer Farbe Joker sein. Eine Farbenfusion zählt dabei als eine Karte. Die Einschränkung aus D32 gilt nur für den Vielfaltbonus.

**„Schlangentanz“ („Bilde durch Schlangenhäutung 2 neue Dreiergruppen.“): Wann ist eine Dreiergruppe nach der Häutung „neu“?** (D62)  
Neu ist jede Dreiergruppe nach der Häutung, in der keine Gruppe von vor der Häutung weiterlebt. Löst eine Häutung eine Dreiergruppe auf und bildet zwei neue, ist „Schlangentanz“ erfüllt; es zählt nicht die Zahl der Gruppen nachher abzüglich der Zahl vorher. Eine Gruppe, die nur verlängert wurde, ist nicht neu.

**„Schlangentanz“: Muss die Häutung mit zwei neuen Dreiergruppen in dem Zug liegen, in dem der Spieler die Aufgabe einlöst, oder genügt eine frühere Häutung?** (D63)  
Eine frühere Häutung genügt: Hat der Spieler einmal mit einer Schlangenhäutung zwei neue Dreiergruppen gebildet, gilt das für „Schlangentanz“ die ganze Partie; die Häutung muss nicht im Zug des Einlösens liegen. Die beiden Gruppen müssen beim Einlösen nicht mehr liegen; hat ein Gegner eine davon zerstört, zählt die Häutung trotzdem. Wird „Schlangentanz“ erst danach aufgedeckt, löst er die Aufgabe ein, sobald er am Zug ist.

**„Schlangenmeister“ („Habe min. 2 versch. Sonderkarten in deinen Schlangen und spiele min. 4 aus.“): Heisst „2 versch. Sonderkarten“ zwei verschiedene Arten, und zählt eine Schlangenblockade mit, die ein Gegner in die eigene Schlange gelegt hat?** (D64)  
Ja: „2 versch. Sonderkarten“ heisst zwei verschiedene Arten von Sonderkarten in den eigenen Schlangen; zwei Regenbogenschlangen genügen nicht, eine Regenbogenschlange und eine Farbenfusion schon. Eine Schlangenblockade, die ein Gegner in die eigene Schlange gelegt hat, zählt mit.

**Pro Zug ist nur eine Farbenfusion erlaubt: Verbraucht auch eine Farbenfusion, die wirkungslos abgelegt wird, weil sie kein mögliches Ziel hat (D25), die Fusion des Zuges?** (D65)  
Ja: Auch eine Farbenfusion, die wirkungslos auf den eigenen Ablagestapel kommt, weil sie kein mögliches Ziel hat (D13, D25), verbraucht die Fusion dieses Zuges, wie eine abgewehrte; eine zweite Farbenfusion ist in diesem Zug nicht möglich.

**„Farbenpracht“ nach einem Verdoppler: Wird am Ende des ersten Zuges geprüft oder erst nach dem zweiten?** (D66)  
Am Ende jedes der zwei Züge: Nach einem Verdoppler wird „Farbenpracht“ am Ende des ersten und am Ende des zweiten Zuges geprüft, denn A7.8 sagt „Damit ist dein erster Zug beendet“. Ist die Bedingung am Ende des ersten Zuges erfüllt, bekommt der Spieler die Aufgabe dort.

**„Farbharmonie“ („Habe in deinen Schlangen mindestens eine Dreiergruppe jeder Farbe.“): Zählt eine Vierer- oder Fünfergruppe als „Dreiergruppe“ ihrer Farbe?** (D67)  
Ja: Für „Farbharmonie“ zählt jede Farbgruppe ab drei Karten als Dreiergruppe ihrer Farbe, auch eine Vierer- oder Fünfergruppe; eine Farbgruppe besteht aus mindestens drei nebeneinanderliegenden Karten derselben Farbe. Dass eine Vierergruppe in der Wertung nicht zusätzlich als Dreiergruppe zählt, betrifft nur die Punkte.

**Comeback-Karte: Darf der Spieler mit der Zusatzaktion „Eine Sonderkarte aus der Hand ausspielen“ eine Sonderkarte wirkungslos ablegen, etwa einen Farbenschutz?** (D68)  
Ja: Auch mit der Zusatzaktion „Eine Sonderkarte aus der Hand ausspielen“ der Comeback-Karte darf der Spieler eine Sonderkarte wirkungslos auf den eigenen Ablagestapel legen, etwa einen Farbenschutz. Es gelten dieselben Regeln wie für die Sonderkarte des Zuges; ein Farbenschutz darf immer wirkungslos abgelegt werden. Für „Schlangenmeister“ und „Schlangenrepertoire“ zählt die so abgelegte Karte als ausgespielt.

**Schlangenkorb: Wohin kommt er, wenn der Spieler ihn ungenutzt abwirft, als überzählige Karte am Zugende (A5) oder über die Comeback-Aktion „Zwei Karten abwerfen, drei ziehen“?** (D69)  
Auf den Ablagestapel: Wirft der Spieler den Schlangenkorb ungenutzt ab, als überzählige Karte am Ende seines Zuges oder über „Zwei Karten abwerfen, drei ziehen“, kommt er wie jede abgeworfene Karte auf seinen eigenen Ablagestapel und nicht aus dem Spiel. Von dort darf ihn niemand zurückholen, auch nicht mit Risiko-Aktion 4, denn es gilt „Risiko-Belohnungs-Karte sowie Schlangenkorb des Glücks können nicht vom Ablagestapel genommen werden“. Aus dem Spiel kommt der Korb nur nach der Nutzung.

**Schlangenkorb „Tausche bis zu 2 Karten aus deiner Schlange mit Karten aus deiner Hand“: Muss der Spieler mindestens eine Karte tauschen, oder darf er den Bonus auch ohne Tausch nutzen?** (D70)  
Mindestens einen Tausch: Wer den Bonus wählt, tauscht eine oder zwei Farbkarten; ein Einsatz ohne Tausch ist nicht möglich. Ist kein Tausch möglich, ist der Bonus nicht wählbar („Wähle einen der verfügbaren Bonuseffekte“).

**Schlangenkorb „Ziehe 3 zusätzliche Karten und spiele sofort bis zu 2 davon aus“: Darf eine der gezogenen Farbkarten zugleich die reguläre Farbkarte des Zuges sein, sodass der Spieler bis zu drei der gezogenen Karten spielt?** (D71)  
Ja: Eine gezogene Farbkarte darf auch die reguläre Farbkarte des Zuges sein. So kann der Spieler bis zu drei der gezogenen Karten spielen: bis zu zwei zusätzlich über den Korb, in beliebiger Art, und eine als Farbkarte des Zuges. Die Sonderkarte des Zuges ist der Korb selbst.

**Schlangenkorb „spiele sofort bis zu 2 davon aus“: Heisst „sofort“ direkt nach dem Ziehen, vor jeder anderen Aktion, oder irgendwann im selben Zug?** (D72)  
Im selben Zug: „Sofort“ heisst beim Korb, dass der Spieler die bis zu zwei gezogenen Karten irgendwann in diesem Zug spielt, nicht unbedingt direkt nach dem Ziehen; dazwischen darf er andere Aktionen seines Zuges ausführen, etwa die Farbkarte des Zuges legen.

**„Schlangentanz“ („Bilde durch Schlangenhäutung 2 neue Dreiergruppen.“): Zählt eine neue Vierer- oder Fünfergruppe als „Dreiergruppe“?** (D73)  
Ja: Für „Schlangentanz“ zählt jede neue Farbgruppe ab drei Karten als Dreiergruppe, auch eine Vierer- oder Fünfergruppe, wie bei „Farbharmonie“.

**Risiko-Aktion 2 („Zusätzliche Farbkarte spielen“): Ist sie wählbar, wenn der Spieler keine eigene Schlange hat?** (D74)  
Nein: Ohne eigene Schlange ist Risiko-Aktion 2 nicht wählbar, denn die zusätzliche Farbkarte kommt nur an ein Ende einer eigenen Schlange und beginnt keine neue Schlange. Dasselbe gilt ohne Farbkarte auf der Hand.

**Risiko-Aktion 3 („Karten tauschen“), Erfolg: Muss der Spieler den Tausch ausführen, oder darf er darauf verzichten?** (D75)  
Freiwillig: Bei Erfolg darf der Spieler tauschen, muss aber nicht, wie es heisst: „Du darfst den Tausch ausführen“. Verzichtet er, bleibt die Schlange unverändert; die aufgedeckte Farbkarte kommt auch dann auf die eigene Hand.

**Risiko-Aktion 2: Erfüllt die zusätzlich gelegte Farbkarte die Pflicht, in jedem Zug mindestens eine Karte zu spielen (A5, D12), obwohl der Einsatz der Risiko-Karte nicht als reguläre Aktion zählt?** (D76)  
Ja: Legt der Spieler bei Erfolg von Risiko-Aktion 2 die zusätzliche Farbkarte an, zählt sie für die Pflicht, in jedem Zug mindestens eine Karte zu spielen, obwohl der Einsatz der Risiko-Karte nicht als reguläre Aktion zählt. Es zählt die gelegte Farbkarte, nicht der Einsatz der Risiko-Karte; bei Misserfolg wird keine Farbkarte gelegt. Die Karte bleibt zusätzlich und belegt nicht den Platz der Farbkarte des Zuges („Zusätzliche Farbkarte spielen“).

**Risiko-Aktion 2: Ist die Farbkarte, die der Spieler vor dem Aufdecken benennt (D52), eine Ansage, die alle Spieler sehen?** (D77)  
Ja: Die Farbkarte, die der Spieler vor dem Aufdecken für Risiko-Aktion 2 benennt, ist eine Ansage wie in A6 („Der Spieler benennt das Ziel seiner Aktion“) und für alle Spieler offen. Nur so kann der begünstigte Gegner bei Misserfolg zwischen ihr und der obersten Stapelkarte wählen. Legt der Spieler bei Erfolg eine andere Karte an, bleibt die benannte bekannt auf seiner Hand.

**Risiko-Aktion 1 („Zusätzliche Karten ziehen“), Misserfolg: Muss der gewählte Spieler die aufgedeckte Sonderkarte auf die Hand nehmen, oder darf er sie ablehnen?** (D78)  
Er muss sie nehmen: Bei Misserfolg von Risiko-Aktion 1 nimmt der gewählte Spieler die aufgedeckte Sonderkarte auf die Hand; das ist Pflicht, ablehnen kann er nicht. Das „darf“ in „Der gewählte Spieler darf die Sonderkarte direkt auf die Hand nehmen“ lässt ihm also keine Wahl. Hat er danach mehr als 5 Handkarten, baut er sie am Ende seines eigenen Zuges ab.

**Risiko-Aktion 4, Misserfolg: Was bekommt der gewählte Gegner, wenn er weder eine Karte von seinem Ablagestapel nehmen noch die oberste Karte vom Nachziehstapel ziehen kann?** (D79)  
Er bekommt nichts: Kann der gewählte Gegner bei Misserfolg von Risiko-Aktion 4 weder eine Karte von seinem Ablagestapel nehmen, weil dort keine liegt, die er nehmen darf, noch die oberste Karte vom Nachziehstapel ziehen, weil der Stapel leer ist, geht er leer aus. Die Schlussrunde löst der Spieler am Zug aus.
