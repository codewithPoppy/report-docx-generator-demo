import { IBasicStylingObject, IStyleFields } from "../Style";
import { Context } from "../../context";
import { XML } from "../../word/XML";

/**
 * Class to resolve number type value
 */
export class Dropdown {
  constructor() {
    /* Do nothing */
  }

  public value(context: Context, key: string, obj: any, style?: IStyleFields): string {
    const stylingDef = context.getStyleFields().value(key) || style;

    let value = "";
    if (obj["value"] !== undefined) {
      value = obj["value"].join(", ");
    }
    if (stylingDef && stylingDef.style) {
      const style = XML.getStyle(value, stylingDef.style as IBasicStylingObject);

      return (
        XML.unescape("<w:r><w:rPr>" + style + "</w:rPr><w:t>") +
        (value || "") +
        XML.unescape("</w:t></w:r>")
      );
    }
    return (value || "").toString();
  }
}
