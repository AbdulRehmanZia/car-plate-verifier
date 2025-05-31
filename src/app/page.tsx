import PlateDetectiveForm from '@/components/plate-detective-form';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-10 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-headline font-bold text-primary sm:text-6xl">
          Plate Detective
        </h1>
        <p className="text-muted-foreground mt-3 text-lg sm:text-xl">
          Karachi Vehicle Registration Checker
        </p>
      </header>
      <PlateDetectiveForm />
       <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Plate Detective. All rights reserved (simulated).</p>
        <p className="mt-1">Powered by Gemini Vision & Firebase (simulated MTMIS).</p>
      </footer>
    </div>
  );
}
