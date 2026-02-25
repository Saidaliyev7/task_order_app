import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useFormik } from 'formik';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import type { SxProps, Theme } from '@mui/material/styles';
import { useOrderStore } from '../stores/orderStore';
import { useInventoryStore, useMealStore, type MealId } from '@shared/utils';

const formStyles: Record<
  'form' | 'ingredientList' | 'ingredientItem' | 'actions',
  SxProps<Theme>
> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3
  },
  ingredientList: (theme) => ({
    paddingLeft: theme.spacing(3),
    margin: 0
  }),
  ingredientItem: {
    listStyle: 'disc'
  },
  actions: {
    display: 'flex',
    gap: 2
  }
};

export type OrderFormInput = {
  customer: string;
  quantity: number;
  priority: 'low' | 'standard' | 'urgent';
  product: MealId | '';
};

export const OrderForm = () => {
  const navigate = useNavigate();
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const meals = useMealStore((state) => state.meals);
  const productOptions = meals.map((meal) => meal.id);
  const { orders, addOrder } = useOrderStore((state) => ({
    orders: state.orders,
    addOrder: state.addOrder
  }));
  const consumeRecipe = useInventoryStore((state) => state.consumeRecipe);

  const schema = z.object({
    customer: z.string().min(3, 'Ad daxil edin'),
    quantity: z
      .number({ invalid_type_error: 'Miqdar rəqəm olmalıdır' })
      .min(1, 'Minimum 1')
      .max(1000, 'Maksimum 1000'),
    priority: z.enum(['low', 'standard', 'urgent']),
    product: z
      .string()
      .min(1, 'Məhsul seçin')
      .refine((value) => productOptions.length === 0 || productOptions.includes(value), {
        message: 'Məhsul siyahıda yoxdur'
      })
  });

  const formik = useFormik<OrderFormInput>({
    initialValues: {
      customer: '',
      quantity: 1,
      priority: 'standard',
      product: productOptions[0] ?? ''
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = schema.safeParse(values);
      if (result.success) {
        return {};
      }
      return result.error.flatten().fieldErrors;
    },
    onSubmit: async (values, helpers) => {
      if (!values.product) {
        setInventoryError('Əvvəlcə məhsul seçin.');
        await helpers.setSubmitting(false);
        return;
      }
      const success = consumeRecipe(values.product, values.quantity);
      if (!success) {
        setInventoryError('Anbarda kifayət qədər ingredient yoxdur.');
        await helpers.setSubmitting(false);
        return;
      }
      setInventoryError(null);
      addOrder(values);
      helpers.resetForm();
      await helpers.setSubmitting(false);
      navigate('..');
    }
  });

  const isSubmitting = formik.isSubmitting;
  const selectedMeal = meals.find((meal) => meal.id === formik.values.product);
  const mealNameMap = useMemo(
    () => Object.fromEntries(meals.map((meal) => [meal.id, meal.name] as const)),
    [meals]
  );

  return (
    <Stack spacing={3}>
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={formStyles.form}
      >
        <Typography variant="h5">Yeni sifariş</Typography>
        <Grid
          container
          spacing={2}
        >
          <Grid
            xs={12}
            md={6}
          >
            <TextField
              name="customer"
              label="Müştərinin adı"
              fullWidth
              value={formik.values.customer}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.customer && Boolean(formik.errors.customer)}
              helperText={formik.touched.customer && formik.errors.customer}
            />
          </Grid>
          <Grid
            xs={12}
            md={6}
          >
            <TextField
              name="priority"
              label="Prioritet"
              select
              fullWidth
              value={formik.values.priority}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="low">Aşağı</MenuItem>
              <MenuItem value="standard">Standart</MenuItem>
              <MenuItem value="urgent">Təcili</MenuItem>
            </TextField>
          </Grid>
          <Grid
            xs={12}
            md={6}
          >
            <TextField
              name="product"
              label="Məhsul"
              select
              fullWidth
              disabled={productOptions.length === 0}
              value={formik.values.product}
              onChange={formik.handleChange}
            >
              {productOptions.length === 0 ? (
                <MenuItem
                  value=""
                  disabled
                >
                  Əvvəlcə resept yaratın
                </MenuItem>
              ) : (
                meals.map((meal) => (
                  <MenuItem
                    key={meal.id}
                    value={meal.id}
                  >
                    {meal.name}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>
          <Grid
            xs={12}
            md={6}
          >
            <TextField
              name="quantity"
              label="Miqdar"
              type="number"
              fullWidth
              inputProps={{ min: 1, max: 1000 }}
              value={formik.values.quantity}
              onChange={(event) => formik.setFieldValue('quantity', Number(event.target.value))}
              onBlur={formik.handleBlur}
              error={formik.touched.quantity && Boolean(formik.errors.quantity)}
              helperText={formik.touched.quantity && formik.errors.quantity}
            />
          </Grid>
        </Grid>
        <Stack spacing={2}>
          <Box>
            <Typography
              variant="subtitle2"
              gutterBottom
            >
              Tələbinə düşəcək ingredientlər
            </Typography>
            {selectedMeal ? (
              <Stack
                component="ul"
                sx={formStyles.ingredientList}
                spacing={0.5}
              >
                {Object.entries(selectedMeal.ingredients)
                  .filter(([, amount]) => amount && amount > 0)
                  .map(([ingredient, amount]) => (
                    <Box
                      component="li"
                      key={ingredient}
                      sx={formStyles.ingredientItem}
                    >
                      {ingredient} — {(amount ?? 0) * formik.values.quantity} ədəd
                    </Box>
                  ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">Məhsul seçin.</Typography>
            )}
          </Box>
          {inventoryError && <Alert severity="error">{inventoryError}</Alert>}
          {productOptions.length === 0 && (
            <Alert severity="info">Əvvəlcə Meals tətbiqində yeni yemək yaratın.</Alert>
          )}
        </Stack>
        <Box sx={formStyles.actions}>
          <Button
            variant="outlined"
            onClick={() => navigate('..')}
            disabled={isSubmitting}
          >
            Ləğv et
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || productOptions.length === 0}
          >
            Sifariş et
          </Button>
        </Box>
      </Box>
      {orders.length > 0 && (
        <Stack spacing={2}>
          <Typography variant="h6">Son sifarişlər</Typography>
          {orders.map((order) => (
            <Paper
              key={order.id}
              sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}
            >
              <Typography variant="subtitle1">{order.customer}</Typography>
              <Typography variant="body2">
                Məhsul: {mealNameMap[order.product] ?? order.product} • Miqdar: {order.quantity} •
                Prioritet: {order.priority}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {new Date(order.createdAt).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
