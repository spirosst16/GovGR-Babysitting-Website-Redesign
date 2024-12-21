import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Rating
} from "@mui/material";
import { styled } from "@mui/system";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import '../../style.css';

const BabysitterCard = styled(Card)({
  display: "flex",
  width: "100%",
  margin: "20px 0",
  boxShadow: "0 8px 15px rgba(0, 0, 0, 0.15)",
  borderRadius: "15px",
  overflow: "hidden",
  background: "linear-gradient(135deg, #ffffff 0%, #f7f7f7 100%)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 16px 30px rgba(0, 0, 0, 0.1)",
  },
});

const CardContentWrapper = styled(CardContent)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  textAlign: "left",
  padding: "20px",
  width: "70%",
  paddingLeft: "30px",
});

const AvatarWrapper = styled(Avatar)({
  width: "90px",
  height: "90px",
  marginRight: "20px",
  borderRadius: "50%",
  marginLeft: "20px",
  marginTop: "20px",
});

const CardWrapper = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexWrap: "wrap",
  backgroundColor: "transparent",
  width: "100%",
});


const SearchBox = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "80px",
  width: "100%",
});

const BabysittersPage = () => {
  const [babysitters, setBabysitters] = useState([]);
  const [city, setCity] = useState("");
  const [filteredBabysitters, setFilteredBabysitters] = useState([]);

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

  const handleSearch = () => {
    const filtered = babysitters.filter((babysitter) =>
      babysitter.city.toLowerCase().includes(city.toLowerCase())
    );
    setFilteredBabysitters(filtered);
  };

  const displayBabysitters = filteredBabysitters.length > 0 ? filteredBabysitters : 
    [...babysitters].sort((a, b) => b.rating - a.rating).slice(0, 5);

  return (
    <>
      <Navbar />

      <Box
        style={{
			backgroundColor: "#f4f4f4",
			padding: 0,
			margin: 0,
			minHeight: "100vh",
			display: "flex",
			flexDirection: "column",
        }}
      >
        <Typography
          variant="h4"
          style={{
            fontFamily: "Poppins, sans-serif",
            marginBottom: "30px",
            textAlign: "center",
            color: "#000",
            marginTop: "100px",
            fontWeight: "600",
          }}
        >
          Find Your Babysitter
        </Typography>

        <SearchBox>
		<TextField
		label="Search by City"
		variant="outlined"
		value={city}
		onChange={(e) => setCity(e.target.value)}
		fullWidth
		style={{
			marginRight: "20px",
			height: "50px",
			backgroundColor: "#ffffff",
		}}
		InputProps={{
			style: {
			height: "50px",
			},
		}}
		/>
		<Button
			variant="contained"
			onClick={handleSearch}
			style={{
			height: "50px",
			backgroundColor: "#5e62d1",
			color: "white",
			padding: "0 30px",
			borderRadius: "8px",
			fontWeight: "bold",
			textTransform: "none",
			}}
		>
			Search
		</Button>
		</SearchBox>

        <CardWrapper>
          {displayBabysitters.map((babysitter) => (
            <BabysitterCard key={babysitter.id}>
              <AvatarWrapper
                src={babysitter.photo || ""}
              />
              <CardContentWrapper>
                <Typography
                  variant="h6"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    color: "#000",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  {`${babysitter.firstName} ${babysitter.lastName}`}
                </Typography>
                <Typography
                  style={{
                    color: "#888",
                    fontFamily: "Poppins, sans-serif",
                    marginBottom: "10px",
                    fontSize: "14px",
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
              </CardContentWrapper>
            </BabysitterCard>
          ))}
        </CardWrapper>
      </Box>

      <Footer />
    </>
  );
};

export default BabysittersPage;
