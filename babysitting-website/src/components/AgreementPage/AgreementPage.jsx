import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Grid,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Breadcrumbs,
  Link,
  Stack,
  Radio,
  Snackbar,
  Alert,
  Autocomplete,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/system";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { deleteDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import DefaultUserImage from "../../assets/Babysitter-image.webp";
import { greekCities } from "../../utils/greekCities";

const PageContainer = styled(Box)({
  backgroundColor: "#f4f4f4",
  minHeight: "100vh",
  padding: "120px 0px 50px",
});

const ContentWrapper = styled(Container)({
  maxWidth: "900px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "30px",
});

const UserSection = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
});

const AvatarSection = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "20px",
});

const DetailsSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
});

const StyledButton = styled(Button)({
  backgroundColor: "#5e62d1",
  color: "#fff",
  fontFamily: "'Poppins', sans-serif",
  fontSize: "1rem",
  padding: "10px 20px",
  borderRadius: "25px",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#4a54c1",
  },
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
    <Link
      underline="none"
      key="3"
      color="inherit"
      sx={{
        fontFamily: "Poppins, sans-serif",
      }}
    >
      Agreement
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

const AgreementPage = () => {
  const { agreementId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [userId1, setUserId1] = useState(null);
  const [userId2, setUserId2] = useState(null);
  const [sender, setSender] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState({
    area: "",
    jobType: "",
    weeklySchedule: [],
    babysittingPlace: "",
    startingDate: "",
    endingDate: "",
    additionalNotes: "",
    amount: "",
  });
  const [endingDateOptions, setEndingDateOptions] = useState([]);
  const [errors, setErrors] = useState({
    area: false,
    weeklySchedule: false,
    babysittingPlace: false,
    startingDate: false,
    endingDate: false,
  });
  const isEditable = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    return currentUser?.uid === userId1 && status === "";
  };
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "",
  });

  useEffect(() => {
    const fetchUserData = async (userId1, setUser1, userId2, setUser2) => {
      if (!userId1 || !userId2) {
        return;
      }
      try {
        let userData = null;
        setLoading(true);

        const babysittersRef = query(
          collection(FIREBASE_DB, "babysitters"),
          where("userId", "==", userId1)
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
            where("userId", "==", userId1)
          );
          const guardiansSnapshot = await getDocs(guardiansRef);
          if (!guardiansSnapshot.empty) {
            userData = guardiansSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))[0];
          }
        }

        if (!userData) throw new Error(`User with ID ${userId1} not found`);
        setUser1(userData);

        const babysittersRef2 = query(
          collection(FIREBASE_DB, "babysitters"),
          where("userId", "==", userId2)
        );
        const babysittersSnapshot2 = await getDocs(babysittersRef2);
        if (!babysittersSnapshot2.empty) {
          userData = babysittersSnapshot2.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))[0];
        } else {
          const guardiansRef = query(
            collection(FIREBASE_DB, "guardians"),
            where("userId", "==", userId2)
          );
          const guardiansSnapshot = await getDocs(guardiansRef);
          if (!guardiansSnapshot.empty) {
            userData = guardiansSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))[0];
          }
        }

        if (!userData) throw new Error(`User with ID ${userId2} not found`);
        setUser2(userData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    const fetchAgreementData = async () => {
      setLoading(true);
      try {
        const agreementsRef = collection(FIREBASE_DB, "agreements");
        const agreementQuery = query(
          agreementsRef,
          where("__name__", "==", agreementId)
        );
        const querySnapshot = await getDocs(agreementQuery);

        if (!querySnapshot.empty) {
          const agreementData = querySnapshot.docs[0].data();
          setUserId1(agreementData.senderId);
          setUserId2(agreementData.recipientId);
          setFormValues({
            area: agreementData.area || "",
            jobType: agreementData.jobType || "",
            weeklySchedule: agreementData.weeklySchedule || [],
            babysittingPlace: agreementData.babysittingPlace || "",
            startingDate: agreementData.startingDate || "",
            endingDate: agreementData.endingDate || "",
            additionalNotes: agreementData.additionalNotes || "",
            paymentStatus: agreementData.paymentStatus || "unknown",
            lastPaymentDate: agreementData.lastPaymentDate || "",
          });
          setStatus(agreementData.status);
        } else {
          console.error("No agreement found with the provided ID.");
        }
      } catch (error) {
        console.error("Error fetching agreement data:", error);
      }
    };

    fetchAgreementData();

    fetchUserData(userId1, setSender, userId2, setRecipient);
  }, [userId1, userId2]);

  const handleAvatar = async (userId) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!userId) {
      alert("No valid profile.");
      return;
    }
    if (currentUser === null) {
      navigate(`/profile/${userId}`);
      return;
    }
    if (currentUser.uid === userId) {
      navigate(`/profile`);
    } else {
      navigate(`/profile/${userId}`, {
        state: { from: location.pathname },
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    if (name === "startingDate") {
      if (value) {
        const startDate = new Date(value);
        const options = Array.from({ length: 12 }, (_, index) => {
          const optionDate = new Date(
            Date.UTC(
              startDate.getUTCFullYear(),
              startDate.getUTCMonth() + index + 1,
              startDate.getUTCDate()
            )
          );
          return optionDate.toISOString().split("T")[0];
        });
        setEndingDateOptions(options);
      } else {
        setEndingDateOptions([]);
      }
    }
  };

  const validateForm = () => {
    let formErrors = {
      area: !formValues.area,
      jobType: !formValues.jobType,
      weeklySchedule: formValues.weeklySchedule.length === 0,
      babysittingPlace: formValues.babysittingPlace.length === 0,
      startingDate: !formValues.startingDate,
      endingDate: !formValues.endingDate,
    };

    setErrors(formErrors);
    return Object.values(formErrors).every((error) => !error);
  };

  const handleSend = async () => {
    if (!validateForm()) {
      setAlert({
        open: true,
        message: "Please fill in all required fields.",
        severity: "error",
      });
      return;
    }

    const startDate = new Date(formValues.startingDate);
    const endDate = new Date(formValues.endingDate);

    const oneMonthLater = new Date(startDate);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    if (endDate < oneMonthLater) {
      setAlert({
        open: true,
        message:
          "The ending date must be at least one month after the starting date.",
        severity: "error",
      });
      return;
    }

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setAlert({
          open: true,
          message: "You must be logged in to send an agreement.",
          severity: "error",
        });
        return;
      }

      const agreementsRef = collection(FIREBASE_DB, "agreements");
      const docRef = await addDoc(agreementsRef, {
        senderId: userId1,
        recipientId: userId2,
        status: "pending",
        ...formValues,
        paymentStatus: "unknown",
        lastPaymentDate: formValues.startingDate,
        amount: formValues.jobType === "Part-time" ? "300" : "500",
      });

      setStatus("pending");
      setAlert({
        open: true,
        message: "Agreement was sent successfully!",
        severity: "success",
      });
      console.log("Agreement sent with ID:", docRef.id);
    } catch (error) {
      console.error("Error sending agreement:", error);
      setAlert({
        open: true,
        message: "Failed to send agreement. Please try again.",
        severity: "error",
      });
    }
  };

  const handleUnsend = async () => {
    try {
      if (!agreementId) {
        setAlert({
          open: true,
          message: "No agreement to unsend.",
          severity: "error",
        });
        return;
      }

      const agreementsRef = collection(FIREBASE_DB, "agreements");
      const agreementQuery = query(
        agreementsRef,
        where("status", "==", "pending"),
        where("senderId", "==", userId1),
        where("recipientId", "==", userId2)
      );

      const querySnapshot = await getDocs(agreementQuery);

      if (querySnapshot.empty) {
        setAlert({
          open: true,
          message: "No pending agreement found.",
          severity: "error",
        });
        return;
      }

      // Delete the pending agreement
      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      setStatus("");
      console.log("Agreement unsent and deleted.");

      navigate("/my-dashboard", {
        state: { alertMessage: "Agreement unsent and deleted successfully!!" },
      });
    } catch (error) {
      console.error("Error unsending agreement:", error);
      setAlert({
        open: true,
        message: "Failed to unsend agreement. Please try again.",
        severity: "error",
      });
    }
  };

  const handleAccept = async () => {
    try {
      if (!agreementId) {
        setAlert({
          open: true,
          message: "No agreement to accept.",
          severity: "error",
        });
        return;
      }

      const agreementDocRef = doc(FIREBASE_DB, "agreements", agreementId);
      await updateDoc(agreementDocRef, {
        status: "accepted",
        paymentStatus: "not available yet",
      });

      setStatus("accepted");
      const agreementsRef = collection(FIREBASE_DB, "agreements");

      const pendingSenderQuery = query(
        agreementsRef,
        where("status", "==", "pending"),
        where("senderId", "in", [userId1, userId2])
      );

      const pendingRecipientQuery = query(
        agreementsRef,
        where("status", "==", "pending"),
        where("recipientId", "in", [userId1, userId2])
      );

      try {
        const [senderSnapshot, recipientSnapshot] = await Promise.all([
          getDocs(pendingSenderQuery),
          getDocs(pendingRecipientQuery),
        ]);

        const combinedDocs = [
          ...senderSnapshot.docs,
          ...recipientSnapshot.docs,
        ];

        const uniqueDocs = Array.from(
          new Map(combinedDocs.map((doc) => [doc.id, doc])).values()
        );

        const deletePromises = uniqueDocs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        console.log("All pending agreements deleted successfully.");
      } catch (error) {
        console.error("Error deleting pending agreements:", error);
      }

      setAlert({
        open: true,
        message: "Agreement was accepted successfully!",
        severity: "success",
      });
      console.log("Agreement accepted.");
    } catch (error) {
      console.error("Error accepting agreement:", error);
      setAlert({
        open: true,
        message: "Failed to accept agreement. Please try again.",
        severity: "error",
      });
    }
  };

  const handleDecline = async () => {
    try {
      if (!agreementId) {
        setAlert({
          open: true,
          message: "No agreement to decline.",
          severity: "error",
        });
        return;
      }

      const agreementDocRef = doc(FIREBASE_DB, "agreements", agreementId);
      await deleteDoc(agreementDocRef);

      setStatus("");
      console.log("Agreement declined and deleted.");
      navigate("/my-dashboard", {
        state: { alertMessage: "Agreement declined successfully!" },
      });
    } catch (error) {
      console.error("Error declining agreement:", error);
      setAlert({
        open: true,
        message: "Failed to decline agreement. Please try again.",
        severity: "error",
      });
    }
  };

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  const renderButton = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) return null;

    if (currentUser.uid === userId1) {
      if (status === "pending") {
        return (
          <Box>
            <StyledButton onClick={handleUnsend}>Unsend</StyledButton>
          </Box>
        );
      }
      if (status === "") {
        return (
          <Box>
            <StyledButton onClick={handleSend}>Send</StyledButton>
          </Box>
        );
      }
    } else if (currentUser.uid === userId2) {
      if (status === "pending") {
        return (
          <Box>
            <StyledButton onClick={handleAccept}>Accept</StyledButton>
            <StyledButton
              sx={{
                backgroundColor: "red",
                "&:hover": {
                  backgroundColor: "#b71c1c",
                },
                marginLeft: "10px",
              }}
              onClick={handleDecline}
            >
              Decline
            </StyledButton>
          </Box>
        );
      }
    }
    return null;
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
              textAlign: "center",
              fontWeight: "bold",
              fontFamily: "'Poppins', sans-serif",
              paddingBottom: "5px",
            }}
          >
            Babysitting Agreement
          </Typography>

          <UserSection>
            <AvatarSection>
              <Avatar
                src={sender?.photo || DefaultUserImage}
                sx={{
                  width: 80,
                  height: 80,
                  "&:hover": {
                    cursor: "pointer",
                  },
                }}
                onClick={() => handleAvatar(sender.userId)}
              />
              <Typography
                variant="h6"
                onClick={() => handleAvatar(sender.userId)}
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: "bold",
                  "&:hover": {
                    cursor: "pointer",
                  },
                }}
              >
                {sender?.firstName} {sender?.lastName}
              </Typography>
            </AvatarSection>
            <AvatarSection>
              <Avatar
                src={recipient?.photo || DefaultUserImage}
                sx={{
                  width: 80,
                  height: 80,
                  "&:hover": {
                    cursor: "pointer",
                  },
                }}
                onClick={() => handleAvatar(recipient.userId)}
              />
              <Typography
                variant="h6"
                onClick={() => handleAvatar(recipient.userId)}
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: "bold",
                  "&:hover": {
                    cursor: "pointer",
                  },
                }}
              >
                {recipient?.firstName} {recipient?.lastName}
              </Typography>
            </AvatarSection>
          </UserSection>

          {isEditable() ? (
            <DetailsSection>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: "10px",
                }}
              >
                Agreement Details
              </Typography>
              <Autocomplete
                options={greekCities.sort()}
                value={formValues.area || ""}
                onChange={(event, value) =>
                  setFormValues((prevValues) => ({
                    ...prevValues,
                    area: value,
                  }))
                }
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Area"
                    variant="outlined"
                    required
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                )}
              />

              <FormControl component="fieldset">
                <FormLabel
                  component="legend"
                  sx={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "20px",
                    "&.Mui-focused": {
                      color: "#5e62d1",
                    },
                  }}
                >
                  Job Type *
                </FormLabel>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 2,
                  }}
                >
                  <FormControlLabel
                    control={
                      <StyledRadio
                        checked={formValues.jobType === "Part-time"}
                        onChange={() =>
                          setFormValues({ ...formValues, jobType: "Part-time" })
                        }
                      />
                    }
                    label="Part-time"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                  <FormControlLabel
                    control={
                      <StyledRadio
                        checked={formValues.jobType === "Full-time"}
                        onChange={() =>
                          setFormValues({ ...formValues, jobType: "Full-time" })
                        }
                      />
                    }
                    label="Full-time"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </Box>
              </FormControl>

              <FormControl>
                <FormLabel
                  component="legend"
                  sx={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "20px",
                    "&.Mui-focused": {
                      color: "#5e62d1",
                    },
                  }}
                >
                  Weekly Schedule *
                </FormLabel>
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
                        {["Morning", "Afternoon", "Evening", "Night"].map(
                          (time) => (
                            <FormControlLabel
                              key={time}
                              control={
                                <StyledCheckbox
                                  checked={formValues.weeklySchedule.includes(
                                    `${day} ${time}`
                                  )}
                                  onChange={(e) => {
                                    const updatedSchedule = e.target.checked
                                      ? [
                                          ...formValues.weeklySchedule,
                                          `${day} ${time}`,
                                        ]
                                      : formValues.weeklySchedule.filter(
                                          (slot) => slot !== `${day} ${time}`
                                        );
                                    setFormValues({
                                      ...formValues,
                                      weeklySchedule: updatedSchedule,
                                    });
                                  }}
                                />
                              }
                              label={time}
                            />
                          )
                        )}
                      </FormGroup>
                    </Grid>
                  ))}
                </Grid>
              </FormControl>

              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel
                  component="legend"
                  sx={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "20px",
                    "&.Mui-focused": {
                      color: "#5e62d1",
                    },
                  }}
                >
                  Babysitting Place *
                </FormLabel>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 2,
                  }}
                >
                  <FormControlLabel
                    control={
                      <StyledRadio
                        checked={
                          formValues.babysittingPlace === "Family's House"
                        }
                        onChange={() =>
                          setFormValues({
                            ...formValues,
                            babysittingPlace: "Family's House",
                          })
                        }
                      />
                    }
                    label="Family's House"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                  <FormControlLabel
                    control={
                      <StyledRadio
                        checked={
                          formValues.babysittingPlace === "Babysitter's House"
                        }
                        onChange={() =>
                          setFormValues({
                            ...formValues,
                            babysittingPlace: "Babysitter's House",
                          })
                        }
                      />
                    }
                    label="Babysitter's House"
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </Box>
              </FormControl>

              <StyledTextField
                fullWidth
                label="Starting Date"
                name="startingDate"
                value={formValues.startingDate}
                onChange={handleInputChange}
                type="date"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: "2000-01-01",
                }}
                required
                sx={{ fontFamily: "'Poppins', sans-serif" }}
              />

              <StyledTextField
                select
                fullWidth
                label="Ending Date*"
                name="endingDate"
                value={formValues.endingDate}
                onChange={handleInputChange}
                disabled={!formValues.startingDate}
                sx={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {endingDateOptions.map((date) => (
                  <MenuItem key={date} value={date}>
                    {date}
                  </MenuItem>
                ))}
              </StyledTextField>

              <StyledTextField
                fullWidth
                label="Additional Notes"
                name="additionalNotes"
                value={formValues.additionalNotes}
                onChange={handleInputChange}
                multiline
                rows={4}
                variant="outlined"
                sx={{ fontFamily: "'Poppins', sans-serif" }}
              />
            </DetailsSection>
          ) : (
            <DetailsSection>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: "10px",
                }}
              >
                Agreement Details
              </Typography>

              <Typography
                variant="h6"
                sx={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Box component="span" sx={{ fontWeight: "bold" }}>
                  Area:
                </Box>{" "}
                <Box component="span" sx={{ fontWeight: "normal" }}>
                  {formValues.area}
                </Box>
              </Typography>

              <Typography
                variant="h6"
                sx={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Box component="span" sx={{ fontWeight: "bold" }}>
                  Job Type:
                </Box>{" "}
                <Box component="span" sx={{ fontWeight: "normal" }}>
                  {formValues.jobType}
                </Box>
              </Typography>

              <Typography
                variant="h6"
                sx={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Box component="span" sx={{ fontWeight: "bold" }}>
                  Weekly Schedule:
                </Box>{" "}
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
                          marginBottom: "20px",
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        {day}
                      </Typography>
                      {["Morning", "Afternoon", "Evening", "Night"].map(
                        (timeSlot, idx) => (
                          <ScheduleItem
                            key={idx}
                            available={formValues.weeklySchedule.includes(
                              `${day} ${timeSlot}`
                            )}
                          >
                            <Typography
                              sx={{
                                fontFamily: "'Poppins', sans-serif",
                              }}
                            >
                              {timeSlot}
                            </Typography>
                          </ScheduleItem>
                        )
                      )}
                    </Box>
                  ))}
                </ScheduleSection>
              </Typography>

              <Typography
                variant="h6"
                sx={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Box component="span" sx={{ fontWeight: "bold" }}>
                  Babysitting Place:
                </Box>{" "}
                <Box component="span" sx={{ fontWeight: "normal" }}>
                  {formValues.babysittingPlace}
                </Box>
              </Typography>

              <Typography
                variant="h6"
                sx={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Box component="span" sx={{ fontWeight: "bold" }}>
                  Starting Date:
                </Box>{" "}
                <Box component="span" sx={{ fontWeight: "normal" }}>
                  {formValues.startingDate}
                </Box>
              </Typography>

              <Typography
                variant="h6"
                sx={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Box component="span" sx={{ fontWeight: "bold" }}>
                  Ending Date:
                </Box>{" "}
                <Box component="span" sx={{ fontWeight: "normal" }}>
                  {formValues.endingDate}
                </Box>
              </Typography>

              <Typography
                variant="h6"
                sx={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Box component="span" sx={{ fontWeight: "bold" }}>
                  Additional Notes:
                </Box>{" "}
                <Box component="span" sx={{ fontWeight: "normal" }}>
                  {formValues.additionalNotes}
                </Box>
              </Typography>
            </DetailsSection>
          )}

          <Box sx={{ textAlign: "center", marginTop: "20px" }}>
            {renderButton()}
          </Box>
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

export default AgreementPage;
