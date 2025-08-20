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

export function VirtualClassroom() {
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  // Clean state - no mock chat messages
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  // Clean state - no mock participants
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Handle media permissions with proper error handling
  const requestMediaPermissions = async () => {
    try {
      setPermissionError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setMediaStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsVideoOn(true);
      setIsMuted(false);
      setIsConnected(true);
      setShowPermissionDialog(false);
      
      toast.success('Camera and microphone access granted', {
        description: 'You can now participate in the virtual classroom'
      });
      
    } catch (error: any) {
      console.error('Media access error:', error);
      
      let errorMessage = 'Unable to access camera and microphone';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera and microphone access denied. Please allow permissions in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found. Please check your devices.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera or microphone is being used by another application.';
      }
      
      setPermissionError(errorMessage);
      
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

  // Auto-show permission dialog on component mount
  useEffect(() => {
    if (!isConnected) {
      const timer = setTimeout(() => {
        setShowPermissionDialog(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

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
    setShowPermissionDialog(true);
    
    toast.info('Left the virtual classroom');
  };

  // Permission Dialog Component with fixed DOM structure
  const PermissionDialog = () => (
    <AlertDialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-500" />
            Join Virtual Classroom
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>Choose how you'd like to participate in this live class session.</p>
              
              {permissionError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-200">Permission Error</h4>
                      <p className="text-sm text-red-600 dark:text-red-300 mt-1">{permissionError}</p>
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
        <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button onClick={requestMediaPermissions} className="w-full sm:w-auto">
            <Camera className="h-4 w-4 mr-2" />
            Join with Camera
          </Button>
          <Button onClick={joinAudioOnly} variant="outline" className="w-full sm:w-auto">
            <Mic className="h-4 w-4 mr-2" />
            Audio Only
          </Button>
          <Button onClick={joinAsViewer} variant="secondary" className="w-full sm:w-auto">
            <Monitor className="h-4 w-4 mr-2" />
            View Only
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (!isConnected) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-950/30 dark:to-purple-950/30">
        <PermissionDialog />
        
        {/* Waiting Room */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Virtual Classroom</CardTitle>
              <CardDescription>
                No active sessions • Join when available
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
                  Sessions will be scheduled by instructors
                </p>
              </div>
              
              <Button 
                onClick={() => setShowPermissionDialog(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
              >
                <Video className="h-4 w-4 mr-2" />
                Join Classroom
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
            {/* Main Video - No Active Host */}
            <Card className="relative overflow-hidden bg-black">
              <div className="aspect-video bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-semibold text-gray-400">No Host Connected</h3>
                  <p className="text-sm text-gray-500 mt-2">Waiting for instructor to start session</p>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <Badge variant="secondary" className="bg-black/50 text-gray-400 border-gray-600">
                  <VideoOff className="h-3 w-3 mr-1" />
                  No Session
                </Badge>
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