import { Importer } from "../importer/importer";
import { SyntaxNode } from "../parser/nodes/syntax-node";
import { HTMYEvaluator } from "./evaluate-htmy";
import { JSEvaluator } from "./evaluate-js";

export async function evaluate(
  node: SyntaxNode,
  scope: Record<string, any>,
  importer: Importer
): Promise<string> {
  const js = new JSEvaluator(scope);

  const htmy = new HTMYEvaluator(js, new Set(), importer);

  return htmy.evaluate(node);
}
