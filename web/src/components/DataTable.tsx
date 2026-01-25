import { useState } from 'react';
import { flexRender, type Table as ReactTable, type Column } from '@tanstack/react-table';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, IconButton, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export const DataTable = <TData,>({ table }: { table: ReactTable<TData> }) => {
  const [filterOpen, setFilterOpen] = useState<Record<string, boolean>>({});
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const toggleFilter = (column: { id: string, setFilterValue: (value: any) => void }) => {
    column.setFilterValue(undefined);
    setFilterOpen(prev => ({ ...prev, [column.id]: !prev[column.id] }));
  };

  const getPinnedStyles = <TData,>({ column, isLastPinned, isHovered, isHeader }: {
    isHovered: boolean;
    isHeader: boolean;
    column: Column<TData, unknown>;
    isLastPinned: boolean;
  }) => {
    const isPinned = column.getIsPinned();
    if (!isPinned) return {};

    return {
      position: 'sticky',
      left: column.getStart('left'),
      width: column.getSize(),
      zIndex: 1,
      backgroundColor: isHeader ? 'grey.50' : isHovered ? 'grey.100' : 'background.paper',
      ...(isLastPinned && {
        borderRight: 'none',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '4px',
          background: 'linear-gradient(to right, rgba(0,0,0,0.15), transparent)',
          pointerEvents: 'none',
        },
      }),
    };
  };

  return (
    <TableContainer component={Paper}>
      <Table size='small' sx={{ tableLayout: 'fixed', minWidth: table.getTotalSize() }}>
        <colgroup>
          {table.getAllLeafColumns().map(column => (
            <col key={column.id} style={{ width: column.getSize() }} />
          ))}
        </colgroup>

        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableCell
                  key={header.id}
                  sx={{
                    width: header.getSize(),
                    position: 'relative',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'grey.50',
                    '&:last-child': { borderRight: 'none' },
                    py: 0.75,
                    px: 1.5,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    ...getPinnedStyles({
                      column: header.column,
                      isLastPinned: header.column.getIsLastColumn('left'),
                      isHovered: false,
                      isHeader: true
                    })
                  }}
                >

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {header.column.getCanSort() ? (
                        <TableSortLabel
                          active={!!header.column.getIsSorted()}
                          direction={header.column.getNextSortingOrder() === 'asc' ? 'asc' : 'desc'}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableSortLabel>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </Box>

                    {header.column.getCanFilter() && (
                      <IconButton 
                        size='small'
                        onClick={() => toggleFilter(header.column)}
                        color={filterOpen[header.column.id] ? 'secondary' : 'default'}
                        sx={{ padding: '2px' }}
                      >
                        <SearchIcon fontSize='small' />
                      </IconButton>
                    )}
                  </Box>

                  {header.column.getCanFilter() && filterOpen[header.column.id] && (
                    <TextField
                      size='small'
                      fullWidth
                      autoFocus
                      onChange={e => header.column.setFilterValue(e.target.value)}
                      placeholder='Filter...'
                      sx={{ mt: 1 }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <IconButton
                              size='small'
                              onClick={() => toggleFilter(header.column)}
                              sx={{ padding: '2px' }}
                            >
                              <ClearIcon fontSize='small' />
                            </IconButton>
                          )
                        }
                      }}
                    />
                  )}

                {header.column.getCanResize() && (
                  <Box
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    sx={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      height: '100%',
                      width: '5px',
                      cursor: 'col-resize',
                      userSelect: 'none',
                      touchAction: 'none',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                      }
                    }}
                  />
                )}

                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow
              key={row.id}
              onMouseEnter={() => setHoveredRow(row.id)}
              onMouseLeave={() => setHoveredRow(null)}
              sx={{
                backgroundColor: 'background.paper',
                // '&:hover': { backgroundColor: 'action.hover' },
                // willChange: 'background-color'
              }}
            >
              {row.getVisibleCells().map(cell => (
                <TableCell
                  key={cell.id}
                  sx={{
                    width: cell.column.getSize(),
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    bgcolor: hoveredRow === row.id ? 'action.hover' : 'background.paper',
                    '&:last-child': { borderRight: 'none' },
                    py: 0.5,
                    px: 1.5,
                    fontSize: '0.8125rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    ...getPinnedStyles({
                      column: cell.column,
                      isLastPinned: cell.column.getIsLastColumn('left'),
                      isHovered: hoveredRow === row.id,
                      isHeader: false,
                    })
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
