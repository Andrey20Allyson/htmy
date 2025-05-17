import { Token, TokenType } from "../../lexer/token";
import { HTMYChildrenNode } from "../nodes/htmy-children";
import { HTMYElementNode } from "../nodes/htmy-element";
import { HTMYElementIdentifierNode } from "../nodes/htmy-element-identifier";
import { HTMYPropertiesNode } from "../nodes/htmy-properties";
import { SyntaxNodeConstructor } from "../nodes/syntax-node";
import { Match, MatchOut, ParsePattern, p } from "../parse-pattern";
import { PatternBasedParser } from "./base";

export class HTMYElementParser extends PatternBasedParser {
  override type: SyntaxNodeConstructor = HTMYElementNode;

  readonly elementClosePattern = p.pattern(
    p.token(TokenType.HTML_TAG_CLOSE_ARROW_LEFT),
    p.token(TokenType.HTML_IDENTIFIER).assert(validateHTMYElementClose),
    p.token(TokenType.ARROW_RIGHT)
  );

  override pattern: ParsePattern = p.pattern(
    p.token(TokenType.ARROW_LEFT),

    p.node(HTMYElementIdentifierNode).as("identifier"),

    p.node(HTMYPropertiesNode).as("properties").opt(),

    p
      .pattern(
        p.token(TokenType.ARROW_RIGHT),
        p.node(HTMYChildrenNode).as("children"),
        this.elementClosePattern
      )
      .or(p.token(TokenType.HTML_TAG_CLOSE_ARROW_RIGHT))
      .required()
  );
}

function validateHTMYElementClose(
  match: Match<Token>,
  out: MatchOut
): Error | null {
  const ident = out.get<HTMYElementIdentifierNode>("identifier")!;

  if (ident.name !== match.value.text) {
    return new Error(
      `Cant close tag <${ident.name}> with </${match.value.text}>`
    );
  }

  return null;
}
