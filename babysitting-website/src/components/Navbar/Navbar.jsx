import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Button, Box, Avatar } from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../config/firebase';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const LogoContainer = styled('div')({
  position: 'absolute',
  top: '10px',
  left: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
});

const Logo = styled('div')({
  width: '50px',
  height: '50px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
});

const LogoImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const LogoText = styled('span')({
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#000000',
  fontFamily: 'Poppins, sans-serif',
});

const Navbar = () => {
  const [userPhoto, setUserPhoto] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setIsLoggedIn(true);
      fetchUserProfile(user.email);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const fetchUserProfile = async (email) => {
    try {
      const babysitterQuery = query(
        collection(FIREBASE_DB, 'babysitters'),
        where('email', '==', email)
      );
      const babysitterSnapshot = await getDocs(babysitterQuery);

      if (!babysitterSnapshot.empty) {
        const babysitterData = babysitterSnapshot.docs[0].data();
        setUserPhoto(babysitterData.photo);
        return;
      }

      // Check if the user is a guardian
      const guardianQuery = query(
        collection(FIREBASE_DB, 'guardians'),
        where('email', '==', email)
      );
      const guardianSnapshot = await getDocs(guardianQuery);

      if (!guardianSnapshot.empty) {
        const guardianData = guardianSnapshot.docs[0].data();
        setUserPhoto(guardianData.photo);
        return;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  return (
    <AppBar position="absolute" sx={{ background: 'transparent', boxShadow: 'none' }}>
      <Toolbar>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <LogoContainer>
            <Logo>
              <LogoImage src={require('../../assets/baby-picture.png')} alt="Baby" />
            </Logo>
            <LogoText>Babysitters</LogoText>
          </LogoContainer>
        </Link>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '10px' }}>
          <Button component={Link} to="/babysitters" sx={{ color: '#444444', fontWeight: 'bold' }}>
            Babysitters
          </Button>
          <Button component={Link} to="/babysitting-jobs" sx={{ color: '#444444', fontWeight: 'bold' }}>
            Babysitting Jobs
          </Button>
          <Button component={Link} to="/how-it-works" sx={{ color: '#444444', fontWeight: 'bold' }}>
            How it works
          </Button>
          <Button component={Link} to="/my-applications-and-jobs" sx={{ color: '#444444', fontWeight: 'bold' }}>
            My Applications & Jobs
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          {isLoggedIn && userPhoto ? (
            <Avatar src={userPhoto} sx={{ width: 40, height: 40 }} />
          ) : (
            <>
              <Button variant="outlined" component={Link} to="/register" sx={{ color: '#5e62d1' }}>
                Join
              </Button>
              <Button variant="contained" component={Link} to="/login" sx={{ color: '#fff', backgroundColor: '#5e62d1' }}>
                Log in
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
