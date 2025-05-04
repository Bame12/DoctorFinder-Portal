// src/components/Reports/Reports.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import {
    Container,
    Typography,
    Grid,
    Paper,
    Box,
    AppBar,
    Toolbar,
    Button,
    MenuItem,
    TextField,
    CircularProgress
} from '@mui/material';
import { ExitToApp as LogoutIcon } from '@mui/icons-material';
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function Reports() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportType, setReportType] = useState('specialty');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const doctorsRef = collection(db, 'doctors');
            const unsubscribe = onSnapshot(doctorsRef, (snapshot) => {
                const doctorsList = [];

                snapshot.forEach((doc) => {
                    doctorsList.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                setDoctors(doctorsList);
                setLoading(false);
            });

            // Cleanup subscription on unmount
            return () => unsubscribe();
        } catch (error) {
            setError("Error fetching data: " + error.message);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        signOut(auth).then(() => {
            navigate('/login');
        });
    };

    const getSpecialtyData = () => {
        const specialtyCounts = {};

        doctors.forEach(doctor => {
            if (doctor.specialty) {
                specialtyCounts[doctor.specialty] = (specialtyCounts[doctor.specialty] || 0) + 1;
            }
        });

        const labels = Object.keys(specialtyCounts);
        const data = Object.values(specialtyCounts);

        return {
            labels,
            datasets: [
                {
                    label: 'Doctors by Specialty',
                    data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
                        // Add more colors as needed
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    const getExperienceData = () => {
        const experienceBins = {
            '0-5 years': 0,
            '6-10 years': 0,
            '11-15 years': 0,
            '16-20 years': 0,
            '20+ years': 0
        };

        doctors.forEach(doctor => {
            const exp = Number(doctor.experience);
            if (!isNaN(exp)) {
                if (exp <= 5) experienceBins['0-5 years']++;
                else if (exp <= 10) experienceBins['6-10 years']++;
                else if (exp <= 15) experienceBins['11-15 years']++;
                else if (exp <= 20) experienceBins['16-20 years']++;
                else experienceBins['20+ years']++;
            }
        });

        return {
            labels: Object.keys(experienceBins),
            datasets: [
                {
                    label: 'Doctors by Experience',
                    data: Object.values(experienceBins),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                },
            ],
        };
    };

    const getSummaryData = () => {
        const availableDoctors = doctors.filter(doctor => doctor.isAvailable).length;
        const specialties = new Set();
        doctors.forEach(doctor => {
            if (doctor.specialty) {
                specialties.add(doctor.specialty);
            }
        });

        return {
            totalDoctors: doctors.length,
            availableDoctors,
            unavailableDoctors: doctors.length - availableDoctors,
            specialtyCount: specialties.size
        };
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const summaryData = getSummaryData();

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
                    Reports
                </Typography>

                {error && (
                    <Box mb={4}>
                        <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                            <Typography>{error}</Typography>
                        </Paper>
                    </Box>
                )}

                {/* Summary Cards */}
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="h6" color="textSecondary">Total Doctors</Typography>
                            <Typography variant="h3">{summaryData.totalDoctors}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="h6" color="textSecondary">Available Doctors</Typography>
                            <Typography variant="h3">{summaryData.availableDoctors}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="h6" color="textSecondary">Unavailable Doctors</Typography>
                            <Typography variant="h3">{summaryData.unavailableDoctors}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="h6" color="textSecondary">Total Specialties</Typography>
                            <Typography variant="h3">{summaryData.specialtyCount}</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Report Type Selector */}
                <Box mb={4}>
                    <TextField
                        select
                        label="Report Type"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        sx={{ minWidth: 200 }}
                    >
                        <MenuItem value="specialty">Specialty Distribution</MenuItem>
                        <MenuItem value="experience">Experience Distribution</MenuItem>
                    </TextField>
                </Box>

                {/* Charts */}
                <Grid container spacing={3}>
                    {reportType === 'specialty' && (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>Doctors by Specialty</Typography>
                                <Box sx={{ height: 400 }}>
                                    <Pie data={getSpecialtyData()} options={{ maintainAspectRatio: false }} />
                                </Box>
                            </Paper>
                        </Grid>
                    )}

                    {reportType === 'experience' && (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>Doctors by Years of Experience</Typography>
                                <Box sx={{ height: 400 }}>
                                    <Bar
                                        data={getExperienceData()}
                                        options={{
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                                title: {
                                                    display: true,
                                                    text: 'Experience Distribution',
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </>
    );
}

export default Reports;