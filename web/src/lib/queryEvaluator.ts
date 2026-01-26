import type { RuleGroupType, RuleType } from 'react-querybuilder';

const evaluateRule = (row: any, rule: RuleType): boolean => {
  const value = row[rule.field];
  const filterValue = rule.value;
  if (filterValue === '' || filterValue == null) return true;

  const downcasedValue = typeof value === 'string' ? value.toLowerCase() : value;
  const downcasedFilterValue = typeof filterValue === 'string' ? filterValue.toLowerCase() : filterValue;

  switch (rule.operator) {
    case '=': return downcasedValue == downcasedFilterValue;
    case '!=': return downcasedValue != downcasedFilterValue;
    case 'contains': return downcasedValue.includes(downcasedFilterValue);
    case 'beginsWith': return downcasedValue.startsWith(downcasedFilterValue);
    case 'endsWith': return downcasedValue.endsWith(downcasedFilterValue);
    case '>': return Number(value) > Number(filterValue);
    case '>=': return Number(value) >= Number(filterValue);
    case '<': return Number(value) < Number(filterValue);
    case '<=': return Number(value) <= Number(filterValue);
    case 'null': return value == null || value === '';
    case 'notNull': return value != null && value !== '';
    default: return true;
  }
};

export const evaluateQuery = (row: any, query: RuleGroupType): boolean => {
  const { combinator, rules } = query;
  if (!rules.length) return true;

  const results = rules.map((rule) =>
    'combinator' in rule ? evaluateQuery(row, rule) : evaluateRule(row, rule)
  );

  return combinator === 'and' ? results.every(Boolean) : results.some(Boolean);
};