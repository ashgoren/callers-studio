import type { RuleGroupType } from 'react-querybuilder';

export const combinators = [
  { name: 'and', label: 'ALL of these (AND)' },
  { name: 'or', label: 'ANY of these (OR)' },
];

export const defaultQuery: RuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'title', operator: 'contains', value: '' }],
};

export const operators = [
  { name: 'contains', label: 'contains' },
  { name: 'doesNotContain', label: 'does not contain' },
  { name: 'beginsWith', label: 'begins with' },
  { name: 'doesNotBeginWith', label: 'does not begin with' },
  { name: 'endsWith', label: 'ends with' },
  { name: 'doesNotEndWith', label: 'does not end with' },
  { name: '=', label: '=' },
  { name: '!=', label: '≠' },
  { name: '<', label: '<' },
  { name: '<=', label: '≤' },
  { name: '>', label: '>' },
  { name: '>=', label: '≥' },
  { name: 'between', label: 'between' },
  { name: 'notBetween', label: 'not between' },
  { name: 'null', label: 'is empty' },
  { name: 'notNull', label: 'is present' },
  { name: 'in', label: 'in' },
  { name: 'notIn', label: 'not in' },
];

export const operatorPairs: Record<string, string> = {
  '=': '!=',
  '!=': '=',
  'contains': 'doesNotContain',
  'doesNotContain': 'contains',
  'beginsWith': 'doesNotBeginWith',
  'doesNotBeginWith': 'beginsWith',
  'endsWith': 'doesNotEndWith',
  'doesNotEndWith': 'endsWith',
  'in': 'notIn',
  'notIn': 'in',
  'between': 'notBetween',
  'notBetween': 'between',
  'null': 'notNull',
  'notNull': 'null',
};

export const negativeOperators = ['!=', 'doesNotContain', 'doesNotBeginWith', 'doesNotEndWith', 'notIn', 'notBetween', 'null'];

export const textOperators = ['=', '!=', 'contains', 'doesNotContain', 'beginsWith', 'doesNotBeginWith', 'endsWith', 'doesNotEndWith', 'null', 'notNull'];
export const numberOperators = ['=', '!=', '>', '>=', '<', '<=', 'between', 'notBetween', 'null', 'notNull'];
export const booleanOperators = ['=', '!='];
