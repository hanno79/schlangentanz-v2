---
datum: 2026-11-13
zeit: 12:00
titel: Prüfwerkzeuge und Entwicklertisch sind abgenommen, die alte Oberfläche ist abgerissen
art: fortschritt
wer: Claude Code
betrifft: P0.3, P0.3b, P0.4
kapitel: 3
---

P0.3 brachte `check:regeln` für U1, U6 und U7, einen Architekturtest für U3 bis U5, Playwright mit drei Geräteklassen und eine Prüferanleitung. Ob die Anleitung trägt, hat ein Agent ohne Vorwissen an einem Probe-Task gezeigt; seine Notizen und die Hinweise der Prüfer gingen in P0.3b ein. Seither kann die Ausnahmeliste wirklich nur schrumpfen, auch ein Tausch alter gegen neue Verstösse fällt auf, der Architekturtest erkennt Umgehungen von `Math.random`, und die Gates zählen die Worktrees der Agenten nicht mehr mit.

P0.4 hat die alte Oberfläche und die alte KI entfernt und den Entwicklertisch unter `/dev` gebaut, nur im Testhook-Build. Die erste Abnahme fand den Tisch auf dem Handy 100 Pixel zu breit; nach der zweiten Iteration misst ein Vertrag die Breite in allen drei Geräteklassen.
