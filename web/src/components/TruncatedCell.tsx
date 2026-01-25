import { useState, useRef, useEffect } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface TruncatedCellProps {
  content: string | null;
  title?: string;
}

export const TruncatedCell = ({ content, title = 'Details' }: TruncatedCellProps) => {
  const [open, setOpen] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
      }
    };

    checkTruncation();

    // Recheck when column resizes
    const observer = new ResizeObserver(checkTruncation);
    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => observer.disconnect();
  }, [content]);

  if (!content) return null;

  return (
    <>
      <Box
        ref={textRef}
        onClick={isTruncated ? () => setOpen(true) : undefined}
        sx={{
          fontSize: '0.8125rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...(isTruncated && {
            cursor: 'pointer',
            '&:hover': { color: 'secondary.main' },
          }),
        }}
      >
        {content}
      </Box>

      {isTruncated && (
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
          <DialogTitle>
            {title}
            <IconButton
              onClick={() => setOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {content}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
