import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';

// Custom styled components for the footer
const FooterContainer = styled(Box)({
  backgroundColor: '#f4f4f4',
  padding: '20px 0',
  marginTop: '40px',
});

const FooterLogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  justifyContent: 'center',
  marginBottom: '10px',
});

const FooterLogo = styled('img')({
  width: '30px',
  height: '30px',
  objectFit: 'cover',
});

const FooterText = styled(Typography)({
  textAlign: 'center',
  color: '#333333',
  fontSize: '14px',
  marginBottom: '10px',
});

const FooterLinksContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '50px',
  marginBottom: '20px',
});

const FooterLink = styled(Button)({
  color: '#333333',
  fontWeight: 'bold',
  textTransform: 'none',
});

const FooterInfoContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  maxWidth: '1000px',
  margin: '0 auto',
});

const FooterInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  textAlign: 'center',
});

const FooterContact = styled(Typography)({
  color: '#333333',
  fontSize: '14px',
});

const FooterLocation = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  alignItems: 'flex-end',
});

const Footer = () => {
  return (
    <FooterContainer>
      <FooterLogoContainer>
        <FooterLogo src={require('../../assets/baby-picture.png')} alt="Footer Logo" />
        <FooterText>Copyright © Babysitters</FooterText>
      </FooterLogoContainer>

      <FooterLinksContainer>
        <FooterLink component={Link} to="/babysitters">Babysitters</FooterLink>
        <FooterLink component={Link} to="/babysitting-jobs">Babysitting Jobs</FooterLink>
        <FooterLink component={Link} to="/how-it-works">How it works</FooterLink>
      </FooterLinksContainer>

      <FooterInfoContainer>
        <FooterInfo>
          <FooterContact>Phone: +30 123 456 789</FooterContact>
          <FooterContact>Email: info@babysitters.com</FooterContact>
        </FooterInfo>

        <FooterLocation>
          <FooterContact>Athens</FooterContact>
          <FooterContact>Panepistimoupoli 16122, Greece</FooterContact>
        </FooterLocation>
      </FooterInfoContainer>
    </FooterContainer>
  );
};

export default Footer;
