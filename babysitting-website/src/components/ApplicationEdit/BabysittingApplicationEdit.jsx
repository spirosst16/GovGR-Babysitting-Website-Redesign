import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  FormGroup,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Checkbox,
  Grid,
  Rating,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  collection,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import DefaultUserImage from "../../assets/Babysitter-image.webp";

const PageContainer = styled(Box)({
  backgroundColor: "#f4f4f4",
  minHeight: "100vh",
  padding: "40px 20px",
});

const ContentWrapper = styled(Container)({
  maxWidth: "1200px",
  margin: "0 auto",
  paddingTop: "40px",
});

const InfoSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "40px",
  marginBottom: "40px",
  alignItems: "left",
  backgroundColor: "#fff",
  padding: "40px",
  borderRadius: "10px",
  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
});

const ProfileSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: "20px",
});

const ProfileInfo = styled(Box)({
  textAlign: "center",
  marginTop: "20px",
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
    "&:hover fieldset": {
      borderColor: "#5e62d1",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#5e62d1",
    },
  },
});

const StyledRadio = styled(Radio)({
  "&.Mui-checked": {
    color: "#5e62d1",
  },
});

const StyledCheckbox = styled(Checkbox)({
  "&.Mui-checked": {
    color: "#5e62d1",
  },
});

const StyledButton = styled(Button)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: "1rem",
  textTransform: "none",
});

const EditApplicationForm = () => {
  const [formValues, setFormValues] = useState({
    area: "",
    jobType: "",
    availability: [],
    babysittingPlace: [],
    childAges: [],
  });

  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    const fetchUserAndApplication = async () => {
      try {
        let userData = null;

        // Fetch user data
        const babysittersRef = query(
          collection(FIREBASE_DB, "babysitters"),
          where("userId", "==", userId)
        );
        const babysittersSnapshot = await getDocs(babysittersRef);
        if (!babysittersSnapshot.empty) {
          userData = babysittersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))[0];
        } else {
          const guardiansRef = query(
            collection(FIREBASE_DB, "guardians"),
            where("userId", "==", userId)
          );
          const guardiansSnapshot = await getDocs(guardiansRef);
          if (!guardiansSnapshot.empty) {
            userData = guardiansSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))[0];
          }
        }

        if (!userData) throw new Error("User not found");

        // Fetch application data
        const applicationRef = query(
          collection(FIREBASE_DB, "babysittingApplications"),
          where("userId", "==", userId)
        );
        const applicationSnapshot = await getDocs(applicationRef);
        const applicationData = applicationSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))[0];

        setUser(userData);
        setApplication(applicationData);

        // Set formValues with the fetched application data
        setFormValues({
          area: applicationData.area || "",
          jobType: applicationData.jobType || "",
          availability: applicationData.availability || [],
          babysittingPlace: applicationData.babysittingPlace || [],
          childAges: applicationData.childAges || [],
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchUserAndApplication();
  }, [userId]);

  if (!user || !application) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleTemporarySave = async () => {
    if (!application?.id) return;

    const newApplicationData = {
      ...formValues,
      status: "temporary",
    };

    try {
      const docRef = doc(
        FIREBASE_DB,
        "babysittingApplications",
        application.id
      );
      await updateDoc(docRef, newApplicationData);

      // Update form values and application state after save
      setApplication({ ...application, ...newApplicationData });
      setFormValues(newApplicationData);

      alert("Changes saved temporarily");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving form. Please try again.");
    }
  };

  const handleFinalSubmission = async () => {
    if (!application?.id) return;

    const newApplicationData = {
      ...formValues,
      status: "submitted",
    };

    try {
      const docRef = doc(
        FIREBASE_DB,
        "babysittingApplications",
        application.id
      );
      await updateDoc(docRef, newApplicationData);

      // Update form values and application state after submission
      setApplication({ ...application, ...newApplicationData });
      setFormValues(newApplicationData);

      alert("Application submitted!");
      navigate(`/application/${userId}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            marginBottom: "40px",
            marginTop: "20px",
            textAlign: "center",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Edit Application
        </Typography>
        <InfoSection>
          {/* Profile Section */}
          <ProfileSection>
            <Avatar
              src={user.photo || DefaultUserImage}
              sx={{
                width: 140,
                height: 140,
                margin: "auto",
                borderRadius: "50%",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
              }}
            />
            <ProfileInfo>
              <Typography
                variant="h5"
                sx={{
                  marginTop: "20px",
                  fontWeight: "bold",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {`${user.firstName} ${user.lastName}`}
              </Typography>
              <Typography
                sx={{
                  color: "#888",
                  marginBottom: "10px",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {user.city}
              </Typography>
              <Rating
                name={`rating-${user.id}`}
                value={user.rating}
                precision={0.5}
                readOnly
                size="large"
              />
            </ProfileInfo>
          </ProfileSection>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Preferred Area</FormLabel>
            <StyledTextField
              name="area"
              value={formValues.area}
              onChange={(e) =>
                setFormValues({ ...formValues, area: e.target.value })
              }
              required
              fullWidth
            />
          </FormControl>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel
                component="legend"
                sx={{
                  "&.Mui-focused": {
                    color: "#5e62d1",
                  },
                }}
              >
                Job Type
              </FormLabel>
              <RadioGroup
                name="jobType"
                value={formValues.jobType}
                onChange={(e) =>
                  setFormValues({ ...formValues, jobType: e.target.value })
                }
                sx={{ display: "flex", flexDirection: "row" }}
              >
                <FormControlLabel
                  value="Part-time"
                  control={<StyledRadio />}
                  label="Part-time"
                  sx={{ fontFamily: "'Poppins', sans-serif" }}
                />
                <FormControlLabel
                  value="Full-time"
                  control={<StyledRadio />}
                  label="Full-time"
                  sx={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </RadioGroup>
            </FormControl>

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel
                component="legend"
                sx={{
                  "&.Mui-focused": {
                    color: "#5e62d1",
                  },
                }}
              >
                Babysitting Place
              </FormLabel>
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <FormControlLabel
                  control={
                    <StyledCheckbox
                      checked={formValues.babysittingPlace.includes(
                        "Family's House"
                      )}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...formValues.babysittingPlace, "Family's House"]
                          : formValues.babysittingPlace.filter(
                              (place) => place !== "Family's House"
                            );
                        setFormValues({
                          ...formValues,
                          babysittingPlace: updated,
                        });
                      }}
                    />
                  }
                  label="Family's House"
                />
                <FormControlLabel
                  control={
                    <StyledCheckbox
                      checked={formValues.babysittingPlace.includes(
                        "Babysitter's House"
                      )}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [
                              ...formValues.babysittingPlace,
                              "Babysitter's House",
                            ]
                          : formValues.babysittingPlace.filter(
                              (place) => place !== "Babysitter's House"
                            );
                        setFormValues({
                          ...formValues,
                          babysittingPlace: updated,
                        });
                      }}
                    />
                  }
                  label="Babysitter's House"
                />
              </Box>
            </FormControl>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel
                component="legend"
                sx={{
                  "&.Mui-focused": {
                    color: "#5e62d1",
                  },
                }}
              >
                Child Age Range
              </FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <StyledCheckbox
                      checked={formValues.childAges.includes("0-1")}
                      onChange={(e) => {
                        const newChildAges = e.target.checked
                          ? [...formValues.childAges, "0-1"]
                          : formValues.childAges.filter((age) => age !== "0-1");
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
                    <StyledCheckbox
                      checked={formValues.childAges.includes("2-3")}
                      onChange={(e) => {
                        const newChildAges = e.target.checked
                          ? [...formValues.childAges, "2-3"]
                          : formValues.childAges.filter((age) => age !== "2-3");
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
                    <StyledCheckbox
                      checked={formValues.childAges.includes("4-5")}
                      onChange={(e) => {
                        const newChildAges = e.target.checked
                          ? [...formValues.childAges, "4-5"]
                          : formValues.childAges.filter((age) => age !== "4-5");
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
                    <StyledCheckbox
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
                    <StyledCheckbox
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
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day) => (
              <Grid item xs={12} sm={6} md={3} key={day}>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {day}
                </Typography>
                <FormGroup>
                  {["Morning", "Afternoon", "Evening", "Night"].map((time) => (
                    <FormControlLabel
                      key={time}
                      control={
                        <StyledCheckbox
                          checked={formValues.availability.includes(
                            `${day} ${time}`
                          )}
                          onChange={(e) => {
                            const updatedAvailability = e.target.checked
                              ? [...formValues.availability, `${day} ${time}`]
                              : formValues.availability.filter(
                                  (timeSlot) => timeSlot !== `${day} ${time}`
                                );
                            setFormValues({
                              ...formValues,
                              availability: updatedAvailability,
                            });
                          }}
                        />
                      }
                      label={time}
                    />
                  ))}
                </FormGroup>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <StyledButton
              onClick={handleTemporarySave}
              variant="contained"
              sx={{
                backgroundColor: "white",
                color: "#5e62d1",
                outline: "1px solid #5e62d1",
                borderRadius: "30px",
                "&:hover": {
                  backgroundColor: "#fffffe",
                },
              }}
            >
              Temporary Save
            </StyledButton>
            <StyledButton
              onClick={handleFinalSubmission}
              variant="contained"
              sx={{
                backgroundColor: "#5e62d1",
                borderRadius: "30px",
                "&:hover": {
                  backgroundColor: "#4a4fbf",
                },
              }}
            >
              Final Submit
            </StyledButton>
          </Box>
        </InfoSection>
      </ContentWrapper>
    </PageContainer>
  );
};

export default EditApplicationForm;
