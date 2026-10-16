/**
 * Replace `$name` references in a package.json `overrides` block with the
 * range the package declares in `dependencies` or `devDependencies`.
 *
 * pnpm ignores top-level `overrides`, but npm resolves them and fails with
 * "Unable to resolve reference $vitest" in a scaffolded project. Literal
 * ranges install under npm, pnpm, yarn and bun alike.
 */
export function resolveOverrideRefs(pkg) {
  if (!pkg.overrides) return pkg;
  const ranges = {...pkg.devDependencies, ...pkg.dependencies};
  const resolve = (value) => {
    if (typeof value === 'string') {
      if (!value.startsWith('$')) return value;
      const range = ranges[value.slice(1)];
      if (!range) {
        throw new Error(`override ${value} has no matching dependency in package.json`);
      }
      return range;
    }
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v)]));
  };
  return {...pkg, overrides: resolve(pkg.overrides)};
}
