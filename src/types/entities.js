/**
 * @typedef {import('./language.js').Language[keyof import('./language.js').Language]} LanguageValue
 * @typedef {import('./checkItem.js').CheckItem[keyof import('./checkItem.js').CheckItem]} CheckItemValue
 * @typedef {import('./queryIssue.js').QueryIssue[keyof import('./queryIssue.js').QueryIssue]} QueryIssueValue
 * @typedef {import('./runStatus.js').RunStatus[keyof import('./runStatus.js').RunStatus]} RunStatusValue
 * @typedef {string | number | null} Cell
 */

/**
 * Its texts live in the translations, under `levels.<id>`. The `{{key}}` placeholders in its code are comments,
 * translated under `codeComments.<key>`.
 * A level with a `table` changes the data: the check reads that whole table after the query.
 * @typedef {Object} Level
 * @property {string} id
 * @property {string} concept
 * @property {string} [example]
 * @property {string} sql
 * @property {string} solution
 * @property {boolean} [ordered]
 * @property {string} [table]
 */

/**
 * @typedef {Object} ResultSet
 * @property {string[]} columns
 * @property {Cell[][]} rows
 */

/**
 * `message` is SQLite's own error message, `changes` the number of rows changed by the query.
 * @typedef {Object} QueryRun
 * @property {RunStatusValue} status
 * @property {ResultSet} [result]
 * @property {number} [changes]
 * @property {string} [message]
 */

/**
 * @typedef {Object} Issue
 * @property {QueryIssueValue} type
 * @property {number} [count]
 * @property {string[]} [columns]
 */

/**
 * `pending` when it can only be checked once the items before it are right.
 * @typedef {Object} CheckEntry
 * @property {CheckItemValue} name
 * @property {boolean} ok
 * @property {boolean} [pending]
 * @property {Issue[]} issues
 */

/**
 * `matches[i]` tells whether the i-th row of the student's result is one of the expected rows.
 * @typedef {Object} CheckResult
 * @property {boolean} done
 * @property {number} passed
 * @property {number} total
 * @property {CheckEntry[]} items
 * @property {boolean[]} matches
 */

/**
 * @typedef {Object} TableColumn
 * @property {string} name
 * @property {string} type
 */

/**
 * @typedef {Object} ShopTable
 * @property {string} name
 * @property {TableColumn[]} columns
 * @property {ResultSet} data
 */

/**
 * @typedef {Object} Progress
 * @property {number} current
 * @property {string[]} completed
 * @property {Record<string, string>} code
 * @property {Record<string, number>} hints
 */

export {}
