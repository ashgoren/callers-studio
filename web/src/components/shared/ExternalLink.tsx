import { Link } from '@mui/material';

export const ExternalLink = ({ url, title }: { url: string; title: string }) => {
  return (
    <Link href={url} target='_blank' rel='noopener noreferrer' underline='hover'>
      {title}
    </Link>
  );
};
