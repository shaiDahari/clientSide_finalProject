/**
 * Cost Manager Application
 * Main application component with navigation and layout
 */

import { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Box,
    Tabs,
    Tab,
    Paper,
    useTheme,
    useMediaQuery,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Menu as MenuIcon,
    AttachMoney,
    Assessment,
    BarChart,
    Settings as SettingsIcon
} from '@mui/icons-material';

// Import components
import CostForm from './components/CostForm';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { openCostsDB } from './utils/idb';

const App = () => {
    // State management for navigation
    const [activeTab, setActiveTab] = useState(0);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [dbInitialized, setDbInitialized] = useState(false);
    const [dbError, setDbError] = useState(null);

    // Responsive design
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    /**
     * Initialize IndexedDB on component mount
     */
    useEffect(() => {
        const initializeDatabase = async () => {
            try {
                await openCostsDB("costsdb", 1);
                setDbInitialized(true);
            } catch (error) {
                setDbError(`Failed to initialize database: ${error.message}`);
                console.error('Database initialization error:', error);
            }
        };

        initializeDatabase();
    }, []);

    /**
     * Handle tab change
     * @param {Event} event - Click event
     * @param {number} newValue - New tab index
     */
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        if (isMobile) {
            setMobileDrawerOpen(false);
        }
    };

    /**
     * Handle cost added callback
     * Triggers refresh of dashboard data
     */
    const handleCostAdded = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    /**
     * Toggle mobile drawer
     */
    const toggleDrawer = () => {
        setMobileDrawerOpen(!mobileDrawerOpen);
    };

    // Navigation items configuration
    const navigationItems = [
        { label: 'Add Cost', icon: <AttachMoney />, index: 0 },
        { label: 'Monthly Report', icon: <Assessment />, index: 1 },
        { label: 'Charts', icon: <BarChart />, index: 2 },
        { label: 'Settings', icon: <SettingsIcon />, index: 3 }
    ];

    /**
     * Render the active component based on selected tab
     */
    const renderActiveComponent = () => {
        if (!dbInitialized) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                    <Typography variant="h6" color="text.secondary">
                        {dbError || 'Initializing database...'}
                    </Typography>
                </Box>
            );
        }

        switch (activeTab) {
            case 0:
                return <CostForm onCostAdded={handleCostAdded} />;
            case 1:
                return <Dashboard refreshTrigger={refreshTrigger} />;
            case 2:
                return <Dashboard refreshTrigger={refreshTrigger} />;
            case 3:
                return <Settings />;
            default:
                return <CostForm onCostAdded={handleCostAdded} />;
        }
    };

    /**
     * Render mobile drawer navigation
     */
    const renderMobileDrawer = () => (
        <Drawer
            anchor="left"
            open={mobileDrawerOpen}
            onClose={toggleDrawer}
        >
            <Box sx={{ width: 250, pt: 2 }}>
                <List>
                    {navigationItems.map((item) => (
                        <ListItem key={item.label} disablePadding>
                            <ListItemButton
                                selected={activeTab === item.index}
                                onClick={(e) => handleTabChange(e, item.index)}
                            >
                                <ListItemIcon sx={{ color: activeTab === item.index ? 'primary.main' : 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* AppBar Header */}
            <AppBar position="static" elevation={2}>
                <Toolbar>
                    {/* Mobile menu button */}
                    {isMobile && (
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={toggleDrawer}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    {/* Application Title */}
                    <AttachMoney sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
                        Cost Manager
                    </Typography>

                    {/* Desktop/Tablet Navigation Tabs */}
                    {!isMobile && (
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            textColor="inherit"
                            indicatorColor="secondary"
                            sx={{ ml: 'auto' }}
                        >
                            <Tab label="Add Cost" icon={<AttachMoney />} iconPosition="start" />
                            <Tab label={isTablet ? "Report" : "Monthly Report"} icon={<Assessment />} iconPosition="start" />
                            <Tab label="Charts" icon={<BarChart />} iconPosition="start" />
                            <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" />
                        </Tabs>
                    )}
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            {isMobile && renderMobileDrawer()}

            {/* Main Content Area */}
            <Container
                maxWidth="lg"
                sx={{
                    flexGrow: 1,
                    py: { xs: 2, sm: 3, md: 4 },
                    px: { xs: 1, sm: 2, md: 3 }
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        minHeight: { xs: 'calc(100vh - 120px)', sm: 'calc(100vh - 140px)' },
                        bgcolor: 'transparent'
                    }}
                >
                    {renderActiveComponent()}
                </Paper>
            </Container>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    py: 2,
                    px: 2,
                    mt: 'auto',
                    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © 2026 Cost Manager Application. All data stored locally in your browser.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default App;
