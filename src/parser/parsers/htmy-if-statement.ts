import { TokenType } from "../../lexer/token";
import { HTMYChildrenNode } from "../nodes/htmy-children";
import { HTMYIfStatementNode } from "../nodes/htmy-statement";
import { JSContextNode } from "../nodes/js-context";
import { SyntaxNode, SyntaxNodeConstructor } from "../nodes/syntax-node";
import { ParseContext } from "../parse-context";
import { p, ParsePattern } from "../parse-pattern";
import { PatternBasedParser } from "./base";

export class HTMYIfStatementParser extends PatternBasedParser {
  override type: SyntaxNodeConstructor = HTMYIfStatementNode;

  override pattern: ParsePattern = p.pattern(
    p.token(TokenType.HTMY_KEYWORD, "@if"),
    p.node(JSContextNode).as("logicExpression"),
    p.node(HTMYChildrenNode).as("children"),
    p.token(TokenType.HTMY_KEYWORD, "@end").required()
  );

  override parse(context: ParseContext): SyntaxNode | null {
    const node = super.parse(context);

    return node;
  }
}
