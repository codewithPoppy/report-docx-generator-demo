import { FIELD_TYPES } from "../Types";
import { IItems } from "../Items";
import { DataType } from "../types/DataType";
import { Context } from "../../context";
import { XML } from "../../word/XML";
import { ISection } from "../ReadyComponents";

export class Image {
  constructor() {
    /* Do nothing */
  }

  public value(
    context: Context,
    pictureField: string,
    textField: string,
    picturesPerPage: number,
    sections?: ISection
  ): string {
    let response = "";

    if (sections && sections.field) {
      const values: string[] = context.getItems().uniqueValues(sections.field);
      values.forEach((value: string) => {
        const items = context.getItems().filterByValue(sections.field, value);
        const header = context.getItemsStruct().getHeader(sections.field);

        /* Add images section header */
        response += XML.startParagraph();
        /* Check if label must be printed */
        if (sections.showFieldLabel) {
          response += XML.styledText(`${header}:`, value, sections.labelStyle);
          response += XML.blankSpace();
        }
        response += XML.styledText(`${value}`, value, sections.valueStyle);
        response += XML.endParagraph();

        /* Add the images for the given value */
        response += this._addImages(context, pictureField, textField, picturesPerPage, items);

        /* Add line break after section - empty paragraph */
        response += XML.startParagraph();
        response += XML.endParagraph();
      });
    } else {
      /* Return all images */
      response += this._addImages(
        context,
        pictureField,
        textField,
        picturesPerPage,
        context.getItems().filteredItems
      );
    }
    return response;
  }

  private _addImages(
    context: Context,
    pictureField: string,
    textField: string,
    picturesPerPage: number,
    items: IItems[]
  ): string {
    let response = "";

    response += XML.startParagraph();
    let itrCount = 0;

    /* Iterate over each item */
    items.forEach((item: IItems) => {
      /* Render the image */
      response += DataType.getData(
        context,
        FIELD_TYPES.PICTURE,
        {
          value: item[pictureField],
          title: item[textField]
        },
        {},
        "",
        [],
        undefined,
        true
      );
      itrCount++;

      /* Check the limit of pictures per page */
      if (picturesPerPage && itrCount >= picturesPerPage) {
        response += XML.endParagraph();
        response += XML.pageBreak();
        response += XML.startParagraph();
        itrCount = 0;
      }
    });

    response += XML.endParagraph();

    return response;
  }
}
