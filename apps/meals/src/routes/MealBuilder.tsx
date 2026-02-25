import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useInventoryStore, useMealStore, type IngredientId } from '@shared/utils';

const MealBuilder = () => {
  const { ingredients } = useInventoryStore((state) => ({ ingredients: state.ingredients }));
  const { meals, addMeal, removeMeal } = useMealStore((state) => ({
    meals: state.meals,
    addMeal: state.addMeal,
    removeMeal: state.removeMeal
  }));
  const [mealName, setMealName] = useState('');
  const [plan, setPlan] = useState<Partial<Record<IngredientId, number>>>({});
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const ingredientList = useMemo(
    () =>
      ingredients.map((ingredient) => ({
        id: ingredient.id,
        label: ingredient.label,
        unit: ingredient.unit
      })),
    [ingredients]
  );
  const ingredientLabelMap = useMemo(
    () =>
      Object.fromEntries(ingredientList.map((ingredient) => [ingredient.id, ingredient] as const)),
    [ingredientList]
  );

  const totalIngredients = useMemo(
    () =>
      Object.values(plan).reduce((sum, value) => {
        const numeric = Number(value ?? 0);
        return sum + (Number.isFinite(numeric) ? Math.max(0, numeric) : 0);
      }, 0),
    [plan]
  );

  const handlePlanChange = (id: IngredientId, value: number) => {
    setPlan((prev) => ({
      ...prev,
      [id]: Number.isNaN(value) ? 0 : Math.max(0, value)
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mealName.trim()) {
      setStatus({ type: 'error', message: 'Yeməyin adını daxil et.' });
      return;
    }
    if (totalIngredients === 0) {
      setStatus({ type: 'error', message: 'Ən azı bir ingredient üçün dəyər daxil et.' });
      return;
    }
    addMeal({ name: mealName, ingredients: plan });
    setMealName('');
    setPlan({});
    setStatus({ type: 'success', message: 'Yeni yemək yaratıldı və sistemə əlavə olundu.' });
  };

  const handleDelete = (id: string, name: string) => {
    const confirmed = window.confirm(`"${name}" reseptini silməyə əminsən?`);
    if (!confirmed) return;
    removeMeal(id);
    setStatus({ type: 'info', message: `"${name}" resepti silindi.` });
  };

  return (
    <Stack
      component="form"
      spacing={3}
      onSubmit={handleSubmit}
    >
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5">Yeni yemək yarat</Typography>
            <Typography color="text.secondary">
              Aşağıda olan ingredientlərin hər biri üçün standart porsiyada neçə vahid istifadə
              olunacağını daxil et.
            </Typography>
          </Box>
          <Grid
            container
            spacing={2}
          >
            <Grid
              xs={12}
              md={6}
            >
              <TextField
                label="Yeməyin adı"
                value={mealName}
                onChange={(event) => setMealName(event.target.value)}
                fullWidth
              />
            </Grid>
            <Grid
              xs={12}
              md={6}
            >
              <TextField
                label="Toplam ingredient setləri"
                value={totalIngredients}
                disabled
                fullWidth
              />
            </Grid>
          </Grid>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ingredient</TableCell>
                <TableCell align="right">Standart porsiyada</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ingredientList.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell>
                    <Typography fontWeight={600}>{ingredient.label}</Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {ingredient.unit}
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ minWidth: 140 }}
                  >
                    <TextField
                      type="number"
                      size="small"
                      value={plan[ingredient.id] ?? 0}
                      inputProps={{ min: 0 }}
                      onChange={(event) =>
                        handlePlanChange(ingredient.id, Number(event.target.value))
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {status && <Alert severity={status.type}>{status.message}</Alert>}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="reset"
              variant="outlined"
              onClick={() => setPlan({})}
            >
              Təmizlə
            </Button>
            <Button
              type="submit"
              variant="contained"
            >
              Yemək yarat
            </Button>
          </Box>
        </Stack>
      </Paper>
      {meals.length > 0 && (
        <Stack spacing={2}>
          <Typography variant="h6">Mövcud yeməklər</Typography>
          <Grid
            container
            spacing={2}
          >
            {meals.map((meal) => (
              <Grid
                xs={12}
                sm={6}
                md={4}
                key={meal.id}
              >
                <Card variant="outlined">
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 1
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1">{meal.name}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          ID: {meal.id}
                        </Typography>
                      </Box>
                      <Tooltip
                        title="Yeməyi sil"
                        arrow
                      >
                        <IconButton
                          aria-label={`Yeməyi sil: ${meal.name}`}
                          size="small"
                          onClick={() => handleDelete(meal.id, meal.name)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Stack
                      component="ul"
                      spacing={0.5}
                      sx={{ mt: 1.5, pl: 2 }}
                    >
                      {Object.entries(meal.ingredients).map(([ingredientId, amount]) => {
                        const meta = ingredientLabelMap[ingredientId as IngredientId];
                        return (
                          <Box
                            component="li"
                            key={ingredientId}
                          >
                            {(meta?.label ?? ingredientId) + ': '} {amount} {meta?.unit ?? 'ədəd'}
                          </Box>
                        );
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}
    </Stack>
  );
};

export default MealBuilder;
