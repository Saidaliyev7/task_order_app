import { BrowserRouter, useInRouterContext } from 'react-router-dom';
import InventoryApp from './App';

const RemoteInventory = () => {
  const inRouterContext = useInRouterContext();

  if (inRouterContext) {
    return <InventoryApp />;
  }

  return (
    <BrowserRouter>
      <InventoryApp />
    </BrowserRouter>
  );
};

export default RemoteInventory;
