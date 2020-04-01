import { FIELD_TYPES } from "../data/Types";
import { DataType } from "../data/types/DataType";
import { IExpressionField, ITableTotal } from "../data/ReadyComponents";
import {
  IBasicStylingObject,
  ICellBorderStyle,
  ITableBorderStyle,
  ITableStylingObject,
} from "../data/Style";
import { Context } from "../context";
import Logger from "../logger";
import { Colors } from "../utils/Colors";
import { IItems } from "../data/Items";
import { BORDER_MULTIPLIER } from "../data/components/Table";

export class XML {
  private static _logger = new Logger("XML");

  private constructor() {
    /* Do nothing */
  }

  /**
   * Return XML code to insert new paragraph into the document
   */
  static paragraph(text: string): string {
    return (
      XML.unescape("<w:p><w:r><w:t>") +
      text +
      XML.unescape("</w:t></w:r></w:p>")
    );
  }

  /**
   * Return XML code to insert paragraph content into the document
   */
  static paragraphContent(text: string): string {
    return XML.unescape("<w:r><w:t>") + text + XML.unescape("</w:t></w:r>");
  }

  /**
   * Return XML code for page break into the document
   */
  static pageBreak(): string {
    return XML.unescape(`
    <w:p>
      <w:r>
        <w:br w:type="page" />
      </w:r>
    </w:p>
    `);
  }

  static startParagraph(): string {
    return XML.unescape(`<w:p>`);
  }

  static endParagraph(): string {
    return XML.unescape(`</w:p>`);
  }

  static lineBreak(): string {
    return XML.unescape(`<w:r><w:br/></w:r>`);
  }

  static addImage(
    imgId: string,
    width: number,
    height: number,
    caption?: string
  ): string {
    let img = ``;
    const cx = 1428750;
    const cy = Math.round((cx * height) / width);

    /* Check if the caption must be showed */
    if (caption) {
      img +=
        XML.unescape(`
      <w:r>
        <mc:AlternateContent>
          <mc:Choice Requires="wps">
            <w:drawing>
              <wp:inline distT="0" distB="0" distL="0" distR="0">
                <wp:extent cx="${cx}" cy="${cy}"/>
                <wp:effectExtent l="0" t="0" r="0" b="0"/>
                <wp:docPr id="2" name="Image 2" descr="image"/>
                <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                  <a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">
                    <wps:wsp>
                      <wps:cNvSpPr txBox="1"/>
                      <wps:spPr>
                        <a:xfrm>
                          <a:off x="0" y="0"/>
                          <a:ext cx="${cx}" cy="${cy}"/>
                        </a:xfrm>
                        <a:prstGeom prst="rect"/>
                      </wps:spPr>
                      <wps:txbx>
                        <w:txbxContent>
                          <w:p>
                            <w:pPr>
                              <w:pStyle w:val="Caption"/>
                              <w:suppressLineNumbers/>
                              <w:spacing w:before="120" w:after="120"/>
                              <w:jc w:val="center"/>
                              <w:rPr>
                              </w:rPr>
                            </w:pPr>
                            <w:r>
                              <w:rPr></w:rPr>
                              <w:t>`) +
        caption +
        XML.unescape(`</w:t>
                            </w:r>
                            <w:r>
                              <w:rPr>
                                <w:vanish/>
                              </w:rPr>
                              <w:br/>
                            </w:r>
      `);
    }

    /* Draw the image */
    img += XML.unescape(`
    <w:r>
      <w:rPr></w:rPr>
      <w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0">
          <wp:extent cx="${cx}" cy="${cy}"/>
          <wp:effectExtent l="0" t="0" r="0" b="0"/>
          <wp:docPr id="2" name="Image 2" descr="image"/>
          <wp:cNvGraphicFramePr>
            <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
          </wp:cNvGraphicFramePr>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                  <pic:cNvPr id="0" name="Picture 1" descr="image"/>
                  <pic:cNvPicPr>
                    <a:picLocks noChangeAspect="1" noChangeArrowheads="1"/>
                  </pic:cNvPicPr>
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="rId${imgId}">
                    <a:extLst>
                      <a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">
                        <a14:useLocalDpi xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main" val="0"/>
                      </a:ext>
                    </a:extLst>
                  </a:blip>
                  <a:stretch>
                    <a:fillRect/>
                  </a:stretch>
                </pic:blipFill>
                <pic:spPr bwMode="auto">
                  <a:xfrm>
                    <a:off x="0" y="0"/>
                    <a:ext cx="${cx}" cy="${cy}"/>
                  </a:xfrm>
                  <a:prstGeom prst="rect">
                    <a:avLst/>
                  </a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
    </w:r>
    `);

    /* Check if the caption is showed */
    if (caption) {
      img +=
        XML.unescape(`
      </w:p>
      </w:txbxContent>
      </wps:txbx>
      <wps:bodyPr anchor="t" lIns="0" tIns="0" rIns="0" bIns="0">
      <a:noAutofit/>
      </wps:bodyPr>
      </wps:wsp>
      </a:graphicData>
      </a:graphic>
      </wp:inline>
      </w:drawing>
      </mc:Choice>
      <mc:Fallback>
      <w:pict>
      <v:rect style="position:absolute;rotation:0;width:112.5pt;height:142.15pt;mso-wrap-distance-left:0pt;mso-wrap-distance-right:0pt;mso-wrap-distance-top:0pt;mso-wrap-distance-bottom:0pt;margin-top:-142.15pt;mso-position-vertical:top;mso-position-vertical-relative:text;margin-left:0pt;mso-position-horizontal:center;mso-position-horizontal-relative:text">
      <v:textbox inset="0in,0in,0in,0in">
      <w:txbxContent>
      <w:p>
      <w:pPr>
      <w:pStyle w:val="Caption"/>
      <w:suppressLineNumbers/>
      <w:spacing w:before="120" w:after="120"/>
      <w:jc w:val="center"/>
      <w:rPr></w:rPr>
      </w:pPr>
      <w:r>
      <w:rPr></w:rPr>
      <w:t>`) +
        caption +
        XML.unescape(`</w:t>
      </w:r>
      <w:r>
      <w:rPr><w:vanish/></w:rPr>
      <w:br/>
      </w:r>
      <w:r>
      <w:rPr></w:rPr>
      <w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0">
          <wp:extent cx="${cx}" cy="${cy}"/>
          <wp:effectExtent l="0" t="0" r="0" b="0"/>
          <wp:docPr id="2" name="Image 2" descr="image"/>
          <wp:cNvGraphicFramePr>
            <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
          </wp:cNvGraphicFramePr>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                  <pic:cNvPr id="0" name="Picture 1" descr="image"/>
                  <pic:cNvPicPr>
                    <a:picLocks noChangeAspect="1" noChangeArrowheads="1"/>
                  </pic:cNvPicPr>
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="rId${imgId}">
                    <a:extLst>
                      <a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">
                        <a14:useLocalDpi xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main" val="0"/>
                      </a:ext>
                    </a:extLst>
                  </a:blip>
                  <a:stretch>
                    <a:fillRect/>
                  </a:stretch>
                </pic:blipFill>
                <pic:spPr bwMode="auto">
                  <a:xfrm>
                    <a:off x="0" y="0"/>
                    <a:ext cx="${cx}" cy="${cy}"/>
                  </a:xfrm>
                  <a:prstGeom prst="rect">
                    <a:avLst/>
                  </a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
      </w:r>
      </w:p>
      </w:txbxContent>
      </v:textbox>
      <w10:wrap type="square" side="largest"/>
      </v:rect>
      </w:pict>
      </mc:Fallback>
      </mc:AlternateContent>
      </w:r>
      `);
    }

    return img;
  }

  static image(
    imgTitle: string,
    imgId: string,
    width: number,
    height: number
  ): string {
    let img = XML.startParagraph();

    if (imgTitle) {
      img += XML.unescape(`<w:r><w:t>${imgTitle}:&#160;</w:t></w:r>`);
    }

    img += XML.addImage(imgId, width, height);
    img += XML.endParagraph();
    return img;
  }

  static drawGroupTableInPieChart(
    groupName: string,
    items: { value: string; count: number }[]
  ): string {
    let res = `
      <w:tbl>
        <w:tblPr>
          <w:tblStyle w:val="TableGrid" />
          <w:tblW w:w="5000" w:type="pct" />

          <w:tblInd w:w="0" w:type="dxa" />
          <w:tblCellMar>
            <w:top w:w="0" w:type="dxa" />
            <w:left w:w="108" w:type="dxa" />
            <w:bottom w:w="0" w:type="dxa" />
            <w:right w:w="108" w:type="dxa" />
          </w:tblCellMar>
        </w:tblPr>
        <w:tblGrid>
          <w:gridCol w:w="1395.8" />
          <w:gridCol w:w="1395.8" />
        </w:tblGrid>`;
    const drawStringCell = (value: string): string => `
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="1395.8" w:type="dxa" />
          <w:tcBorders>
            <w:top w:val="single" w:sz="8" w:space="0" w:color="000000" />
            <w:left w:val="single" w:sz="8" w:space="0" w:color="000000" />
            <w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000" />
            <w:right w:val="single" w:sz="8" w:space="0" w:color="000000" />
          </w:tcBorders>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:pStyle w:val="Normal" />
            <w:spacing w:before="0" w:after="160" />

            <w:rPr></w:rPr>
          </w:pPr>
          <w:r>
            <w:rPr></w:rPr>
            <w:t>${value}</w:t>
          </w:r>
        </w:p>
      </w:tc>`;
    const drawNumberCell = (num: number): string => `
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="1395.8" w:type="dxa" />
          <w:tcBorders>
            <w:top w:val="single" w:sz="8" w:space="0" w:color="000000" />
            <w:left w:val="single" w:sz="8" w:space="0" w:color="000000" />
            <w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000" />
            <w:right w:val="single" w:sz="8" w:space="0" w:color="000000" />
          </w:tcBorders>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:pStyle w:val="Normal" />
            <w:spacing w:before="0" w:after="160" />
            <w:rPr>
              <w:rtl />
            </w:rPr>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:hint='cs' />
              <w:rtl />
            </w:rPr>
            <w:t>${num}</w:t>
          </w:r>
        </w:p>
      </w:tc>`;
    // draw header
    res += `
      <w:tr>
        <w:trPr></w:trPr>`;
    res += drawStringCell("") + drawStringCell(groupName);
    res += `</w:tr>`;
    // draw row
    items.forEach((item) => {
      res += `
        <w:tr>
          <w:trPr></w:trPr>`;
      res += drawStringCell(item.value);
      res += drawNumberCell(item.count);
      res += `</w:tr>`;
    });
    res += `</w:tbl>`;
    return res;
  }

  static startTable(
    context: Context,
    fields: string[],
    expressions: IExpressionField[],
    style: ITableStylingObject,
    width: number[],
    _border: number[],
    _color: string[]
  ): string {
    const border = [_border[0], _border[1], _border[2], _border[3]];
    const color = [_color[0], _color[1], _color[2], _color[3]];

    const fullWidth = width.reduce(
      (previous: number, current: number): number => {
        return previous + current;
      }
    );

    let table = XML.unescape(`<w:tbl>
      <w:tblPr>
        <w:tblStyle w:val="TableGrid"/>
        ${
          !style.fixedWidth
            ? `<w:tblW w:w="${fullWidth}" w:type="dxa"/>`
            : `<w:tblW w:w="${Number(style.fixedWidth) * 20}" w:type="dxa"/>`
        }
        ${style.align ? `<w:jc w:val="${style.align.toLowerCase()}" />` : ""}
        <w:tblInd w:w="0" w:type="dxa" />
        <w:tblLayout w:type="fixed"/>
        <w:tblCellMar>
          <w:top w:w="0" w:type="dxa" />
          <w:left w:w="108" w:type="dxa" />
          <w:bottom w:w="0" w:type="dxa" />
          <w:right w:w="108" w:type="dxa" />
        </w:tblCellMar>
      </w:tblPr>
      <w:tblGrid>`);

    fields.forEach((_val: string, col: number) => {
      table += XML.unescape(`<w:gridCol w:w="${width[col]}"/>`);
    });
    table += XML.unescape(`</w:tblGrid>`);

    let tableStyle = "";

    if (style.repeatHeader) {
      tableStyle += "<w:tblHeader />";
    }

    if (style.rowHeight) {
      tableStyle += `<w:trHeight w:val="${
        Number(style.rowHeight) * 20
      }" w:hRule="exact"/>`;
    }

    /* Add table header row */
    table += XML.unescape(`<w:tr><w:trPr>${tableStyle}</w:trPr>`);

    fields.forEach((field: string, col: number) => {
      const expressionIndex = expressions.findIndex((x) => x.name === field);

      const strField =
        expressionIndex > -1
          ? expressions[expressionIndex].labelName ||
            expressions[expressionIndex].name
          : context.getItemsStruct().getHeader(field).charAt(0).toUpperCase() +
            context.getItemsStruct().getHeader(field).slice(1);

      const fieldHeaderStyle =
        (style.columnStyle || []).filter((x) => x.field === field)[0] ||
        undefined;

      let complementaryStyle = `<w:tcW w:w="${width[col]}" w:type="dxa"/>
      <w:tcBorders>
          <w:top w:val="single" w:sz="${
            border[0]
          }" w:space="0" w:color="${Colors.color2hex(color[0])}"/>
          <w:left w:val="single" w:sz="${
            border[3]
          }" w:space="0" w:color="${Colors.color2hex(color[3])}"/>
          <w:bottom w:val="single" w:sz="${
            border[2]
          }" w:space="0" w:color="${Colors.color2hex(color[2])}"/>
          <w:right w:val="single" w:sz="${
            border[1]
          }" w:space="0" w:color="${Colors.color2hex(color[1])}"/>
          <w:insideH w:val="single" w:sz="${Math.min(
            border[0],
            border[2]
          )}" w:space="0" w:color="${Colors.color2hex(color[0])}"/>
          <w:insideV w:val="single" w:sz="${Math.min(
            border[1],
            border[3]
          )}" w:space="0" w:color="${Colors.color2hex(color[1])}"/>
        </w:tcBorders>`;

      let finalStr = strField;
      let custom = false;
      if (fieldHeaderStyle && fieldHeaderStyle.header) {
        const hStyle = fieldHeaderStyle.header;
        custom = true;

        finalStr = DataType.getData(
          context,
          0,
          { value: strField },
          {},
          "",
          [],
          hStyle
        );

        (hStyle.bgColor || []).forEach((DEF) => {
          if (
            XML.checkCondition(
              strField,
              DEF.conditionValue || "",
              DEF.conditionType
            )
          ) {
            complementaryStyle += `<w:shd w:color="auto" w:fill="${Colors.color2hex(
              DEF.value
            )}" w:val="clear" />`;
          }
        });
      }

      table += XML.unescape(`
        <w:tc>
          <w:tcPr>
            ${complementaryStyle}
          </w:tcPr>
          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal" />
              <w:spacing w:before="0" w:after="160" />
              ${style.align ? `<w:jc w:val="${style.align}" />` : ""}
              <w:rPr></w:rPr>
            </w:pPr>`);

      if (finalStr.length > 0 && !custom) {
        table += XML.unescape("<w:r><w:rPr></w:rPr><w:t>");
        table += finalStr;
        table += XML.unescape("</w:t></w:r>");
      } else {
        table += finalStr;
      }

      table += XML.unescape("</w:p></w:tc>");
    });
    table += XML.unescape("</w:tr>");

    return table;
  }

  static endTable(): string {
    return XML.unescape("</w:tbl>");
  }

  static addRow(
    contextObj: Context,
    obj: any,
    fields: string[],
    context: any,
    expressions: IExpressionField[],
    style: ITableStylingObject,
    width: number[],
    _border: number[],
    _color: string[]
  ): string {
    let tableStyle = "";

    if (style.rowHeight) {
      tableStyle += `<w:trHeight w:val="${
        style.rowHeight * 20
      }" w:hRule="exact"/>`;
    }

    /* Open row */
    let row = "";

    row += XML.unescape(`<w:tr><w:trPr>${tableStyle}</w:trPr>`);

    /* Insert each column */
    fields.forEach((field: string, col: number) => {
      /* Initial cell style */
      let border = [_border[0], _border[1], _border[2], _border[3]];
      let color = [_color[0], _color[1], _color[2], _color[3]];

      /* Iterate all cell border styles */
      style?.cellBorder?.forEach((cellBorder: ICellBorderStyle) => {
        /* Check cell border condition */
        const condition = (cellBorder.condition.type || "NONE").toUpperCase();
        if (
          (field === cellBorder.condition.field || condition === "ALL") &&
          XML.checkCondition(
            obj[cellBorder.condition.field],
            cellBorder.condition.value,
            condition
          )
        ) {
          const newBorder = Number(cellBorder.width) * BORDER_MULTIPLIER;
          border = [newBorder, newBorder, newBorder, newBorder];
          color = [
            cellBorder.color,
            cellBorder.color,
            cellBorder.color,
            cellBorder.color,
          ];
        }
      });

      const struct = contextObj.getItemsStruct().value(field);
      if (struct) {
        const fieldStyle =
          (style.columnStyle || []).filter((x) => x.field === field)[0] ||
          undefined;

        const value = DataType.getData(
          contextObj,
          struct.type,
          {
            value: obj[field],
            format: struct["format"],
          },
          context,
          field,
          expressions,
          fieldStyle ? fieldStyle.body : undefined,
          true
        );

        let complementaryStyle = `<w:tcW w:w="${width[col]}" w:type="dxa"/>
      <w:tcBorders>
          <w:top w:val="single" w:sz="${
            border[0]
          }" w:space="0" w:color="${Colors.color2hex(color[0])}"/>
          <w:left w:val="single" w:sz="${
            border[3]
          }" w:space="0" w:color="${Colors.color2hex(color[3])}"/>
          <w:bottom w:val="single" w:sz="${
            border[2]
          }" w:space="0" w:color="${Colors.color2hex(color[2])}"/>
          <w:right w:val="single" w:sz="${
            border[1]
          }" w:space="0" w:color="${Colors.color2hex(color[1])}"/>
        <w:insideH w:val="single" w:sz="${Math.min(
          border[0],
          border[2]
        )}" w:space="0" w:color="${Colors.color2hex(color[0])}"/>
        <w:insideV w:val="single" w:sz="${Math.min(
          border[1],
          border[3]
        )}" w:space="0" w:color="${Colors.color2hex(color[1])}"/>
        </w:tcBorders>`;

        let custom = false;
        if (fieldStyle && fieldStyle.body) {
          custom = true;
          const hStyle = fieldStyle.body;
          (hStyle.bgColor || []).forEach((DEF) => {
            if (
              XML.checkCondition(
                obj[field],
                DEF.conditionValue || "",
                DEF.conditionType
              )
            ) {
              complementaryStyle += `<w:shd w:color="auto" w:fill="${Colors.color2hex(
                DEF.value
              )}" w:val="clear" />`;
            }
          });
        }

        /* Check if the field is the picture */
        if (struct.type === FIELD_TYPES.PICTURE) {
          row +=
            XML.unescape(`<w:tc>
            <w:tcPr>
              ${complementaryStyle}
            </w:tcPr>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Normal"/>
                <w:spacing w:before="0" w:after="160" />
                ${style.align ? `<w:jc w:val="${style.align}" />` : ""}
                <w:rPr></w:rPr>
              </w:pPr>`) +
            value +
            XML.unescape(`</w:p>
          </w:tc>
          `);
        } else {
          row += XML.unescape(`<w:tc>
            <w:tcPr>
              ${complementaryStyle}
            </w:tcPr>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Normal"/>
                <w:spacing w:before="0" w:after="160" />
                ${style.align ? `<w:jc w:val="${style.align}" />` : ""}
                <w:rPr><w:rtl/></w:rPr>
              </w:pPr>`);
          if (!custom) {
            row += XML.unescape(
              "<w:r><w:rPr><w:rFonts w:hint='cs'/><w:rtl/></w:rPr><w:t>"
            );
            row += value;
            row += XML.unescape("</w:t></w:r>");
          } else {
            row += value;
          }
          row += XML.unescape("</w:p></w:tc>");
        }
      }
    });

    /* Close the row */
    row += XML.unescape(`</w:tr>`);
    return row;
  }

  static addTotalRow(
    context: Context,
    items: IItems[],
    totalRow: ITableTotal[],
    fields: string[],
    expressions: IExpressionField[],
    style: ITableStylingObject,
    width: number[],
    _border: number[],
    _color: string[]
  ): string {
    /* Initial cell style */
    const border = [_border[0], _border[1], _border[2], _border[3]];
    const color = [_color[0], _color[1], _color[2], _color[3]];

    let tableStyle = "";

    if (style.rowHeight) {
      tableStyle += `<w:trHeight w:val="${
        style.rowHeight * 20
      }" w:hRule="exact"/>`;
    }

    /* Open row */
    let row = "";

    row += XML.unescape(`<w:tr><w:trPr>${tableStyle}</w:trPr>`);

    /* Insert each column */
    fields.forEach((field: string, col: number) => {
      const struct = context.getItemsStruct().value(field);
      if (struct) {
        const fieldStyle =
          (style.columnStyle || []).filter((x) => x.field === field)[0] ||
          undefined;

        /* Find the total information */
        const total = totalRow.filter(
          (value: ITableTotal) => value.field === field
        );
        let value = "";

        /* Check if there must calculated the total */
        if (struct.type === FIELD_TYPES.NUMBER && total && total.length > 0) {
          const tmpTotal = total[total.length - 1];
          let amount = 0;

          /* Calculate the total value */
          switch (tmpTotal.type.toUpperCase()) {
            case "SUM":
              amount = context.getItems().fnSum(field, items);
              break;
            case "AVG":
              amount = context.getItems().fnAvg(field, items);
              break;
          }

          /* Check if the label must be prepended */
          if (tmpTotal.label) {
            value = `${tmpTotal.label} ${amount}`;
          } else {
            value = `${amount}`;
          }
        }

        /* Check the field style */
        const complementaryStyle = `<w:tcW w:w="${width[col]}" w:type="dxa"/>
      <w:tcBorders>
          <w:top w:val="single" w:sz="${
            border[0]
          }" w:space="0" w:color="${Colors.color2hex(color[0])}"/>
          <w:left w:val="single" w:sz="${
            border[3]
          }" w:space="0" w:color="${Colors.color2hex(color[3])}"/>
          <w:bottom w:val="single" w:sz="${
            border[2]
          }" w:space="0" w:color="${Colors.color2hex(color[2])}"/>
          <w:right w:val="single" w:sz="${
            border[1]
          }" w:space="0" w:color="${Colors.color2hex(color[1])}"/>
        <w:insideH w:val="single" w:sz="${Math.min(
          border[0],
          border[2]
        )}" w:space="0" w:color="${Colors.color2hex(color[0])}"/>
        <w:insideV w:val="single" w:sz="${Math.min(
          border[1],
          border[3]
        )}" w:space="0" w:color="${Colors.color2hex(color[1])}"/>
        </w:tcBorders>`;

        /* Add the column value */
        row +=
          XML.unescape(`<w:tc>
            <w:tcPr>
              ${complementaryStyle}
            </w:tcPr>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Normal"/>
                <w:spacing w:before="0" w:after="160" />
                ${style.align ? `<w:jc w:val="${style.align}" />` : ""}
                <w:rPr></w:rPr>
              </w:pPr>
              <w:r>
                <w:rPr></w:rPr>
                <w:t>`) +
          value +
          XML.unescape(`</w:t>
                </w:r>
              </w:p>
            </w:tc>`);
      }
    });

    /* Close the row */
    row += XML.unescape(`</w:tr>`);
    return row;
  }

  static styledText(
    text: string,
    filedVal: any,
    style: IBasicStylingObject
  ): string {
    return `<w:r>
      <w:rPr>
        ${XML.getStyle(filedVal, style)}
      </w:rPr>
      <w:t>${text}</w:t>
    </w:r>`;
  }

  static blankSpace(): string {
    return `<w:r><w:rPr></w:rPr><w:t xml:space="preserve"> </w:t></w:r>`;
  }

  static getStyle(fieldVal: any, definition: IBasicStylingObject) {
    let response = "";
    if (!definition) return response;
    (definition.textColor || []).forEach((DEF) => {
      if (
        XML.checkCondition(
          fieldVal,
          DEF.conditionValue || "",
          DEF.conditionType
        )
      ) {
        response += `<w:color w:val="${DEF.value}"/>`;
      }
    });

    (definition.textSize || []).forEach((DEF) => {
      if (
        XML.checkCondition(
          fieldVal,
          DEF.conditionValue || "",
          DEF.conditionType
        )
      ) {
        response += `<w:sz w:val="${DEF.value * 2}"/><w:szCs w:val="${
          DEF.value * 2
        }"/>`;
      }
    });

    (definition.textUnderline || []).forEach((DEF) => {
      if (
        XML.checkCondition(
          fieldVal,
          DEF.conditionValue || "",
          DEF.conditionType
        )
      ) {
        response += `<w:u w:val="${
          DEF.value === true ? "single" : DEF.value
        }"/>`;
      }
    });

    (definition.textBold || []).forEach((DEF) => {
      if (
        XML.checkCondition(
          fieldVal,
          DEF.conditionValue || "",
          DEF.conditionType
        ) &&
        DEF.value
      ) {
        response += `<w:b />`;
      }
    });

    (definition.bgColor || []).forEach((DEF) => {
      if (
        XML.checkCondition(
          fieldVal,
          DEF.conditionValue || "",
          DEF.conditionType
        )
      ) {
        response += `<w:shd w:fill="${DEF.value}"/>`;
      }
    });

    return response;
  }

  static checkCondition(
    fieldVal: any,
    requiredVal: any,
    condition: string
  ): boolean {
    let filtered = true;
    switch (condition.toUpperCase()) {
      /* Greater than filter */
      case "ABOVE":
        filtered = filtered && fieldVal > requiredVal;
        break;

      /* Equal filter */
      case "EQUALS":
        filtered =
          filtered &&
          fieldVal &&
          fieldVal.toString() === requiredVal.toString();
        break;

      /* Less than filter */
      case "UNDER":
        filtered = filtered && fieldVal < requiredVal;
        break;

      /* Contains filter */
      case "CONTAINS":
        filtered =
          filtered &&
          fieldVal
            .toString()
            .toUpperCase()
            .includes(requiredVal.toString().toUpperCase());
        break;

      case "ALL":
        filtered = true;
        break;

      case "NONE":
        filtered = false;
        break;

      default:
        XML._logger.error("Invalid styling condition.");
        process.exit(-1);
    }

    return filtered;
  }

  static unescape(xml: string): string {
    let res = xml;

    res = res.replace(new RegExp("<", "g"), "%START_TAG%");
    res = res.replace(new RegExp(">", "g"), "%END_TAG%");
    res = res.replace(new RegExp('"', "g"), "%QUOT%");

    return res;
  }
}
