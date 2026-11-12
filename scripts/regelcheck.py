#!/usr/bin/env python3
"""Regelcheck — prüft ein Projekt gegen die Baseline-Kernregeln.

Diese Datei wird per Vendoring in Zielprojekte kopiert und muss deshalb ohne
Fremdabhängigkeiten und als einzelne, selbstständige Datei lauffähig bleiben.
Kein Import aus Nachbarmodulen.

regelcheck: laenge-bewusst muss als einzelne Datei vendorbar bleiben; eine
Aufteilung würde genau die Eigenschaft brechen, die das Werkzeug tragfähig
macht.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path
from typing import NamedTuple

FEHLER = "Fehler"
WARNUNG = "Warnung"


class Befund(NamedTuple):
    """Ein einzelner Regelverstoss. zeile = 0 bedeutet: betrifft die ganze Datei."""

    datei: str
    zeile: int
    schweregrad: str
    regel: str
    hinweis: str


# Ohne Rücksicht auf Gross- und Kleinschreibung: a_FIXED.py ist dieselbe
# Zweitdatei wie a_fixed.py. `_v2` nennt der Kern ausdrücklich, " - Kopie"
# und " - copy" hängen Explorer und Finder beim Duplizieren an.
VERBOTENE_DATEINAMEN = [
    (re.compile(r"_fixed(_\d+)?(\.|$)", re.I), "_fixed"),
    (re.compile(r"(^|/)fixed_", re.I), "fixed_"),
    (re.compile(r"_final(\.|$)", re.I), "_final"),
    (re.compile(r"_korrigiert(\.|$)", re.I), "_korrigiert"),
    (re.compile(r"_new(\.|$)", re.I), "_new"),
    (re.compile(r"_updated(\.|$)", re.I), "_updated"),
    (re.compile(r"_backup(\.|$)", re.I), "_backup"),
    (re.compile(r"_old(\.|$)", re.I), "_old"),
    (re.compile(r"_v\d+(\.|$)", re.I), "_v2"),
    (re.compile(r" - (?:kopie|copy)( \(\d+\))?(\.|$)", re.I), " - Kopie"),
    (re.compile(r" \(\d+\)\."), " (n)"),
]


IGNORIER_PRAGMA = "regelcheck: ignorieren"
LAENGE_PRAGMA = "regelcheck: laenge-bewusst"
# Nur ein Pragma im Dateikopf ist ein Entschluss. Weiter unten steht es als
# Text — in einer Doku-Zeile oder einer Testvorlage, die es selbst prüft — und
# entlastete die Datei dann versehentlich; als "Begründung" zählte das
# Bruchstück dahinter. Die Grenze liegt über der tiefsten echten Fundstelle im
# Repo (Zeile 12, Modul-Docstring) und lässt Lizenzköpfe Platz.
LAENGE_PRAGMA_KOPFZEILEN = 20

# Jeder git-Aufruf geht über diese Liste. quotepath=false ist kein Komfort:
# standardmässig quotet git Pfade mit Nicht-ASCII-Bytes und liefert
# '"\303\274bung.py"' samt Anführungszeichen. Mit diesem Namen findet
# 'git cat-file blob :<pfad>' die Datei nicht, und sie fiel still aus jeder
# Prüfung — in einem deutschsprachigen Werkzeug der wahrscheinlichste Fall.
GIT = ["git", "-c", "core.quotepath=false"]

SECRET_MUSTER = [
    (re.compile(r"sk-ant-[A-Za-z0-9_-]{20,}"), "Anthropic-Schlüssel"),
    # Projekt-, Dienstkonto- und Admin-Schlüssel tragen einen zweiten
    # Bindestrich, an dem das allgemeine sk-Muster darunter abbricht.
    (re.compile(r"sk-(?:proj|svcacct|admin)-[A-Za-z0-9_-]{20,}"), "OpenAI-Projektschlüssel"),
    (re.compile(r"sk-[A-Za-z0-9]{20,}"), "OpenAI-artiger Schlüssel"),
    (re.compile(r"gh[pousr]_[A-Za-z0-9]{36,}"), "GitHub-Token"),
    (re.compile(r"github_pat_[A-Za-z0-9_]{60,}"), "GitHub-Token"),
    (re.compile(r"glpat-[A-Za-z0-9_-]{20,}"), "GitLab-Token"),
    (re.compile(r"\bhf_[A-Za-z0-9]{30,}"), "Hugging-Face-Token"),
    (re.compile(r"AKIA[0-9A-Z]{16}"), "AWS-Zugriffsschlüssel"),
    (re.compile(r"xox[baprs]-[A-Za-z0-9-]{10,}"), "Slack-Token"),
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"), "privater Schlüssel"),
    (re.compile(r"AIza[0-9A-Za-z_-]{35}"), "Google-API-Schlüssel"),
    (re.compile(r"(?:sk|rk)_live_[A-Za-z0-9]{20,}"), "Stripe-Schlüssel"),
    (re.compile(r"npm_[A-Za-z0-9]{36}"), "npm-Token"),
]

# Bewusst nicht case-insensitive: sonst passt 'monkey' auf die Endung 'key'.
_ENDUNGEN = (
    "key|token|secret|passwort|password|pwd|credential"
    "|KEY|TOKEN|SECRET|PASSWORT|PASSWORD|PWD|CREDENTIAL"
    "|Key|Token|Secret|Passwort|Password|Pwd|Credential")
_NAME = (
    r"\b(?P<name>"
    r"[A-Za-z][A-Za-z0-9_]*_(?:" + _ENDUNGEN + r")"         # api_key, SHOPIFY_STOREFRONT_TOKEN
    r"|[a-z][a-zA-Z0-9]*(?:Key|Token|Secret|Passwort|Password|Pwd|Credential)"  # apiKey
    r"|[A-Z][a-zA-Z0-9]*(?:Key|Token|Secret|Passwort|Password|Pwd|Credential)"  # ApiKey
    r"|(?:" + _ENDUNGEN + r")"                               # bares key, token
    r")\b")
# Der Name darf in Anführungszeichen stehen, wie in JSON: "apiKey": "...".
ZUWEISUNG = re.compile(
    _NAME + r"[\"']?\s*[:=]\s*"
    r"(?P<anf>[\"'])(?P<wert>[^\"'\n]{16,})(?P=anf)")
# Werte ohne Anführungszeichen nur in Konfigurationsdateien (.env, YAML, INI).
# Im Code wären es Ausdrücke wie Funktionsaufrufe, und jeder längere
# Bezeichner rechts vom Gleichheitszeichen würde zum Kandidaten.
ZUWEISUNG_ROH = re.compile(
    r"^\s*(?:export\s+)?" + _NAME + r"\s*[:=]\s*(?P<wert>[^\s\"'#]{16,})\s*(?:#.*)?$")
KONFIG_ENDUNGEN = {".env", ".yml", ".yaml", ".toml", ".ini", ".cfg", ".conf", ".properties"}


def ist_konfigdatei(datei: str) -> bool:
    """Konfigurationsdatei, in der Werte auch ohne Anführungszeichen stehen."""
    name = Path(datei).name
    return (Path(datei).suffix in KONFIG_ENDUNGEN or name == ".env"
            or name.startswith(".env."))

PLATZHALTER = (
    "example", "beispiel", "your", "dein", "changeme", "platzhalter",
    "placeholder", "dummy", "xxxx", "todo", "<", "${", "...",
)

ENTROPIE_SCHWELLE = 3.5
# Werte ohne Gross-/Kleinmischung gelten erst ab dieser Länge und Entropie als
# Schlüssel. Grund: `field_key = "grundstueck_flaeche"` ist ein Datenfeld, kein
# Geheimnis. Über 38 gewachsene Projekte gemessen fielen damit 221 von 250
# Entropietreffern weg, ohne dass eine echte Schlüsselform durchrutschte.
ZWEIKLASSEN_LAENGE = 32
ZWEIKLASSEN_ENTROPIE = 3.9

# Eigene, niedrigere Schwelle für rein numerische Werte: das Maximum eines
# Ziffernalphabets liegt bei log2(10) ≈ 3.322 und erreicht ENTROPIE_SCHWELLE
# damit nie. isdigit() allein wäre aber zu grob — sich wiederholende oder
# durchnummerierte Ziffernfolgen (Testkartennummern, Zeitstempel, '1111...')
# sind keine Schlüssel und sollen schweigen, auch wenn sie 16+ Stellen haben.
ZIFFERN_SCHWELLE = 2.5

# Reine Hex-Werte ab 32 Zeichen sind typische Zugangstokens (z. B. Shopify-
# Storefront-Token). Ihr Alphabet hat höchstens log2(16) = 4 Bit, zufällige
# 32er-Werte liegen meist um 3.5 bis 3.8 und verfehlen ZWEIKLASSEN_ENTROPIE.
# Die niedrigere Schwelle trennt sie von gleichförmigen Füllwerten.
HEX_TOKEN = re.compile(r"[0-9a-f]{32,}|[0-9A-F]{32,}")
HEX_SCHWELLE = 3.0

# Punktgetrennte Bezeichnerpfade wie "cardData.snakeBite.title" sind
# Übersetzungs- oder Konfigurationsschlüssel, keine Geheimnisse. Kurze,
# buchstabenbeginnende Segmente mit kaum Ziffern unterscheiden sie von JWTs,
# deren Teile lang und zufällig sind.
BEZEICHNER_SEGMENT = re.compile(r"[A-Za-z][A-Za-z0-9_-]{0,29}")
BEZEICHNER_MAX_ZIFFERN = 2
# Konstanten in Grossschreibung wie RECOMMENDS_ONLY@U01: Wörter mit
# Unterstrich, optional mit einem @-Zusatz. So sehen Aufzählungswerte in
# JSON-Daten aus, keine Schlüssel; seit auch JSON-Namen in Anführungszeichen
# geprüft werden, träfe die Entropieschwelle sie sonst reihenweise.
KONSTANTE = re.compile(r"[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+(?:@[A-Z0-9_]+)?")

ENV_ERLAUBT = {".env.example", ".env.template"}
CODE_ENDUNGEN = {".py", ".js", ".ts", ".tsx", ".jsx", ".mjs", ".css", ".scss",
                 ".html", ".vue", ".svelte", ".go", ".rs", ".java", ".sh", ".sql"}
# Skripte wie .ps1 und .cmd gehören dazu: ein Eszett oder CRLF darin bliebe
# sonst unbemerkt. Dateien ohne Endung erkennt ist_textdatei() an der Shebang.
TEXT_ENDUNGEN = CODE_ENDUNGEN | {".md", ".txt", ".json", ".yml", ".yaml", ".toml",
                                 ".ps1", ".psm1", ".bat", ".cmd", ".cjs", ".csv",
                                 ".svg", ".xml"}
LAENGEN_RICHTWERT = 400
# Inhaltsgebundene Ausnahmen von der Namensregel. Für unveränderliche
# historische Dateien, deren Pfad andere Belege per Prüfsumme referenzieren;
# eine Umbenennung bräche diese Belege. Jede Ausnahme gilt nur für genau den
# Inhalt mit der eingetragenen SHA-256 und nur für die Namensregel.
NAMENSAUSNAHMEN = ".regelcheck-ausnahmen.json"


def dateiliste(wurzel: Path, nur_geaendert: bool) -> list[str]:
    """Versionierte Dateien des Repos.

    Nur was git kennt — damit bleiben node_modules, .venv und dist aussen vor,
    ohne dass eine eigene Ausschlussliste gepflegt werden muss.

    'R' gehört in den Filter: git erkennt Umbenennungen und meldet sie als
    'R', nicht als 'A'. Ohne 'R' blieb ein `git mv modul.py modul_fixed.py`
    ungeprüft — also genau der naheliegendste Weg zu einer Duplikatdatei.
    `--name-only` liefert bei 'R' den Zielnamen, und der ist der gesuchte.

    Aus demselben Grund steht 'T' darin: wird ein Symlink durch eine
    gewöhnliche Datei ersetzt, meldet git einen Typwechsel, und deren neuer
    Inhalt ging sonst samt Secret ungeprüft in den Commit.
    """
    if nur_geaendert:
        befehl = GIT + ["diff", "--cached", "--name-only", "--diff-filter=ACMRT", "-z"]
    else:
        befehl = GIT + ["ls-files", "-z"]
    try:
        ergebnis = subprocess.run(
            befehl, cwd=wurzel, capture_output=True, check=True,
            encoding="utf-8", errors="replace")
    except FileNotFoundError:
        raise SystemExit(
            "git wurde nicht gefunden — bitte sicherstellen, dass git "
            "installiert und im PATH verfügbar ist.")
    except subprocess.CalledProcessError as fehler:
        raise SystemExit(
            f"Kein Git-Repository unter '{wurzel}' gefunden oder git-Befehl "
            f"fehlgeschlagen: {fehler.stderr.strip()}")
    # -z: Namen enden mit NUL; splitlines() trennte sie sonst auch an U+2028.
    return [name for name in ergebnis.stdout.split("\0") if name]


def namensausnahmen(wurzel: Path, aus_index: bool = False,
                    speicher: dict[str, bytes | None] | None = None
                    ) -> dict[str, dict[str, str]]:
    """Liest NAMENSAUSNAHMEN; eine fehlerhafte Datei bricht ab, statt still
    nichts oder alles freizugeben.

    Im Hook-Modus gilt die Fassung im Index: eine nur auf der Platte geänderte
    Ausnahmedatei darf einen Commit nicht freigeben.
    """
    roh = dateibytes(wurzel, NAMENSAUSNAHMEN, aus_index, speicher)
    if roh is None:
        return {}
    wert = json.loads(roh.decode("utf-8"))
    if (not isinstance(wert, dict) or set(wert) != {"filename_exceptions"}
            or not isinstance(wert["filename_exceptions"], dict)):
        raise ValueError(f"{NAMENSAUSNAHMEN}: erwartet genau den Schlüssel "
                         f"'filename_exceptions' mit einer Zuordnung Pfad -> Ausnahme.")
    for datei, eintrag in wert["filename_exceptions"].items():
        teile = datei.split("/")
        if (not datei or datei.startswith("/") or ":" in datei or "\\" in datei
                or any(teil in ("", ".", "..") for teil in teile)
                or not isinstance(eintrag, dict) or set(eintrag) != {"sha256", "reason"}
                or not isinstance(eintrag["sha256"], str)
                or not re.fullmatch("[0-9a-f]{64}", eintrag["sha256"])
                or not isinstance(eintrag["reason"], str) or not eintrag["reason"].strip()):
            raise ValueError(f"{NAMENSAUSNAHMEN}: '{datei}' braucht einen relativen "
                             f"Pfad, eine SHA-256 und eine Begründung.")
    return wert["filename_exceptions"]


def pruefe_dateinamen(dateien: list[str], wurzel: Path | None = None,
                      aus_index: bool = False,
                      speicher: dict[str, bytes | None] | None = None) -> list[Befund]:
    """Meldet Duplikatdateien, die statt einer Korrektur angelegt wurden.

    Mit `wurzel` gelten die Ausnahmen aus NAMENSAUSNAHMEN, und zwar nur für
    den Inhalt mit der eingetragenen Prüfsumme. Ohne `wurzel` wird allein der
    Name beurteilt.
    """
    ausnahmen = namensausnahmen(wurzel, aus_index, speicher) if wurzel else {}
    befunde: list[Befund] = []
    for datei in dateien:
        for muster, name in VERBOTENE_DATEINAMEN:
            if muster.search(datei):
                eintrag = ausnahmen.get(datei)
                if eintrag:
                    roh = dateibytes(wurzel, datei, aus_index, speicher)
                    if roh is not None and hashlib.sha256(roh).hexdigest() == eintrag["sha256"]:
                        break
                befunde.append(Befund(
                    datei, 0, FEHLER, "keine Duplikatdateien",
                    f"Dateiname enthält '{name}' — die Originaldatei direkt "
                    f"bearbeiten; Versionen verwaltet git"))
                break
    return befunde


def dekodieren(roh: bytes) -> str | None:
    """Rohbytes zu Text; None wenn nicht dekodierbar.

    Die UTF-16-Erkennung per Byte-Order-Mark läuft vor dem NUL-Test: UTF-16-
    Text enthält NUL-Bytes und würde sonst fälschlich als Binärdatei gelten
    und Klartext-Schlüssel darin unentdeckt lassen. Latin-1 bleibt bewusst
    aussen vor — es dekodiert praktisch jede Bytefolge und würde die
    Binärerkennung aushebeln.
    """
    if roh[:2] in (b"\xff\xfe", b"\xfe\xff"):
        try:
            return roh.decode("utf-16")
        except UnicodeDecodeError:
            return None
    if b"\x00" in roh:
        return None
    try:
        return roh.decode("utf-8")
    except UnicodeDecodeError:
        return None


def git_zeilen(text: str) -> list[str]:
    """Zeilen, wie git sie zählt: nur \\n trennt, ein \\r am Zeilenende fällt weg.

    str.splitlines() trennt auch an U+2028 und weiteren Zeichen. Die
    Zeilennummern eines Befunds lagen dann hinter der Zeile, die Editor und
    git zeigen, und passten nicht mehr zu hinzugefuegte_zeilen().
    """
    teile = text.split("\n")
    if teile and teile[-1] == "":
        teile.pop()
    return [teil[:-1] if teil.endswith("\r") else teil for teil in teile]


def textinhalt(pfad: Path) -> str | None:
    """Dateiinhalt von der Platte als Text; None bei Binärdatei oder Lesefehler."""
    try:
        roh = pfad.read_bytes()
    except OSError:
        return None
    return dekodieren(roh)


def blob_aus_index(wurzel: Path, datei: str) -> bytes | None:
    """Liest den Blob-Inhalt einer Datei aus dem Git-Index — roh, ohne Text-
    Dekodierung. None, wenn die Datei nicht (mehr) im Index steht.

    Ohne text=True: der Rückgabewert muss byte-genau bleiben, damit BOM- und
    CRLF-Erkennung auf denselben Bytes laufen wie beim eigentlichen Commit.
    """
    ergebnis = subprocess.run(
        GIT + ["cat-file", "blob", f":{datei}"],
        cwd=wurzel, capture_output=True)
    if ergebnis.returncode != 0:
        return None
    return ergebnis.stdout


def blob_aus_head(wurzel: Path, datei: str) -> bytes | None:
    """Wie blob_aus_index(), aber aus HEAD. None, wenn es die Datei dort nicht
    gab — etwa im allerersten Commit oder bei einer neu angelegten Datei."""
    ergebnis = subprocess.run(
        GIT + ["cat-file", "blob", f"HEAD:{datei}"],
        cwd=wurzel, capture_output=True)
    if ergebnis.returncode != 0:
        return None
    return ergebnis.stdout


def dateibytes(wurzel: Path, datei: str, aus_index: bool = False,
               speicher: dict[str, bytes | None] | None = None) -> bytes | None:
    """Rohbytes einer Datei — aus dem Index oder von der Platte.

    Im --geaendert-Modus wird committet, was im Index steht, nicht was
    zufällig auf der Platte liegt. aus_index=True liest deshalb über
    blob_aus_index() statt per Dateisystemzugriff — sonst prüft der Hook eine
    Arbeitskopie, die seit dem Stagen weitergeändert wurde, während der Index
    etwas anderes enthält.

    `speicher` ist ein optionaler Lesezwischenspeicher für genau einen Lauf.
    Jeder Indexzugriff startet einen eigenen git-Prozess, und vier Prüfungen
    lesen dieselben Dateien: gemessen waren das bei 19 gestagten Dateien rund
    76 Prozessstarts und gut vier Fünftel der Hook-Laufzeit.

    Bewusst ein Parameter und kein Modulzustand. Ein globaler Speicher würde
    im selben Prozess einen veralteten Stand ausliefern, sobald zwischen zwei
    Prüfungen neu gestaget wird — in einem Werkzeug, das über Commits
    entscheidet, der schlechtere Tausch. Wer nichts übergibt, liest frisch.
    """
    if speicher is not None and datei in speicher:
        return speicher[datei]
    if aus_index:
        roh = blob_aus_index(wurzel, datei)
    else:
        try:
            roh = (wurzel / datei).read_bytes()
        except OSError:
            roh = None
    if speicher is not None:
        speicher[datei] = roh
    return roh


def dateitext(wurzel: Path, datei: str, aus_index: bool = False,
              speicher: dict[str, bytes | None] | None = None) -> str | None:
    """Dateiinhalt als Text — aus dem Index oder von der Platte, je nach Modus."""
    roh = dateibytes(wurzel, datei, aus_index, speicher)
    if roh is None:
        return None
    return dekodieren(roh)


def entropie(text: str) -> float:
    """Shannon-Entropie in Bit je Zeichen."""
    if not text:
        return 0.0
    laenge = len(text)
    return -sum((anzahl / laenge) * math.log2(anzahl / laenge)
                for anzahl in Counter(text).values())


def ist_platzhalter(wert: str) -> bool:
    klein = wert.lower()
    return any(marke in klein for marke in PLATZHALTER)


def zeichenklassen(wert: str) -> int:
    """Zählt, wie viele der vier Zeichenklassen im Wert vorkommen."""
    return sum([any(z.islower() for z in wert),
                any(z.isupper() for z in wert),
                any(z.isdigit() for z in wert),
                any(not z.isalnum() for z in wert)])


def ist_bezeichnerpfad(wert: str) -> bool:
    """Erkennt punktgetrennte Schlüsselpfade wie "expansion.taskCards.title"."""
    segmente = wert.split(".")
    return len(segmente) >= 2 and all(
        BEZEICHNER_SEGMENT.fullmatch(segment)
        and sum(z.isdigit() for z in segment) <= BEZEICHNER_MAX_ZIFFERN
        for segment in segmente)


def sieht_wie_schluessel_aus(wert: str) -> bool:
    """Entscheidet, ob ein Literal als Schlüssel durchgeht.

    Drei Fälle, nach der Zusammensetzung des Werts getrennt:

    - **Nur Ziffern:** eigene, niedrigere Schwelle. Das Maximum eines
      Ziffernalphabets liegt bei log2(10) ≈ 3.322 und erreicht die allgemeine
      Schwelle nie; ein rein numerischer Schlüssel wäre sonst grundsätzlich
      unerkennbar. Die Schwelle filtert Testkartennummern und Zeitstempel.
    - **Drei oder mehr Zeichenklassen:** die übliche Form heutiger Zugangs-
      schlüssel. Hier genügt die allgemeine Entropieschwelle.
    - **Zwei Klassen:** erst ab Länge und Entropie eines hexartigen Tokens.
      Ohne diese Verschärfung schlägt jedes `field_key = "flaeche_gesamt"` an —
      über 38 gewachsene Projekte gemessen waren das 221 von 250 Treffern,
      also fast nur Rauschen.

    Vorab drei Sonderfälle: Bezeichnerpfade wie `cardData.snakeBite.title`
    und Konstanten wie `RECOMMENDS_ONLY@U01` gelten nie als Schlüssel, reine
    Hex-Werte ab 32 Zeichen schon ab HEX_SCHWELLE.
    """
    if ist_bezeichnerpfad(wert) or KONSTANTE.fullmatch(wert):
        return False
    wert_entropie = entropie(wert)
    if wert.isdigit():
        return wert_entropie >= ZIFFERN_SCHWELLE
    if HEX_TOKEN.fullmatch(wert):
        return wert_entropie >= HEX_SCHWELLE
    if zeichenklassen(wert) >= 3:
        return wert_entropie >= ENTROPIE_SCHWELLE
    return (len(wert) >= ZWEIKLASSEN_LAENGE
            and wert_entropie >= ZWEIKLASSEN_ENTROPIE)


def pruefe_secrets(wurzel: Path, dateien: list[str], aus_index: bool = False,
                   speicher: dict[str, bytes | None] | None = None) -> list[Befund]:
    """Meldet Schlüssel im Klartext.

    Zwei Wege: bekannte Präfixe, und Zuweisungen an schlüsselartige Namen mit
    hoher Entropie. Die Entropieschwelle trennt echte Schlüssel von sprechenden
    Werten wie 'supersicheres-passwort'. Der Name darf in Anführungszeichen
    stehen (JSON); in Konfigurationsdateien zählt auch ein Wert ohne sie.

    Ein rein numerisches Literal ab 16 Stellen zählt zusätzlich, wenn es die
    niedrigere ZIFFERN_SCHWELLE erreicht: das Maximum eines Ziffernalphabets
    liegt bei log2(10) ≈ 3.322 und erreicht ENTROPIE_SCHWELLE damit nie — ein
    rein numerischer Schlüssel wäre sonst grundsätzlich unerkennbar. Die
    eigene, niedrigere Schwelle filtert dabei Testkartennummern, Zeitstempel
    und andere sich wiederholende oder durchnummerierte Ziffernfolgen heraus,
    die sonst reihenweise Fehlalarme auslösen würden.
    """
    befunde: list[Befund] = []
    for datei in dateien:
        text = dateitext(wurzel, datei, aus_index, speicher)
        if text is None:
            continue
        konfig = ist_konfigdatei(datei)
        for nummer, zeile in enumerate(git_zeilen(text), start=1):
            if IGNORIER_PRAGMA in zeile:
                continue
            for muster, bezeichnung in SECRET_MUSTER:
                if muster.search(zeile):
                    befunde.append(Befund(
                        datei, nummer, FEHLER, "keine Secrets im Repo",
                        f"{bezeichnung} im Klartext — entfernen, Schlüssel "
                        f"widerrufen und über eine Umgebungsvariable laden. "
                        f"Bewusster Einzelfall: mit '{IGNORIER_PRAGMA}' in der "
                        f"Zeile ausnehmen."))
                    break
            else:
                # Jede Zuweisung der Zeile zählt: ein Platzhalter vorne
                # verdeckt sonst einen Schlüssel dahinter, etwa in
                # einzeiligem JSON.
                treffer = list(ZUWEISUNG.finditer(zeile))
                roh = ZUWEISUNG_ROH.search(zeile) if konfig else None
                # $VAR und %VAR% verweisen auf die Umgebung, sie sind kein Wert.
                if roh and not roh.group("wert").startswith(("$", "%")):
                    treffer.append(roh)
                for kandidat in treffer:
                    wert = kandidat.group("wert")
                    if not ist_platzhalter(wert) and sieht_wie_schluessel_aus(wert):
                        befunde.append(Befund(
                            datei, nummer, FEHLER, "keine Secrets im Repo",
                            f"'{kandidat.group('name')}' bekommt ein Literal, das "
                            f"wie ein Schlüssel aussieht (hohe Entropie oder rein "
                            f"numerisch) — Schlüssel widerrufen und über eine "
                            f"Umgebungsvariable laden. Bewusster Einzelfall: mit "
                            f"'{IGNORIER_PRAGMA}' in der Zeile ausnehmen."))
                        break
    return befunde


def pruefe_env_dateien(dateien: list[str]) -> list[Befund]:
    """Meldet eingecheckte Umgebungsdateien; Vorlagen sind erlaubt."""
    befunde: list[Befund] = []
    for datei in dateien:
        name = Path(datei).name
        if name == ".env" or (name.startswith(".env.") and name not in ENV_ERLAUBT):
            befunde.append(Befund(
                datei, 0, FEHLER, "keine Secrets im Repo",
                "Umgebungsdatei gehört nicht ins Repo — mit "
                "'git rm --cached' aus dem Index nehmen und in .gitignore "
                "aufnehmen"))
    return befunde


def ist_textdatei(datei: str, roh: bytes | None = None) -> bool:
    """Textdatei nach Endung; Dateien ohne Endung (etwa Git-Hooks) an der Shebang.

    Ohne Endung entscheidet erst der Inhalt. Ein CRLF in
    scripts/githooks/pre-commit bricht '#!/bin/sh' und damit den Hook.
    """
    endung = Path(datei).suffix
    return endung in TEXT_ENDUNGEN or (
        not endung and roh is not None and roh.startswith(b"#!"))


def ohne_textattribut(wurzel: Path, dateien: list[str], aus_index: bool = False) -> set[str]:
    """Dateien, die .gitattributes ausdrücklich als -text führt.

    Solche eingefrorenen Belege behalten ihre Bytes samt CRLF; eine Warnung
    wäre nicht behebbar, ohne ihre Prüfsummen zu brechen, und verdeckte die
    echten Befunde. Gefragt wird git in einem Aufruf für alle Dateien, im
    Index-Modus nach den gestagten Attributen. Ohne Auskunft von git gibt es
    keine Ausnahme, dann wird wie bisher gewarnt.
    """
    if not dateien:
        return set()
    befehl = GIT + ["check-attr", "text", "--stdin", "-z"] + (["--cached"] if aus_index else [])
    try:
        ergebnis = subprocess.run(befehl, cwd=wurzel, capture_output=True,
                                  input="\0".join(dateien).encode("utf-8"))
    except OSError:
        return set()
    if ergebnis.returncode != 0:
        return set()
    # -z liefert je Datei drei Felder: Pfad, Attribut, Wert.
    teile = ergebnis.stdout.decode("utf-8", errors="replace").split("\0")
    return {teile[i] for i in range(0, len(teile) - 2, 3) if teile[i + 2] == "unset"}


def pruefe_codierung(wurzel: Path, dateien: list[str], aus_index: bool = False,
                     speicher: dict[str, bytes | None] | None = None) -> list[Befund]:
    """Warnt bei BOM und CRLF in versionierten Textdateien ausser -text-Belegen."""
    eingefroren = ohne_textattribut(wurzel, dateien, aus_index)
    befunde: list[Befund] = []
    for datei in dateien:
        if datei in eingefroren:
            continue
        if Path(datei).suffix and Path(datei).suffix not in TEXT_ENDUNGEN:
            continue
        roh = dateibytes(wurzel, datei, aus_index, speicher)
        if roh is None or not ist_textdatei(datei, roh):
            continue
        if roh.startswith(b"\xef\xbb\xbf"):
            befunde.append(Befund(
                datei, 0, WARNUNG, "UTF-8 ohne BOM",
                "Datei beginnt mit einem BOM — ohne BOM neu speichern"))
        if b"\r\n" in roh:
            befunde.append(Befund(
                datei, 0, WARNUNG, "LF als Zeilenende",
                "Datei enthält CRLF — auf LF umstellen und .gitattributes prüfen"))
    return befunde


HUNK = re.compile(r"^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@")


def hinzugefuegte_zeilen(wurzel: Path, datei: str) -> set[int] | None:
    """Zeilennummern, die gegenüber HEAD neu hinzugekommen sind.

    None, wenn git keine Auskunft geben kann — dann urteilt der Aufrufer nicht
    über die Datei, statt zu raten.
    """
    try:
        ergebnis = subprocess.run(
            # Dateinamen sind keine Muster: x[1].txt passte als Pathspec auch
            # auf x1.txt, und deren neue Zeilen flossen in das Ergebnis ein.
            GIT + ["--literal-pathspecs", "diff", "--cached", "-U0", "--", datei],
            cwd=wurzel, capture_output=True, encoding="utf-8", errors="replace")
    except OSError:
        return None
    if ergebnis.returncode != 0:
        return None
    neu: set[int] = set()
    for zeile in ergebnis.stdout.splitlines():
        treffer = HUNK.match(zeile)
        if treffer:
            start = int(treffer.group(1))
            anzahl = int(treffer.group(2)) if treffer.group(2) else 1
            neu.update(range(start, start + anzahl))
    return neu


def zaehle_eszett(wurzel: Path, dateien: list[str], aus_index: bool = False,
                  speicher: dict[str, bytes | None] | None = None) -> tuple[int, int]:
    """Zählt Dateien und Zeilen mit Eszett — für die Summenzeile im Vollmodus."""
    eszett = "\u00df"
    betroffene = vorkommen = 0
    for datei in dateien:
        if Path(datei).suffix and Path(datei).suffix not in TEXT_ENDUNGEN:
            continue
        roh = dateibytes(wurzel, datei, aus_index, speicher)
        text = None if roh is None else dekodieren(roh)
        if text is None or not ist_textdatei(datei, roh):
            continue
        treffer = sum(1 for zeile in git_zeilen(text)
                      if eszett in zeile and IGNORIER_PRAGMA not in zeile)
        if treffer:
            betroffene += 1
            vorkommen += treffer
    return betroffene, vorkommen


def pruefe_schreibweise(wurzel: Path, dateien: list[str], aus_index: bool = False,
                        speicher: dict[str, bytes | None] | None = None) -> list[Befund]:
    """Meldet neu eingeführte Eszett — nur die, nicht den Bestand.

    Der Kern verbietet das *Einführen*, nicht das Vorhandensein. Deshalb
    urteilt diese Prüfung ausschliesslich im Index-Modus, und dort nur über
    Zeilen, die gegenüber HEAD hinzugekommen sind. Wer eine gewachsene Datei
    anfasst, bekommt sonst deren gesamten Altbestand vorgehalten — für eine
    Änderung, die davon nichts eingeführt hat.

    Ein Vollscan kann Einführung nicht beobachten, nur Zustand. Er liefert
    deshalb keine Befunde; die Summe steht über zaehle_eszett in der Ausgabe.

    Das Zeichen selbst steht als Escape, damit diese Datei sich nicht selbst
    meldet.
    """
    if not aus_index:
        return []

    eszett = "\u00df"
    befunde: list[Befund] = []
    for datei in dateien:
        if Path(datei).suffix and Path(datei).suffix not in TEXT_ENDUNGEN:
            continue
        roh = dateibytes(wurzel, datei, aus_index, speicher)
        text = None if roh is None else dekodieren(roh)
        if text is None or not ist_textdatei(datei, roh):
            continue
        # Erst nachsehen, dann git fragen. hinzugefuegte_zeilen() startet einen
        # eigenen Prozess je Datei; eine Datei ohne Eszett kann die Regel gar
        # nicht verletzen, dort ist der Start reine Wartezeit. Die Prüfung
        # darunter bleibt unverändert — sie urteilt weiter nur über Zeilen, die
        # gegenüber HEAD hinzugekommen sind.
        if eszett not in text:
            continue
        neue = hinzugefuegte_zeilen(wurzel, datei)
        if neue is None:
            continue
        for nummer, zeile in enumerate(git_zeilen(text), start=1):
            if (nummer in neue and eszett in zeile
                    and IGNORIER_PRAGMA not in zeile):
                befunde.append(Befund(
                    datei, nummer, WARNUNG, "kein Eszett",
                    "neu eingeführtes Eszett — durch ss ersetzen"))
    return befunde


def laengen_ausnahme(text: str) -> str | None:
    """Liefert die Begründung einer bewussten Längenausnahme, sonst None.

    Der Kern nennt die Länge einen Richtwert: bewusst überschreiten ist in
    Ordnung, unbemerkt wachsen nicht. Das Pragma macht den Entschluss sichtbar
    und verlangt einen Grund. Eine leere Zeichenkette bedeutet: Pragma da,
    Begründung fehlt — dann ist es kein Entschluss, sondern eine Abkürzung.

    Gesucht wird nur in den ersten LAENGE_PRAGMA_KOPFZEILEN Zeilen. Weiter
    unten ist das Pragma kein Entschluss, sondern Text: eine Doku-Zeile oder
    eine Testvorlage, die es selbst prüft. Ohne diese Grenze entlastete so
    eine Zeile die ganze Datei, und als Begründung zählte das Bruchstück
    dahinter — samt schliessendem Anführungszeichen. Genau so ist
    scripts/tests/test_regelcheck.py unbemerkt auf 675 Zeilen gewachsen.
    """
    for zeile in git_zeilen(text)[:LAENGE_PRAGMA_KOPFZEILEN]:
        stelle = zeile.find(LAENGE_PRAGMA)
        if stelle != -1:
            return zeile[stelle + len(LAENGE_PRAGMA):].strip()
    return None


def pruefe_dateilaenge(wurzel: Path, dateien: list[str], aus_index: bool = False,
                       speicher: dict[str, bytes | None] | None = None) -> list[Befund]:
    """Warnt bei zu langen Codedateien. Datendateien bleiben aussen vor."""
    befunde: list[Befund] = []
    for datei in dateien:
        if Path(datei).suffix not in CODE_ENDUNGEN:
            continue
        text = dateitext(wurzel, datei, aus_index, speicher)
        if text is None:
            continue
        zeilen = len(git_zeilen(text))
        if zeilen <= LAENGEN_RICHTWERT:
            continue
        begruendung = laengen_ausnahme(text)
        if begruendung:
            continue
        if begruendung == "":
            befunde.append(Befund(
                datei, 0, WARNUNG, "eine Datei, eine Verantwortung",
                f"{zeilen} Zeilen, Richtwert {LAENGEN_RICHTWERT} — das Pragma "
                f"'{LAENGE_PRAGMA}' steht im Dateikopf, aber ohne Begründung; "
                f"ohne Grund ist es kein bewusster Entschluss"))
            continue
        befunde.append(Befund(
            datei, 0, WARNUNG, "eine Datei, eine Verantwortung",
            f"{zeilen} Zeilen, Richtwert {LAENGEN_RICHTWERT} — Aufteilung "
            f"prüfen, oder die Ausnahme mit '{LAENGE_PRAGMA} <Grund>' in den "
            f"ersten {LAENGE_PRAGMA_KOPFZEILEN} Zeilen festhalten"))
    return befunde


def zaehle_unlesbare_dateien(wurzel: Path, dateien: list[str], aus_index: bool = False,
                             speicher: dict[str, bytes | None] | None = None) -> int:
    """Zählt versionierte Dateien, die sich nicht als Text dekodieren liessen.

    Keine Warnung je Datei — nur die Summe. Eine nicht dekodierbare Datei
    wird von pruefe_secrets stillschweigend übersprungen und ist damit genau
    der Ort, an dem sich ein Secret unbemerkt verstecken liesse; die Summe
    macht diesen blinden Fleck wenigstens sichtbar.
    """
    return sum(1 for datei in dateien
               if dateitext(wurzel, datei, aus_index, speicher) is None)


# Beide Muster haben ihre Entsprechung in scripts/baseline_sync.py:
# KERN_MARKER im Anfang-Muster aus _marker("kern"), KERN_KOPF im Versionskopf,
# den kern_lesen() liest. Die Duplikation ist gewollt: regelcheck.py wird in
# Zielprojekte kopiert und muss eine einzelne, selbstständige Datei bleiben.
# Änderungen hier dort nachziehen.
KERN_MARKER = re.compile(
    r"<!--\s*baseline:kern v(?P<version>\d+\.\d+)\s*anfang\s*-->")
KERN_KOPF = re.compile(r"<!--\s*baseline:kern v(?P<version>\d+\.\d+)\s*-->")


# Zuletzt befragt, nachdem --baseline und BASELINE_PFAD nichts ergeben haben.
# Als Konstante und nicht als Literal in der Funktion, damit ein Test den
# Fehlerfall überhaupt herstellen kann: sonst findet er auf einem Rechner,
# auf dem einer dieser Pfade existiert, immer etwas.
FESTE_PFADE = [Path.home() / "Baseline", Path("C:/Work/Privat/Baseline")]


def baseline_wurzel(angabe: str | None = None) -> Path | None:
    """Sucht das Baseline-Repo. None, wenn es nicht auffindbar ist —
    vendorte Projekte laufen auch ohne."""
    kandidaten = []
    if angabe:
        kandidaten.append(Path(angabe))
    aus_umgebung = os.environ.get("BASELINE_PFAD")
    if aus_umgebung:
        kandidaten.append(Path(aus_umgebung))
    kandidaten += FESTE_PFADE
    for kandidat in kandidaten:
        if (kandidat / "rules" / "kern.md").is_file():
            return kandidat
    return None


PLUGIN_MANIFEST = ".claude-plugin/plugin.json"


def _plugin_version(roh: bytes | None) -> str | None:
    """Die Version aus einem Plugin-Manifest; None, wenn nicht lesbar.

    Still bei kaputtem JSON oder fehlendem Feld: diese Prüfung soll einen
    Commit nicht an einer halbfertigen Datei aufhalten.
    """
    if roh is None:
        return None
    try:
        daten = json.loads(roh.decode("utf-8"))
    except (UnicodeDecodeError, ValueError):
        return None
    version = daten.get("version") if isinstance(daten, dict) else None
    return version if isinstance(version, str) else None


def pruefe_plugin_version(wurzel: Path, dateien: list[str],
                          aus_index: bool = False) -> list[Befund]:
    """Warnt, wenn Plugin-Inhalt geändert wurde, ohne die Version zu erhöhen.

    Ein Claude-Code-Plugin wird nicht am Commit ausgeliefert, sondern an der
    Version in seinem Manifest. Der Marketplace zieht den Klon durchaus nach,
    die Installation kopiert aber nur neu, wenn `plugin.json` eine andere
    Version nennt. Bleibt die Version stehen, arbeiten alle Rechner weiter mit
    dem alten Stand — in diesem Repo waren das fünfzehn Commits lang die
    Skills von vor einer ganzen Sichtung, ohne dass irgendetwas davon
    berichtete.

    Absichtlich allgemein: gesucht wird jedes `.claude-plugin/plugin.json`
    unter den vorgemerkten Dateien und daneben. So trägt die Prüfung auch in
    einem Zielprojekt, das selbst ein Plugin ausliefert, und in einem Projekt
    ohne Plugin kostet sie nichts.

    Nur im Index-Modus, wie die Eszett-Prüfung: ob die Version zu dem passt,
    was sich geändert hat, lässt sich allein gegen HEAD sagen. Ein Vollscan
    sieht Zustand, nicht Änderung.

    Warnung und nicht Fehler. In einer Reihe von Commits erhöht man die
    Version sinnvollerweise am Ende, und ein Hook, der das blockiert, wird
    nach der dritten Blockade abgeschaltet — samt der Secrets-Prüfung daneben.
    """
    if not aus_index:
        return []

    # Die Wurzeln aller Plugins im Repo, nicht nur der vorgemerkten: eine
    # Änderung an einem Skill nennt das Manifest ja gerade nicht.
    try:
        alle = subprocess.run(
            GIT + ["ls-files", f"*{PLUGIN_MANIFEST}"],
            cwd=wurzel, capture_output=True, encoding="utf-8", errors="replace")
    except OSError:
        return []
    if alle.returncode != 0:
        return []

    befunde: list[Befund] = []
    for manifest in sorted(z for z in alle.stdout.splitlines() if z):
        rumpf = manifest[:-len(PLUGIN_MANIFEST)].rstrip("/")
        beruehrt = [d for d in dateien
                    if d != manifest and (not rumpf or d.startswith(rumpf + "/"))]
        if not beruehrt:
            continue
        jetzt = _plugin_version(blob_aus_index(wurzel, manifest))
        vorher = _plugin_version(blob_aus_head(wurzel, manifest))
        if jetzt is None or vorher is None or jetzt != vorher:
            continue
        befunde.append(Befund(
            manifest, 0, WARNUNG, "Plugin-Version erhöhen",
            f"{len(beruehrt)} Datei(en) unter '{rumpf or '.'}' geändert, "
            f"Version bleibt {jetzt}. Die Installation auf den anderen "
            f"Rechnern kopiert nur bei einem Versionswechsel neu — ohne "
            f"Erhöhung arbeiten sie weiter mit dem alten Stand. Vor dem Push "
            f"erhöhen."))
    return befunde


# Die Zeigerdateien der übrigen Harnesses. Sie enthalten nichts als einen
# Verweis auf AGENTS.md; projekt-init legt sie an, danach gehören sie dem
# Projekt. baseline_sync.py führt sie bewusst nicht mit: CLAUDE.md ist die
# Datei, in die man Projektnotizen schreibt, ein Mitführen würde sie
# überschreiben.
ZEIGERDATEIEN = ("CLAUDE.md", "GEMINI.md", ".cursor/rules/baseline.mdc")


def pruefe_zeigerdateien(wurzel: Path) -> list[Befund]:
    """Warnt, wenn eine vorhandene Zeigerdatei nicht mehr auf AGENTS.md
    verweist.

    Geprüft wird genau diese eine Eigenschaft, weil nur sie still brechen
    kann: ersetzt jemand den Verweis durch eigene Regeln, liest der Agent ab
    dann diese Datei statt AGENTS.md, und beide driften auseinander, ohne dass
    es auffällt.

    Eine **fehlende** Datei ist dagegen kein Befund. Wer kein Gemini nutzt,
    löscht GEMINI.md, und eine dauerhafte Warnung dafür wäre Rauschen — genau
    die Art Rauschen, nach der ein Hook abgeschaltet wird und mit ihm die
    Secrets-Prüfung daneben.

    Gelesen wird über textinhalt(), damit eine Datei mit fremder Kodierung
    still übersprungen wird statt die Prüfung abzubrechen.
    """
    befunde: list[Befund] = []
    for datei in ZEIGERDATEIEN:
        text = textinhalt(wurzel / datei)
        if text is None:
            continue
        if "AGENTS.md" not in text:
            befunde.append(Befund(
                datei, 0, WARNUNG, "Zeigerdatei verweist auf AGENTS.md",
                f"{datei} nennt AGENTS.md nicht mehr — der Harness liest damit "
                f"diese Datei statt des Regelwerks. Entweder den Verweis "
                f"wiederherstellen oder den eigenen Inhalt nach AGENTS.md "
                f"übernehmen."))
    return befunde


def pruefe_kern_drift(wurzel: Path, baseline: Path | None) -> list[Befund]:
    """Warnt, wenn der eingebundene Kern älter ist als der in der Baseline.

    Beide Lesezugriffe laufen über textinhalt() statt über ein ungeschütztes
    read_text() — eine AGENTS.md oder kern.md mit fremder Kodierung darf die
    Prüfung nicht mit einer Ausnahme abbrechen lassen, sondern nur still
    übersprungen werden, wie bei jeder anderen pruefe_*-Funktion hier."""
    agents = wurzel / "AGENTS.md"
    text = textinhalt(agents)
    if text is None:
        return []
    treffer = KERN_MARKER.search(text)
    if not treffer:
        return [Befund(
            "AGENTS.md", 0, WARNUNG, "Kernregeln eingebunden",
            "kein baseline:kern-Markerblock gefunden — /baseline:projekt-init "
            "ausführen")]
    if baseline is None:
        return []
    kern_text = textinhalt(baseline / "rules" / "kern.md")
    if kern_text is None:
        return []
    kopf = KERN_KOPF.search(kern_text)
    if kopf and kopf.group("version") != treffer.group("version"):
        return [Befund(
            "AGENTS.md", 0, WARNUNG, "Kernregeln aktuell",
            f"Kern v{treffer.group('version')} eingebunden, Baseline führt "
            f"v{kopf.group('version')} — regeln-sync ausführen")]
    return []


TAGEBUCH_COMMIT_GRENZE = 10
# Gleich KOPIE_ENDUNGEN in scripts/tagebuch_bauen.py (BILD_ENDUNGEN aus
# tagebuch_quellen.py und .csv); regelcheck.py darf nichts daneben importieren.
TAGEBUCH_KOPIE_ENDUNGEN = (".png", ".jpg", ".jpeg", ".webp", ".svg", ".csv")
# Gleich SYSTEMDATEIEN in scripts/tagebuch_bauen.py.
TAGEBUCH_SYSTEMDATEIEN = ("thumbs.db", "desktop.ini")


def _kopierbar(name: str) -> bool:
    """Gleich _kopierbar in scripts/tagebuch_bauen.py, ohne Endungsfilter."""
    return not name.startswith(".") and name.casefold() not in TAGEBUCH_SYSTEMDATEIEN


def _tagebuch_pruefwert(wurzel: Path) -> str:
    """Rechnet den Prüfwert der Tagebuchquellen nach.

    Auf oberster Ebene zählen projekt.md, plan.md und eigen.css, dazu die
    .md in kapitel/, eintraege/ und daten/. In abbildungen/ zählen die .md
    und die Dateien mit einer Endung aus TAGEBUCH_KOPIE_ENDUNGEN, ohne
    Dateien, deren Name mit einem Punkt beginnt; Thumbs.db, desktop.ini,
    .DS_Store, .aux.xml und .pgw liest der Bau nicht. Mit einem Testregister
    (tagebuch/tests/) kommen bereiche.md, die .md unter faelle/, laeufe/ und
    durchgaenge/ und jede Datei in belege/ dazu, ohne Punkt am Namensanfang
    und ohne Systemdateien. In den Wert geht der Pfad relativ zu tagebuch/
    ein statt nur der Dateiname.

    Diese Auswahlregel steht auch in scripts/tagebuch_bauen.py, das den Wert
    schreibt. Änderungen hier dort nachziehen — sonst meldet der Regelcheck
    eine Abweichung, die keine ist.
    """
    tagebuch = wurzel / "tagebuch"
    oben = [tagebuch / "projekt.md", tagebuch / "plan.md", tagebuch / "eigen.css"]
    abbildungen = tagebuch / "abbildungen"
    try:
        bilder = ([p for p in abbildungen.iterdir()
                   if p.is_file() and _kopierbar(p.name)
                   and p.suffix in (".md",) + TAGEBUCH_KOPIE_ENDUNGEN]
                  if abbildungen.is_dir() else [])
        tests = tagebuch / "tests"
        register = ([tests / "bereiche.md"] if (tests / "bereiche.md").is_file()
                    else []) + [p for name in ("faelle", "laeufe", "durchgaenge")
                                for p in (tests / name).glob("*.md")]
        if (tests / "belege").is_dir():
            register += [p for p in (tests / "belege").iterdir()
                         if p.is_file() and _kopierbar(p.name)]
    except OSError:
        return ""
    quellen = [p for p in oben if p.is_file()] + sorted(
        list((tagebuch / "kapitel").glob("*.md"))
        + list((tagebuch / "eintraege").glob("*.md"))
        + list((tagebuch / "daten").glob("*.md"))
        + bilder + register)
    sammler = hashlib.sha256()
    for pfad in quellen:
        sammler.update(pfad.relative_to(tagebuch).as_posix().encode("utf-8"))
        try:
            sammler.update(pfad.read_bytes())
        except OSError:
            return ""
    return sammler.hexdigest()


ABBILDUNG_GRENZE = 1024 * 1024
EINBETTUNG_ZEILE = re.compile(r"^\s*!\[\[([A-Za-z0-9_-]+)\]\]\s*$", re.MULTILINE)
ABBILDUNGEN_ZEILE = re.compile(r"^abbildungen:(.*)$", re.MULTILINE)


def _ohne_codebloecke(text: str) -> str:
    """Der Text ohne Codeblöcke samt ihren Zaunzeilen.

    Gleiche Regel wie in scripts/tagebuch_quellen.py (zeilen_mit_code): eine
    Zeile, die nach Leerraum mit drei Backticks beginnt, öffnet oder schliesst
    einen Codeblock. Ein `![[name]]` darin bettet auf der Seite nichts ein.
    """
    behalten = []
    im_code = False
    for zeile in git_zeilen(text):
        if zeile.strip().startswith("```"):
            im_code = not im_code
        elif not im_code:
            behalten.append(zeile)
    return "\n".join(behalten)


def _pruefe_abbildungen(tagebuch: Path) -> list[Befund]:
    """Warnt vor zu grossen Abbildungen und vor Abbildungen ohne Verweis.

    Beides sind Warnungen: ein grosses Bild bläht die weitergegebene Seite
    auf, eine nirgends genannte Abbildung steht nur in der Galerie, ohne
    dass ein Text sie erklärt. Ist ein Kapitel oder Eintrag nicht lesbar,
    entfällt die Verweisprüfung still — ohne seinen Text liesse sich nicht
    sagen, ob er die Abbildung nennt.
    """
    ordner = tagebuch / "abbildungen"
    if not ordner.is_dir():
        return []
    befunde: list[Befund] = []
    try:
        dateien = sorted(p for p in ordner.iterdir() if p.is_file())
    except OSError:
        return []
    for pfad in dateien:
        try:
            groesse = pfad.stat().st_size
        except OSError:
            continue
        if groesse > ABBILDUNG_GRENZE:
            befunde.append(Befund(
                f"tagebuch/abbildungen/{pfad.name}", 0, WARNUNG,
                "Abbildung zu gross",
                f"{groesse / ABBILDUNG_GRENZE:.1f} MB — Richtwert höchstens "
                f"1600 px Kantenlänge und 1 MB; das Bild verkleinern"))

    genannt: set[str] = set()
    try:
        for pfad in (tagebuch / "kapitel").glob("*.md"):
            genannt.update(EINBETTUNG_ZEILE.findall(
                _ohne_codebloecke(pfad.read_text(encoding="utf-8-sig"))))
        for pfad in (tagebuch / "eintraege").glob("*.md"):
            text = pfad.read_text(encoding="utf-8-sig")
            for zeile in ABBILDUNGEN_ZEILE.findall(text):
                genannt.update(n.strip() for n in zeile.split(",") if n.strip())
    except (OSError, UnicodeDecodeError):
        return befunde
    for pfad in dateien:
        if pfad.suffix == ".md" and pfad.stem not in genannt:
            befunde.append(Befund(
                f"tagebuch/abbildungen/{pfad.name}", 0, WARNUNG,
                "Abbildung ohne Verweis",
                f"'{pfad.stem}' wird weder als ![[{pfad.stem}]] in einem "
                f"Kapitel eingebettet noch unter 'abbildungen:' in einem "
                f"Eintrag genannt"))
    return befunde


def _git_ausgabe(argumente: list[str], ordner: Path) -> str | None:
    """Die getrimmte Ausgabe eines git-Aufrufs; None bei Fehler, fehlendem git
    oder leerer Ausgabe. Für `check-ignore -q` ist die leere Ausgabe bei Exit 0
    daher "" statt None."""
    try:
        lauf = subprocess.run(GIT + argumente, cwd=ordner, capture_output=True,
                              encoding="utf-8", errors="replace")
    except OSError:
        return None
    return lauf.stdout.strip() if lauf.returncode == 0 else None


def pruefe_tagebuch(wurzel: Path) -> list[Befund]:
    """Warnt, wenn das Tagebuch hinterherhinkt, die Seite veraltet ist oder
    eine Abbildung zu gross ist oder nirgends genannt wird.

    Alles sind Warnungen, nie Fehler. Ein Hook, der einen Commit blockiert,
    weil das Tagebuch hinterherhinkt, wird nach der dritten Blockade
    abgeschaltet — und damit auch die Secrets-Prüfung daneben. Deshalb
    degradiert diese Funktion bei jedem Rand- und Fehlerfall still zu einer
    Warnung oder zu keinem Befund, statt abzustürzen: ein beschädigter
    Stand oder ein fehlendes git dürfen den restlichen Regelcheck — allen
    voran die Secrets-Prüfung — nicht mitreissen.
    """
    tagebuch = wurzel / "tagebuch"
    if not tagebuch.is_dir():
        return []

    befunde = _pruefe_abbildungen(tagebuch)

    stand = tagebuch / "website" / ".stand"
    if stand.is_file():
        try:
            stand_wert = stand.read_text(encoding="utf-8").strip()
        except (OSError, UnicodeDecodeError):
            befunde.append(Befund(
                "tagebuch/website", 0, WARNUNG, "Tagebuch gebaut",
                "'.stand' ist nicht lesbar (beschädigt oder falsch kodiert) "
                "— 'python scripts/tagebuch_bauen.py' erneut ausführen"))
        else:
            erwartet = _tagebuch_pruefwert(wurzel)
            if erwartet and stand_wert != erwartet:
                befunde.append(Befund(
                    "tagebuch/website", 0, WARNUNG, "Tagebuch gebaut",
                    "die Seite passt nicht zu ihren Quellen — "
                    "'python scripts/tagebuch_bauen.py' ausführen"))
    else:
        befunde.append(Befund(
            "tagebuch/website", 0, WARNUNG, "Tagebuch gebaut",
            "die Seite wurde nie gebaut — "
            "'python scripts/tagebuch_bauen.py' ausführen"))

    lokal = (tagebuch / ".git").exists()
    if lokal:
        if _git_ausgabe(["check-ignore", "-q", "tagebuch"], wurzel) is None:
            befunde.append(Befund(
                "tagebuch", 0, WARNUNG, "Tagebuch lokal",
                "tagebuch/ hat ein eigenes Repo, ist im Projekt aber nicht "
                "ausgeblendet — 'tagebuch/' in .git/info/exclude eintragen"))
        zeit = _git_ausgabe(["log", "-1", "--format=%ct"], tagebuch)
        seit = ["--since=" + zeit] if zeit else None
        ziel = "HEAD"
    else:
        letzter = _git_ausgabe(["log", "-1", "--format=%H", "--", "tagebuch"], wurzel)
        seit = [f"{letzter}..HEAD"] if letzter else None
        ziel = None
    anzahl = (_git_ausgabe(["rev-list", "--count", *seit, *([ziel] if ziel else [])],
                           wurzel) if seit else None)
    if anzahl and anzahl.isdigit() and int(anzahl) > TAGEBUCH_COMMIT_GRENZE:
        befunde.append(Befund(
            "tagebuch", 0, WARNUNG, "Tagebuch aktuell",
            f"{anzahl} Commits seit der letzten Änderung am Tagebuch — "
            f"ein Eintrag ist überfällig"))
    return befunde


def pruefe_testregister(wurzel: Path) -> list[Befund]:
    """Übernimmt die Warnungen des Testregisters, nur mit tagebuch/tests/.

    Das Skript scripts/testregister_freigabe.py rechnet die Warnungen aus;
    hier läuft es als Unterprozess, damit regelcheck.py nichts daneben
    importiert. Jede Störung — Skript fehlt, Exit ungleich 0, Zeitlimit —
    wird genau eine Warnung, der übrige Regelcheck läuft weiter.
    """
    if not (wurzel / "tagebuch" / "tests").is_dir():
        return []
    try:
        lauf = subprocess.run(
            [sys.executable, "scripts/testregister_freigabe.py", "--warnungen"],
            cwd=wurzel, capture_output=True, encoding="utf-8", errors="replace",
            timeout=30)
        ursache = None if lauf.returncode == 0 else (
            f"Exit {lauf.returncode}: "
            f"{(lauf.stderr or lauf.stdout).strip() or 'ohne Ausgabe'}")
        if ursache is None and not (wurzel / "scripts" / "testregister_freigabe.py").is_file():
            ursache = "scripts/testregister_freigabe.py fehlt"
    except (OSError, subprocess.SubprocessError) as fehler:
        ursache = f"{type(fehler).__name__}: {fehler}"
    if ursache:
        return [Befund("tagebuch/tests", 0, WARNUNG, "Testregister",
                       f"Testregister nicht auswertbar — {ursache}")]
    return [Befund("tagebuch/tests", 0, WARNUNG, "Testregister", zeile)
            for zeile in lauf.stdout.splitlines() if zeile.strip()]


def formatiere(befund: Befund) -> str:
    ort = f"{befund.datei}:{befund.zeile}" if befund.zeile else befund.datei
    return f"{befund.schweregrad}: {ort} — {befund.regel} — {befund.hinweis}"


def konsole_vorbereiten() -> None:
    """Ersetzt nicht darstellbare Zeichen, statt an der Konsolenkodierung abzustürzen.

    Unter Windows ist eine umgeleitete Ausgabe oft cp1252. Ein Dateiname mit
    einem Zeichen ausserhalb davon warf dann beim Ausgeben eines Befunds
    einen UnicodeEncodeError — der Befund selbst ging im Traceback unter.
    """
    for strom in (sys.stdout, sys.stderr):
        if hasattr(strom, "reconfigure"):
            strom.reconfigure(errors="replace")


def main(argv: list[str] | None = None) -> int:
    konsole_vorbereiten()
    zerleger = argparse.ArgumentParser(
        description="Prüft ein Projekt gegen die Baseline-Kernregeln.")
    zerleger.add_argument(
        "--geaendert", action="store_true",
        help="nur die zum Commit vorgemerkten Änderungen prüfen")
    zerleger.add_argument(
        "--wurzel", type=Path, default=Path.cwd(),
        help="Projektwurzel (Vorgabe: aktuelles Verzeichnis)")
    zerleger.add_argument(
        "--baseline", default=None,
        help="Pfad zum Baseline-Repo (sonst BASELINE_PFAD oder bekannte Orte)")
    argumente = zerleger.parse_args(argv)

    aus_index = argumente.geaendert
    dateien = dateiliste(argumente.wurzel, argumente.geaendert)
    # Ein Lesezwischenspeicher für diesen Lauf. Fünf Prüfungen brauchen den
    # Inhalt derselben Dateien; ohne ihn liest jede einzeln, im Hook-Modus je
    # über einen eigenen git-Prozess. Er lebt nur hier, in einem Lauf, der
    # danach endet — ein veralteter Stand kann so nicht entstehen.
    speicher: dict[str, bytes | None] = {}
    befunde = pruefe_dateinamen(dateien, argumente.wurzel, aus_index, speicher)
    befunde += pruefe_secrets(argumente.wurzel, dateien, aus_index, speicher)
    befunde += pruefe_env_dateien(dateien)
    befunde += pruefe_codierung(argumente.wurzel, dateien, aus_index, speicher)
    befunde += pruefe_schreibweise(argumente.wurzel, dateien, aus_index, speicher)
    befunde += pruefe_dateilaenge(argumente.wurzel, dateien, aus_index, speicher)
    befunde += pruefe_zeigerdateien(argumente.wurzel)
    befunde += pruefe_plugin_version(argumente.wurzel, dateien, aus_index)
    befunde += pruefe_kern_drift(argumente.wurzel, baseline_wurzel(argumente.baseline))
    befunde += pruefe_tagebuch(argumente.wurzel)
    befunde += pruefe_testregister(argumente.wurzel)

    befunde.sort(key=lambda b: (b.schweregrad != FEHLER, b.datei, b.zeile))
    for befund in befunde:
        print(formatiere(befund))

    unlesbar = zaehle_unlesbare_dateien(argumente.wurzel, dateien, aus_index,
                                        speicher)
    if unlesbar:
        print(f"\n{unlesbar} Datei(en) nicht als Text lesbar, übersprungen.")

    # Im Vollmodus ist das Eszett kein Befund: die Regel verbietet das
    # Einführen, und Einführung sieht nur der Index-Modus. Der Bestand wird
    # trotzdem beziffert, damit er nicht unsichtbar wird.
    if not aus_index:
        eszett_dateien, eszett_zeilen = zaehle_eszett(
            argumente.wurzel, dateien, speicher=speicher)
        if eszett_zeilen:
            print(f"\nIn {eszett_dateien} Datei(en) stehen {eszett_zeilen} Zeilen "
                  f"mit Eszett. Die Regel verbietet nur das Einführen, deshalb "
                  f"keine Warnung — beim nächsten Anfassen greift der Hook.")

    anzahl_fehler = sum(1 for b in befunde if b.schweregrad == FEHLER)
    anzahl_warnungen = len(befunde) - anzahl_fehler
    if anzahl_fehler:
        print(f"\n{anzahl_fehler} Fehler, {anzahl_warnungen} Warnungen.",
              file=sys.stderr)
        return 1
    if anzahl_warnungen:
        print(f"\n{anzahl_warnungen} Warnungen, keine Fehler.")
    else:
        print("Keine Beanstandungen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
