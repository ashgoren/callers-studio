import { ExternalLink } from '@/components/shared';
import { TooltipCell } from '@/components/TooltipCell';
import { RelationCell } from '@/components/RelationCell';
import type { MRT_ColumnDef } from 'material-react-table'
import type { Dance, DanceInsert } from '@/lib/types/database';
import '@tanstack/react-table';

// NEW RECORD CONFIG

export const newRecord: DanceInsert = {
  title: '',
  dance_type_id: null,
  formation_id: null,
  progression_id: null,
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
  // {
  //   accessorKey: 'id',
  //   header: 'ID',
  //   enableColumnFilter: false,
  //   size: 120,
  //   minSize: 55,
  // },
  {
    accessorKey: 'url',
    header: 'URL',
    enableColumnFilter: false,
    enableSorting: false,
    size: 120,
    minSize: 50,
    meta: {
      inputType: 'text',
    }
  },
  {
    id: 'choreographers',
    header: '🔗 Choreographers',
    enableColumnFilter: false,
    size: 200,
    minSize: 170,
    Cell: ({ row }) => row.original.dances_choreographers.map(dc => dc.choreographer.name).join(', ')
  },
  {
    accessorKey: 'dance_type_id',
    header: 'Dance Type',
    Cell: ({ row }) => (row.original as Dance).dance_type?.name ?? '',
    enableColumnFilter: false,
    size: 175,
    minSize: 100,
    meta: { inputType: 'select' as const },
  },
  {
    accessorKey: 'formation_id',
    header: 'Formation',
    Cell: ({ row }) => (row.original as Dance).formation?.name ?? '',
    enableColumnFilter: false,
    size: 175,
    minSize: 100,
    meta: { inputType: 'select' as const },
  },
  {
    accessorKey: 'progression_id',
    header: 'Progression',
    Cell: ({ row }) => (row.original as Dance).progression?.name ?? '',
    enableColumnFilter: false,
    size: 175,
    minSize: 100,
    meta: { inputType: 'select' as const },
  },
  {
    id: 'keyMoves',
    header: '🔗 Key Moves',
    enableColumnFilter: false,
    size: 200,
    minSize: 170,
    Cell: ({ row }) => row.original.dances_key_moves.map(dkm => dkm.key_move.name).join(', ')
  },
  {
    id: 'vibes',
    header: '🔗 Vibes',
    enableColumnFilter: false,
    size: 200,
    minSize: 170,
    Cell: ({ row }) => row.original.dances_vibes.map(dv => dv.vibe.name).join(', ')
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
    enableColumnFilter: false,
    size: 300,
    minSize: 100,
    Cell: ({ row }) => <RelationCell
      items={row.original.programs_dances}
      model='program'
      getId={(joinRow) => joinRow.program.id}
      getLabel={(joinRow) => `${joinRow.program.date} - ${joinRow.program.location}`}
    />
  },
  {
    accessorKey: 'created_at',
    header: 'Date Added',
    enableColumnFilter: false,
    Cell: ({ row }) => new Date(row.original.created_at).toISOString().split('T')[0],
    size: 170,
    minSize: 100,
  }
]

const linkTitle = (title: string, url?: string | null) => {
  return url ? <ExternalLink url={url} title={title} /> : title;
};

const linkVideo = (video?: string | null) => {
  return video ? <ExternalLink url={video} title='Video' /> : null;
};

export const tableInitialState = {
  sorting: [{ id: 'created_at', desc: true }],
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
  { name: 'choreographerNames', label: 'Choreographers', inputType: 'string' },
  { name: 'dance_type', label: 'Dance Type', inputType: 'string' },
  { name: 'formation', label: 'Formation', inputType: 'string' },
  { name: 'progression', label: 'Progression', inputType: 'string' },
  { name: 'keyMoveNames', label: 'Key Moves', inputType: 'string' },
  { name: 'vibeNames', label: 'Vibes', inputType: 'string' },
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
