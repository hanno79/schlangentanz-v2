import { vi } from 'vitest'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Fabrik } from '../src/ki/strategien/strategie'
import { WURZEL } from './probebaum'

/** Die Registry der Strategien im Repo (U5, P0.3d). */
export const STRATEGIEN_REGISTRY = { pfad: 'src/ki/strategien/index.ts', registry: 'STRATEGIEN' }

/**
 * Eine Registry, frisch geladen: `vi.resetModules()` lässt auch alle Strategien und
 * ihre Abhängigkeiten neu laden (Isolationstest P0.3d, Messläufe K5).
 */
export async function ladeRegistry(pfad: string, name: string): Promise<Readonly<Record<string, Fabrik>>> {
  vi.resetModules()
  const modul: Record<string, unknown> = await import(/* @vite-ignore */ pathToFileURL(join(WURZEL, pfad)).href)
  const registry = modul[name]
  if (typeof registry !== 'object' || registry === null) throw new Error(`Registry laden: ${pfad} exportiert keine Registry ${name}`)
  return registry as Readonly<Record<string, Fabrik>>
}
