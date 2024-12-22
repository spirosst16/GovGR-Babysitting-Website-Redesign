import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Button, Box, Avatar, Menu, MenuItem, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FIREBASE_DB } from '../../config/firebase';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
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

const DropdownButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '5px 10px',
  borderRadius: '25px',
  cursor: 'pointer',
  transition: 'background-color 0.3s, color 0.3s, outline 0.3s',
  outline: '2px solid #444444',
  '&:hover': {
    backgroundColor: '#ffffff',
    outline: '2px solid #000',
    span: {
      color: '#000',
    },
  },
  span: {
    color: '#444444',
  },
}));

const Navbar = () => {
  const [userPhoto, setUserPhoto] = useState(null);
  const [userInitials, setUserInitials] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        fetchUserProfile(user.email);
      } else {
        setIsLoggedIn(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
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
        setUserInitials(getInitials(babysitterData.name));
        setLoading(false);
        return;
      }

      const guardianQuery = query(
        collection(FIREBASE_DB, 'guardians'),
        where('email', '==', email)
      );
      const guardianSnapshot = await getDocs(guardianQuery);

      if (!guardianSnapshot.empty) {
        const guardianData = guardianSnapshot.docs[0].data();
        setUserPhoto(guardianData.photo);
        setUserInitials(getInitials(guardianData.name));
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    const initials = name.split(' ').map((n) => n[0].toUpperCase()).join('');
    return initials.slice(0, 2);
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      setIsLoggedIn(false);
      setLoading(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
    handleMenuClose();
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
          {[
            { to: '/babysitters', label: 'Babysitters' },
            { to: '/babysitting-jobs', label: 'Babysitting Jobs' },
            { to: '/how-it-works', label: 'How it works' },
            { to: '/my-applications-and-jobs', label: 'My Applications & Jobs', requiresLogin: true },
          ].map(
            ({ to, label, requiresLogin }) =>
              (!requiresLogin || isLoggedIn) && (
                <Button
                  key={to}
                  component={Link}
                  to={to}
                  sx={{
                    color: location.pathname === to ? '#000' : '#444444',
                    fontWeight: 'bold',
                    backgroundColor: location.pathname === to ? '#ffffff' : 'transparent',
                    borderRadius: '5px',
                    '&:hover': {
                      color: '#000',
                    },
                  }}
                >
                  {label}
                </Button>
              )
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          {loading ? (
            <CircularProgress size={24} sx={{ color: '#5e62d1' }} />
          ) : isLoggedIn ? (
            <>
              <DropdownButton onClick={handleAvatarClick}>
                <Avatar
                  src={userPhoto}
                  sx={{ width: 35, height: 35, marginRight: '5px' }}
                >
                  {!userPhoto && userInitials}
                </Avatar>
                <span>▼</span>
              </DropdownButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                component={Link}
                to="/register"
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  color: '#5e62d1',
                  borderColor: '#5e62d1',
                  borderRadius: '30px',
                  padding: '8px 20px',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#5e62d1',
                    backgroundColor: '#f0f4ff',
                  },
                }}
              >
                Join
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/login"
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  color: '#fff',
                  backgroundColor: '#5e62d1',
                  borderRadius: '30px',
                  padding: '8px 20px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#4a54c2',
                  },
                }}
              >
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
