import React from "react";
import { Container, Typography, Box, Card, CardContent, Avatar, Button } from "@mui/material";
import { styled } from "@mui/system";

const HeroSection = styled(Box)({
  textAlign: "center",
  padding: "200px 20px",
  backgroundColor: "#f4f4f4",
  margin: 0,
});

const BabysitterCard = styled(Card)({
  width: "300px",
  margin: "10px",
});

const CardWrapper = styled(Box)({
  backgroundColor: "#5e62d1",
  padding: "20px",
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  marginTop: 0,
});

const TitleWrapper = styled(Box)({
  textAlign: "center",
  marginBottom: "0",
  marginTop: "0",
  backgroundColor: "#5e62d1",
  padding: "20px",
});

const WelcomePage = () => {
  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            overflow-x: hidden;
            margin: 0;
            padding: 0;
            font-family: "Poppins, sans-serif";
          }
        `}
      </style>

      {/* Hero Section */}
      <HeroSection>
        <Typography 
          variant="h1"
          style={{ fontFamily: "Poppins, sans-serif", marginBottom: "20px", fontSize: "3rem" }}
        >
          Babysitters
        </Typography>
        <Typography variant="h5" style={{ fontFamily: "Poppins, sans-serif", marginBottom: "30px" }}>
          Connecting Families with Trusted Babysitters
        </Typography>
        <Button variant="contained" style={{ backgroundColor: "#5e62d1", fontFamily: "Poppins, sans-serif" }}>
          Get started for free
        </Button>
      </HeroSection>

      {/* Title Section Above Cards */}
      <TitleWrapper>
        <Typography 
          variant="h4" 
          style={{ fontFamily: "Poppins, sans-serif", color: "#fff" }}
        >
          Browse Babysitters
        </Typography>
      </TitleWrapper>

      {/* Browse Babysitters - CardWrapper */}
      <CardWrapper>
        <Box display="flex" justifyContent="center" flexWrap="wrap">
          {["Dora Panteli", "Eleni Papadaki", "Tzeni Georgiou"].map((name, index) => (
            <BabysitterCard key={index}>
              <CardContent style={{ textAlign: "center" }}>
                <Avatar style={{ margin: "10px auto", width: "80px", height: "80px" }} />
                <Typography variant="h6" style={{ fontFamily: "Poppins, sans-serif", color: "#000" }}>
                  {name}
                </Typography>
                <Typography style={{ color: "#888", fontFamily: "Poppins, sans-serif" }}>
                  20A
                </Typography>
              </CardContent>
            </BabysitterCard>
          ))}
        </Box>
      </CardWrapper>

      {/* Steps Section */}
      <Container style={{ margin: "50px auto" }}>
        <Typography variant="h4" style={{ textAlign: "center", marginBottom: "30px", fontFamily: "Poppins, sans-serif" }}>
          Find Babysitters or jobs, fast and easy!
        </Typography>
        <Box display="flex" flexDirection="column" alignItems="center">
          {["Search", "Contact", "Childcare Services"].map((step, index) => (
            <Box
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                textAlign: "left",
                margin: "20px 0",
                maxWidth: "600px",
                width: "100%",
                position: "relative",
                paddingLeft: "70px",
              }}
            >
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "50px",
                  height: "50px",
                  backgroundColor: "#5e62d1",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "50%",
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "24px",
                  position: "absolute",
                  left: "0",
                }}
              >
                {index + 1}
              </Box>
              <Box>
                <Typography style={{ fontFamily: "Poppins, sans-serif", fontWeight: "bold", marginBottom: "5px" }}>
                  {step}
                </Typography>
                {index === 0 && (
                  <Typography style={{ fontFamily: "Poppins, sans-serif" }}>
                    Use filters based on your needs and check recommended profiles.
                  </Typography>
                )}
                {index === 1 && (
                  <Typography style={{ fontFamily: "Poppins, sans-serif" }}>
                    Send messages, rate members, and schedule a meet-up.
                  </Typography>
                )}
                {index === 2 && (
                  <Typography style={{ fontFamily: "Poppins, sans-serif" }}>
                    Book childcare, make payments or get paid, and download receipts for your expenses.
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </>
  );
};

export default WelcomePage;
