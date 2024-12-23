import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
} from "@mui/material";
import { styled } from "@mui/system";
import { useParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FIREBASE_DB } from "../../config/firebase";
import DefaultUserImage from "../../assets/Babysitter-image.webp";

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
  padding: "10px 20px",
  borderRadius: "25px",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#4a54c1",
  },
});

const AgreementPage = () => {
  const { userId1, userId2 } = useParams(); // Extract sender and recipient user IDs
  const [sender, setSender] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [status, setStatus] = useState("");

  // Fetch current authenticated user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Current authenticated user: ", user);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch sender and recipient details
  useEffect(() => {
    const fetchUserData = async (userId, setUser) => {
      try {
        let userData = null;

        // Check in babysitters collection
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
        } else {
          // Check in guardians collection
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
          }
        }

        if (!userData) throw new Error(`User with ID ${userId} not found`);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData(userId1, setSender);
    fetchUserData(userId2, setRecipient);
  }, [userId1, userId2]);

  const handleSend = () => {
    console.log("Agreement sent.");
    setStatus("pending");
  };

  const handleAccept = () => {
    console.log("Agreement accepted.");
    setStatus("accepted");
  };

  const renderButton = () => {
    if (status === "") {
      return <StyledButton onClick={handleSend}>Send</StyledButton>;
    }
    if (status === "pending") {
      return <StyledButton onClick={handleAccept}>Accept</StyledButton>;
    }
    return null;
  };

  return (
    <PageContainer>
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
              sx={{ width: 80, height: 80 }}
            />
            <Typography
              variant="h6"
              sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: "bold" }}
            >
              {sender?.firstName} {sender?.lastName}
            </Typography>
          </AvatarSection>
          <AvatarSection>
            <Avatar
              src={recipient?.photo || DefaultUserImage}
              sx={{ width: 80, height: 80 }}
            />
            <Typography
              variant="h6"
              sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: "bold" }}
            >
              {recipient?.firstName} {recipient?.lastName}
            </Typography>
          </AvatarSection>
        </UserSection>

        <DetailsSection>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: "bold",
            }}
          >
            Agreement Details
          </Typography>
          <TextField
            fullWidth
            label="Area"
            variant="outlined"
            sx={{ fontFamily: "'Poppins', sans-serif" }}
          />
          <TextField
            fullWidth
            label="Weekly Schedule"
            variant="outlined"
            sx={{ fontFamily: "'Poppins', sans-serif" }}
          />
          <TextField
            fullWidth
            label="Babysitting Place"
            variant="outlined"
            sx={{ fontFamily: "'Poppins', sans-serif" }}
          />
          <TextField
            fullWidth
            label="Starting Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            sx={{ fontFamily: "'Poppins', sans-serif" }}
          />
          <TextField
            fullWidth
            label="Ending Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            sx={{ fontFamily: "'Poppins', sans-serif" }}
          />
        </DetailsSection>

        <Box sx={{ textAlign: "center", marginTop: "20px" }}>
          {renderButton()}
        </Box>
      </ContentWrapper>
    </PageContainer>
  );
};

export default AgreementPage;
