import { TokenType } from "../../lexer/token";
import { HTMYElementIdentifierNode } from "../nodes/htmy-element-identifier";
import { SyntaxNodeConstructor } from "../nodes/syntax-node";
import { ParsePattern, getTokenText, p } from "../parse-pattern";
import { PatternBasedParser } from "./base";

export class HTMYElementIdentifierParser extends PatternBasedParser {
  override type: SyntaxNodeConstructor = HTMYElementIdentifierNode;
  override pattern: ParsePattern = p
    .token(TokenType.HTML_IDENTIFIER)
    .transform(getTokenText)
    .as("name");
}
