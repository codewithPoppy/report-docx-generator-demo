import { IBasicStylingObject, IStyleFields } from "../Style";
import { Context } from "../../context";
import { XML } from "../../word/XML";

/**
 * Class to resolve number type value
 */
export class Number {
  constructor() {
    /* Do nothing */
  }

  public value(context: Context, key: string, obj: any, style?: IStyleFields): string {
    const stylingDef = context.getStyleFields().value(key) || style;

    if (stylingDef && stylingDef.style) {
      const style = XML.getStyle(obj["value"], stylingDef.style as IBasicStylingObject);

      return (
        XML.unescape("<w:r><w:rPr>" + style + "</w:rPr><w:t>") +
        (obj["value"] === 0 ? "0" : obj["value"] || "") +
        XML.unescape("</w:t></w:r>")
      );
    }

    return (obj["value"] === 0 ? "0" : obj["value"] || "").toString();
  }
}
