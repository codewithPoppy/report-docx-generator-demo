import * as fs from "fs";
import * as path from "path";
import * as xml from "xml-js";
import PizZip from "pizzip";
import { v4 } from "uuid";
import { IPlaceholders } from "../data/Placeholders";
import { Context } from "../context";
import Logger from "../logger";
import { XML } from "./XML";
import { IFormula } from "@/data/Formulas";
import { TableOfContent } from "../data/components/TableOfContent";

const Docxtemplater = require("docxtemplater");
const str2xml = Docxtemplater.DocUtils.str2xml;
const xml2str = Docxtemplater.DocUtils.xml2str;

export class Templater {
  private _docTemplate: any;
  private _zipTemplate: PizZip;
  public imgPath: string;
  private _logger;
  private _context: Context;

  private _realWidth: number;
  private _realHeight: number;

  private attachmentsDefinition: Array<{ key: string; path: string }> = [];
  private attachmentsData: Array<{
    key: string;
    values: Array<{ placeholder: string; value: string }>;
  }> = [];

  private conditionalPart: Array<{ key: string; shouldAdd: any }> = [];

  private settings: {
    header?: {
      path?: string;
      pageNumber?: {
        align: "right" | "left" | "center";
      };
    };
    footer?: {
      path?: string;
      pageNumber?: {
        align: "right" | "left" | "center";
      };
    };
    orientation?: "portrait" | "landscape";
    margin?: {
      top?: number;
      left?: number;
      bottom?: number;
      right?: number;
    };
    size?: {
      width?: number;
      height?: number;
    };
    tableOfContents?: {
      key: string;
      title?: string;
      level?: number;
    };
  } = {};

  private importedTemplates = 0;

  public constructor(context: Context) {
    this._zipTemplate = new PizZip();
    this.imgPath = "";
    this._logger = new Logger("Templater");
    this._context = context;
  }

  /**
   * Add new image to the DOCX file structure
   */
  public attachImage(filename: string): string | null {
    /* Ensure media folder exists */
    this._zipTemplate.folder("word/media");

    /* Check if the image file exists */
    const realFilename = path.resolve(
      path.resolve(
        this._context.getRelativeFileFinder().getFolder(),
        this.imgPath,
        filename
      )
    );

    if (!fs.existsSync(realFilename)) {
      this._logger.error(" File dont exist", { file: realFilename });
      return null;
    }

    /* Read the real image content */
    const image = fs.readFileSync(realFilename);

    /* Add the image content to the document */
    const baseName = v4() + ".bin";
    this._zipTemplate.file("word/media/" + baseName, image, { binary: true });

    /* Update the document relationship to handle the image */
    const relations: any = this._zipTemplate.file(
      "word/_rels/document.xml.rels"
    );
    const result = xml.xml2js(relations.asText());
    const imgId = result.elements[0].elements.length + 1;
    result.elements[0].elements.push({
      type: "element",
      name: "Relationship",
      attributes: {
        Id: "rId" + imgId,
        Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
        Target: "media/" + baseName,
      },
    });
    this._zipTemplate.file("word/_rels/document.xml.rels", xml.js2xml(result));

    return `${imgId}`;
  }

  public attachImageBuffer(image: Buffer): string | null {
    /* Ensure media folder exists */
    this._zipTemplate.folder("word/media");

    /* Add the image content to the document */
    const baseName = v4() + ".bin";
    this._zipTemplate.file("word/media/" + baseName, image, { binary: true });

    /* Update the document relationship to handle the image */
    const relations: any = this._zipTemplate.file(
      "word/_rels/document.xml.rels"
    );
    const result = xml.xml2js(relations.asText());
    const imgId = result.elements[0].elements.length + 1;
    result.elements[0].elements.push({
      type: "element",
      name: "Relationship",
      attributes: {
        Id: "rId" + imgId,
        Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
        Target: "media/" + baseName,
      },
    });
    this._zipTemplate.file("word/_rels/document.xml.rels", xml.js2xml(result));

    return `${imgId}`;
  }

  /**
   * Get the document defined styles for document
   */
  public getStyles(): any {
    const relations: any = this._zipTemplate.file("word/styles.xml");
    if (!relations) {
      return {
        declaration: {
          attributes: { version: "1.0", encoding: "UTF-8", standalone: "yes" },
        },
        elements: [
          {
            type: "element",
            name: "w:styles",
            attributes: {
              "xmlns:w":
                "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
              "xmlns:w14":
                "http://schemas.microsoft.com/office/word/2010/wordml",
              "xmlns:mc":
                "http://schemas.openxmlformats.org/markup-compatibility/2006",
              "mc:Ignorable": "w14",
            },
            elements: [],
          },
        ],
      };
    }

    const result = xml.xml2js(relations.asText());
    return result;
  }

  /**
   * Store the document defined styles
   */
  public setStyles(styles: any) {
    this._zipTemplate.file("word/styles.xml", xml.js2xml(styles));
  }

  /**
   * Get the document defined numbering document
   */
  public getNumbering(): any {
    const relations: any = this._zipTemplate.file("word/numbering.xml");
    if (!relations) {
      return {
        declaration: {
          attributes: { version: "1.0", encoding: "UTF-8", standalone: "yes" },
        },
        elements: [
          {
            type: "element",
            name: "w:numbering",
            attributes: {
              "xmlns:w":
                "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
              "xmlns:o": "urn:schemas-microsoft-com:office:office",
              "xmlns:r":
                "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
              "xmlns:v": "urn:schemas-microsoft-com:vml",
            },
            elements: [],
          },
        ],
      };
    }

    const result = xml.xml2js(relations.asText());
    return result;
  }

  /**
   * Store the document defined numbering
   */
  public setNumbering(numbering: any) {
    this._zipTemplate.file("word/numbering.xml", xml.js2xml(numbering));
  }

  public getDocument(): any {
    const relations: any = this._zipTemplate.file("word/document.xml");
    const result = xml.xml2js(relations.asText());
    return result;
  }

  /**
   * Store the document defined numbering
   */
  public setDocument(document: any) {
    this._zipTemplate.file("word/document.xml", xml.js2xml(document));
  }

  private getTag(elements: any[], tag: string): any {
    let itr = 0;
    while (itr < elements.length && elements[itr].name !== tag) {
      itr++;
    }
    return itr < elements.length ? elements[itr] : null;
  }

  private loadDimensions() {
    const doc = this.getDocument();
    const props = this.getTag(doc.elements[0].elements[0].elements, "w:sectPr");
    const size = this.getTag(props.elements, "w:pgSz");
    const margins = this.getTag(props.elements, "w:pgMar");
    this._realWidth =
      !size || !size.attributes["w:w"] ? 16840 : size.attributes["w:w"];
    this._realHeight =
      !size || !size.attributes["w:h"] ? 11907 : size.attributes["w:h"];
    if (margins) {
      this._realWidth =
        this._realWidth -
        margins.attributes["w:left"] -
        margins.attributes["w:right"];
      this._realHeight =
        this._realHeight -
        margins.attributes["w:top"] -
        margins.attributes["w:bottom"] -
        margins.attributes["w:header"] -
        margins.attributes["w:footer"];
    }
  }

  public get width(): number {
    return this._realWidth;
  }

  public get height(): number {
    return this._realHeight;
  }

  /**
   * Initialize the DOCX document
   */
  public create(
    input: string,
    attachmentsData: any,
    attachmentsDefinition: any,
    conditionalPart: any,
    settings: any
  ) {
    /* Check for valid filename */
    if (
      !input ||
      !fs.existsSync(
        path.resolve(this._context.getRelativeFileFinder().getFolder(), input)
      )
    ) {
      this._logger.error("Input template file cannot be found", {
        template: path.resolve(
          this._context.getRelativeFileFinder().getFolder(),
          input
        ),
      });
      return;
    }

    // this._logger.debug("Reading DOCX template", { template: input });
    /* Read the zip template DOCX word document */
    const zipTemplateContent = fs.readFileSync(
      path.resolve(this._context.getRelativeFileFinder().getFolder(), input),
      "binary"
    );
    this._zipTemplate = new PizZip(zipTemplateContent);

    /* Open the DOCX word document from the ZIP */
    this._docTemplate = new Docxtemplater()
      .loadZip(this._zipTemplate)
      .setOptions({ delimiters: { start: "$_", end: "_$" } });

    /* Add binary type for images */
    const contentTypes: any = this._zipTemplate.file("[Content_Types].xml");
    const result = xml.xml2js(contentTypes.asText());

    /* Add the required content type for images */
    result.elements[0].elements.push({
      type: "element",
      name: "Default",
      attributes: {
        Extension: "bin",
        ContentType: "application/octet-stream",
      },
    });

    /* Save the content types */
    this._zipTemplate.file("[Content_Types].xml", xml.js2xml(result));
    this.attachmentsData = attachmentsData;
    this.attachmentsDefinition = attachmentsDefinition;
    this.conditionalPart = conditionalPart;
    this.settings = settings;
  }

  /**
   * Replace the markups with the real data
   */
  public async replace(): Promise<string> {
    const zip = this._docTemplate.getZip();

    let prId = 1;

    zip.file(/\.xml$/).forEach((f: any) => {
      let txt = f.asText() + "";

      if (f.name === "word/document.xml") {
        // Add Attachments
        txt = txt.replace(
          new RegExp("<w:sectPr", "g"),
          this.getAttachmentsXML() + "<w:sectPr"
        );

        // Replace Margins
        const newMargin = this.settings.margin;

        if (newMargin) {
          const margins = txt.match(/<w:pgMar.*\/>/g) || [];
          const oldMargin = margins[margins?.length - 1];

          let toInsert = oldMargin;

          if (oldMargin) {
            if (newMargin.top)
              toInsert = toInsert.replace(
                /w:top=".+?"/,
                'w:top="' + Math.round(newMargin.top * 2.54 * 567) + '"'
              );

            if (newMargin.bottom)
              toInsert = toInsert.replace(
                /w:bottom=".+?"/,
                'w:bottom="' + Math.round(newMargin.bottom * 2.54 * 567) + '"'
              );

            if (newMargin.left)
              toInsert = toInsert.replace(
                /w:left=".+?"/,
                'w:left="' + Math.round(newMargin.left * 2.54 * 567) + '"'
              );

            if (newMargin.right)
              toInsert = toInsert.replace(
                /w:right=".+?"/,
                'w:right="' + Math.round(newMargin.right * 2.54 * 567) + '"'
              );

            txt = txt.replace(new RegExp(oldMargin, "g"), toInsert);
          }
        }

        // Replace Size
        const newSz = this.settings.size;

        if (newSz) {
          const szs = txt.match(/<w:pgSz.*\/>/g) || [];
          const oldSz = szs[szs?.length - 1];

          let toInsert = oldSz;

          if (oldSz) {
            if (newSz.height)
              toInsert = toInsert.replace(
                /w:h=".+?"/,
                'w:h="' + Math.round(newSz.height * 2.54 * 567) + '"'
              );

            if (newSz.width)
              toInsert = toInsert.replace(
                /w:w=".+?"/,
                'w:w="' + Math.round(newSz.width * 2.54 * 567) + '"'
              );

            txt = txt.replace(new RegExp(oldSz, "g"), toInsert);
          }
        }

        // Add Headers
        const newHeader = this.settings.header;

        if (newHeader) {
          let zip: PizZip | undefined = undefined;

          if (newHeader.path) {
            const hContent = this.prepareTemplateToImport(newHeader.path, true);
            zip = new PizZip(hContent, { base64: true });
          } else if (newHeader.pageNumber) {
            process.exit();
          }

          if (zip) {
            const hDoc = zip.file("word/document.xml");

            if (!hDoc) {
              this._logger.error(
                "Invalid header template. Template is not a Word document."
              );
              process.exit(-1);
            }

            const hDocXML = hDoc.asText();

            const headerReferences = hDocXML.match(
              /(<w:headerReference).+?\/>/g
            );

            if (headerReferences) {
              for (const headerRef of headerReferences) {
                txt = txt.replace("<w:pgSz", headerRef + "<w:pgSz");
              }
            }
          }
        }

        // Add Footers
        const newFooter = this.settings.footer;

        if (newFooter) {
          let zip: PizZip | undefined = undefined;

          if (newFooter.path) {
            const hContent = this.prepareTemplateToImport(newFooter.path, true);
            zip = new PizZip(hContent, { base64: true });
          } else if (newFooter.pageNumber) {
            process.exit();
          }

          if (zip) {
            const hDoc = zip.file("word/document.xml");

            if (!hDoc) {
              this._logger.error(
                "Invalid footer template. Template is not a Word document."
              );
              process.exit(-1);
            }

            const hDocXML = hDoc.asText();

            const headerReferences = hDocXML.match(
              /(<w:footerReference).+?\/>/g
            );

            if (headerReferences) {
              for (const headerRef of headerReferences) {
                txt = txt.replace("<w:pgSz", headerRef + "<w:pgSz");
              }
            }
          }
        }

        // Replace Oritentaion
        const newOrient = this.settings.orientation;

        if (newOrient) {
          const szs = txt.match(/<w:pgSz.*\/>/g) || [];
          const oldSz = szs[szs?.length - 1];

          let toInsert = oldSz;

          if (oldSz) {
            // Check if orient already exists
            const orients = oldSz.match(/w:orient=".+?"/g) || [];
            const oldOrient = orients[orients?.length - 1];

            if (oldOrient) {
              toInsert = toInsert.replace(
                oldOrient,
                'w:orient="' + newOrient + '"'
              );
            } else {
              toInsert = toInsert.replace(
                "/>",
                ' w:orient="' + newOrient + '" />'
              );
            }

            const widths = oldSz.match(/w:w=".+?"/g) || [];
            const width = parseInt(
              widths[widths?.length - 1].replace('w:w="', "").replace('"', "")
            );

            const heights = oldSz.match(/w:h=".+?"/g) || [];
            const height = parseInt(
              heights[heights?.length - 1].replace('w:h="', "").replace('"', "")
            );

            if (
              (newOrient === "landscape" && width < height) ||
              (newOrient === "portrait" && height < width)
            ) {
              toInsert = toInsert.replace(
                'w:w="' + width + '"',
                'w:w="' + height + '"'
              );

              toInsert = toInsert.replace(
                'w:h="' + height + '"',
                'w:h="' + width + '"'
              );
            }

            txt = txt.replace(new RegExp(oldSz, "g"), toInsert);
          }
        }
      }

      const xml = str2xml(txt);
      const pr = xml.getElementsByTagName("wp:docPr");
      for (let i = 0, len = pr.length; i < len; i++) {
        pr[i].setAttribute("id", prId++);
      }
      const text = xml2str(xml);

      zip.file(f.name, text);
    });

    this.loadDimensions();

    /* Initialize the mappings of replacements */
    const objData: any = {};

    /* Iterate each placeholder */
    let placeholders: IPlaceholders[] = this._context.getPlaceholders().value();
    for (let i = 0; i < placeholders.length; i++) {
      let placeholder = placeholders[i];
      switch (placeholder.type) {
        /* Project fields information */
        case 1:
          /* Add the project field to be replaced into the document */
          objData[placeholder.key] = this._context
            .getProjectFields()
            .value(
              this._context,
              placeholder.key,
              placeholder.shouldWriteLabel || false
            );
          break;

        /* Ready components information */
        case 2:
          /* Add the ready component to be replaced into the document */
          objData[placeholder.key] = await this._context
            .getReadyComponents()
            .value(this._context, placeholder.key);
          break;

        /* Invalid placeholder type */
        default:
          this._logger.error("Invalid placeholder type for key", {
            key: placeholder.key,
          });
      }
    }

    /* Add all formulas */
    this._context.formulas.values.forEach((formula: IFormula) => {
      /* Add the formula to be replaced into the document */
      objData[formula.key] = this._context.formulas.value(
        this._context,
        formula.key
      );
    });

    /* Add the table of content */
    if (this.settings.tableOfContents && this.settings.tableOfContents.key) {
      const toc = new TableOfContent(
        this,
        this.settings.tableOfContents.title || "Table of content",
        this.settings.tableOfContents.level || 2
      );
      toc.fixNumbering();
      toc.fixStyles();
      toc.generateReferences();
      objData[this.settings.tableOfContents.key] = toc.value();
    }

    for (const key in this.conditionalPart) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.conditionalPart.hasOwnProperty(key)) {
        const cond = this.conditionalPart[key];

        if (cond.shouldAdd === false) {
          objData["IF<" + cond.key + ">"] = "#$#$REMOVE_START$#$#";
          objData["ENDIF<" + cond.key + ">"] = "#$#$REMOVE_END$#$#";
        } else {
          objData["IF<" + cond.key + ">"] = "";
          objData["ENDIF<" + cond.key + ">"] = "";
        }
      }
    }

    /* Replace the placeholders markers with the right content */
    this._docTemplate.setData(objData);

    /* Render the document, do the real replace of the markers */
    this._docTemplate.render();

    /* Remove invalid tags */
    let docTxt = zip.file("word/document.xml").asText() + "";
    docTxt = docTxt.replace(new RegExp("%END_TAG%", "g"), ">");
    docTxt = docTxt.replace(new RegExp("%START_TAG%", "g"), "<");
    docTxt = docTxt.replace(new RegExp("%QUOT%", "g"), '"');
    docTxt = docTxt.replace(
      /#\$#\$REMOVE_START\$#\$#[^]+?#\$#\$REMOVE_END\$#\$#/g,
      ""
    );
    zip.file("word/document.xml", docTxt);
    return docTxt;
  }

  public getAttachmentsXML(): string {
    let response = "";

    for (let i = 0; i < this.attachmentsDefinition.length; i++) {
      const element = this.attachmentsDefinition[i];

      const content = this.prepareTemplateToImport(
        path.resolve(
          this._context.getRelativeFileFinder().getFolder(),
          element.path
        )
      );

      // let content = fs.readFileSync(
      //   path.resolve(RelativeFileFinder.getFolder(), element.path),
      //   "binary"
      // );

      const zip = new PizZip(content, { base64: true });

      const doc = new Docxtemplater();
      doc.loadZip(zip).setOptions({ delimiters: { start: "$_", end: "_$" } });

      const data: { [id: string]: string } = {};

      const originalData = this.attachmentsData.find(
        (x) => x.key === element.key
      );

      if (originalData !== null && originalData !== undefined) {
        for (const attData of originalData.values) {
          data[attData.placeholder] = attData.value;
        }
      }

      doc.setData(data);
      doc.render();

      const xml = doc.getZip().file("word/document.xml")?.asText();

      let xmlTemplate = "";

      const templateXml = /<w:body[^>]*>((.|[\n\r])*)<\/w:body>/im.exec(xml);

      if (templateXml && templateXml[0]) {
        xmlTemplate = templateXml[0]
          .replace(new RegExp("<w:body>", "g"), "")
          .replace(new RegExp("</w:body>", "g"), "")
          .replace(/<w:sectPr[^>]*>((.|[\n\r])*)<\/w:sectPr>/im, "");
      }

      response = response + XML.pageBreak() + xmlTemplate;
    }

    return response;
  }

  /**
   * Returns the prepared zip file
   * @param filename The File name
   */
  public prepareTemplateToImport(
    filename: string,
    isHeaderOrFooter?: boolean
  ): any {
    const b64Acc = Date.now().toString();

    this.importedTemplates++;

    const relationsReplacement: { [id: string]: string } = {};

    let relationsToAdd = "";
    let contentTypesToAdd = "";

    const content = fs.readFileSync(
      path.resolve(this._context.getRelativeFileFinder().getFolder(), filename),
      "binary"
    );

    const zip = new PizZip(content);

    /* Add binary type for images */
    const relsFile = zip.file("word/_rels/document.xml.rels");

    if (!relsFile) {
      return zip;
    }

    const rels = relsFile.asText();

    // Copy Images
    const images = rels.match(/<Relationship.+?\/>/g); // images matches

    if (images) {
      for (let i = 0; i < images.length; i++) {
        const imgRel = images[i];

        const id = imgRel
          .match(/Id=".+?"/)![0]
          .replace('Id="', "")
          .replace('"', "");

        const target = imgRel
          .match(/Target=".+?"/)![0]
          .replace('Target="', "")
          .replace('"', "");

        const type = imgRel
          .match(/Type=".+?"/)![0]
          .replace('Type="', "")
          .replace('"', "");

        if (
          /http:\/\/schemas.openxmlformats.org\/officeDocument\/2006\/relationships\/(image|header|footer)/.test(
            type
          ) === false
        ) {
          continue;
        }

        const newId = "rIdImported" + this.importedTemplates + "_" + i;
        const filename = target.match(/[^\/]+$/g);
        let newTarget = target.replace(
          /[^\/]+$/g,
          "T_" + b64Acc + this.importedTemplates + filename![0]
        );

        if (type.endsWith("image")) {
          newTarget = newTarget + ".bin";
        }

        relationsReplacement[id] = newId;

        relationsToAdd += `<Relationship Id="${newId}" Type="${type}" Target="${newTarget}" />`;

        if (type.endsWith("footer")) {
          contentTypesToAdd += `<Override PartName="/word/${newTarget}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml" />`;
        } else if (type.endsWith("header")) {
          contentTypesToAdd += `<Override PartName="/word/${newTarget}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml" />`;
        }

        zip.file(/\.xml$/).forEach(function (f: any) {
          let txt = f.asText() + "";
          for (const key in relationsReplacement) {
            // eslint-disable-next-line no-prototype-builtins
            if (relationsReplacement.hasOwnProperty(key)) {
              const element = relationsReplacement[key];
              txt = txt.replace(
                new RegExp('="' + key + '"', "g"),
                '="' + element + '"'
              );
            }
          }
          zip.file(f.name, txt);
        });

        // Copy image to current template
        const oldFile = zip.file("word/" + target);

        if (oldFile) {
          const bin = oldFile.asBinary();

          this._zipTemplate.file("word/" + newTarget, bin, {
            binary: true,
          });
        }

        // Copy the _rels file
        if (isHeaderOrFooter) {
          const oldRels = zip.file("word/_rels/" + filename![0] + ".rels");
          if (oldRels) {
            let bin = oldRels.asText();
            const matches = bin.match(/Target=".+?"/g);
            if (matches) {
              for (let i = 0; i < matches.length; i++) {
                const relMatch = matches[i];
                const oldPath = relMatch
                  .replace('Target="', "")
                  .replace('"', "");
                const newTxt = relMatch.replace(
                  /[^\/]+?\.[^\"]+/,
                  "T_" + b64Acc + this.importedTemplates + "$&.bin"
                );
                const newPath = newTxt.replace('Target="', "").replace('"', "");
                bin = bin.replace(relMatch, newTxt);
                // Copy assets
                const oldAssetFile = zip.file("word/" + oldPath);
                if (oldAssetFile) {
                  const assetBin = oldAssetFile.asBinary();
                  this._zipTemplate.file("word/" + newPath, assetBin, {
                    binary: true,
                  });
                }
              }
            }
            this._zipTemplate.file(
              "word/_rels/" +
                "T_" +
                b64Acc +
                this.importedTemplates +
                filename![0] +
                ".rels",
              bin
            );
          }
        }
      }
    }

    const oldRelations = this._zipTemplate.file("word/_rels/document.xml.rels");

    if (oldRelations) {
      const txt = oldRelations.asText();

      const newTxt = txt.replace(
        "</Relationships>",
        relationsToAdd + "</Relationships>"
      );

      this._zipTemplate.file("word/_rels/document.xml.rels", newTxt);
    }

    const oldCTypes = this._zipTemplate.file("[Content_Types].xml");

    if (oldCTypes) {
      const txt = oldCTypes.asText();

      const newTxt = txt.replace("</Types>", contentTypesToAdd + "</Types>");

      this._zipTemplate.file("[Content_Types].xml", newTxt);
    }

    /* Save the content types */
    // zip.file("word/_rels/document.xml.rels", rels);

    return zip.generate({ type: "base64" });
  }

  /**
   * Save the result to a new DOCX word document
   */
  public getSaveParams() {
    const fileName = v4() + ".docx";
    const outputBuffer = this._docTemplate
      .getZip()
      .generate({ type: "nodebuffer", compression: "DEFLATE" });
    return { buffer: outputBuffer, fileName };
  }
}
