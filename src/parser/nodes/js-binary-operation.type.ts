export class JSBinaryOperationType {
  static readonly ADD = this.for("add");
  static readonly DOT = this.for("dot");
  static readonly SUB = this.for("sub");
  static readonly MULT = this.for("mult");
  static readonly EQUALS = this.for("equals");
  static readonly NOT_EQUALS = this.for("not_equals");
  static readonly ASSIGN = this.for("assign");

  private constructor(readonly value: string) {}

  static for(value: string): JSBinaryOperationType {
    return new JSBinaryOperationType(value);
  }
}
