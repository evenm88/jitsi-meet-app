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
    <Container maxWidth="sm">
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
  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      console.error('Jitsi API not loaded');
      return;
    }

    const domain = 'meet.jit.si';
    const container = document.getElementById('jitsi-container');
    container.innerHTML = ''; // clean old iframes

    const api = new window.JitsiMeetExternalAPI(domain, {
      roomName: room,
      parentNode: container,
      width: '100%',
      height: 600,
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

  return <div id="jitsi-container" style={{ marginTop: 20 }} />;
}

export default App;
