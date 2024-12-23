import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  Rating,
  TextField,
} from "@mui/material";
import { Link } from "react-router-dom";
import { styled } from "@mui/system";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import BabysitterImage from "../../assets/Babysitter-image.webp";
import { FIREBASE_AUTH } from "../../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "../../style.css";

const HeroSection = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  padding: "120px 20px",
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
  const [babysitters, setBabysitters] = useState([]);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await signOut(FIREBASE_AUTH);
        console.log("User logged out on Welcome Page");
      } catch (error) {
        console.error("Error logging out user on Welcome Page:", error);
      }
    };

    logoutUser();
  }, []);

  useEffect(() => {
    const fetchBabysitters = async () => {
      try {
        const babysittersCollectionRef = collection(FIREBASE_DB, "babysitters");
        const babysitterSnapshot = await getDocs(babysittersCollectionRef);
        const babysittersList = babysitterSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBabysitters(babysittersList);
      } catch (error) {
        console.error("Error fetching babysitters: ", error);
      }
    };

    fetchBabysitters();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (authUser) => {
      if (authUser) {
        setUser(authUser);
        const email = authUser.email;

        // Check if the user is a Babysitter or Guardian
        const checkRole = async () => {
          const babysitterQuery = query(
            collection(FIREBASE_DB, "babysitters"),
            where("email", "==", email)
          );
          const babysitterSnapshot = await getDocs(babysitterQuery);

          if (!babysitterSnapshot.empty) {
            const babysitterData = babysitterSnapshot.docs[0].data();
            setRole("babysitter");
            setFirstName(babysitterData.firstName);
            return;
          }

          const guardianQuery = query(
            collection(FIREBASE_DB, "guardians"),
            where("email", "==", email)
          );
          const guardianSnapshot = await getDocs(guardianQuery);

          if (!guardianSnapshot.empty) {
            const guardianData = guardianSnapshot.docs[0].data();
            setRole("guardian");
            setFirstName(guardianData.firstName);
          }
        };

        checkRole();
      } else {
        setUser(null);
        setRole("");
        setFirstName("");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <HeroSection>
        <Box style={{ maxWidth: "50%" }}>
          <Typography
            variant="h1"
            style={{
              fontFamily: "Poppins, sans-serif",
              marginBottom: "20px",
              fontSize: "3rem",
            }}
          >
            Babysitters
          </Typography>
          <Typography
            variant="h5"
            style={{
              fontFamily: "Poppins, sans-serif",
              marginBottom: "30px",
            }}
          >
            Connecting Families with Trusted Babysitters
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/register"
            style={{
              backgroundColor: "#5e62d1",
              fontFamily: "Poppins, sans-serif",
              fontSize: "1.2rem",
              borderRadius: "30px",
              textTransform: "none",
            }}
          >
            Get started for free
          </Button>
        </Box>
        <Box style={{ maxWidth: "45%" }}>
          <img
            src={BabysitterImage}
            alt="Babysitter"
            style={{ width: "70%", borderRadius: "10px" }}
          />
        </Box>
      </HeroSection>

      {babysitters.length > 0 && (
        <>
          <TitleWrapper>
            <Typography
              variant="h4"
              style={{ fontFamily: "Poppins, sans-serif", color: "#fff" }}
            >
              Browse Babysitters
            </Typography>
          </TitleWrapper>

          <CardWrapper>
            <Box display="flex" justifyContent="center" flexWrap="wrap">
              {babysitters
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 4)
                .map((babysitter) => (
                  <BabysitterCard key={babysitter.id}>
                    <CardContent style={{ textAlign: "center" }}>
                      <Avatar
                        src={babysitter.photo || ""}
                        style={{
                          margin: "10px auto",
                          width: "80px",
                          height: "80px",
                        }}
                      />
                      <Typography
                        variant="h6"
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          color: "#000",
                        }}
                      >
                        {`${babysitter.firstName} ${babysitter.lastName}`}
                      </Typography>
                      <Typography
                        style={{
                          color: "#888",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        {babysitter.city}
                      </Typography>
                      <Rating
                        name={`rating-${babysitter.id}`}
                        value={babysitter.rating}
                        precision={0.5}
                        readOnly
                        size="large"
                      />
                    </CardContent>
                  </BabysitterCard>
                ))}
            </Box>
          </CardWrapper>
        </>
      )}

      <Container style={{ margin: "50px auto" }}>
        <Typography
          variant="h4"
          style={{
            textAlign: "center",
            marginBottom: "30px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
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
                <Typography
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "bold",
                    marginBottom: "5px",
                  }}
                >
                  {step}
                </Typography>
                {index === 0 && (
                  <Typography style={{ fontFamily: "Poppins, sans-serif" }}>
                    Use filters based on your needs and check recommended
                    profiles.
                  </Typography>
                )}
                {index === 1 && (
                  <Typography style={{ fontFamily: "Poppins, sans-serif" }}>
                    Send messages, rate members, and schedule a meet-up.
                  </Typography>
                )}
                {index === 2 && (
                  <Typography style={{ fontFamily: "Poppins, sans-serif" }}>
                    Book childcare, make payments or get paid, and download
                    receipts for your expenses.
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
