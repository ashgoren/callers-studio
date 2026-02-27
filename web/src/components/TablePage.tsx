import { useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Fab, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTable } from '@/hooks/useTable';
import { QueryBuilderComponent } from '@/components/QueryBuilder';
import { TableControls } from '@/components/TableControls';
import { useNavigate } from 'react-router';
import { Spinner, ErrorMessage } from '@/components/shared';
import { countActiveRules } from '@/components/QueryBuilder/utils';
import type { MRT_RowData, MRT_ColumnDef, MRT_TableOptions } from 'material-react-table';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { MODEL_PATHS } from '@/lib/paths';
import type { PrimaryModel } from '@/lib/types/database';

export const TablePage = <TData extends MRT_RowData & { id: number }>({ model, useData, columns, queryFields, defaultQuery, tableInitialState }: {
  model: PrimaryModel;
  useData: () => { data: TData[] | undefined; error: unknown; isLoading: boolean; };
  columns: MRT_ColumnDef<TData>[];
  queryFields: Field[];
  defaultQuery: RuleGroupType;
  tableInitialState?: MRT_TableOptions<TData>['initialState'];
}) => {
  const navigate = useNavigate();
  const basePath = MODEL_PATHS[model];

  const onRowClick = (row: TData) => navigate(`${basePath}/${row.id}`);

  const { data, error, isLoading } = useData();
  const { table, query, setQuery } = useTable<TData>({
    model,
    data,
    columns,
    defaultQuery,
    tableInitialState,
    onRowClick,
  });

  const [filterOpen, setFilterOpen] = useState(countActiveRules(query.rules) > 0);

  const onClearFilters = () => {
    setQuery(defaultQuery);
    setFilterOpen(false);
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <>
      <TableControls
        model={model}
        query={query}
        setFilterOpen={setFilterOpen}
        onClearFilters={onClearFilters}
      />

      <QueryBuilderComponent
        fields={queryFields}
        defaultQuery={defaultQuery}
        query={query}
        onQueryChange={setQuery}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
      />

      <MaterialReactTable table={table} />

      <Tooltip title={`Add ${model}`} placement='left'>
        <Fab
          color='secondary'
          onClick={() => navigate(`${basePath}/new`)}
          sx={{ position: 'fixed', bottom: 32, right: 32 }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </>
  );
};
