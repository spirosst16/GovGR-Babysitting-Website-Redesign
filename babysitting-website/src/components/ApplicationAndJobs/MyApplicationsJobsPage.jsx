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
} from "@mui/material";
import { styled } from "@mui/system";
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
  alignItems: "flex-start",
});

const Header = styled(Box)({
  width: "100%",
  margin: "0 auto",
  textAlign: "center",
  marginBottom: "20px",
});

const TabContainer = styled(Box)({
  margin: "20px 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  paddingLeft: "10%",
});

const ApplicationCard = styled(Card)({
  margin: "15px",
  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
  borderRadius: "10px",
  transition: "transform 0.2s, box-shadow 0.2s",
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
  justifyContent: "space-between",
  margin: "10px 0",
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

const MyApplicationsJobs = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [agreements, setAgreements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

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
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const agreementsRef = query(
          collection(FIREBASE_DB, "agreements"),
          where("senderId", "==", userId)
        );
        const applicationsRef = query(
          collection(FIREBASE_DB, "babysittingApplications"),
          where("userId", "==", userId)
        );

        const [agreementsSnap, applicationsSnap] = await Promise.all([
          getDocs(agreementsRef),
          getDocs(applicationsRef),
        ]);

        const fetchedAgreements = await Promise.all(
          agreementsSnap.docs.map(async (doc) => {
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
        <Grid container spacing={3}>
          {agreements.length > 0 ? (
            agreements.map((agreement) => (
              <Grid item xs={12} sm={6} md={4} key={agreement.id}>
                <ApplicationCard>
                  <CardContent>
                    <CardHeader>
                      <Box display="flex" alignItems="center">
                        {agreement.otherUser && (
                          <>
                            <Avatar
                              src={agreement.otherUser.photo || ""}
                              alt={`${agreement.otherUser.firstName} ${agreement.otherUser.lastName}`}
                              style={{
                                marginRight: "10px",
                                marginBottom: "10px",
                              }}
                            />
                            <Typography variant="h6">
                              {`${agreement.otherUser.firstName} ${agreement.otherUser.lastName}`}
                            </Typography>
                          </>
                        )}
                      </Box>
                      <StatusChip status={agreement.status}>
                        {agreement.status}
                      </StatusChip>
                    </CardHeader>
                    <Typography variant="body2">
                      <strong>Babysitting Place:</strong>{" "}
                      {agreement.babysittingPlace.join(", ")}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Weekly Schedule:</strong>{" "}
                      {agreement.weeklySchedule.join(", ")}
                    </Typography>
                  </CardContent>
                </ApplicationCard>
              </Grid>
            ))
          ) : (
            <EmptyState>
              <WorkOutlineIcon style={{ fontSize: 50, color: "#9E9E9E" }} />
              <Typography variant="body1" color="textSecondary">
                No active agreements found.
              </Typography>
            </EmptyState>
          )}
        </Grid>
      );
    } else if (currentTab === 1) {
      return (
        <Grid container spacing={3}>
          {applications.length > 0 ? (
            applications.map((application) => (
              <Grid item xs={12} sm={6} md={4} key={application.id}>
                <ApplicationCard>
                  <CardContent>
                    <CardHeader>
                      <Typography variant="h6">{application.area}</Typography>
                      <StatusChip status={application.status}>
                        {application.status}
                      </StatusChip>
                    </CardHeader>
                    <Typography variant="body2">
                      <strong>Job Type:</strong> {application.jobType}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Availability:</strong>{" "}
                      {application.availability.join(", ")}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Babysitting Place:</strong>{" "}
                      {application.babysittingPlace.join(", ")}
                    </Typography>
                  </CardContent>
                </ApplicationCard>
              </Grid>
            ))
          ) : (
            <EmptyState>
              <DoneIcon style={{ fontSize: 50, color: "#9E9E9E" }} />
              <Typography variant="body1" color="textSecondary">
                No applications found.
              </Typography>
            </EmptyState>
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
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Agreements" icon={<WorkOutlineIcon />} />
          <Tab label="Applications" icon={<DoneIcon />} />
          <Tab label="History" icon={<HistoryIcon />} />
        </Tabs>
      </TabContainer>

      {renderTabContent()}
    </Container>
  );
};

export default MyApplicationsJobs;
