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
    ListItemText,
    BottomNavigation,
    BottomNavigationAction,
    Divider
} from '@mui/material';
import {
    Menu as MenuIcon,
    AttachMoney,
    Assessment,
    BarChart,
    Settings as SettingsIcon,
    AddCircle,
    Close as CloseIcon
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
     * Checks browser support and initializes database
     */
    useEffect(() => {
        const initializeDatabase = async () => {
            // Check if IndexedDB is supported
            if (!window.indexedDB) {
                setDbError('Your browser does not support IndexedDB. Please use a modern browser like Chrome, Firefox, or Edge.');
                return;
            }

            try {
                await openCostsDB("costsdb", 1);
                setDbInitialized(true);
            } catch (error) {
                // Handle specific IndexedDB errors
                let errorMessage = 'Failed to initialize database';

                if (error.name === 'QuotaExceededError') {
                    errorMessage = 'Storage quota exceeded. Please free up some space in your browser.';
                } else if (error.name === 'InvalidStateError') {
                    errorMessage = 'Database is in an invalid state. Try clearing your browser data.';
                } else {
                    errorMessage = `${errorMessage}: ${error.message}`;
                }

                setDbError(errorMessage);
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
        { label: 'Reports & Charts', icon: <BarChart />, index: 1 },
        { label: 'Settings', icon: <SettingsIcon />, index: 2 }
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
            PaperProps={{
                sx: { width: { xs: '80%', sm: 280 }, maxWidth: 300 }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Drawer Header */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    bgcolor: 'primary.main',
                    color: 'white'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoney sx={{ mr: 1 }} />
                        <Typography variant="h6">Cost Manager</Typography>
                    </Box>
                    <IconButton color="inherit" onClick={toggleDrawer} size="large">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider />
                {/* Navigation List */}
                <List sx={{ flexGrow: 1, pt: 1 }}>
                    {navigationItems.map((item) => (
                        <ListItem key={item.label} disablePadding>
                            <ListItemButton
                                selected={activeTab === item.index}
                                onClick={(e) => handleTabChange(e, item.index)}
                                sx={{
                                    py: 2,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.light',
                                        '&:hover': { bgcolor: 'primary.light' }
                                    }
                                }}
                            >
                                <ListItemIcon sx={{
                                    color: activeTab === item.index ? 'primary.main' : 'inherit',
                                    minWidth: 48
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontWeight: activeTab === item.index ? 600 : 400
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );

    /**
     * Render mobile bottom navigation
     */
    const renderBottomNavigation = () => (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1100,
                display: { xs: 'block', sm: 'none' }
            }}
            elevation={8}
        >
            <BottomNavigation
                value={activeTab}
                onChange={(event, newValue) => setActiveTab(newValue)}
                showLabels
                sx={{
                    height: 64,
                    '& .MuiBottomNavigationAction-root': {
                        minWidth: 'auto',
                        py: 1,
                        '&.Mui-selected': {
                            color: 'primary.main'
                        }
                    },
                    '& .MuiBottomNavigationAction-label': {
                        fontSize: '0.7rem',
                        '&.Mui-selected': {
                            fontSize: '0.75rem'
                        }
                    }
                }}
            >
                <BottomNavigationAction label="Add" icon={<AddCircle />} />
                <BottomNavigationAction label="Reports" icon={<BarChart />} />
                <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
            </BottomNavigation>
        </Paper>
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
                            sx={{
                                ml: 'auto',
                                '& .MuiTab-root': {
                                    minHeight: 64,
                                    px: { sm: 2, md: 3 },
                                    fontSize: { sm: '0.8rem', md: '0.875rem' }
                                }
                            }}
                        >
                            <Tab
                                label={isTablet ? "Add" : "Add Cost"}
                                icon={<AttachMoney />}
                                iconPosition="start"
                            />
                            <Tab
                                label={isTablet ? "Reports" : "Reports & Charts"}
                                icon={<BarChart />}
                                iconPosition="start"
                            />
                            <Tab
                                label="Settings"
                                icon={<SettingsIcon />}
                                iconPosition="start"
                            />
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
                    py: { xs: 1.5, sm: 2, md: 3 },
                    px: { xs: 1, sm: 2, md: 3 },
                    // Add bottom padding on mobile for bottom navigation
                    pb: { xs: 10, sm: 2, md: 3 }
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        minHeight: { xs: 'calc(100vh - 180px)', sm: 'calc(100vh - 140px)' },
                        bgcolor: 'transparent'
                    }}
                >
                    {renderActiveComponent()}
                </Paper>
            </Container>

            {/* Mobile Bottom Navigation */}
            {renderBottomNavigation()}

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
