// Typen zu scripts/pruefung/ausnahmen.mjs für die Tests.

export type Ausnahmen = Record<string, Record<string, string[] | number> | string[]>

export declare const AUSNAHMEN_DATEI: string
export declare const VERGLEICH_VORGABE: string
export declare function merkmalDerZeile(quelltext: string, zeile: number): string
export declare function abgleich(gefunden: string[], erlaubt: string[]): { neu: number[]; veraltet: string[] }
export declare function pruefeFormat(daten: Ausnahmen): void
export declare function zuwachs(basis: Ausnahmen, aktuell: Ausnahmen): Array<{ regel: string; pfad: string; merkmal: string }>
export declare function basisAusnahmen(wurzel: string, vergleich: string, liste?: string): { basis: string; daten: Ausnahmen }
