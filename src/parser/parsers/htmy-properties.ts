import { Token, TokenType } from "../../lexer/token";
import {
  HTMYStringLiteralNode as HTMYLiteralStringNode,
  HTMYPropertiesNode,
  HTMYPropertyNode,
} from "../nodes/htmy-properties";
import { JSContextNode } from "../nodes/js-context";
import { SyntaxNodeConstructor } from "../nodes/syntax-node";
import { getTokenText, MatchOut, p, ParsePattern } from "../parse-pattern";
import { PatternBasedParser } from "./base";

export class HTMYLiteralStringParser extends PatternBasedParser<HTMYLiteralStringNode> {
  override type: SyntaxNodeConstructor = HTMYLiteralStringNode;
  override pattern: ParsePattern = p
    .token(TokenType.HTML_LITERAL_STRING)
    .transform(getTokenText)
    .transform(intoStringValue)
    .as("value");
}

function intoStringValue(text: string): string {
  return text.slice(1, -1);
}

export class HTMYPropertyParser extends PatternBasedParser<HTMYPropertyNode> {
  override type: SyntaxNodeConstructor = HTMYPropertyNode;
  override pattern: ParsePattern = p.pattern(
    // property name
    p.token(TokenType.HTML_IDENTIFIER).transform(getTokenText).as("name"),

    // property value assignment
    p
      .pattern(
        p.token(TokenType.ASSIGN),

        p
          .or(
            // value
            p.node(HTMYLiteralStringNode),
            p.node(JSContextNode)
          )
          .required()
          .as("valueNode")
      )
      .opt()
  );
}

export class HTMYPropertiesParser extends PatternBasedParser<HTMYPropertiesNode> {
  override type: SyntaxNodeConstructor = HTMYPropertiesNode;
  override pattern: ParsePattern = p.node(HTMYPropertyNode).many().as("nodes");
}
