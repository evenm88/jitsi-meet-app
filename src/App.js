import React, { useState, useEffect } from 'react';

import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';

function App() {
  const getRoomFromURL = () => {
    const hash = window.location.hash;
    return hash ? hash.substring(1) : '';
  };

  const [roomName, setRoomName] = useState(getRoomFromURL() || '');
  const [startCall, setStartCall] = useState(!!getRoomFromURL());

  useEffect(() => {
    const hash = getRoomFromURL();
    if (hash && !startCall) {
      setRoomName(hash);
      setStartCall(true);
    }
  }, []);

  const handleStart = () => {
    if (roomName.trim()) {
      window.location.hash = roomName;
      setStartCall(true);
    }
  };

  return (
    <Container >
      <Box mt={10} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Jitsi Video Call
        </Typography>

        {!startCall ? (
          <>
            <TextField
              fullWidth
              label="Room Name"
              variant="outlined"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              style={{ marginBottom: 20 }}
            />
            <Button variant="contained" onClick={handleStart}>
              Start Call
            </Button>
          </>
        ) : (
          <VideoCall room={roomName} />
        )}
      </Box>
    </Container>
  );
}

function VideoCall({ room }) {
  const [prescriptions, setPrescriptions] = useState([
    { name: '', count: '', dosage: '' },
  ]);

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      console.error('Jitsi API not loaded');
      return;
    }

    const domain = 'meet.jit.si';
    const container = document.getElementById('jitsi-container');
    container.innerHTML = '';

    const api = new window.JitsiMeetExternalAPI(domain, {
      roomName: room,
      parentNode: container,
      width: '100%',
      height: '100%',
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
      },
      configOverwrite: {
        startWithAudioMuted: true,
      },
    });

    return () => {
      if (api) api.dispose();
      container.innerHTML = '';
    };
  }, [room]);

  const handleChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const handleAddRow = () => {
    setPrescriptions([...prescriptions, { name: '', count: '', dosage: '' }]);
  };

  const hash = window.location.hash;
const queryIndex = hash.indexOf('?');
const searchParams = new URLSearchParams(queryIndex >= 0 ? hash.substring(queryIndex) : '');
const patientid = searchParams.get('patientid') || '';


  const handleSave = async () => {
  const payload = {
    doctorid: 'doc123',
    patientid: patientid,
    prescriptions,
  };
console.log(payload, 'Payload to be sent to server...........');
  try {
    const response = await fetch('https://d319-103-13-41-82.ngrok-free.app/add-prescription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to save prescription');
    }

    const result = await response.json();
    console.log('Saved Prescription:', result);
    alert('Prescription saved successfully!');
  } catch (error) {
    console.error('Error saving prescription:', error);
    alert('Failed to save prescription.');
  }
};


  return (
    <Box display="flex" height="100vh" width="100%" overflow="hidden">
  {/* Jitsi Video Panel */}
  <Box
    id="jitsi-container"
    flex="1"
    sx={{
      minHeight: '100%',
      borderRight: '1px solid #ccc',
      overflow: 'hidden',
    }}
  />

      {/* Prescription Panel */}
       <Box
    flex="0 0 400px"
    maxWidth="100%"
    p={2}
    overflow="auto"
    display="flex"
    flexDirection="column"
    sx={{ backgroundColor: '#fafafa' }}
  >
        <Typography variant="h6" gutterBottom>
          Prescription
        </Typography>

        {/* Prescription Table */}
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', mb: 2 }}>
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={{ borderBottom: '1px solid #ccc', textAlign: 'left', p: 1 }}>Medicine Name</Box>
              <Box component="th" sx={{ borderBottom: '1px solid #ccc', textAlign: 'left', p: 1 }}>Count</Box>
              <Box component="th" sx={{ borderBottom: '1px solid #ccc', textAlign: 'left', p: 1 }}>Dosage</Box>
            </Box>
          </Box>
          <Box component="tbody">
            {prescriptions.map((item, index) => (
              <Box component="tr" key={index}>
                <Box component="td" sx={{ p: 1 }}>
                  <TextField
                    value={item.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    size="small"
                    fullWidth
                  />
                </Box>
                <Box component="td" sx={{ p: 1 }}>
                  <TextField
                    value={item.count}
                    onChange={(e) => handleChange(index, 'count', e.target.value)}
                    size="small"
                    fullWidth
                  />
                </Box>
                <Box component="td" sx={{ p: 1 }}>
                  <TextField
                    value={item.dosage}
                    onChange={(e) => handleChange(index, 'dosage', e.target.value)}
                    size="small"
                    placeholder="e.g. 1-0-1"
                    fullWidth
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Button variant="outlined" onClick={handleAddRow} sx={{ mb: 2 }}>
          Add Medicine
        </Button>

        <Button variant="contained" onClick={handleSave}>
          Save Prescription
        </Button>
      </Box>
    </Box>
  );
}


export default App;
