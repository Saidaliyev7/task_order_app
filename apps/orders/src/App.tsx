import { Routes, Route, Navigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { OrdersBoard } from './routes/OrdersBoard';
import { OrderForm } from './routes/OrderForm';
import { OrderDetails } from './routes/OrderDetails';

const OrdersApp = () => (
  <Stack spacing={3}>
    <Breadcrumbs>
      <Link
        color="inherit"
        underline="hover"
        href="/orders"
      >
        Orders
      </Link>
    </Breadcrumbs>
    <Routes>
      <Route
        index
        element={<OrdersBoard />}
      />
      <Route
        path="new"
        element={<OrderForm />}
      />
      <Route
        path=":orderId"
        element={<OrderDetails />}
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

export default OrdersApp;
