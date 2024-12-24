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
import { useNavigate, useLocation } from "react-router-dom";
import defaultProfile from "../../assets/default-profile.jpg";
import { getAuth } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import "../../style.css";

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

const languages = [
  "Greek",
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Hindi",
  "Arabic",
  "Russian",
  "Portuguese",
  "Italian",
  "Korean",
];

const childcareActivities = [
  "Arts and Crafts",
  "Storytelling",
  "Outdoor Play",
  "Meal Preparation",
  "Tutoring",
  "Nap Time Assistance",
];

// Babysitter Info Form Component
const BabysitterInfoForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password } = location.state || {};
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
    knownLanguages: [],
    childcareActivities: [],
    bio: "",
    photo: "",
    educationProofUploaded: false,
    recommendationLettersUploaded: false,
    firstAidCertificateUploaded: false,
    rating: 0,
    reviews: [],
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Personal Information",
    "Experience & Education",
    "Bio & Photo",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleNext = () => {
    const requiredFields = {
      0: [
        "firstName",
        "lastName",
        "gender",
        "dateOfBirth",
        "street",
        "number",
        "city",
        "postal",
        "email",
        "phone",
      ],
      1: ["experience", "education", "knownLanguages", "childcareActivities"],
      2: ["bio", "photo"],
    };

    const missingFields = requiredFields[currentStep].filter(
      (field) =>
        !formValues[field] ||
        (Array.isArray(formValues[field]) && formValues[field].length === 0)
    );

    if (missingFields.length > 0) {
      alert(
        `Please fill out the following fields: ${missingFields.join(", ")}`
      );
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormValues({ ...formValues, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const key in formValues) {
      if (formValues[key] === "") {
        alert(`Please fill out the ${key} field.`);
        return;
      }
    }

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("You must be logged in to submit the application.");
        return;
      }
      const babysittersCollectionRef = collection(FIREBASE_DB, "babysitters");

      await addDoc(babysittersCollectionRef, {
        ...formValues,
        userId: currentUser.uid,
      });

      console.log("Document written successfully!");
      alert("Form submitted successfully!");

      navigate("/babysitting-jobs");

      setFormValues({
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
        knownLanguages: [],
        childcareActivities: [],
        bio: "",
        photo: "",
        educationProofUploaded: false,
        recommendationLettersUploaded: false,
        firstAidCertificateUploaded: false,
        rating: 0,
        reviews: [],
      });
      setCurrentStep(0);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error submitting form. Please try again.");
    }
  };

  const handleFileUpload = (fieldName) => () => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
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
                    value={formValues.email || ""}
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
                  sx={{
                    mb: 2,
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  Experience & Education
                </Typography>
                <TextField
                  label="Experience"
                  name="experience"
                  value={formValues.experience}
                  onChange={handleChange}
                  required
                  fullWidth
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Education"
                  name="education"
                  value={formValues.education}
                  onChange={handleChange}
                  required
                  fullWidth
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                />
                <TextField
                  select
                  label="Known Languages"
                  name="knownLanguages"
                  value={formValues.knownLanguages}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      knownLanguages: e.target.value,
                    })
                  }
                  SelectProps={{
                    multiple: true,
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 190,
                          marginTop: "10px",
                        },
                      },
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                    },
                  }}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {languages.map((language) => (
                    <MenuItem
                      key={language}
                      value={language}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f0f0f0",
                        },
                      }}
                    >
                      {language}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Childcare Activities"
                  name="childcareActivities"
                  value={formValues.childcareActivities}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      childcareActivities: e.target.value,
                    })
                  }
                  SelectProps={{
                    multiple: true,
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 115,
                          marginTop: "10px",
                        },
                      },
                    },
                  }}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {childcareActivities.map((activity) => (
                    <MenuItem key={activity} value={activity}>
                      {activity}
                    </MenuItem>
                  ))}
                </TextField>
                <Box sx={{ mb: 2 }}>
                  <Box>
                    <Button component="label" sx={{ mt: 1, mb: 1 }}>
                      Upload Education Proof
                      <input
                        type="file"
                        hidden
                        onChange={handleFileUpload("educationProofUploaded")}
                      />
                    </Button>
                    {formValues.educationProofUploaded && (
                      <Typography variant="body2" color="green">
                        Uploaded
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Button component="label" sx={{ mt: 1, mb: 1 }}>
                      Upload Letters of Recommendation
                      <input
                        type="file"
                        hidden
                        onChange={handleFileUpload(
                          "recommendationLettersUploaded"
                        )}
                      />
                    </Button>
                    {formValues.recommendationLettersUploaded && (
                      <Typography variant="body2" color="green">
                        Uploaded
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Button component="label" sx={{ mt: 1, mb: 1 }}>
                      Upload First Aid Certificate
                      <input
                        type="file"
                        hidden
                        onChange={handleFileUpload(
                          "firstAidCertificateUploaded"
                        )}
                      />
                    </Button>
                    {formValues.firstAidCertificateUploaded && (
                      <Typography variant="body2" color="green">
                        Uploaded
                      </Typography>
                    )}
                  </Box>
                </Box>
              </div>
            )}

            {currentStep === 2 && (
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
                  Bio & Photo
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <TextField
                    label="Bio"
                    name="bio"
                    value={formValues.bio}
                    onChange={handleChange}
                    required
                    fullWidth
                    multiline
                    rows={6}
                    sx={{ flex: 1 }}
                  />

                  <Box
                    sx={{
                      position: "relative",
                      width: "240px",
                      height: "240px",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      border: "2px dashed white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={formValues.photo || defaultProfile}
                      alt="Profile"
                      style={{
                        width: "200px",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "2px solid white",
                        backgroundColor: "white",
                      }}
                    />

                    <Button
                      component="label"
                      sx={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        width: "50px",
                        height: "50px",
                        backgroundColor: "#5e62d1",
                        color: "white",
                        borderRadius: "100%",
                        fontSize: "24px",
                        fontWeight: "bold",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      +
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
                alignItems: "center",
              }}
            >
              <Button
                onClick={handleBack}
                variant="contained"
                sx={{
                  backgroundColor: "#5e62d1",
                  "&:hover": {
                    backgroundColor: "#4a4fbf",
                  },
                }}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  sx={{
                    backgroundColor: "#5e62d1",
                    "&:hover": {
                      backgroundColor: "#4a4fbf",
                    },
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  sx={{
                    backgroundColor: "#5e62d1",
                    "&:hover": {
                      backgroundColor: "#4a4fbf",
                    },
                  }}
                >
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
