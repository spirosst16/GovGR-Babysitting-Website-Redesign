import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Rating,
  Avatar,
  Breadcrumbs,
  Stack,
  Link,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/system";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  addDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FIREBASE_DB } from "../../config/firebase";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
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
  alignItems: "center",
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
});

const ScheduleSection = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  justifyContent: "space-between",
  marginTop: "30px",
});

const ScheduleItem = styled(Box)(({ available }) => ({
  padding: "10px",
  backgroundColor: available ? "#5e62d1" : "#f4f4f4",
  color: available ? "#fff" : "#888",
  textAlign: "center",
  borderRadius: "8px",
  marginBottom: "5px",
}));

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

  const handleNavigate = (path) => {
    navigate(path);
  };

  const getHomePath = () => {
    if (userRole === "guardian") return "/babysitters";
    if (userRole === "babysitter") return "/babysitting-jobs";
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
      "/my-agreements-and-applications": "My Agreements & Applications",
      "/application/:userId": "Application Details",
      "/edit-application/:userId": "Edit Application",
      "/agreement/:agreementId": "Agreement",
      "/chats": "Messages",
      "/profile": "Profile",
    };

    // Replace any dynamic segments like :userId with placeholders or clean display names
    const cleanPath = pathname
      .replace(/\/application\/[^/]+/, "/application/:userId")
      .replace(/\/edit-application\/[^/]+/, "/edit-application/:userId")
      .replace(/\/agreement\/[^/]+\/[^/]+/, "/agreement/:agreementId");

    return mapping[cleanPath] || pathname.replace("/", ""); // Fallback to cleaned pathname
  };

  const breadcrumbs = [
    <Link
      underline="none"
      key="1"
      color="inherit"
      onClick={() => handleNavigate(getHomePath())}
      sx={{
        "&:hover": { color: "#5e62d1", cursor: "pointer" },
        fontFamily: "Poppins, sans-serif",
      }}
    >
      Home
    </Link>,
    state?.from && (
      <Link
        underline="none"
        key="2"
        color="inherit"
        onClick={() => handleNavigate(state.from)}
        sx={{
          "&:hover": { color: "#5e62d1", cursor: "pointer" },
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {getPageName(state.from)}
      </Link>
    ),
    <Link
      underline="none"
      key="3"
      color="inherit"
      sx={{
        fontFamily: "Poppins, sans-serif",
      }}
    >
      Application Details
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

const BabysittingApplicationDisplay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [viewedUserRole, setViewedUserRole] = useState(null);
  const [agreementExists, setAgreementExists] = useState(false);
  const [agreementPath, setAgreementPath] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "",
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserAndApplication = async () => {
      try {
        setLoading(true);
        let userData = null;

        // Check in "babysitters" collection
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
          setUserRole("babysitter");
        } else {
          // Check in "guardians" collection
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
            setUserRole("guardian");
          }
        }

        if (!userData) throw new Error("User not found");

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
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndApplication();
  }, [userId]);

  useEffect(() => {
    const fetchAgreement = async () => {
      if (!currentUser || !userId) return;

      try {
        setLoading(true);
        const agreementsRef = collection(FIREBASE_DB, "agreements");

        const senderQuery = query(
          agreementsRef,
          where("senderId", "==", currentUser.uid),
          where("recipientId", "==", userId)
        );

        const recipientQuery = query(
          agreementsRef,
          where("senderId", "==", userId),
          where("recipientId", "==", currentUser.uid)
        );

        const [senderSnapshot, recipientSnapshot] = await Promise.all([
          getDocs(senderQuery),
          getDocs(recipientQuery),
        ]);

        if (!senderSnapshot.empty) {
          const docId = senderSnapshot.docs[0].id;
          setAgreementExists(true);
          setAgreementPath(`agreement/${docId}`);
        } else if (!recipientSnapshot.empty) {
          const docId = recipientSnapshot.docs[0].id;
          setAgreementExists(true);
          setAgreementPath(`agreement/${docId}`);
        } else {
          setAgreementExists(false);
          setAgreementPath(null);
        }
      } catch (error) {
        console.error("Error fetching agreement data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgreement();
  }, [currentUser, userId]);
  const handleAvatar = async () => {
    if (!user.id) {
      alert("No valid profile data to save.");
      return;
    }
    if (currentUser === null) {
      navigate(`/profile/${user.userId}`);
      return;
    }
    if (currentUser.uid === user.userId) {
      navigate(`/profile`);
    } else {
      navigate(`/profile/${user.userId}`);
    }
  };

  const fetchUserRole = async (userId, setRole) => {
    let userData = null;
    let role = null;

    // Check in babysitters collection
    const babysittersRef = query(
      collection(FIREBASE_DB, "babysitters"),
      where("userId", "==", userId)
    );
    const babysittersSnapshot = await getDocs(babysittersRef);
    if (!babysittersSnapshot.empty) {
      userData = babysittersSnapshot.docs[0].data();
      role = "babysitter";
    } else {
      // Check in guardians collection
      const guardiansRef = query(
        collection(FIREBASE_DB, "guardians"),
        where("userId", "==", userId)
      );
      const guardiansSnapshot = await getDocs(guardiansRef);
      if (!guardiansSnapshot.empty) {
        userData = guardiansSnapshot.docs[0].data();
        role = "guardian";
      }
    }

    if (setRole) setRole(role);
    return { userData, role };
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserRole(user.uid, setCurrentUserRole);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchUserRole(userId, setViewedUserRole);
  }, [userId]);

  if (!user || !application)
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

  if (
    application.status === "temporary" &&
    currentUser?.uid !== application.userId
  ) {
    if (isLoggedIn) {
      if (userRole === "guardian") {
        navigate("/babysitters");
      } else if (userRole === "babysitter") {
        navigate("/babysitting-jobs");
      }
    } else {
      navigate("/");
    }
  }

  const handleCreateAgreement = async () => {
    if (currentUser && user) {
      try {
        // Create a new agreement with "temporary" status
        const newAgreementRef = await addDoc(
          collection(FIREBASE_DB, "agreements"),
          {
            recipientId: userId,
            senderId: currentUser.uid,
            status: "",
          }
        );

        // Navigate to the agreement
        navigate(`/agreement/${newAgreementRef.id}`, {
          state: { from: location.pathname },
        });

        // Monitor agreement for status change
        const agreementDocRef = doc(
          FIREBASE_DB,
          "agreements",
          newAgreementRef.id
        );
        const unsubscribe = onSnapshot(agreementDocRef, async (snapshot) => {
          const agreement = snapshot.data();
          if (agreement && agreement.status !== "") {
            // Agreement is no longer temporary; stop monitoring
            unsubscribe();
          }
        });
      } catch (error) {
        console.error("Error creating agreement:", error);
        setAlert({
          open: true,
          message: "Failed to create the agreement. Please try again.",
          severity: "error",
        });
      }
    }
  };

  const handleDeleteApplication = async () => {
    try {
      const applicationDocRef = doc(
        FIREBASE_DB,
        "babysittingApplications",
        application.id
      );
      await deleteDoc(applicationDocRef);
      navigate("/my-agreements-and-applications");
    } catch (error) {
      console.error("Error deleting application: ", error);
      setAlert({
        open: true,
        message: "Failed to delete the application. Please try again.",
        severity: "error",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!user.id) {
      alert("No valid profile data to save.");
      return;
    }

    navigate(`/chats`, {
      state: { selectedUser: user }, // Passing selectedUser as state
    });
  };

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

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
    return (
      <PageContainer>
        <CustomSeparator />
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
            Application Details
          </Typography>

          <InfoSection>
            {/* Profile Section */}
            <ProfileSection>
              <Avatar
                src={user.photo || DefaultUserImage}
                sx={{
                  width: 200,
                  height: 200,
                  margin: "auto",
                  borderRadius: "50%",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    cursor: "pointer",
                  },
                }}
                onClick={handleAvatar}
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
                  mt: 2,
                }}
                onClick={handleSendMessage}
              >
                Message
              </Button>
            </ProfileSection>

            <ApplicationSection>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: 3,
                }}
              >
                {/* Left Column: Area and Job Type */}
                <Box sx={{ flex: 1, minWidth: "45%" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Poppins', sans-serif",
                      marginBottom: "16px", // Added spacing between contents
                    }}
                  >
                    <Box component="span" sx={{ fontWeight: "bold" }}>
                      Area:
                    </Box>{" "}
                    <Box component="span" sx={{ fontWeight: "normal" }}>
                      {application.area}
                    </Box>
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Poppins', sans-serif",
                      marginBottom: "16px", // Added spacing between contents
                    }}
                  >
                    <Box component="span" sx={{ fontWeight: "bold" }}>
                      Job Type:
                    </Box>{" "}
                    <Box component="span" sx={{ fontWeight: "normal" }}>
                      {application.jobType}
                    </Box>
                  </Typography>
                </Box>

                {/* Right Column: Work Location and Child Ages */}
                <Box sx={{ flex: 1, minWidth: "45%" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Poppins', sans-serif",
                      marginBottom: "16px", // Added spacing between contents
                    }}
                  >
                    <Box component="span" sx={{ fontWeight: "bold" }}>
                      Work Location:
                    </Box>{" "}
                    <Box component="span" sx={{ fontWeight: "normal" }}>
                      {application.babysittingPlace.join(", ")}
                    </Box>
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "16px", // Added spacing between contents
                      }}
                    >
                      <Box
                        component="span"
                        sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                      >
                        Child Ages:
                      </Box>
                      <Box
                        sx={{
                          display: "inline-flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        {application.childAges
                          .slice()
                          .sort((a, b) => a - b)
                          .map((age, index) => (
                            <ButtonStyle key={index}>{age}</ButtonStyle>
                          ))}
                      </Box>
                    </Box>
                  </Typography>
                </Box>
              </Box>

              {/* Availability Schedule */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontFamily: "'Poppins', sans-serif",
                  marginTop: "10px",
                  marginBottom: "-30px",
                }}
              >
                Availability Schedule
              </Typography>
              <ScheduleSection>
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day, index) => (
                  <Box key={index} sx={{ width: "100%", flex: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                        marginBottom: "10px",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {day}
                    </Typography>
                    {["Morning", "Afternoon", "Evening", "Night"].map(
                      (timeSlot, idx) => (
                        <ScheduleItem
                          key={idx}
                          available={application.availability.includes(
                            `${day} ${timeSlot}`
                          )}
                        >
                          <Typography
                            sx={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            {timeSlot}
                          </Typography>
                        </ScheduleItem>
                      )
                    )}
                  </Box>
                ))}
              </ScheduleSection>

              {/* Buttons */}
              <Box sx={{ textAlign: "center", marginTop: "30px" }}>
                {currentUser?.uid === application.userId &&
                  application.status === "temporary" && (
                    <Button
                      variant="contained"
                      onClick={() =>
                        navigate(`/edit-application/${userId}`, {
                          state: {
                            from: location.pathname,
                          },
                        })
                      }
                      sx={{
                        backgroundColor: "#5e62d1",
                        fontSize: "1rem",
                        borderRadius: "30px",
                        padding: "12px 30px",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "#4a54c1",
                        },
                        fontFamily: "'Poppins', sans-serif",
                        margin: "10px auto",
                      }}
                    >
                      Edit Application
                    </Button>
                  )}
                {currentUserRole &&
                  viewedUserRole &&
                  currentUserRole !== viewedUserRole && (
                    <Button
                      variant="contained"
                      onClick={() =>
                        agreementExists
                          ? navigate(`/${agreementPath}`, {
                              state: {
                                from: location.pathname,
                              },
                            })
                          : handleCreateAgreement()
                      }
                      sx={{
                        backgroundColor: "#5e62d1",
                        fontSize: "1rem",
                        borderRadius: "30px",
                        padding: "12px 30px",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "#4a54c1",
                        },
                        fontFamily: "'Poppins', sans-serif",
                        margin: "10px auto",
                      }}
                    >
                      {agreementExists
                        ? "Inspect Agreement"
                        : "Create Agreement"}
                    </Button>
                  )}
                {currentUser?.uid === application.userId && (
                  <Button
                    variant="contained"
                    onClick={handleDeleteApplication}
                    sx={{
                      backgroundColor: "#d32f2f",
                      fontSize: "1rem",
                      borderRadius: "30px",
                      padding: "12px 30px",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#b71c1c",
                      },
                      fontFamily: "'Poppins', sans-serif",
                      margin: "10px auto",
                    }}
                  >
                    Delete Application
                  </Button>
                )}
              </Box>
            </ApplicationSection>
          </InfoSection>
        </ContentWrapper>
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
      </PageContainer>
    );
  }
};

export default BabysittingApplicationDisplay;
