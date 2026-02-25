import { BrowserRouter, useInRouterContext } from 'react-router-dom';
import OrdersApp from './App';

const RemoteOrders = () => {
  const inRouterContext = useInRouterContext();

  if (inRouterContext) {
    return <OrdersApp />;
  }

  return (
    <BrowserRouter>
      <OrdersApp />
    </BrowserRouter>
  );
};

export default RemoteOrders;
