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
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
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

const ProfilePage = () => {
  const [roleRef, setRoleRef] = useState([]);
  const [roleSnapshot, setRoleSnapshot] = useState([]);
  const [usersSnapshot, setUsersSnapshot] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(true);
  const [userId, setUserId] = useState(null);
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
    fetchProfileData(userId);
    fetchReviews();
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
      alert("No valid profile data to save.");
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

      alert("Changes in profile saved");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving profile changes. Please try again.");
    }
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
                onChange={(e) =>
                  setProfileData({ ...profileData, city: e.target.value })
                }
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
                onChange={(e) =>
                  setProfileData({ ...profileData, bio: e.target.value })
                }
                multiline
                rows={4}
                value={profileData.bio || ""}
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
                onChange={(e) =>
                  setProfileData({ ...profileData, experience: e.target.value })
                }
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
                onChange={(e) =>
                  setProfileData({ ...profileData, education: e.target.value })
                }
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
                    color: "#5e62d1", // Default color (unchecked)
                    "&.Mui-checked": {
                      color: "#5e62d1", // Checked color
                    },
                  }}
                />
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
                onChange={(e) =>
                  setProfileData({ ...profileData, city: e.target.value })
                }
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
                Number of Children:
              </Typography>
              <TextField
                variant="outlined"
                onChange={(e) =>
                  setProfileData({ ...profileData, experience: e.target.value })
                }
                size="small"
                value={profileData.numberOfChildren || ""}
                sx={{
                  marginBottom: "15px",
                  marginLeft: "140px",
                  width: "500px",
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
                Children Description:
              </Typography>
              <TextField
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
                Children Age Groups:
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
                {profileData.childrenAgeGroups?.map((lang, index) => (
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
                <Rating value={review.rating || 0} readOnly size="small" />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  // return (
  //   <Box>
  //     {/* Profile Heading */}
  //     <Box
  //       sx={{
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         padding: "50px",
  //         backgroundColor: "#f4f4f4",
  //       }}
  //     >
  //       <Typography
  //         variant="h4"
  //         sx={{
  //           fontFamily: "Poppins, sans-serif",
  //           fontWeight: "600",
  //           marginTop: "50px",
  //         }}
  //       >
  //         Profile
  //       </Typography>
  //     </Box>

  //     {/* Profile Content */}
  //     <Box
  //       sx={{
  //         display: "flex",
  //         justifyContent: "space-between",
  //         backgroundColor: "#f4f4f4",
  //         pb: 4,
  //       }}
  //     >
  //       {/* Left Section - Profile Form */}
  //       <Box
  //         sx={{
  //           flex: 2,
  //           padding: "20px",
  //           backgroundColor: "#fff",
  //           borderRadius: "10px",
  //           boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  //           marginLeft: "250px",
  //         }}
  //       >
  //         {/* Profile Picture */}
  //         <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
  //           <Avatar
  //             src={profileData.photo}
  //             alt={profileData.name}
  //             sx={{
  //               width: 140,
  //               height: 140,
  //               margin: "0 auto",
  //               marginBottom: "10px",
  //             }}
  //           />
  //           <Typography
  //             sx={{ fontFamily: "Poppins, sans-serif", fontWeight: "bold" }}
  //             variant="h6"
  //           >{`${profileData.firstName} ${profileData.lastName}`}</Typography>
  //           <Rating
  //             value={profileData.rating}
  //             readOnly
  //             sx={{ margin: "10px 0" }}
  //           />
  //         </Box>

  //         {/* Editable Form */}
  //         <Box>
  //           <Typography
  //             variant="body1"
  //             sx={{
  //               marginLeft: "100px",
  //               fontFamily: "Poppins, sans-serif",
  //               fontWeight: "bold",
  //             }}
  //           >
  //             Area:
  //           </Typography>
  //           <TextField
  //             variant="outlined"
  //             size="small"
  //             onChange={(e) =>
  //               setProfileData({ ...profileData, city: e.target.value })
  //             }
  //             value={profileData.city || ""}
  //             sx={{
  //               width: "500px",
  //               marginBottom: "15px",
  //               marginLeft: "140px",
  //               fontFamily: "Poppins, sans-serif",
  //             }}
  //           />

  //           <Typography
  //             sx={{
  //               marginLeft: "100px",
  //               fontFamily: "Poppins, sans-serif",
  //               fontWeight: "bold",
  //             }}
  //             variant="body1"
  //           >
  //             Bio:
  //           </Typography>
  //           <TextField
  //             variant="outlined"
  //             size="small"
  //             onChange={(e) =>
  //               setProfileData({ ...profileData, bio: e.target.value })
  //             }
  //             multiline
  //             rows={4}
  //             value={profileData.bio || ""}
  //             sx={{
  //               marginBottom: "15px",
  //               marginLeft: "140px",
  //               width: "600px",
  //               fontFamily: "Poppins, sans-serif",
  //             }}
  //           />

  //           <Typography
  //             sx={{
  //               marginLeft: "100px",
  //               fontFamily: "Poppins, sans-serif",
  //               fontWeight: "bold",
  //             }}
  //             variant="body1"
  //           >
  //             Experience:
  //           </Typography>
  //           <TextField
  //             variant="outlined"
  //             multiline
  //             onChange={(e) =>
  //               setProfileData({ ...profileData, experience: e.target.value })
  //             }
  //             rows={4}
  //             size="small"
  //             value={profileData.experience || ""}
  //             sx={{
  //               marginBottom: "15px",
  //               marginLeft: "140px",
  //               width: "600px",
  //               fontFamily: "Poppins, sans-serif",
  //             }}
  //           />

  //           <Typography
  //             sx={{
  //               marginLeft: "100px",
  //               fontFamily: "Poppins, sans-serif",
  //               fontWeight: "bold",
  //             }}
  //             variant="body1"
  //           >
  //             Level of Education:
  //           </Typography>
  //           <TextField
  //             variant="outlined"
  //             size="small"
  //             onChange={(e) =>
  //               setProfileData({ ...profileData, education: e.target.value })
  //             }
  //             value={profileData.education || ""}
  //             sx={{
  //               marginBottom: "15px",
  //               marginLeft: "140px",
  //               width: "500px",
  //               fontFamily: "Poppins, sans-serif",
  //             }}
  //           />

  //           <Box
  //             sx={{
  //               display: "flex",
  //               alignItems: "center",
  //               marginBottom: "15px",
  //             }}
  //           >
  //             <Typography
  //               sx={{
  //                 marginLeft: "100px",
  //                 fontFamily: "Poppins, sans-serif",
  //                 fontWeight: "bold",
  //               }}
  //               variant="body1"
  //             >
  //               First Aid Certification:
  //             </Typography>
  //             <Checkbox
  //               checked={profileData.firstAidCertificateUploaded || false}
  //               onChange={(e) =>
  //                 setProfileData({
  //                   ...profileData,
  //                   firstAidCertificateUploaded: e.target.checked,
  //                 })
  //               }
  //               sx={{
  //                 color: "#5e62d1", // Default color (unchecked)
  //                 "&.Mui-checked": {
  //                   color: "#5e62d1", // Checked color
  //                 },
  //               }}
  //             />
  //           </Box>

  //           <Typography
  //             sx={{
  //               marginLeft: "100px",
  //               fontFamily: "Poppins, sans-serif",
  //               fontWeight: "bold",
  //             }}
  //             variant="body1"
  //           >
  //             Known Languages:
  //           </Typography>
  //           <Box
  //             sx={{
  //               display: "flex",
  //               gap: "10px",
  //               flexWrap: "wrap",
  //               marginBottom: "15px",
  //               marginLeft: "140px",
  //             }}
  //           >
  //             {profileData.knownLanguages?.map((lang, index) => (
  //               <Chip
  //                 sx={{
  //                   backgroundColor: "#ffffff",
  //                   border: "1px solid #5e62d1",
  //                   fontFamily: "Poppins, sans-serif",
  //                   "& .MuiChip-label": {
  //                     color: "#000",
  //                   },
  //                 }}
  //                 key={index}
  //                 label={lang}
  //                 color="#5e62d1"
  //               />
  //             ))}
  //           </Box>

  //           <Typography
  //             sx={{
  //               marginLeft: "100px",
  //               fontFamily: "Poppins, sans-serif",
  //               fontWeight: "bold",
  //             }}
  //             variant="body1"
  //           >
  //             Childcare Activities:
  //           </Typography>
  //           <Box
  //             sx={{
  //               display: "flex",
  //               gap: "10px",
  //               flexWrap: "wrap",
  //               marginBottom: "20px",
  //               marginLeft: "140px",
  //             }}
  //           >
  //             {profileData.childcareActivities?.map((activity, index) => (
  //               <Chip
  //                 sx={{
  //                   backgroundColor: "#ffffff",
  //                   border: "1px solid #5e62d1",
  //                   fontFamily: "Poppins, sans-serif",
  //                   "& .MuiChip-label": {
  //                     color: "#000",
  //                   },
  //                 }}
  //                 key={index}
  //                 label={activity}
  //               />
  //             ))}
  //           </Box>

  //           <Box sx={{ display: "flex", justifyContent: "space-between" }}>
  //             <Button
  //               variant="outlined"
  //               sx={{
  //                 fontFamily: "Poppins, sans-serif",
  //                 color: "#5e62d1",
  //                 borderColor: "#5e62d1",
  //                 borderRadius: "30px",
  //                 fontSize: "1rem",
  //                 textTransform: "none",
  //                 "&:hover": {
  //                   borderColor: "#3c3fad",
  //                   color: "#3c3fad",
  //                 },
  //               }}
  //             >
  //               Cancel
  //             </Button>
  //             <Button
  //               variant="contained"
  //               sx={{
  //                 color: "#ffffff",
  //                 backgroundColor: "#5e62d1",
  //                 borderRadius: "30px",
  //                 textTransform: "none",
  //                 fontSize: "1rem",
  //                 fontFamily: "Poppins, sans-serif",
  //                 "&:hover": {
  //                   backgroundColor: "#3c3fad",
  //                 },
  //               }}
  //               onClick={handleSave}
  //             >
  //               Save Changes
  //             </Button>
  //           </Box>
  //         </Box>
  //       </Box>

  //       {/* Right Section - Reviews */}
  //       <Box
  //         sx={{
  //           flex: 1,
  //           padding: "20px",
  //           backgroundColor: "#fff",
  //           borderRadius: "10px",
  //           boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  //           marginLeft: "20px",
  //           marginRight: "250px",
  //           height: "fit-content",
  //         }}
  //       >
  //         <Typography variant="h6" sx={{ marginBottom: "20px" }}>
  //           My Reviews
  //         </Typography>
  //         {reviews.map((review, index) => (
  //           <Box
  //             key={index}
  //             sx={{
  //               display: "flex",
  //               alignItems: "center",
  //               gap: "10px",
  //               marginBottom: "15px",
  //               padding: "10px",
  //               borderRadius: "8px",
  //               backgroundColor: "#f5f5f5",
  //             }}
  //           >
  //             <Avatar sx={{ width: 40, height: 40 }}>
  //               {review.reviewer.charAt(0)}
  //             </Avatar>
  //             <Box>
  //               <Typography variant="body1" sx={{ fontWeight: "bold" }}>
  //                 {review.reviewer}
  //               </Typography>
  //               <Typography variant="body2">{review.text}</Typography>
  //             </Box>
  //             <Rating value={review.rating} readOnly size="small" />
  //           </Box>
  //         ))}
  //       </Box>
  //     </Box>
  //   </Box>
  // );
};

export default ProfilePage;
