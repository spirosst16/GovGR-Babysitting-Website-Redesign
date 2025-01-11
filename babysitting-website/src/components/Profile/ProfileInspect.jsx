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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

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
];

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
                    First Aid Certification:
                  </Typography>
                  <Checkbox
                    checked={profileData.firstAidCertificateUploaded || false}
                    sx={{
                      marginTop: "20px",
                      color: "#5e62d1", // Default color (unchecked)
                      "&.Mui-checked": {
                        color: "#5e62d1", // Checked color
                      },
                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                      transition: "none",
                      pointerEvents: "none",
                      cursor: "default",
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
                        sx={{
                          color: "#555",
                          fontFamily: "Poppins, sans-serif",
                        }}
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
        </Box>
      );
    } else {
      // Guardian case
      return (
        <Box>
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
                  sx={{ margin: "10px 0" }}
                />
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
                        sx={{
                          color: "#555",
                          fontFamily: "Poppins, sans-serif",
                        }}
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
        </Box>
      );
    }
  }
};

export default ProfileInspect;
