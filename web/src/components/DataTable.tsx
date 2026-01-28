import { useState } from 'react';
import { flexRender, type Table as ReactTable, type Column } from '@tanstack/react-table';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Box } from '@mui/material';

export const DataTable = <TData,>({ table }: { table: ReactTable<TData> }) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

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
      backgroundColor: isHeader ? 'action.selected' : isHovered ? 'action.hover' : 'background.paper',
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
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, mb: 2 }}>
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
                    bgcolor: 'action.selected',
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
                  </Box>

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
