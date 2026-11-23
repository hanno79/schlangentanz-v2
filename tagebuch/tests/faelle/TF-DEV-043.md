---
id: TF-DEV-043
titel: Am Entwicklertisch löst Spieler 1 in den fünf Szenarien zu Paket B jede Aufgabe mit der richtigen Karte ein und mit der falschen nicht.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X2b-aufgaben-muster (PR #106)
---

## Worum es geht

Die Szenarien `aufgabe-farbvielfalt`, `aufgabe-vielfaltskoenig`, `aufgabe-farbwechsler`, `aufgabe-schlangenbaendiger` und `aufgabe-symmetriemeister` legen echte Karten aus, ohne Testbedingung. Mit Klicks sieht man, dass die Engine die Aufgabe erst mit der passenden Karte einlöst und mit einer knapp falschen nicht.

## Bestanden, wenn

Nach der falschen Karte steht unter „Ereignisse des letzten Schritts“ nur KarteGespielt, „Erfüllte Aufgaben“ zeigt keine. Nach „Schritt zurück“ und der richtigen Karte stehen dort KarteGespielt, AufgabeErfuellt (Spieler 1 nimmt die Aufgabe) und AufgabeAufgedeckt (Gelber Schatz an ihrer Stelle). Unter „Erfüllte Aufgaben“ steht die Aufgabe mit 9, 9, 6, 7 oder 10 Punkten, der Aufgabenstapel sinkt von 10 auf 9 Karten, die Endwertung zeigt dieselbe Zahl unter „Aufg.“. Alle Invarianten sind erfüllt, die Konsole zeigt keinen Fehler.

## Fehlgeschlagen, wenn

Die falsche Karte löst ein, die richtige nicht, eine andere Aufgabe wird eingelöst, der Platz wird nicht ersetzt oder eine Invariante ist verletzt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`, dann `vite preview --outDir dist-testhooks`), Stand ab Commit e028a82c |

## Testdaten

Die fünf Szenarien wie oben. Knöpfe unter „Aktionen der Engine“ heissen etwa „FarbkarteLegen: Wasserwirbel (blau-02) → schlange-1 ende“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/dev?szenario=aufgabe-farbvielfalt` | Schlange 1 Blau, Rot, Gelb, Braun, Grün; offen Farbvielfalt, Fusionsexperte, Schlangentanz; Stapel 10 |
| 2 | Aktionen der Engine | „FarbkarteLegen: Wasserwirbel (blau-02) → schlange-1 ende“ | | nur KarteGespielt; Erfüllte Aufgaben: keine |
| 3 | oben | „Schritt zurück“, dann „RegenbogenschlangeLegen … → schlange-1 · Stelle 2“ | | AufgabeErfuellt Farbvielfalt (aufgabe-04), AufgabeAufgedeckt Gelber Schatz; Erfüllte Aufgaben: Farbvielfalt (9); Stapel 9; Endwertung Aufg. 9 |
| 4 | Adresse | öffnen | `/dev?szenario=aufgabe-vielfaltskoenig` | Schlange 2 Braun, Violett, Farbenfusion über Rot, Rot |
| 5 | Aktionen der Engine | „FarbkarteLegen: Mondranke (violett-02) → schlange-2 ende“ | | nur KarteGespielt; Endwertung Gruppen 6, Aufg. 0 |
| 6 | oben | „Schritt zurück“, dann „FarbkarteLegen: Sonnenblatt (gelb-02) → schlange-2 anfang“ | | AufgabeErfuellt Vielfaltskönig (aufgabe-05); Erfüllte Aufgaben: Vielfaltskönig (9) |
| 7 | Adresse | öffnen | `/dev?szenario=aufgabe-farbwechsler` | Schlange 1 Blau, Blau, Rot, Gelb, Gelb |
| 8 | Aktionen der Engine | „FarbkarteLegen: Feuerkeim (rot-02) → schlange-1 ende“ | | nur KarteGespielt (Blau, Rot, Gelb, Rot sind keine vier verschiedenen) |
| 9 | oben | „Schritt zurück“, dann „FarbkarteLegen: Waldspross (gruen-01) → schlange-1 anfang“ | | AufgabeErfuellt Farbwechsler (aufgabe-06); Erfüllte Aufgaben: Farbwechsler (6) |
| 10 | Adresse | öffnen | `/dev?szenario=aufgabe-schlangenbaendiger` | Schlange 1 Rot, Blau, Grün, Rot, Blau |
| 11 | Aktionen der Engine | „FarbkarteLegen: Feuerkeim (rot-03) → schlange-1 ende“ | | nur KarteGespielt |
| 12 | oben | „Schritt zurück“, dann „FarbkarteLegen: Waldspross (gruen-02) → schlange-1 anfang“ | | AufgabeErfuellt Schlangenbändiger (aufgabe-11); Schlange Grün, Rot, Blau, Grün, Rot, Blau; Erfüllte Aufgaben: Schlangenbändiger (7) |
| 13 | Adresse | öffnen | `/dev?szenario=aufgabe-symmetriemeister` | Schlange 1 Blau, Rot, Gelb, Grün, Grün, Gelb, Rot |
| 14 | Aktionen der Engine | „FarbkarteLegen: Wasserwirbel (blau-02) → schlange-1 anfang“ | | nur KarteGespielt |
| 15 | oben | „Schritt zurück“, dann „FarbkarteLegen: Wasserwirbel (blau-02) → schlange-1 ende“ | | AufgabeErfuellt Symmetriemeister (aufgabe-13); Erfüllte Aufgaben: Symmetriemeister (10); Endwertung Aufg. 10 |

## Nicht abgedeckte Grenzfälle

Die Szenarien zeigen je eine Regenbogenschlange oder Fusion nur bei Farbvielfalt und Vielfaltskönig; Joker in den anderen drei Aufgaben belegen die Regeltests in TF-ENGINE-061. Eine Einlösung in einer echten Partie zeigt TF-DEV-044.
