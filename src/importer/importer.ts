import type { SyntaxNode } from "../parser/nodes/syntax-node";
import nodePath from "node:path";
import fs from "node:fs/promises";
import tokenize from "../lexer/tokenize";
import parse from "../parser/parse";

export type ImporterCache = Map<string, SyntaxNode>;

export class Importer {
  private static _cacheInstance?: ImporterCache;

  async import(path: string): Promise<SyntaxNode> {
    if (this.getCache().has(path)) {
      return this.getCache().get(path)!;
    }

    const source = await fs.readFile(path + ".htmy", { encoding: "utf-8" });

    const tokens = tokenize(source);

    const node = parse(tokens);

    if (node == null) {
      throw new Error(`Empty SyntaxTree`);
    }

    this.getCache().set(path, node);

    return node;
  }

  resolveAndImport(path: string): Promise<SyntaxNode> {
    path = this.resolvePath(path);

    return this.import(path);
  }

  resolvePath(path: string): string {
    return nodePath.resolve(process.cwd(), path);
  }

  async preload(dir: string): Promise<Set<string>> {
    const importer = this.relativeTo(dir);
    dir = importer.resolvePath(".");

    const paths = await fs.readdir(dir);

    return paths
      .map((path) => importer.removeExt(path))
      .map((path) => importer.resolvePath(path))
      .reduce((set, path) => (set.add(path), set), new Set<string>());
  }

  protected removeExt(path: string) {
    const ext = ".htmy";

    if (path.endsWith(ext)) {
      return path.slice(0, -ext.length);
    }

    return path;
  }

  private getCache(): ImporterCache {
    if (Importer._cacheInstance == null) {
      Importer._cacheInstance = new Map();
    }

    return Importer._cacheInstance;
  }

  relativeTo(base: string): RelativeImporter {
    return new RelativeImporter(base);
  }
}

export class RelativeImporter extends Importer {
  constructor(readonly base: string) {
    super();
  }

  override resolvePath(path: string): string {
    return nodePath.resolve(process.cwd(), this.base, path);
  }

  override relativeTo(base: string): RelativeImporter {
    base = nodePath.join(this.base, base);

    return new RelativeImporter(base);
  }
}
