import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';


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

// Navbar Component
const Navbar = () => {
  return (
    <AppBar position="fixed" sx={{ background: 'transparent', boxShadow: 'none' }}>
      <Toolbar>
        <LogoContainer>
          <Logo>
            <LogoImage src={require('../../assets/baby-picture.png')} alt="Baby" />
          </Logo>
          <LogoText>Babysitters</LogoText>
        </LogoContainer>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: '30px' }}>
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
        <Box sx={{ display: 'flex', gap: '10px' }}>
          <Button variant="outlined" component={Link} to="/register" sx={{ color: '#5e62d1' }}>
            Join
          </Button>
          <Button variant="contained" component={Link} to="/login" sx={{ color: '#fff', backgroundColor: '#5e62d1' }}>
            Log in
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};


export default Navbar;