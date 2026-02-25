import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import {
  useInventoryStore,
  useMealStore,
  type IngredientStock,
  type MealDefinition
} from '@shared/utils';

const getRecipeCapacity = (meal: MealDefinition, ingredients: IngredientStock[]) => {
  return Object.entries(meal.ingredients).reduce((acc, [ingredientId, amountNeeded]) => {
    if (amountNeeded === 0) {
      return acc;
    }
    const stock = ingredients.find((item) => item.id === ingredientId);
    if (!stock) {
      return 0;
    }
    const availableCount = Math.floor(stock.quantity / amountNeeded);
    return Math.min(acc, availableCount);
  }, Infinity);
};

export const InventoryDashboard = () => {
  const { ingredients, restock } = useInventoryStore((state) => ({
    ingredients: state.ingredients,
    restock: state.restock
  }));
  const meals = useMealStore((state) => state.meals);
  const [selectedId, setSelectedId] = useState<IngredientStock['id']>('bun');
  const RESTOCK_AMOUNT = 25;

  const selectedIngredient =
    ingredients.find((item) => item.id === selectedId) ?? ingredients[0] ?? null;

  const recipeCapacity = useMemo(
    () =>
      meals.map((meal) => {
        const capacity = getRecipeCapacity(meal, ingredients);
        return {
          id: meal.id,
          name: meal.name,
          capacity: Number.isFinite(capacity) ? capacity : 0
        };
      }),
    [ingredients, meals]
  );

  const handleRestock = () => {
    if (!selectedIngredient) return;
    restock(selectedIngredient.id, RESTOCK_AMOUNT);
  };

  return (
    <Stack spacing={4}>
      <Box>
        <Typography
          variant="h4"
          gutterBottom
        >
          Ingredient overview
        </Typography>
        <Typography color="text.secondary">
          Reseptlər meals tətbiqində idarə olunur və Orders domenindəki hər sifariş bu stoklardan
          avtomatik istifadə edir. Buradan səviyyələri izle və lazım olduqda yenilə.
        </Typography>
      </Box>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ '& > *': { flex: 1, minWidth: 0 } }}
      >
        {recipeCapacity.map(({ id, name, capacity }) => (
          <Card
            key={id}
            sx={{
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Maksimum sifariş
              </Typography>
              <Typography
                variant="h5"
                sx={{ textTransform: 'capitalize' }}
              >
                {name}
              </Typography>
              <Typography
                variant="h3"
                sx={{ mt: 2 }}
              >
                {capacity}
              </Typography>
              <Typography color="text.secondary">ədəd hazırda icra oluna bilər</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">Ingredient stokları</Typography>
              <Typography color="text.secondary">
                Orders tətbiqindən sifariş yaratıldıqda burada olan miqdardan avtomatik çıxılacaq.
              </Typography>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ingredient</TableCell>
                  <TableCell align="right">Miqdar</TableCell>
                  <TableCell>Vahid</TableCell>
                  <TableCell sx={{ width: 200 }}>Doldurma</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ingredients.map((ingredient) => {
                  const percent = Math.min(100, (ingredient.quantity / 250) * 100);
                  return (
                    <TableRow
                      hover
                      key={ingredient.id}
                      selected={ingredient.id === selectedIngredient?.id}
                      onClick={() => setSelectedId(ingredient.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{ingredient.label}</TableCell>
                      <TableCell align="right">{ingredient.quantity}</TableCell>
                      <TableCell>{ingredient.unit}</TableCell>
                      <TableCell>
                        <LinearProgress
                          variant="determinate"
                          value={percent}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
