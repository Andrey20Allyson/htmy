import { Importer } from "../importer/importer";
import { HTMYChildrenNode } from "../parser/nodes/htmy-children";
import { HTMYElementNode } from "../parser/nodes/htmy-element";
import {
  HTMYPropertiesNode,
  HTMYPropertyNode,
  HTMYStringLiteralNode,
} from "../parser/nodes/htmy-properties";
import { HTMYIfStatementNode } from "../parser/nodes/htmy-statement";
import { HTMYTextNode } from "../parser/nodes/htmy-text";
import { JSContextNode } from "../parser/nodes/js-context";
import { SyntaxNode } from "../parser/nodes/syntax-node";
import { JSEvaluator } from "./evaluate-js";

export type HTMYComponentScope = Set<string>;

export class HTMYEvaluator {
  readonly scope: HTMYComponentScope;
  constructor(
    readonly js: JSEvaluator,
    readonly preloadedScope: HTMYComponentScope,
    readonly importer: Importer
  ) {
    this.scope = new Set();
  }

  async evaluate(node: SyntaxNode): Promise<string> {
    if (node instanceof HTMYElementNode) {
      const name = node.identifier.name;

      const component = await this.getComponent(name);
      if (component != null) {
        const evaluator = this.newScopeWithProperties(node.properties);

        return evaluator.evaluate(component);
      }

      const content =
        node.children != null ? await this.evaluate(node.children) : null;

      const elementBody = content != null ? `>${content}</${name}>` : "/>";

      const propertiesBody =
        node.properties.length > 0
          ? ` ${await this.evaluate(node.properties)}`
          : "";

      return `<${name}${propertiesBody}${elementBody}`;
    }

    if (node instanceof HTMYChildrenNode) {
      const evaluations = await Promise.all(
        node.nodes.map((node) => this.evaluate(node))
      );

      return evaluations.join("");
    }

    if (node instanceof HTMYTextNode) {
      return node.text;
    }

    if (node instanceof JSContextNode) {
      const evaluated = await this.js.evaluate(node);

      return String(evaluated);
    }

    if (node instanceof HTMYIfStatementNode) {
      const blockEvaluator = this.js.scopped();

      const canRender = blockEvaluator.evaluate(node.logicExpression);

      if (!canRender) {
        return "";
      }

      return this.evaluate(node.children);
    }

    if (node instanceof HTMYPropertiesNode) {
      const evaluations = await Promise.all(
        node.nodes.map((node) => this.evaluate(node))
      );

      return evaluations.filter((str) => str.length > 0).join(" ");
    }

    if (node instanceof HTMYPropertyNode) {
      const name = node.name;

      if (node.valueNode instanceof JSContextNode) {
        const value = this.js.evaluate(node.valueNode);

        switch (typeof value) {
          case "string":
            return `${name}="${value}"`;
          case "boolean":
            return value ? `${name}` : "";
          case "number":
            return `${name}=${value}`;
        }

        return `${name}="Invalid Value Error"`;
      }

      const value = await this.evaluate(node.valueNode);

      return `${name}=${value}`;
    }

    if (node instanceof HTMYStringLiteralNode) {
      return `"${node.value}"`;
    }

    throw new Error(`Can't evaluate node ${node.constructor.name}`);
  }

  newScopeWithProperties(node: HTMYPropertiesNode): HTMYEvaluator {
    const scope = this.js.evaluate(node);

    const js = new JSEvaluator(scope);

    return new HTMYEvaluator(js, this.preloadedScope, this.importer);
  }

  protected async getComponent(name: string): Promise<SyntaxNode | null> {
    const path = this.importer.relativeTo("components").resolvePath(name);

    if (this.preloadedScope.has(path)) {
      return this.importer.import(path);
    }

    return null;
  }
}
