import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Checkbox,
  Divider,
  Chip,
  Grid,
  Rating,
  MenuItem,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  doc,
  docs,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import "../../style.css";
import { styled } from "@mui/system";
import { greekCities } from "../../utils/greekCities";

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

const childcareActivities = [
  "Arts and Crafts",
  "Storytelling",
  "Outdoor Play",
  "Meal Preparation",
  "Tutoring",
  "Nap Time Assistance",
];

const ageGroups = [
  "Infant (0-2 years)",
  "Toddler (3-5 years)",
  "Child (6-12 years)",
  "Teen (13+ years)",
];

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

const CustomSeparator = () => {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email;

        // Check if user is a babysitter
        const babysitterQuery = query(
          collection(FIREBASE_DB, "babysitters"),
          where("email", "==", email)
        );
        const babysitterSnapshot = await getDocs(babysitterQuery);
        if (!babysitterSnapshot.empty) {
          setUserRole("babysitter");
          return;
        }

        // Check if user is a guardian
        const guardianQuery = query(
          collection(FIREBASE_DB, "guardians"),
          where("email", "==", email)
        );
        const guardianSnapshot = await getDocs(guardianQuery);
        if (!guardianSnapshot.empty) {
          setUserRole("guardian");
          return;
        }
      }
      setUserRole(null); // Not logged in
    });

    return () => unsubscribe();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const breadcrumbs = [
    <Link
      underline="none"
      key="1"
      color="inherit"
      onClick={() => {
        if (userRole) {
          handleNavigate("/my-dashboard");
        } else {
          handleNavigate("/");
        }
      }}
      sx={{
        "&:hover": { color: "#5e62d1", cursor: "pointer" },
        fontFamily: "Poppins, sans-serif",
      }}
    >
      Home
    </Link>,
    <Link
      underline="none"
      key="2"
      color="inherit"
      sx={{
        fontFamily: "Poppins, sans-serif",
      }}
    >
      My Profile
    </Link>,
  ];

  return (
    <Stack
      sx={{
        position: "absolute",
        top: "80px",
        left: "70px",
        alignItems: "flex-start",
      }}
    >
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {breadcrumbs}
      </Breadcrumbs>
    </Stack>
  );
};

const ProfilePage = () => {
  const [roleRef, setRoleRef] = useState({});
  const [roleSnapshot, setRoleSnapshot] = useState([]);
  const [usersSnapshot, setUsersSnapshot] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewerData, setReviewerData] = useState([]);
  const [role, setRole] = useState(true);
  const [userId, setUserId] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [profileData, setProfileData] = useState({
    city: "",
    bio: "",
    experience: "",
    education: "",
    knownLanguages: [],
    childcareActivities: [],
    firstAidCertificateUploaded: [],
    numberOfChildren: "",
    firstname: "",
    lastname: "",
    childrenDescription: "",
    childrenAgeGroups: [],
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfileData = async (userId) => {
      try {
        let userData = null;

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
          setProfileData(userData);
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
            setProfileData(userData);
            setRole(false);
          }
        }

        if (userData?.reviews?.length > 0) {
          console.log("Reviews available");
          const reviewerIds = userData.reviews.map((review) => ({
            reviewData: review,
            userId: review.userId,
          }));

          // Fetch reviewer data for each review
          const reviewerDataPromises = reviewerIds.map(
            async ({ userId, reviewData }) => {
              const babysittersRef = query(
                collection(FIREBASE_DB, "babysitters"),
                where("userId", "==", userId)
              );
              const babysittersSnapshot = await getDocs(babysittersRef);
              if (!babysittersSnapshot.empty) {
                const reviewer = babysittersSnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }))[0];

                // Combine review data with reviewer data
                return {
                  reviewer,
                  review: reviewData,
                };
              } else {
                const guardiansRef = query(
                  collection(FIREBASE_DB, "guardians"),
                  where("userId", "==", userId)
                );
                const guardiansSnapshot = await getDocs(guardiansRef);
                if (!guardiansSnapshot.empty) {
                  const reviewer = guardiansSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                  }))[0];

                  return {
                    reviewer,
                    review: reviewData,
                  };
                } else {
                  return null;
                }
              }
            }
          );

          const combinedData = await Promise.all(reviewerDataPromises);
          setReviews(combinedData.filter((data) => data !== null)); // Filter out null results
        } else {
          setReviews([]); // If no reviews exist
        }
        console.log("Reviews: ", reviews);
        if (!profileData) throw new Error(`User with ID ${userId} not found`);
        setLoading(false);
        return userId;
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
        return null;
      }
    };

    fetchProfileData(userId);
  }, [userId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f4f4f4",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleSave = async () => {
    if (!profileData.id) {
      setAlert({
        open: true,
        message: "No valid profile data to save.",
        severity: "error",
      });
      return;
    }

    const newProfileData = {
      ...profileData,
    };
    try {
      if (role) {
        const docRef = doc(FIREBASE_DB, "babysitters", profileData.id);
        await updateDoc(docRef, newProfileData);
      } else {
        const docRef = doc(FIREBASE_DB, "guardians", profileData.id);
        await updateDoc(docRef, newProfileData);
      }
      setAlert({
        open: true,
        message: "Profile changes saved successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving data:", error);
      setAlert({
        open: true,
        message: "Error saving profile changes. Please try again.",
        severity: "error",
      });
    }
  };

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  if (!profileData) {
    return (
      <Box sx={{ textAlign: "center", marginTop: "50px" }}>
        <Typography variant="h5">Profile not found</Typography>
        <Typography variant="body1">
          Please log in to view your profile.
        </Typography>
      </Box>
    );
  }

  if (role) {
    // Babysitter case
    return (
      <Box>
        <CustomSeparator />
        {/* Profile Heading */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "50px",
            backgroundColor: "#f4f4f4",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: "600",
              marginTop: "50px",
            }}
          >
            Profile
          </Typography>
        </Box>

        {/* Profile Content */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "#f4f4f4",
            pb: 4,
          }}
        >
          {/* Left Section - Profile Form */}
          <Box
            sx={{
              flex: 2,
              padding: "20px",
              backgroundColor: "#fff",
              borderRadius: "10px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              marginLeft: "250px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Profile Picture */}
            <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
              <Avatar
                src={profileData.photo}
                alt={profileData.name}
                sx={{
                  width: 200,
                  height: 200,
                  margin: "0 auto",
                  marginBottom: "10px",
                  borderRadius: "50%",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                }}
              />
              <Typography
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                }}
                variant="h6"
              >{`${profileData.firstName} ${profileData.lastName}`}</Typography>
              <Rating
                value={profileData.rating}
                readOnly
                sx={{ margin: "10px 0" }}
              />
            </Box>

            {/* Editable Form */}
            <Box sx={{ width: "100%", textAlign: "center" }}>
              <Typography
                variant="body1"
                sx={{
                  display: "flex",
                  marginLeft: "10%",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                }}
              >
                Area:
              </Typography>
              <Autocomplete
                options={greekCities.sort()}
                value={profileData.city || ""}
                onChange={(event, value) =>
                  setProfileData((prevData) => ({
                    ...prevData,
                    city: value,
                  }))
                }
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    variant="outlined"
                    size="small"
                    sx={{
                      width: "80%",
                      marginBottom: "15px",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  />
                )}
                sx={{
                  "& .MuiAutocomplete-inputRoot": {
                    minHeight: "40px",
                  },
                }}
              />
              <Typography
                sx={{
                  display: "flex",
                  marginLeft: "10%",
                  marginTop: "20px",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                }}
                variant="body1"
              >
                Bio:
              </Typography>
              <StyledTextField
                variant="outlined"
                size="small"
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    bio: e.target.value,
                  })
                }
                multiline
                rows={4}
                value={profileData.bio || ""}
                sx={{
                  marginBottom: "15px",
                  display: "flex",
                  width: "80%",
                  marginLeft: "10%",
                  fontFamily: "Poppins, sans-serif",
                }}
              />

              <Typography
                sx={{
                  display: "flex",
                  marginLeft: "10%",
                  marginTop: "20px",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                }}
                variant="body1"
              >
                Experience:
              </Typography>
              <StyledTextField
                variant="outlined"
                multiline
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    experience: e.target.value,
                  })
                }
                rows={4}
                size="small"
                value={profileData.experience || ""}
                sx={{
                  marginBottom: "15px",
                  display: "flex",
                  width: "80%",
                  marginLeft: "10%",
                  fontFamily: "Poppins, sans-serif",
                }}
              />

              <Typography
                sx={{
                  display: "flex",
                  marginLeft: "10%",
                  marginTop: "20px",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                }}
                variant="body1"
              >
                Level of Education:
              </Typography>
              <StyledTextField
                variant="outlined"
                size="small"
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    education: e.target.value,
                  })
                }
                value={profileData.education || ""}
                sx={{
                  marginBottom: "15px",
                  display: "flex",
                  width: "80%",
                  marginLeft: "10%",
                  fontFamily: "Poppins, sans-serif",
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <Typography
                  sx={{
                    display: "flex",
                    marginLeft: "10%",
                    marginTop: "20px",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "bold",
                  }}
                  variant="body1"
                >
                  First Aid Certification:
                </Typography>
                <Checkbox
                  checked={profileData.firstAidCertificateUploaded || false}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      firstAidCertificateUploaded: e.target.checked,
                    })
                  }
                  sx={{
                    marginTop: "20px",
                    color: "#5e62d1", // Default color (unchecked)
                    "&.Mui-checked": {
                      color: "#5e62d1", // Checked color
                    },
                  }}
                />
              </Box>

              <Typography
                sx={{
                  display: "flex",
                  marginLeft: "10%",
                  marginTop: "20px",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                }}
                variant="body1"
              >
                Known Languages:
              </Typography>
              <StyledTextField
                select
                name="knownLanguages"
                value={profileData.knownLanguages}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
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
                sx={{
                  mb: 2,
                  display: "flex",
                  width: "80%",
                  marginLeft: "10%",
                }}
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

              <Typography
                sx={{
                  display: "flex",
                  marginLeft: "10%",
                  marginTop: "20px",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                }}
                variant="body1"
              >
                Childcare Activities:
              </Typography>
              <StyledTextField
                select
                name="childcareActivities"
                value={profileData.childcareActivities}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
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
                sx={{
                  display: "flex",
                  mb: 2,
                  width: "80%",
                  marginLeft: "10%",
                }}
              >
                {childcareActivities.map((activity) => (
                  <MenuItem key={activity} value={activity}>
                    {activity}
                  </MenuItem>
                ))}
              </StyledTextField>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "50px",
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    color: "#ffffff",
                    backgroundColor: "#5e62d1",
                    borderRadius: "30px",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontFamily: "Poppins, sans-serif",
                    "&:hover": {
                      backgroundColor: "#3c3fad",
                    },
                  }}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Right Section - Reviews */}
          <Box
            sx={{
              flex: 1,
              padding: "20px",
              backgroundColor: "#fff",
              borderRadius: "10px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              marginLeft: "20px",
              marginRight: "250px",
              height: "fit-content",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                marginBottom: "20px",
                fontWeight: "bold",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              My Reviews
            </Typography>
            {reviews.length > 0 ? (
              reviews.map(({ reviewer, review }, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "20px",
                    padding: "15px",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {/* Avatar */}
                  <Avatar
                    sx={{
                      width: 50,
                      height: 50,
                      backgroundColor: reviewer?.photo
                        ? "transparent"
                        : "#1976d2",
                      color: reviewer?.photo ? "inherit" : "#fff",
                    }}
                    src={reviewer?.photo || undefined}
                  ></Avatar>

                  {/* Reviewer Info */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      {`${reviewer?.firstName} ${reviewer?.lastName}`}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#555", fontFamily: "Poppins, sans-serif" }}
                    >
                      {review.reviewText}
                    </Typography>
                  </Box>

                  {/* Rating */}
                  <Rating value={review.rating} readOnly size="small" />
                </Box>
              ))
            ) : (
              <Typography
                variant="body2"
                sx={{ color: "#888", fontFamily: "Poppins, sans-serif" }}
              >
                No reviews available.
              </Typography>
            )}
          </Box>
        </Box>
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
      </Box>
    );
  } else {
    // Guardian case
    return (
      <Box>
        <CustomSeparator />
        {/* Profile Heading */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "50px",
            backgroundColor: "#f4f4f4",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: "600",
              marginTop: "50px",
            }}
          >
            Profile
          </Typography>
        </Box>

        {/* Profile Content */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "#f4f4f4",
            pb: 4,
          }}
        >
          {/* Left Section - Profile Form */}
          <Box
            sx={{
              flex: 2,
              padding: "20px",
              backgroundColor: "#fff",
              borderRadius: "10px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              marginLeft: "250px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Profile Picture */}
            <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
              <Avatar
                src={profileData.photo}
                alt={profileData.name}
                sx={{
                  width: 200,
                  height: 200,
                  margin: "0 auto",
                  marginBottom: "10px",
                  borderRadius: "50%",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                }}
              />
              <Typography
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                }}
                variant="h6"
              >{`${profileData.firstName} ${profileData.lastName}`}</Typography>
              <Rating
                value={profileData.rating}
                readOnly
                sx={{ margin: "10px 0" }}
              />
            </Box>

            {/* Editable Form */}
            <Box sx={{ width: "100%", textAlign: "center" }}>
              <Typography
                variant="body1"
                sx={{
                  display: "flex",
                  marginLeft: "10%",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                }}
              >
                Area
              </Typography>
              <Autocomplete
                options={greekCities.sort()}
                value={profileData.city || ""}
                onChange={(event, value) =>
                  setProfileData((prevData) => ({
                    ...prevData,
                    city: value,
                  }))
                }
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    variant="outlined"
                    size="small"
                    sx={{
                      display: "flex",
                      width: "80%",
                      marginLeft: "10%",
                      marginBottom: "15px",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  />
                )}
                sx={{
                  "& .MuiAutocomplete-inputRoot": {
                    minHeight: "40px",
                  },
                }}
              />

              <Typography
                sx={{
                  display: "flex",
                  marginLeft: "10%",
                  marginTop: "20px",
                  alignItems: "baseline",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                }}
                variant="body1"
              >
                Number of Children
              </Typography>
              <StyledTextField
                variant="outlined"
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    experience: e.target.value,
                  })
                }
                size="small"
                value={profileData.numberOfChildren || ""}
                sx={{
                  marginBottom: "15px",
                  display: "flex",
                  width: "80%",
                  marginLeft: "10%",
                  fontFamily: "Poppins, sans-serif",
                }}
              />

              <Typography
                sx={{
                  display: "flex",
                  marginLeft: "10%",
                  marginTop: "20px",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                }}
                variant="body1"
              >
                Children Description
              </Typography>
              <StyledTextField
                variant="outlined"
                size="small"
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    childrenDescription: e.target.value,
                  })
                }
                multiline
                rows={4}
                value={profileData.childrenDescription || ""}
                sx={{
                  marginBottom: "15px",
                  display: "flex",
                  width: "80%",
                  marginLeft: "10%",
                  fontFamily: "Poppins, sans-serif",
                }}
              />

              <Typography
                sx={{
                  display: "flex",
                  marginLeft: "10%",
                  marginTop: "20px",

                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                }}
                variant="body1"
              >
                Children Age Groups
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "15px",
                }}
              >
                <StyledTextField
                  select
                  name="childrenAgeGroups"
                  value={profileData.childrenAgeGroups}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      childrenAgeGroups:
                        typeof e.target.value === "string"
                          ? e.target.value.split(",")
                          : e.target.value,
                    })
                  }
                  SelectProps={{
                    multiple: true,
                    MenuProps: {
                      PaperProps: {
                        style: {
                          marginTop: "10px",
                        },
                      },
                    },
                  }}
                  sx={{
                    mb: 2,
                    display: "flex",
                    width: "80%",
                    marginLeft: "10%",
                  }}
                >
                  {ageGroups.map((ageGroup, index) => (
                    <MenuItem
                      key={index}
                      value={ageGroup}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f0f0f0",
                        },
                      }}
                    >
                      {ageGroup}
                    </MenuItem>
                  ))}
                </StyledTextField>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "50px",
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    color: "#ffffff",
                    backgroundColor: "#5e62d1",
                    borderRadius: "30px",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontFamily: "Poppins, sans-serif",
                    "&:hover": {
                      backgroundColor: "#3c3fad",
                    },
                  }}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Right Section - Reviews */}
          <Box
            sx={{
              flex: 1,
              padding: "20px",
              backgroundColor: "#fff",
              borderRadius: "10px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              marginLeft: "20px",
              marginRight: "250px",
              height: "fit-content",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                marginBottom: "20px",
                fontWeight: "bold",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              My Reviews
            </Typography>
            {reviews.length > 0 ? (
              reviews.map(({ reviewer, review }, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "20px",
                    padding: "15px",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {/* Avatar */}
                  <Avatar
                    sx={{
                      width: 50,
                      height: 50,
                      backgroundColor: reviewer?.photo
                        ? "transparent"
                        : "#1976d2",
                      color: reviewer?.photo ? "inherit" : "#fff",
                    }}
                    src={reviewer?.photo || undefined}
                  ></Avatar>

                  {/* Reviewer Info */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      {`${reviewer?.firstName} ${reviewer?.lastName}`}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#555", fontFamily: "Poppins, sans-serif" }}
                    >
                      {review.reviewText}
                    </Typography>
                  </Box>

                  {/* Rating */}
                  <Rating value={review.rating} readOnly size="small" />
                </Box>
              ))
            ) : (
              <Typography
                variant="body2"
                sx={{ color: "#888", fontFamily: "Poppins, sans-serif" }}
              >
                No reviews available.
              </Typography>
            )}
          </Box>
        </Box>
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
      </Box>
    );
  }
};

export default ProfilePage;
