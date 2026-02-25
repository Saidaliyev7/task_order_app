import { BrowserRouter, useInRouterContext } from 'react-router-dom';
import MealsApp from './App';

const RemoteMeals = () => {
  const inRouterContext = useInRouterContext();

  if (inRouterContext) {
    return <MealsApp />;
  }

  return (
    <BrowserRouter>
      <MealsApp />
    </BrowserRouter>
  );
};

export default RemoteMeals;
