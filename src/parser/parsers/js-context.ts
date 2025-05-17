import { TokenType } from "../../lexer/token";
import { JSContextNode } from "../nodes/js-context";
import { JSExpressionNode } from "../nodes/js-expression";
import { p, ParsePattern } from "../parse-pattern";
import { PatternBasedParser } from "./base";

export class JSContextParser extends PatternBasedParser {
  override type = JSContextNode;
  override pattern: ParsePattern = p.pattern(
    p.token(TokenType.HTMY_OPEN_JS_CONTEXT),
    p.node(JSExpressionNode).many().as("nodes"),
    p.token(TokenType.HTMY_CLOSE_JS_CONTEXT)
  );
}
