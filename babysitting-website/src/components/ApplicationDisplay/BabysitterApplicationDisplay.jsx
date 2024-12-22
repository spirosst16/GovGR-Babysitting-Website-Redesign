import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Rating,
  Grid,
  Avatar,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { styled } from "@mui/system";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import BabysitterImage from "../../assets/Babysitter-image.webp";

// Styled components for the page
const PageContainer = styled(Box)({
  backgroundColor: "#f4f4f4",
  minHeight: "100vh",
  padding: "40px 20px",
  fontFamily: "'Poppins', sans-serif",
});

const ContentWrapper = styled(Container)({
  maxWidth: "1200px",
  margin: "0 auto",
  paddingTop: "40px",
});

const InfoSection = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  marginBottom: "40px",
});

const ProfileSection = styled(Box)({
  width: "100%",
  maxWidth: "350px",
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "10px",
  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
  textAlign: "center",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

const ApplicationSection = styled(Box)({
  flex: 1,
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "10px",
  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
});

const ScheduleGrid = styled(Box)({
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "20px",
  marginTop: "30px",
});

const ScheduleItem = styled(Box)(({ available }) => ({
  padding: "12px",
  backgroundColor: available ? "#5e62d1" : "#f4f4f4",
  color: available ? "#fff" : "#888",
  textAlign: "center",
  borderRadius: "8px",
  transition: "background-color 0.3s ease",
  "&:hover": {
    backgroundColor: available ? "#4a54c1" : "#e0e0e0",
  },
}));

const BabysitterApplicationDisplay = () => {
  const { userId } = useParams();
  const [babysitter, setBabysitter] = useState(null);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    const fetchBabysitterAndApplication = async () => {
      try {
        // Fetch the babysitter data
        const babysitterRef = query(
          collection(FIREBASE_DB, "babysitters"),
          where("userId", "==", userId)
        );
        const babysitterSnapshot = await getDocs(babysitterRef);
        const babysitterData = babysitterSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))[0];

        // Fetch the babysitter application data
        const applicationRef = query(
          collection(FIREBASE_DB, "babysitterApplications"),
          where("userId", "==", userId)
        );
        const applicationSnapshot = await getDocs(applicationRef);
        const applicationData = applicationSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))[0];

        setBabysitter(babysitterData);
        setApplication(applicationData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchBabysitterAndApplication();
  }, [userId]);

  if (!babysitter || !application) return null;

  return (
    <PageContainer>
      <ContentWrapper>
        <InfoSection>
          {/* Profile Section */}
          <ProfileSection>
            <Avatar
              src={babysitter.photo || BabysitterImage}
              sx={{
                width: 140,
                height: 140,
                margin: "auto",
                borderRadius: "50%",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
              }}
            />
            <Typography
              variant="h6"
              sx={{ marginTop: "20px", fontWeight: "bold" }}
            >
              {`${babysitter.firstName} ${babysitter.lastName}`}
            </Typography>
            <Typography sx={{ color: "#888", marginBottom: "10px" }}>
              {babysitter.city}
            </Typography>
            <Rating
              name={`rating-${babysitter.id}`}
              value={babysitter.rating}
              precision={0.5}
              readOnly
              size="large"
            />
          </ProfileSection>

          {/* Application Details Section */}
          <ApplicationSection>
            <Typography variant="h5" sx={{ marginBottom: "20px" }}>
              Application Details
            </Typography>
            <Typography
              variant="h6"
              sx={{ marginBottom: "10px", fontWeight: "bold" }}
            >
              Area: {application.area}
            </Typography>
            <Typography variant="h6" sx={{ marginBottom: "10px" }}>
              Job Type: {application.jobType}
            </Typography>
            <Typography variant="h6" sx={{ marginBottom: "10px" }}>
              Babysitting Place: {application.babysittingPlace.join(", ")}
            </Typography>
            <Typography variant="h6" sx={{ marginBottom: "10px" }}>
              Child Ages: {application.childAges.join(", ")}
            </Typography>

            {/* Availability Schedule */}
            <Typography
              variant="h6"
              sx={{ marginBottom: "20px", fontWeight: "bold" }}
            >
              Availability Schedule
            </Typography>

            <ScheduleGrid>
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day, index) => (
                <Box key={index}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      textAlign: "center",
                      fontWeight: "bold",
                      marginBottom: "10px",
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
                        {timeSlot}
                      </ScheduleItem>
                    )
                  )}
                </Box>
              ))}
            </ScheduleGrid>
          </ApplicationSection>
        </InfoSection>

        {/* Edit Button */}
        {babysitter.email === application.email && (
          <Box sx={{ textAlign: "center", marginTop: "30px" }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#5e62d1",
                fontSize: "1.2rem",
                borderRadius: "30px",
                padding: "12px 30px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#4a54c1",
                },
              }}
            >
              Edit Application
            </Button>
          </Box>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default BabysitterApplicationDisplay;
