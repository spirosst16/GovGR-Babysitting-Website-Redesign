import React, { useState, useEffect } from "react";
import { Box, Typography, Card, Tabs, Tab } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import { styled } from "@mui/system";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import "../../style.css";

const PageWrapper = styled(Box)({
  backgroundColor: "#f4f4f4",
  padding: 0,
  margin: 0,
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
});

function handleClick(event) {
  event.preventDefault();
  console.info("You clicked a breadcrumb.");
}

const ContentWrapper = styled(Box)({
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  paddingBottom: "30px",
});

const TabContainer = styled(Box)({
  margin: "20px 0",
});

const StepCard = styled(Card)({
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  borderRadius: "10px",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
  marginBottom: "30px",
  padding: "20px 40px",
});

const StepNumber = styled(Box)({
  width: "50px",
  height: "50px",
  backgroundColor: "#5e62d1",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: "20px",
  borderRadius: "50%",
  marginRight: "20px",
  flexShrink: 0,
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
      How It Works
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

const HowItWorksPage = () => {
  const [currentTab, setCurrentTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const stepsParent = [
    {
      title: "Create Your Profile",
      description: [
        "Sign up as a parent by filling out your basic information.",
        "Highlight your childcare needs and preferences.",
      ],
    },
    {
      title: "Search and Filter",
      description: [
        "You can browse babysitters using filters like location,",
        "availability, babysitting place, child age group expertise and job type.",
      ],
    },
    {
      title: "Match and Connect",
      description: [
        "Send personalized messages to start a conversation.",
        "Schedule interviews to find the perfect fit for your family.",
      ],
    },
    {
      title: "Book and Confirm",
      description: [
        "Once you're confident, book services directly through the platform.",
      ],
    },
    {
      title: "Secure Payments",
      description: ["Pay securely via our integrated system — no cash needed."],
    },
    {
      title: "Leave Reviews",
      description: [
        "Share your feedback on babysitters and rate them, so other families",
        "will choose more effectively their babysitter.",
      ],
    },
  ];

  const stepsBabysitter = [
    {
      title: "Create Your Profile",
      description: [
        "Sign up as a babysitter by filling out your basic information.",
        "Showcase your experience, certifications, and availability.",
      ],
    },
    {
      title: "Search and Filter",
      description: ["Search for families that align with your expertise."],
    },
    {
      title: "Match and Connect",
      description: [
        "Send personalized messages to start a conversation with the parent of your choice.",
        "Schedule interviews to find the perfect fit for your services.",
      ],
    },
    {
      title: "Book and Confirm",
      description: [
        "Once you're confident, book services directly through",
        "the platform and prepare for your session.",
      ],
    },
    {
      title: "Secure Payments",
      description: [
        "Receive the payment amount and the necessary payment details directly to your account.",
      ],
    },
  ];

  const renderTabContent = () => {
    if (currentTab === 0) {
      return (
        <>
          <PageWrapper>
            <ContentWrapper>
              <Box display="flex" flexDirection="column" alignItems="center">
                {stepsParent.map((step, index) => (
                  <StepCard key={index} style={{ width: "100%" }}>
                    <Box display="flex" alignItems="flex-start">
                      <StepNumber>{index + 1}</StepNumber>
                      <Box>
                        <Typography
                          variant="h6"
                          style={{
                            fontWeight: "bold",
                            marginBottom: "15px",
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          {step.title}
                        </Typography>
                        {step.description.map((detail, i) => (
                          <Typography
                            key={i}
                            style={{
                              fontFamily: "Poppins, sans-serif",
                              color: "#666",
                              marginBottom: "10px",
                            }}
                          >
                            {detail}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  </StepCard>
                ))}
              </Box>
            </ContentWrapper>
          </PageWrapper>
        </>
      );
    } else {
      return (
        <>
          <PageWrapper>
            <ContentWrapper>
              <Box display="flex" flexDirection="column" alignItems="center">
                {stepsBabysitter.map((step, index) => (
                  <StepCard key={index} style={{ width: "100%" }}>
                    <Box display="flex" alignItems="flex-start">
                      <StepNumber>{index + 1}</StepNumber>
                      <Box>
                        <Typography
                          variant="h6"
                          style={{
                            fontWeight: "bold",
                            marginBottom: "15px",
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          {step.title}
                        </Typography>
                        {step.description.map((detail, i) => (
                          <Typography
                            key={i}
                            style={{
                              fontFamily: "Poppins, sans-serif",
                              color: "#666",
                              marginBottom: "10px",
                            }}
                          >
                            {detail}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  </StepCard>
                ))}
              </Box>
            </ContentWrapper>
          </PageWrapper>
        </>
      );
    }
  };

  return (
    <>
      <PageWrapper>
        <ContentWrapper>
          <CustomSeparator />
          <Typography
            variant="h4"
            style={{
              textAlign: "center",
              margin: "100px 0 50px",
              fontFamily: "Poppins, sans-serif",
              fontWeight: "600",
            }}
          >
            How It Works
          </Typography>

          <TabContainer>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              centered
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
                },
                "& .Mui-selected": {
                  color: "#5e62d1 !important",
                },
              }}
            >
              <Tab label="Guardians" />
              <Tab label="Babysitters" />
            </Tabs>
          </TabContainer>

          {renderTabContent()}
        </ContentWrapper>
      </PageWrapper>
    </>
  );
};

export default HowItWorksPage;
