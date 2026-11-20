---
id: TF-ENGINE-020
titel: Der Verdoppler gibt nach A5, A7.8, D11, D12 und D23 genau einen zweiten Zug mit Auffüllen, im zweiten Zug wirkt kein weiterer Verdoppler, und niemand wird gefragt.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
skript: src/engine/__tests__/verdoppler.test.ts
aenderung: task/E3-verdoppler (PR #51)
---

## Worum es geht

Der Verdoppler ist die einzige Karte, die einen Zug verlängert. Spielt man ihn, füllt man nach dem ersten Zug die Hand auf und spielt sofort einen zweiten Zug. Geht dabei etwas schief, bekommt ein Spieler einen Zug zu viel oder zu wenig, und das kann den Ausgang der Partie ändern.

## Bestanden, wenn

Die Regeltests in `src/engine/__tests__/verdoppler.test.ts`, die Szenariotests „E3: Szenarien des Verdopplers“ und der Dauerlauf laufen grün, und jede der Verfälschungen aus „Technische Prüfung“ macht mindestens einen dieser Tests rot. Im Einzelnen: Der Verdoppler zählt als Sonderkarte des ersten Zuges, geht mit höchstens einer Farbkarte davor oder danach und auch allein. Beim Beenden des ersten Zuges zieht der Spieler auf 5 nach (Ereignis KartenGezogen), dann folgt ZugBegonnen für denselben Spieler mit Teilzug 2. Im zweiten Zug gelten wieder mindestens eine und höchstens eine Farbkarte und eine Sonderkarte. Ein Verdoppler mit Wirkung wird dort nicht angeboten und mit dem Hinweis auf A7.8, D11 und D23 abgelehnt; wirkungslos ablegen geht. Nach dem zweiten Zug ist der Nächste mit Teilzug 1 dran.

## Fehlgeschlagen, wenn

Ein Test rot bleibt, ein dritter Zug möglich ist, der zweite Zug ohne Auffüllen beginnt, im zweiten Zug zwei Farbkarten gehen oder ein Mitspieler zum Verdoppler gefragt wird. Ebenso, wenn eine Verfälschung alle Tests grün lässt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E3-verdoppler`, `npm ci` gelaufen |

## Testdaten

Keine eigenen Daten; die Tests bauen ihre Lagen mit dem Szenario-Baukasten ohne Erweiterung.

## Technische Prüfung

`npx vitest run src/engine src/entwicklung` muss mit Exit 0 enden. Danach je eine Verfälschung im Engine-Code einbauen, dieselben Tests ausführen (Exit 1 erwartet) und mit `git checkout -- src/engine` zurücksetzen: Verdoppler hat im Teilzug 2 ein Ziel; `pruefe` lehnt im Teilzug 2 nicht ab; dritter Zug möglich; kein zweiter Zug; Ereignis meldet Teilzug 1; Verdoppler landet auf fremdem Ablagestapel; `betroffene` nennt einen Gegner; Zähler im zweiten Zug nicht zurückgesetzt; nach Überhand-Abwurf kein zweiter Zug; `verdopplerGespielt` nicht gesetzt; zwei Farbkarten im zweiten Zug; kein Auffüllen zwischen den Zügen; zwei Farbkarten im ersten Zug mit Verdoppler; Verdoppler im zweiten Zug nicht wirkungslos ablegbar.

## Nicht abgedeckte Grenzfälle

„Kann nicht mit anderen zugerweiternden Effekten kombiniert werden“ (A7.8) lässt sich erst prüfen, wenn es Comeback, Risiko-Belohnung und Schlangenkorb gibt (X3 bis X6). Abwehr mit Farbenschutz gibt es erst mit E4; dass der Verdoppler niemanden betrifft, ist bis dahin nur über `betroffene` geprüft.
