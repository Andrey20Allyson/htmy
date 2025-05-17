import { TokenType } from "../../lexer/token";
import { JSLiteralNullNode } from "../nodes/js-literal-null";
import { SyntaxNodeConstructor } from "../nodes/syntax-node";
import { p, ParsePattern } from "../parse-pattern";
import { PatternBasedParser } from "./base";

export class JSLiteralNullParser extends PatternBasedParser {
  override pattern: ParsePattern = p.token(TokenType.JS_LITERAL_NULL);
  override type: SyntaxNodeConstructor = JSLiteralNullNode;
}
