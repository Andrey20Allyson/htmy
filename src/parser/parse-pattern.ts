import { Token } from "../lexer/token";
import { ParseContext } from "./parse-context";
import { SyntaxNode, SyntaxNodeConstructor } from "./nodes/syntax-node";
import { ident } from "../util/string";

export class ParsePatternMaker {
  static instance = new ParsePatternMaker();

  pattern(...patterns: Patternable[]): ParsePattern {
    return new ListParsePattern(patterns);
  }

  node(type: SyntaxNodeConstructor): ParsePattern {
    return new NodeParsePattern(type);
  }

  nodeInstanceOf(type: SyntaxNodeConstructor): ParsePattern {
    throw new Error("Method not implemented.");
    // return new NodeParsePattern(type);
  }

  nodeThatExtends(type: SyntaxNodeConstructor) {
    throw new Error("Method not implemented.");
  }

  token(tokenType: string, tokenText?: string): TokenParsePattern {
    return new TokenParsePattern(tokenType, tokenText);
  }

  opt(pattern: ParsePattern): ParsePattern {
    return new OptParsePattern(pattern);
  }

  named(pattern: ParsePattern, name: string): ParsePattern {
    return new NamedParsePattern(pattern, name);
  }

  required(pattern: ParsePattern): ParsePattern {
    return new RequiredParsePattern(pattern);
  }

  or(...patterns: Patternable[]): ParsePattern {
    return new OrParsePattern(patterns);
  }

  many(pattern: ParsePattern) {
    return new ManyParsePattern(pattern);
  }

  transform(pattern: ParsePattern, fn: TransformFn): ParsePattern {
    return new TransformParsePattern(pattern, fn);
  }

  assert(pattern: ParsePattern, fn: AssertFn): ParsePattern {
    return new AssertParsePattern(pattern, fn);
  }
}

export const p = new ParsePatternMaker();

export interface Patternable {
  asPattern(): ParsePattern;
}

export abstract class ParsePattern implements Patternable {
  asPattern(): ParsePattern {
    return this;
  }

  as(name: string): ParsePattern {
    return p.named(this, name);
  }

  opt(): ParsePattern {
    return p.opt(this);
  }

  required(): ParsePattern {
    return p.required(this);
  }

  or(...patterns: ParsePattern[]): ParsePattern {
    return p.or(...[this, ...patterns]);
  }

  many() {
    return p.many(this);
  }

  transform(fn: TransformFn): ParsePattern {
    return p.transform(this, fn);
  }

  assert(fn: AssertFn): ParsePattern {
    return p.assert(this, fn);
  }

  abstract match(context: ParseContext, out?: MatchOut): Match<any>;

  abstract toString(): string;
}

export class MatchOut {
  private readonly inner: Map<string, any> = new Map();

  get<T = any>(name: string): T | null {
    return this.inner.get(name) ?? null;
  }

  add(name: string, value: any) {
    this.inner.set(name, value);
  }

  recive(other: MatchOut) {
    for (const [key, value] of other.inner.entries()) {
      this.inner.set(key, value);
    }
  }

  *entries(): Iterable<[string, any]> {
    for (const [key, value] of this.inner.entries()) {
      yield [key, value];
    }
  }
}

export class Match<T> {
  constructor(
    readonly value: T,
    readonly length: number,
    readonly out: MatchOut = new MatchOut()
  ) {}

  get<T = any>(name: string) {
    return this.out.get<T>(name);
  }

  matches(): boolean {
    return true;
  }
}

export class NoMatch extends Match<null> {
  constructor() {
    super(null, 0);
  }

  override toString(): string {
    return "NoMatch";
  }

  override matches(): boolean {
    return false;
  }
}

export class ListParsePattern extends ParsePattern {
  constructor(readonly patterns: Patternable[]) {
    super();
  }

  override match(
    context: ParseContext,
    out = new MatchOut()
  ): Match<Match<any>[] | null> {
    const matches: Match<any>[] = [];
    let length = 0;

    for (const pattern of this.patterns) {
      const submatch = pattern.asPattern().match(context.slice(length), out);

      if (submatch instanceof NoMatch) {
        return new NoMatch();
      }

      length += submatch.length;
      matches.push(submatch.value);
    }

    return new Match(matches, length, out);
  }

  override toString(): string {
    return `Patterns[\n${ident(this.patterns.join(",\n"))}\n]`;
  }
}

export class OptParsePattern extends ParsePattern {
  constructor(readonly pattern: ParsePattern) {
    super();
  }

  override match(context: ParseContext, out = new MatchOut()): Match<any> {
    const match = this.pattern.match(context, out);
    if (match instanceof NoMatch) {
      return new Match(null, 0, out);
    }

    return match;
  }

  override toString(): string {
    return `Opt(${this.pattern})`;
  }
}

export class NodeParsePattern extends ParsePattern {
  constructor(readonly type: SyntaxNodeConstructor) {
    super();
  }

  override match(
    context: ParseContext,
    out = new MatchOut()
  ): Match<SyntaxNode | null> {
    const node = context.getParserOf(this.type).parse(context);

    if (node == null) {
      return new NoMatch();
    }

    return new Match(node, node.length, out);
  }

  override toString(): string {
    return `Node(${this.type.name})`;
  }
}

export class TokenParsePattern extends ParsePattern {
  constructor(readonly tokenType: string, readonly tokenText?: string) {
    super();
  }

  override match(
    context: ParseContext,
    out = new MatchOut()
  ): Match<Token | null> {
    const token = context.tokenAt(0);

    if (token == null) {
      return new NoMatch();
    }

    if (token.type !== this.tokenType) {
      return new NoMatch();
    }

    return new Match(token, 1, out);
  }

  override toString(): string {
    return `Token(type = ${this.tokenType}, text = ${this.tokenText ?? "*"})`;
  }
}

export class NamedParsePattern extends ParsePattern {
  constructor(readonly pattern: ParsePattern, readonly name: string) {
    super();
  }

  override match(context: ParseContext, out = new MatchOut()): Match<any> {
    const match = this.pattern.match(context, out);

    if (match instanceof NoMatch) {
      return new NoMatch();
    }

    out.add(this.name, match.value);

    return new Match(match.value, match.length, out);
  }

  override toString(): string {
    return `Named(${this.pattern}, '${this.name}')`;
  }
}

export class RequiredParsePattern extends ParsePattern {
  constructor(readonly pattern: ParsePattern) {
    super();
  }

  override match(context: ParseContext, out = new MatchOut()): Match<any> {
    const match = this.pattern.match(context, out);
    if (match instanceof NoMatch) {
      throw new Error(`Required pattern ${this.pattern} hasnt matches`);
    }

    return match;
  }

  override toString(): string {
    return `Required(${this.pattern})`;
  }
}

export class OrParsePattern extends ParsePattern {
  constructor(readonly patterns: Patternable[]) {
    super();
  }

  override match(context: ParseContext, out = new MatchOut()): Match<any> {
    for (const pattern of this.patterns) {
      const match = pattern.asPattern().match(context, out);
      if (match instanceof NoMatch) {
        continue;
      }

      return match;
    }

    return new NoMatch();
  }

  override toString(): string {
    return `Or[\n${ident(this.patterns.join(",\n"))}\n]`;
  }
}

export class ManyParsePattern extends ParsePattern {
  constructor(readonly pattern: ParsePattern) {
    super();
  }

  override match(context: ParseContext, out = new MatchOut()): Match<any> {
    const values: any[] = [];
    let length = 0;

    while (true) {
      const submatch = this.pattern.match(context.slice(length), out);

      if (submatch.length === 0) {
        break;
      }

      if (submatch instanceof NoMatch) {
        break;
      }

      length += submatch.length;
      values.push(submatch.value);
    }

    return new Match(values, length, out);
  }

  override toString(): string {
    return `Many[\n${ident(this.pattern)}\n]`;
  }
}

export type TransformFn = (input: any) => any;

export class TransformParsePattern extends ParsePattern {
  constructor(readonly pattern: ParsePattern, readonly fn: TransformFn) {
    super();
  }

  override match(context: ParseContext): Match<any> {
    const match = this.pattern.match(context);

    if (match instanceof NoMatch) {
      return match;
    }

    return new Match(this.fn(match.value), match.length, match.out);
  }

  override toString(): string {
    return this.pattern.toString();
  }
}

export function getTokenText(token: Token): string {
  return token.text;
}

export type AssertFn = (match: Match<any>, out: MatchOut) => Error | null;

export class AssertParsePattern extends ParsePattern {
  constructor(readonly pattern: ParsePattern, readonly fn: AssertFn) {
    super();
  }

  override match(context: ParseContext, out = new MatchOut()): Match<any> {
    const match = this.pattern.match(context, out);

    const error = this.fn(match, out);
    if (error != null) {
      throw error;
    }

    return match;
  }

  override toString(): string {
    return this.pattern.toString();
  }
}
