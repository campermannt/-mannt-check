// Vehicle types
export type VehicleType = 'Kamper' | 'Przyczepa';

export interface Vehicle {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  registrationNumber: string;
  type: VehicleType;
  dmc: number; // Dopuszczalna Masa Całkowita
  mileage: number;
  lastInspectionDate: string;
  // Physical dimensions (cm)
  heightCm?: number;
  widthCm?: number;
  lengthCm?: number;
  createdAt: string;
  updatedAt: string;
}

// Saved route
export interface SavedRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  fuelCost: number;
  totalCost: number;
  vehicleId: string;
  notes: string;
  savedAt: string;
}

// Checklist categories
export const CHECKLIST_CATEGORIES = [
  'Bezpieczeństwo i dokumenty',
  'Instalacja wodna i gazowa',
  'Zabezpieczenie wnętrza i bagażu',
  'Stan techniczny i opony',
  'Zapasy i kuchnia',
  'Elektronika i akumulatory'
] as const;

export type ChecklistCategory = typeof CHECKLIST_CATEGORIES[number];

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  label: string;
  checked: boolean;
}

export interface Checklist {
  id: string;
  userId: string;
  vehicleId: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

// Maintenance categories
export const MAINTENANCE_CATEGORIES = [
  'Silnik i podwozie',
  'Szczelność zabudowy',
  'Instalacja elektryczna i fotowoltaika',
  'Ogrzewanie i gaz',
  'Układ wodny i sanitarny',
  'Akcesoria (markizy, bagażniki)'
] as const;

export type MaintenanceCategory = typeof MAINTENANCE_CATEGORIES[number];

export interface MaintenanceLog {
  id: string;
  userId: string;
  vehicleId: string;
  category: MaintenanceCategory;
  description: string;
  date: string;
  mileage?: number;
  cost?: number;
  reportedToMannt: boolean;
  createdAt: string;
}

// Onboarding
export interface OnboardingStep {
  step: number;
  title: string;
  content: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    step: 1,
    title: 'Witaj w rodzinie!',
    content: 'Cieszymy się, że jesteś z nami. Mannt Check to Twój cyfrowy opiekun kampera, stworzony z pasji przez zespół Camper Mannt.'
  },
  {
    step: 2,
    title: 'Poznaj Majstra Mannta',
    content: 'Nasz AI doradca mówi ludzkim głosem. Pomoże Ci rozwiązać usterkę na trasie lub podpowie, jak dbać o zabudowę.'
  },
  {
    step: 3,
    title: 'Ruszaj w drogę bez stresu',
    content: 'Dodaj swój pojazd, odznacz checklistę i miej pewność, że wszystko działa. A jeśli coś Cię zaniepokoi – jeden przycisk dzieli Cię od pomocy profesjonalistów.'
  }
];

// App State
export interface AppState {
  user: any | null;
  vehicle: Vehicle | null;
  hasCompletedOnboarding: boolean;
  installPromptShown: boolean;
  actionCount: number;
}

// Travel Calculator
export interface TravelCalculatorInputs {
  distance: number; // km
  fuelConsumption: number; // l/100km
  fuelPrice: number; // PLN/l
  additionalCosts: number; // PLN
}

export interface TravelCalculatorResult {
  fuelCost: number;
  totalCost: number;
  fuelAmount: number;
}
