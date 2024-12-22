import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Button, Box, Avatar, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/system';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FIREBASE_DB } from '../../config/firebase';
import { getAuth, signOut } from 'firebase/auth';
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
  const navigate = useNavigate();
  const location = useLocation();

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
        setUserInitials(getInitials(babysitterData.name));
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
        return;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
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
      navigate('/logout');
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
          {isLoggedIn ? (
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
