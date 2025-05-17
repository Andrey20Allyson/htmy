import { TokenType } from "../../lexer/token";
import { HTMYTextNode } from "../nodes/htmy-text";
import { SyntaxNodeConstructor } from "../nodes/syntax-node";
import { ParsePattern, getTokenText, p } from "../parse-pattern";
import { PatternBasedParser } from "./base";

export class HTMYTextParser extends PatternBasedParser {
  override type: SyntaxNodeConstructor = HTMYTextNode;
  override pattern: ParsePattern = p
    .token(TokenType.HTML_TEXT)
    .transform(getTokenText)
    .as("text");
}
