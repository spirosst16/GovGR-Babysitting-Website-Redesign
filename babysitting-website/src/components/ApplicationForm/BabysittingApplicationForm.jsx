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
  FormGroup,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Checkbox,
  Grid,
} from "@mui/material";
import { styled } from "@mui/system";
import { collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from "../../config/firebase";

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

const BabysittingApplicationForm = () => {
  const [formValues, setFormValues] = useState({
    area: "",
    jobType: "",
    availability: [],
    babysittingPlace: [],
    childAges: [],
  });

  const [currentStep, setCurrentStep] = useState(0);

  const [isFocused, setIsFocused] = useState(false);

  const steps = [
    "Babysitting Area, Job Type, Babysitting Place & Children Age Groups",
    "Availability",
    "Review & Submit",
  ];

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const key in formValues) {
      if (
        formValues[key] === "" ||
        (Array.isArray(formValues[key]) && formValues[key].length === 0)
      ) {
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

      const babysittingCollectionRef = collection(
        FIREBASE_DB,
        "babysittingApplications"
      );
      await addDoc(babysittingCollectionRef, {
        ...formValues,
        userId: currentUser.uid,
      });

      console.log("Document written successfully!");
      alert("Form submitted successfully!");

      setFormValues({
        area: "",
        jobType: "",
        availability: [],
        babysittingPlace: [],
        childAges: [],
      });
      setCurrentStep(0);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error submitting form. Please try again.");
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
          padding: "100px 0 50px 0",
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
                  Babysitting Area, Job Type, Babysitting Place & Children Age
                  Groups
                </Typography>

                <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                  <FormLabel component="legend">Preferred Area</FormLabel>
                  <TextField
                    label="Preferred Area"
                    name="area"
                    value={formValues.area}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ mb: 2, mt: 1 }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    InputLabelProps={{
                      shrink: false,
                      style: {
                        visibility:
                          formValues.area || isFocused ? "hidden" : "visible",
                      },
                    }}
                  />
                </FormControl>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel component="legend">Job Type</FormLabel>
                    <RadioGroup
                      name="jobType"
                      value={formValues.jobType}
                      onChange={handleChange}
                      sx={{ display: "flex", flexDirection: "row" }}
                    >
                      <FormControlLabel
                        value="Part-time"
                        control={<Radio />}
                        label="Part-time"
                      />
                      <FormControlLabel
                        value="Full-time"
                        control={<Radio />}
                        label="Full-time"
                      />
                    </RadioGroup>
                  </FormControl>

                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel component="legend">Babysitting Place</FormLabel>
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.babysittingPlace.includes(
                              "Family's House"
                            )}
                            onChange={(e) => {
                              const newBabysittingPlace = e.target.checked
                                ? [
                                    ...formValues.babysittingPlace,
                                    "Family's House",
                                  ]
                                : formValues.babysittingPlace.filter(
                                    (place) => place !== "Family's House"
                                  );
                              setFormValues({
                                ...formValues,
                                babysittingPlace: newBabysittingPlace,
                              });
                            }}
                            value="Family's House"
                          />
                        }
                        label="Family's House"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.babysittingPlace.includes(
                              "Babysitter's House"
                            )}
                            onChange={(e) => {
                              const newBabysittingPlace = e.target.checked
                                ? [
                                    ...formValues.babysittingPlace,
                                    "Babysitter's House",
                                  ]
                                : formValues.babysittingPlace.filter(
                                    (place) => place !== "Babysitter's House"
                                  );
                              setFormValues({
                                ...formValues,
                                babysittingPlace: newBabysittingPlace,
                              });
                            }}
                            value="Babysitter's House"
                          />
                        }
                        label="Babysitter's House"
                      />
                    </Box>
                  </FormControl>
                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel component="legend">Child Age Range</FormLabel>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.childAges.includes("0-1")}
                            onChange={(e) => {
                              const newChildAges = e.target.checked
                                ? [...formValues.childAges, "0-1"]
                                : formValues.childAges.filter(
                                    (age) => age !== "0-1"
                                  );
                              setFormValues({
                                ...formValues,
                                childAges: newChildAges,
                              });
                            }}
                          />
                        }
                        label="Infant (0-1)"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.childAges.includes("2-3")}
                            onChange={(e) => {
                              const newChildAges = e.target.checked
                                ? [...formValues.childAges, "2-3"]
                                : formValues.childAges.filter(
                                    (age) => age !== "2-3"
                                  );
                              setFormValues({
                                ...formValues,
                                childAges: newChildAges,
                              });
                            }}
                          />
                        }
                        label="Toddler (2-3)"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.childAges.includes("4-5")}
                            onChange={(e) => {
                              const newChildAges = e.target.checked
                                ? [...formValues.childAges, "4-5"]
                                : formValues.childAges.filter(
                                    (age) => age !== "4-5"
                                  );
                              setFormValues({
                                ...formValues,
                                childAges: newChildAges,
                              });
                            }}
                          />
                        }
                        label="Preschooler (4-5)"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.childAges.includes("6-12")}
                            onChange={(e) => {
                              const newChildAges = e.target.checked
                                ? [...formValues.childAges, "6-12"]
                                : formValues.childAges.filter(
                                    (age) => age !== "6-12"
                                  );
                              setFormValues({
                                ...formValues,
                                childAges: newChildAges,
                              });
                            }}
                          />
                        }
                        label="School-age (6-12)"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.childAges.includes("13-17")}
                            onChange={(e) => {
                              const newChildAges = e.target.checked
                                ? [...formValues.childAges, "13-17"]
                                : formValues.childAges.filter(
                                    (age) => age !== "13-17"
                                  );
                              setFormValues({
                                ...formValues,
                                childAges: newChildAges,
                              });
                            }}
                          />
                        }
                        label="Teenager (13-17)"
                      />
                    </FormGroup>
                  </FormControl>
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
                  Availability
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="h6">Monday</Typography>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Monday Morning"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [...formValues.availability, "Monday Morning"]
                                : formValues.availability.filter(
                                    (time) => time !== "Monday Morning"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Morning"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Monday Afternoon"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Monday Afternoon",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Monday Afternoon"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Afternoon"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Monday Evening"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [...formValues.availability, "Monday Evening"]
                                : formValues.availability.filter(
                                    (time) => time !== "Monday Evening"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Evening"
                      />
                    </FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formValues.availability.includes(
                            "Monday Night"
                          )}
                          onChange={(e) => {
                            const updatedAvailability = e.target.checked
                              ? [...formValues.availability, "Monday Night"]
                              : formValues.availability.filter(
                                  (time) => time !== "Monday Night"
                                );
                            setFormValues({
                              ...formValues,
                              availability: updatedAvailability,
                            });
                          }}
                        />
                      }
                      label="Night"
                    />

                    <Typography variant="h6">Tuesday</Typography>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Tuesday Morning"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Tuesday Morning",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Tuesday Morning"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Morning"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Tuesday Afternoon"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Tuesday Afternoon",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Tuesday Afternoon"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Afternoon"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Tuesday Evening"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Tuesday Evening",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Tuesday Evening"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Evening"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Tuesday Night"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [...formValues.availability, "Tuesday Night"]
                                : formValues.availability.filter(
                                    (time) => time !== "Tuesday Night"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Night"
                      />
                    </FormGroup>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="h6">Wednesday</Typography>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Wednesday Morning"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Wednesday Morning",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Wednesday Morning"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Morning"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Wednesday Afternoon"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Wednesday Afternoon",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Wednesday Afternoon"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Afternoon"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Wednesday Evening"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Wednesday Evening",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Wednesday Evening"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Evening"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Wednesday Night"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Wednesday Night",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Wednesday Night"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Night"
                      />
                    </FormGroup>

                    <Typography variant="h6">Thursday</Typography>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Thursday Morning"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Thursday Morning",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Thursday Morning"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Morning"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Thursday Afternoon"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Thursday Afternoon",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Thursday Afternoon"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Afternoon"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Thursday Evening"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Thursday Evening",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Thursday Evening"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Evening"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Thursday Night"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [...formValues.availability, "Thursday Night"]
                                : formValues.availability.filter(
                                    (time) => time !== "Thursday Night"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Night"
                      />
                    </FormGroup>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="h6">Friday</Typography>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Friday Morning"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [...formValues.availability, "Friday Morning"]
                                : formValues.availability.filter(
                                    (time) => time !== "Friday Morning"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Morning"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Friday Afternoon"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Friday Afternoon",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Friday Afternoon"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Afternoon"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Friday Evening"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [...formValues.availability, "Friday Evening"]
                                : formValues.availability.filter(
                                    (time) => time !== "Friday Evening"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Evening"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Friday Night"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [...formValues.availability, "Friday Night"]
                                : formValues.availability.filter(
                                    (time) => time !== "Friday Night"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Night"
                      />
                    </FormGroup>

                    <Typography variant="h6">Saturday</Typography>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Saturday Morning"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Saturday Morning",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Saturday Morning"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Morning"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Saturday Afternoon"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Saturday Afternoon",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Saturday Afternoon"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Afternoon"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Saturday Evening"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Saturday Evening",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Saturday Evening"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Evening"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Saturday Night"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [...formValues.availability, "Saturday Night"]
                                : formValues.availability.filter(
                                    (time) => time !== "Saturday Night"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Night"
                      />
                    </FormGroup>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="h6">Sunday</Typography>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Sunday Morning"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [...formValues.availability, "Sunday Morning"]
                                : formValues.availability.filter(
                                    (time) => time !== "Sunday Morning"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Morning"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Sunday Afternoon"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [
                                    ...formValues.availability,
                                    "Sunday Afternoon",
                                  ]
                                : formValues.availability.filter(
                                    (time) => time !== "Sunday Afternoon"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Afternoon"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Sunday Evening"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [...formValues.availability, "Sunday Evening"]
                                : formValues.availability.filter(
                                    (time) => time !== "Sunday Evening"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Evening"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formValues.availability.includes(
                              "Sunday Night"
                            )}
                            onChange={(e) => {
                              const updatedAvailability = e.target.checked
                                ? [...formValues.availability, "Sunday Night"]
                                : formValues.availability.filter(
                                    (time) => time !== "Sunday Night"
                                  );
                              setFormValues({
                                ...formValues,
                                availability: updatedAvailability,
                              });
                            }}
                          />
                        }
                        label="Night"
                      />
                    </FormGroup>
                  </Grid>
                </Grid>
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
                  Review & Submit
                </Typography>
                <Typography variant="h6">Area: {formValues.area}</Typography>
                <Typography variant="h6">
                  Job Type: {formValues.jobType}
                </Typography>
                <Typography variant="h6">
                  Babysitting Place: {formValues.babysittingPlace}
                </Typography>
                <Typography variant="h6">
                  Availability: {formValues.availability.join(", ")}
                </Typography>
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

export default BabysittingApplicationForm;
