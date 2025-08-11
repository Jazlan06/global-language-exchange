import React, { useRef, useEffect } from 'react';

const CallWindow = ({
    localStream,
    remoteStream,
    onEndCall,
    onToggleAudio,
    onToggleVideo,
    isAudioEnabled,
    isVideoEnabled,
}) => {
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [localStream, remoteStream]);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
            <div className="relative bg-white rounded-lg p-4 w-full max-w-3xl h-[80vh] shadow-lg flex flex-col">
                <div className="flex-1 relative">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover rounded-md"
                    />
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-40 h-40 object-cover rounded-md absolute bottom-4 right-4 border-2 border-white shadow-lg"
                    />
                </div>

                <div className="flex justify-center space-x-4 mt-4">
                    <button
                        onClick={onToggleAudio}
                        className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                        {isAudioEnabled ? 'Mute' : 'Unmute'}
                    </button>
                    <button
                        onClick={onToggleVideo}
                        className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                        {isVideoEnabled ? 'Stop Video' : 'Start Video'}
                    </button>
                    <button
                        onClick={onEndCall}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                        End Call
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallWindow;