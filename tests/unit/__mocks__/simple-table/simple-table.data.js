const items = [
  {
    DROPDOWN0: ["abc"],
    DROPDOWN1: ["hi", "hello"],
    NUMBER0: 1,
    NUMBER1: 5,
    DATE0: 342,
    PICTURE0: ["dummy.jpg"],
    TEXT1: "Hello every one",
    EXPRESSION0: "420-1*2+NUMBER0",
    TEXTAREA: "Hi what's up?",
    TEXT2: "a"
  },
  {
    DROPDOWN0: ["How", "Are", "you"],
    DROPDOWN1: ["hi"],
    NUMBER0: 2,
    NUMBER1: 5,
    DATE0: 122221222,
    PICTURE0: ["dummy.jpg"],
    TEXT1: "hi all",
    EXPRESSION0: "2+2",
    TEXTAREA: "Hi what's up?",
    TEXT2: "ab"
  },
  {
    DROPDOWN0: ["Hello"],
    DROPDOWN1: ["hi", "hello"],
    NUMBER0: 3,
    NUMBER1: 10,
    DATE0: 12,
    PICTURE0: ["dummy.jpg"],
    TEXT1: "hello",
    EXPRESSION0: "2+2",
    TEXTAREA: "Hi what's up?",
    TEXT2: "af"
  },
  {
    DROPDOWN0: ["Hello"],
    DROPDOWN1: ["זה זמן לבדוק אם זה פועל או לאת, בוא נראה ", "hello"],
    NUMBER0: 4,
    NUMBER1: 10,
    DATE0: 12,
    PICTURE0: ["dummy.jpg"],
    TEXT1: "hello",
    EXPRESSION0: "2+2",
    TEXTAREA: "Hi, how are you my man?",
    TEXT2: "C"
  },
];

const reportDefinition = {
  general: {
    templatePath: "template.docx",
  },
  placeholderMetadata: [
    {
      key: "table",
      type: 2,
    },
  ],
  readyComponents: [
    {
      fieldsToShow: ["NUMBER0", "TEXT1", "DROPDOWN1", "DATE0", "EXPRESSION0", "TEXTAREA", "PICTURE0"],
      key: "table",
      type: 1,
      sortByField: "NUMBER0",
      sortByDirection: "desc",
    },
  ],
};

const reportParams = {
  projectFields: [],
  conditionalParts: [],
  attachments: [],
};
const itemFieldsStruct = [
    {
      "techName": "DROPDOWN0",
      "label": "Dropdown",
      "type": 5
    },
    {
      "techName": "NUMBER0",
      "label": "Numeric 2",
      "type": 1
    },
    {
      "techName": "NUMBER1",
      "label": "How many?",
      "type": 1
    },
    {
      "techName": "DATE0",
      "label": "Due date",
      "type": 3
    },
    {
      "techName": "DROPDOWN1",
      "label": "Where",
      "type": 5
    },
    {
      "techName": "TEXT1",
      "label": "Name",
      "type": 0
    },
    {
      "techName": "TEXT2",
      "label": "Group",
      "type": 0
    },
    {
      "techName": "EXPRESSION0",
      "label": "Calc",
      "type": 4
    },
    {
      "techName": "TEXTAREA",
      "label": "Long one",
      "type": 6
    },
    {
      "techName": "PICTURE0",
      "label": "The image",
      "type": 2
    }
  ]
  

const testData = {
  items,
  reportDefinition,
  reportParams,
  itemFieldsStruct,
  templatesPath: "simple-table/templates",
};

module.exports = testData;
