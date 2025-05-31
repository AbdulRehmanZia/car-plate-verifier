export type VehicleDetails = {
  plateNumber: string;
  status: 'Government Registered' | 'Private/Commercial' | 'Not Found' | 'Invalid Plate Number';
  make?: string;
  model?: string;
  color?: string;
  owner?: string;
  registrationDate?: string;
  engineNo?: string;
  chassisNo?: string;
};

export type ExtractPlateError = {
  error: string;
  isLicensePlateDetected?: boolean;
};

export type ExtractedPlateData = {
  licensePlateNumber: string | null;
  isLicensePlateDetected: boolean;
};

export type FetchVehicleError = {
  error: string;
};
