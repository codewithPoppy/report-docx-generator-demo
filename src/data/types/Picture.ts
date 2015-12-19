import * as path from "path";
import { imageSize } from "image-size";
import { Context } from "../../context";
import { XML } from "../../word/XML";

/**
 * Class to resolve picture type value
 */
export class Picture {
  private _mapping: any;

  constructor() {
    this._mapping = {};
  }

  public value(context: Context, obj: any) {
    let response = "";
    if (!obj["value"]) {
      return "";
    }

    const images = obj["value"];
    if (!Array.isArray(images) || images.length === 0) {
      return "";
    }

    const imageToInsert = images[0];
    /* Check if the image is already added to the document */
    if (imageToInsert && !this._mapping[imageToInsert]) {
      const imgId = context.getTemplater().attachImage(imageToInsert);
      if (imgId) {
        this._mapping[imageToInsert] = imgId;
      }
    }

    /* Set the image to view into the document */
    if (this._mapping[imageToInsert]) {
      const dimensions = imageSize(
        path.resolve(path.join(context.getTemplater().imgPath, imageToInsert))
      );
      response += XML.addImage(
        this._mapping[imageToInsert],
        dimensions.width || 120,
        dimensions.height || 120,
        obj["title"]
      );
    }

    return response;
  }
}
