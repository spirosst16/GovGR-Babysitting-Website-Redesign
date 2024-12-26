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
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import "../../style.css";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setProfileData(null);
          setLoading(false);
          return;
        }

        const userId = user.uid;
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
          setProfileData(userData); // Ensure profile data is set
          setLoading(false);
        } else {
          console.log("Babysitter not found for the current user.");
          setProfileData(null);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setProfileData(null);
      } finally {
        setLoading(false); // Ensure loading is set to false
      }
    };

    const fetchReviews = async () => {
      try {
        // Mock data for reviews
        setReviews([
          { reviewer: "Guardian Name 1", text: "Review 1", rating: 4 },
          { reviewer: "Guardian Name 2", text: "Review 2", rating: 5 },
        ]);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchProfileData();
    fetchReviews();
  }, [auth]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

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
          }}
        >
          {/* Profile Picture */}
          <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
            <Avatar
              src={profileData.photo}
              alt={profileData.name}
              sx={{
                width: 140,
                height: 140,
                margin: "0 auto",
                marginBottom: "10px",
              }}
            />
            <Typography
              sx={{ fontFamily: "Poppins, sans-serif", fontWeight: "bold" }}
              variant="h6"
            >{`${profileData.firstName} ${profileData.lastName}`}</Typography>
            <Rating
              value={profileData.rating}
              readOnly
              sx={{ margin: "10px 0" }}
            />
          </Box>

          {/* Editable Form */}
          <Box>
            <Typography
              variant="body1"
              sx={{
                marginLeft: "100px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: "bold",
              }}
            >
              Area:
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              value={profileData.city || ""}
              sx={{
                width: "500px",
                marginBottom: "15px",
                marginLeft: "140px",
                fontFamily: "Poppins, sans-serif",
              }}
            />

            <Typography
              sx={{
                marginLeft: "100px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: "bold",
              }}
              variant="body1"
            >
              Bio:
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              multiline
              rows={4}
              value={profileData.bio || ""}
              readOnly
              sx={{
                marginBottom: "15px",
                marginLeft: "140px",
                width: "600px",
                fontFamily: "Poppins, sans-serif",
              }}
            />

            <Typography
              sx={{
                marginLeft: "100px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: "bold",
              }}
              variant="body1"
            >
              Experience:
            </Typography>
            <TextField
              variant="outlined"
              multiline
              rows={4}
              size="small"
              value={profileData.experience || ""}
              sx={{
                marginBottom: "15px",
                marginLeft: "140px",
                width: "600px",
                fontFamily: "Poppins, sans-serif",
              }}
            />

            <Typography
              sx={{
                marginLeft: "100px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: "bold",
              }}
              variant="body1"
            >
              Level of Education:
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              value={profileData.education || ""}
              sx={{
                marginBottom: "15px",
                marginLeft: "140px",
                width: "500px",
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
                  marginLeft: "100px",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                }}
                variant="body1"
              >
                First Aid Certification
              </Typography>
              <Checkbox checked={profileData.firstAid || false} />
            </Box>

            <Typography
              sx={{
                marginLeft: "100px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: "bold",
              }}
              variant="body1"
            >
              Known Languages:
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "15px",
                marginLeft: "140px",
              }}
            >
              {profileData.knownLanguages?.map((lang, index) => (
                <Chip
                  sx={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #5e62d1",
                    fontFamily: "Poppins, sans-serif",
                    "& .MuiChip-label": {
                      color: "#000",
                    },
                  }}
                  key={index}
                  label={lang}
                  color="#5e62d1"
                />
              ))}
            </Box>

            <Typography
              sx={{
                marginLeft: "100px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: "bold",
              }}
              variant="body1"
            >
              Childcare Activities:
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "20px",
                marginLeft: "140px",
              }}
            >
              {profileData.childcareActivities?.map((activity, index) => (
                <Chip
                  sx={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #5e62d1",
                    fontFamily: "Poppins, sans-serif",
                    "& .MuiChip-label": {
                      color: "#000",
                    },
                  }}
                  key={index}
                  label={activity}
                />
              ))}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                variant="outlined"
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  color: "#5e62d1",
                  borderColor: "#5e62d1",
                  borderRadius: "30px",
                  fontSize: "1rem",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#3c3fad",
                    color: "#3c3fad",
                  },
                }}
              >
                Cancel
              </Button>
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
          <Typography variant="h6" sx={{ marginBottom: "20px" }}>
            My Reviews
          </Typography>
          {reviews.map((review, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px",
                padding: "10px",
                borderRadius: "8px",
                backgroundColor: "#f5f5f5",
              }}
            >
              <Avatar sx={{ width: 40, height: 40 }}>
                {review.reviewer.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {review.reviewer}
                </Typography>
                <Typography variant="body2">{review.text}</Typography>
              </Box>
              <Rating value={review.rating} readOnly size="small" />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;
