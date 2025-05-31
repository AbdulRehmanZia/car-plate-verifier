'use client';

import type { VehicleDetails } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Users, Car, Palette, UserCircle, CalendarDays, Cog, ScanText, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VehicleInfoCardProps {
  details: VehicleDetails;
  className?: string;
}

export function VehicleInfoCard({ details, className }: VehicleInfoCardProps) {
  const getStatusIconAndStyle = () => {
    switch (details.status) {
      case 'Government Registered':
        return { icon: <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />, style: 'bg-green-100 text-green-700 border-green-500', label: 'Government Registered' };
      case 'Private/Commercial':
        return { icon: <Users className="h-5 w-5 mr-2 text-blue-500" />, style: 'bg-blue-100 text-blue-700 border-blue-500', label: 'Private / Commercial' };
      case 'Not Found':
        return { icon: <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />, style: 'bg-orange-100 text-orange-700 border-orange-500', label: 'Not Found' };
      case 'Invalid Plate Number':
        return { icon: <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />, style: 'bg-red-100 text-red-700 border-red-500', label: 'Invalid Plate' };
      default:
        return { icon: <AlertTriangle className="h-5 w-5 mr-2 text-gray-500" />, style: 'bg-gray-100 text-gray-700 border-gray-500', label: details.status };
    }
  };

  const statusInfo = getStatusIconAndStyle();

  const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string }) => (
    <div className="flex items-center text-sm py-2 border-b border-border last:border-b-0">
      <div className="flex items-center w-1/3 text-muted-foreground">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="w-2/3">
        {value || 'N/A'}
      </div>
    </div>
  );

  return (
    <Card className={cn("shadow-xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-headline text-primary">
          Vehicle Details for: {details.plateNumber}
        </CardTitle>
        <CardDescription>
          Registration information retrieved from simulated MTMIS.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Badge variant="outline" className={cn("text-lg px-4 py-2 w-full justify-center", statusInfo.style)}>
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </div>

        {details.status !== 'Not Found' && details.status !== 'Invalid Plate Number' && (
          <div className="space-y-1">
            <DetailItem icon={<UserCircle className="h-4 w-4 mr-2" />} label="Owner" value={details.owner} />
            <DetailItem icon={<Car className="h-4 w-4 mr-2" />} label="Make" value={details.make} />
            <DetailItem icon={<Car className="h-4 w-4 mr-2" />} label="Model" value={details.model} />
            <DetailItem icon={<Palette className="h-4 w-4 mr-2" />} label="Color" value={details.color} />
            <DetailItem icon={<CalendarDays className="h-4 w-4 mr-2" />} label="Registration Date" value={details.registrationDate} />
            <DetailItem icon={<Cog className="h-4 w-4 mr-2" />} label="Engine No." value={details.engineNo} />
            <DetailItem icon={<ScanText className="h-4 w-4 mr-2" />} label="Chassis No." value={details.chassisNo} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
