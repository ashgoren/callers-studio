import { ExternalLink } from '@/components/shared';
import { TooltipCell } from '@/components/TooltipCell';
import { CellLinkedPrograms } from './CellLinkedPrograms';
import type { MRT_ColumnDef } from 'material-react-table'
import type { Dance, DanceInsert } from '@/lib/types/database';
import '@tanstack/react-table';

// NEW RECORD CONFIG

export const newRecord: DanceInsert = {
  title: '',
  choreographer: '',
  difficulty: null,
  notes: '',
  place_in_program: '',
  moves: '',
  swing_16: null,
  url: '',
  video: '',
};


// TABLE CONFIG

export const columns: MRT_ColumnDef<Dance>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    Cell: ({row}) => linkTitle(row.original.title, row.original.url),
    size: 250,
    minSize: 100,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    enableColumnFilter: false,
    size: 120,
    minSize: 55,
  },
  {
    accessorKey: 'choreographer',
    header: 'Choreographer',
    size: 200,
    minSize: 170,
  },
  {
    accessorKey: 'difficulty',
    header: 'Difficulty',
    size: 150,
    minSize: 50,
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    size: 300,
    minSize: 120,
    filterFn: 'includesString',
    Cell: ({ row }) => row.original.notes ? <TooltipCell content={row.original.notes} /> : null,
    muiTableBodyCellProps: {
      sx: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    },
  },
  {
    accessorKey: 'place_in_program',
    header: 'Place in Program',
    size: 250,
    minSize: 150,
    filterFn: 'includesString',
    Cell: ({ row }) => row.original.place_in_program ? <TooltipCell content={row.original.place_in_program} /> : null,
  },
  {
    accessorKey: 'moves',
    header: 'Moves',
    size: 200,
    minSize: 120,
    filterFn: 'includesString',
    Cell: ({ row }) => row.original.moves ? <TooltipCell content={row.original.moves} /> : null,
  },
  {
    accessorKey: 'swing_16',
    header: '16-beat swing?',
    size: 200,
    minSize: 120,
    filterFn: 'equalsString',
    Cell: ({ row }) => row.original.swing_16 ? 'true' : row.original.swing_16 === false ? 'false' : '',
  },
  {
    accessorKey: 'video',
    header: 'Video',
    Cell: ({ row }) => linkVideo(row.original.video),
    enableColumnFilter: false,
    enableSorting: false,
    size: 120,
    minSize: 50,
  },
  {
    id: 'programs',
    header: '🔗 Programs',
    Cell: ({ row }) => <CellLinkedPrograms programsDances={row.original.programs_dances} />,
    enableColumnFilter: false,
    size: 300,
    minSize: 100,
  },
]

const linkTitle = (title: string, url?: string | null) => {
  return url ? <ExternalLink url={url} title={title} /> : title;
};

const linkVideo = (video?: string | null) => {
  return video ? <ExternalLink url={video} title='Video' /> : null;
};

export const tableInitialState = {
  sorting: [{ id: 'id', desc: false }],
  columnPinning: { left: ['title'] },
  columnVisibility: {
    url: false,
  },
  density: 'compact' as const,
  pagination: { pageSize: 100, pageIndex: 0 }
};


// QUERY CONFIG

export const queryFields = [
  { name: 'title', label: 'Title', inputType: 'string' },
  { name: 'choreographer', label: 'Choreographer', inputType: 'string' },
  { name: 'difficulty', label: 'Difficulty', inputType: 'number' },
  { name: 'notes', label: 'Notes', inputType: 'string' },
  { name: 'place_in_program', label: 'Place in Program', inputType: 'string' },
  { name: 'moves', label: 'Moves', inputType: 'string' },
  { name: 'swing_16', label: '16-beat swing?', inputType: 'boolean' },
  { name: 'programNames', label: 'Programs', inputType: 'string' },
];

export const defaultQuery = {
  combinator: 'and',
  rules: [{ field: 'title', operator: 'contains', value: '' }]
}
