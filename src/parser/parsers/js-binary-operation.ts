import { Token, TokenType } from "../../lexer/token";
import { JSBinaryOperationNode } from "../nodes/js-binary-operation";
import { JSBinaryOperationType } from "../nodes/js-binary-operation.type";
import { JSExpressionNode } from "../nodes/js-expression";
import { SyntaxNode, SyntaxNodeConstructor } from "../nodes/syntax-node";
import { ParseContext } from "../parse-context";
import { Match, p } from "../parse-pattern";
import { Parser } from "./base";

export class JSBinaryOperationPriority {
  constructor(
    readonly type: JSBinaryOperationType,
    private readonly priority: number
  ) {}

  higherThan(other: JSBinaryOperationPriority) {
    return this.priority > other.priority;
  }
}

export class JSBinaryOperationParser extends Parser {
  private priorities: Map<JSBinaryOperationType, JSBinaryOperationPriority>;

  constructor(
    priorities: [JSBinaryOperationType, number][] = [
      [JSBinaryOperationType.DOT, 0x00_01_00_00],
      [JSBinaryOperationType.ADD, 0x00_00_01_00],
      [JSBinaryOperationType.EQUALS, 0x00_00_00_01],
      [JSBinaryOperationType.NOT_EQUALS, 0x00_00_00_01],
    ]
  ) {
    super();

    this.priorities = new Map();

    for (const [type, priorityValue] of priorities) {
      const priority = new JSBinaryOperationPriority(type, priorityValue);

      this.priorities.set(type, priority);
    }
  }

  override type: SyntaxNodeConstructor = JSBinaryOperationNode;
  override parse(context: ParseContext): SyntaxNode | null {
    const oprMatch = this.executeMatch(context);

    if (!oprMatch.matches()) {
      return null;
    }

    const node = new JSBinaryOperationNode();

    const operator = oprMatch.get<Token>("opr")!;
    node.opr = this.parseOperator(operator);

    node.left = context.getPreviousNode();
    node.right = oprMatch.get<SyntaxNode>("right expr")!;
    this.recalcNodeLength(node);

    return this.balance(node);
  }

  private executeMatch(context: ParseContext): Match<any> {
    const pattern = p.pattern(
      // opr token
      p
        .or(
          // opr tokens
          p.token(TokenType.DOT),
          p.token(TokenType.PLUS),
          p.token(TokenType.JS_EQUALS),
          p.token(TokenType.JS_NOT_EQUALS)
        )
        .as("opr"),

      // right expr
      p.node(JSExpressionNode).as("right expr").required()
    );

    return pattern.match(context);
  }

  private parseOperator(operator: Token): JSBinaryOperationType {
    switch (operator.type) {
      case TokenType.DOT:
        return JSBinaryOperationType.DOT;
      case TokenType.PLUS:
        return JSBinaryOperationType.ADD;
      case TokenType.JS_EQUALS:
        return JSBinaryOperationType.EQUALS;
      case TokenType.JS_NOT_EQUALS:
        return JSBinaryOperationType.NOT_EQUALS;
      default:
        throw new Error(`Can't parse operator token ${operator}`);
    }
  }

  private balance(
    parent: JSBinaryOperationNode,
    right?: SyntaxNode
  ): JSBinaryOperationNode {
    if (right == null) {
      return this.balance(parent, parent.right);
    }

    if (!(right instanceof JSBinaryOperationNode)) {
      return parent;
    }

    const parentPriority = this.findPriority(parent.opr);
    const rightPriority = this.findPriority(right.opr);

    if (parentPriority.higherThan(rightPriority)) {
      const newRight = right.left;

      right.left = parent;
      parent.right = newRight;

      this.recalcNodeLength(parent);

      right.left = this.balance(parent);

      this.recalcNodeLength(right);

      return right;
    }

    return parent;
  }

  private findPriority(type: JSBinaryOperationType): JSBinaryOperationPriority {
    const priority = this.priorities.get(type);

    if (priority == null) {
      throw new Error(`Can't find priority for operator type '${type.value}'`);
    }

    return priority;
  }

  private recalcNodeLength(node: JSBinaryOperationNode): void {
    const length = node.left.length + 1 + node.right.length;

    node.length = length;
  }
}
