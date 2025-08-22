import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { 
  Video,
  VideoOff,
  Mic,
  MicOff,
  Users,
  MessageSquare,
  Share,
  Settings,
  Monitor,
  Phone,
  PhoneOff,
  Hand,
  MoreHorizontal,
  Camera,
  Screen,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  BookOpen,
  Play,
  Pause,
  SkipForward,
  Maximize,
  Minimize,
  AlertCircle,
  CheckCircle,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isHandRaised: boolean;
}

interface VirtualClassroomProps {
  userRole?: 'student' | 'creator' | 'admin';
  isHosting?: boolean;
}

export function VirtualClassroom({ userRole = 'student', isHosting = false }: VirtualClassroomProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [showHostingOptions, setShowHostingOptions] = useState(false);
  const [isCurrentlyHosting, setIsCurrentlyHosting] = useState(isHosting);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  // Clean state - no mock chat messages
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  // Clean state - no mock participants
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Check if we're in a secure context
  const isSecureContext = () => {
    return window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  };



  // Check current permission status
  const checkPermissionStatus = async () => {
    try {
      if (!navigator.permissions) {
        return 'unsupported';
      }
      
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      console.log('Permission status:', {
        camera: cameraPermission.state,
        microphone: micPermission.state,
        secureContext: isSecureContext(),
        hostname: window.location.hostname,
        origin: window.location.origin
      });
      
      return {
        camera: cameraPermission.state,
        microphone: micPermission.state
      };
    } catch (error) {
      console.log('Permission check failed:', error);
      return 'unsupported';
    }
  };

  // Handle media permissions with comprehensive error handling
  const requestMediaPermissions = async () => {
    try {
      setPermissionError(null);
      
      // Check if we're in a secure context first
      if (!isSecureContext()) {
        throw new Error('INSECURE_CONTEXT');
      }
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MEDIA_DEVICES_UNSUPPORTED');
      }
      
      // Log current permission status for debugging
      const permissionStatus = await checkPermissionStatus();
      console.log('Current permission status:', permissionStatus);
      
      // Request media with a timeout
      const mediaPromise = navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      // Add timeout to catch stuck requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('PERMISSION_TIMEOUT')), 10000);
      });
      
      const stream = await Promise.race([mediaPromise, timeoutPromise]) as MediaStream;
      
      setMediaStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsVideoOn(true);
      setIsMuted(false);
      setIsConnected(true);
      setShowPermissionDialog(false);
      
      toast.success('Camera and microphone access granted! 🎥', {
        description: 'You can now participate in the virtual classroom'
      });
      
    } catch (error: any) {
      console.error('Media access error:', error);
      
      let errorMessage = 'Unable to access camera and microphone';
      let helpText = '';
      
      if (error.message === 'INSECURE_CONTEXT') {
        errorMessage = 'Camera access requires a secure connection (HTTPS)';
        helpText = 'This app needs to be served over HTTPS or localhost to access your camera and microphone.';
      } else if (error.message === 'MEDIA_DEVICES_UNSUPPORTED') {
        errorMessage = 'Your browser doesn\'t support camera access';
        helpText = 'Please use a modern browser like Chrome, Firefox, Safari, or Edge.';
      } else if (error.message === 'PERMISSION_TIMEOUT') {
        errorMessage = 'Permission request timed out';
        helpText = 'The browser didn\'t respond to the permission request. Try refreshing the page.';
      } else if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera and microphone access denied';
        helpText = 'Click the 🛡️ or 🔒 icon in your browser\'s address bar and allow camera and microphone access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found';
        helpText = 'Please check that your camera and microphone are properly connected and not being used by another application.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera or microphone is already in use';
        helpText = 'Please close other applications that might be using your camera or microphone, then try again.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera settings not supported';
        helpText = 'Your camera doesn\'t support the required settings. Try with a different camera.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Security error accessing media devices';
        helpText = 'This might be due to browser security policies. Make sure you\'re on a secure connection.';
      }
      
      setPermissionError(`${errorMessage}${helpText ? '\n\n💡 ' + helpText : ''}`);
      
      toast.error('Media Access Error', {
        description: errorMessage
      });
    }
  };

  // Join without video (audio only)
  const joinAudioOnly = async () => {
    try {
      setPermissionError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
      });
      
      setMediaStream(stream);
      setIsVideoOn(false);
      setIsMuted(false);
      setIsConnected(true);
      setShowPermissionDialog(false);
      
      toast.success('Joined with audio only', {
        description: 'You can speak but your camera is off'
      });
      
    } catch (error: any) {
      console.error('Audio access error:', error);
      setPermissionError('Unable to access microphone. You can still view the class.');
      
      // Allow joining as viewer only
      setIsConnected(true);
      setShowPermissionDialog(false);
      setIsVideoOn(false);
      setIsMuted(true);
      
      toast.info('Joined as viewer', {
        description: 'You can view the class but cannot speak or share video'
      });
    }
  };

  // Join as viewer only
  const joinAsViewer = () => {
    setIsConnected(true);
    setShowPermissionDialog(false);
    setIsVideoOn(false);
    setIsMuted(true);
    
    toast.info('Joined as viewer', {
      description: 'You can view the class and participate in chat'
    });
  };

  // Clean up media stream
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  // Auto-show appropriate dialog on component mount and check permissions
  useEffect(() => {
    if (!isConnected) {
      const timer = setTimeout(async () => {
        // Check current permission status
        const permissionStatus = await checkPermissionStatus();
        
        if (permissionStatus !== 'unsupported' && 
            (permissionStatus.camera === 'denied' || permissionStatus.microphone === 'denied')) {
          setPermissionError(
            `Camera and microphone access is currently blocked in your browser.

🚫 Current Status:
• Camera: ${permissionStatus.camera}
• Microphone: ${permissionStatus.microphone}

🔧 To fix this, you need to reset permissions in your browser:`
          );
        }
        
        if (userRole === 'creator') {
          setShowHostingOptions(true);
        } else {
          setShowPermissionDialog(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, userRole]);

  // Handle starting a new session as host
  const startHostingSession = async () => {
    try {
      setPermissionError(null);
      
      // Check secure context for hosting
      if (!isSecureContext()) {
        throw new Error('INSECURE_CONTEXT');
      }
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MEDIA_DEVICES_UNSUPPORTED');
      }
      
      // Log permission status for debugging
      const permissionStatus = await checkPermissionStatus();
      console.log('Host permission check:', permissionStatus);
      
      const mediaPromise = navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Add timeout for hosting requests too
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('PERMISSION_TIMEOUT')), 10000);
      });
      
      const stream = await Promise.race([mediaPromise, timeoutPromise]) as MediaStream;
      
      setMediaStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsVideoOn(true);
      setIsMuted(false);
      setIsConnected(true);
      setIsCurrentlyHosting(true);
      setShowHostingOptions(false);
      setShowPermissionDialog(false);
      
      // Add yourself as host participant
      setParticipants([{
        id: 'host-you',
        name: 'You (Host)',
        isHost: true,
        isMuted: false,
        isVideoOn: true,
        isHandRaised: false
      }]);
      
      toast.success('Live session started! 🎥', {
        description: 'You are now hosting a live virtual classroom session'
      });
      
    } catch (error: any) {
      console.error('Host media access error:', error);
      
      let errorMessage = 'Unable to start hosting - camera and microphone access required';
      let helpText = '';
      
      if (error.message === 'INSECURE_CONTEXT') {
        errorMessage = 'Hosting requires a secure connection (HTTPS)';
        helpText = 'Live streaming needs HTTPS or localhost to access your camera and microphone.';
      } else if (error.message === 'MEDIA_DEVICES_UNSUPPORTED') {
        errorMessage = 'Your browser doesn\'t support live streaming';
        helpText = 'Please use a modern browser like Chrome, Firefox, Safari, or Edge.';
      } else if (error.message === 'PERMISSION_TIMEOUT') {
        errorMessage = 'Permission request timed out';
        helpText = 'The browser didn\'t respond to the permission request. Try refreshing the page.';
      } else if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera and microphone access denied';
        helpText = 'To host live sessions, you need to allow camera and microphone access. Look for a 🛡️ or 🔒 icon in your browser\'s address bar.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found';
        helpText = 'Hosting requires both camera and microphone. Please check your devices are connected.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera or microphone is already in use';
        helpText = 'Please close other video applications (like Zoom, Teams, or OBS) and try again.';
      }
      
      setPermissionError(`${errorMessage}${helpText ? '\n\n💡 ' + helpText : ''}`);
      
      toast.error('Cannot Start Hosting', {
        description: errorMessage
      });
    }
  };

  const toggleVideo = async () => {
    if (!isVideoOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsVideoOn(true);
      } catch (error) {
        toast.error('Cannot access camera');
      }
    } else {
      if (mediaStream) {
        mediaStream.getVideoTracks().forEach(track => track.stop());
      }
      setIsVideoOn(false);
    }
  };

  const toggleMute = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    toast.info(isHandRaised ? 'Hand lowered' : 'Hand raised', {
      description: isHandRaised ? 'You lowered your hand' : 'The instructor will see your raised hand'
    });
  };

  const leaveCall = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    setMediaStream(null);
    setIsConnected(false);
    setIsVideoOn(false);
    setIsMuted(true);
    setIsCurrentlyHosting(false);
    setParticipants([]);
    
    if (userRole === 'creator') {
      setShowHostingOptions(true);
    } else {
      setShowPermissionDialog(true);
    }
    
    toast.info(isCurrentlyHosting ? 'Ended hosting session' : 'Left the virtual classroom');
  };

  // Permission Dialog Component for Students
  const PermissionDialog = () => (
    <AlertDialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-purple-500" />
            Join Virtual Classroom
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>Choose how you'd like to participate in this live class session.</p>
              
              {permissionError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Camera & Microphone Access Issue</h4>
                      <div className="text-sm text-red-600 dark:text-red-300 whitespace-pre-line">
                        {permissionError}
                      </div>
                      <details className="mt-3">
                        <summary className="text-xs text-red-500 dark:text-red-400 cursor-pointer hover:underline">
                          🔧 Advanced Troubleshooting
                        </summary>
                        <div className="mt-2 text-xs text-red-500 dark:text-red-400 space-y-1">
                          <p>• Make sure this page is loaded over HTTPS or localhost</p>
                          <p>• Check that no other apps are using your camera/microphone</p>
                          <p>• Try refreshing the page and clicking "Allow" when prompted</p>
                          <p>• In Chrome: Click the 🔒/🛡️ icon → Site settings → Allow Camera & Microphone</p>
                          <p>• In Firefox: Click the 🛡️ icon → Permissions → Allow Camera & Microphone</p>
                          <p>• In Safari: Safari menu → Settings → Websites → Camera/Microphone → Allow</p>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <h4 className="font-medium">Participation Options:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li><strong>Full Participation:</strong> Camera and microphone access</li>
                  <li><strong>Audio Only:</strong> Microphone access only</li>
                  <li><strong>View Only:</strong> Watch and chat without speaking</li>
                </ol>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={requestMediaPermissions} 
              className="flex-1 bg-gradient-to-r from-purple-500 to-orange-500"
            >
              <Camera className="h-4 w-4 mr-2" />
              Join with Camera
            </Button>
            <Button 
              onClick={joinAudioOnly} 
              variant="outline" 
              className="flex-1"
            >
              <Mic className="h-4 w-4 mr-2" />
              Audio Only
            </Button>
            <Button onClick={joinAsViewer} variant="secondary" className="flex-1">
              <Monitor className="h-4 w-4 mr-2" />
              View Only
            </Button>
          </div>
          
          <Button 
            onClick={async () => {
              const status = await checkPermissionStatus();
              const info = {
                permissionAPI: !!navigator.permissions,
                mediaDevices: !!navigator.mediaDevices,
                getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
                secureContext: isSecureContext(),
                protocol: window.location.protocol,
                hostname: window.location.hostname,
                userAgent: navigator.userAgent.substring(0, 100),
                permissions: status
              };
              
              console.log('🔍 Media Debug Info:', info);
              
              toast.info('Debug info logged to console', {
                description: 'Open browser dev tools (F12) to see detailed information'
              });
            }}
            variant="ghost" 
            size="sm"
            className="text-xs opacity-70 hover:opacity-100"
          >
            🔍 Debug Media Access
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Hosting Options Dialog for Creators
  const HostingOptionsDialog = () => (
    <AlertDialog open={showHostingOptions} onOpenChange={setShowHostingOptions}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-orange-500" />
            Host Live Session
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>As a course creator, you can start a new live virtual classroom session or join an existing one.</p>
              
              {permissionError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Camera & Microphone Access Issue</h4>
                      <div className="text-sm text-red-600 dark:text-red-300 whitespace-pre-line">
                        {permissionError}
                      </div>
                      <details className="mt-3">
                        <summary className="text-xs text-red-500 dark:text-red-400 cursor-pointer hover:underline">
                          🔧 Advanced Troubleshooting
                        </summary>
                        <div className="mt-2 text-xs text-red-500 dark:text-red-400 space-y-1">
                          <p>• Make sure this page is loaded over HTTPS or localhost</p>
                          <p>• Check that no other apps are using your camera/microphone</p>
                          <p>• Try refreshing the page and clicking "Allow" when prompted</p>
                          <p>• In Chrome: Click the 🔒/🛡️ icon → Site settings → Allow Camera & Microphone</p>
                          <p>• In Firefox: Click the 🛡️ icon → Permissions → Allow Camera & Microphone</p>
                          <p>• In Safari: Safari menu → Settings → Websites → Camera/Microphone → Allow</p>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <h4 className="font-medium">Hosting Options:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li><strong>Start New Session:</strong> Begin hosting with camera and microphone</li>
                  <li><strong>Join as Participant:</strong> Join an existing session as a regular participant</li>
                </ol>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={startHostingSession} 
              className="flex-1 bg-gradient-to-r from-purple-500 to-orange-500"
            >
              <Play className="h-4 w-4 mr-2" />
              Start New Session
            </Button>
            <Button 
              onClick={() => { setShowHostingOptions(false); setShowPermissionDialog(true); }} 
              variant="outline" 
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Join as Participant
            </Button>
          </div>
          
          <Button 
            onClick={async () => {
              const status = await checkPermissionStatus();
              const info = {
                permissionAPI: !!navigator.permissions,
                mediaDevices: !!navigator.mediaDevices,
                getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
                secureContext: isSecureContext(),
                protocol: window.location.protocol,
                hostname: window.location.hostname,
                userAgent: navigator.userAgent.substring(0, 100),
                permissions: status
              };
              
              console.log('🔍 Hosting Debug Info:', info);
              
              toast.info('Debug info logged to console', {
                description: 'Open browser dev tools (F12) to see detailed information'
              });
            }}
            variant="ghost" 
            size="sm"
            className="text-xs opacity-70 hover:opacity-100"
          >
            🔍 Debug Hosting Setup
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (!isConnected) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-purple-50/30 to-orange-50/30 dark:from-purple-950/30 dark:to-orange-950/30">

        
        <PermissionDialog />
        <HostingOptionsDialog />
        
        {/* Waiting Room */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Virtual Classroom</CardTitle>
              <CardDescription>
                {userRole === 'creator' ? 'Ready to host • Start a new session' : 'No active sessions • Join when available'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Status:</strong> No active virtual classroom sessions
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Participants:</strong> {participants.length} online
                </p>
                <p className="text-sm text-muted-foreground">
                  {userRole === 'creator' 
                    ? 'You can start a new live session or join as a participant'
                    : 'Sessions will be scheduled by instructors'
                  }
                </p>
              </div>
              
              <Button 
                onClick={() => userRole === 'creator' ? setShowHostingOptions(true) : setShowPermissionDialog(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-orange-500"
              >
                {userRole === 'creator' ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Host Session
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    Join Classroom
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Main Video Area */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Main Video - Host Area */}
            <Card className="relative overflow-hidden bg-black">
              {isCurrentlyHosting ? (
                <div className="aspect-video bg-gradient-to-br from-purple-600 to-orange-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-4 text-white animate-pulse" />
                    <h3 className="font-semibold text-white">You are hosting</h3>
                    <p className="text-sm text-gray-200 mt-2">Live session is active • Students can join</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-semibold text-gray-400">No Host Connected</h3>
                    <p className="text-sm text-gray-500 mt-2">Waiting for instructor to start session</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                {isCurrentlyHosting ? (
                  <Badge className="bg-gradient-to-r from-purple-500 to-orange-500 text-white">
                    <Play className="h-3 w-3 mr-1" />
                    Live Session
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-black/50 text-gray-400 border-gray-600">
                    <VideoOff className="h-3 w-3 mr-1" />
                    No Session
                  </Badge>
                )}
              </div>
            </Card>

            {/* Your Video */}
            <Card className="relative overflow-hidden bg-black">
              {isVideoOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarFallback>YOU</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold">You</h3>
                    <p className="text-sm text-gray-400">Camera is off</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                {isMuted && (
                  <Badge variant="destructive" className="bg-red-500/80">
                    <MicOff className="h-3 w-3 mr-1" />
                    Muted
                  </Badge>
                )}
                {isHandRaised && (
                  <Badge className="bg-yellow-500/80 text-black">
                    <Hand className="h-3 w-3 mr-1" />
                    Hand Raised
                  </Badge>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
          {/* Participants & Chat Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <Button
              variant={showParticipants ? "secondary" : "ghost"}
              onClick={() => { setShowParticipants(true); setShowChat(false); }}
              className="flex-1 rounded-none"
            >
              <Users className="h-4 w-4 mr-2" />
              Participants ({participants.length})
            </Button>
            <Button
              variant={showChat ? "secondary" : "ghost"}
              onClick={() => { setShowChat(true); setShowParticipants(false); }}
              className="flex-1 rounded-none"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {showParticipants && (
              <ScrollArea className="h-full p-4">
                <div className="space-y-3">
                  {participants.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No participants yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Participants will appear here when they join
                      </p>
                    </div>
                  ) : (
                    participants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>{participant.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{participant.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {participant.isHost && (
                              <Badge variant="secondary" className="text-xs">Host</Badge>
                            )}
                            {participant.isMuted && (
                              <MicOff className="h-3 w-3 text-red-500" />
                            )}
                            {!participant.isVideoOn && (
                              <VideoOff className="h-3 w-3 text-gray-500" />
                            )}
                            {participant.isHandRaised && (
                              <Hand className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}

            {showChat && (
              <div className="h-full flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No messages yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Chat will appear here during live sessions
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((message) => (
                        <div key={message.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{message.sender}</span>
                            {message.isHost && (
                              <Badge variant="secondary" className="text-xs">Host</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
                    />
                    <Button size="sm">Send</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">00:00 / 00:00</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="sm"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            <Button
              variant={isVideoOn ? "secondary" : "outline"}
              size="sm"
              onClick={toggleVideo}
            >
              {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>

            <Button
              variant={isHandRaised ? "default" : "outline"}
              size="sm"
              onClick={toggleHandRaise}
            >
              <Hand className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm">
              <Share className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 bg-gray-600" />

            <Button
              variant="destructive"
              size="sm"
              onClick={leaveCall}
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}