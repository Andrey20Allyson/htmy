import { JSExpressionNode } from "../nodes/js-expression";
import { JSIdentifierNode } from "../nodes/js-identifier";
import { JSLiteralNullNode } from "../nodes/js-literal-null";
import { JSOperationNode } from "../nodes/js-operation";
import { SyntaxNode } from "../nodes/syntax-node";
import { ParseContext } from "../parse-context";
import { p } from "../parse-pattern";
import { Parser } from "./base";

export class JSExpressionParser extends Parser {
  override type = JSExpressionNode;

  override parse(context: ParseContext): SyntaxNode | null {
    const exprMatch = p
      .or(
        // expr
        p.node(JSIdentifierNode),
        p.node(JSLiteralNullNode)
      )
      .as("expr")
      .match(context);
    const exprNode = exprMatch.get<SyntaxNode>("expr");

    if (exprNode == null) {
      return null;
    }

    const oprParser = context.getParserOf(JSOperationNode);
    const oprNode = oprParser.parse(
      context.slice(exprNode.length).precededBy(exprNode)
    );

    if (oprNode == null) {
      return exprNode;
    }

    return oprNode;
  }
}
