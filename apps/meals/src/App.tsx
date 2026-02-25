import Stack from '@mui/material/Stack';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import MealBuilder from './routes/MealBuilder';

const MealsApp = () => (
  <Stack
    spacing={3}
    sx={{ maxWidth: 960 }}
  >
    <Breadcrumbs>
      <Link
        color="inherit"
        underline="hover"
        href="/meals"
      >
        Meals
      </Link>
    </Breadcrumbs>
    <Typography
      variant="body1"
      color="text.secondary"
    >
      Yeni yeməklər yarat, hər biri üçün ingredient tələblərini təyin et və Orders domeninə
      avtomatik ötür.
    </Typography>
    <MealBuilder />
  </Stack>
);

export default MealsApp;
