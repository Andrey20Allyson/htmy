import { HTMYChildrenNode } from "./htmy-children";
import { JSContextNode } from "./js-context";
import { SyntaxNode } from "./syntax-node";

export class HTMYIfStatementNode extends SyntaxNode {
  logicExpression!: JSContextNode;
  children!: HTMYChildrenNode;
}
