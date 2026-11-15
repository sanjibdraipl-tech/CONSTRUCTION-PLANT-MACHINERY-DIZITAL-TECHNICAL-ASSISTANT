/**
 * Plant and Machinery - Digital Technical Control Desk Types
 */

export type UserRole =
  | 'Admin'
  | 'Head P&M'
  | 'Project Manager'
  | 'P&M Manager'
  | 'Maintenance Engineer'
  | 'Store Officer'
  | 'Operator'
  | 'Viewer';

export type EquipmentStatus =
  | 'Available'
  | 'Running'
  | 'Idle'
  | 'Under Maintenance'
  | 'Breakdown';

export type EquipmentCategory =
  | 'Earthmoving'
  | 'Road & Paving'
  | 'Concrete & Batching'
  | 'Aggregate & Crushing'
  | 'Foundation & Piling'
  | 'Lifting & Material Handling'
  | 'Power & Utility'
  | 'Transport & Haulage'
  | 'Tunneling & Underground'
  | 'Pipeline Equipment'
  | 'Other';

export type EquipmentType =
  | 'Excavator'
  | 'Wheel Loader'
  | 'Dozer'
  | 'Motor Grader'
  | 'Backhoe Loader'
  | 'Dump Truck'
  | 'Tipper'
  | 'Transit Mixer'
  | 'Batching Plant'
  | 'RMC Plant'
  | 'Hot Mix Plant'
  | 'WMM Plant'
  | 'Crusher Plant'
  | 'Piling Rig'
  | 'Crawler Crane'
  | 'Mobile Crane'
  | 'Gantry Crane'
  | 'Concrete Pump'
  | 'Boom Placer'
  | 'Generator'
  | 'Air Compressor'
  | 'DG Set'
  | 'Roller'
  | 'Water Tanker'
  | 'Fuel Bowser'
  | 'Asphalt Finisher'
  | 'Milling Machine'
  | 'Drilling Machine'
  | 'Tunnel Boring Machine'
  | 'Pipe Layer'
  | 'Launching Girder'
  | 'Other Construction Equipment';

export interface Equipment {
  equipmentId: string; // e.g. EX-01
  assetCode: string; // e.g. AST-2023-EX-001
  category: EquipmentCategory;
  type: EquipmentType;
  make: string; // e.g. Tata Hitachi
  model: string; // e.g. EX210LC
  serialNumber: string;
  engineModel: string;
  engineSerialNumber: string;
  year: number;
  purchaseDate: string;
  purchaseValue: number; // in INR
  currentValue: number; // in INR
  site: string;
  project: string;
  location: string;
  department: string;
  ownershipType: 'Departmental' | 'Hired';
  vendor?: string;
  hireRate?: number; // per month or per hour
  contractNumber?: string;
  hmr: number; // Hour Meter Reading
  km: number;
  capacity: string; // e.g. 1.0 m³ bucket, 160 TPH
  ratedOutput: string; // e.g. 140 HP @ 2000 RPM
  fuelType: 'Diesel' | 'Electric' | 'Dual';
  fuelTankCapacity: number; // in Litres
  averageFuelConsumption: number; // L/Hr or km/L
  lastServiceDate: string;
  nextServiceDate: string;
  pmHours: number; // Next PM due at HMR
  currentStatus: EquipmentStatus;
  operator: string;
  supervisor: string;
  maintenanceEngineer: string;
  criticality: 'Critical' | 'Major' | 'Standard';
  warrantyStatus: 'In Warranty' | 'Expired';
  insuranceStatus: 'Valid' | 'Renew Due' | 'Expired';
  gpsStatus: 'Online' | 'Offline' | 'Not Installed';
  remarks: string;
}

export type PmInterval = '250 H' | '500 H' | '1000 H' | '2000 H' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual' | 'OEM-defined';

export interface PmRecord {
  id: string;
  equipmentId: string;
  equipmentModel: string;
  interval: PmInterval;
  targetHmr: number;
  currentHmr: number;
  dueDate: string;
  status: 'Due' | 'Due Soon' | 'Overdue' | 'Completed';
  lastCompletedDate?: string;
  technicianAssigned?: string;
  checklistItems: { item: string; done: boolean; notes?: string }[];
  sparesRequired: { partName: string; partNumber: string; qty: number }[];
  engineerSignOff?: string;
}

export type BreakdownStage =
  | 'Reported'
  | 'Technical Diagnosis'
  | 'Technician Assignment'
  | 'Inspection'
  | 'Root Cause'
  | 'Spare Requirement'
  | 'Repair in Progress'
  | 'Testing'
  | 'Equipment Release'
  | 'Closed';

export interface BreakdownRecord {
  id: string; // BD-2026-001
  dateTime: string;
  equipmentId: string;
  equipmentModel: string;
  site: string;
  location: string;
  complaint: string;
  failureMode: 'Hydraulic' | 'Engine' | 'Electrical' | 'Transmission' | 'Structural' | 'Pneumatic';
  stage: BreakdownStage;
  downtimeStart: string;
  downtimeEnd?: string;
  totalDowntimeHours: number;
  rootCause?: string;
  actionTaken?: string;
  sparesUsed: { partName: string; partNumber: string; qty: number; cost: number }[];
  technician: string;
  supervisor: string;
  cost: number; // INR
  finalStatus: 'Open' | 'Resolved' | 'Closed';
}

export interface RcaRecord {
  id: string; // RCA-2026-001
  breakdownId?: string;
  equipmentId: string;
  date: string;
  problem: string;
  immediateCause: string;
  rootCause: string;
  contributingCause: string;
  method: '5 Why' | 'Fishbone (6M)' | 'Failure Mode';
  fiveWhys?: string[];
  fishbone?: {
    human: string[];
    machine: string[];
    material: string[];
    method: string[];
    environment: string[];
    maintenance: string[];
  };
  correctiveAction: string;
  preventiveAction: string;
  responsiblePerson: string;
  targetDate: string;
  closureStatus: 'Open' | 'Under Verification' | 'Closed';
}

export interface SparePart {
  partNumber: string;
  partName: string;
  equipmentCategory: EquipmentCategory;
  applicableMakeModel: string;
  category: 'Filter' | 'Hydraulic' | 'Engine' | 'Undercarriage' | 'Electrical' | 'Fastener' | 'Oil & Lubricant';
  openingStock: number;
  receiptQty: number;
  issuedQty: number;
  closingStock: number;
  minimumLevel: number;
  maximumLevel: number;
  reorderLevel: number;
  unitPrice: number; // INR
  supplier: string;
  leadTimeDays: number;
  criticality: 'Vital' | 'Essential' | 'Desirable'; // VED
  abcClass: 'A' | 'B' | 'C';
  movement: 'Fast Moving' | 'Slow Moving' | 'Non Moving';
  binLocation: string;
}

export interface FuelEntry {
  id: string;
  date: string;
  equipmentId: string;
  equipmentModel: string;
  site: string;
  openingFuelLiters: number;
  fuelReceivedLiters: number;
  fuelIssuedLiters: number;
  closingFuelLiters: number;
  operatingHours: number;
  fuelConsumptionLiters: number;
  expectedConsumptionLiters: number;
  varianceLiters: number;
  variancePercentage: number;
  alertType?: 'High Consumption' | 'Abnormal Consumption' | 'Possible Leakage' | 'Possible Fuel Theft' | 'Excessive Idling' | 'Normal';
  alertMessage?: string;
  investigationStatus?: 'Pending' | 'Verified Normal' | 'Under Investigation' | 'Resolved';
}

export interface TyreRecord {
  id: string;
  tyreSerialNumber: string;
  equipmentId: string;
  position: 'FL' | 'FR' | 'RL' | 'RR' | 'Axle 1' | 'Axle 2' | 'Axle 3';
  make: 'MRF' | 'Apollo' | 'JK Tyre' | 'Bridgestone' | 'BKT';
  size: string;
  installationDate: string;
  initialTreadDepthMm: number;
  currentTreadDepthMm: number;
  totalKmRun: number;
  retreadingCycle: number; // 0 = original, 1, 2
  costPerKm: number;
  status: 'Good' | 'Inspect' | 'Retread Due' | 'Scrap';
}

export interface BatteryRecord {
  id: string;
  batterySerialNumber: string;
  equipmentId: string;
  make: 'Exide' | 'Amaron' | 'Tata Green';
  voltageRating: string; // 12V 150Ah
  testedVoltage: number; // e.g. 12.6V
  specificGravity: number; // e.g. 1.260
  installationDate: string;
  warrantyExpiry: string;
  healthStatus: 'Healthy' | 'Charge Required' | 'Degraded' | 'Replace Immediately';
  lastInspectionDate: string;
}

export interface JobCard {
  id: string; // JC-2026-089
  equipmentId: string;
  equipmentModel: string;
  site: string;
  date: string;
  workType: 'PM Service' | 'Breakdown Repair' | 'Retrofit / Overhaul' | 'Welding & Structural';
  assignedMechanics: string[];
  tasks: { task: string; status: 'Pending' | 'In Progress' | 'Completed'; hoursSpent: number }[];
  partsRequested: { partNumber: string; partName: string; qty: number; issued: boolean }[];
  totalLaborHours: number;
  supervisorSignOff: boolean;
  status: 'Open' | 'In Progress' | 'Completed';
}

export interface DailyInspection {
  id: string;
  date: string;
  equipmentId: string;
  operatorName: string;
  shift: 'Shift A (Day)' | 'Shift B (Night)';
  checklist: {
    engineOilLevel: boolean;
    coolantLevel: boolean;
    hydraulicOilLevel: boolean;
    tyrePressureOrTrackTension: boolean;
    leakageInspection: boolean;
    brakeAndSteering: boolean;
    hornAndReverseBuzzer: boolean;
    fireExtinguisherValid: boolean;
  };
  abnormalitiesObserved: string;
  fitForWork: boolean;
}

export interface DailyPlantReportItem {
  equipmentId: string;
  model: string;
  openingHmr: number;
  closingHmr: number;
  runningHours: number;
  idleHours: number;
  breakdownHours: number;
  fuelIssuedLiters: number;
  productionOutput: string;
  availabilityPercent: number;
  utilizationPercent: number;
  maintenanceDone: string;
  remarks: string;
}

export interface DocumentItem {
  id: string;
  folderNumber: string; // e.g. "01_Equipment_Master", "02_OEM_Manuals", etc.
  folderName: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  uploadedBy: string;
  equipmentId?: string;
  project?: string;
  tags: string[];
  isKnowledgeBaseSource?: boolean;
}

export interface KpiMetric {
  id: string;
  name: string;
  category: 'Availability & Utilization' | 'Maintenance & Reliability' | 'Fuel & Energy' | 'Cost & ROI' | 'Productivity';
  value: string | number;
  unit: string;
  target: string | number;
  status: 'Good' | 'Warning' | 'Critical';
  formula: string;
  formulaDescription: string;
  variables: Record<string, string | number>;
}
