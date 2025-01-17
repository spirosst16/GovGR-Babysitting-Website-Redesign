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
  Snackbar,
  Alert,
  Autocomplete,
} from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate, useLocation } from "react-router-dom";
import defaultProfile from "../../assets/default-profile.jpg";
import { getAuth } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import UploadIcon from "@mui/icons-material/Upload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { greekCities } from "../../utils/greekCities";
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

const StyledTextField = styled(TextField)({
  fontFamily: "'Poppins', sans-serif",
  color: "#5e62d1",
  "& .MuiInputBase-input": {
    fontFamily: "'Poppins', sans-serif",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#ccc",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#5e62d1",
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#5e62d1",
  },
});

const StyledButton = styled(Button)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: "1rem",
  textTransform: "none",
  borderRadius: "30px",
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
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "",
  });

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
      setAlert({
        open: true,
        message: `Please fill out the following fields: ${missingFields.join(
          ", "
        )}`,
        severity: "error",
      });
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
        setAlert({
          open: true,
          message: `Please fill out the ${key} field.`,
          severity: "error",
        });
        return;
      }
    }

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setAlert({
          open: true,
          message: "You must be logged in to submit the application.",
          severity: "error",
        });
        return;
      }
      const babysittersCollectionRef = collection(FIREBASE_DB, "babysitters");

      await addDoc(babysittersCollectionRef, {
        ...formValues,
        userId: currentUser.uid,
      });

      console.log("Document written successfully!");
      setAlert({
        open: true,
        message: "Register was successfull!",
        severity: "success",
      });

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
      setAlert({
        open: true,
        message: "Error submitting register form. Please try again.",
        severity: "error",
      });
    }
  };

  const handleFileUpload = (fieldName) => () => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  };

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
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
        <LogoContainer
          onClick={() => navigate("/")}
          sx={{
            cursor: "pointer",
          }}
        >
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
                  <StyledTextField
                    label="First Name"
                    name="firstName"
                    value={formValues.firstName}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  />
                  <StyledTextField
                    label="Last Name"
                    name="lastName"
                    value={formValues.lastName}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  />
                  <StyledTextField
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
                  </StyledTextField>
                  <StyledTextField
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formValues.dateOfBirth}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: "1950-01-01",
                    }}
                    required
                    fullWidth
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  />
                  <StyledTextField
                    label="Street"
                    name="street"
                    value={formValues.street}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  />
                  <StyledTextField
                    label="No."
                    name="number"
                    value={formValues.number}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  />
                  <Autocomplete
                    options={greekCities.sort()}
                    value={formValues.city || ""}
                    onChange={(event, value) =>
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        city: value,
                      }))
                    }
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        label="City"
                        variant="outlined"
                        required
                        fullWidth
                        sx={{
                          flex: "1 1 calc(50% - 16px)",
                          "& .MuiOutlinedInput-root": {
                            minHeight: "56px",
                            borderRadius: "4px",
                            "& fieldset": {
                              borderColor: "#ccc",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#5e62d1",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(0, 0, 0, 0.6)",
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#5e62d1",
                          },
                        }}
                      />
                    )}
                    sx={{
                      flex: "1 1 calc(50% - 16px)",
                      "& .MuiAutocomplete-inputRoot": {
                        minHeight: "56px",
                      },
                    }}
                  />
                  <StyledTextField
                    label="Postal"
                    name="postal"
                    value={formValues.postal}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ flex: "1 1 calc(50% - 16px)" }}
                  />
                  <StyledTextField
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
                  <StyledTextField
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
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                  }}
                >
                  <StyledTextField
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
                  <Box
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      sx={{
                        color: "#5e62d1",
                        borderColor: "#5e62d1",
                        textTransform: "none",
                        "&:hover": {
                          borderColor: "#4a4fbf",
                          backgroundColor: "rgba(94, 98, 209, 0.1)",
                        },
                      }}
                    >
                      Upload Recommendation Letters
                      <input
                        type="file"
                        hidden
                        onChange={handleFileUpload(
                          "recommendationLettersUploaded"
                        )}
                      />
                    </Button>
                    {formValues.recommendationLettersUploaded && (
                      <CheckCircleIcon sx={{ color: "green", fontSize: 30 }} />
                    )}
                  </Box>
                </Box>
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                  }}
                >
                  <StyledTextField
                    label="Education"
                    name="education"
                    value={formValues.education}
                    onChange={handleChange}
                    required
                    fullWidth
                    multiline
                    rows={4}
                    sx={{ flex: 2 }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    <Box
                      sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        sx={{
                          color: "#5e62d1",
                          borderColor: "#5e62d1",
                          textTransform: "none",
                          padding: "14px",
                          "&:hover": {
                            borderColor: "#4a4fbf",
                            backgroundColor: "rgba(94, 98, 209, 0.1)",
                          },
                        }}
                      >
                        Upload Education Proof
                        <input
                          type="file"
                          hidden
                          onChange={handleFileUpload("educationProofUploaded")}
                        />
                      </Button>
                      {formValues.educationProofUploaded && (
                        <CheckCircleIcon
                          sx={{ color: "green", fontSize: 30 }}
                        />
                      )}
                    </Box>
                    <Box
                      sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        sx={{
                          color: "#5e62d1",
                          borderColor: "#5e62d1",
                          textTransform: "none",
                          padding: "14px",
                          "&:hover": {
                            borderColor: "#4a4fbf",
                            backgroundColor: "rgba(94, 98, 209, 0.1)",
                          },
                        }}
                      >
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
                        <CheckCircleIcon
                          sx={{ color: "green", fontSize: 30 }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}
                >
                  <StyledTextField
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
                  </StyledTextField>
                  <StyledTextField
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
                  </StyledTextField>
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
                  <StyledTextField
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
                        width: "60px",
                        height: "60px",
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
              <StyledButton
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
              </StyledButton>
              {currentStep < steps.length - 1 ? (
                <StyledButton
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
                </StyledButton>
              ) : (
                <StyledButton
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
                </StyledButton>
              )}
            </Box>
          </Box>
        </Container>
      </div>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BabysitterInfoForm;
