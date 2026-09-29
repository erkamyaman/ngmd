export interface Fence {
  start: number;
  end: number;
  lang: string;
  attrs: string;
  body: string;
}

const LINE_RE = /[^\n]*\n?/g;

export function findFences(markdown: string): Fence[] {
  const fences: Fence[] = [];
  let open: {marker: string; start: number; info: string; top: boolean; body: string[]} | null =
    null;
  LINE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = LINE_RE.exec(markdown)) !== null && m[0] !== '') {
    const line = m[0].replace(/\r?\n$/, '');
    const fence = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(line);
    if (!open) {
      if (fence && !(fence[2][0] === '`' && fence[3].includes('`'))) {
        open = {marker: fence[2], start: m.index, info: fence[3], top: !fence[1], body: []};
      }
      continue;
    }
    if (
      fence &&
      fence[2][0] === open.marker[0] &&
      fence[2].length >= open.marker.length &&
      !fence[3].trim()
    ) {
      if (open.top) {
        const info = open.info.trim();
        const lang = /^[^\s={}"]+(?=\s|$)/.exec(info)?.[0] ?? '';
        fences.push({
          start: open.start,
          end: m.index + line.length,
          lang,
          attrs: info.slice(lang.length).trim(),
          body: open.body.join('\n'),
        });
      }
      open = null;
      continue;
    }
    open.body.push(line);
  }
  return fences;
}

export function getAttr(attrs: string, name: string): string | undefined {
  return new RegExp(`(?:^|\\s)${name}="([^"]*)"`).exec(attrs)?.[1];
}

export function hasFlag(attrs: string, name: string): boolean {
  return new RegExp(`(^|\\s)${name}(\\s|$)`).test(attrs.replace(/"[^"]*"/g, '""'));
}

export function replaceFences(
  markdown: string,
  fences: Array<{start: number; end: number}>,
  html: string[],
): string {
  let result = markdown;
  for (let i = fences.length - 1; i >= 0; i--) {
    result = result.slice(0, fences[i].start) + `\n\n${html[i]}\n\n` + result.slice(fences[i].end);
  }
  return result;
}
