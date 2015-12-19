import { FIELD_TYPES } from "./Types";
import Joi from "joi";
import { Context } from "../context";
import Logger from "../logger";

/**
 * Items structure data type
 */
export interface IItemsStruct {
  techName: string;
  label: string;
  type: number;
  format?: string;
  required?: boolean;
}

/**
 * Items structure data handler
 */
export class ItemsStruct {
  private _itemsStruct: IItemsStruct[];
  private _fieldsMap: Map<string, IItemsStruct>;
  private _logger;

  constructor() {
    this._itemsStruct = [];
    this._fieldsMap = new Map();
    this._logger = new Logger("ItemsStruct");
  }

  /**
   * Load the project fields from JSON file
   */
  public static loadData(context: Context, data: any) {
    context.getItemsStruct().validate(data);
  }

  /**
   * Validate the items structure data
   */
  public validate(itemsStruct: IItemsStruct[]) {
    const validator = Joi.object({
      techName: Joi.string().required(),
      label: Joi.string().required(),
      type: Joi.number().integer().required(),
      required: Joi.boolean(),
      format: Joi.string()
    }).options({ allowUnknown: true });

    /* Iterate each value */
    (itemsStruct || []).forEach((dataValue: IItemsStruct) => {
      /* Validate the object data type */
      const { error, value } = validator.validate(dataValue);
      if (error) {
        this._logger.error("There is an error inside the items structure definition", {
          item: dataValue,
          error: error
        });
        process.exit(-1);
      }

      /* Add the transformed data */
      this._itemsStruct.push(value);
      this._fieldsMap.set(value.techName, value);
    });
  }

  /**
   * Prepare the item validator
   */
  public get itemValidator(): Joi.ObjectSchema {
    const rules: any = {};

    /* Iterate each file structure definition */
    this._itemsStruct.forEach((struct: IItemsStruct) => {
      switch (struct.type) {
        /* String field */
        case FIELD_TYPES.STRING:
        case FIELD_TYPES.TEXT_AREA:
          if (struct.required) {
            rules[struct.techName] = Joi.string().required();
          } else {
            rules[struct.techName] = Joi.string();
          }
          break;

        case FIELD_TYPES.NUMBER:
        case FIELD_TYPES.DATE:
          if (struct.required) {
            rules[struct.techName] = Joi.number().required();
          } else {
            rules[struct.techName] = Joi.number();
          }
          break;
        case FIELD_TYPES.DROPDOWN:
        case FIELD_TYPES.PICTURE:
          if (struct.required) {
            rules[struct.techName] = Joi.array().required();
          } else {
            rules[struct.techName] = Joi.array();
          }
          break;
        case FIELD_TYPES.EXPRESSION:
          if (struct.required) {
            rules[struct.techName] = Joi.alternatives(
              Joi.string().required(),
              Joi.number().required()
            );
          } else {
            rules[struct.techName] = Joi.alternatives(Joi.string(), Joi.number());
          }
          break;
        default:
          this._logger.error("Invalid field type", { field: struct });
      }
    });
    /* Add the rules to the validator */
    return Joi.object(rules).options({ allowUnknown: true });
  }

  /**
   * Get the field structure
   */
  public value(field: string): IItemsStruct | null {
    /* Filter the items structure by the field name */
    const itemsStruct: IItemsStruct[] = this._itemsStruct.filter((keyValue: IItemsStruct) => {
      return keyValue.techName === field;
    });

    /* Check if a valid item struct was found */
    if (!itemsStruct || itemsStruct.length !== 1) {
      this._logger.error("Invalid field item struct for key", { key: field });
      return { techName: field, label: field, type: FIELD_TYPES.STRING };
    }

    return itemsStruct[0];
  }

  public getHeader(techName: any) {
    return this._fieldsMap.get(techName)?.label || techName;
  }
}
