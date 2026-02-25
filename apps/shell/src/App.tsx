import { cloneElement, lazy, Suspense, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import { navRoutes, remoteDefinitions } from '@shared/config';
import type { RemoteDefinition } from '@shared/config';
import { useOperationsMetrics, OPERATIONS_METRIC_BASELINES, useMealStore } from '@shared/utils';
import { RemoteErrorBoundary } from './components/RemoteErrorBoundary';

const OrdersRemote = lazy(() => import('orders/Module'));
const InventoryRemote = lazy(() => import('inventory/Module'));
const MealsRemote = lazy(() => import('meals/Module'));
const AppLayoutLazy = lazy(() => import('@shared/ui').then((mod) => ({ default: mod.AppLayout })));
const MetricCardLazy = lazy(() =>
  import('@shared/ui').then((mod) => ({ default: mod.MetricCard }))
);

const RemoteFallback = ({ name }: { name: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <CircularProgress size={20} />
    <Typography variant="body2">Loading {name}...</Typography>
  </Box>
);

const LayoutFallback = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
    <CircularProgress size={20} />
    <Typography variant="body2">Loading layout...</Typography>
  </Box>
);

const MetricsFallback = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <CircularProgress size={18} />
    <Typography
      variant="body2"
      color="text.secondary"
    >
      Loading metrics...
    </Typography>
  </Box>
);

const getPositiveDelta = (current: number, baseline: number) => {
  if (current === baseline) return 0;
  const denominator = baseline === 0 ? 1 : baseline;
  return ((current - baseline) / denominator) * 100;
};

const getInverseDelta = (current: number, baseline: number) => {
  if (current === baseline) return 0;
  const denominator = baseline === 0 ? Math.max(1, current) : baseline;
  return ((baseline - current) / denominator) * 100;
};

const OverviewPage = () => {
  const { weeklyOrders, avgCompletionMinutes, weeklyIngredientUsage } = useOperationsMetrics(
    (state) => ({
      weeklyOrders: state.weeklyOrders,
      avgCompletionMinutes: state.avgCompletionMinutes,
      weeklyIngredientUsage: state.weeklyIngredientUsage
    })
  );
  const meals = useMealStore((state) => state.meals);
  const numberFormatter = useMemo(() => new Intl.NumberFormat('en-US'), []);

  const ordersDelta = getPositiveDelta(weeklyOrders, OPERATIONS_METRIC_BASELINES.weeklyOrders);
  const completionDelta = getInverseDelta(
    avgCompletionMinutes,
    OPERATIONS_METRIC_BASELINES.avgCompletionMinutes
  );
  const ingredientDelta = getPositiveDelta(
    weeklyIngredientUsage,
    OPERATIONS_METRIC_BASELINES.weeklyIngredientUsage
  );
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const newMealsCount = meals.filter((meal) => {
    const createdAt = new Date(meal.createdAt).getTime();
    return Number.isFinite(createdAt) && createdAt >= thirtyDaysAgo;
  }).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography
          variant="h4"
          gutterBottom
        >
          Restoran əməliyyatlarına ümumi baxış
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
        >
          Bu panel sifariş, inventar və yemək modullarından gələn ən son göstəriciləri bir araya
          gətirir ki, gündəlik tələbatı və icra durumunu tez qiymətləndirəsən.
        </Typography>
      </Box>
      <Grid
        container
        spacing={3}
      >
        <Suspense fallback={<MetricsFallback />}>
          <Grid
            xs={12}
            md={4}
          >
            <MetricCardLazy
              title="Weekly orders"
              value={numberFormatter.format(weeklyOrders)}
              delta={ordersDelta}
              description={`Vs bazis ${OPERATIONS_METRIC_BASELINES.weeklyOrders.toLocaleString('en-US')} sifariş`}
            />
          </Grid>
          <Grid
            xs={12}
            md={4}
          >
            <MetricCardLazy
              title="Avg. completion"
              value={`${avgCompletionMinutes.toFixed(0)} dəq`}
              delta={completionDelta}
              description="Status 'delivered' olan sifarişlərin orta icra müddəti"
            />
          </Grid>
          <Grid
            xs={12}
            md={4}
          >
            <MetricCardLazy
              title="Ingredient usage"
              value={`${numberFormatter.format(weeklyIngredientUsage)} pors.`}
              delta={ingredientDelta}
              description="Bu həftə sərf olunan ümumi ingredient vahidi"
            />
          </Grid>
          <Grid
            xs={12}
            md={4}
          >
            <MetricCardLazy
              title="New meals (30 gün)"
              value={numberFormatter.format(newMealsCount)}
              description="Meals tətbiqində son 30 gündə əlavə olunan reseptlər"
            />
          </Grid>
        </Suspense>
      </Grid>
      <Box>
        <Typography
          variant="h6"
          gutterBottom
        >
          Manage domains
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {remoteDefinitions.map((remote) => (
            <Button
              key={remote.name}
              variant="outlined"
              href={remote.routePath.replace('*', '')}
            >
              Go to {remote.displayName}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const remoteDictionary = remoteDefinitions.reduce<
  Record<RemoteDefinition['name'], RemoteDefinition>
>(
  (acc, remote) => {
    acc[remote.name] = remote;
    return acc;
  },
  {} as Record<RemoteDefinition['name'], RemoteDefinition>
);

type RemoteModuleContainerProps = {
  name: RemoteDefinition['displayName'];
  entryUrl?: string;
  children: ReactElement;
};

const RemoteModuleContainer = ({ name, entryUrl, children }: RemoteModuleContainerProps) => {
  const [retryKey, setRetryKey] = useState(0);

  return (
    <RemoteErrorBoundary
      remoteName={name}
      entryUrl={entryUrl}
      onRetry={() => setRetryKey((key) => key + 1)}
    >
      <Suspense
        key={retryKey}
        fallback={<RemoteFallback name={name} />}
      >
        {cloneElement(children, { key: retryKey })}
      </Suspense>
    </RemoteErrorBoundary>
  );
};

const App = () => {
  const ordersMeta = remoteDictionary.orders;
  const inventoryMeta = remoteDictionary.inventory;
  const mealsMeta = remoteDictionary.meals;

  return (
    <Suspense fallback={<LayoutFallback />}>
      <AppLayoutLazy
        brand="Restoran Panel App"
        routes={navRoutes}
      >
        <Routes>
          <Route
            path="/"
            element={<OverviewPage />}
          />
          <Route
            path="/orders/*"
            element={
              <RemoteModuleContainer
                name={ordersMeta?.displayName ?? 'Orders'}
                entryUrl={ordersMeta?.entry}
              >
                <OrdersRemote />
              </RemoteModuleContainer>
            }
          />
          <Route
            path="/inventory/*"
            element={
              <RemoteModuleContainer
                name={inventoryMeta?.displayName ?? 'Inventory'}
                entryUrl={inventoryMeta?.entry}
              >
                <InventoryRemote />
              </RemoteModuleContainer>
            }
          />
          <Route
            path="/meals/*"
            element={
              <RemoteModuleContainer
                name={mealsMeta?.displayName ?? 'Meals'}
                entryUrl={mealsMeta?.entry}
              >
                <MealsRemote />
              </RemoteModuleContainer>
            }
          />
          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </AppLayoutLazy>
    </Suspense>
  );
};

export default App;
