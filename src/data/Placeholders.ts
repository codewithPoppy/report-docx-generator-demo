import Joi from "joi";
import { Context } from "../context";
import Logger from "../logger";

/**
 * Placeholders data type
 */
export interface IPlaceholders {
  key: string;
  shouldWriteLabel?: boolean;
  type: number;
}

/**
 * Placeholders data handler
 */
export class Placeholders {
  private _placeholders: IPlaceholders[];
  private _logger;

  constructor() {
    this._placeholders = [];
    this._logger = new Logger("Placeholders");
  }

  /**
   * Load the project fields from JSON file
   */
  public static loadData(context: Context, data: any) {
    context.getPlaceholders().validate(data);
  }

  /**
   * Validate the placeholders data
   */
  public validate(placeholders: IPlaceholders[]) {
    const validator = Joi.object({
      key: Joi.string().required(),
      shouldWriteLabel: Joi.boolean(),
      type: Joi.number().integer().required()
    });

    /* Iterate each value */
    (placeholders || []).forEach((dataValue: IPlaceholders) => {
      /* Validate the object data type */
      const { error, value } = validator.validate(dataValue);
      if (error) {
        this._logger.error("There is an error inside the placeholders definition", {
          item: dataValue,
          error: error
        });
        process.exit(-1);
      }

      /* Add the transformed data */
      this._placeholders.push(value);
    });
  }

  /**
   * Get the placeholders
   */
  public value(): IPlaceholders[] {
    return this._placeholders;
  }
}
