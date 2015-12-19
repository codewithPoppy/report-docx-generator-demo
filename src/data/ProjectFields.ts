import { FIELD_TYPES } from "./Types";
import { DataType } from "./types/DataType";
import Joi from "joi";
import { Context } from "../context";
import Logger from "../logger";

/**
 * Project fields data type
 */
export interface IProjectFields {
  key: string;
  label?: string;
  type?: number;
  format?: string;
  value?: any;
}

/**
 * Project field data handler
 */
export class ProjectFields {
  private _projectFields: IProjectFields[];
  private _logger;

  private _values: {
    [key: string]: any;
  };

  constructor() {
    this._projectFields = [];
    this._values = {};
    this._logger = new Logger("ProjectFields");
  }

  /**
   * Load the project fields from JSON file
   */
  public static loadData(context: Context, data: any) {
    context.getProjectFields().validate(data);
  }

  /**
   * Validate the project fields data
   */
  public validate(projectFields: IProjectFields[]) {
    /* Iterate each value */
    (projectFields || []).forEach((dataValue: IProjectFields) => {
      /* Prepare the validator fields */
      const validatorFields: any = {
        key: Joi.string().required(),
        label: Joi.string().required(),
        type: Joi.number().integer().default(0),
        format: Joi.string()
      };

      /* Custom value data type */
      switch (dataValue.type) {
        case FIELD_TYPES.STRING:
        case FIELD_TYPES.PICTURE:
        case FIELD_TYPES.EXPRESSION:
          validatorFields["value"] = Joi.string().required();
          break;

        case FIELD_TYPES.NUMBER:
        case FIELD_TYPES.DATE:
          validatorFields["value"] = Joi.number().required();
          break;

        default:
          validatorFields["value"] = Joi.string().required();
      }

      /* Initialize the JOI validator */
      const validator = Joi.object(validatorFields);

      /* Validate the object data type */
      const { error, value } = validator.validate(dataValue);
      if (error) {
        this._logger.error("There is an error inside the project field definition", {
          item: dataValue,
          error: error
        });
        process.exit(-1);
      }

      /* Add the transformed data */
      this._projectFields.push(value);
    });

    this._projectFields.forEach((element) => {
      this._values[element.key] = element.value;
    });
  }

  /**
   * Get the key value for the project field
   */
  public value(context: Context, key: string, shouldWriteLabel: boolean): string {
    /* Filter the project fields by the placeholder key */
    const projectsFields: IProjectFields[] = this._projectFields.filter(
      (keyValue: IProjectFields) => {
        return keyValue.key === key;
      }
    );

    /* Check if a valid project was found */
    if (!projectsFields || projectsFields.length !== 1) {
      this._logger.error("Invalid project fields for key", { key: key });
      return "";
    }

    return (
      (shouldWriteLabel ? projectsFields[0].label + ": " : "") +
      DataType.getData(
        context,
        projectsFields[0].type || 0,
        projectsFields[0],
        this._values,
        key,
        []
      )
    );
  }
}
