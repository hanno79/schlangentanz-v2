---
id: TF-PRUEF-015
titel: Wer der Anleitung folgt, beendet seinen eigenen Vorschau-Server unter Windows vollständig, und danach lauscht auf dem Port nichts mehr.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3b-pruefwerkzeuge-nachschaerfen (PR #28)
---

## Worum es geht

Unter Windows endet beim Stoppen oft nur `npm`, während der Node-Kindprozess weiter lauscht. Dann blockiert er den Port für andere Agenten. Die Anleitung (PRUEFER_ANLEITUNG, Schritt 4, „Eigene Server beenden“) beschreibt, wie man den eigenen Prozess findet und gezielt beendet, ohne fremde anzufassen.

## Bestanden, wenn

Nach dem Stoppen der Hintergrundaufgabe zeigt die Portprüfung (falls noch etwas lauscht) eine PID, deren Befehlszeile den eigenen Worktree nennt. Nach `Stop-Process` liefert die Portprüfung nichts (grep Exit 1), und kein `node.exe` mit dem eigenen Worktree in der Befehlszeile läuft noch. Fremde Server auf 4173 und 4174 bleiben unberührt.

## Fehlgeschlagen, wenn

Nach dem Rezept lauscht der eigene Port noch, ein eigener Node-Prozess bleibt übrig, oder das Rezept würde einen fremden Prozess beenden.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | eigener Worktree auf dem zu prüfenden Commit, `npm run build` gelaufen |
| Ausgangslage prüfen | `netstat -ano \| grep -E ':4183 ' \| grep -E 'LISTENING\|ABH'` ohne Ausgabe |

## Testdaten

Port 4183, damit fremde Server auf 4173 und 4174 nicht stören.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash, Hintergrundaufgabe | Vorschau starten | `npm run preview -- --port 4183 --strictPort` | „Local: http://localhost:4183/“ |
| 2 | Werkzeug der Umgebung | Hintergrundaufgabe stoppen | | |
| 3 | Git Bash | Port prüfen | `netstat -ano \| grep -E ':4183 ' \| grep -E 'LISTENING\|ABH'` | lauscht noch etwas: PID in der letzten Spalte |
| 4 | Git Bash | Befehlszeile der PID lesen | `powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter 'ProcessId=<PID>').CommandLine"` | Pfad enthält den eigenen Worktree und `vite.js preview --port 4183` |
| 5 | Git Bash | eigenen Prozess beenden | `powershell -NoProfile -Command "Stop-Process -Id <PID>"` | Exit 0 |
| 6 | Git Bash | Port erneut prüfen | wie Schritt 3 | keine Ausgabe |

## Nicht abgedeckte Grenzfälle

Ein fremder Server auf demselben Port wird nicht nachgestellt, weil man dafür einen fremden Prozess bräuchte; die Anleitung sagt dann „nicht beenden, warten“. Im Prüflauf lauschten auf 4173 und 4174 tatsächlich fremde Server (Befehlszeile mit anderem Worktree), und sie blieben unberührt. Die Server aus `npm run test:layout` beendet Playwright selbst; nach dem Lauf lauschte auf 4173 und 4174 nichts.
