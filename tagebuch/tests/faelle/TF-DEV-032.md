---
id: TF-DEV-032
titel: Am Entwicklertisch zeigt das Szenario „haeutung“ 56 Häutungen, die eigene wirkt sofort, die gegnerische lässt sich abwehren und durchlassen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E9-haeutung (PR #69)
---

## Worum es geht

Das Szenario `haeutung` stellt Beispiel 1 der Website nach (A7.9): Spieler 1 hat die Schlange Blau, Rot, Gelb, Rot, Gelb und eine Schlangenhäutung, KI-Gegner 1 hält einen Farbenschutz und hat Braun, Violett, Braun. Geprüft wird mit echten Klicks, dass die Engine die richtigen Knöpfe anbietet und dass Wirkung, Abwehr und Durchlassen so aussehen, wie die Regeln es verlangen.

## Bestanden, wenn

Am Start stehen 56 Knöpfe „SchlangenhaeutungSpielen“ (54 in schlange-1, 2 in schlange-2) und kein „SonderkarteWirkungslosAblegen“. Der Knopf mit Sonnenblatt, Sonnenblatt, Wasserwirbel, Feuerkeim, Feuerkeim in schlange-1 bringt die Ereignisse „KartenVersetzt“ und „KarteGespielt“ (Ablagestapel von Spieler 1, Stelle 0), danach sind nur FarbkarteLegen und ZugBeenden angeboten. Ein Knopf in schlange-2 bringt „KarteAngesagt“ und „AbwehrGefragt“ für KI-Gegner 1 mit den Knöpfen „abwehren mit Farbenschutz“ und „durchlassen“. Abwehren lässt schlange-2 bei Braun, Violett, Braun; durchlassen ordnet sie nach dem Knopf. Keine Konsolenfehler, die Seite steht weder am Desktop (1280 px) noch am Handy (390 px) waagrecht über.

## Fehlgeschlagen, wenn

Eine andere Zahl von Knöpfen erscheint, ein wirkungsloses Ablegen angeboten wird, die Schlange nach der Häutung anders liegt, KI-Gegner 1 bei der eigenen Häutung gefragt wird oder bei der gegnerischen nicht, eine Konsolenmeldung auf Fehlerstufe erscheint oder `scrollWidth` grösser als `clientWidth` ist.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`), ausgeliefert mit `vite preview`, Stand ab Commit `d750cda` |
| Ausgangslage prüfen | Adresse `/dev?szenario=haeutung` zeigt „Aktionen der Engine (76)“ |

## Testdaten

Szenario `haeutung` aus `src/entwicklung/szenarienHaeutung.ts`, Saat 41.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, Fenster 1280×900 | Adresse öffnen | `/dev?szenario=haeutung` | Überschrift „SchlangenhaeutungSpielen (56)“, kein Abschnitt „SonderkarteWirkungslosAblegen“ |
| 2 | Aktionen der Engine | den Knopf anklicken, der hinter „→ schlange-1 ·“ Sonnenblatt, Sonnenblatt, Wasserwirbel, Feuerkeim, Feuerkeim nennt | – | Ereignisse des letzten Schritts: KartenVersetzt und KarteGespielt (Ablagestapel von Spieler 1, Stelle 0); Spieler 1 zeigt Sonnenblatt, Sonnenblatt, Wasserwirbel, Feuerkeim, Feuerkeim; Aktionen nur FarbkarteLegen und ZugBeenden |
| 3 | oben | „Von vorn“ klicken | – | wieder 56 Häutungen |
| 4 | Aktionen der Engine | den Knopf anklicken, der hinter „→ schlange-2 ·“ zuerst Mondranke nennt | – | Ereignisse KarteAngesagt (trifft KI-Gegner 1) und AbwehrGefragt; Aktionen „Reagieren (2)“ mit abwehren und durchlassen |
| 5 | Aktionen der Engine | „Reagieren: abwehren mit Farbenschutz …“ klicken | – | Abgewehrt und AnsageEntschieden ohne Wirkung; KI-Gegner 1 zeigt weiter Braun, Violett, Braun, Ablagestapel Farbenschutz |
| 6 | oben | „Schritt zurück“, dann „Reagieren: durchlassen“ klicken | – | KartenVersetzt und AnsageEntschieden; KI-Gegner 1 zeigt Mondranke, Wurzelpfad, Wurzelpfad |
| 7 | Browser, Fenster 390×844 mit Touch | Schritte 1 bis 6 mit Antippen wiederholen | – | dieselben Ergebnisse, Knopfbeschriftungen umbrochen und vollständig lesbar, kein waagrechtes Scrollen |

## Nicht abgedeckte Grenzfälle

Tablet quer, Tablet hochkant und Handy quer sind nicht von Hand fotografiert; `test:layout` misst den Entwicklertisch dort. Wie sich der Tisch mit Tausenden von Knöpfen verhält, prüft TF-DEV-034.
