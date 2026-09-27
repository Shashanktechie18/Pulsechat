import React, { useEffect, useRef } from 'react';

const getCallStatusLabel = (callState, activeCallUser, callMode, callScope, remoteParticipants) => {
  const callTypeLabel = callMode === 'audio' ? 'audio' : 'video';
  const isGroupCall = callScope === 'group';

  if (callState === 'incoming') {
    if (isGroupCall) {
      return `${activeCallUser?.username || 'Someone'} invited you to a group ${callTypeLabel} call`;
    }
    return `${activeCallUser?.username || 'Someone'} is ${callTypeLabel} calling...`;
  }

  if (callState === 'outgoing') {
    if (isGroupCall) {
      return `Starting group ${callTypeLabel} call...`;
    }
    return `Calling ${activeCallUser?.username || 'user'}...`;
  }

  if (callState === 'connecting') {
    if (isGroupCall) {
      return `Connecting with ${remoteParticipants.length || 0} participant${remoteParticipants.length === 1 ? '' : 's'}...`;
    }
    return `Connecting ${callTypeLabel} call...`;
  }

  if (callState === 'connected') {
    if (isGroupCall) {
      return callMode === 'audio' ? 'Live group audio call' : 'Live group video call';
    }
    return callMode === 'audio' ? 'Live audio call' : 'Live video call';
  }

  return '';
};

const GroupVideoTile = ({ stream, username }) => {
  const tileRef = useRef(null);

  useEffect(() => {
    if (tileRef.current) {
      tileRef.current.srcObject = stream || null;
    }
  }, [stream]);

  return (
    <div className="group-video-tile">
      <video ref={tileRef} autoPlay playsInline className="group-video-media" />
      <span className="group-video-label">{username || 'Participant'}</span>
    </div>
  );
};

const GroupAudioStream = ({ stream }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = stream || null;
    }
  }, [stream]);

  return <audio ref={audioRef} autoPlay playsInline className="audio-hidden-media" />;
};

const VideoCallModal = ({
  isOpen,
  callState,
  activeCallUser,
  incomingCall,
  localVideoRef,
  remoteVideoRef,
  isMuted,
  isCameraOff,
  callMode,
  callScope,
  remoteParticipants,
  callError,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleCamera,
  onClearError,
}) => {
  if (!isOpen) {
    return null;
  }

  const normalizedCallMode = callMode === 'audio' ? 'audio' : 'video';
  const isAudioCall = normalizedCallMode === 'audio';
  const isGroupCall = callScope === 'group';
  const showIncomingActions = callState === 'incoming' && incomingCall;
  const inActiveCall = callState === 'connecting' || callState === 'connected' || callState === 'outgoing';

  const callTitle = isGroupCall
    ? activeCallUser?.username || 'General Group Call'
    : activeCallUser?.username || (isAudioCall ? 'Audio Call' : 'Video Call');

  return (
    <div className="video-call-overlay">
      <div className="video-call-card">
        <div className="video-call-header">
          <div>
            <h5 className="mb-1 d-flex align-items-center gap-2">
              <i className={`bi ${isAudioCall ? 'bi-telephone-fill' : 'bi-camera-video-fill'}`}></i>
              {callTitle}
            </h5>
            <small className="text-light-emphasis">
              {getCallStatusLabel(callState, activeCallUser, normalizedCallMode, callScope, remoteParticipants || [])}
            </small>
          </div>
          <button type="button" className="btn btn-sm btn-outline-light" onClick={onEnd}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {callError && (
          <div className="alert alert-warning py-2 mb-3 d-flex justify-content-between align-items-center" role="alert">
            <span>{callError}</span>
            <button type="button" className="btn btn-sm btn-warning ms-2" onClick={onClearError}>
              Dismiss
            </button>
          </div>
        )}

        {isAudioCall ? (
          <div className="video-stage audio-stage">
            <video ref={remoteVideoRef} autoPlay playsInline className="audio-hidden-media" />
            <video ref={localVideoRef} autoPlay muted playsInline className="audio-hidden-media" />

            <div className="audio-avatar-stack">
              <div className="avatar-circle">
                {callTitle.charAt(0).toUpperCase()}
              </div>
              <span className="audio-pulse-ring"></span>
            </div>

            {isGroupCall && (
              <div className="group-audio-members">
                {(remoteParticipants || []).map((participant) => (
                  <span key={participant.id}>{participant.username}</span>
                ))}
              </div>
            )}

            {isGroupCall &&
              (remoteParticipants || []).map((participant) => (
                <GroupAudioStream key={`audio-${participant.id}`} stream={participant.stream} />
              ))}

            <p className="audio-stage-caption">
              {isGroupCall ? 'Echo group voice room is live' : 'WhatsApp-style voice call mode'}
            </p>
          </div>
        ) : isGroupCall ? (
          <div className="video-stage group-video-stage">
            <div className="group-video-grid">
              {(remoteParticipants || []).map((participant) => (
                <GroupVideoTile
                  key={participant.id}
                  stream={participant.stream}
                  username={participant.username}
                />
              ))}

              {(remoteParticipants || []).length === 0 && (
                <div className="group-video-empty">
                  <div className="avatar-circle">#</div>
                  <p>Waiting for participants to join...</p>
                </div>
              )}
            </div>

            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`local-video group-local-video ${isCameraOff ? 'camera-off' : ''}`}
            />
          </div>
        ) : (
          <div className="video-stage">
            <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />

            {!inActiveCall && (
              <div className="video-placeholder">
                <div className="avatar-circle">
                  {(activeCallUser?.username || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`local-video ${isCameraOff ? 'camera-off' : ''}`}
            />
          </div>
        )}

        {showIncomingActions ? (
          <div className="call-action-row">
            <button type="button" className="btn btn-success" onClick={onAccept}>
              <i className={`bi ${isAudioCall ? 'bi-telephone-inbound-fill' : 'bi-telephone-fill'} me-2`}></i>
              Accept
            </button>
            <button type="button" className="btn btn-danger" onClick={onReject}>
              <i className="bi bi-telephone-x-fill me-2"></i>
              Reject
            </button>
          </div>
        ) : (
          <div className="call-action-row">
            <button
              type="button"
              className={`btn ${isMuted ? 'btn-secondary' : 'btn-outline-light'}`}
              onClick={onToggleMute}
              disabled={!inActiveCall}
            >
              <i className={`bi ${isMuted ? 'bi-mic-mute-fill' : 'bi-mic-fill'} me-2`}></i>
              {isMuted ? 'Unmute' : 'Mute'}
            </button>

            {!isAudioCall && (
              <button
                type="button"
                className={`btn ${isCameraOff ? 'btn-secondary' : 'btn-outline-light'}`}
                onClick={onToggleCamera}
                disabled={!inActiveCall}
              >
                <i className={`bi ${isCameraOff ? 'bi-camera-video-off-fill' : 'bi-camera-video-fill'} me-2`}></i>
                {isCameraOff ? 'Camera On' : 'Camera Off'}
              </button>
            )}

            <button type="button" className="btn btn-danger" onClick={onEnd}>
              <i className="bi bi-telephone-x-fill me-2"></i>
              End
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallModal;
