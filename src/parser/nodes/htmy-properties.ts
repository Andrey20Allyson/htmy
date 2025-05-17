import { SyntaxNode } from "./syntax-node";

export class HTMYStringLiteralNode extends SyntaxNode {
  value!: string;
}

export class HTMYPropertyNode extends SyntaxNode {
  name!: string;
  valueNode!: SyntaxNode;
}

export class HTMYPropertiesNode extends SyntaxNode {
  nodes: HTMYPropertyNode[] = [];
}
