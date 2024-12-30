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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import HistoryIcon from "@mui/icons-material/History";
import DoneIcon from "@mui/icons-material/Done";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
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
  height: "350px",
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
    status === "draft"
      ? "#FFC107"
      : status === "active"
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
        if (userRole === "guardian") {
          handleNavigate("/babysitters");
        } else if (userRole === "babysitter") {
          handleNavigate("/babysitting-jobs");
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
      My Applications & Jobs
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
          >
            {timeSlot.charAt(0)}
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

const MyApplicationsJobs = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [agreements, setAgreements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isBabysitter, setIsBabysitter] = useState(false);
  const navigate = useNavigate();

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
      setIsLoading(true);
      try {
        const userData = await fetchUserData(userId);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error fetching current user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUserData();
  }, [userId]);

  const fetchUserData = async (userId) => {
    try {
      let userData = null;

      const babysittersRef = query(
        collection(FIREBASE_DB, "babysitters"),
        where("userId", "==", userId)
      );
      const babysittersSnapshot = await getDocs(babysittersRef);
      if (!babysittersSnapshot.empty) {
        userData = babysittersSnapshot.docs[0].data();
        setIsBabysitter(true);
      } else {
        const guardiansRef = query(
          collection(FIREBASE_DB, "guardians"),
          where("userId", "==", userId)
        );
        const guardiansSnapshot = await getDocs(guardiansRef);
        if (!guardiansSnapshot.empty) {
          userData = guardiansSnapshot.docs[0].data();
          setIsBabysitter(false);
        }
      }

      if (!userData) throw new Error(`User with ID ${userId} not found`);
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setIsLoading(true);
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
            const otherUserId =
              agreement.senderId === userId
                ? agreement.recipientId
                : agreement.senderId;
            const otherUser = await fetchUserData(otherUserId);
            return {
              id: doc.id,
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
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const calculateProgress = (startingDate, endingDate) => {
    const currentDate = new Date();
    const start = new Date(startingDate);
    const end = new Date(endingDate);

    const totalDuration = end - start;
    const elapsedDuration = currentDate - start;

    return Math.min((elapsedDuration / totalDuration) * 100, 100);
  };

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      );
    }

    if (currentTab === 0) {
      return (
        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="center"
          wrap="wrap"
        >
          {agreements.length > 0 ? (
            agreements.map((agreement) => (
              <Grid item xs={12} sm={6} md={4} key={agreement.id}>
                <ApplicationCard
                  onClick={() =>
                    navigate(
                      `/agreement/${agreement.senderId}/${agreement.recipientId}`
                    )
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
                            <Typography variant="h6" fontWeight={600}>
                              {`${agreement.otherUser.firstName} ${agreement.otherUser.lastName}`}
                            </Typography>
                          </>
                        )}
                      </Box>
                      <StatusChip status={agreement.status}>
                        {agreement.status}
                      </StatusChip>
                    </CardHeader>
                    <Typography
                      variant="body1"
                      marginLeft="20px"
                      marginTop="10px"
                    >
                      <strong>Babysitting Place:</strong>{" "}
                      {agreement.babysittingPlace.join(", ")}
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
                            style={{ marginLeft: "16px" }}
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
            <Grid item xs={12} sm={6} md={4}>
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
                <Typography variant="body1" color="textSecondary">
                  Browse {isBabysitter ? "Guardians" : "Babysitters"}
                </Typography>
              </ApplicationCard>
            </Grid>
          )}
        </Grid>
      );
    } else if (currentTab === 1) {
      return (
        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="center"
          wrap="wrap"
        >
          {applications.length > 0 ? (
            applications.map((application) => (
              <Grid item xs={12} sm={6} md={4} key={application.id}>
                <ApplicationCard
                  onClick={() => navigate(`/application/${application.userId}`)}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <CardContent>
                    <CardHeader>
                      <Typography variant="h6" fontWeight={600}>
                        {application.area}
                      </Typography>
                      <StatusChip status={application.status}>
                        {application.status}
                      </StatusChip>
                    </CardHeader>
                    <Typography
                      variant="body1"
                      marginLeft="20px"
                      marginTop="10px"
                    >
                      <strong>Job Type:</strong> {application.jobType}
                    </Typography>
                    <Typography
                      variant="body1"
                      marginLeft="20px"
                      marginTop="10px"
                    >
                      <strong>Babysitting Place:</strong>{" "}
                      {application.babysittingPlace.join(", ")}
                    </Typography>
                    <CompactWeeklySchedule
                      availability={application.availability}
                    />
                  </CardContent>
                </ApplicationCard>
              </Grid>
            ))
          ) : (
            <Grid item xs={12} sm={6} md={4}>
              <ApplicationCard
                onClick={() => navigate("/babysitting-application")}
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
                <Typography variant="body1" color="textSecondary">
                  Create Application
                </Typography>
              </ApplicationCard>
            </Grid>
          )}
        </Grid>
      );
    } else {
      return (
        <EmptyState>
          <HistoryIcon style={{ fontSize: 50, color: "#9E9E9E" }} />
          <Typography variant="body1" color="textSecondary">
            No history available yet.
          </Typography>
        </EmptyState>
      );
    }
  };

  return (
    <Container>
      <CustomSeparator />
      <Header>
        <Typography
          variant="h4"
          style={{ fontFamily: "Poppins, sans-serif", fontWeight: "600" }}
        >
          My Applications & Jobs
        </Typography>
        <Typography
          variant="h6"
          style={{ fontFamily: "Poppins, sans-serif", marginTop: "10px" }}
        >
          Manage your applications and job history seamlessly.
        </Typography>
      </Header>

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
            <StyledTab label="History" icon={<HistoryIcon />} />
          </StyledTabs>
        </TabContainer>
      </TabContainer>

      {renderTabContent()}
    </Container>
  );
};

export default MyApplicationsJobs;
