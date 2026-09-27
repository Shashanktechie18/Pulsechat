import { useCallback, useEffect, useRef, useState } from 'react';

const RTC_CONFIGURATION = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const isConnectionEnded = (state) => {
  return state === 'failed' || state === 'closed' || state === 'disconnected';
};

const normalizeCallMode = (mode) => {
  return mode === 'audio' ? 'audio' : 'video';
};

const deriveCallScope = (callId) => {
  if (typeof callId === 'string' && callId.startsWith('group-')) {
    return 'group';
  }
  return 'direct';
};

const useVideoCall = ({ socket, currentUser }) => {
  const [callState, setCallState] = useState('idle');
  const [callMode, setCallMode] = useState('video');
  const [callScope, setCallScope] = useState('direct');
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCallUser, setActiveCallUser] = useState(null);
  const [callError, setCallError] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [remoteParticipants, setRemoteParticipants] = useState([]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const localStreamRef = useRef(null);
  const directRemoteStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const pendingCandidatesRef = useRef(new Map());
  const remoteParticipantsRef = useRef(new Map());

  const activeCallIdRef = useRef(null);
  const localMediaModeRef = useRef(null);
  const callScopeRef = useRef('direct');

  const clearCallError = useCallback(() => {
    setCallError('');
  }, []);

  const updateCallScope = useCallback((scope) => {
    const nextScope = scope === 'group' ? 'group' : 'direct';
    callScopeRef.current = nextScope;
    setCallScope(nextScope);
  }, []);

  const attachLocalPreview = useCallback(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current || null;
    }
  }, []);

  const attachDirectRemotePreview = useCallback(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = directRemoteStreamRef.current || null;
    }
  }, []);

  const stopTracks = useCallback((stream) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
  }, []);

  const syncRemoteParticipants = useCallback(() => {
    setRemoteParticipants(Array.from(remoteParticipantsRef.current.values()));
  }, []);

  const closePeerConnection = useCallback((userId) => {
    const peerId = String(userId || '');
    if (!peerId) return;

    const pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      try {
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.onconnectionstatechange = null;
        pc.close();
      } catch (error) {
        console.error('Error closing peer connection:', error);
      }
    }

    peerConnectionsRef.current.delete(peerId);
    pendingCandidatesRef.current.delete(peerId);

    if (remoteParticipantsRef.current.has(peerId)) {
      const item = remoteParticipantsRef.current.get(peerId);
      if (item && item.stream) {
        stopTracks(item.stream);
      }
      remoteParticipantsRef.current.delete(peerId);
      syncRemoteParticipants();
    }

    if (callScopeRef.current === 'direct') {
      directRemoteStreamRef.current = null;
      attachDirectRemotePreview();
    }
  }, [attachDirectRemotePreview, stopTracks, syncRemoteParticipants]);

  const resetCallState = useCallback(() => {
    setCallState('idle');
    setIncomingCall(null);
    setActiveCallUser(null);
    setCallMode('video');
    updateCallScope('direct');
    activeCallIdRef.current = null;
  }, [updateCallScope]);

  const releaseAllConnections = useCallback(() => {
    const peerIds = Array.from(peerConnectionsRef.current.keys());
    peerIds.forEach((peerId) => closePeerConnection(peerId));

    peerConnectionsRef.current.clear();
    pendingCandidatesRef.current.clear();

    remoteParticipantsRef.current.forEach((item) => {
      if (item?.stream) {
        stopTracks(item.stream);
      }
    });
    remoteParticipantsRef.current.clear();
    syncRemoteParticipants();

    directRemoteStreamRef.current = null;
    attachDirectRemotePreview();

    stopTracks(localStreamRef.current);
    localStreamRef.current = null;
    localMediaModeRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    setIsMuted(false);
    setIsCameraOff(false);
  }, [attachDirectRemotePreview, closePeerConnection, stopTracks, syncRemoteParticipants]);

  const ensureLocalMedia = useCallback(async (mode = 'video') => {
    const requestedMode = normalizeCallMode(mode);

    if (localStreamRef.current && localMediaModeRef.current === requestedMode) {
      attachLocalPreview();
      return localStreamRef.current;
    }

    if (localStreamRef.current) {
      stopTracks(localStreamRef.current);
      localStreamRef.current = null;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video:
        requestedMode === 'video'
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          : false,
    });

    localStreamRef.current = stream;
    localMediaModeRef.current = requestedMode;
    setIsCameraOff(requestedMode === 'audio');
    attachLocalPreview();
    return stream;
  }, [attachLocalPreview, stopTracks]);

  const flushPendingCandidates = useCallback(async (userId) => {
    const peerId = String(userId || '');
    if (!peerId) return;

    const pc = peerConnectionsRef.current.get(peerId);
    if (!pc || !pc.remoteDescription) return;

    const queue = pendingCandidatesRef.current.get(peerId) || [];
    while (queue.length > 0) {
      const candidate = queue.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Failed to add ICE candidate:', error);
      }
    }

    pendingCandidatesRef.current.set(peerId, queue);
  }, []);

  const createPeerConnection = useCallback((targetUserId, targetUsername) => {
    const peerId = String(targetUserId || '');
    if (!peerId) return null;

    const pc = new RTCPeerConnection(RTC_CONFIGURATION);
    peerConnectionsRef.current.set(peerId, pc);

    if (!pendingCandidatesRef.current.has(peerId)) {
      pendingCandidatesRef.current.set(peerId, []);
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream) return;

      if (callScopeRef.current === 'group') {
        remoteParticipantsRef.current.set(peerId, {
          id: peerId,
          username: targetUsername || 'Participant',
          stream,
        });
        syncRemoteParticipants();
      } else {
        directRemoteStreamRef.current = stream;
        attachDirectRemotePreview();
      }
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate || !socket) return;

      socket.emit('call:ice-candidate', {
        toUserId: peerId,
        candidate: event.candidate,
        callId: activeCallIdRef.current,
      });
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === 'connected') {
        setCallState('connected');
      }

      if (isConnectionEnded(state)) {
        closePeerConnection(peerId);

        if (peerConnectionsRef.current.size === 0) {
          releaseAllConnections();
          resetCallState();
        }
      }
    };

    return pc;
  }, [attachDirectRemotePreview, closePeerConnection, releaseAllConnections, resetCallState, socket, syncRemoteParticipants]);

  const startCall = useCallback(async (targetUser, mode = 'video') => {
    if (!socket || !targetUser || !targetUser.id) {
      return;
    }

    try {
      const normalizedMode = normalizeCallMode(mode);

      clearCallError();
      releaseAllConnections();
      resetCallState();

      updateCallScope('direct');
      setCallMode(normalizedMode);
      setCallState('outgoing');
      setActiveCallUser({ id: String(targetUser.id), username: targetUser.username });

      const callId = `direct-${currentUser?.id || 'caller'}-${Date.now()}`;
      activeCallIdRef.current = callId;

      await ensureLocalMedia(normalizedMode);
      const pc = createPeerConnection(targetUser.id, targetUser.username);
      if (!pc) {
        throw new Error('Could not initialize call connection');
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call:offer', {
        toUserId: String(targetUser.id),
        offer,
        callMode: normalizedMode,
        callId,
      });

      setCallState('connecting');
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallError(error.message || 'Unable to start call');
      releaseAllConnections();
      resetCallState();
    }
  }, [clearCallError, createPeerConnection, currentUser?.id, ensureLocalMedia, releaseAllConnections, resetCallState, socket, updateCallScope]);

  const startAudioCall = useCallback((targetUser) => {
    return startCall(targetUser, 'audio');
  }, [startCall]);

  const startGroupCall = useCallback(async ({ targets = [], mode = 'video' }) => {
    if (!socket) return;

    const normalizedMode = normalizeCallMode(mode);
    const filteredTargets = (targets || [])
      .map((target) => ({
        id: String(target.id),
        username: target.username || 'Participant',
      }))
      .filter((target) => target.id && target.id !== String(currentUser?.id));

    if (!filteredTargets.length) {
      setCallError('No online participants available for group call');
      return;
    }

    try {
      clearCallError();
      releaseAllConnections();
      resetCallState();

      updateCallScope('group');
      setCallMode(normalizedMode);
      setCallState('outgoing');
      setActiveCallUser({ id: 'general-group', username: 'General Group' });

      const callId = `group-${currentUser?.id || 'host'}-${Date.now()}`;
      activeCallIdRef.current = callId;

      await ensureLocalMedia(normalizedMode);

      for (const target of filteredTargets) {
        const pc = createPeerConnection(target.id, target.username);
        if (!pc) {
          continue;
        }

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('call:offer', {
          toUserId: target.id,
          offer,
          callMode: normalizedMode,
          callId,
        });
      }

      setCallState('connecting');
    } catch (error) {
      console.error('Failed to start group call:', error);
      setCallError(error.message || 'Unable to start group call');
      releaseAllConnections();
      resetCallState();
    }
  }, [clearCallError, createPeerConnection, currentUser?.id, ensureLocalMedia, releaseAllConnections, resetCallState, socket, updateCallScope]);

  const acceptIncomingCall = useCallback(async () => {
    if (!socket || !incomingCall) return;

    try {
      const incomingMode = normalizeCallMode(incomingCall.callMode);
      const incomingScope = deriveCallScope(incomingCall.callId);

      clearCallError();
      updateCallScope(incomingScope);
      setCallMode(incomingMode);
      setCallState('connecting');
      setActiveCallUser({
        id: String(incomingCall.fromUserId),
        username: incomingCall.fromUsername,
      });

      activeCallIdRef.current = incomingCall.callId || `direct-${Date.now()}`;

      await ensureLocalMedia(incomingMode);
      const pc = createPeerConnection(incomingCall.fromUserId, incomingCall.fromUsername);
      if (!pc) {
        throw new Error('Could not initialize incoming call connection');
      }

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      await flushPendingCandidates(incomingCall.fromUserId);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('call:answer', {
        toUserId: String(incomingCall.fromUserId),
        answer,
        callMode: incomingMode,
        callId: activeCallIdRef.current,
      });

      setIncomingCall(null);
    } catch (error) {
      console.error('Failed to accept call:', error);
      setCallError(error.message || 'Unable to accept call');
      releaseAllConnections();
      resetCallState();
    }
  }, [clearCallError, createPeerConnection, ensureLocalMedia, flushPendingCandidates, incomingCall, releaseAllConnections, resetCallState, socket, updateCallScope]);

  const rejectIncomingCall = useCallback(() => {
    if (!socket || !incomingCall) return;

    socket.emit('call:reject', {
      toUserId: String(incomingCall.fromUserId),
      callId: incomingCall.callId,
      reason: 'Call declined',
    });

    releaseAllConnections();
    resetCallState();
  }, [incomingCall, releaseAllConnections, resetCallState, socket]);

  const endCall = useCallback(() => {
    if (socket && callState === 'incoming' && incomingCall?.fromUserId) {
      socket.emit('call:reject', {
        toUserId: String(incomingCall.fromUserId),
        callId: incomingCall.callId,
        reason: 'Call declined',
      });
    }

    if (socket && peerConnectionsRef.current.size > 0) {
      for (const peerId of peerConnectionsRef.current.keys()) {
        socket.emit('call:end', {
          toUserId: peerId,
          callId: activeCallIdRef.current,
          reason: callScopeRef.current === 'group' ? 'Group call ended' : 'Call ended',
        });
      }
    }

    releaseAllConnections();
    resetCallState();
  }, [callState, incomingCall, releaseAllConnections, resetCallState, socket]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;

    const nextMuted = !isMuted;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    if (callMode === 'audio') return;
    if (!localStreamRef.current) return;

    const videoTracks = localStreamRef.current.getVideoTracks();
    if (!videoTracks.length) return;

    const nextCameraOff = !isCameraOff;
    videoTracks.forEach((track) => {
      track.enabled = !nextCameraOff;
    });
    setIsCameraOff(nextCameraOff);
  }, [callMode, isCameraOff]);

  useEffect(() => {
    attachLocalPreview();
    attachDirectRemotePreview();
  }, [attachDirectRemotePreview, attachLocalPreview, callState]);

  useEffect(() => {
    if (!socket) return undefined;

    const onCallOffer = (payload) => {
      if (callState !== 'idle') {
        socket.emit('call:reject', {
          toUserId: payload.fromUserId,
          callId: payload.callId,
          reason: 'User busy in another call',
        });
        return;
      }

      clearCallError();
      setIncomingCall(payload);
      setActiveCallUser({
        id: String(payload.fromUserId),
        username: payload.fromUsername,
      });
      updateCallScope(deriveCallScope(payload.callId));
      setCallMode(normalizeCallMode(payload.callMode));
      activeCallIdRef.current = payload.callId || null;
      setCallState('incoming');
    };

    const onCallAnswer = async (payload) => {
      const peerId = String(payload?.fromUserId || '');
      if (!peerId || !payload?.answer) return;

      const pc = peerConnectionsRef.current.get(peerId);
      if (!pc) return;

      try {
        if (payload.callMode) {
          setCallMode(normalizeCallMode(payload.callMode));
        }

        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
        await flushPendingCandidates(peerId);
      } catch (error) {
        console.error('Failed to apply answer:', error);
      }
    };

    const onIceCandidate = async (payload) => {
      const peerId = String(payload?.fromUserId || '');
      if (!peerId || !payload?.candidate) return;

      const pc = peerConnectionsRef.current.get(peerId);
      if (!pc || !pc.remoteDescription) {
        const pending = pendingCandidatesRef.current.get(peerId) || [];
        pending.push(payload.candidate);
        pendingCandidatesRef.current.set(peerId, pending);
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (error) {
        console.error('Failed to apply remote candidate:', error);
      }
    };

    const onCallEnd = (payload) => {
      const peerId = String(payload?.fromUserId || '');

      if (peerId && peerConnectionsRef.current.has(peerId)) {
        closePeerConnection(peerId);
      }

      if (peerConnectionsRef.current.size === 0) {
        releaseAllConnections();
        resetCallState();
      }

      if (payload?.fromUsername) {
        setCallError(`${payload.fromUsername} ended the call`);
      }
    };

    const onCallReject = (payload) => {
      const peerId = String(payload?.fromUserId || '');

      if (peerId && peerConnectionsRef.current.has(peerId)) {
        closePeerConnection(peerId);
      }

      if (payload?.reason) {
        setCallError(payload.reason);
      } else if (payload?.fromUsername) {
        setCallError(`${payload.fromUsername} declined the call`);
      }

      if (peerConnectionsRef.current.size === 0) {
        releaseAllConnections();
        resetCallState();
      }
    };

    const onCallFailed = (payload) => {
      const peerId = String(payload?.toUserId || '');
      if (peerId && peerConnectionsRef.current.has(peerId)) {
        closePeerConnection(peerId);
      }

      setCallError(payload?.reason || 'Call could not be completed');

      if (peerConnectionsRef.current.size === 0) {
        releaseAllConnections();
        resetCallState();
      }
    };

    socket.on('call:offer', onCallOffer);
    socket.on('call:answer', onCallAnswer);
    socket.on('call:ice-candidate', onIceCandidate);
    socket.on('call:end', onCallEnd);
    socket.on('call:reject', onCallReject);
    socket.on('call:failed', onCallFailed);

    return () => {
      socket.off('call:offer', onCallOffer);
      socket.off('call:answer', onCallAnswer);
      socket.off('call:ice-candidate', onIceCandidate);
      socket.off('call:end', onCallEnd);
      socket.off('call:reject', onCallReject);
      socket.off('call:failed', onCallFailed);
    };
  }, [callState, clearCallError, closePeerConnection, flushPendingCandidates, releaseAllConnections, resetCallState, socket, updateCallScope]);

  useEffect(() => {
    return () => {
      if (socket && peerConnectionsRef.current.size > 0) {
        for (const peerId of peerConnectionsRef.current.keys()) {
          socket.emit('call:end', {
            toUserId: peerId,
            callId: activeCallIdRef.current,
            reason: 'Caller left the call',
          });
        }
      }

      releaseAllConnections();
      resetCallState();
    };
  }, [releaseAllConnections, resetCallState, socket]);

  return {
    callState,
    callMode,
    callScope,
    incomingCall,
    activeCallUser,
    remoteParticipants,
    callError,
    clearCallError,
    localVideoRef,
    remoteVideoRef,
    isMuted,
    isCameraOff,
    startCall,
    startAudioCall,
    startGroupCall,
    acceptIncomingCall,
    rejectIncomingCall,
    endCall,
    toggleMute,
    toggleCamera,
  };
};

export default useVideoCall;
