import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    AppBar,
    Toolbar,
    Button,
    Card,
    CardContent,
} from '@mui/material';
import {
    MenuBook as DoctorIcon,
    Category as SpecialtyIcon,
    ExitToApp as LogoutIcon
} from '@mui/icons-material';

function Dashboard() {
    const navigate = useNavigate();
    const [doctorCount, setDoctorCount] = useState(0);
    const [specialtyCount, setSpecialtyCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            // Count doctors
            const doctorsSnapshot = await getDocs(collection(db, "doctors"));
            setDoctorCount(doctorsSnapshot.size);

            // Get unique specialties
            const specialties = new Set();
            doctorsSnapshot.forEach(doc => {
                const doctorData = doc.data();
                if (doctorData.specialty) {
                    specialties.add(doctorData.specialty);
                }
            });
            setSpecialtyCount(specialties.size);
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        signOut(auth).then(() => {
            navigate('/login');
        });
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Doctor Finder Admin
                    </Typography>
                    <Button color="inherit" onClick={() => navigate('/')}>Dashboard</Button>
                    <Button color="inherit" onClick={() => navigate('/doctors')}>Doctors</Button>
                    <Button color="inherit" onClick={() => navigate('/reports')}>Reports</Button>
                    <Button color="inherit" onClick={handleLogout} endIcon={<LogoutIcon />}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Dashboard
                </Typography>

                <Grid container spacing={3}>
                    {/* Total doctors card */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center">
                                    <DoctorIcon fontSize="large" color="primary" />
                                    <Box ml={2}>
                                        <Typography color="textSecondary" gutterBottom>
                                            Total Doctors
                                        </Typography>
                                        <Typography variant="h3">
                                            {doctorCount}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Total specialties card */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center">
                                    <SpecialtyIcon fontSize="large" color="primary" />
                                    <Box ml={2}>
                                        <Typography color="textSecondary" gutterBottom>
                                            Total Specialties
                                        </Typography>
                                        <Typography variant="h3">
                                            {specialtyCount}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Quick actions */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography variant="h6">Quick Actions</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/doctors/add')}
                                    >
                                        Add New Doctor
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/doctors')}
                                    >
                                        Manage Doctors
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/reports')}
                                    >
                                        View Reports
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}

export default Dashboard;