import { TokenType } from "../../lexer/token";
import { JSIdentifierNode } from "../nodes/js-identifier";
import { SyntaxNode, SyntaxNodeConstructor } from "../nodes/syntax-node";
import { ParseContext } from "../parse-context";
import { ParsePattern, getTokenText, p } from "../parse-pattern";
import { PatternBasedParser } from "./base";

export class JSIdentifierParser extends PatternBasedParser {
  override type: SyntaxNodeConstructor = JSIdentifierNode;
  override pattern: ParsePattern = p
    .token(TokenType.JS_IDENTIFIER)
    .transform(getTokenText)
    .as("name");

  override parse(context: ParseContext): SyntaxNode | null {
    const node = super.parse(context);

    return node;
  }
}
