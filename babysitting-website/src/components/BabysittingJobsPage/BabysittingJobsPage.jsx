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
import "../../style.css";

const GuardianCard = styled(Card)({
  width: "250px",
  height: "380px",
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

const FilterBox = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
});

const FilterDialog = styled(Dialog)({
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
        if (userRole === "guardian") {
          handleNavigate("/babysitters");
        } else if (userRole === "babysitter") {
          handleNavigate("/babysitting-jobs");
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
      Babysitting Jobs
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

const BabysittingJobsPage = () => {
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [babysittingApplications, setBabysittingApplications] = useState([]);
  const [filters, setFilters] = useState({
    area: "",
    availability: [],
    babysittingPlace: [],
    childAges: [],
    jobType: "",
  });
  const [filteredGuardians, setFilteredGuardians] = useState([]);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
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
    setLoading(true);
    const fetchGuardians = async () => {
      try {
        const guardiansCollectionRef = collection(FIREBASE_DB, "guardians");
        const guardiansSnapshot = await getDocs(guardiansCollectionRef);
        const guardiansList = guardiansSnapshot.docs.map((doc) => ({
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

        const combinedData = guardiansList
          .filter((guardian) =>
            applicationsList.some((app) => app.userId === guardian.userId)
          )
          .map((guardian) => {
            const application = applicationsList.find(
              (app) => app.userId === guardian.userId
            );
            return {
              ...guardian,
              preferredArea: application ? application.area : "",
              availability: application ? application.availability : "",
              babysittingPlace: application ? application.babysittingPlace : "",
              childAges: application ? application.childAges : "",
              jobType: application ? application.jobType : "",
            };
          });

        setGuardians(combinedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching guardians: ", error);
        setLoading(false);
      }
    };

    fetchGuardians();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
  };

  const applyFilters = () => {
    const filtered = guardians.filter((guardian) => {
      const matchesArea =
        !filters.area ||
        guardian.preferredArea
          .toLowerCase()
          .includes(filters.area.toLowerCase());
      const matchesAvailability =
        filters.availability.length === 0 ||
        filters.availability.every((time) =>
          guardian.availability?.includes(time)
        );
      const matchesPlace =
        filters.babysittingPlace.length === 0 ||
        filters.babysittingPlace.some((place) =>
          guardian.babysittingPlace?.includes(place)
        );
      const matchesChildAges =
        filters.childAges.length === 0 ||
        filters.childAges.some((age) => guardian.childAges?.includes(age));
      const matchesJobType =
        !filters.jobType || guardian.jobType === filters.jobType;

      return (
        matchesArea &&
        matchesAvailability &&
        matchesPlace &&
        matchesChildAges &&
        matchesJobType
      );
    });

    setFilteredGuardians(filtered);
    setOpenFilterDialog(false);
  };

  const hasFiltersApplied =
    filters.area ||
    filters.availability.length > 0 ||
    filters.babysittingPlace.length > 0 ||
    filters.childAges.length > 0 ||
    filters.jobType;

  let displayGuardians;
  if (hasFiltersApplied) {
    displayGuardians =
      filteredGuardians.length > 0
        ? filteredGuardians
        : "No guardian applications match the filters.";
  } else {
    displayGuardians = guardians;
  }

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
            Search for babysitting jobs
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters();
                }
              }}
              fullWidth
              sx={{
                maxWidth: "500px",
                borderRadius: "25px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "25px",
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

            <Tooltip title="Filters" arrow>
              <IconButton
                onClick={() => setOpenFilterDialog(true)}
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
              marginTop: "20px",
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
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: "10px",
            }}
          >
            {Array.isArray(displayGuardians) ? (
              displayGuardians.map((guardian) => (
                <GuardianCard
                  key={guardian.userId}
                  onClick={() =>
                    navigate(`/application/${guardian.userId}`, {
                      state: {
                        from: location.pathname,
                      },
                    })
                  }
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <AvatarWrapper src={guardian.photo || ""} />
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
                      {`${guardian.firstName} ${guardian.lastName}`}
                    </Typography>
                    <Typography
                      style={{
                        color: "#888",
                        fontFamily: "Poppins, sans-serif",
                        marginBottom: "10px",
                        fontSize: "14px",
                      }}
                    >
                      {guardian.preferredArea}
                    </Typography>

                    <Box
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <Rating
                        name={`rating-${guardian.id}`}
                        value={guardian.rating}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                    </Box>
                  </CardContentWrapper>
                </GuardianCard>
              ))
            ) : (
              <Typography
                style={{
                  fontFamily: "Poppins, sans-serif",
                  color: "#888",
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                {displayGuardians}
              </Typography>
            )}
          </Box>
          <Dialog
            open={openFilterDialog}
            onClose={() => setOpenFilterDialog(false)}
            maxWidth="md"
          >
            <DialogTitle sx={{ fontFamily: "Poppins, sans-serif" }}>
              Apply Filters
            </DialogTitle>
            <DialogContent>
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
                  onChange: (e) =>
                    handleFilterChange("jobType", e.target.value),
                },
              ].map(({ label, value, options, multiple, onChange }, index) => {
                const labelId = `${label
                  .toLowerCase()
                  .replace(/\s+/g, "-")}-label`;
                return (
                  <FormControl
                    fullWidth
                    sx={{ mb: 2, mt: 1 }}
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
            </DialogContent>
            <DialogActions>
              {[
                {
                  label: "Apply Filters",
                  onClick: applyFilters,
                  variant: "contained",
                  style: {
                    backgroundColor: "#5e62d1",
                    color: "white",
                  },
                  hover: {
                    backgroundColor: "#4a54c2",
                  },
                },
                {
                  label: "Clear Filters",
                  onClick: () =>
                    setFilters({
                      area: "",
                      availability: [],
                      babysittingPlace: [],
                      childAges: [],
                      jobType: "",
                    }),
                  variant: "outlined",
                  style: {
                    backgroundColor: "white",
                    color: "#5e62d1",
                    border: "1px solid #5e62d1",
                  },
                  hover: {
                    backgroundColor: "#f0f4ff",
                  },
                },
                {
                  label: "Cancel",
                  onClick: () => setOpenFilterDialog(false),
                  variant: "outlined",
                  style: {
                    backgroundColor: "white",
                    color: "#5e62d1",
                    border: "1px solid #5e62d1",
                  },
                  hover: {
                    backgroundColor: "#f0f4ff",
                  },
                },
              ].map(({ label, onClick, variant, style, hover }, index) => (
                <Button
                  key={index}
                  onClick={onClick}
                  variant={variant}
                  sx={{
                    borderRadius: "30px",
                    textTransform: "none",
                    ...style,
                    "&:hover": hover,
                  }}
                >
                  {label}
                </Button>
              ))}
            </DialogActions>
          </Dialog>
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
            Need a Babysitting Job? Let us help you find the perfect match!
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
            families in your area.
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
            onClick={() =>
              navigate(`/babysitting-application`, {
                state: { from: location.pathname },
              })
            }
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
                      Find families seeking babysitters that match your
                      availability and preferences using platform's filters.
                    </Typography>
                  )}
                  {index === 1 && (
                    <Typography
                      style={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      Get in touch with families by sending professional
                      messages, discussing job details, and arranging
                      interviews.
                    </Typography>
                  )}
                  {index === 2 && (
                    <Typography
                      style={{
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      Confirm responsibilities and use the platform to manage
                      payments and receipts for your services.
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

export default BabysittingJobsPage;
