// Literal JS/TS module specifiers shared by file selection and dependency reports.
// Comments, strings and template bodies are skipped. Computed specifiers are
// flagged so file selection can conservatively retain the shared pool.
// This is a lightweight scanner, not a general JavaScript parser; regex literals
// can conservatively over-report imports. The real registry is checked against
// TypeScript's parser in componentPlans.test.ts.

function isIdStart(ch: string): boolean {
  return (ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z") || ch === "_" || ch === "$";
}

function isIdChar(ch: string): boolean {
  return isIdStart(ch) || (ch >= "0" && ch <= "9");
}

function isWhitespace(ch: string): boolean {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r" || ch === "\v" || ch === "\f";
}

function skipTrivia(text: string, index: number): number {
  const n = text.length;
  let i = index;
  while (i < n) {
    const c = text[i] as string;
    if (isWhitespace(c)) {
      i += 1;
      continue;
    }
    if (c === "/" && text[i + 1] === "/") {
      let j = i + 2;
      while (j < n && text[j] !== "\n") j += 1;
      i = j;
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      let j = i + 2;
      while (j < n && !(text[j] === "*" && text[j + 1] === "/")) j += 1;
      i = j < n ? j + 2 : n;
      continue;
    }
    break;
  }
  return i;
}

function tryReadQuotedString(text: string, index: number): { value: string; end: number } | null {
  const quote = text[index] as string;
  if (quote !== '"' && quote !== "'") return null;
  const n = text.length;
  let j = index + 1;
  while (j < n) {
    const c = text[j] as string;
    if (c === "\\") {
      j += 2;
      continue;
    }
    if (c === quote) {
      return { value: text.slice(index + 1, j), end: j + 1 };
    }
    j += 1;
  }
  return null;
}

function isWordAt(text: string, index: number, word: string): boolean {
  if (!text.startsWith(word, index)) return false;
  const after = index + word.length;
  if (after < text.length && isIdChar(text[after] as string)) return false;
  return true;
}

export interface ComponentImportScan {
  readonly specifiers: string[];
  readonly hasDynamic: boolean;
}

/**
 * Statement-bounded `from "..."` scan. Only import/export clause tokens are consumed:
 * `{`, `}`, `,`, `*` and identifiers may precede `from`; strings outside
 * `{...}` (e.g. export-body assignment strings) terminate the clause instead
 * of being misread, and there is no length cap that could drop very long
 * valid named imports.
 */
function scanStaticFromClause(text: string, start: number, out: string[]): number | null {
  const n = text.length;
  let p = start;
  let braceDepth = 0;
  while (p < n) {
    p = skipTrivia(text, p);
    if (p >= n) break;
    const c = text[p] as string;
    if (c === "{") {
      braceDepth += 1;
      p += 1;
      continue;
    }
    if (c === "}") {
      if (braceDepth > 0) braceDepth -= 1;
      p += 1;
      continue;
    }
    if (c === "," || c === "*") {
      p += 1;
      continue;
    }
    if (c === '"' || c === "'") {
      if (braceDepth === 0) return null;
      const r = tryReadQuotedString(text, p);
      if (r === null) return null;
      p = r.end;
      continue;
    }
    if (c === "`" || c === "(" || c === ")" || c === ";" || c === "=") return null;
    if (isIdStart(c)) {
      let j = p + 1;
      while (j < n && isIdChar(text[j] as string)) j += 1;
      const word = text.slice(p, j);
      if (word === "from") {
        const q = skipTrivia(text, j);
        if (q < n && (text[q] === '"' || text[q] === "'")) {
          const r = tryReadQuotedString(text, q);
          if (r === null) return null;
          out.push(r.value);
          return r.end;
        }
        p = j;
        continue;
      }
      p = j;
      continue;
    }
    return null;
  }
  return null;
}

function parseImport(
  text: string,
  afterKeyword: number,
  out: string[],
  state: { hasDynamic: boolean },
): number {
  const n = text.length;
  let k = skipTrivia(text, afterKeyword);
  if (k >= n) return k;
  const c = text[k] as string;
  if (c === ".") return k + 1; // import.meta
  if (c === '"' || c === "'") {
    const r = tryReadQuotedString(text, k);
    if (r !== null) {
      out.push(r.value);
      return r.end;
    }
    return k + 1;
  }
  if (c === "`") {
    state.hasDynamic = true;
    return k + 1;
  }
  if (c === "(") {
    const inner = skipTrivia(text, k + 1);
    if (inner < n && (text[inner] === '"' || text[inner] === "'")) {
      const r = tryReadQuotedString(text, inner);
      if (r !== null) {
        const after = skipTrivia(text, r.end);
        if (after < n && text[after] !== ")" && text[after] !== ",") {
          state.hasDynamic = true;
          return r.end;
        }
        out.push(r.value);
        return r.end;
      }
    }
    state.hasDynamic = true;
    return k + 1;
  }
  if (isWordAt(text, k, "type")) {
    const afterType = skipTrivia(text, k + 4);
    if (afterType < n) {
      const nc = text[afterType] as string;
      if (nc === '"' || nc === "'") {
        const r = tryReadQuotedString(text, afterType);
        if (r !== null) {
          out.push(r.value);
          return r.end;
        }
        return afterType + 1;
      }
      if (nc === "(") {
        const inner = skipTrivia(text, afterType + 1);
        if (inner < n && (text[inner] === '"' || text[inner] === "'")) {
          const r = tryReadQuotedString(text, inner);
          if (r !== null) {
            out.push(r.value);
            return r.end;
          }
        }
        state.hasDynamic = true;
        return afterType + 1;
      }
      if (nc === "`") {
        state.hasDynamic = true;
        return afterType + 1;
      }
      k = afterType;
    }
  }
  const end = scanStaticFromClause(text, k, out);
  return end ?? k;
}

function parseExport(
  text: string,
  afterKeyword: number,
  out: string[],
  _state: { hasDynamic: boolean },
): number {
  const n = text.length;
  const k = skipTrivia(text, afterKeyword);
  if (k >= n) return k;
  // Only `export * ...` / `export { ... } ...` (and `export type` variants)
  // can carry `from`; any other export body (const/function/default/...) is
  // left for the main loop so embedded require()/import() stays visible.
  if (isWordAt(text, k, "type")) {
    const afterType = skipTrivia(text, k + 4);
    if (afterType >= n) return afterType;
    const nc = text[afterType] as string;
    if (nc !== "*" && nc !== "{") return k;
    const end = scanStaticFromClause(text, afterType, out);
    return end ?? k;
  }
  const c = text[k] as string;
  if (c !== "*" && c !== "{") return k;
  const end = scanStaticFromClause(text, k, out);
  return end ?? k;
}

function parseRequire(
  text: string,
  afterKeyword: number,
  out: string[],
  state: { hasDynamic: boolean },
): number {
  const n = text.length;
  const k = skipTrivia(text, afterKeyword);
  if (k >= n) return k;
  if (text[k] === ".") {
    let j = skipTrivia(text, k + 1);
    if (isWordAt(text, j, "resolve")) {
      const afterResolve = skipTrivia(text, j + "resolve".length);
      if (afterResolve < n && text[afterResolve] === "(") {
        const inner = skipTrivia(text, afterResolve + 1);
        if (inner < n && (text[inner] === '"' || text[inner] === "'")) {
          const r = tryReadQuotedString(text, inner);
          if (r !== null) {
            const after = skipTrivia(text, r.end);
            if (after < n && text[after] !== ")") state.hasDynamic = true;
            else out.push(r.value);
            return r.end;
          }
        }
        state.hasDynamic = true;
        return afterResolve + 1;
      }
    }
    return k + 1;
  }
  if (text[k] !== "(") return k;
  const inner = skipTrivia(text, k + 1);
  if (inner < n && (text[inner] === '"' || text[inner] === "'")) {
    const r = tryReadQuotedString(text, inner);
    if (r !== null) {
      const after = skipTrivia(text, r.end);
      if (after < n && text[after] !== ")") state.hasDynamic = true;
      else out.push(r.value);
      return r.end;
    }
  }
  state.hasDynamic = true;
  return k + 1;
}

export function scanComponentImports(source: string): ComponentImportScan {
  const out: string[] = [];
  const state = { hasDynamic: false };
  const n = source.length;
  let i = 0;
  type Frame = { mode: "code"; braces: number } | { mode: "template" };
  const stack: Frame[] = [{ mode: "code", braces: 0 }];

  while (i < n) {
    const top = stack[stack.length - 1] as Frame;
    if (top.mode === "template") {
      const c = source[i] as string;
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c === "`") {
        stack.pop();
        i += 1;
        continue;
      }
      if (c === "$" && source[i + 1] === "{") {
        stack.push({ mode: "code", braces: 0 });
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }

    const c = source[i] as string;
    if (c === "/" && source[i + 1] === "/") {
      let j = i + 2;
      while (j < n && source[j] !== "\n") j += 1;
      i = j;
      continue;
    }
    if (c === "/" && source[i + 1] === "*") {
      let j = i + 2;
      while (j < n && !(source[j] === "*" && source[j + 1] === "/")) j += 1;
      i = j < n ? j + 2 : n;
      continue;
    }
    if (c === '"' || c === "'") {
      const r = tryReadQuotedString(source, i);
      if (r === null) break;
      i = r.end;
      continue;
    }
    if (c === "`") {
      stack.push({ mode: "template" });
      i += 1;
      continue;
    }
    if (stack.length > 1) {
      if (c === "{") {
        (top as { braces: number }).braces += 1;
        i += 1;
        continue;
      }
      if (c === "}") {
        const frame = top as { braces: number };
        if (frame.braces === 0) {
          stack.pop();
          i += 1;
          continue;
        }
        frame.braces -= 1;
        i += 1;
        continue;
      }
    }
    if (isIdStart(c)) {
      let j = i + 1;
      while (j < n && isIdChar(source[j] as string)) j += 1;
      const word = source.slice(i, j);
      if (word === "import" || word === "export" || word === "require") {
        const prev = i > 0 ? (source[i - 1] as string) : "";
        if (prev !== "" && (isIdChar(prev) || prev === "." || prev === "@" || prev === "#")) {
          i = j;
          continue;
        }
        if (word === "import") i = parseImport(source, j, out, state);
        else if (word === "export") i = parseExport(source, j, out, state);
        else i = parseRequire(source, j, out, state);
        if (i <= j) i = j;
        continue;
      }
      i = j;
      continue;
    }
    i += 1;
  }
  return { specifiers: out, hasDynamic: state.hasDynamic };
}
