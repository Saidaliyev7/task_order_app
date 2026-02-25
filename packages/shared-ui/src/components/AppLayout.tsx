import { PropsWithChildren } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';
import RestaurantMenuOutlined from '@mui/icons-material/RestaurantMenuOutlined';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import type { NavRoute } from '@shared/config';

export type AppLayoutProps = PropsWithChildren<{
  brand: string;
  routes: NavRoute[];
}>;

const drawerWidth = 260;

const iconMap: Record<NavRoute['icon'], React.ReactNode> = {
  dashboard: <DashboardOutlined fontSize="small" />,
  orders: <ReceiptLongOutlined fontSize="small" />,
  inventory: <Inventory2Outlined fontSize="small" />,
  meals: <RestaurantMenuOutlined fontSize="small" />
};

export const AppLayout = ({ brand, routes, children }: AppLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
        >
          {brand}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {routes.map((route) => (
          <ListItemButton
            key={route.path}
            component={NavLink}
            to={route.path}
            onClick={() => setMobileOpen(false)}
            sx={{ '&.active': { bgcolor: 'action.selected' } }}
          >
            <ListItemIcon>{iconMap[route.icon]}</ListItemIcon>
            <ListItemText primary={route.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen((prev) => !prev)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
          >
            {brand}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
