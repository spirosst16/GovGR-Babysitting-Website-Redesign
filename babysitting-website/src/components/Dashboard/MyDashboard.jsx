import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
  Breadcrumbs,
  Stack,
  Link,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/system";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import PaymentsIcon from "@mui/icons-material/Payments";
import HistoryIcon from "@mui/icons-material/History";
import DoneIcon from "@mui/icons-material/Done";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";

const Container = styled(Box)({
  backgroundColor: "#f4f4f4",
  minHeight: "100vh",
  padding: "20px",
  paddingTop: "100px",
  display: "flex",
  flexDirection: "column",
});

const Header = styled(Box)({
  width: "100%",
  margin: "0 auto",
  textAlign: "center",
  marginBottom: "20px",
});

const TabContainer = styled(Box)({
  marginTop: "5px",
  marginBottom: "7px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const StyledTabs = styled(Tabs)({
  display: "flex",
  justifyContent: "space-around",
  width: "100%",
  fontFamily: "Poppins, sans-serif",
});

const StyledTab = styled(Tab)({
  fontSize: "1.2rem",
  fontWeight: "bold",
  minHeight: "70px",
  "& .MuiTab-iconWrapper": {
    fontSize: "2rem",
    marginBottom: "5px",
  },
});

const ApplicationCard = styled(Card)({
  margin: "15px",
  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
  borderRadius: "10px",
  width: "450px",
  height: "380px",
  transition: "transform 0.2s, box-shadow 0.2s",
  justifyContent: "space-between",
  "&:hover": {
    transform: "scale(1.03)",
    boxShadow: "0px 6px 25px rgba(0, 0, 0, 0.3)",
  },
});

const CardHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const StatusChip = styled(Box)(({ status }) => ({
  backgroundColor:
    status === "temporary" || status === "pending"
      ? "#FFC107"
      : status === "active" || status === "accepted"
      ? "#4CAF50"
      : "#9E9E9E",
  color: "#fff",
  padding: "5px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "bold",
}));

const ProgressContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "30px",
});

const ActionButton = styled(Button)({
  backgroundColor: "#5e62d1",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#4d56b1",
  },
  margin: "5px",
});

const EmptyState = styled(Box)({
  textAlign: "center",
  padding: "50px 20px",
});

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
      My Dashboard
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

const CompactWeeklySchedule = ({ availability }) => {
  const dayMap = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday",
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const timeSlots = ["Morning", "Afternoon", "Evening", "Night"];

  return (
    <Box display="grid" gridTemplateColumns="repeat(8, 1fr)" gap={0.5} mt={3}>
      <Box></Box>
      {days.map((day) => (
        <Typography
          key={day}
          variant="caption"
          textAlign="center"
          fontWeight="bold"
          fontFamily="Poppins, sans-serif"
        >
          {day}
        </Typography>
      ))}
      {timeSlots.map((timeSlot) => (
        <>
          <Typography
            key={`label-${timeSlot}`}
            variant="caption"
            textAlign="center"
            fontWeight="bold"
            fontFamily="Poppins, sans-serif"
          >
            {timeSlot}
          </Typography>
          {days.map((day) => {
            const isAvailable = availability.includes(
              `${dayMap[day]} ${timeSlot}`
            );
            return (
              <Box
                key={`${day}-${timeSlot}`}
                width={20}
                height={20}
                borderRadius="50%"
                bgcolor={isAvailable ? "#5e62d1" : "#888"}
                mx="auto"
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
              >
                {isAvailable && (
                  <Typography
                    variant="caption"
                    component="span"
                    fontWeight="bold"
                    fontFamily="Poppins, sans-serif"
                    color="white"
                  >
                    ✔
                  </Typography>
                )}
              </Box>
            );
          })}
        </>
      ))}
    </Box>
  );
};

const MyDashboard = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [agreements, setAgreements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isBabysitter, setIsBabysitter] = useState(false);
  const [paymentReadyAgreements, setPaymentReadyAgreements] = useState([]);
  const navigate = useNavigate();
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "",
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
    const fetchCurrentUserData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const babysittersRef = query(
          collection(FIREBASE_DB, "babysitters"),
          where("userId", "==", userId)
        );
        const babysittersSnapshot = await getDocs(babysittersRef);

        if (!babysittersSnapshot.empty) {
          setIsBabysitter(true);
          setCurrentUser(babysittersSnapshot.docs[0].data());
          return;
        }

        const guardiansRef = query(
          collection(FIREBASE_DB, "guardians"),
          where("userId", "==", userId)
        );
        const guardiansSnapshot = await getDocs(guardiansRef);

        if (!guardiansSnapshot.empty) {
          setIsBabysitter(false);
          setCurrentUser(guardiansSnapshot.docs[0].data());
          return;
        }

        throw new Error(`User with ID ${userId} not found`);
      } catch (error) {
        console.error("Error fetching current user data:", error);
      }
    };

    fetchCurrentUserData();
  }, [userId]);

  const fetchUserData = async (userId) => {
    try {
      let userData = null;
      setLoading(true);

      const babysittersRef = query(
        collection(FIREBASE_DB, "babysitters"),
        where("userId", "==", userId)
      );
      const babysittersSnapshot = await getDocs(babysittersRef);
      if (!babysittersSnapshot.empty) {
        userData = babysittersSnapshot.docs[0].data();
      } else {
        const guardiansRef = query(
          collection(FIREBASE_DB, "guardians"),
          where("userId", "==", userId)
        );
        const guardiansSnapshot = await getDocs(guardiansRef);
        if (!guardiansSnapshot.empty) {
          userData = guardiansSnapshot.docs[0].data();
        }
      }

      if (!userData) throw new Error(`User with ID ${userId} not found`);

      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const senderAgreementsRef = query(
          collection(FIREBASE_DB, "agreements"),
          where("senderId", "==", userId)
        );
        const recipientAgreementsRef = query(
          collection(FIREBASE_DB, "agreements"),
          where("recipientId", "==", userId)
        );

        const applicationsRef = query(
          collection(FIREBASE_DB, "babysittingApplications"),
          where("userId", "==", userId)
        );

        const [senderSnap, recipientSnap, applicationsSnap] = await Promise.all(
          [
            getDocs(senderAgreementsRef),
            getDocs(recipientAgreementsRef),
            getDocs(applicationsRef),
          ]
        );

        const agreementsSnap = [...senderSnap.docs, ...recipientSnap.docs];

        const fetchedAgreements = await Promise.all(
          agreementsSnap.map(async (doc) => {
            const agreement = doc.data();
            const agreementId = doc.id;

            const isExpired =
              (new Date(agreement.endingDate) <= new Date() &&
                agreement.paymentStatus === "completed") ||
              new Date() >
                new Date(
                  new Date(agreement.endingDate).setDate(
                    new Date(agreement.endingDate).getDate() + 30
                  )
                );

            if (isExpired) {
              await updateDoc(doc.ref, { status: "history" });
              agreement.status = "history";
            }

            const currentDate = new Date();
            const lastPaymentDate = new Date(agreement.lastPaymentDate);

            let monthsPassed =
              (currentDate.getFullYear() - lastPaymentDate.getFullYear()) * 12 +
              (currentDate.getMonth() - lastPaymentDate.getMonth());

            const nextMonthDate = new Date(lastPaymentDate);
            nextMonthDate.setMonth(nextMonthDate.getMonth() + monthsPassed);

            if (
              (monthsPassed >= 2 ||
                new Date() >= new Date(agreement.endingDate)) &&
              agreement.status === "accepted" &&
              agreement.paymentStatus !== "completed"
            ) {
              let newLastPaymentDate = new Date(lastPaymentDate);
              newLastPaymentDate.setMonth(
                newLastPaymentDate.getMonth() + monthsPassed - 1
              );

              if (agreement.paymentStatus !== "pending babysitter") {
                const currentDate = new Date();
                if (
                  currentDate.getDate() < newLastPaymentDate.getDate() &&
                  new Date() < new Date(agreement.endingDate)
                ) {
                  newLastPaymentDate.setMonth(
                    newLastPaymentDate.getMonth() - 1
                  );
                }

                const formattedDate = newLastPaymentDate
                  .toISOString()
                  .split("T")[0];
                await updateDoc(doc.ref, {
                  paymentStatus: "pending guardian",
                  lastPaymentDate: formattedDate,
                });

                agreement.lastPaymentDate = formattedDate;
                agreement.paymentStatus = "pending guardian";
              } else {
                const formattedDate = newLastPaymentDate
                  .toISOString()
                  .split("T")[0];

                await updateDoc(doc.ref, {
                  lastPaymentDate: formattedDate,
                });

                agreement.lastPaymentDate = formattedDate;
              }
            }

            const otherUserId =
              agreement.senderId === userId
                ? agreement.recipientId
                : agreement.senderId;
            const otherUser = await fetchUserData(otherUserId);

            return {
              id: agreementId,
              ...agreement,
              otherUser,
            };
          })
        );

        const fetchedApplications = applicationsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAgreements(fetchedAgreements);
        setApplications(fetchedApplications);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    const readyForPayment = agreements.filter(
      (agreement) =>
        new Date(agreement.endingDate) < new Date() &&
        agreement.status === "accepted"
    );
    setPaymentReadyAgreements(readyForPayment);
  }, [agreements]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  useEffect(() => {
    if (location.state?.alertMessage) {
      setAlert({
        open: true,
        message: location.state.alertMessage,
        severity: "success",
      });
    }
  }, [location.state]);

  const calculateProgress = (startingDate, endingDate) => {
    const currentDate = new Date();
    const start = new Date(startingDate);
    const end = new Date(endingDate);

    const totalDuration = end - start;
    const elapsedDuration = currentDate - start;

    return Math.max(Math.min((elapsedDuration / totalDuration) * 100, 100), 0);
  };

  const handleProfile = async (userId) => {
    if (!userId) {
      alert("No valid user.");
      return;
    }

    navigate(`/profile/${userId}`);
  };

  const renderNotifications = () => {
    if (paymentReadyAgreements.length === 0) return null;

    return (
      <Box
        sx={{
          padding: "24px",
          backgroundColor: "#5e62d1",
          borderRadius: "16px",
          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
          color: "white",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            marginBottom: "16px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Agreements Pending Payment
        </Typography>
        <Typography
          variant="body2"
          sx={{
            marginBottom: "24px",
            opacity: 0.85,
            maxWidth: "800px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Please review and complete the payments listed below to proceed with
          your agreements.
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-evenly",
            gap: "20px",
            width: "100%",
          }}
        >
          {paymentReadyAgreements.map((agreement) => (
            <Box
              key={agreement.id}
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                padding: "16px 24px",
                width: "100%",
                cursor: "pointer",
                transition: "box-shadow 0.2s, transform 0.2s",
                "&:hover": {
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                  transform: "translateY(-6px)",
                },
              }}
              onClick={() => handlePaymentDetails(agreement.id)}
            >
              <Box
                sx={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  marginRight: "20px",
                  backgroundColor: "#f4f4f4",
                }}
              >
                <img
                  src={agreement.otherUser?.photo}
                  alt={`${agreement.otherUser?.firstName} ${agreement.otherUser?.lastName}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
              <Box sx={{ textAlign: "left", flex: 1 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    color: "#5e62d1",
                    marginBottom: "4px",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {agreement.otherUser?.firstName}{" "}
                  {agreement.otherUser?.lastName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "black",
                    opacity: 0.75,
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  Payment details available. Click to review.
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const handlePaymentDetails = (agreementId) => {
    console.log(`Inspecting payment details for agreement ID: ${agreementId}`);
  };

  const renderTabContent = () => {
    if (loading) {
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
      </Box>;
    }

    if (currentTab === 0) {
      const activeAgreements = agreements.filter(
        (agreement) =>
          agreement.status === "accepted" || agreement.status === "pending"
      );

      const historicalAgreements = agreements.filter(
        (agreement) => agreement.status === "history"
      );

      return (
        <>
          <Grid
            container
            spacing={4}
            justifyContent="center"
            alignItems="flex-start"
          >
            {/* Active Agreements Section */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h5"
                sx={{
                  textAlign: "center",
                  marginBottom: "20px",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                Active
              </Typography>
              <Grid container spacing={3} justifyContent={"center"}>
                {activeAgreements.length > 0 ? (
                  activeAgreements.map((agreement) => (
                    <Grid item xs={12} sm={6} md={8} key={agreement.id}>
                      <ApplicationCard
                        onClick={() =>
                          navigate(`/agreement/${agreement.id}`, {
                            state: { from: "my-dashboard" },
                          })
                        }
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        <CardContent>
                          <CardHeader>
                            <Box display="flex" alignItems="center">
                              {agreement.otherUser && (
                                <>
                                  <Avatar
                                    src={agreement.otherUser.photo || ""}
                                    alt={`${agreement.otherUser.firstName} ${agreement.otherUser.lastName}`}
                                    style={{
                                      marginBottom: "10px",
                                      marginRight: "6px",
                                      width: "65px",
                                      height: "65px",
                                    }}
                                  />
                                  <Typography
                                    variant="h6"
                                    fontWeight={600}
                                    fontFamily="Poppins, sans-serif"
                                  >
                                    {`${agreement.otherUser.firstName} ${agreement.otherUser.lastName}`}
                                  </Typography>
                                </>
                              )}
                            </Box>
                            <StatusChip status={agreement.status}>
                              {agreement.status.charAt(0).toUpperCase() +
                                agreement.status.slice(1)}
                            </StatusChip>
                          </CardHeader>
                          <Typography
                            variant="body1"
                            marginLeft="20px"
                            marginTop="10px"
                            fontFamily="Poppins, sans-serif"
                          >
                            <strong>Area:</strong> {agreement.area}
                          </Typography>
                          <Typography
                            variant="body1"
                            marginLeft="20px"
                            marginTop="10px"
                            fontFamily="Poppins, sans-serif"
                          >
                            <strong>Babysitting Place:</strong>{" "}
                            {agreement.babysittingPlace}
                          </Typography>
                          <CompactWeeklySchedule
                            availability={agreement.weeklySchedule}
                          />
                          <ProgressContainer>
                            {agreement.status === "accepted" && (
                              <Box display="flex" alignItems="center">
                                <CircularProgress
                                  variant="determinate"
                                  value={calculateProgress(
                                    agreement.startingDate,
                                    agreement.endingDate
                                  )}
                                  size={40}
                                  thickness={4}
                                />
                                <Typography
                                  variant="body1"
                                  style={{
                                    marginLeft: "16px",
                                    fontFamily: "Poppins, sans-serif",
                                  }}
                                >
                                  {Math.round(
                                    calculateProgress(
                                      agreement.startingDate,
                                      agreement.endingDate
                                    )
                                  )}
                                  % Complete
                                </Typography>
                              </Box>
                            )}
                          </ProgressContainer>
                        </CardContent>
                      </ApplicationCard>
                    </Grid>
                  ))
                ) : (
                  <Grid
                    container
                    justifyContent="center"
                    sx={{ marginTop: "16px" }}
                  >
                    <Grid item xs={12} sm={6} md={8}>
                      <ApplicationCard
                        onClick={() => {
                          const roleSpecificPath = isBabysitter
                            ? "/babysitting-jobs"
                            : "/babysitters";
                          navigate(roleSpecificPath);
                        }}
                        style={{
                          cursor: "pointer",
                          border: "2px dashed #9E9E9E",
                          textAlign: "center",
                          padding: "20px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <AddCircleOutlineIcon
                          style={{ fontSize: 50, color: "#9E9E9E" }}
                        />
                        <Typography
                          variant="body1"
                          color="textSecondary"
                          fontFamily="Poppins, sans-serif"
                        >
                          Browse {isBabysitter ? "Guardians" : "Babysitters"}
                        </Typography>
                      </ApplicationCard>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>

            {/* History Agreements Section */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h5"
                sx={{
                  textAlign: "center",
                  marginBottom: "20px",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                History
              </Typography>
              <Grid container spacing={3} justifyContent={"center"}>
                {historicalAgreements.length > 0 ? (
                  historicalAgreements.map((agreement) => (
                    <Grid item xs={12} sm={6} md={8} key={agreement.id}>
                      <ApplicationCard
                        onClick={() => navigate(`/agreement/${agreement.id}`)}
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        <CardContent>
                          <CardHeader>
                            <Box display="flex" alignItems="center">
                              {agreement.otherUser && (
                                <>
                                  <Avatar
                                    src={agreement.otherUser.photo || ""}
                                    alt={`${agreement.otherUser.firstName} ${agreement.otherUser.lastName}`}
                                    style={{
                                      marginBottom: "10px",
                                      marginRight: "6px",
                                      width: "65px",
                                      height: "65px",
                                    }}
                                  />
                                  <Typography variant="h6" fontWeight={600}>
                                    {`${agreement.otherUser.firstName} ${agreement.otherUser.lastName}`}
                                  </Typography>
                                </>
                              )}
                            </Box>
                            <StatusChip status="history">History</StatusChip>
                          </CardHeader>
                          <Typography
                            variant="body1"
                            marginLeft="20px"
                            marginTop="10px"
                            fontFamily="Poppins, sans-serif"
                          >
                            <strong>Area:</strong> {agreement.area}
                          </Typography>
                          <Typography
                            variant="body1"
                            marginLeft="20px"
                            marginTop="10px"
                            fontFamily="Poppins, sans-serif"
                          >
                            <strong>Babysitting Place:</strong>{" "}
                            {agreement.babysittingPlace}
                          </Typography>
                          <CompactWeeklySchedule
                            availability={agreement.weeklySchedule}
                          />
                          <ProgressContainer>
                            {agreement.status === "history" && (
                              <Box display="flex" alignItems="center">
                                <CircularProgress
                                  variant="determinate"
                                  value={calculateProgress(
                                    agreement.startingDate,
                                    agreement.endingDate
                                  )}
                                  size={40}
                                  thickness={4}
                                />
                                <Typography
                                  variant="body1"
                                  style={{
                                    marginLeft: "16px",
                                    fontFamily: "Poppins, sans-serif",
                                  }}
                                >
                                  {Math.round(
                                    calculateProgress(
                                      agreement.startingDate,
                                      agreement.endingDate
                                    )
                                  )}
                                  % Complete
                                </Typography>
                              </Box>
                            )}
                          </ProgressContainer>
                        </CardContent>
                      </ApplicationCard>
                    </Grid>
                  ))
                ) : (
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{
                      textAlign: "center",
                      marginTop: "20px",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    No history found.
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Grid>
        </>
      );
    } else if (currentTab === 1) {
      const submittedApplication = applications.find(
        (application) => application.status === "submitted"
      );

      const temporaryApplications = applications.filter(
        (application) => application.status === "temporary"
      );

      const historicalApplications = applications.filter(
        (application) => application.status === "history"
      );

      return (
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="flex-start"
        >
          {/* Active Section */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              sx={{
                textAlign: "center",
                marginBottom: "20px",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Active
            </Typography>
            <Grid container spacing={3} justifyContent={"center"}>
              {submittedApplication ? (
                <Grid item xs={12}>
                  <ApplicationCard
                    onClick={() =>
                      navigate(`/application/${submittedApplication.id}`)
                    }
                    style={{
                      cursor: "pointer",
                      height: "320px",
                    }}
                  >
                    <CardContent>
                      <CardHeader>
                        <Typography variant="h6" fontWeight={600}>
                          {submittedApplication.area}
                        </Typography>
                        <StatusChip status="active">Active</StatusChip>
                      </CardHeader>
                      <Typography
                        variant="body1"
                        marginLeft="20px"
                        marginTop="10px"
                        fontFamily="Poppins, sans-serif"
                      >
                        <strong>Job Type:</strong>{" "}
                        {submittedApplication.jobType}
                      </Typography>
                      <Typography
                        variant="body1"
                        marginLeft="20px"
                        marginTop="10px"
                        fontFamily="Poppins, sans-serif"
                      >
                        <strong>Babysitting Place:</strong>{" "}
                        {Array.isArray(submittedApplication.babysittingPlace)
                          ? submittedApplication.babysittingPlace.join(", ")
                          : submittedApplication.babysittingPlace}
                      </Typography>
                      <CompactWeeklySchedule
                        availability={submittedApplication.availability}
                      />
                    </CardContent>
                  </ApplicationCard>
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <ApplicationCard
                    onClick={() => {
                      const hasActiveApplication = applications.some(
                        (app) =>
                          app.status === "temporary" ||
                          app.status === "submitted"
                      );

                      if (!hasActiveApplication) {
                        navigate("/babysitting-application");
                      } else {
                        setAlert({
                          open: true,
                          message:
                            "You already have an active/temporary application.",
                          severity: "warning",
                        });
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      border: "2px dashed #9E9E9E",
                      textAlign: "center",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <AddCircleOutlineIcon
                      style={{ fontSize: 50, color: "#9E9E9E" }}
                    />
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      fontFamily="Poppins, sans-serif"
                    >
                      Create Application
                    </Typography>
                  </ApplicationCard>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Temporary Section */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              sx={{
                textAlign: "center",
                marginBottom: "20px",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Temporary
            </Typography>
            <Grid container spacing={3} justifyContent={"center"}>
              {temporaryApplications.length > 0 ? (
                temporaryApplications.map((application) => (
                  <Grid item xs={12} key={application.id}>
                    <ApplicationCard
                      onClick={() => navigate(`/application/${application.id}`)}
                      style={{
                        cursor: "pointer",
                        height: "320px",
                      }}
                    >
                      <CardContent>
                        <CardHeader>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            fontFamily="Poppins, sans-serif"
                          >
                            {application.area}
                          </Typography>
                          <StatusChip status="temporary">Temporary</StatusChip>
                        </CardHeader>
                        <Typography
                          variant="body1"
                          marginLeft="20px"
                          marginTop="10px"
                          fontFamily="Poppins, sans-serif"
                        >
                          <strong>Job Type:</strong> {application.jobType}
                        </Typography>
                        <Typography
                          variant="body1"
                          marginLeft="20px"
                          marginTop="10px"
                          fontFamily="Poppins, sans-serif"
                        >
                          <strong>Babysitting Place:</strong>{" "}
                          {Array.isArray(application.babysittingPlace)
                            ? application.babysittingPlace.join(", ")
                            : application.babysittingPlace}
                        </Typography>
                        <CompactWeeklySchedule
                          availability={application.availability}
                        />
                      </CardContent>
                    </ApplicationCard>
                  </Grid>
                ))
              ) : (
                <Typography
                  variant="body1"
                  color="textSecondary"
                  fontFamily="Poppins, sans-serif"
                  sx={{ textAlign: "center", marginTop: "20px" }}
                >
                  No temporary applications found.
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* History Section */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              sx={{
                textAlign: "center",
                marginBottom: "20px",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              History
            </Typography>
            <Grid container spacing={3} justifyContent={"center"}>
              {historicalApplications.length > 0 ? (
                historicalApplications.map((application) => (
                  <Grid item xs={12} key={application.id}>
                    <ApplicationCard
                      onClick={() => navigate(`/application/${application.id}`)}
                      style={{
                        cursor: "pointer",
                        height: "320px",
                      }}
                    >
                      <CardContent>
                        <CardHeader>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            fontFamily="Poppins, sans-serif"
                          >
                            {application.area}
                          </Typography>
                          <StatusChip status="history">History</StatusChip>
                        </CardHeader>
                        <Typography
                          variant="body1"
                          marginLeft="20px"
                          marginTop="10px"
                          fontFamily="Poppins, sans-serif"
                        >
                          <strong>Job Type:</strong> {application.jobType}
                        </Typography>
                        <Typography
                          variant="body1"
                          marginLeft="20px"
                          marginTop="10px"
                          fontFamily="Poppins, sans-serif"
                        >
                          <strong>Babysitting Place:</strong>{" "}
                          {Array.isArray(application.babysittingPlace)
                            ? application.babysittingPlace.join(", ")
                            : application.babysittingPlace}
                        </Typography>
                        <CompactWeeklySchedule
                          availability={application.availability}
                        />
                      </CardContent>
                    </ApplicationCard>
                  </Grid>
                ))
              ) : (
                <Typography
                  variant="body1"
                  color="textSecondary"
                  fontFamily="Poppins, sans-serif"
                  sx={{ textAlign: "center", marginTop: "20px" }}
                >
                  No history found.
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
      );
    } else if (currentTab === 2) {
      const sortedAgreements = agreements.sort((a, b) => {
        const dateA = new Date(a.lastPaymentDate || a.startingDate);
        const dateB = new Date(b.lastPaymentDate || b.startingDate);
        return dateB - dateA;
      });

      const paymentsByAgreement = sortedAgreements.reduce((acc, agreement) => {
        const {
          startingDate,
          lastPaymentDate,
          amount,
          otherUser,
          paymentStatus,
        } = agreement;

        if (paymentStatus === "unknown") {
          return acc;
        }

        if (startingDate && lastPaymentDate && amount) {
          const startDate = new Date(startingDate);
          const lastDate = new Date(lastPaymentDate);
          const currentDate = new Date();

          const monthsPassed =
            (currentDate.getFullYear() - lastDate.getFullYear()) * 12 +
            (currentDate.getMonth() - lastDate.getMonth());

          const lastFullMonthDate = new Date(lastDate);
          if (monthsPassed >= 1) {
            lastFullMonthDate.setMonth(lastDate.getMonth() + monthsPassed - 1);
          }

          let current = new Date(startDate);

          while (current <= currentDate) {
            const monthYear = `${current.toLocaleString("default", {
              month: "long",
            })} ${current.getFullYear()}`;

            if (!acc[agreement.id]) {
              acc[agreement.id] = {
                payments: [],
                otherUser,
                paymentStatus,
              };
            }

            let isLastMonth = false;

            if (paymentStatus === "pending babysitter") {
              const lastMonthBeforeDate = new Date(lastDate);
              if (
                new Date() < new Date(agreement.endingDate) &&
                agreement.paymentStatus !== "completed"
              ) {
                lastMonthBeforeDate.setMonth(lastDate.getMonth() - 1);
              }

              isLastMonth =
                current.getFullYear() === lastMonthBeforeDate.getFullYear() &&
                current.getMonth() === lastMonthBeforeDate.getMonth();
            } else if (
              (paymentStatus === "not available yet" ||
                paymentStatus === "pending guardian") &&
              new Date(agreement.endingDate) > currentDate &&
              agreement.paymentStatus !== "completed"
            ) {
              const previousMonthDate = new Date(currentDate);

              if (
                currentDate.getDate() < lastDate.getDate() ||
                paymentStatus === "pending guardian"
              ) {
                previousMonthDate.setMonth(currentDate.getMonth() - 1);
              }

              const monthsPassed =
                (currentDate.getFullYear() - lastDate.getFullYear()) * 12 +
                (currentDate.getMonth() - lastDate.getMonth());

              if (monthsPassed >= 2) {
                previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
              }

              isLastMonth =
                current.getFullYear() === previousMonthDate.getFullYear() &&
                current.getMonth() === previousMonthDate.getMonth();

              console.log(current.getMonth(), isLastMonth);
            } else if (agreement.paymentStatus !== "completed") {
              if (agreement.status !== "history") {
                const adjustedDate = new Date(current);

                if (current.getDate() < lastFullMonthDate.getDate()) {
                  adjustedDate.setMonth(current.getMonth() - 1);
                }

                isLastMonth =
                  adjustedDate.getFullYear() ===
                    lastFullMonthDate.getFullYear() &&
                  adjustedDate.getMonth() === lastFullMonthDate.getMonth();
              } else {
                isLastMonth = null;
              }
            }

            if (
              new Date(agreement.endingDate) <= currentDate &&
              (paymentStatus === "pending guardian" ||
                paymentStatus === "pending babysitter")
            ) {
              const endingDate = new Date(agreement.endingDate);
              endingDate.setMonth(endingDate.getMonth() - 1);

              isLastMonth =
                current.getFullYear() === endingDate.getFullYear() &&
                current.getMonth() === endingDate.getMonth();
            }

            acc[agreement.id].payments.push({
              monthYear,
              amount: parseFloat(amount),
              isLastMonth,
            });
            if (isLastMonth) {
              break;
            }
            const oneMonthBeforeEndingDate = new Date(agreement.endingDate);
            oneMonthBeforeEndingDate.setMonth(
              oneMonthBeforeEndingDate.getMonth() - 1
            );
            if (
              current.getFullYear() ===
                oneMonthBeforeEndingDate.getFullYear() &&
              current.getMonth() === oneMonthBeforeEndingDate.getMonth()
            ) {
              break;
            }

            current.setMonth(current.getMonth() + 1);
          }

          if (acc[agreement.id] && acc[agreement.id].payments) {
            acc[agreement.id].payments.reverse();
          }
        }

        return acc;
      }, {});

      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              marginBottom: "24px",
              textAlign: "center",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Payment Details
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              width: "100%",
              maxWidth: "700px",
            }}
          >
            {Object.entries(paymentsByAgreement).length > 0 ? (
              Object.entries(paymentsByAgreement).map(
                ([agreementId, { payments, otherUser, paymentStatus }]) => (
                  <Card
                    key={agreementId}
                    sx={{
                      padding: "20px",
                      borderRadius: "16px",
                      boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "20px",
                        gap: "16px",
                      }}
                    >
                      <Avatar
                        onClick={() => handleProfile(otherUser?.userId)}
                        src={otherUser?.photo || ""}
                        alt={`${otherUser?.firstName} ${otherUser?.lastName}`}
                        sx={{
                          width: 64,
                          height: 64,
                          "&:hover": {
                            cursor: "pointer",
                          },
                        }}
                      />
                      <Box>
                        <Typography
                          variant="h6"
                          onClick={() => handleProfile(otherUser?.userId)}
                          sx={{
                            fontWeight: "bold",
                            fontFamily: "'Poppins', sans-serif",
                            "&:hover": {
                              cursor: "pointer",
                            },
                          }}
                        >
                          {otherUser?.firstName} {otherUser?.lastName}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#757575",
                            marginTop: "4px",
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          Agreement ID: {agreementId}
                        </Typography>
                      </Box>
                    </Box>
                    {payments.map((payment, index) => (
                      <Box
                        key={index}
                        sx={{
                          marginBottom: "16px",
                          padding: "16px",
                          borderRadius: "12px",
                          backgroundColor: payment.isLastMonth
                            ? "#f5f5fc"
                            : "#fafafa",
                          border: payment.isLastMonth
                            ? "1px solid #5e62d1"
                            : "1px solid #e0e0e0",
                          boxShadow: payment.isLastMonth
                            ? "0 4px 12px rgba(94, 98, 209, 0.2)"
                            : "none",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "bold",
                              color: payment.isLastMonth ? "#5e62d1" : "#555",
                              fontFamily: "Poppins, sans-serif",
                            }}
                          >
                            {payment.monthYear}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#757575",
                              marginTop: "4px",
                              fontFamily: "Poppins, sans-serif",
                            }}
                          >
                            Payment: {payment.amount.toFixed(2)}€
                          </Typography>
                        </Box>
                        {payment.isLastMonth && (
                          <>
                            {paymentStatus === "pending guardian" &&
                            isBabysitter ? (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#3c3fad",
                                  fontWeight: "bold",
                                  fontFamily: "Poppins, sans-serif",
                                }}
                              >
                                Pending guardian's action
                              </Typography>
                            ) : paymentStatus === "not available yet" ? (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#3c3fad",
                                  fontWeight: "bold",
                                  fontFamily: "Poppins, sans-serif",
                                }}
                              >
                                Babysitting in progress
                              </Typography>
                            ) : paymentStatus === "pending babysitter" &&
                              !isBabysitter ? (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#3c3fad",
                                  fontWeight: "bold",
                                  fontFamily: "Poppins, sans-serif",
                                }}
                              >
                                Payment voucher sent
                              </Typography>
                            ) : (
                              <Button
                                variant="contained"
                                sx={{
                                  padding: "8px 20px",
                                  fontFamily: "'Poppins', sans-serif",
                                  fontSize: "1rem",
                                  textTransform: "none",
                                  borderRadius: "30px",
                                  backgroundColor: "#5e62d1",
                                  "&:hover": {
                                    backgroundColor: "#4a4fbf",
                                  },
                                }}
                                onClick={() =>
                                  navigate(`/payment/${agreementId}`)
                                }
                              >
                                {paymentStatus === "pending babysitter" &&
                                isBabysitter
                                  ? `Accept for ${payment.monthYear}`
                                  : `Pay €${payment.amount.toFixed(2)}`}
                              </Button>
                            )}
                          </>
                        )}
                      </Box>
                    ))}
                  </Card>
                )
              )
            ) : (
              <Typography
                variant="body1"
                sx={{
                  textAlign: "center",
                  color: "#5e62d1",
                  opacity: 0.85,
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                No payment data available for the selected agreements.
              </Typography>
            )}
          </Box>
        </Box>
      );
    }
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
      <Container>
        <CustomSeparator />

        <TabContainer>
          <TabContainer>
            <StyledTabs
              value={currentTab}
              onChange={handleTabChange}
              TabIndicatorProps={{
                style: {
                  backgroundColor: "#5e62d1",
                },
              }}
              sx={{
                "& .MuiTab-root": {
                  color: "grey",
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "1.4rem",
                  fontWeight: "100",
                  textTransform: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                },
                "& .Mui-selected": {
                  color: "#5e62d1 !important",
                },
                "& .MuiTab-wrapper": {
                  flexDirection: "row",
                },
              }}
            >
              <StyledTab label="Agreements" icon={<WorkOutlineIcon />} />
              <StyledTab label="Applications" icon={<DoneIcon />} />
              <StyledTab label="Payments" icon={<PaymentsIcon />} />
            </StyledTabs>
          </TabContainer>
        </TabContainer>

        {renderTabContent()}
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
      </Container>
    );
  }
};

export default MyDashboard;
