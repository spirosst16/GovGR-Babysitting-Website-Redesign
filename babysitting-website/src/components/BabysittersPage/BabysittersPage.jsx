import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Rating,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import SearchIcon from "@mui/icons-material/Search"; // for the search icon
import FilterAltIcon from "@mui/icons-material/FilterAlt"; // for the filter icon
import "../../style.css";

const BabysitterCard = styled(Card)({
  width: "250px",
  margin: "20px",
  boxShadow: "0 8px 15px rgba(0, 0, 0, 0.15)",
  borderRadius: "15px",
  overflow: "hidden",
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 16px 30px rgba(0, 0, 0, 0.1)",
  },
});

const AvatarWrapper = styled(Avatar)({
  width: "100px",
  height: "100px",
  marginTop: "20px",
  borderRadius: "50%",
});

const CardContentWrapper = styled(CardContent)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  textAlign: "center",
  padding: "10px",
  width: "100%",
});

const FilterBox = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
});

const FilterDialog = styled(Dialog)({
  padding: "20px",
});

const BabysittersPage = () => {
  const [babysitters, setBabysitters] = useState([]);
  const [babysitterApplications, setBabysitterApplications] = useState([]);
  const [filters, setFilters] = useState({
    area: "",
    availability: [],
    babysittingPlace: [],
    childAges: [],
    jobType: "",
  });
  const [filteredBabysitters, setFilteredBabysitters] = useState([]);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const availabilityOptions = [
    "Monday Morning",
    "Wednesday Morning",
    "Wednesday Afternoon",
    "Friday Night",
    "Saturday Afternoon",
    "Sunday Afternoon",
  ];
  const babysittingPlaceOptions = ["Family's House", "Babysitter's House"];
  const childAgeOptions = ["0-1", "2-3", "4-5"];
  const jobTypeOptions = ["Part-time", "Full-time"];

  useEffect(() => {
	const fetchBabysitters = async () => {
	  try {
		const babysittersCollectionRef = collection(FIREBASE_DB, "babysitters");
		const babysitterSnapshot = await getDocs(babysittersCollectionRef);
		const babysittersList = babysitterSnapshot.docs.map((doc) => ({
		  id: doc.id,
		  ...doc.data(),
		}));
  
		const applicationsCollectionRef = collection(FIREBASE_DB, "babysitterApplications");
		const applicationSnapshot = await getDocs(applicationsCollectionRef);
		const applicationsList = applicationSnapshot.docs.map((doc) => ({
		  id: doc.id,
		  ...doc.data(),
		}));
  
		const combinedData = babysittersList.map((babysitter) => {
		  const application = applicationsList.find(
			(app) => app.userId === babysitter.userId
		  );
		  return {
			...babysitter,
			preferredArea: application ? application.area : "",
			availability: application ? application.availability : "",
			babysittingPlace: application ? application.babysittingPlace : "",
			childAges: application ? application.childAges : "",
			jobType: application ? application.jobType : "",
		  };
		});
  
		setBabysitters(combinedData);
	  } catch (error) {
		console.error("Error fetching babysitters: ", error);
	  }
	};
  
	fetchBabysitters();
  }, []);
  

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
  };

  const applyFilters = () => {
    const filtered = babysitters.filter((babysitter) => {
      const matchesArea =
        !filters.area || babysitter.area.toLowerCase() === filters.area.toLowerCase();
      const matchesAvailability =
        filters.availability.length === 0 ||
        filters.availability.some((time) => babysitter.availability?.includes(time));
      const matchesPlace =
        filters.babysittingPlace.length === 0 ||
        filters.babysittingPlace.includes(babysitter.babysittingPlace);
      const matchesChildAges =
        filters.childAges.length === 0 ||
        filters.childAges.some((age) => babysitter.childAges?.includes(age));
      const matchesJobType =
        !filters.jobType || babysitter.jobType === filters.jobType;

      return (
        matchesArea &&
        matchesAvailability &&
        matchesPlace &&
        matchesChildAges &&
        matchesJobType
      );
    });

    setFilteredBabysitters(filtered);
    setOpenFilterDialog(false);
  };

  const displayBabysitters = filteredBabysitters.length > 0
    ? filteredBabysitters
    : babysitters;

  return (
    <>
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

        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <TextField
            label="Search by Area"
            variant="outlined"
            value={filters.area}
            onChange={(e) => handleFilterChange("area", e.target.value)}
            fullWidth
            style={{ maxWidth: "500px" }}
          />
          <IconButton
            onClick={() => setFilters({ ...filters })}
            style={{
              backgroundColor: "#5e62d1",
              color: "#fff",
              padding: "10px",
              borderRadius: "50%",
            }}
          >
            <SearchIcon />
          </IconButton>

          <Tooltip title="Apply Filters" arrow>
            <IconButton
              onClick={() => setOpenFilterDialog(true)}
              style={{
                backgroundColor: "#5e62d1",
                color: "#fff",
                padding: "10px",
                borderRadius: "50%",
              }}
            >
              <FilterAltIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            marginTop: "10px",
          }}
        >
          {displayBabysitters.map((babysitter) => (
            <BabysitterCard key={babysitter.id}>
              <AvatarWrapper src={babysitter.photo || ""} />
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
                  {babysitter.preferredArea}
                </Typography>
                <Rating
                  name={`rating-${babysitter.id}`}
                  value={babysitter.rating}
                  precision={0.5}
                  readOnly
                  size="small"
                />
                <Typography
                  style={{
                    color: "#666",
                    fontSize: "12px",
                    marginTop: "10px",
                  }}
                >
                  Bio: {babysitter.bio}
                </Typography>
                <Typography
                  style={{
                    color: "#666",
                    fontSize: "12px",
                    marginTop: "10px",
                  }}
                >
                  Experience: {babysitter.experience}
                </Typography>
                <Typography
                  style={{
                    color: "#666",
                    fontSize: "12px",
                    marginTop: "10px",
                  }}
                >
                  Education: {babysitter.education}
                </Typography>
                <Typography
                  style={{
                    color: "#666",
                    fontSize: "12px",
                    marginTop: "10px",
                  }}
                >
                  Languages: {babysitter.knownLanguages.join(", ")}
                </Typography>
              </CardContentWrapper>
            </BabysitterCard>
          ))}
        </Box>

        <Dialog
          open={openFilterDialog}
          onClose={() => setOpenFilterDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Apply Filters</DialogTitle>
          <DialogContent>
            <FormControl fullWidth style={{ marginBottom: "20px" }}>
              <InputLabel>Availability</InputLabel>
              <Select
                multiple
                value={filters.availability}
                onChange={(e) => handleFilterChange("availability", e.target.value)}
                renderValue={(selected) => selected.join(", ")}
              >
                {availabilityOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox checked={filters.availability.includes(option)} />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth style={{ marginBottom: "20px" }}>
              <InputLabel>Babysitting Place</InputLabel>
              <Select
                multiple
                value={filters.babysittingPlace}
                onChange={(e) => handleFilterChange("babysittingPlace", e.target.value)}
                renderValue={(selected) => selected.join(", ")}
              >
                {babysittingPlaceOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox checked={filters.babysittingPlace.includes(option)} />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth style={{ marginBottom: "20px" }}>
              <InputLabel>Child Ages</InputLabel>
              <Select
                multiple
                value={filters.childAges}
                onChange={(e) => handleFilterChange("childAges", e.target.value)}
                renderValue={(selected) => selected.join(", ")}
              >
                {childAgeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox checked={filters.childAges.includes(option)} />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth style={{ marginBottom: "20px" }}>
              <InputLabel>Job Type</InputLabel>
              <Select
                value={filters.jobType}
                onChange={(e) => handleFilterChange("jobType", e.target.value)}
              >
                {jobTypeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>

          <DialogActions>
            <Button onClick={applyFilters} color="primary" variant="contained">
              Apply Filters
            </Button>
            <Button onClick={() => setOpenFilterDialog(false)} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default BabysittersPage;
