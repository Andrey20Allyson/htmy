import { JSBinaryOperationType } from "./js-binary-operation.type";
import { SyntaxNode } from "./syntax-node";

export class JSBinaryOperationNode extends SyntaxNode {
  opr!: JSBinaryOperationType;
  left!: SyntaxNode;
  right!: SyntaxNode;
}
