
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { extractPlateNumberAction, fetchVehicleDetailsAction } from '@/app/actions';
import { VehicleInfoCard } from '@/components/vehicle-info-card';
import type { VehicleDetails, ExtractPlateError, ExtractedPlateData, FetchVehicleError } from '@/lib/types';
import { Camera, Search, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  plateNumber: z.string().min(1, 'License plate number is required.').max(20, 'License plate number is too long.'),
});

type PlateDetectiveFormValues = z.infer<typeof formSchema>;

export default function PlateDetectiveForm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const [capturedImagePreviewUrl, setCapturedImagePreviewUrl] = useState<string | null>(null);
  const [isExtractingFromCapture, setIsExtractingFromCapture] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [fetchDetailsError, setFetchDetailsError] = useState<string | null>(null);

  const { toast } = useToast();

  const form = useForm<PlateDetectiveFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plateNumber: '',
    },
  });

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API is not available in this browser.');
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        let message = 'Please enable camera permissions in your browser settings.';
        if (error instanceof Error && error.name === "NotAllowedError") {
          message = 'Camera access was denied. Please enable permissions in your browser settings.';
        } else if (error instanceof Error && error.name === "NotFoundError") {
          message = 'No camera was found. Please ensure a camera is connected and enabled.';
           setCameraError('No camera found. Please connect a camera.');
        } else {
           setCameraError('Could not access the camera. Check permissions.');
        }
        toast({
          variant: 'destructive',
          title: 'Camera Access Error',
          description: message,
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleCaptureAndExtract = async () => {
    if (!videoRef.current || !hasCameraPermission) {
      setExtractionError("Camera not available or permission denied.");
      return;
    }

    setIsExtractingFromCapture(true);
    setExtractionError(null);
    setVehicleDetails(null);
    setFetchDetailsError(null);
    setCapturedImagePreviewUrl(null);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      setExtractionError("Could not get canvas context for capturing image.");
      setIsExtractingFromCapture(false);
      return;
    }
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUri = canvas.toDataURL('image/jpeg');
    setCapturedImagePreviewUrl(dataUri);
      
    const result = await extractPlateNumberAction(dataUri);
    
    if ('error' in result) {
      const typedError = result as ExtractPlateError;
      setExtractionError(typedError.error);
    } else {
      const typedData = result as ExtractedPlateData;
      if (typedData.licensePlateNumber) {
        form.setValue('plateNumber', typedData.licensePlateNumber, { shouldValidate: true });
        setExtractionError(null); 
      } else {
        setExtractionError('Could not extract plate number from the captured image.');
      }
    }
    setIsExtractingFromCapture(false);
  };

  const onSubmit = async (data: PlateDetectiveFormValues) => {
    setIsFetchingDetails(true);
    setFetchDetailsError(null);
    setVehicleDetails(null);
    setExtractionError(null); // Clear AI error on new search

    try {
      const result = await fetchVehicleDetailsAction(data.plateNumber);
      if ('error' in result) {
        setFetchDetailsError((result as FetchVehicleError).error);
      } else {
        setVehicleDetails(result as VehicleDetails);
      }
    } catch (e) {
      console.error(e);
      setFetchDetailsError('An unexpected error occurred while fetching vehicle details.');
    }
    setIsFetchingDetails(false);
  };

  return (
    <Card className="w-full max-w-lg shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center text-primary">Check Vehicle Registration</CardTitle>
        <CardDescription className="text-center">
          Enter a license plate number manually or use your camera to scan a plate.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <FormLabel>Camera Feed</FormLabel>
              <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden border">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                {hasCameraPermission === null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                    <p className="ml-2 text-white">Accessing camera...</p>
                  </div>
                )}
              </div>
              {cameraError && hasCameraPermission === false && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Camera Error</AlertTitle>
                  <AlertDescription>{cameraError}</AlertDescription>
                </Alert>
              )}
               {hasCameraPermission === false && !cameraError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access in your browser settings to use this feature.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button 
              type="button" 
              onClick={handleCaptureAndExtract}
              className="w-full bg-accent hover:bg-accent/90"
              disabled={!hasCameraPermission || isExtractingFromCapture || isFetchingDetails}
            >
              {isExtractingFromCapture ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Camera className="mr-2 h-5 w-5" />
              )}
              Capture & Analyze Plate
            </Button>

            {isExtractingFromCapture && (
              <div className="flex items-center justify-center text-sm text-muted-foreground p-2">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-accent" />
                Analyzing image...
              </div>
            )}

            {extractionError && !isExtractingFromCapture && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Extraction Error</AlertTitle>
                <AlertDescription>{extractionError}</AlertDescription>
              </Alert>
            )}
            
            {capturedImagePreviewUrl && !isExtractingFromCapture && !extractionError && (
              <div className="mt-4 border rounded-md p-2 bg-secondary/50 flex flex-col items-center">
                 <p className="text-sm text-muted-foreground mb-2">Captured Image Preview:</p>
                <Image src={capturedImagePreviewUrl} alt="Captured license plate preview" width={300} height={150} className="rounded-md object-contain max-h-[150px]" />
              </div>
            )}
            
            <FormField
              control={form.control}
              name="plateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Plate Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ABC-123 or capture from camera" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={isExtractingFromCapture || isFetchingDetails || !form.formState.isValid}
            >
              {isFetchingDetails ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Search className="mr-2 h-5 w-5" />
              )}
              Check Registration
            </Button>
          </CardFooter>
        </form>
      </Form>

      {fetchDetailsError && !isFetchingDetails && (
        <Alert variant="destructive" className="m-6 mt-0">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Fetching Details</AlertTitle>
          <AlertDescription>{fetchDetailsError}</AlertDescription>
        </Alert>
      )}

      {vehicleDetails && !isFetchingDetails && !fetchDetailsError && (
        <div className="p-6 pt-0">
         <VehicleInfoCard details={vehicleDetails} />
        </div>
      )}
    </Card>
  );
}

