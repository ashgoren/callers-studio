import type { Field, RuleGroupType } from 'react-querybuilder';

export type QueryBuilderComponentProps = {
  fields: Field[];
  query: RuleGroupType;
  onQueryChange: (query: RuleGroupType) => void;
};
