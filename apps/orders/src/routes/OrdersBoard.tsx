import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import type { SxProps, Theme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useOrderStore, type OrderEntry, type OrderStatus } from '../stores/orderStore';
import { useMealStore } from '@shared/utils';

const statusConfig: Record<
  OrderStatus,
  { label: string; color: 'default' | 'warning' | 'success' | 'info' }
> = {
  preparing: { label: 'Hazırlanır', color: 'info' },
  delivering: { label: 'Çatdırılır', color: 'warning' },
  delivered: { label: 'Tamamlandı', color: 'success' }
};

const boardStyles: Record<
  | 'header'
  | 'headerInfo'
  | 'tablePaper'
  | 'emptyState'
  | 'statusCell'
  | 'dialogTitle'
  | 'dialogContent'
  | 'dialogSection'
  | 'activityItem',
  SxProps<Theme>
> = {
  header: (theme) => ({
    display: 'flex',
    alignItems: { xs: 'stretch', md: 'center' },
    flexDirection: { xs: 'column', md: 'row' },
    gap: theme.spacing(2)
  }),
  headerInfo: {
    flex: 1
  },
  tablePaper: {
    padding: 0
  },
  emptyState: (theme) => ({
    padding: theme.spacing(4),
    textAlign: 'center'
  }),
  statusCell: (theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1)
  }),
  dialogTitle: (theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: theme.spacing(2)
  }),
  dialogContent: (theme) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2)
  }),
  dialogSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1
  },
  activityItem: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  }
};

export const OrdersBoard = () => {
  const navigate = useNavigate();
  const { orders, updateStatus } = useOrderStore((state) => ({
    orders: state.orders,
    updateStatus: state.updateStatus
  }));
  const meals = useMealStore((state) => state.meals);
  const mealNameMap = useMemo(
    () => Object.fromEntries(meals.map((meal) => [meal.id, meal.name] as const)),
    [meals]
  );
  const [activeOrder, setActiveOrder] = useState<OrderEntry | null>(null);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus>('preparing');

  const handleOpenDialog = (order: OrderEntry) => {
    setActiveOrder(order);
    setPendingStatus(order.status);
  };

  const handleCloseDialog = () => {
    setActiveOrder(null);
  };

  const handleStatusSave = () => {
    if (activeOrder) {
      updateStatus(activeOrder.id, pendingStatus);
    }
    handleCloseDialog();
  };

  return (
    <Stack spacing={3}>
      <Box sx={boardStyles.header}>
        <Box sx={boardStyles.headerInfo}>
          <Typography
            variant="h4"
            gutterBottom
          >
            Orders domain
          </Typography>
          <Typography color="text.secondary">
            Local routing stays inside the remote so the shell is agnostic of its internal UI state.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('new')}
        >
          Create order
        </Button>
      </Box>
      <Paper sx={boardStyles.tablePaper}>
        {orders.length === 0 ? (
          <Box sx={boardStyles.emptyState}>
            <Typography color="text.secondary">Hələ sifariş əlavə edilməyib.</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Müştəri</TableCell>
                <TableCell>Məhsul</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Miqdar</TableCell>
                <TableCell>Prioritet</TableCell>
                <TableCell>Yaradılma</TableCell>
                <TableCell>Əməliyyatlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                >
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{mealNameMap[order.product] ?? order.product}</TableCell>
                  <TableCell sx={boardStyles.statusCell}>
                    <Chip
                      label={statusConfig[order.status].label}
                      color={statusConfig[order.status].color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{order.priority}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleString('az-AZ', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenDialog(order)}
                    >
                      Status / Log
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
      <Dialog
        open={Boolean(activeOrder)}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={boardStyles.dialogTitle}>
          Sifariş statusu
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        {activeOrder && (
          <>
            <DialogContent
              dividers
              sx={boardStyles.dialogContent}
            >
              <Box>
                <Typography variant="subtitle2">{activeOrder.customer}</Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  ID: {activeOrder.id}
                </Typography>
              </Box>
              <Box sx={boardStyles.dialogSection}>
                <Typography variant="body2">Statusu dəyiş:</Typography>
                <Select
                  value={pendingStatus}
                  onChange={(event) => setPendingStatus(event.target.value as OrderStatus)}
                >
                  {Object.entries(statusConfig).map(([key, meta]) => (
                    <MenuItem
                      key={key}
                      value={key}
                    >
                      {meta.label}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1 }}
                >
                  Aktivlik jurnalı
                </Typography>
                <List
                  dense
                  disablePadding
                >
                  {activeOrder.history.map((entry) => (
                    <ListItem
                      key={entry.id}
                      sx={boardStyles.activityItem}
                    >
                      <ListItemText
                        primary={entry.message}
                        secondary={new Date(entry.timestamp).toLocaleString('az-AZ', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Ləğv et</Button>
              <Button
                onClick={handleStatusSave}
                variant="contained"
              >
                Yadda saxla
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
};
