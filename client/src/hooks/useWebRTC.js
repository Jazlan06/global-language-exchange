// import { useEffect, useRef, useState } from 'react';

// export default function useWebRTC(socket, remoteUserId) {
//     const [localStream, setLocalStream] = useState(null);
//     const [remoteStream, setRemoteStream] = useState(null);
//     const [isAudioEnabled, setIsAudioEnabled] = useState(true);
//     const [isVideoEnabled, setIsVideoEnabled] = useState(true);

//     const peerRef = useRef(null);

//     const startLocalStream = async () => {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         setLocalStream(stream);
//         return stream;
//     };

//     const createPeerConnection = () => {
//         const peer = new RTCPeerConnection({
//             iceServers: [
//                 { urls: 'stun:stun.l.google.com:19302' }
//             ]
//         });

//         peer.ontrack = (event) => {
//             setRemoteStream(new MediaStream([event.track]));
//         };

//         peer.onicecandidate = (event) => {
//             if (event.candidate) {
//                 socket.emit('webrtc_ice_candidate', {
//                     to: remoteUserId,
//                     candidate: event.candidate
//                 });
//             }
//         };

//         return peer;
//     };

//     const startCall = async () => {
//         const stream = await startLocalStream();
//         const peer = createPeerConnection();

//         stream.getTracks().forEach(track => {
//             peer.addTrack(track, stream);
//         });

//         peerRef.current = peer;

//         const offer = await peer.createOffer();
//         await peer.setLocalDescription(offer);

//         socket.emit('webrtc_offer', { to: remoteUserId, offer });
//     };

//     const handleOffer = async ({ offer, from }) => {
//         const stream = await startLocalStream();
//         const peer = createPeerConnection();

//         stream.getTracks().forEach(track => {
//             peer.addTrack(track, stream);
//         });

//         peerRef.current = peer;
//         await peer.setRemoteDescription(new RTCSessionDescription(offer));

//         const answer = await peer.createAnswer();
//         await peer.setLocalDescription(answer);

//         socket.emit('webrtc_answer', { to: from, answer });
//     };

//     const handleAnswer = async ({ answer }) => {
//         await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//     };

//     const handleCandidate = async ({ candidate }) => {
//         try {
//             await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         } catch (err) {
//             console.error('Error adding ICE candidate:', err);
//         }
//     };

//     const endCall = () => {
//         if (peerRef.current) {
//             peerRef.current.close();
//             peerRef.current = null;
//         }

//         localStream?.getTracks().forEach((track) => track.stop());
//         remoteStream?.getTracks().forEach((track) => track.stop());

//         setLocalStream(null);
//         setRemoteStream(null);
//     };

//     const toggleAudio = () => {
//         if (!localStream) return;
//         localStream.getAudioTracks().forEach((track) => {
//             track.enabled = !track.enabled;
//             setIsAudioEnabled(track.enabled);
//         });
//     };

//     const toggleVideo = () => {
//         if (!localStream) return;
//         localStream.getVideoTracks().forEach((track) => {
//             track.enabled = !track.enabled;
//             setIsVideoEnabled(track.enabled);
//         });
//     };

//     return {
//         localStream,
//         remoteStream,
//         isAudioEnabled,
//         isVideoEnabled,
//         startCall,
//         handleOffer,
//         handleAnswer,
//         handleCandidate,
//         endCall,
//         toggleAudio,
//         toggleVideo,
//     };
// }