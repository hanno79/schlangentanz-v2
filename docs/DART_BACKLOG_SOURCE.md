# Dart Backlog Source — Schlangentanz v2

Generated: 2026-05-31

## Purpose

This file records Dart as a backlog and requirements source for the fresh Schlangentanz v2 rebuild.
Dart tasks are **not automatically implementation truth**. Every relevant item must be converted into explicit `docs/GAME_SPEC.md` text and failing acceptance tests before code is written.

## Source query

- Dartboard: `Schlangentanz/Tasks`
- Total tasks reported by Dart: `140`
- First page captured in detail here: `100` tasks, sorted by `updated_at desc`
- Remaining page was also inspected interactively and consisted mostly older completed rules/documentation tasks; use Dart as source again during spec-lock if full extraction is needed.

## Snapshot summary — first 100 tasks

### Status counts
- Done: 99
- To-do: 1

### Type counts
- Task: 74
- Subtask: 19
- Milestone: 6
- Project: 1

### Priority counts
- Critical: 57
- High: 37
- Medium: 6

### Top tags
- Regelwerk: 38
- documentation: 21
- Engineering: 15
- Core: 12
- Sonderkarten: 12
- rules: 11
- UI: 9
- Aufgaben: 7
- AI: 6
- Launch: 5
- Zusatzkarten: 5
- LLM: 4
- Testing: 4
- UX: 4
- Audio: 4
- Sound: 4
- Performance: 4
- Wertung: 4
- Angriff: 4
- QA: 3
- frontend: 3
- Bonus: 3
- deployment: 2
- Analytics: 2
- Optimization: 2

## Recommended spec-ingestion order

1. Regelwerk / setup / turn phases / legal actions
2. Card list and special cards
3. Scoring, endgame, invalid-action behavior
4. Engine/state acceptance tests
5. UI/UX requirements
6. Audio/polish requirements
7. QA, Vercel, production and playability gates

## Clustered task candidates

### Regelwerk / Core-Rules (61 captured tasks)
- [Done] 🎮 Schlangentanz - Digitales Kartenspiel — Project, High, tags: Engineering, Product, Dart: https://app.dartai.com/t/CtddSdsqfNZ9-Schlangentanz-Digitales-Karten
- [Done] Implement Audio System for Schlangentanz (M4.7) — Subtask, High, tags: Audio, Sound, UI, Dart: https://app.dartai.com/t/HOER89uDwYRP-Implement-Audio-System-for
- [Done] M4.7: Sound-Design & Musik — Implementation (Schlangentanz) — Subtask, High, tags: Audio, Sound, Dart: https://app.dartai.com/t/a5N7TS80S906-M4-7-Sound-Design-Musik-Implem
- [Done] M4.6.a.qa — Final Vercel smoke test (Schlangentanz pre-launch) — Subtask, High, tags: Launch, QA, Dart: https://app.dartai.com/t/ePZS2msIJzHq-M4-6-a-qa-Final-Vercel-smoke
- [Done] Implement audio system code for Schlangentanz (HRCA-311 impl) — Subtask, High, tags: Audio, Sound, Dart: https://app.dartai.com/t/TeQHvHQC2HQk-Implement-audio-system-code
- [Done] M2: Vollständiges Kartenset & KI (6-8 Wochen) — Milestone, High, tags: AI, Engineering, Dart: https://app.dartai.com/t/w3EYZBI4PxYG-M2-Vollst-ndiges-Kartenset-KI
- [Done] 2.1: Vollständiges Kartenset implementieren — Task, Critical, tags: Content, Daten, Karten, Dart: https://app.dartai.com/t/mVPbQHevoYC5-2-1-Vollst-ndiges-Kartenset
- [Done] R1.3: Startkarten verteilen — Task, Critical, tags: documentation, rules, Dart: https://app.dartai.com/t/SGM6vDqNJSZW-R1-3-Startkarten-verteilen
- [Done] R5.2: Farbgruppen-Bildung — Subtask, Critical, tags: Regelwerk, documentation, Dart: https://app.dartai.com/t/s6aWeVdbhbfN-R5-2-Farbgruppen-Bildung
- [Done] R3.3: Farbgruppen bilden — Task, Critical, tags: documentation, rules, Dart: https://app.dartai.com/t/zZoyOwrVqXL4-R3-3-Farbgruppen-bilden
- [Done] R10: Spielende und Wertung — Subtask, Critical, tags: Regelwerk, documentation, Dart: https://app.dartai.com/t/Q4wFYrnu1MVP-R10-Spielende-und-Wertung
- [Done] R8: Spielende und Wertung — Task, Critical, tags: Core, Regelwerk, Spielende, Wertung, Dart: https://app.dartai.com/t/KTJhcQuXTzLR-R8-Spielende-und-Wertung
- [Done] R9: Zusatzkarten — Subtask, High, tags: Regelwerk, documentation, Dart: https://app.dartai.com/t/L1omN8fb53o9-R9-Zusatzkarten
- [Done] R7: Zusatzkarten — Task, High, tags: Regelwerk, Zusatzkarten, Dart: https://app.dartai.com/t/4fLVqabL05Mu-R7-Zusatzkarten
- [Done] R7: Sonderkarten — Subtask, Critical, tags: Regelwerk, documentation, Dart: https://app.dartai.com/t/atkLmqp5GvaI-R7-Sonderkarten
- [Done] R5: Sonderkarten — Task, Critical, tags: Core, Regelwerk, Sonderkarten, Dart: https://app.dartai.com/t/mOgZfYM4nHhP-R5-Sonderkarten
- [Done] R8: Aufgabenkarten — Subtask, Critical, tags: Regelwerk, documentation, Dart: https://app.dartai.com/t/TA8umJFRgHtX-R8-Aufgabenkarten
- [Done] R6: Aufgabenkarten — Task, Critical, tags: Aufgaben, Core, Regelwerk, Dart: https://app.dartai.com/t/ZCE3lXFiKqL8-R6-Aufgabenkarten
- [Done] R6: Farbkarten — Subtask, Critical, tags: Regelwerk, documentation, Dart: https://app.dartai.com/t/BKoXZ1zAMdTe-R6-Farbkarten
- [Done] R4: Farbkarten — Task, Critical, tags: documentation, rules, Dart: https://app.dartai.com/t/8lBrmRJdbkLI-R4-Farbkarten
- [Done] R5: Schlangenbau — Subtask, Critical, tags: Regelwerk, documentation, Dart: https://app.dartai.com/t/0Stz8jwZ4ciH-R5-Schlangenbau
- [Done] R3: Schlangenbau — Task, Critical, tags: documentation, rules, Dart: https://app.dartai.com/t/2D69Pn3g76t9-R3-Schlangenbau
- [Done] R1.3: Aufgabenkarten auslegen — Subtask, Critical, tags: Regelwerk, documentation, Dart: https://app.dartai.com/t/ov6Hl3e40Iwp-R1-3-Aufgabenkarten-auslegen
- [Done] R1.4: Aufgabenkarten auslegen — Task, Critical, tags: documentation, rules, Dart: https://app.dartai.com/t/GvHOyBQNrhkU-R1-4-Aufgabenkarten-auslegen
- [Done] R1.2: Kartenstapel vorbereiten — Subtask, Critical, tags: Regelwerk, documentation, Dart: https://app.dartai.com/t/iAIdCCBabqbR-R1-2-Kartenstapel-vorbereiten
- [Done] R1.1: Kartenstapel vorbereiten — Task, Critical, tags: documentation, rules, Dart: https://app.dartai.com/t/0SRxMEdb1H5j-R1-1-Kartenstapel-vorbereiten
- [Done] 1.6: Sonderkarten-Logik implementieren — Task, Critical, tags: Core, Engineering, Sonderkarten, Dart: https://app.dartai.com/t/g2gDbV2KEx1d-1-6-Sonderkarten-Logik-impleme
- [Done] 1.7: Aufgabenkarten-Logik implementieren — Task, Critical, tags: Aufgabenkarten, Core, Engineering, Dart: https://app.dartai.com/t/5bxHxKii5Okr-1-7-Aufgabenkarten-Logik-imple
- [Done] 1.5: Schlangenbau-Logik implementieren — Task, Critical, tags: Core, Engineering, Dart: https://app.dartai.com/t/lUl1AQ8ubHon-1-5-Schlangenbau-Logik-impleme
- [Done] 1.4: Zuglogik implementieren — Task, Critical, tags: Core, Engineering, Dart: https://app.dartai.com/t/IlTAyRIplUbu-1-4-Zuglogik-implementieren
- [Done] 1.2: Datenmodell & Kartentypen definieren — Task, Critical, tags: Datenmodell, Engineering, Dart: https://app.dartai.com/t/7iguFRu54Ry2-1-2-Datenmodell-Kartentypen
- [Done] R8.4: Punktwertung - Farbgruppen — Task, Critical, tags: Farbgruppen, Regelwerk, Wertung, Dart: https://app.dartai.com/t/Li7YmJLX9FKo-R8-4-Punktwertung-Farbgruppen
- [Done] R7.4: Interaktion mit anderen Karten — Task, Medium, tags: Interaktion, Regelwerk, Zusatzkarten, Dart: https://app.dartai.com/t/8EuZCGKcTRnU-R7-4-Interaktion-mit-anderen
- [Done] R7.3: Einsatzregeln und Timing — Task, High, tags: Regelwerk, Timing, Zusatzkarten, Dart: https://app.dartai.com/t/NQhbDQdmpntf-R7-3-Einsatzregeln-und-Timing
- [Done] R6.6: Endspurt-Phase Verdopplung — Task, High, tags: Aufgaben, Endspurt, Regelwerk, Dart: https://app.dartai.com/t/t9wh1VFhdzJ3-R6-6-Endspurt-Phase-Verdopplun
- … 26 more captured tasks in this cluster

### Engine / State / Gameplay (10 captured tasks)
- [Done] 5.2: Prompt-Engineering fuer Spielzuege — Task, Critical, tags: Engineering, LLM, Prompts, Dart: https://app.dartai.com/t/Bbeb9nxjEuvG-5-2-Prompt-Engineering-fuer
- [Done] M3: Online-Multiplayer & Analytics (6-8 Wochen) — Milestone, High, tags: DevOps, Engineering, Dart: https://app.dartai.com/t/werEag8utD82-M3-Online-Multiplayer-Analytic
- [Done] 3.2: Spielzustand-Synchronisation — Task, Critical, tags: Core, Multiplayer, Sync, Dart: https://app.dartai.com/t/CT2sUPg3i0AL-3-2-Spielzustand-Synchronisati
- [Done] 2.4: Fortgeschrittene KI (Hard/Expert) — Task, High, tags: AI, Engineering, Strategie, Dart: https://app.dartai.com/t/EVsLETc6PCwz-2-4-Fortgeschrittene-KI-Hard
- [Done] 2.3: Regelbasierte KI (Easy/Medium) — Task, High, tags: AI, Engineering, Heuristik, Dart: https://app.dartai.com/t/pXygVGe50vl1-2-3-Regelbasierte-KI-Easy
- [Done] 2.2: KI-Gegner Architektur — Task, Critical, tags: AI, Core, Engineering, Dart: https://app.dartai.com/t/c7Bre8aCfqgP-2-2-KI-Gegner-Architektur
- [Done] M1: Regel-Engine MVP & Basis-UI (4-6 Wochen) — Milestone, Critical, tags: Engineering, frontend, Dart: https://app.dartai.com/t/YlVpL29lmvVy-M1-Regel-Engine-MVP-Basis-UI
- [Done] 1.10: Spielablauf-Integration & MVP-Tests — Task, Critical, tags: Core, Testing, integration, Dart: https://app.dartai.com/t/7OzMSBQg30Qi-1-10-Spielablauf-Integration
- [Done] 1.3: Spielzustand-Management (Game State) — Task, Critical, tags: Engineering, State, Dart: https://app.dartai.com/t/fikU3lL1dmON-1-3-Spielzustand-Management
- [Done] 1.1: Projekt-Setup & Architektur — Task, Critical, tags: Engineering, setup, Dart: https://app.dartai.com/t/qXkkwTk7Bjeq-1-1-Projekt-Setup-Architektur

### UI / UX / Accessibility (11 captured tasks)
- [Done] M4: Polishing, A11y & Beta-Launch (4-6 Wochen) — Milestone, High, tags: Launch, Testing, UX, Dart: https://app.dartai.com/t/ylVNKI5GidLJ-M4-Polishing-A11y-Beta-Launch
- [Done] M4.3.3 — Lazy-Loading In-Game-Features (Chat + Analytics) — Subtask, Medium, tags: Analytics, Performance, UI, Dart: https://app.dartai.com/t/dXwR4P8qBZ2c-M4-3-3-Lazy-Loading-In-Game
- [Done] M4.1-P0A: GameBoard loading skeleton + game-over entrance animation — Subtask, High, tags: Animation, UI, Dart: https://app.dartai.com/t/R8j1UAJNyoy5-M4-1-P0A-GameBoard-loading
- [Done] M4.1 Lead: UI/UX Polish & Animationen — Spec + Implementierungs-Koordination — Subtask, High, tags: Launch, UI, UX, Dart: https://app.dartai.com/t/ulO1S1Jlo7sw-M4-1-Lead-UI-UX-Polish-Animati
- [Done] 4.1: UI/UX Polish & Animationen — Task, High, tags: Animation, UI, UX, Dart: https://app.dartai.com/t/oCud05tsB5uj-4-1-UI-UX-Polish-Animationen
- [Done] 4.7: Sound-Design & Musik — Task, Medium, tags: Audio, Music, Sound, Dart: https://app.dartai.com/t/0HXACulab4C7-4-7-Sound-Design-Musik
- [Done] 4.2: Accessibility (A11y) Implementation — Task, High, tags: A11y, Accessibility, Inclusive, Dart: https://app.dartai.com/t/H7hUFtTENWT4-4-2-Accessibility-A11y-Impleme
- [Done] 3.4: In-Game Chat & Kommunikation — Task, Medium, tags: Communication, Social, UI, Dart: https://app.dartai.com/t/7ABzGBPLYctR-3-4-In-Game-Chat-Kommunikation
- [Done] 3.3: Lobby-System & Matchmaking — Task, High, tags: Lobby, Multiplayer, UI, Dart: https://app.dartai.com/t/y9Y9iyKB2rSq-3-3-Lobby-System-Matchmaking
- [Done] 1.9: Spieler-Interaktion UI implementieren — Task, High, tags: Interaktion, UI, frontend, Dart: https://app.dartai.com/t/jl3MZVjm40Ya-1-9-Spieler-Interaktion-UI
- [Done] 1.8: Basis-UI Layout implementieren — Task, High, tags: Design, UI, frontend, Dart: https://app.dartai.com/t/6kFYcZligFPV-1-8-Basis-UI-Layout-implementi

### Audio / Sound (0 captured tasks)

### QA / Launch / Deployment (7 captured tasks)
- [Done] 5.6: Automatisierte Benchmark-Runs & CI/CD — Task, High, tags: Automation, CD, Scheduled, Dart: https://app.dartai.com/t/VGcfVVlLlUbr-5-6-Automatisierte-Benchmark
- [Done] M4.6.a.deploy — Provision Vercel staging + first deploy run — Subtask, Critical, tags: Launch, deployment, Dart: https://app.dartai.com/t/6IrBKhqr1yIN-M4-6-a-deploy-Provision-Vercel
- [Done] M4.3.5 — Final Perf-Report + Acceptance Validation — Subtask, High, tags: Performance, QA, Dart: https://app.dartai.com/t/cc2jxejkYxli-M4-3-5-Final-Perf-Report-Accep
- [Done] 4.6: Launch-Vorbereitung & Deployment — Task, Critical, tags: Launch, Release, deployment, Dart: https://app.dartai.com/t/HwQm1YoozsCO-4-6-Launch-Vorbereitung-Deploy
- [Done] 4.5: Beta-Testing & Feedback-Sammlung — Task, High, tags: Beta, Feedback, Testing, Dart: https://app.dartai.com/t/LW6DZlJMyRr9-4-5-Beta-Testing-Feedback
- [Done] 3.6: Multiplayer-Testing & Stabilität — Task, Critical, tags: QA, Stability, Testing, Dart: https://app.dartai.com/t/n6dAAsqHxKT5-3-6-Multiplayer-Testing-Stabil
- [To-do] Workflow-Gate definieren: Done erst nach Commit, Push und Vercel-Deploy — Task, High, tags: -, Dart: https://app.dartai.com/t/80SrxQe88SvT-Workflow-Gate-definieren-Done

### Security / Stability / Performance (2 captured tasks)
- [Done] M4.3 Performance-Optimierung — Implementation — Subtask, High, tags: Optimization, Performance, Dart: https://app.dartai.com/t/qCj4IgSPmMAh-M4-3-Performance-Optimierung
- [Done] 4.3: Performance-Optimierung — Task, High, tags: Optimization, Performance, Speed, Dart: https://app.dartai.com/t/xt21Fh2cH7xy-4-3-Performance-Optimierung

### Data / Persistence / Analytics (1 captured tasks)
- [Done] 3.5: Analytics & Spielstatistiken — Task, High, tags: Analytics, Data, monitoring, Dart: https://app.dartai.com/t/CYaVkZo7VsPD-3-5-Analytics-Spielstatistiken

### Other / Review needed (8 captured tasks)
- [Done] 5.3: Multi-LLM Support & Vergleich — Task, High, tags: Comparison, LLM, Models, Dart: https://app.dartai.com/t/9ucL6vPnyAO1-5-3-Multi-LLM-Support-Vergleic
- [Done] M5: LLM-Benchmark Integration (Phase 2) — Milestone, High, tags: AI, Feature, LLM, Dart: https://app.dartai.com/t/m7noxJJTI37u-M5-LLM-Benchmark-Integration
- [Done] 5.5: Ergebnis-Dashboard & Visualisierung — Task, Medium, tags: Analysis, Dashboard, visualization, Dart: https://app.dartai.com/t/UUn8ckvxJMbf-5-5-Ergebnis-Dashboard-Visuali
- [Done] 5.4: Benchmark-Framework & Metriken — Task, High, tags: benchmark, evaluation, metrics, Dart: https://app.dartai.com/t/pXahy58k3BW4-5-4-Benchmark-Framework-Metrik
- [Done] 5.1: LLM-Integration Architektur — Task, Critical, tags: AI, LLM, architecture, Dart: https://app.dartai.com/t/MYFrWf9VgH4f-5-1-LLM-Integration-Architektu
- [Done] 4.4: Lokalisierung & Mehrsprachigkeit — Task, Medium, tags: Languages, Localization, i18n, Dart: https://app.dartai.com/t/LI0Z9jiypTTK-4-4-Lokalisierung-Mehrsprachig
- [Done] 3.1: Backend-Infrastruktur & WebSocket-Server — Task, Critical, tags: Backend, DevOps, infrastructure, Dart: https://app.dartai.com/t/w8GpgEw8iSkX-3-1-Backend-Infrastruktur
- [Done] M0: Vorbereitung & Grundlagen (2 Wochen) — Milestone, Critical, tags: documentation, planning, Dart: https://app.dartai.com/t/zxIbvDXjI5jZ-M0-Vorbereitung-Grundlagen-2

## Next actions before implementation

- [ ] Pull full task details/comments for rule-heavy Dart tasks.
- [ ] Fill `docs/GAME_SPEC.md` from Dart tasks and user decisions.
- [ ] Ask user to resolve ambiguous rules.
- [ ] Derive failing acceptance tests from locked spec.
- [ ] Only then let Claude Code implement game logic.
