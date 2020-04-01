import { Templater } from "@/word/Templater";
import { XML } from "../../word/XML";

const HEADING_STYLES = [
  "Heading1",
  "Heading2",
  "Heading3",
  "Heading4",
  "Heading5",
  "Heading6",
  "Heading7",
  "Heading8"
];

interface IHeadingReference {
  id: number;
  name: string;
  value: string;
  heading: number;
}

export class TableOfContent {
  private _title: string;
  private _level: number;
  private _idxCounter: number;
  private _refNames: IHeadingReference[];
  private _templater: Templater;
  private _numId: number;

  public constructor(templater: Templater, title: string, level = 2) {
    this._templater = templater;
    this._title = title;
    this._level = level > 0 && level < 9 ? level : 2;
    this._idxCounter = 0;
    this._refNames = [];
    this._numId = 1;
  }

  fixNumbering() {
    const numbering: any = this._templater.getNumbering();
    const headings = [false, false, false, false, false, false, false, false, false];
    let searching = true;
    let lastNum = 0;
    /* Iterate all styles to identify what styles are present */
    let itr = 0;
    while (itr < numbering.elements[0].elements.length && searching) {
      const item: any = numbering.elements[0].elements[itr];

      /* CHeck if the item is an abstract enumeration */
      if (item.name === "w:abstractNum") {
        searching = false;
        this._numId = item.attributes["w:abstractNumId"];

        item.elements.forEach((value: any) => {
          if (value.name === "w:lvl") {
            const heading = parseInt(value.attributes["w:ilvl"]) + 1;
            headings[heading] = true;
            value.elements.forEach((subValue: any) => {
              if (subValue.name === "w:pStyle") {
                subValue.attributes["w:val"] = `Heading${heading}`;
              }
            });
          }
        });

        for (let itr2 = 1; itr2 < headings.length; ++itr2) {
          if (!headings[itr2]) {
            item.elements.push({
              type: "element",
              name: "w:lvl",
              attributes: { "w:ilvl": `${itr2 - 1}` },
              elements: [
                { type: "element", name: "w:start", attributes: { "w:val": "1" } },
                { type: "element", name: "w:pStyle", attributes: { "w:val": `Heading${itr2}` } },
                { type: "element", name: "w:numFmt", attributes: { "w:val": "none" } },
                { type: "element", name: "w:suff", attributes: { "w:val": "nothing" } },
                { type: "element", name: "w:lvlText", attributes: { "w:val": "" } },
                { type: "element", name: "w:lvlJc", attributes: { "w:val": "left" } },
                {
                  type: "element",
                  name: "w:pPr",
                  attributes: {},
                  elements: [
                    {
                      type: "element",
                      name: "w:tabs",
                      attributes: {},
                      elements: [
                        {
                          type: "element",
                          name: "w:tab",
                          attributes: { "w:val": "num", "w:pos": "0" }
                        }
                      ]
                    },
                    {
                      type: "element",
                      name: "w:ind",
                      attributes: { "w:left": "0", "w:hanging": "0" }
                    }
                  ]
                }
              ]
            });
          }
        }
      } else if (item.name === "w:numId") {
        lastNum = item.attributes["w:numId"];
      }

      itr++;
    }

    /* No numbering found */
    if (itr === numbering.elements[0].elements.length) {
      const headingsDefinition: any[] = [];
      for (let itr2 = 1; itr2 < headings.length; ++itr2) {
        headingsDefinition.push({
          type: "element",
          name: "w:lvl",
          attributes: { "w:ilvl": `${itr2 - 1}` },
          elements: [
            { type: "element", name: "w:start", attributes: { "w:val": "1" } },
            { type: "element", name: "w:pStyle", attributes: { "w:val": `Heading${itr2}` } },
            { type: "element", name: "w:numFmt", attributes: { "w:val": "none" } },
            { type: "element", name: "w:suff", attributes: { "w:val": "nothing" } },
            { type: "element", name: "w:lvlText", attributes: { "w:val": "" } },
            { type: "element", name: "w:lvlJc", attributes: { "w:val": "left" } },
            {
              type: "element",
              name: "w:pPr",
              attributes: {},
              elements: [
                {
                  type: "element",
                  name: "w:tabs",
                  attributes: {},
                  elements: [
                    {
                      type: "element",
                      name: "w:tab",
                      attributes: { "w:val": "num", "w:pos": "0" }
                    }
                  ]
                },
                {
                  type: "element",
                  name: "w:ind",
                  attributes: { "w:left": "0", "w:hanging": "0" }
                }
              ]
            }
          ]
        });
      }

      lastNum++;

      numbering.elements[0].elements.push({
        type: "element",
        name: "w:abstractNum",
        attributes: { "w:abstractNumId": `${lastNum}` },
        elements: headingsDefinition
      });

      numbering.elements[0].elements.push({
        type: "element",
        name: "w:num",
        attributes: { "w:numId": `${lastNum}` },
        elements: [
          { type: "element", name: "w:abstractNumId", attributes: { "w:val": `${lastNum}` } }
        ]
      });

      this._numId = lastNum;
    }

    this._templater.setNumbering(numbering);
  }

  fixStyles() {
    const styles: any = this._templater.getStyles();
    let heading = false;
    let indexHeading = false;
    let contentsHeading = false;
    const headings = [false, false, false, false, false, false, false, false, false];
    const contents = [false, false, false, false, false, false, false, false, false];

    /* Iterate all styles to identify what styles are present */
    styles.elements[0].elements.forEach((value: any) => {
      if (value.name === "w:style") {
        switch (value.attributes["w:styleId"]) {
          case "Heading1":
            headings[1] = true;
            break;
          case "Heading2":
            headings[2] = true;
            break;
          case "Heading3":
            headings[3] = true;
            break;
          case "Heading4":
            headings[4] = true;
            break;
          case "Heading5":
            headings[5] = true;
            break;
          case "Heading6":
            headings[6] = true;
            break;
          case "Heading7":
            headings[7] = true;
            break;
          case "Heading8":
            headings[8] = true;
            break;
          case "Heading":
            heading = true;
            break;
          case "IndexHeading":
            indexHeading = true;
            break;
          case "ContentsHeading":
            contentsHeading = true;
            break;
          case "Contents1":
            contents[1] = true;
            break;
          case "Contents2":
            contents[2] = true;
            break;
          case "Contents3":
            contents[3] = true;
            break;
          case "Contents4":
            contents[4] = true;
            break;
          case "Contents5":
            contents[5] = true;
            break;
          case "Contents6":
            contents[6] = true;
            break;
          case "Contents7":
            contents[7] = true;
            break;
          case "Contents8":
            contents[8] = true;
            break;
        }
      }
    });

    /* Check base heading style */
    if (!heading) {
      styles.elements[0].elements.push({
        type: "element",
        name: "w:style",
        attributes: { "w:type": "paragraph", "w:styleId": "Heading" },
        elements: [
          { type: "element", name: "w:name", attributes: { "w:val": "Heading" } },
          { type: "element", name: "w:basedOn", attributes: { "w:val": "Normal" } },
          { type: "element", name: "w:next", attributes: { "w:val": "TextBody" } },
          { type: "element", name: "w:qFormat", attributes: {} }
        ]
      });
    }

    /* Check for required headings */
    for (let itr = 1; itr < this._level; ++itr) {
      /* Check if the target heading is set or not */
      if (!headings[itr]) {
        styles.elements[0].elements.push({
          type: "element",
          name: "w:style",
          attributes: { "w:type": "paragraph", "w:styleId": `Heading${itr}` },
          elements: [
            { type: "element", name: "w:name", attributes: { "w:val": `Heading ${itr}` } },
            { type: "element", name: "w:basedOn", attributes: { "w:val": "Heading" } },
            { type: "element", name: "w:next", attributes: { "w:val": "TextBody" } },
            { type: "element", name: "w:qFormat", attributes: {} },
            {
              type: "element",
              name: "w:pPr",
              attributes: {},
              elements: [
                {
                  type: "element",
                  name: "w:numPr",
                  attributes: {},
                  elements: [
                    { type: "element", name: "w:ilvl", attributes: { "w:val": `${itr - 1}` } },
                    { type: "element", name: "w:numId", attributes: { "w:val": `${this._numId}` } }
                  ]
                },
                {
                  type: "element",
                  name: "w:spacing",
                  attributes: { "w:before": "140", "w:after": "120" }
                },
                { type: "element", name: "w:outlineLvl", attributes: { "w:val": "2" } }
              ]
            },
            {
              type: "element",
              name: "w:rPr",
              attributes: {},
              elements: [
                { type: "element", name: "w:b", attributes: {} },
                { type: "element", name: "w:bCs", attributes: {} },
                { type: "element", name: "w:sz", attributes: { "w:val": "28" } },
                { type: "element", name: "w:szCs", attributes: { "w:val": "28" } }
              ]
            }
          ]
        });
      }
    }

    /* Check for index heading style */
    if (!indexHeading) {
      styles.elements[0].elements.push({
        type: "element",
        name: "w:style",
        attributes: { "w:type": "paragraph", "w:styleId": "IndexHeading" },
        elements: [
          { type: "element", name: "w:name", attributes: { "w:val": "Index Heading" } },
          { type: "element", name: "w:basedOn", attributes: { "w:val": "Heading" } },
          {
            type: "element",
            name: "w:pPr",
            attributes: {},
            elements: [
              { type: "element", name: "w:suppressLineNumbers", attributes: {} },
              {
                type: "element",
                name: "w:ind",
                attributes: { "w:left": "0", "w:hanging": "0" }
              }
            ]
          },
          {
            type: "element",
            name: "w:rPr",
            attributes: {},
            elements: [
              { type: "element", name: "w:b", attributes: {} },
              { type: "element", name: "w:bCs", attributes: {} },
              { type: "element", name: "w:sz", attributes: { "w:val": "32" } },
              { type: "element", name: "w:szCs", attributes: { "w:val": "32" } }
            ]
          }
        ]
      });
    }

    /* Check for content heading base style */
    if (!contentsHeading) {
      styles.elements[0].elements.push({
        type: "element",
        name: "w:style",
        attributes: { "w:type": "paragraph", "w:styleId": "ContentsHeading" },
        elements: [
          { type: "element", name: "w:name", attributes: { "w:val": "TOA Heading" } },
          { type: "element", name: "w:basedOn", attributes: { "w:val": "IndexHeading" } },
          {
            type: "element",
            name: "w:pPr",
            attributes: {},
            elements: [
              { type: "element", name: "w:suppressLineNumbers", attributes: {} },
              {
                type: "element",
                name: "w:ind",
                attributes: { "w:left": "0", "w:hanging": "0" }
              }
            ]
          },
          {
            type: "element",
            name: "w:rPr",
            attributes: {},
            elements: [
              { type: "element", name: "w:b", attributes: {} },
              { type: "element", name: "w:bCs", attributes: {} },
              { type: "element", name: "w:sz", attributes: { "w:val": "32" } },
              { type: "element", name: "w:szCs", attributes: { "w:val": "32" } }
            ]
          }
        ]
      });
    }

    /* Check for required contents styles */
    for (let itr = 1; itr < this._level; ++itr) {
      /* Check if the target heading is set or not */
      if (!contents[itr]) {
        styles.elements[0].elements.push({
          type: "element",
          name: "w:style",
          attributes: { "w:type": "paragraph", "w:styleId": `Contents${itr}` },
          elements: [
            { type: "element", name: "w:name", attributes: { "w:val": `TOC ${itr}` } },
            { type: "element", name: "w:basedOn", attributes: { "w:val": "Index" } },
            {
              type: "element",
              name: "w:pPr",
              attributes: {},
              elements: [
                {
                  type: "element",
                  name: "w:tabs",
                  attributes: {},
                  elements: [
                    {
                      type: "element",
                      name: "w:tab",
                      attributes: { "w:val": "clear", "w:pos": "709" }
                    },
                    {
                      type: "element",
                      name: "w:tab",
                      attributes: {
                        "w:val": "right",
                        "w:pos": `${this._templater.width - 283 * (itr - 1)}`,
                        "w:leader": "dot"
                      }
                    }
                  ]
                },
                {
                  type: "element",
                  name: "w:ind",
                  attributes: { "w:left": `${283 * (itr - 1)}`, "w:hanging": "0" }
                }
              ]
            },
            { type: "element", name: "w:rPr", attributes: {} }
          ]
        });
      }
    }

    /* Save the updated styles */
    this._templater.setStyles(styles);
  }

  getTag(elements: any[], tag: string): any {
    let itr = 0;
    while (itr < elements.length && elements[itr].name !== tag) {
      itr++;
    }
    return itr < elements.length ? elements[itr] : null;
  }

  generateReferences() {
    const document: any = this._templater.getDocument();

    /* Iterate each body element */
    document.elements[0].elements[0].elements.forEach((value: any) => {
      if (value.name === "w:p") {
        /* Look for style section */
        const style = this.getTag(value.elements, "w:pPr");
        if (style) {
          const pStyle = this.getTag(style.elements, "w:pStyle");

          /* Check for heading style */
          const heading = HEADING_STYLES.indexOf(pStyle.attributes["w:val"]);
          if (heading >= 0) {
            /* Check for numPr */
            if (!this.getTag(style.elements, "w:numPr")) {
              style.elements.push({
                type: "element",
                name: "w:numPr",
                attributes: {},
                elements: [
                  { type: "element", name: "w:ilvl", attributes: { "w:val": `${heading}` } },
                  { type: "element", name: "w:numId", attributes: { "w:val": `${this._numId}` } }
                ]
              });
            }

            /* Get the heading text */
            const textItems = this.getTag(value.elements, "w:r");
            let textValue = "";
            if (textItems) {
              textItems.elements.forEach((textItem: any) => {
                if (textItem.name === "w:t") {
                  const texts = textItem.elements.filter((el: any) => el.type === "text");
                  textValue += texts.map((value: any) => value.text).join(" ") + " ";
                }
              });
            }

            /* Check for bookmark */
            const bookmarkStart = this.getTag(value.elements, "w:bookmarkStart");
            const name = `__RefHeading___Toc${this._idxCounter}_${Date.now()}`;
            if (!bookmarkStart) {
              /* Add the bookmark */
              value.elements.push({
                type: "element",
                name: "w:bookmarkStart",
                attributes: { "w:id": `${this._idxCounter}`, "w:name": name }
              });
              value.elements.push({
                type: "element",
                name: "w:bookmarkEnd",
                attributes: { "w:id": `${this._idxCounter}` }
              });
            } else {
              /* Update the bookmarks */
              bookmarkStart.attributes["w:id"] = `${this._idxCounter}`;
              bookmarkStart.attributes["w:name"] = name;

              /* Update bookmark end */
              const bookmarkEnd = this.getTag(value.elements, "w:bookmarkEnd");
              if (!bookmarkEnd) {
                value.elements.push({
                  type: "element",
                  name: "w:bookmarkEnd",
                  attributes: { "w:id": `${this._idxCounter}` }
                });
              } else {
                bookmarkEnd.attributes["w:id"] = `${this._idxCounter}`;
              }
            }

            /* Register the reference to the table creation */
            this._refNames.push({
              id: this._idxCounter,
              name: name,
              value: textValue,
              heading: heading + 1
            });
            this._idxCounter++;
          }
        }
      }
    });

    this._templater.setDocument(document);
  }

  public value(): string {
    let tocStr = `
    <w:sdt>
    <w:sdtPr>
      <w:docPartObj>
        <w:docPartGallery w:val="${this._title}" />
        <w:docPartUnique w:val="true" />
      </w:docPartObj>
    </w:sdtPr>
    <w:sdtContent>
      <w:p>
        <w:pPr>
          <w:pStyle w:val="TOAHeading" />
          <w:rPr></w:rPr>
        </w:pPr>
        <w:r>
          <w:br w:type="page" />
        </w:r>
        <w:r>
          <w:rPr></w:rPr>
          <w:t>${this._title}</w:t>
        </w:r>
      </w:p>
      `;

    this._refNames.forEach((ref: IHeadingReference, idx: number) => {
      tocStr += `<w:p>
        <w:pPr>
            <w:pStyle w:val="Contents${ref.heading}" />
            <w:tabs>
              <w:tab w:val="clear" w:pos="${this._templater.width - 283 * (ref.heading - 1)}" />
              <w:tab w:val="right" w:pos="${this._templater.width}" w:leader="dot" />
            </w:tabs>
            <w:rPr></w:rPr>
        </w:pPr>`;

      if (idx === 0) {
        tocStr += `<w:r>
          <w:fldChar w:fldCharType="begin"></w:fldChar>
      </w:r>
      <w:r>
          <w:rPr>
            <w:rStyle w:val="IndexLink" />
            <w:rtl w:val="true" />
          </w:rPr>
          <w:instrText> TOC \\f \\o &quot;1-9&quot; \\h</w:instrText>
      </w:r>
      <w:r>
          <w:rPr>
            <w:rStyle w:val="IndexLink" />
            <w:rtl w:val="true" />
          </w:rPr>
          <w:fldChar w:fldCharType="separate" />
      </w:r>`;
      }
      tocStr += `<w:hyperlink w:anchor="${ref.name}" w:tooltip="${ref.value}">
            <w:r>
              <w:rPr>
                <w:rStyle w:val="IndexLink" />
                <w:rtl w:val="true" />
              </w:rPr>
              <w:t xml:space="preserve">​ </w:t>
            </w:r>
            <w:r>
              <w:rPr></w:rPr>
              <w:t>${ref.value}</w:t>
            </w:r>
            <w:r>
              <w:rPr>
                <w:rStyle w:val="IndexLink" />
              </w:rPr>
              <w:tab />
            </w:r>
            <w:r>
              <w:rPr></w:rPr>
              <w:t>3</w:t>
            </w:r>
        </w:hyperlink>`;

      if (idx === this._refNames.length - 1) {
        tocStr += `
          <w:r>
          <w:rPr>
            <w:rStyle w:val="IndexLink" />
            <w:rtl w:val="true" />
          </w:rPr>
          <w:fldChar w:fldCharType="end" />
      </w:r>
  `;
      }

      tocStr += `
    </w:p>
  `;
    });

    tocStr += `</w:sdtContent>
    </w:sdt>`;

    return XML.unescape(tocStr);
  }
}
