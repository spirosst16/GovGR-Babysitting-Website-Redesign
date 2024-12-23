import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
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
import { getAuth } from "firebase/auth";
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

const ApplicationSection = styled(Box)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  alignItems: "center",
});

const EditApplicationForm = () => {
  const [formValues, setFormValues] = useState({
    area: "",
    jobType: "",
    availability: [],
    babysittingPlace: [],
    childAges: [],
  });

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
                          ? [...formValues.babysittingPlace, "Family's House"]
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
                    <Checkbox
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
                    <Checkbox
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
                <Typography variant="h6">{day}</Typography>
                <FormGroup>
                  {["Morning", "Afternoon", "Evening", "Night"].map((time) => (
                    <FormControlLabel
                      key={time}
                      control={
                        <Checkbox
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
            <Button
              onClick={handleTemporarySave}
              variant="outlined"
              sx={{
                backgroundColor: "white",
                color: "#5e62d1",
                "&:hover": {
                  backgroundColor: "#fffffe",
                },
              }}
            >
              Temporary Save
            </Button>
            <Button
              onClick={handleFinalSubmission}
              variant="contained"
              sx={{
                backgroundColor: "#5e62d1",
                "&:hover": {
                  backgroundColor: "#4a4fbf",
                },
              }}
            >
              Final Submit
            </Button>
          </Box>
        </InfoSection>
      </ContentWrapper>
    </PageContainer>
  );
};

export default EditApplicationForm;
