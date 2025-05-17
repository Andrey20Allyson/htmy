import { Token, TokenArraySlice } from "../lexer/token";
import { NoMatch, ParsePattern } from "./parse-pattern";
import { SyntaxNode, SyntaxNodeConstructor } from "./nodes/syntax-node";
import { Parser, ParserConstructor } from "./parsers/base";

export class ParseContext {
  constructor(
    private readonly tokens: TokenArraySlice,
    private readonly prev: SyntaxNode | null = null,
    private readonly parsers: Parser[] = []
  ) {}

  slice(start: number, end?: number): ParseContext {
    return new ParseContext(
      this.tokens.slice(start, end),
      this.prev,
      this.parsers
    );
  }

  length(): number {
    return this.tokens.length;
  }

  tokenAt(index: number): Token | null {
    return this.tokens.at(index);
  }

  getParserOf(type: SyntaxNodeConstructor): Parser {
    for (const parser of this.parsers) {
      if (parser.type === type) {
        return parser;
      }
    }

    throw new Error(`Cannot find parser for ${type.name}`);
  }

  getPreviousNode(): SyntaxNode {
    if (this.prev == null) {
      throw new Error("Expected a stored previous node");
    }

    return this.prev;
  }

  precededBy(node: SyntaxNode | null) {
    return new ParseContext(this.tokens, node, this.parsers);
  }

  addParser(parser: Parser | ParserConstructor) {
    if (!(parser instanceof Parser)) {
      parser = new parser();
    }

    this.parsers.push(parser);
  }
}
