import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export type MetricCardProps = {
  title: string;
  value: string;
  delta?: number;
  description?: string;
};

export const MetricCard = ({ title, value, delta, description }: MetricCardProps) => {
  const deltaLabel =
    typeof delta === 'number' ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%` : null;
  const DeltaIcon = delta && delta < 0 ? TrendingDownIcon : TrendingUpIcon;

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
    >
      <Typography
        variant="subtitle2"
        color="text.secondary"
        gutterBottom
      >
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="h4"
          component="span"
        >
          {value}
        </Typography>
        {deltaLabel && (
          <Chip
            icon={<DeltaIcon fontSize="small" />}
            label={deltaLabel}
            color={delta && delta < 0 ? 'error' : 'success'}
            size="small"
            sx={{ borderRadius: 2 }}
          />
        )}
      </Box>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {description}
        </Typography>
      )}
    </Paper>
  );
};
