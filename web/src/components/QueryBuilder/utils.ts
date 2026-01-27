import type { RuleGroupType } from 'react-querybuilder';

export const removeEmptyRules = (query: RuleGroupType): RuleGroupType => {
  const filterRules = (rules: RuleGroupType['rules']): RuleGroupType['rules'] => rules
    .map(rule => 'combinator' in rule ?
      { ...rule, rules: filterRules(rule.rules) }
      : rule
    )
    .filter(rule => 'combinator' in rule ?
      rule.rules.length > 0
      : (rule.value !== '' && rule.value != null) || ['null', 'notNull'].includes(rule.operator)
    );
  return { ...query, rules: filterRules(query.rules) };
};

export const countActiveRules = (rules: RuleGroupType['rules']): number => {
  return rules.reduce((count, rule) => {
    if ('combinator' in rule) {
      return count + countActiveRules(rule.rules); // Recursive case: it's a group
    }
    return count + (rule.value !== '' && rule.value != null ? 1 : 0); // Base case: it's a rule, count if value is non-empty
  }, 0);
};
