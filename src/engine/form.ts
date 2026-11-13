/*
Kleine Prüfer für Werte unbekannter Herkunft: geladene Spielstände und Aktionen,
die von aussen kommen. Sie prüfen nur die Form; was die Regeln erlauben, steht
in der Aktionsschicht und in den Invarianten.
*/

export function istObjekt(wert: unknown): wert is Record<string, unknown> {
  return wert !== null && typeof wert === 'object' && !Array.isArray(wert);
}

export function istText(wert: unknown): wert is string {
  return typeof wert === 'string' && wert.length > 0;
}

export function istGanzeZahl(wert: unknown, minimum = 0): wert is number {
  return Number.isInteger(wert) && (wert as number) >= minimum;
}

/** Text eines gefangenen Fehlers; ein geworfener Nicht-Error-Wert bleibt als Text sichtbar. */
export function fehlertext(fehler: unknown): string {
  return fehler instanceof Error ? fehler.message : String(fehler);
}

/** Felder, die fehlen oder zu viel sind, gemessen an `erwartet`. */
export function abweichendeFelder(objekt: Record<string, unknown>, erwartet: readonly string[]): string[] {
  const fehlend = erwartet.filter((feld) => !Object.prototype.hasOwnProperty.call(objekt, feld));
  const fremd = Object.keys(objekt).filter((feld) => !erwartet.includes(feld));
  return [...fehlend.map((feld) => `${feld} fehlt`), ...fremd.map((feld) => `unbekanntes Feld ${feld}`)];
}
