import Joi from "joi";
import { Context } from "../context";
import Logger from "../logger";

export interface IConditionalItem {
  type?: "ABOVE" | "EQUALS" | "CONTAINS" | "UNDER" | "ALL";
  value?: any;
  field?: string;
}

export interface IStyleDefinition {
  value: any;
  conditionType: "ABOVE" | "EQUALS" | "CONTAINS" | "UNDER" | "ALL";
  conditionValue?: any;
}

export interface IBasicStylingObject {
  textColor: IStyleDefinition[];
  textSize: IStyleDefinition[];
  textUnderline: IStyleDefinition[];
  textBold: IStyleDefinition[];
  bgColor: IStyleDefinition[];
}

export interface IColumnStylingObject {
  field: string;
  width?: number;
  header?: IBasicStylingObject;
  body?: IBasicStylingObject;
}

export interface ICellBorderStyle {
  width: number;
  color: string;
  condition: IConditionalItem;
}

export interface ITableBorderStyle {
  type: "ALL" | "TOP" | "BOTTOM" | "RIGHT" | "LEFT";
  width: number;
  color: string;
}

export interface ITableStylingObject {
  repeatHeader?: boolean;
  fixedWidth?: number;
  rowHeight?: number;
  align?: "right" | "center" | "left";
  columnStyle?: IColumnStylingObject[];
  cellBorder?: ICellBorderStyle[];
  tableBorder?: ITableBorderStyle[];
}

export interface IFieldStylingObject {
  field: string;
  shouldShowLabel?: boolean;
  style?: IBasicStylingObject;
}

export interface IListStylingObject {
  fieldsStyle?: IFieldStylingObject[];
}

/**
 * Project fields data type
 */
export interface IStyleFields {
  key: string;
  style?: IBasicStylingObject | ITableStylingObject;
}

/**
 * Project field data handler
 */
export class StyleFields {
  private _styleFields: IStyleFields[];
  private _logger;

  private _values: {
    [key: string]: any;
  };

  constructor() {
    this._styleFields = [];
    this._values = {};
    this._logger = new Logger("StyleFields");
  }

  /**
   * Load the project fields from JSON file
   */
  public static loadData(context: Context, data: any) {
    context.getStyleFields().validate(data);
  }

  /**
   * Validate the project fields data
   */
  public validate(projectFields: IStyleFields[]) {
    /* Iterate each value */
    (projectFields || []).forEach((dataValue: IStyleFields) => {
      /* Prepare the validator fields */
      const validatorFields: any = {
        key: Joi.string().required(),
        style: Joi.required()
      };

      /* Initialize the JOI validator */
      const validator = Joi.object(validatorFields);

      /* Validate the object data type */
      const { error, value } = validator.validate(dataValue);
      if (error) {
        this._logger.error("There is an error inside the project field definition", {
          definition: dataValue,
          error: error
        });
        process.exit(-1);
      }

      /* Add the transformed data */
      this._styleFields.push(value);
    });
  }

  /**
   * Get the key value for the project field
   */
  public value(key: string): IStyleFields | undefined {
    /* Filter the project fields by the placeholder key */
    const projectsFields: IStyleFields[] = this._styleFields.filter((keyValue: IStyleFields) => {
      return keyValue.key === key;
    });

    /* Check if a valid project was found */
    if (!projectsFields || projectsFields.length !== 1) {
      return undefined;
    }

    return projectsFields[0];
  }
}
