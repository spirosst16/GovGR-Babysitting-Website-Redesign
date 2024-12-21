import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../config/firebase';
import { getAuth } from 'firebase/auth';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

// Styled components
const ApplicationCard = styled(Card)({
  marginBottom: '0px',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  borderRadius: '10px',
});

const ApplicationActions = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '15px',
});

const HeroSection = styled(Box)({
  padding: '100px 20px',
  backgroundColor: '#f4f4f4',
  textAlign: 'center',
  marginBottom: '0px',
});

const ActionButton = styled(Button)({
  backgroundColor: '#5e62d1',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#4d56b1',
  },
});

const MyApplicationsJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        const babysitterApplicationsRef = collection(FIREBASE_DB, 'babysitterApplications');
        const querySnapshot = await getDocs(
          query(babysitterApplicationsRef, where('userId', '==', currentUser.uid))
        );
        const applicationsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApplications(applicationsList);
      } else {
        setApplications([]);
      }

      setLoading(false);
    };

    fetchApplications();
  }, []);

  const handleEditApplication = async (applicationId) => {
    const applicationRef = doc(FIREBASE_DB, 'babysitterApplications', applicationId);
    const updatedFields = { status: 'draft' };
    await updateDoc(applicationRef, updatedFields);
    alert('Application updated to draft status!');
    setApplications(prevApplications =>
      prevApplications.map(app =>
        app.id === applicationId ? { ...app, status: 'draft' } : app
      )
    );
  };

  const handleDeleteApplication = async (applicationId) => {
    const applicationRef = doc(FIREBASE_DB, 'babysitterApplications', applicationId);
    await updateDoc(applicationRef, { status: 'deleted' });
    alert('Application deleted!');
    setApplications(prevApplications =>
      prevApplications.filter(app => app.id !== applicationId)
    );
  };

  return (
    <>
      <Navbar />
      <HeroSection>
        <Typography variant="h4" style={{ fontFamily: 'Poppins, sans-serif', marginBottom: '20px' }}>
          My Applications & Jobs
        </Typography>
        <Typography variant="h6" style={{ fontFamily: 'Poppins, sans-serif', color: '#555' }}>
          Review your applications and current jobs below.
        </Typography>
      </HeroSection>

      <Box style={{ backgroundColor: '#5e62d1', padding: '40px 20px' }}>
        <Container maxWidth="lg">
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          ) : (
            <>
              {applications.length > 0 ? (
                applications.map(application => (
                  <ApplicationCard key={application.id}>
                    <CardContent>
                      <Typography variant="h5" style={{ fontFamily: 'Poppins, sans-serif', color: '#333' }}>
                        {application.area}
                      </Typography>
                      <Typography variant="body1" color="textSecondary" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Job Type: {application.jobType}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Availability: {application.availability.join(', ')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Babysitting Place: {application.babysittingPlace.join(', ')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" style={{ fontFamily: 'Poppins, sans-serif', marginTop: '10px' }}>
                        Status: {application.status}
                      </Typography>
                    </CardContent>

                    <ApplicationActions>
                      <ActionButton variant="outlined" onClick={() => handleEditApplication(application.id)}>
                        Edit Application
                      </ActionButton>
                      {application.status !== 'deleted' && (
                        <ActionButton variant="outlined" onClick={() => handleDeleteApplication(application.id)}>
                          Delete
                        </ActionButton>
                      )}
                    </ApplicationActions>
                  </ApplicationCard>
                ))
              ) : (
                <Typography variant="body1" style={{ textAlign: 'center', color: '#888' }}>
                  You have no applications or jobs yet.
                </Typography>
              )}
            </>
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default MyApplicationsJobs;
