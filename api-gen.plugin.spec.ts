// @vitest-environment node
import {mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {ResolvedConfig} from 'vite';
import {apiGenPlugin} from './api-gen.plugin';
import type {SymbolRecord} from './src/types/api';

const FILES: Record<string, string> = {
  'lib/math.ts': `/** License header. */

/**
 * Adds things.
 * @deprecated Use \`sum\` instead.
 */
export function add(a: number, b: number): number;
export function add(a: string, b: string): string;
export function add(a: any, b: any): any {
  return a + b;
}

/**
 * Maps values.
 * @beta
 */
export function map<T, U>(
  items: readonly T[],
  fn: (item: T) => U,
): U[] {
  return items.map(fn);
}

function Deco(): ClassDecorator {
  return () => {};
}

/** A box. */
@Deco()
export class Box<T> extends Array<T> {
  value?: T;
}

export interface Shape {
  area(): number;
}

export type Id = string | number;

/** The answer. */
export const ANSWER: number = 42;

export default function main() {}
`,
  'lib/sub/other.ts': `export class Thing {}\n`,
  'lib/index.ts': `export * from './math';\nexport {Thing as Renamed} from './sub/other';\n`,
  'lib/math.spec.ts': `export const specOnly = 1;\n`,
};

function apiConfig(groupBy: string): string {
  return `import {defineApi} from './types';
export default defineApi({
  scope: ['lib/**/*.ts'],
  exclude: ['**/*.spec.ts'],
  groupBy: '${groupBy}',
  badgesFromJsDoc: ['deprecated', 'beta'],
});
`;
}

describe('apiGenPlugin', () => {
  let root: string;

  beforeEach(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), 'ngmd-api-')));
    for (const [path, text] of Object.entries(FILES)) {
      mkdirSync(join(root, path, '..'), {recursive: true});
      writeFileSync(join(root, path), text);
    }
  });

  afterEach(() => rmSync(root, {recursive: true, force: true}));

  function records(): SymbolRecord[] {
    const plugin = apiGenPlugin() as {
      configResolved: (cfg: ResolvedConfig) => void;
      load: (id: string) => string;
    };
    plugin.configResolved({root} as ResolvedConfig);
    const code = plugin.load('\0virtual:ngmd/api-index');
    return JSON.parse(code.slice(code.indexOf('['), code.lastIndexOf(']') + 1));
  }

  function byName(list: SymbolRecord[], name: string): SymbolRecord {
    return list.find((r) => r.name === name)!;
  }

  it('emits an empty index without ngmd.api.ts', () => {
    expect(records()).toEqual([]);
  });

  it('lists each declaration once at its own file and line, honouring exclude', () => {
    writeFileSync(join(root, 'ngmd.api.ts'), apiConfig('directory'));
    const list = records();
    expect(list.map((r) => `${r.name} ${r.filePath}:${r.line} ${r.group}`).sort()).toEqual([
      'ANSWER lib/math.ts:41 lib',
      'Box lib/math.ts:29 lib',
      'Id lib/math.ts:38 lib',
      'Renamed lib/sub/other.ts:1 lib-sub',
      'Shape lib/math.ts:34 lib',
      'Thing lib/sub/other.ts:1 lib-sub',
      'add lib/math.ts:7 lib',
      'main lib/math.ts:43 lib',
      'map lib/math.ts:17 lib',
    ]);
  });

  it('builds signatures without decorators, export keywords or bodies', () => {
    writeFileSync(join(root, 'ngmd.api.ts'), apiConfig('directory'));
    const list = records();
    expect(byName(list, 'add').signature).toBe(
      'function add(a: number, b: number): number\nfunction add(a: string, b: string): string',
    );
    expect(byName(list, 'map').signature).toBe(
      'function map<T, U>(\n  items: readonly T[],\n  fn: (item: T) => U,\n): U[]',
    );
    expect(byName(list, 'Box').signature).toBe('class Box<T> extends Array<T>');
    expect(byName(list, 'Shape').signature).toBe('interface Shape {\n  area(): number;\n}');
    expect(byName(list, 'ANSWER').signature).toBe('const ANSWER: number');
    expect(byName(list, 'main').signature).toBe('function main()');
  });

  it('reads the JSDoc next to the declaration and turns tags into badges', () => {
    writeFileSync(join(root, 'ngmd.api.ts'), apiConfig('directory'));
    const list = records();
    expect(byName(list, 'add')).toMatchObject({
      description: 'Adds things.',
      badges: ['deprecated'],
    });
    expect(byName(list, 'map')).toMatchObject({description: 'Maps values.', badges: ['beta']});
    expect(byName(list, 'ANSWER').description).toBe('The answer.');
    expect(byName(list, 'Box').description).toBe('A box.');
  });

  it('groups by symbol kind', () => {
    writeFileSync(join(root, 'ngmd.api.ts'), apiConfig('kind'));
    const list = records();
    expect(byName(list, 'add').group).toBe('function');
    expect(byName(list, 'Box').group).toBe('class');
    expect(byName(list, 'Id').group).toBe('type');
  });
});
