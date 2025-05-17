type TK = { t: string; tx: string };
type ND = {
  t: string;
  val: string;
  end: number;
  childs: ND[];
  toStr(): string;
};
function tk(t: string, tx: string): TK {
  return { t, tx };
}

function nodeToStr(this: ND): string {
  if (this.t === "opr") {
    return `(${this.childs[0]!.toStr()}${this.val}${this.childs[1]!.toStr()})`;
  }

  return this.val;
}

function nd(t: string, val: string, end: number, childs: ND[] = []): ND {
  return { t, val, end, childs, toStr: nodeToStr };
}

const tokens = [
  tk("num", "1"),
  tk("opr", "-"),
  tk("num", "2"),
  tk("opr", "*"),
  tk("num", "3"),
  tk("opr", "-"),
  tk("num", "4"),
  tk("opr", "=="),
  tk("num", "5"),
  tk("opr", "*"),
  tk("num", "6"),
  tk("opr", "-"),
  tk("num", "0"),
];

function pe(tokens: TK[], offset: number = 0) {
  const e = peo(tokens, offset);

  if (e == null) {
    return null;
  }

  return po(tokens, e.end, e);
}

function peo(tokens: TK[], offset: number): ND | null {
  if (tokens[offset]!.t === "num") {
    return nd("num", tokens[offset]!.tx, offset + 1);
  }

  return null;
}

const priorityTable = new Map([
  ["==", 0],
  ["-", 1],
  ["*", 2],
]);

function po(tokens: TK[], offset: number, ln: ND): ND | null {
  if (tokens[offset] == null) {
    return ln;
  }

  if (tokens[offset].t === "opr") {
    const r = pe(tokens, offset + 1);
    if (r == null) {
      throw new Error("a");
    }

    const node = nd("opr", tokens[offset]!.tx, r.end, [ln, r]);

    return balanceOpr(node);
  }

  return ln;
}

function balanceOpr(parent: ND, rightNode?: ND) {
  if (rightNode == null) {
    return balanceOpr(parent, parent.childs[1]);
  }

  if (rightNode.t !== "opr") {
    return parent;
  }

  const parentPriority = priorityTable.get(parent.val)!;
  const rightNodePriority = priorityTable.get(rightNode.val)!;

  if (rightNodePriority < parentPriority) {
    const newRightNode = rightNode.childs[0]!;
    rightNode.childs[0] = parent;
    parent.childs[1] = newRightNode;
    parent.end = newRightNode.end;

    rightNode.childs[0] = balanceOpr(parent);

    return rightNode;
  }

  return parent;
}

console.log(pe(tokens)!.toStr());
