# Cost Manager Front-End Project - Final Submission

================================================================================
## TEAM INFORMATION
================================================================================

**TEAM MANAGER:**
- First Name: Shai
- Last Name: Dahari
- ID: 066420431

**TEAM MEMBERS:**

| # | First Name | Last Name | ID | Mobile | Email |
|---|------------|-----------|-----|--------|-------|
| 1 | Shai | Dahari | 066420431 | [YOUR MOBILE] | [YOUR EMAIL] |
| 2 | Amit | Yehoshafat | 212359442 | [AMIT'S MOBILE] | [AMIT'S EMAIL] |

================================================================================
## PROJECT LINKS
================================================================================

**Deployment URL:** https://aesthetic-boba-eef086.netlify.app/

**Video Link:** [ADD YOUR YOUTUBE UNLISTED VIDEO LINK HERE]

================================================================================
## COLLABORATIVE TOOLS SUMMARY (100 words)
================================================================================

Git and GitHub served as our primary collaboration platform, enabling effective teamwork despite our limited experience. We utilized branching to work on different features simultaneously without conflicts, and merging allowed us to integrate our changes seamlessly. Version control helped us track modifications and revert to previous states when needed. For communication, we used Zoom and Discord for real-time meetings to discuss project requirements and resolve issues. We also leveraged AI tools like NotebookLLM to document meeting notes efficiently. While we considered Slack initially, we found it unnecessary for our small two-person team, as direct communication through video calls proved more effective.

================================================================================
## ADDITIONAL COMMENTS
================================================================================

This Cost Manager application is a React-based front-end project built with Material-UI (MUI) for the user interface. The application uses IndexedDB for local data storage and supports multi-currency expense tracking with real-time exchange rate conversion.

**Key Features:**
- Add expense items with amount, currency, category, and description
- View detailed monthly reports with currency conversion
- Visualize expenses with pie charts (by category) and bar charts (monthly trends)
- Configure custom exchange rate API URLs
- All data persisted locally using IndexedDB

**Technical Stack:**
- React 19.2.0
- Material-UI (MUI) v7.3.6
- Recharts for data visualization
- IndexedDB for local storage
- Vite for build tooling

================================================================================
## CODE FILES (13 Files)
================================================================================

================================================================================
### FILE 1: src/App.jsx
================================================================================

```jsx
/**
 * Cost Manager Application - Main application entry point
 * Provides navigation, responsive layout, and database initialization
 * Manages tab-based routing between CostForm, Dashboard, and Settings
 * @returns {JSX.Element} Complete application with mobile-responsive navigation
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

// Application components and database utilities
import CostForm from './components/CostForm';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { openCostsDB } from './utils/idb';

/**
 * Main Application component with responsive navigation and database management
 */
const App = () => {
    // Navigation state - manages active tab and mobile drawer
    const [activeTab, setActiveTab] = useState(0);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    // Data state - triggers component refresh and tracks database status
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [dbInitialized, setDbInitialized] = useState(false);
    const [dbError, setDbError] = useState(null);

    // Responsive design hooks - detect screen size for layout adaptation
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    /**
     * Initialize IndexedDB database on application startup
     * Verifies browser support and sets up database connection
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
     * Handle successful cost addition by triggering data refresh
     * Increments refresh trigger to update Dashboard with new data
     */
    const handleCostAdded = () => {
        // Increment trigger to force Dashboard re-render and data reload
        setRefreshTrigger(prev => prev + 1);
    };

    /**
     * Toggle mobile navigation drawer open/closed state
     */
    const toggleDrawer = () => {
        setMobileDrawerOpen(!mobileDrawerOpen);
    };

    // Navigation configuration - defines tabs with labels and icons
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
```

================================================================================
### FILE 2: src/index.css
================================================================================

```css
:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}
```

================================================================================
### FILE 3: src/App.css
================================================================================

```css
#root {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
}
.magical {
    color: orange;
}
```

================================================================================
### FILE 4: src/components/CostForm.jsx
================================================================================

[FILE CONTENT CONTINUES - Due to length, the remaining 10 files follow the same format]

================================================================================
## END OF PDF CONTENT
================================================================================

**IMPORTANT NOTES FOR PDF CREATION:**
1. Use landscape orientation to prevent line breaks
2. Use a monospace font (Consolas, Courier New) for code
3. Ensure file names are clearly visible
4. Test PDF on different viewers before submission
5. Name the file: shai_dahari.pdf
