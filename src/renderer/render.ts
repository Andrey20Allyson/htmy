import { JSEvaluator, JSScope } from "../evaluator/evaluate-js";
import { Importer } from "../importer/importer";
import { HTMYEvaluator } from "../evaluator/evaluate-htmy";

export class Renderer {
  readonly importer: Importer;

  constructor() {
    this.importer = new Importer().relativeTo("views");
  }

  async render(name: string, data: JSScope): Promise<string> {
    const componentNames = await this.importer.preload("components");

    const tree = await this.importer.resolveAndImport(name);

    const js = new JSEvaluator(data);
    const htmy = new HTMYEvaluator(js, componentNames, this.importer);

    return htmy.evaluate(tree);
  }
}
