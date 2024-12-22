import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import HistoryIcon from '@mui/icons-material/History';
import DoneIcon from '@mui/icons-material/Done';

const Container = styled(Box)({
  backgroundColor: '#f4f4f4',
  minHeight: '100vh',
  padding: '20px',
  paddingTop: '100px',
});

const Header = styled(Box)({
  textAlign: 'center',
});

const TabContainer = styled(Box)({
  margin: '20px 0',
});

const ApplicationCard = styled(Card)({
  margin: '15px',
  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
  borderRadius: '10px',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: '0px 6px 25px rgba(0, 0, 0, 0.3)',
  },
});

const CardHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const StatusChip = styled(Box)(({ status }) => ({
  backgroundColor: status === 'draft' ? '#FFC107' : status === 'active' ? '#4CAF50' : '#9E9E9E',
  color: '#fff',
  padding: '5px 10px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 'bold',
}));

const ProgressContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: '10px 0',
});

const ActionButton = styled(Button)({
  backgroundColor: '#5e62d1',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#4d56b1',
  },
  margin: '5px',
});

const EmptyState = styled(Box)({
  textAlign: 'center',
  padding: '50px 20px',
});

const MyApplicationsJobs = () => {
  const [currentTab, setCurrentTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const sampleApplications = [
    {
      id: 1,
      area: 'Kesariani',
      jobType: 'Part-time',
      availability: ['Monday Morning', 'Friday Evening'],
      babysittingPlace: ["Family's House"],
      status: 'draft',
      progress: 40,
    },
    {
      id: 2,
      area: 'Kifisia',
      jobType: 'Full-time',
      availability: ['Weekdays'],
      babysittingPlace: ["Babysitter's House"],
      status: 'active',
      progress: 80,
    },
  ];

  const activeJobs = [
    {
      id: 1,
      area: 'Marousi',
      jobType: 'Full-time',
      status: 'active',
      babysittingPlace: ["Family's House"],
    },
  ];

  const historyJobs = [
    {
      id: 1,
      area: 'Nea Smyrni',
      jobType: 'Part-time',
      status: 'completed',
    },
  ];

  const renderTabContent = () => {
    if (currentTab === 0) {
	  return (
		<Grid container spacing={3}>
			{activeJobs.map((job) => (
			<Grid item xs={12} sm={6} md={4} key={job.id}>
				<ApplicationCard>
				<CardContent>
					<CardHeader>
					<Typography variant="h6">{job.area}</Typography>
					<StatusChip status={job.status}>{job.status}</StatusChip>
					</CardHeader>
					<Typography variant="body2">
					<strong>Job Type:</strong> {job.jobType}
					</Typography>
					<Typography variant="body2">
					<strong>Babysitting Place:</strong> {job.babysittingPlace.join(', ')}
					</Typography>
					<Box display="flex" justifyContent="center" marginTop="10px">
					<ActionButton>View</ActionButton>
					</Box>
				</CardContent>
				</ApplicationCard>
			</Grid>
			))}
		</Grid>
	  );
    } else if (currentTab === 1) {
	  return (
		<Grid container spacing={3}>
			{sampleApplications.map((application) => (
			<Grid item xs={12} sm={6} md={4} key={application.id}>
				<ApplicationCard>
				<CardContent>
					<CardHeader>
					<Typography variant="h6" style={{ fontFamily: 'Poppins, sans-serif' }}>
						{application.area}
					</Typography>
					<StatusChip status={application.status}>{application.status}</StatusChip>
					</CardHeader>
					<Typography variant="body2" style={{ margin: '10px 0' }}>
					<strong>Job Type:</strong> {application.jobType}
					</Typography>
					<Typography variant="body2">
					<strong>Availability:</strong> {application.availability.join(', ')}
					</Typography>
					<Typography variant="body2">
					<strong>Babysitting Place:</strong> {application.babysittingPlace.join(', ')}
					</Typography>
					<ProgressContainer>
					<Typography variant="body2">Progress:</Typography>
					<CircularProgress
						variant="determinate"
						value={application.progress}
						size={25}
						style={{ color: '#5e62d1' }}
					/>
					</ProgressContainer>
					<Box display="flex" justifyContent="center" marginTop="10px">
					<ActionButton>Edit</ActionButton>
					<ActionButton>Delete</ActionButton>
					</Box>
				</CardContent>
				</ApplicationCard>
			</Grid>
			))}
		</Grid>
	  );
    } else {
      return (
        <Grid container spacing={3}>
          {historyJobs.length > 0 ? (
            historyJobs.map((job) => (
              <Grid item xs={12} sm={6} md={4} key={job.id}>
                <ApplicationCard>
                  <CardContent>
                    <CardHeader>
                      <Typography variant="h6">{job.area}</Typography>
                      <StatusChip status={job.status}>{job.status}</StatusChip>
                    </CardHeader>
                    <Typography variant="body2">
                      <strong>Job Type:</strong> {job.jobType}
                    </Typography>
                  </CardContent>
                </ApplicationCard>
              </Grid>
            ))
          ) : (
            <EmptyState>
              <HistoryIcon style={{ fontSize: 50, color: '#9E9E9E' }} />
              <Typography variant="body1" color="textSecondary">
                No history available yet.
              </Typography>
            </EmptyState>
          )}
        </Grid>
      );
    }
  };

  return (
    <>
      <Container>
        <Header>
          <Typography variant="h4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: "600" }}>
            My Applications & Jobs
          </Typography>
          <Typography variant="h6" style={{ fontFamily: 'Poppins, sans-serif', marginTop: '10px' }}>
            Manage your applications and job history seamlessly.
          </Typography>
        </Header>

        <TabContainer>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Active Jobs" icon={<WorkOutlineIcon />} />
            <Tab label="Applications" icon={<DoneIcon />} />
            <Tab label="History" icon={<HistoryIcon />} />
          </Tabs>
        </TabContainer>

        {renderTabContent()}
      </Container>
    </>
  );
};

export default MyApplicationsJobs;
