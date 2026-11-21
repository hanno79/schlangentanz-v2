---
datum: 2026-11-21
zeit: 13:12
titel: Die KI-Grenze wird über eine Importgrenze gesichert und nach der dritten Ablehnung nur noch eng geprüft
art: entscheidung
wer: Hanno Rahn, Claude Code
betrifft: P0.3d
kapitel: 3, 5
---

Die Schlussprüfungen von P0.3d fanden jedes Mal neue, immer ausgefallenere Wege, eine nicht registrierte KI-Strategie an der Prüfung vorbeizubringen.

## Frage

Wie weit soll die automatische Sicherung gehen, dass eine KI-Strategie nur über die Registry erreichbar ist und damit vom Isolationstest erfasst wird?

## Optionen

Die Erkennung über Typen hätte weiter ausgebaut werden können; sie übersah aber Rückgaben wie „KI oder nichts“ oder eine Liste von KIs. Eine Importgrenze erlaubt dagegen ausserhalb der Strategien nur den Import der Registry und der Typen. Für die Prüfung stellte sich danach die Wahl, weitere Runden zu drehen, bis kein Prüfer mehr eine Umgehung findet, oder die zuletzt gefundene echte Lücke zu schliessen und die übrigen Wege als Grenze zu benennen.

## Gewählt

Die Importgrenze trägt zusammen mit dem Isolationstest. Nach der dritten Ablehnung hat der Autor entschieden, nur noch die Lücke mit grossgeschriebener Dateiendung zu schliessen und `public/` sowie eigene Vite-Plugins in U5 als Grenze zu nennen, die das Review abdeckt.

## Begründung

Die KI-Strategien schreiben wir selbst, und sie gehen durch das Review. Jede weitere Prüfrunde fand kleinere Abwandlungen der vorigen, die nur mit Absicht entstehen. Die Lücke mit der grossen Endung wirkte dagegen auch im Produktionsbuild und wurde deshalb geschlossen. Ohne Ende der Runden wäre die neue KI (K2) weiter blockiert geblieben.
