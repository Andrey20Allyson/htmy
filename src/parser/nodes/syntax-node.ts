import { p, ParsePattern } from "../parse-pattern";

export abstract class SyntaxNode {
  length!: number;

  as<T extends SyntaxNode>(type: SyntaxNodeConstructor<T>): T {
    if (this instanceof type) {
      return this;
    }

    throw new TypeError(
      `Expected a ${type.name}, recived a ${this.constructor.name}`
    );
  }

  static asPattern(): ParsePattern {
    return p.node(this as any as SyntaxNodeConstructor);
  }
}

export type SyntaxNodeConstructor<T extends SyntaxNode = SyntaxNode> = new (
  ...args: any[]
) => T;
