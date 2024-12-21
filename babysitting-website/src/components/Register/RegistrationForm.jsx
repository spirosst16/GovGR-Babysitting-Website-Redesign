import React, { useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
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

// Logo components
const LogoContainer = styled("div")({
  position: "absolute",
  top: "10px",
  left: "20px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
});

const Logo = styled("div")({
  width: "50px",
  height: "50px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
});

const LogoImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const LogoText = styled("span")({
  fontSize: "24px",
  fontWeight: "bold",
  color: "#000000",
  fontFamily: "Poppins, sans-serif",
});

// Registration Form Component
const RegistrationForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegistration = async (role) => {
	try {
	  const userCredential = await createUserWithEmailAndPassword(
		FIREBASE_AUTH,
		email,
		password
	  );
	  const { uid } = userCredential.user;
  
	  try {
		const userDocRef = doc(FIREBASE_DB, "users", uid);
		await setDoc(userDocRef, {
		  email,
		  password,
		  role,
		});
	  } catch (dbError) {
		console.error("Firestore error:", dbError);
		setError("Failed to write to Firestore.");
		return;
	  }
  
	  const path = role === "Babysitter" ? "/babysitter-form" : "/guardian-form";
  
	  navigate(path, { state: { email, password } });
	} catch (error) {
	  console.error(error);
  
	  if (error.code === "auth/email-already-in-use") {
		setError("This email is already in use.");
	  } else if (error.code === "auth/invalid-email") {
		setError("The email address is not valid.");
	  } else if (error.code === "auth/weak-password") {
		setError("The password is too weak.");
	  } else {
		setError(`An error occurred while registering as a ${role}. Please try again.`);
	  }
	}
  };  

  return (
    <>
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          backgroundColor: "#f4f4f4",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: 0,
          padding: 0,
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <LogoContainer>
          <Logo>
            <LogoImage src={require("../../assets/baby-picture.png")} alt="Baby" />
          </Logo>
          <LogoText>Babysitters</LogoText>
        </LogoContainer>

        <Container component="main" maxWidth="xs">
          <Box
            component="form"
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              backgroundColor: "white",
              padding: 3,
              borderRadius: "8px",
              boxShadow: 3,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              textAlign="center"
              sx={{ mb: 2, fontFamily: "Poppins, sans-serif" }}
            >
              Register
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
              }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                width: "100%",
              }}
            >
              <Button
                onClick={() => handleRegistration("Babysitter")}
                variant="contained"
                sx={{
                  backgroundColor: "#5e62d1",
                  "&:hover": { backgroundColor: "#4a4fbf" },
                  fontFamily: "Poppins, sans-serif",
                  flex: 1,
                }}
              >
                Register as Babysitter
              </Button>
              <Button
                onClick={() => handleRegistration("Guardian")}
                variant="contained"
                sx={{
                  backgroundColor: "#5e62d1",
                  "&:hover": { backgroundColor: "#4a4fbf" },
                  fontFamily: "Poppins, sans-serif",
                  flex: 1,
                }}
              >
                Register as Guardian
              </Button>
            </Box>
            <Typography
              variant="body2"
              textAlign="center"
              sx={{ mt: 2, fontFamily: "Poppins, sans-serif" }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{ textDecoration: "none", color: "#1976d2" }}
              >
                Login
              </Link>
            </Typography>
          </Box>
        </Container>
      </div>
    </>
  );
};

export default RegistrationForm;
