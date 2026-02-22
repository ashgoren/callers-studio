import { formatQuery, type RuleGroupType, type RuleType } from 'react-querybuilder';

const resolveFieldValue = (row: any, field: string): any => {
  // Explicit mappings for junction-table relation fields whose names don't match row properties
  switch (field) {
    case 'choreographerNames':
      return row.dances_choreographers?.map((dc: any) => dc.choreographer.name).join(' ') ?? '';
    case 'keyMoveNames':
      return row.dances_key_moves?.map((dkm: any) => dkm.key_move.name).join(' ') ?? '';
    case 'vibeNames':
      return row.dances_vibes?.map((dv: any) => dv.vibe.name).join(' ') ?? '';
    case 'programNames':
      return row.programs_dances?.map((pd: any) => `${pd.program.date} ${pd.program.location}`).join(' ') ?? '';
  }

  const value = row[field];

  // Generic: FK lookup objects with a name property (dance_type, formation, progression, etc.)
  if (value && typeof value === 'object' && !Array.isArray(value) && 'name' in value) {
    return value.name;
  }

  return value;
};

const evaluateRule = (row: any, rule: RuleType): boolean => {
  const { field, operator, value: filterValue } = rule;
  const value = resolveFieldValue(row, field);

  const compareDates = (value: string, filterValue: string, operator: string): boolean => {
    const toUTCDateString = (d: Date) => d.toISOString().split('T')[0];

    const rowDate = toUTCDateString(new Date(value));
    const filterDate = filterValue.split(',')[0].trim(); // already YYYY-MM-DD

    try {
      switch (operator) {
        case '=': return rowDate === filterDate;
        case '!=': return rowDate !== filterDate;
        case '>': return rowDate > filterDate;
        case '>=': return rowDate >= filterDate;
        case '<': return rowDate < filterDate;
        case '<=': return rowDate <= filterDate;
        case 'between': {
          const parts = filterValue.split(',');
          const start = toUTCDateString(new Date(parts[0].trim()));
          const end = parts[1] ? toUTCDateString(new Date(parts[1].trim())) : start;
          return rowDate >= start && rowDate <= end;
        }
        case 'notBetween': {
          const parts = filterValue.split(',');
          const start = toUTCDateString(new Date(parts[0].trim()));
          const end = parts[1] ? toUTCDateString(new Date(parts[1].trim())) : start;
          return rowDate < start || rowDate > end;
        }
        default: return false;
      }
    } catch (error) {
      console.error('Error comparing dates:', error);
      return false;
    }
  };

  if (isDateField(field) && filterValue) {
    return compareDates(value, filterValue, operator);
  }

  if (
    (filterValue === '' || filterValue == null) &&
    !['null', 'notNull'].includes(operator)
  ) {
    return true;
  }

  const downcasedValue = typeof value === 'string' ? value.toLowerCase() : value;
  const downcasedFilterValue = typeof filterValue === 'string' ? filterValue.toLowerCase() : filterValue;

  switch (operator) {
    case '=':
      if (filterValue === 'true') return value === true || String(value).toLowerCase() === 'true';
      if (filterValue === 'falsey') return !value || value === '' || String(value).toLowerCase() === 'false';
      return downcasedValue == downcasedFilterValue;
    case '!=':
      if (filterValue === 'true') return !(value === true || String(value).toLowerCase() === 'true');
      if (filterValue === 'falsey') return !(!value || value === '' || String(value).toLowerCase() === 'false');
      return downcasedValue != downcasedFilterValue;
    case 'contains': return downcasedValue?.includes(downcasedFilterValue);
    case 'beginsWith': return downcasedValue?.startsWith(downcasedFilterValue);
    case 'endsWith': return downcasedValue?.endsWith(downcasedFilterValue);
    case 'doesNotContain': return !downcasedValue?.includes(downcasedFilterValue);
    case 'doesNotBeginWith': return !downcasedValue?.startsWith(downcasedFilterValue);
    case 'doesNotEndWith': return !downcasedValue?.endsWith(downcasedFilterValue);
    case '>': return Number(value) > Number(filterValue);
    case '>=': return Number(value) >= Number(filterValue);
    case '<': return Number(value) < Number(filterValue);
    case '<=': return Number(value) <= Number(filterValue);
    case 'null': return value === null || value === undefined || value === '';
    case 'notNull': return value !== null && value !== undefined && value !== '';
    case 'between': {
      const [min, max] = String(filterValue).split(',').map(Number);
      return Number(value) >= min && Number(value) <= max;
    };
    case 'notBetween': {
      const [min, max] = String(filterValue).split(',').map(Number);
      return Number(value) < min || Number(value) > max;
    };
    case 'in': {
      const values = String(filterValue).split(',').map(v => v.trim().toLowerCase());
      return values.includes(String(value).toLowerCase());
    };
    case 'notIn': {
      const values = String(filterValue).split(',').map(v => v.trim().toLowerCase());
      return !values.includes(String(value).toLowerCase());
    };
    default: return true;
  }
};

export const evaluateQuery = (row: any, query: RuleGroupType): boolean => {
  try {
    const { combinator, rules } = query;
    if (!rules.length) return true;

    const results = rules.map((rule) =>
      'combinator' in rule ? evaluateQuery(row, rule) : evaluateRule(row, rule)
    );

    return combinator === 'and' ? results.every(Boolean) : results.some(Boolean);
  } catch (error) {
    console.error(`Error evaluating query ${formatQuery(query, 'sql')}:`, error);
    return true;
  }
};

const isDateField = (fieldName: string): boolean => {
  const dateFields = ['createdAt', 'updatedAt', 'date'];
  return dateFields.includes(fieldName);
};
