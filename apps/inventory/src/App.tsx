import { Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import { InventoryDashboard } from './routes/InventoryDashboard';
import { ReplenishmentPlan } from './routes/ReplenishmentPlan';

const InventoryApp = () => (
  <Stack spacing={3}>
    <Breadcrumbs>
      <Link
        component={RouterLink}
        underline="hover"
        color="inherit"
        to="/inventory"
      >
        Inventory
      </Link>
    </Breadcrumbs>
    <Button
      variant="contained"
      sx={{ alignSelf: 'flex-start' }}
      component={RouterLink}
      to="plan"
    >
      Stoku artır
    </Button>
    <Routes>
      <Route
        index
        element={<InventoryDashboard />}
      />
      <Route
        path="plan"
        element={<ReplenishmentPlan />}
      />
      <Route
        path="*"
        element={
          <Navigate
            to="."
            replace
          />
        }
      />
    </Routes>
  </Stack>
);

export default InventoryApp;
