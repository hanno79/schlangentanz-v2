---
datum: 2026-11-21
zeit: 13:10
titel: Die Karten Farbkarte, Regenbogenschlange, Blockade, Schlangenfrass, Farbenfusion und Farbendieb wirken jetzt nach den Regeln der Website
art: fortschritt
wer: Hanno Rahn, Claude Code
betrifft: E4b, E5, E6, E7, E8
kapitel: 3, 4
kennzahlen: 6 Karten umgesetzt; 1'810 Tests grün; 5 Teil-C-Zeilen gestrichen
---

Vier Umsetzer haben die Kartentasks E5 bis E8 gleichzeitig gebaut, jeder in seinem eigenen Arbeitszweig und nur an seinen Kartendateien. Schon nach wenigen Stunden hielten drei von ihnen an derselben Stelle an: Der Nachrechentest aus E2, der die sichtbare Lage allein aus den Ereignissen nachbaut, kannte keine Kartenwirkung. Er konnte nicht nachvollziehen, dass der Schlangenfrass Karten auf einen Ablagestapel legt, die Fusion zwei Karten unter sich nimmt oder der Farbendieb eine neue Schlange beginnt. Dazu kam eine Liste umgesetzter Karten in `aktionen.test.ts`, die jeder Kartentask von Hand hätte ergänzen müssen. Statt vier verschiedene Lösungen in denselben Dateien zuzulassen, kam der kleine Vorbereitungstask E4b dazwischen.

E4b lässt die Engine nach jeder Kartenwirkung die Orte aller Karten vorher und nachher vergleichen und das Ergebnis als ein Ereignis melden. Der Nachrechentest wendet dieses Ereignis an, ohne eine einzige Karte zu kennen, und die Liste der umgesetzten Karten ergibt sich nun aus dem Kartenregister. Der erste Prüfer lehnte ab, weil eine kaputte Platzhalter-Markierung unbemerkt geblieben wäre; die zweite Iteration ergänzte den fehlenden Test. Eine Prüfsumme über 300 Partien zeigte, dass sich der Spielverlauf durch E4b nicht verändert hat.

Danach setzten die Kartentasks auf E4b auf, und jede wurde von einem eigenen Prüfer ohne Vorkenntnisse abgenommen: Gegenproben im Code, alle Website-Beispiele als Tests, eigene Zufallspartien zum Nachrechnen und die Szenarien am Entwicklertisch mit echten Klicks, bei E5 in allen fünf Geräteklassen. Alle vier wurden beim ersten Durchgang ohne Mangel abgenommen. Beim Merge mussten Testfall-Nummern umbenannt werden, die die parallelen Prüfer doppelt vergeben hatten, und die Registrierung der Szenarien in `szenarien.ts` war jedes Mal zusammenzuführen. In Teil C der Spezifikation sind C2, C8, C16 und C17 gestrichen, C19 nennt nur noch die Schlangenhäutung.

Zwei Dinge haben unterwegs Zeit gekostet. Der Layout-Vertrag für die Geräteklassen war auf Desktop für jeden Zweig rot, weil Chromium ohne Touch-Emulation die Touch-Hardware des Prüfrechners meldet; der Vertrag misst Touch jetzt nur noch dort, wo die Klasse ihn einschaltet. Und mit bis zu acht gleichzeitig laufenden Agenten starteten die Test-Worker nicht mehr rechtzeitig, weshalb die volle Suite unter Last mit vier Workern laufen muss.
