import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';

const FooterContainer = styled(Box)({
  backgroundColor: '#f4f4f4',
  padding: '40px 0',
  marginTop: '0px',
  textAlign: 'center',
  borderTop: '1px solid #ddd',
});

const FooterLogoContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '15px',
  marginBottom: '20px',
});

const FooterLogo = styled('img')({
  width: '40px',
  height: '40px',
  objectFit: 'cover',
});

const FooterText = styled(Typography)({
  color: '#333333',
  fontSize: '16px',
  fontWeight: '500',
  marginBottom: '10px',
  letterSpacing: '1px',
});

const FooterLinksContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '30px',
  marginBottom: '20px',
});

const FooterLink = styled(Button)({
  color: '#333333',
  fontWeight: 'bold',
  textTransform: 'none',
  '&:hover': {
    color: '#0066cc',
  },
});

const FooterInfoContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '40px',
  marginTop: '30px',
  maxWidth: '1000px',
  margin: '0 auto',
  flexWrap: 'wrap',
});

const FooterInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  textAlign: 'center',
});

const FooterContact = styled(Typography)({
  color: '#333333',
  fontSize: '14px',
  fontWeight: '400',
});

const FooterLocation = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  alignItems: 'flex-start',
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
