import {
  HTMYPropertiesNode,
  HTMYPropertyNode,
  HTMYStringLiteralNode,
} from "../parser/nodes/htmy-properties";
import { JSBinaryOperationNode } from "../parser/nodes/js-binary-operation";
import { JSBinaryOperationType } from "../parser/nodes/js-binary-operation.type";
import { JSContextNode } from "../parser/nodes/js-context";
import { JSIdentifierNode } from "../parser/nodes/js-identifier";
import { JSLiteralNullNode } from "../parser/nodes/js-literal-null";
import { SyntaxNode } from "../parser/nodes/syntax-node";

export type JSScope = Record<string, any>;

export class JSEvaluator {
  constructor(
    readonly scope: JSScope,
    readonly parent: JSEvaluator | null = null
  ) {}

  evaluate(node: SyntaxNode): any {
    if (node instanceof JSContextNode) {
      let value;

      for (const subnode of node.nodes) {
        value = this.evaluate(subnode);
      }

      return value;
    }

    if (node instanceof JSIdentifierNode) {
      return this.getIntoScope(node.name);
    }

    if (node instanceof JSBinaryOperationNode) {
      return this.evaluateBinaryOpr(node);
    }

    if (node instanceof JSLiteralNullNode) {
      return null;
    }

    if (node instanceof HTMYPropertiesNode) {
      let properties: Record<string, any> = {};

      for (const propertyNode of node.nodes) {
        const { key, value } = this.evaluate(propertyNode);

        properties[key] = value;
      }

      return properties;
    }

    if (node instanceof HTMYPropertyNode) {
      return { key: node.name, value: this.evaluate(node.valueNode) };
    }

    if (node instanceof HTMYStringLiteralNode) {
      return node.value;
    }

    throw new Error(`Can't evaluate node ${node.constructor.name}`);
  }

  getIntoScope(key: string): any {
    if (key in this.scope) {
      return this.scope[key];
    }

    if (this.parent != null) {
      return this.parent.getIntoScope(key);
    }

    throw new Error(`'${key}' is not defined`);
  }

  private evaluateBinaryOpr(node: JSBinaryOperationNode): any {
    switch (node.opr) {
      case JSBinaryOperationType.ADD:
        return this.evaluate(node.left) + this.evaluate(node.right);
      case JSBinaryOperationType.ASSIGN: {
        const ident = node.left.as(JSIdentifierNode);
        const exprResult = this.evaluate(node.right);

        this.scope[ident.name] = exprResult;

        return exprResult;
      }
      case JSBinaryOperationType.DOT: {
        const record = this.evaluate(node.left);
        const ident = node.right.as(JSIdentifierNode);

        return record[ident.name];
      }
      case JSBinaryOperationType.EQUALS:
        return this.evaluate(node.left) + this.evaluate(node.right);
      case JSBinaryOperationType.MULT:
        return this.evaluate(node.left) * this.evaluate(node.right);
      case JSBinaryOperationType.NOT_EQUALS:
        return this.evaluate(node.left) != this.evaluate(node.right);
      case JSBinaryOperationType.SUB:
        return this.evaluate(node.left) - this.evaluate(node.right);
    }
  }

  scopped(): JSEvaluator {
    return new JSEvaluator({}, this);
  }
}
