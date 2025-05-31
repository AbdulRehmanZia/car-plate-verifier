
'use server';

import { extractLicensePlateFromImage } from '@/ai/flows/extract-license-plate-from-image';
import type { VehicleDetails, ExtractPlateError, ExtractedPlateData, FetchVehicleError } from '@/lib/types';

export async function extractPlateNumberAction(
  photoDataUri: string
): Promise<ExtractedPlateData | ExtractPlateError> {
  try {
    const result = await extractLicensePlateFromImage({ photoDataUri });
    if (!result.isLicensePlateDetected) {
      return { error: 'No license plate detected in the image.', isLicensePlateDetected: false };
    }
    if (!result.licensePlateNumber || result.licensePlateNumber.trim() === '') {
        return { error: 'Could not extract license plate number from the image.', isLicensePlateDetected: true };
    }
    return { 
      licensePlateNumber: result.licensePlateNumber, 
      isLicensePlateDetected: result.isLicensePlateDetected 
    };
  } catch (error) {
    console.error('Error extracting license plate:', error);
    return { error: 'Failed to process image due to an internal error.' };
  }
}

// Mock MTMIS data
const mockDb: Record<string, VehicleDetails> = {
  'ABC-123': {
    plateNumber: 'ABC-123',
    status: 'Government Registered',
    make: 'Toyota',
    model: 'Corolla',
    color: 'White',
    owner: 'Sindh Government',
    registrationDate: '2022-01-15',
    engineNo: 'XYZ12345',
    chassisNo: 'CHASSIS9876',
  },
  'XYZ-789': {
    plateNumber: 'XYZ-789',
    status: 'Private/Commercial',
    make: 'Honda',
    model: 'Civic',
    color: 'Black',
    owner: 'John Doe',
    registrationDate: '2021-07-20',
    engineNo: 'ENG67890',
    chassisNo: 'CHASSIS5432',
  },
  'KHI-007': {
    plateNumber: 'KHI-007',
    status: 'Government Registered',
    make: 'Suzuki',
    model: 'Bolan',
    color: 'Silver',
    owner: 'Karachi Police Department',
    registrationDate: '2020-03-10',
    engineNo: 'SPL007ENG',
    chassisNo: 'SPL007CHS',
  },
  'LHR-456': {
    plateNumber: 'LHR-456',
    status: 'Private/Commercial',
    make: 'Suzuki',
    model: 'Alto',
    color: 'Red',
    owner: 'Jane Smith',
    registrationDate: '2023-02-28',
    engineNo: 'ALTOLHR456',
    chassisNo: 'CHASSISLHR456',
  },
  'ATT-0CK': {
    plateNumber: 'ATT-0CK',
    status: 'Government Registered',
    make: 'Ford',
    model: 'Ranger',
    color: 'Blue',
    owner: 'Punjab Police',
    registrationDate: '2022-11-10',
    engineNo: 'FORDRGR001',
    chassisNo: 'CHASSISRGR001',
  },
  'AKU-787': {
    plateNumber: 'AKU-787',
    status: 'Private/Commercial',
    make: 'Kia',
    model: 'Sportage',
    color: 'Grey',
    owner: 'Ahmad Khan',
    registrationDate: '2021-09-05',
    engineNo: 'KIASPORT787',
    chassisNo: 'CHASSISKIA787',
  },
  'BWP-001': {
    plateNumber: 'BWP-001',
    status: 'Government Registered',
    make: 'Toyota',
    model: 'Hilux',
    color: 'Black',
    owner: 'District Administration BWP',
    registrationDate: '2023-01-01',
    engineNo: 'TOYHLXBWP001',
    chassisNo: 'CHASSISHLXBWP001',
  },
};

export async function fetchVehicleDetailsAction(
  plateNumber: string
): Promise<VehicleDetails | FetchVehicleError> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const normalizedPlate = plateNumber.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (!normalizedPlate || normalizedPlate.length < 3) {
    return { error: 'Invalid license plate number format.' };
  }

  const foundVehicle = Object.values(mockDb).find(
    (vehicle) => vehicle.plateNumber.replace(/[^A-Z0-9]/g, '') === normalizedPlate
  );

  if (foundVehicle) {
    return foundVehicle;
  } else {
    return {
      plateNumber: plateNumber,
      status: 'Not Found',
      make: 'N/A',
      model: 'N/A',
      color: 'N/A',
      owner: 'N/A',
    };
  }
}
