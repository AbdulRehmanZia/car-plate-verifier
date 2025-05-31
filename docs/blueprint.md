# **App Name**: Plate Detective

## Core Features:

- License Plate Input: Input field for users to enter the license plate number of a vehicle.
- Image-to-Text with Gemini Vision: Use Gemini Vision to analyze uploaded images of license plates, extracting the plate number to pre-fill the input field. The tool uses logic to determine if the license plate appears clearly and correctly in the image before deciding to incorporate the information.
- MTMIS Integration: Backend service to query the MTMIS Sindh database using the license plate number, implemented as a Firebase Cloud Function.
- Government Status Display: Display the vehicle's registration status (Government Registered or Private/Commercial) and basic vehicle details. 

## Style Guidelines:

- Primary color: Dark Blue (#3F51B5) to evoke trust and reliability, befitting a government-related data app.
- Background color: Very light grey (#F0F0F3), suitable for a light scheme
- Accent color: Purple (#7E57C2), used to highlight interactive elements and call-to-actions, creating a distinct visual separation from the primary color.
- Body and headline font: 'Inter' (sans-serif), offering a modern, neutral, and easily readable typeface for both headlines and body text.
- Use simple, clear icons to represent vehicle information and registration status.
- A clean, intuitive layout, optimized for displaying data efficiently. The interface is uncluttered, ensuring the registration status and vehicle details are easily located and understood.
- Subtle animations for loading states and transitions, enhancing user experience without being distracting.