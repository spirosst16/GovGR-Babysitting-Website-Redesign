import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Rating,
  Avatar,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { styled } from "@mui/system";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import BabysitterImage from "../../assets/Babysitter-image.webp";

const PageContainer = styled(Box)({
  backgroundColor: "#f4f4f4",
  minHeight: "100vh",
  padding: "40px 20px",
});

const ContentWrapper = styled(Container)({
  maxWidth: "1200px",
  margin: "0 auto",
  paddingTop: "40px",
});

const InfoSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "40px",
  marginBottom: "40px",
  alignItems: "center",
  backgroundColor: "#fff",
  padding: "40px",
  borderRadius: "10px",
  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
});

const ProfileSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: "20px",
});

const ProfileInfo = styled(Box)({
  textAlign: "center",
  marginTop: "20px",
});

const ApplicationSection = styled(Box)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  alignItems: "center",
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

const ButtonStyle = styled(Button)({
  fontSize: "0.9rem",
  color: "#ffffff",
  backgroundColor: "#5e62d1",
  padding: "8px 16px",
  marginRight: "8px",
  marginBottom: "8px",
  textTransform: "none",
  borderRadius: "25px",
  "&:hover": {
    backgroundColor: "#5e62d1",
  },
});

const BabysitterApplicationDisplay = () => {
  const { userId } = useParams();
  const [babysitter, setBabysitter] = useState(null);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    const fetchBabysitterAndApplication = async () => {
      try {
        const babysitterRef = query(
          collection(FIREBASE_DB, "babysitters"),
          where("userId", "==", userId)
        );
        const babysitterSnapshot = await getDocs(babysitterRef);
        const babysitterData = babysitterSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))[0];

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
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            marginBottom: "40px",
            marginTop: "20px",
            textAlign: "center",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Application Details
        </Typography>

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
            <ProfileInfo>
              <Typography
                variant="h5"
                sx={{
                  marginTop: "20px",
                  fontWeight: "bold",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {`${babysitter.firstName} ${babysitter.lastName}`}
              </Typography>
              <Typography
                sx={{
                  color: "#888",
                  marginBottom: "10px",
                  fontFamily: "'Poppins', sans-serif",
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
            </ProfileInfo>
          </ProfileSection>

          {/* Application Details */}
          <ApplicationSection>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Area: {application.area}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Job Type: {application.jobType}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Babysitting Place: {application.babysittingPlace.join(", ")}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Child Ages:{" "}
              <Box
                sx={{ display: "flex", gap: "8px", justifyContent: "center" }}
              >
                {application.childAges.map((age, index) => (
                  <ButtonStyle key={index}>{age}</ButtonStyle>
                ))}
              </Box>
            </Typography>

            {/* Availability Schedule */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontFamily: "'Poppins', sans-serif",
                marginTop: "30px",
              }}
            >
              Availability Schedule
            </Typography>

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
                        available={application.availability.includes(
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
          </ApplicationSection>
        </InfoSection>

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
                fontFamily: "'Poppins', sans-serif",
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
