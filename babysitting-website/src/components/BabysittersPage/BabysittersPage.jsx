import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
} from "@mui/material";
import { styled } from "@mui/system";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

const BabysitterCard = styled(Card)({
  width: "300px",
  margin: "10px",
});

const CardWrapper = styled(Box)({
  backgroundColor: "#f4f4f4",
  padding: "20px",
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  marginTop: 0,
});

const MapWrapper = styled(Box)({
  height: "400px",
  width: "100%",
  marginTop: "20px",
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

  const defaultCenter = {
    lat: 37.9838, // Default latitude for Athens, Greece
    lng: 23.7275, // Default longitude for Athens, Greece
  };

  return (
    <>
      <Navbar />

      <Box style={{ padding: "20px" }}>
        <Typography
          variant="h4"
          style={{ fontFamily: "Poppins, sans-serif", marginBottom: "20px" }}
        >
          Find Your Babysitter
        </Typography>
        <Box display="flex" alignItems="center" marginBottom="20px">
          <TextField
            label="Search by City"
            variant="outlined"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ marginRight: "10px" }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            style={{ backgroundColor: "#5e62d1", color: "white" }}
          >
            Search
          </Button>
        </Box>

        <CardWrapper>
          {filteredBabysitters.map((babysitter) => (
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
                  style={{ fontFamily: "Poppins, sans-serif", color: "#000" }}
                >
                  {`${babysitter.firstName} ${babysitter.lastName}`}
                </Typography>
                <Typography
                  style={{ color: "#888", fontFamily: "Poppins, sans-serif" }}
                >
                  {babysitter.city}
                </Typography>
              </CardContent>
            </BabysitterCard>
          ))}
        </CardWrapper>

        <MapWrapper>
          <APIProvider apiKey="AIzaSyBn-8X4orGhxNYyGh5wliFu25X6sCnQLV8">
            <Map
              center={defaultCenter}
              zoom={12}
              style={{ height: "400px", width: "100%" }}
            >
              {filteredBabysitters.map((babysitter) => (
                <Marker
                  key={babysitter.id}
                  position={{
                    lat: babysitter.latitude,
                    lng: babysitter.longitude,
                  }}
                />
              ))}
            </Map>
          </APIProvider>
        </MapWrapper>
      </Box>

      <Footer />
    </>
  );
};

export default BabysittersPage;
