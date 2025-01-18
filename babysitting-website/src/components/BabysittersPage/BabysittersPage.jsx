import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Container,
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
  Chip,
  CircularProgress,
  Autocomplete,
  Pagination,
} from "@mui/material";
import { styled } from "@mui/system";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { greekCities } from "../../utils/greekCities";
import "../../style.css";

const BabysitterCard = styled(Card)({
  width: "250px",
  height: "380px",
  margin: "-15px 20px",
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
    cursor: "pointer",
  },
});

const AvatarWrapper = styled(Avatar)({
  width: "180px",
  height: "180px",
  marginTop: "20px",
  borderRadius: "10%",
});

const CardContentWrapper = styled(CardContent)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  textAlign: "center",
  padding: "20px",
  width: "100%",
});

const ApplicationSectionWrapper = styled(Box)({
  textAlign: "center",
  marginBottom: "0",
  marginTop: "0",
  backgroundColor: "#5e62d1",
  padding: "20px",
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
      Babysitters
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

const BabysittersPage = () => {
  const [babysitters, setBabysitters] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [babysittingApplications, setBabysittingApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    area: "",
    availability: [],
    babysittingPlace: [],
    childAges: [],
    jobType: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [filteredBabysitters, setFilteredBabysitters] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const availabilityOptions = [
    "Monday Morning",
    "Monday Afternoon",
    "Monday Evening",
    "Monday Night",
    "Tuesday Morning",
    "Tuesday Afternoon",
    "Tuesday Evening",
    "Tuesday Night",
    "Wednesday Morning",
    "Wednesday Afternoon",
    "Wednesday Evening",
    "Wednesday Night",
    "Thursday Morning",
    "Thursday Afternoon",
    "Thursday Evening",
    "Thursday Night",
    "Friday Morning",
    "Friday Afternoon",
    "Friday Evening",
    "Friday Night",
    "Saturday Morning",
    "Saturday Afternoon",
    "Saturday Evening",
    "Saturday Night",
    "Sunday Morning",
    "Sunday Afternoon",
    "Sunday Evening",
    "Sunday Night",
  ];
  const babysittingPlaceOptions = ["Family's House", "Babysitter's House"];
  const childAgeOptions = ["0-1", "2-3", "4-5", "6-12", "13-17"];
  const jobTypeOptions = ["Part-time", "Full-time"];

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

  useEffect(() => {
    setLoading(true);
    const fetchBabysitters = async () => {
      try {
        const babysittersCollectionRef = collection(FIREBASE_DB, "babysitters");
        const babysitterSnapshot = await getDocs(babysittersCollectionRef);
        const babysittersList = babysitterSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const applicationsCollectionRef = collection(
          FIREBASE_DB,
          "babysittingApplications"
        );
        const applicationSnapshot = await getDocs(applicationsCollectionRef);
        const applicationsList = applicationSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((app) => app.status === "submitted");

        const combinedData = babysittersList
          .filter((babysitter) =>
            applicationsList.some((app) => app.userId === babysitter.userId)
          )
          .map((babysitter) => {
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
          })
          .sort((a, b) => b.rating - a.rating);

        setBabysittingApplications(applicationsList);
        setBabysitters(combinedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching babysitters: ", error);
        setLoading(false);
      }
    };

    fetchBabysitters();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [key]: value };
      applyFilters(updatedFilters);
      return updatedFilters;
    });
  };

  const applyFilters = (currentFilters = filters) => {
    const filtered = babysitters.filter((babysitter) => {
      const matchesArea =
        !currentFilters.area ||
        babysitter.preferredArea
          .toLowerCase()
          .includes(currentFilters.area.toLowerCase());
      const matchesAvailability =
        currentFilters.availability.length === 0 ||
        currentFilters.availability.some((time) =>
          babysitter.availability?.includes(time)
        );
      const matchesPlace =
        currentFilters.babysittingPlace.length === 0 ||
        currentFilters.babysittingPlace.some((place) =>
          babysitter.babysittingPlace?.includes(place)
        );
      const matchesChildAges =
        currentFilters.childAges.length === 0 ||
        currentFilters.childAges.some((age) =>
          babysitter.childAges?.includes(age)
        );
      const matchesJobType =
        !currentFilters.jobType ||
        babysitter.jobType === currentFilters.jobType;

      return (
        matchesArea &&
        matchesAvailability &&
        matchesPlace &&
        matchesChildAges &&
        matchesJobType
      );
    });

    setFilteredBabysitters(filtered);
  };

  const hasFiltersApplied =
    filters.area ||
    filters.availability.length > 0 ||
    filters.babysittingPlace.length > 0 ||
    filters.childAges.length > 0 ||
    filters.jobType;

  let displayBabysitters;
  if (hasFiltersApplied) {
    displayBabysitters =
      filteredBabysitters.length > 0
        ? filteredBabysitters
        : "No babysitters match the filters.";
  } else {
    displayBabysitters = babysitters;
  }

  const handleApplication = async () => {
    if (userRole === null) {
      navigate("/login", {
        state: { from: "/babysitting-application", parent: location.pathname },
      });
      return;
    }
    navigate(`/babysitting-application`, {
      state: { from: location.pathname, parent: location.pathname },
    });
  };

  useEffect(() => {
    if (!loading && babysitters.length > 0) {
      if (location.state?.area) {
        setFilters((prev) => {
          const updatedFilters = { ...prev, area: location.state.area };
          applyFilters(updatedFilters);
          return updatedFilters;
        });
      } else {
        applyFilters(filters);
      }
    }
  }, [location.state, babysitters, loading]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBabysitters = Array.isArray(displayBabysitters)
    ? displayBabysitters.slice(startIndex, endIndex)
    : [];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f4f4f4",
        }}
      >
        <CircularProgress sx={{ color: "#5e62d1" }} />
      </Box>
    );
  } else {
    return (
      <>
        <CustomSeparator />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#f4f4f4",
          }}
        >
          <Box
            sx={{
              width: "300px",
              padding: "20px",
              paddingTop: "100px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: "bold",
                color: "#333",
                textAlign: "center",
              }}
            >
              Filters
            </Typography>
            {[
              {
                label: "Availability",
                value: filters.availability,
                options: availabilityOptions,
                multiple: true,
                onChange: (e) =>
                  handleFilterChange("availability", e.target.value),
              },
              {
                label: "Babysitting Place",
                value: filters.babysittingPlace,
                options: babysittingPlaceOptions,
                multiple: true,
                onChange: (e) =>
                  handleFilterChange("babysittingPlace", e.target.value),
              },
              {
                label: "Child Ages",
                value: filters.childAges,
                options: childAgeOptions,
                multiple: true,
                onChange: (e) =>
                  handleFilterChange("childAges", e.target.value),
              },
              {
                label: "Job Type",
                value: filters.jobType,
                options: jobTypeOptions,
                multiple: false,
                onChange: (e) => handleFilterChange("jobType", e.target.value),
              },
            ].map(({ label, value, options, multiple, onChange }, index) => {
              const labelId = `${label
                .toLowerCase()
                .replace(/\s+/g, "-")}-label`;
              return (
                <FormControl
                  fullWidth
                  sx={{ mb: 2 }}
                  key={index}
                  variant="outlined"
                >
                  <InputLabel
                    id={labelId}
                    sx={{
                      "&.Mui-focused": {
                        color: "#5e62d1",
                      },
                    }}
                  >
                    {label}
                  </InputLabel>
                  <Select
                    labelId={labelId}
                    value={value}
                    onChange={onChange}
                    multiple={multiple}
                    label={label}
                    renderValue={(selected) =>
                      Array.isArray(selected) ? selected.join(", ") : selected
                    }
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.23)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.5)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#5e62d1",
                      },
                    }}
                  >
                    {options.map((option) => (
                      <MenuItem key={option} value={option}>
                        {multiple && (
                          <Checkbox
                            checked={value.includes(option)}
                            sx={{
                              color: "#5e62d1",
                              "&.Mui-checked": {
                                color: "#5e62d1",
                              },
                            }}
                          />
                        )}
                        <ListItemText primary={option} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            })}
            <Button
              onClick={() =>
                setFilters({
                  area: "",
                  availability: [],
                  babysittingPlace: [],
                  childAges: [],
                  jobType: "",
                })
              }
              variant="outlined"
              sx={{
                backgroundColor: "#5e62d1",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#4a54c2",
                },
                textTransform: "none",
                borderRadius: "25px",
              }}
            >
              Clear Filters
            </Button>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: "bold",
                textAlign: "center",
                mb: 3,
              }}
            >
              Find Your Babysitter
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Autocomplete
                options={greekCities.sort()}
                value={filters.area || ""}
                onChange={(event, value) => handleFilterChange("area", value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search by Area"
                    variant="outlined"
                    fullWidth
                    sx={{
                      maxWidth: "500px",
                      borderRadius: "25px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "25px",
                        minHeight: "56px",
                        "& fieldset": {
                          borderColor: "#ccc",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#5e62d1",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "rgba(0, 0, 0, 0.6)",
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#5e62d1",
                      },
                    }}
                  />
                )}
                sx={{
                  width: "100%",
                  maxWidth: "500px",
                  "& .MuiAutocomplete-inputRoot": {
                    borderRadius: "25px",
                    padding: "0 12px",
                  },
                }}
              />

              <Tooltip title="Search" arrow>
                <IconButton
                  onClick={() => applyFilters()}
                  style={{
                    backgroundColor: "#5e62d1",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: "50%",
                    transition: "transform 0.2s, background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#4248a6";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#5e62d1";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {filters.area && (
                <Chip
                  label={`Area: ${filters.area}`}
                  onDelete={() => handleFilterChange("area", "")}
                  style={{
                    backgroundColor: "#5e62d1",
                    color: "#fff",
                  }}
                />
              )}
              {filters.availability.map((option, index) => (
                <Chip
                  key={index}
                  label={`Availability: ${option}`}
                  onDelete={() =>
                    handleFilterChange(
                      "availability",
                      filters.availability.filter((item) => item !== option)
                    )
                  }
                  style={{
                    backgroundColor: "#5e62d1",
                    color: "#fff",
                  }}
                />
              ))}
              {filters.babysittingPlace.map((option, index) => (
                <Chip
                  key={index}
                  label={`Babysitting Place: ${option}`}
                  onDelete={() =>
                    handleFilterChange(
                      "babysittingPlace",
                      filters.babysittingPlace.filter((item) => item !== option)
                    )
                  }
                  style={{
                    backgroundColor: "#5e62d1",
                    color: "#fff",
                  }}
                />
              ))}
              {filters.childAges.map((option, index) => (
                <Chip
                  key={index}
                  label={`Child Age: ${option}`}
                  onDelete={() =>
                    handleFilterChange(
                      "childAges",
                      filters.childAges.filter((item) => item !== option)
                    )
                  }
                  style={{
                    backgroundColor: "#5e62d1",
                    color: "#fff",
                  }}
                />
              ))}
              {filters.jobType && (
                <Chip
                  label={`Job Type: ${filters.jobType}`}
                  onDelete={() => handleFilterChange("jobType", "")}
                  style={{
                    backgroundColor: "#5e62d1",
                    color: "#fff",
                  }}
                />
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                gap: 3,
              }}
            >
              {currentBabysitters.map((babysitter) => (
                <BabysitterCard
                  key={babysitter.userId}
                  onClick={() => {
                    const application = babysittingApplications.find(
                      (app) => app.userId === babysitter.userId
                    );

                    if (application) {
                      navigate(`/application/${application.id}`, {
                        state: { from: location.pathname },
                      });
                    } else {
                      console.error(
                        "No application found for this babysitter."
                      );
                    }
                  }}
                >
                  <AvatarWrapper src={babysitter.photo || ""} />
                  <CardContentWrapper>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                        color: "#000",
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    >
                      {`${babysitter.firstName} ${babysitter.lastName}`}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                        color: "#888",
                        mb: 1,
                        textAlign: "center",
                      }}
                    >
                      {babysitter.preferredArea}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Rating
                        name={`rating-${babysitter.id}`}
                        value={babysitter.rating}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                    </Box>
                  </CardContentWrapper>
                </BabysitterCard>
              ))}
            </Box>

            {Array.isArray(displayBabysitters) &&
              displayBabysitters.length > itemsPerPage && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination
                    count={Math.ceil(displayBabysitters.length / itemsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      "& .MuiPaginationItem-root": {
                        color: "#5e62d1",
                      },
                      "& .Mui-selected": {
                        backgroundColor: "#5e62d1 !important",
                        color: "#fff !important",
                      },
                    }}
                  />
                </Box>
              )}
          </Box>
        </Box>

        <ApplicationSectionWrapper>
          <Typography
            variant="h4"
            style={{
              fontFamily: "Poppins, sans-serif",
              color: "#fff",
              marginBottom: "10px",
            }}
          >
            Need a Babysitter? Let us help you find the perfect match!
          </Typography>
          <Typography
            variant="subtitle1"
            style={{
              fontFamily: "Poppins, sans-serif",
              color: "#e0e0e0",
              marginBottom: "20px",
            }}
          >
            Create an application with your needs and connect with qualified
            babysitters in your area.
          </Typography>
          <Button
            variant="contained"
            style={{
              backgroundColor: "#fff",
              color: "#5e62d1",
              fontFamily: "Poppins, sans-serif",
              textTransform: "none",
              padding: "10px 20px",
              borderRadius: "30px",
              fontWeight: "600",
              fontSize: "16px",
            }}
            onClick={handleApplication}
          >
            Create an application now
          </Button>
        </ApplicationSectionWrapper>
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
                    <Typography
                      style={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      Use filters based on your needs and check recommended
                      profiles.
                    </Typography>
                  )}
                  {index === 1 && (
                    <Typography
                      style={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      Send messages, rate members, and schedule a meet-up.
                    </Typography>
                  )}
                  {index === 2 && (
                    <Typography
                      style={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
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
  }
};

export default BabysittersPage;
