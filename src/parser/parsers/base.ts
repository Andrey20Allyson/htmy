import { SyntaxNode, SyntaxNodeConstructor } from "../nodes/syntax-node";
import { ParseContext } from "../parse-context";
import { ParsePattern, NoMatch, MatchOut } from "../parse-pattern";

export type ParserConstructor<N extends SyntaxNode = SyntaxNode> =
  new () => Parser<N>;

export abstract class Parser<N extends SyntaxNode = SyntaxNode> {
  abstract type: SyntaxNodeConstructor;

  abstract parse(context: ParseContext): N | null;
}

export abstract class PatternBasedParser<
  N extends SyntaxNode = SyntaxNode
> extends Parser<N> {
  abstract pattern: ParsePattern;

  parse(context: ParseContext): N | null {
    if (this.pattern == null) {
      return null;
    }

    const match = this.pattern.match(context);
    if (match instanceof NoMatch) {
      return null;
    }

    let node: N | null = new this.type() as N;
    node.length = match.length;

    node = this.mount(node, match.out);

    return node as N;
  }

  mount(node: N, data: MatchOut): N | null {
    for (const [key, value] of data.entries()) {
      node[key as keyof N] = value;
    }

    return node;
  }
}
