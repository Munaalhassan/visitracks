import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, Check, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  currentPhotoUrl?: string | null;
}

export function CameraCapture({ onCapture, currentPhotoUrl }: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsOpen(true);
      setCapturedImage(null);
    } catch (err) {
      console.error('Camera access denied:', err);
      alert('Camera access denied. Please allow camera permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsOpen(false);
  }, []);

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedImage(canvas.toDataURL('image/jpeg', 0.8));
          setCapturedBlob(blob);
          stopCamera();
        }
      },
      'image/jpeg',
      0.8
    );
  }, [stopCamera]);

  const confirmPhoto = useCallback(() => {
    if (capturedBlob) {
      onCapture(capturedBlob);
    }
  }, [capturedBlob, onCapture]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    setCapturedBlob(null);
    startCamera();
  }, [startCamera]);

  const displayUrl = capturedImage || currentPhotoUrl;

  return (
    <div className="space-y-2">
      {displayUrl && !isOpen && (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
          <img src={displayUrl} alt="Visitor" className="w-full h-full object-cover" />
        </div>
      )}

      {isOpen && (
        <div className="relative w-full max-w-xs rounded-lg overflow-hidden border bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full" />
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            <Button size="sm" onClick={takePhoto} className="rounded-full">
              <Camera className="h-4 w-4 mr-1" /> Capture
            </Button>
            <Button size="sm" variant="outline" onClick={stopCamera} className="rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {capturedImage && !isOpen && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={retake}>
            <RotateCcw className="h-4 w-4 mr-1" /> Retake
          </Button>
          <Button size="sm" onClick={confirmPhoto}>
            <Check className="h-4 w-4 mr-1" /> Use Photo
          </Button>
        </div>
      )}

      {!isOpen && !capturedImage && (
        <Button type="button" variant="outline" size="sm" onClick={startCamera}>
          <Camera className="h-4 w-4 mr-1" /> {currentPhotoUrl ? 'Retake Photo' : 'Take Photo'}
        </Button>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
