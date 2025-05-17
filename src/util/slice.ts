import util from "node:util";

export interface Slicable<T> {
  at(index: number): T | undefined;
  slice(start: number, end?: number): Slicable<T>;
  length: number;
}

export class Slice<T> {
  readonly length: number;
  protected readonly inner: Slicable<T>;

  constructor(
    inner: Slicable<T> | Slice<T>,
    readonly offset: number = 0,
    readonly limit: number = inner.length - offset
  ) {
    if (inner instanceof Slice) {
      this.inner = inner.inner;
      this.offset = inner.offset;
      this.limit = inner.limit;
    } else {
      this.inner = inner;
    }

    this.length = this.limit - this.offset;
  }

  at(index: number): T | null {
    index += this.offset;

    if (index < 0) {
      return null;
    }

    if (index >= this.limit) {
      return null;
    }

    return this.inner.at(index) ?? null;
  }

  getOrThrow(index: number): T {
    const value = this.at(index);
    if (value == null) {
      throw new Error(
        `Out of bounds indexing, cannot access index ${index} from slice`
      );
    }

    return value;
  }

  slice(start: number, end?: number): Slice<T> {
    const offset = this.offset + start;
    let limit: number;

    if (end == null) {
      limit = this.limit;
    } else {
      limit = offset + (end - start);
    }

    return new Slice(this.inner, offset, limit);
  }

  getSlicedInner(): Slicable<T> {
    return this.inner.slice(this.offset, this.limit) as Array<T>;
  }

  [util.inspect.custom]() {
    return util.inspect(this.getSlicedInner(), false, null, true);
  }
}

export class ArraySlice<T> extends Slice<T> {
  constructor(inner: Array<T> | Slice<T>, offset?: number, limit?: number) {
    super(inner, offset, limit);
  }

  override slice(start: number, end?: number): ArraySlice<T> {
    return new ArraySlice(super.slice(start, end));
  }

  static from<T>(array: Array<T>) {
    return new ArraySlice(array);
  }
}

export class StringSlice extends Slice<string> {
  constructor(inner: string | Slice<string>, offset?: number, limit?: number) {
    super(inner, offset, limit);
  }

  override slice(start: number, end?: number): StringSlice {
    return new StringSlice(super.slice(start, end));
  }

  isCharAtEq(index: number, char: string): boolean {
    return this.at(index) === char;
  }

  override getSlicedInner(): string {
    return super.getSlicedInner() as string;
  }

  static from(str: string) {
    return new StringSlice(str);
  }
}
