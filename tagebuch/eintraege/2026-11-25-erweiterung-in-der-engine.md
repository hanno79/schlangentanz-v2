---
datum: 2026-11-25
zeit: 06:55
titel: Die Engine spielt die Erweiterung vollständig, nur die Schlussabnahme X7 fehlt noch.
art: fortschritt
wer: Hanno Rahn, Claude Code
betrifft: Erweiterung
kapitel: 3
kennzahlen: 15 Aufgaben mit echter Bedingung; 3'157 Tests grün; 2'000 Partien im Dauerlauf
---

Zwischen dem 22. und dem 24.11.2026 sind die Tasks X1 bis X6 umgesetzt, unabhängig geprüft und nach `neuaufbau` gemergt worden. X1 baute den Rahmen für die Aufgabenkarten. Die 15 Aufgaben selbst kamen in drei parallelen Paketen (X2a, X2b, X2c). X3 legte einen gemeinsamen Rahmen für Zusatzaktionen und Entscheidungen eines Gegners an. Auf ihm bauen die Comeback-Karte (X4), die Risiko-Belohnungs-Karten (X5) und der Schlangenkorb (X6) auf. Alle Grenzen eines Zuges stehen seither an einer Stelle im Code (`zuggrenzen.ts`), und Partien ohne Erweiterung laufen nachweislich wie vorher: Die Prüfsummen über Zufallspartien blieben bei jedem Merge gleich.

Dazwischen lag eine Reihe von Rückfragen an den Autor, weil die Website viele Einzelfälle offen lässt. Beantwortet sind sie als D56 bis D67 in Teil D; die Antworten vom 24.11.2026 trägt der Doku-Task P0.5h nach. Zwei Antworten änderten den Code: Farbenpracht wird nur am Ende des eigenen Zuges geprüft, und die Zusatzfarbkarte aus Risiko-Aktion 2 zählt als Karte des Zuges. Alle anderen bestätigten, was schon umgesetzt war.

Überrascht hat die solide KI. Sobald die Erweiterung wirkte, verliefen Partien anders, und drei KI-Tests wurden rot. Die Ursache lag nicht in den neuen Karten. Bei gleicher Bewertung vollendete die KI eine Gruppe nicht, sondern nahm den Zug, der in ihrer Liste zuerst stand. Der Folgetask K2b hat das behoben. Zwei der gemeldeten Fälle waren dabei gar keine Fehler: Die KI hatte einen besseren Zug geplant, den der Gegner abwehrte, und erst danach lag ihre Bewertung um 0.1 tiefer. Wie die KI die neuen Karten klug einsetzt, gehört zu K4.

Für den 22. bis 24.11.2026 fehlen eigene Einträge; dieser Eintrag fasst den Stand zusammen, die Einzelheiten stehen in den Prüfprotokollen unter `docs/abnahme/`.
