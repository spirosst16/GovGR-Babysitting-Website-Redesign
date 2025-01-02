import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CelebrationIcon from "@mui/icons-material/Celebration";
import { styled } from "@mui/system";
import Navbar from "../Navbar/Navbar";

const StyledButton = styled(Button)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: "1rem",
  textTransform: "none",
  borderRadius: "30px",
  backgroundColor: "#5e62d1",
  color: "white",
  "&:hover": {
    backgroundColor: "#4a4fbf",
  },
});

const steps = [
  "Confirm Monthly Work Completion",
  "Generate Digital Voucher",
  "Finalize Payment Process",
];

const mockVoucherData = {
  id: "12345",
  amount: "$1500",
  date: new Date().toLocaleDateString(),
  description: "Monthly Professional Service Payment",
  recipient: "John Doe",
};

const PaymentTracker = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [workConfirmed, setWorkConfirmed] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setWorkConfirmed(false);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Typography variant="body1" textAlign="center">
              Confirm the completion of the monthly work.
            </Typography>
            <List sx={{ mt: 2, pl: 2 }}>
              {[
                "Tasks completed as per agreement",
                "Deadlines met",
                "Quality standards maintained",
              ].map((task, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: "#5e62d1" }} />
                  </ListItemIcon>
                  <ListItemText primary={task} />
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <StyledButton
                onClick={() => setWorkConfirmed(true)}
                disabled={workConfirmed}
              >
                Confirm Work Completion
              </StyledButton>
            </Box>
          </>
        );
      case 1:
        return (
          <>
            <Typography variant="body1" textAlign="center">
              A digital voucher has been generated for the payment. Review its
              details below.
            </Typography>
            <Card
              sx={{
                mt: 3,
                p: 2,
                borderRadius: "10px",
                boxShadow: 3,
                backgroundColor: "#f9f9f9",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Digital Voucher
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {Object.entries(mockVoucherData).map(([key, value]) => (
                  <Typography
                    key={key}
                    variant="body2"
                    sx={{ mb: 1, fontSize: "0.95rem" }}
                  >
                    <strong>{`${
                      key.charAt(0).toUpperCase() + key.slice(1)
                    }:`}</strong>{" "}
                    {value}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </>
        );
      case 2:
        return (
          <>
            <Box textAlign="center" sx={{ mt: 4 }}>
              <CelebrationIcon
                sx={{
                  fontSize: "5rem",
                  color: "#5e62d1",
                }}
              />
            </Box>
            <Typography
              variant="h5"
              textAlign="center"
              sx={{ mt: 2, fontWeight: "bold" }}
            >
              Payment Process Completed!
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ mt: 1, color: "gray" }}
            >
              Thank you for ensuring a smooth payment experience. The
              professional has been notified, and the payment details have been
              securely logged.
            </Typography>
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <StyledButton onClick={handleReset}>Start Over</StyledButton>
            </Box>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        paddingTop: "120px",
        backgroundColor: "#f4f4f4",
        minHeight: "100vh",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <Navbar />
      <Container component="main" maxWidth="md">
        <Typography
          variant="h4"
          component="h1"
          textAlign="center"
          sx={{
            mb: 3,
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Professional Payment Tracker
        </Typography>
        <Stepper
          activeStep={currentStep}
          alternativeLabel
          sx={{
            ".MuiStepIcon-root": {
              color: "#5e62d1",
            },
            ".MuiStepIcon-root.Mui-active": {
              color: "#5e62d1",
            },
            ".MuiStepIcon-root.Mui-completed": {
              color: "#5e62d1",
            },
          }}
        >
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box
          sx={{
            mt: 4,
            p: 3,
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: 4,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {renderStepContent(currentStep)}
          {currentStep < steps.length - 1 && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <StyledButton onClick={handleBack} disabled={currentStep === 0}>
                Back
              </StyledButton>
              <StyledButton
                onClick={handleNext}
                disabled={currentStep === 0 && !workConfirmed}
              >
                Next
              </StyledButton>
            </Box>
          )}
        </Box>
      </Container>
    </div>
  );
};

export default PaymentTracker;
