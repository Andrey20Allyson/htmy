import { TokenType } from "../../lexer/token";
import { JSLiteralNumberNode } from "../nodes/js-literal-number";
import { SyntaxNodeConstructor } from "../nodes/syntax-node";
import { p, ParsePattern } from "../parse-pattern";
import { PatternBasedParser } from "./base";

export class JSLiteralNumberParser extends PatternBasedParser {
  override pattern: ParsePattern = p.token(TokenType.JS_LITERAL_NUMBER);
  override type: SyntaxNodeConstructor = JSLiteralNumberNode;
}
