import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { styled } from "@mui/system";
import defaultProfile from "../../assets/default-profile.jpg";
import { collection, addDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import { useLocation } from "react-router-dom";

// Logo components
const LogoContainer = styled("div")({
  position: "absolute",
  top: "20px",
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

// Babysitter Info Form Component
const BabysitterInfoForm = () => {
  const location = useLocation();
  const { email, password } = location.state || {}; // Retrieve the email and password passed from RegistrationForm

  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    street: "",
    number: "",
    city: "",
    postal: "",
    email: email || "",
    phone: "",
    experience: "",
    education: "",
    bio: "",
    photo: "",
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = ["Personal Information", "Experience & Education", "Bio & Photo"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormValues({ ...formValues, photo: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const babysittersCollection = collection(FIREBASE_DB, "babysitters");

      const docRef = await addDoc(babysittersCollection, formValues);

      console.log("Document written with ID: ", docRef.id);
      alert("Form submitted successfully!");

      setFormValues({
        firstName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        street: "",
        number: "",
        city: "",
        postal: "",
        email: "",
        phone: "",
        experience: "",
        education: "",
        bio: "",
        photo: "",
      });
      setCurrentStep(0);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error submitting form. Please try again.");
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
            font-family: "Poppins, sans-serif";
          }
        `}
      </style>

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
            <LogoImage
              src={require("../../assets/baby-picture.png")}
              alt="Baby"
            />
          </Logo>
          <LogoText>Babysitters</LogoText>
        </LogoContainer>

        <Container component="main" maxWidth="md">
          <Stepper
            activeStep={currentStep}
            alternativeLabel
            sx={{
              ".MuiStepIcon-root": {
                color: "#5e62d1",
              },
              ".MuiStepIcon-root.Mui-active": {
                color: "#5e62d1",
              },
              ".MuiStepIcon-root.Mui-completed": {
                color: "#5e62d1",
              },
            }}
          >
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              backgroundColor: "white",
              padding: 3,
              borderRadius: "8px",
              boxShadow: 3,
              fontFamily: "Poppins, sans-serif",
              marginTop: 3,
            }}
          >
            {currentStep === 0 && (
              <div>
                <Typography
                  variant="h4"
                  component="h1"
                  textAlign="center"
                  sx={{
                    mb: 2,
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  Personal Information
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <TextField
                    label="First Name"
                    name="firstName"
                    value={formValues.firstName}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  />
                  <TextField
                    label="Last Name"
                    name="lastName"
                    value={formValues.lastName}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  />
                  <TextField
                    select
                    label="Gender"
                    name="gender"
                    value={formValues.gender}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                  <TextField
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formValues.dateOfBirth}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                    fullWidth
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  />
                  <TextField
                    label="Street"
                    name="street"
                    value={formValues.street}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  />
                  <TextField
                    label="No."
                    name="number"
                    value={formValues.number}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  />
                  <TextField
                    label="City"
                    name="city"
                    value={formValues.city}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  />
                  <TextField
                    label="Postal"
                    name="postal"
                    value={formValues.postal}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  />
                  <TextField
                    label="E-Mail"
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleChange}
                    required
                    fullWidth
					InputProps={{
					readOnly: true,
					}}
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  />
                  <TextField
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formValues.phone}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  />
                </Box>
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <Typography
                  variant="h4"
                  component="h1"
                  textAlign="center"
                  sx={{ mb: 2 }}
                >
                  Experience & Education
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Experience"
                    name="experience"
                    value={formValues.experience}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Education"
                    name="education"
                    value={formValues.education}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                </Box>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <Typography
                  variant="h4"
                  component="h1"
                  textAlign="center"
                  sx={{ mb: 2 }}
                >
                  Bio & Photo
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Bio"
                    name="bio"
                    value={formValues.bio}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    required
                    fullWidth
                  />
                  <Box sx={{ textAlign: "center" }}>
                    <img
                      src={formValues.photo || defaultProfile}
                      alt="Profile"
                      style={{ width: "100px", height: "100px", borderRadius: "50%", marginBottom: "10px" }}
                    />
                    <Button
                      variant="contained"
                      component="label"
                      sx={{ mt: 1 }}
                    >
                      Upload Photo
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Button>
                  </Box>
                </Box>
              </div>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 3,
              }}
            >
              <Button
                onClick={handleBack}
                disabled={currentStep === 0}
                variant="outlined"
              >
                Back
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} variant="contained">
                  Next
                </Button>
              ) : (
                <Button type="submit" variant="contained">
                  Submit
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </div>
    </>
  );
};

export default BabysitterInfoForm;
