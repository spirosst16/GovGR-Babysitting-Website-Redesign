import React from "react";
import { Box, Typography, Card } from "@mui/material";
import { styled } from "@mui/system";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import '../../style.css';

const PageWrapper = styled(Box)({
  backgroundColor: "#f4f4f4",
  padding: 0,
  margin: 0,
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
});

const ContentWrapper = styled(Box)({
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  paddingBottom: "30px",
});

const StepCard = styled(Card)({
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  borderRadius: "10px",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
  marginBottom: "30px",
  padding: "20px",
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

const HowItWorksPage = () => {
  const steps = [
    {
      title: "Create Your Profile",
      description: [
        "Sign up as a parent or babysitter by filling out your basic information.",
        "Parents: Highlight your childcare needs and preferences.",
        "Babysitters: Showcase your experience, certifications, and availability.",
      ],
    },
    {
      title: "Search and Filter",
      description: [
        "Parents can browse babysitters using filters like location, availability, ratings, and skills.",
        "Babysitters can search for families that align with their expertise.",
      ],
    },
    {
      title: "Match and Connect",
      description: [
        "Send personalized messages to start a conversation.",
        "Schedule interviews to find the perfect fit for your family or services.",
      ],
    },
    {
      title: "Book and Confirm",
      description: [
        "Once you're confident, book services directly through the platform.",
        "Babysitters: Confirm the booking and prepare for your session.",
      ],
    },
    {
      title: "Secure Payments",
      description: [
        "Parents: Pay securely via our integrated system—no cash needed.",
        "Babysitters: Receive payments directly to your account.",
      ],
    },
    {
      title: "Leave Reviews",
      description: [
        "Parents: Share your feedback on babysitters to help other families.",
        "Babysitters: Review your experience with the family to build trust in the community.",
      ],
    },
  ];

  return (
    <>
      <Navbar />

      <PageWrapper>
        <ContentWrapper>
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

          <Box display="flex" flexDirection="column" alignItems="center">
            {steps.map((step, index) => (
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

        <Footer />
      </PageWrapper>
    </>
  );
};

export default HowItWorksPage;
