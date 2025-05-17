import { JSBinaryOperationNode } from "../nodes/js-binary-operation";
import { JSOperationNode } from "../nodes/js-operation";
import { SyntaxNode } from "../nodes/syntax-node";
import { ParseContext } from "../parse-context";
import { p } from "../parse-pattern";
import { Parser } from "./base";

export class JSOperationParser extends Parser {
  override type = JSOperationNode;

  override parse(context: ParseContext): SyntaxNode | null {
    const oprMatch = p.or(JSBinaryOperationNode).as("opr").match(context);
    return oprMatch.get<SyntaxNode>("opr");
  }
}
