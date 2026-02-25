import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  useInventoryStore,
  useMealStore,
  type IngredientId,
  type MealDefinition,
  type MealId
} from '@shared/utils';

type RequirementRow = {
  id: IngredientId;
  label: string;
  unit: string;
  required: number;
  available: number;
  shortage: number;
};

export const ReplenishmentPlan = () => {
  const navigate = useNavigate();
  const { ingredients, restock } = useInventoryStore((state) => ({
    ingredients: state.ingredients,
    restock: state.restock
  }));
  const meals = useMealStore((state) => state.meals);
  const mealOptions = meals.map((meal) => ({ id: meal.id, name: meal.name }));
  const [recipeName, setRecipeName] = useState<MealId>(mealOptions[0]?.id ?? '');
  const [quantity, setQuantity] = useState(0);
  const [restockPlan, setRestockPlan] = useState<Partial<Record<IngredientId, number>>>({});
  const [status, setStatus] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!recipeName && mealOptions[0]) {
      setRecipeName(mealOptions[0].id);
      return;
    }
    if (recipeName && !mealOptions.some((option) => option.id === recipeName)) {
      setRecipeName(mealOptions[0]?.id ?? '');
    }
  }, [mealOptions, recipeName]);

  const selectedMeal: MealDefinition | undefined = meals.find((meal) => meal.id === recipeName);

  const recipeRequirements = useMemo<RequirementRow[]>(() => {
    const current = new Map(ingredients.map((item) => [item.id, item]));
    if (!selectedMeal) {
      return [];
    }
    const recipe = selectedMeal.ingredients;
    return Object.entries(recipe)
      .filter(([, perUnit]) => perUnit > 0)
      .map(([ingredientId, perUnit]) => {
        const stock = current.get(ingredientId as IngredientId);
        const required = perUnit * quantity;
        const available = stock?.quantity ?? 0;
        const shortage = Math.max(0, required - available);
        return {
          id: ingredientId as IngredientId,
          label: stock?.label ?? ingredientId,
          unit: stock?.unit ?? 'ədəd',
          required,
          available,
          shortage
        };
      });
  }, [ingredients, selectedMeal, quantity]);

  useEffect(() => {
    const defaults: Partial<Record<IngredientId, number>> = {};
    recipeRequirements.forEach((req) => {
      defaults[req.id] = req.shortage;
    });
    setRestockPlan(defaults);
  }, [recipeRequirements]);

  const insufficientStock = recipeRequirements.some((req) => req.shortage > 0);

  const handlePlanChange = (id: IngredientId, value: number) => {
    setRestockPlan((prev) => ({
      ...prev,
      [id]: Number.isNaN(value) ? 0 : Math.max(0, value)
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const unmet = recipeRequirements.filter(
      (req) => req.shortage > 0 && (restockPlan[req.id] ?? 0) < req.shortage
    );
    if (unmet.length > 0) {
      setStatus({
        type: 'error',
        message: 'Zəhmət olmasa bütün çatışmazlıqlar üçün minimum lazım olan miqdarı daxil edin.'
      });
      return;
    }
    let totalRestocked = 0;
    Object.entries(restockPlan).forEach(([ingredientId, amount]) => {
      const numericAmount = Number(amount ?? 0);
      const safeAmount = Math.max(0, Math.round(numericAmount));
      if (safeAmount > 0) {
        restock(ingredientId as IngredientId, safeAmount);
        totalRestocked += safeAmount;
      }
    });
    setStatus(
      totalRestocked > 0
        ? { type: 'success', message: 'Seçilmiş ingredientlər üçün stok artırıldı.' }
        : { type: 'info', message: 'Restok miqdarı daxil edilməyib.' }
    );
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{ p: 4 }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5">Yemək əsaslı restok</Typography>
          <Typography color="text.secondary">
            Hazırlamaq istədiyin yeməyi və miqdarı seç — sistem həmin resept üçün tələb olunan
            ingredientləri göstərir və çatışmayanları artırmağa imkan verir.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
        >
          <TextField
            select
            label="Yemək"
            value={recipeName}
            onChange={(event) => setRecipeName(event.target.value as MealId)}
            sx={{ flex: 1 }}
            disabled={mealOptions.length === 0}
          >
            {mealOptions.length === 0 ? (
              <MenuItem
                value=""
                disabled
              >
                Əvvəlcə resept yaratın
              </MenuItem>
            ) : (
              mealOptions.map((option) => (
                <MenuItem
                  key={option.id}
                  value={option.id}
                >
                  {option.name}
                </MenuItem>
              ))
            )}
          </TextField>
          <TextField
            type="number"
            label="Planlaşdırılan miqdar"
            value={quantity}
            inputProps={{ min: 0 }}
            onChange={(event) => {
              const value = Number(event.target.value);
              setQuantity(Number.isNaN(value) ? 0 : Math.max(0, value));
            }}
            sx={{ flex: 1 }}
          />
        </Stack>

        {mealOptions.length === 0 ? (
          <Alert severity="info">Əvvəlcə Meals tətbiqində resept yaratın.</Alert>
        ) : recipeRequirements.length === 0 ? (
          <Alert severity="info">Seçilmiş resept üçün ingredient tərifi tapılmadı.</Alert>
        ) : insufficientStock ? (
          <Alert severity="error">
            Seçilmiş miqdar üçün stok kifayət deyil. Aşağıdakı çatışmazlıqları doldurun.
          </Alert>
        ) : (
          <Alert severity="success">Seçilmiş miqdar üçün stok kifayətdir.</Alert>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ingredient</TableCell>
              <TableCell align="right">Tələb olunan</TableCell>
              <TableCell align="right">Hazırki stok</TableCell>
              <TableCell align="right">Çatışmazlıq</TableCell>
              <TableCell align="right">Artırılacaq</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipeRequirements.map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                  <Typography fontWeight={600}>{req.label}</Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Hazırki miqdar: {req.available} {req.unit}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {req.required} {req.unit}
                </TableCell>
                <TableCell align="right">
                  {req.available} {req.unit}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: req.shortage > 0 ? 'error.main' : 'success.main' }}
                >
                  {req.shortage > 0 ? `-${req.shortage}` : '0'}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ minWidth: 140 }}
                >
                  <TextField
                    type="number"
                    size="small"
                    value={restockPlan[req.id] ?? 0}
                    inputProps={{ min: 0 }}
                    onChange={(event) => handlePlanChange(req.id, Number(event.target.value))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {status && <Alert severity={status.type}>{status.message}</Alert>}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('..')}
          >
            Geri
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={!selectedMeal}
          >
            Restok tətbiq et
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};
