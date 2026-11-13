// Typen zu scripts/pruefung/vertraege.mjs für die Tests.

export type Vertrag = { projekt: string; datei: string; vertrag: string }

export declare function vertraegeAusBericht(bericht: unknown): Vertrag[]
export declare function playwrightVertraege(wurzel: string): Vertrag[]
export declare function unbekannteAusnahmen<T extends { klasse: string; datei: string; vertrag: string }>(
  ausnahmen: T[],
  vertraege: Vertrag[],
): T[]
