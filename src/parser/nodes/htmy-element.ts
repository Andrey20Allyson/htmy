import { HTMYChildrenNode } from "./htmy-children";
import { HTMYElementIdentifierNode } from "./htmy-element-identifier";
import { HTMYPropertiesNode } from "./htmy-properties";
import { SyntaxNode } from "./syntax-node";

export class HTMYElementNode extends SyntaxNode {
  identifier!: HTMYElementIdentifierNode;
  children?: HTMYChildrenNode;
  properties!: HTMYPropertiesNode;
}
