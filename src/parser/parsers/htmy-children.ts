import { HTMYChildrenNode } from "../nodes/htmy-children";
import { HTMYElementNode } from "../nodes/htmy-element";
import { HTMYIfStatementNode } from "../nodes/htmy-statement";
import { HTMYTextNode } from "../nodes/htmy-text";
import { JSContextNode } from "../nodes/js-context";
import { SyntaxNode, SyntaxNodeConstructor } from "../nodes/syntax-node";
import { ParseContext } from "../parse-context";
import { p, ParsePattern } from "../parse-pattern";
import { PatternBasedParser } from "./base";

export class HTMYChildrenParser extends PatternBasedParser {
  override type: SyntaxNodeConstructor = HTMYChildrenNode;

  override pattern: ParsePattern = p
    .or(
      // accepted children nodes
      HTMYElementNode,
      HTMYTextNode,
      JSContextNode,
      HTMYIfStatementNode
    )
    .many()
    .as("nodes");

  override parse(context: ParseContext): SyntaxNode | null {
    const node = super.parse(context);

    return node;
  }
}
