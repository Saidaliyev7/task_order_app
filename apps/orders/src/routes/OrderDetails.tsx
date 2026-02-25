import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import type { SxProps, Theme } from '@mui/material/styles';
import { orders } from '../data';

const detailStyles: Record<'card' | 'metaBox' | 'chip' | 'action', SxProps<Theme>> = {
  card: (theme) => ({
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2)
  }),
  metaBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5
  },
  chip: {
    alignSelf: 'flex-start'
  },
  action: {
    marginTop: 'auto'
  }
};

export const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <Paper sx={detailStyles.card}>
        <Typography variant="h6">Order Tapilmadi</Typography>
        <Button
          sx={detailStyles.action}
          onClick={() => navigate('..')}
        >
          Back to list
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={detailStyles.card}>
      <Typography variant="h5">{order.id}</Typography>
      <Typography color="text.secondary">Customer: {order.customer}</Typography>
      <Chip
        label={order.status}
        sx={detailStyles.chip}
      />
      <Box sx={detailStyles.metaBox}>
        <Typography variant="subtitle2">ETA</Typography>
        <Typography>{order.eta}</Typography>
      </Box>
      <Box sx={detailStyles.metaBox}>
        <Typography variant="subtitle2">Total</Typography>
        <Typography>${order.total.toLocaleString()}</Typography>
      </Box>
      <Button
        variant="text"
        onClick={() => navigate('..')}
      >
        Back to list
      </Button>
    </Paper>
  );
};
