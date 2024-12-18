import React, { useState } from "react";
import { FIREBASE_AUTH } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { styled } from "@mui/system";

// Logo components
const LogoContainer = styled('div')({
  position: 'absolute',
  top: '20px',
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
  overflow: 'hidden'
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

// Login Form Component
const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      alert("Login successful!");
      navigate("/");
    } catch (error) {
      setError("Wrong email or password. Please try again.");
    }
  };

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            overflow-x: hidden;
            margin: 0;
            padding: 0;
          }
        `}
      </style>

      <div
        style={{
          position: 'relative',
          minHeight: '100vh',
          backgroundColor: '#f4f4f4',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: 0,
          padding: 0,
		  fontFamily: "Poppins, sans-serif"
        }}
      >
        <LogoContainer>
          <Logo>
            <LogoImage src={require('../../assets/baby-picture.png')} alt="Baby" />
          </Logo>
          <LogoText>Babysitters</LogoText>
        </LogoContainer>

        <Container component="main" maxWidth="xs">
          <Box
            component="form"
            onSubmit={handleLogin}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              backgroundColor: 'white',
              padding: 3,
              borderRadius: '8px',
              boxShadow: 3,
            }}
          >
            <Typography variant="h4" component="h1" textAlign="center" sx={{ mb: 2, fontFamily: "Poppins, sans-serif" }}>
              Login
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              sx={{
                mb: 2,
				fontFamily: "Poppins, sans-serif"
              }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              sx={{
                mb: 2,
				fontFamily: "Poppins, sans-serif"
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#5e62d1',
                '&:hover': { backgroundColor: '#4a51a4' },
                mb: 2,
				fontFamily: "Poppins, sans-serif"
              }}
              fullWidth
            >
              Login
            </Button>
            <Typography variant="body2" textAlign="center" sx={{ mt: 2, fontFamily: "Poppins, sans-serif" }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>
                Register
              </Link>
            </Typography>
          </Box>
        </Container>
      </div>
    </>
  );
};

export default LoginForm;
