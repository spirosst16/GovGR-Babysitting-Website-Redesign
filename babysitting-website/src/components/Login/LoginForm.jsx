import React, { useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
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
import '../../style.css';

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

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const checkUserRoleAndNavigate = async (uid) => {
    try {

	const babysitterQuery = query(
		collection(FIREBASE_DB, "babysitters"),
		where("email", "==", email)
		);
		const babysitterSnapshot = await getDocs(babysitterQuery);

		if (!babysitterSnapshot.empty) {
		navigate("/");
		return;
		}

		const guardianQuery = query(
		collection(FIREBASE_DB, "guardians"),
		where("email", "==", email)
		);
		const guardianSnapshot = await getDocs(guardianQuery);

		if (!guardianSnapshot.empty) {
		navigate("/");
		return;
		}

      const userDoc = await getDoc(doc(FIREBASE_DB, "users", uid));
      const role = userDoc.data()?.role;

      if (role === "Babysitter") {
        navigate("/babysitter-form", { state: { email } });
      } else if (role === "Guardian") {
        navigate("/guardian-form", { state: { email } });
      } else {
        setError("Role not defined. Please contact support.");
      }
    } catch (dbError) {
      console.error("Error checking user role:", dbError);
      setError("Failed to verify user role. Please try again.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const { uid } = userCredential.user;
      await checkUserRoleAndNavigate(uid);
    } catch (authError) {
      console.error("Authentication error:", authError);
      setError("Wrong email or password. Please try again.");
    }
  };

  return (
    <>
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
                fontFamily: "Poppins, sans-serif",
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#5e62d1', // Change border color on focus
                  },
                },
                '& .MuiInputLabel-root': {
                  fontFamily: 'Poppins, sans-serif', // Ensure font matches
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#5e62d1', // Change label color on focus
                },
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
                fontFamily: "Poppins, sans-serif",
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#5e62d1',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontFamily: 'Poppins, sans-serif',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#5e62d1',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#5e62d1',
                '&:hover': { backgroundColor: '#4a51a4' },
                mb: 1,
				        fontFamily: "Poppins, sans-serif",
                fontSize: '1rem',
                borderRadius: '20px',
                textTransform: 'none'
              }}
              fullWidth
            >
              Login
            </Button>
            <Typography
              variant="body2"
              textAlign="center"
              sx={{ mt: 2, fontFamily: "Poppins, sans-serif" }}
            >
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  textDecoration: 'none',
                  color: '#5e62d1',
                  borderRadius: '0',
                  transition: 'all 0.3s',
                  padding: '2px 6px',
                }}
                onMouseOver={(e) => {
                  e.target.style.textDecoration = 'underline';
                  e.target.style.color = '#4845a2';
                  e.target.style.borderRadius = '30px';
                  e.target.style.backgroundColor = 'rgba(94, 98, 209, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.textDecoration = 'none';
                  e.target.style.color = '#5e62d1';
                  e.target.style.borderRadius = '0';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
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
