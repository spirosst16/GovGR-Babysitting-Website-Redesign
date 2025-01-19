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
  Breadcrumbs,
  Stack,
  Link,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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

const ButtonStyle = styled(Button)({
  fontSize: "0.9rem",
  color: "#000",
  backgroundColor: "#ffffff",
  outline: "2px solid #5e62d1",
  padding: "8px 16px",
  marginRight: "8px",
  marginBottom: "8px",
  textTransform: "none",
  borderRadius: "25px",
  cursor: "default",
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
  "Turkish",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Polish",
  "Czech",
  "Hungarian",
  "Ukrainian",
  "Vietnamese",
  "Indonesian",
  "Filipino",
  "Amharic",
  "Kannada",
  "Kazakh",
  "Uzbek",
  "Azerbaijani",
  "Georgian",
  "Armenian",
  "Albanian",
  "Serbian",
  "Croatian",
  "Bosnian",
  "Slovak",
  "Slovenian",
  "Macedonian",
  "Bulgarian",
  "Romanian",
  "Latvian",
  "Lithuanian",
  "Estonian",
  "Welsh",
  "Irish",
  "Catalan",
  "Hawaiian",
  "Mongolian",
  "Malagasy",
  "Fijian",
  "Turkmen",
];

const CustomSeparator = () => {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location; // Access the state for "from"

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

  // const handleNavigate = (path) => {
  //   navigate(path);
  // };

  const getHomePath = () => {
    if (userRole) return "/my-dashboard";

    return "/";
  };

  const getPageName = (pathname) => {
    const mapping = {
      "/": "Welcome",
      "/login": "Login",
      "/register": "Register",
      "/babysitter-form": "Babysitter Form",
      "/guardian-form": "Guardian Form",
      "/babysitters": "Babysitters",
      "/babysitting-jobs": "Babysitting Jobs",
      "/how-it-works": "How It Works",
      "/babysitting-application": "Babysitting Application",
      "/my-dashboard": "My Dashboard",
      "/application/:userId": "Application Details",
      "/edit-application/:userId": "Edit Application",
      "/agreement/:agreementId": "Agreement",
      "/chats": "Messages",
      "/profile": "Profile",
      "/profile/:userId": "Profile Inspect",
    };

    // Replace any dynamic segments like :userId with placeholders or clean display names
    const cleanPath = pathname
      .replace(/\/application\/[^/]+/, "/application/:userId")
      .replace(/\/edit-application\/[^/]+/, "/edit-application/:userId")
      .replace(/\/agreement\/[^/]+/, "/agreement/:agreementId");

    return mapping[cleanPath] || pathname.replace("/", ""); // Fallback to cleaned pathname
  };

  const breadcrumbs = [
    <Link
      underline="none"
      key="1"
      color="inherit"
      onClick={() => navigate(getHomePath())}
      sx={{
        "&:hover": { color: "#5e62d1", cursor: "pointer" },
        fontFamily: "Poppins, sans-serif",
      }}
    >
      Home
    </Link>,
    state?.grandparent &&
      (getPageName(state?.grandparent) === "Babysitters" ||
        getPageName(state?.grandparent) === "Babysitting Jobs") && (
        <Link
          underline="none"
          key="2"
          color="inherit"
          onClick={() => navigate(state?.grandparent)}
          sx={{
            "&:hover": { color: "#5e62d1", cursor: "pointer" },
            fontFamily: "Poppins, sans-serif",
          }}
        >
          {getPageName(state?.grandparent)}
        </Link>
      ),
    state?.from && (
      <Link
        underline="none"
        key="3"
        color="inherit"
        onClick={() =>
          navigate(state.from, {
            state: { from: state?.grandparent },
          })
        }
        sx={{
          "&:hover": { color: "#5e62d1", cursor: "pointer" },
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {getPageName(state?.from)}
      </Link>
    ),
    <Link
      underline="none"
      key="4"
      color="inherit"
      sx={{
        fontFamily: "Poppins, sans-serif",
      }}
    >
      Profile Inspect
    </Link>,
  ].filter(Boolean);

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

const ProfileInspect = () => {
  const [roleRef, setRoleRef] = useState([]);
  const [roleSnapshot, setRoleSnapshot] = useState([]);
  const [usersSnapshot, setUsersSnapshot] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const currentLocation = useLocation();

  const { profileUserID } = useParams();
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
    setLoading(true);
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
    setLoading(true);
    const fetchProfileData = async (userId, profileUserID) => {
      try {
        let userData = null;

        const tempBabysittersRef = query(
          collection(FIREBASE_DB, "babysitters"),
          where("userId", "==", userId)
        );

        const tempBabysittersSnapshot = await getDocs(tempBabysittersRef);
        if (!tempBabysittersSnapshot.empty) {
          setUserRole(true);
        } else {
          const guardiansRef = query(
            collection(FIREBASE_DB, "guardians"),
            where("userId", "==", userId)
          );
          const guardiansSnapshot = await getDocs(guardiansRef);
          if (!guardiansSnapshot.empty) {
            setUserRole(false);
          }
        }
        const babysittersRef = query(
          collection(FIREBASE_DB, "babysitters"),
          where("userId", "==", profileUserID)
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
            where("userId", "==", profileUserID)
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
              console.log("ID is: ", userId);
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

        if (!profileData)
          throw new Error(`User with ID ${profileUserID} not found`);
        setLoading(false);
        return userId;
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
        return null;
      }
    };

    fetchProfileData(userId, profileUserID);
  }, [userId, profileUserID]);

  const handleSendMessage = async () => {
    if (!profileData.id) {
      alert("No valid profile data to save.");
      return;
    }

    if (userId === null) {
      navigate("/login", {
        state: { selectedUser: profileData, from: "/chats" },
      });
      return;
    }
    navigate(`/chats`, {
      state: { selectedUser: profileData },
    });
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
        <CircularProgress sx={{ color: "#5e62d1" }} />
      </Box>
    );
  } else {
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
              <Box
                sx={{
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
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
                  precision={0.5}
                  sx={{ margin: "10px 0" }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "30px",
                }}
              >
                {userRole !== role && (
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
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                    onClick={handleSendMessage}
                  >
                    Message
                  </Button>
                )}
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
                    marginTop: "20px",
                  }}
                >
                  Area:&nbsp;
                  <Box
                    component="span"
                    sx={{ fontWeight: "normal", display: "flex", width: "80%" }}
                  >
                    {profileData.city}
                  </Box>
                </Typography>

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
                  Bio
                </Typography>
                <Box
                  component="span"
                  sx={{
                    fontWeight: "normal",
                    display: "flex",
                    marginLeft: "10%",
                    width: "80%",
                    wordWrap: "break-word",
                    whiteSpace: "pre-line",
                    textAlign: "left",
                  }}
                >
                  {profileData.bio}
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
                  Experience
                </Typography>
                <Box
                  component="span"
                  sx={{
                    fontWeight: "normal",
                    display: "flex",
                    marginLeft: "10%",
                    width: "80%",
                    wordWrap: "break-word",
                    whiteSpace: "pre-line",
                    textAlign: "left",
                  }}
                >
                  {profileData.experience}
                </Box>

                <Typography
                  sx={{
                    marginLeft: "10%",
                    marginTop: "20px",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "bold",
                    display: "flex",

                    flexWrap: "nowrap",
                  }}
                  variant="body1"
                >
                  Level of Education:&nbsp;
                  <Box
                    component="span"
                    sx={{
                      fontWeight: "normal",
                      fontWeight: "normal",
                      display: "inline",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {profileData.education}
                  </Box>
                </Typography>

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
                    First Aid Certification:&nbsp;
                    <Box
                      component="span"
                      sx={{
                        fontWeight: "normal",
                        fontWeight: "normal",
                        display: "inline",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {profileData.firstAidCertificateUploaded ? "Yes" : "No"}
                    </Box>
                  </Typography>
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
                  Known Languages
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "flex-start",
                    flexWrap: "wrap",
                    flex: 1,
                    marginTop: "10px",
                    marginLeft: "10%",
                    width: "80%",
                  }}
                >
                  {profileData.knownLanguages
                    .slice()
                    .sort((a, b) => a - b)
                    .map((age, index) => (
                      <ButtonStyle key={index}>{age}</ButtonStyle>
                    ))}
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
                  Childcare Activities
                </Typography>
                <Box
                  sx={{
                    gap: "8px",
                    justifyContent: "flex-start",
                    flexWrap: "wrap",
                    flex: 1,
                    marginTop: "10px",
                    marginLeft: "10%",
                    display: "flex",
                    width: "80%",
                  }}
                >
                  {profileData.childcareActivities
                    .slice()
                    .sort((a, b) => a - b)
                    .map((age, index) => (
                      <ButtonStyle key={index}>{age}</ButtonStyle>
                    ))}
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
                {`${profileData.firstName}`}'s Reviews
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
                        sx={{
                          color: "#555",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        {review.reviewText}
                      </Typography>
                    </Box>

                    {/* Rating */}
                    <Rating
                      value={review.rating}
                      precision={0.5}
                      readOnly
                      size="small"
                    />
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
              justifyContent: "center",
              minHeight: "60vh",
              backgroundColor: "#f4f4f4",
              pb: 4,
            }}
          >
            {/* Profile Form */}
            <Box
              sx={{
                flex: "0 1 auto",
                padding: "20px",
                backgroundColor: "#fff",
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxWidth: "900px",
                width: "100%",
                margin: "0 20px",
              }}
            >
              {/* Profile Picture */}
              <Box
                sx={{
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
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

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "30px",
                  }}
                >
                  {userRole !== role && (
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
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                      onClick={handleSendMessage}
                    >
                      Message
                    </Button>
                  )}
                </Box>
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
                  Area:&nbsp;
                  <Box
                    component="span"
                    sx={{
                      fontWeight: "normal",
                      display: "flex",
                      width: "80%",

                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {profileData.city}
                  </Box>
                </Typography>

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
                  Number of Children:&nbsp;
                  <Box component="span" sx={{ fontWeight: "normal" }}>
                    {profileData.numberOfChildren}
                  </Box>
                </Typography>

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
                <Box
                  component="span"
                  sx={{
                    fontWeight: "normal",
                    display: "flex",
                    marginLeft: "10%",
                    width: "80%",
                    wordWrap: "break-word",
                    whiteSpace: "pre-line",
                    textAlign: "left",
                  }}
                >
                  {profileData.childrenDescription}
                </Box>

                <Typography
                  sx={{
                    display: "flex",

                    marginTop: "20px",

                    marginLeft: "10%",
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
                    marginLeft: "10%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "flex-start",
                      flexWrap: "wrap",
                      flex: 1,
                      marginTop: "10px",
                    }}
                  >
                    {profileData.childrenAgeGroups
                      .slice()
                      .sort((a, b) => a - b)
                      .map((age, index) => (
                        <ButtonStyle key={index}>{age}</ButtonStyle>
                      ))}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",

                    marginTop: "50px",
                  }}
                ></Box>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    }
  }
};

export default ProfileInspect;
