export interface User {
  id: string;
  phone: string;
}

export interface Machine {
  id: string;
  block: 'A' | 'C' | 'D' | 'E' | 'F' | 'Villa';
  floor: number;
  type: 'WASHER' | 'DRYER';
  status: 'BOS' | 'DOLU' | 'BITTI' | 'BOZUK';
  activeUserId?: string | null;
  endTime?: string | null; // ISO Date string from backend
  durationMinutes?: number | null;
  userNote?: string | null;
  
  // Custom frontend fields mapped from backend
  _count?: {
    queueEntries: number;
  };
  displayId?: string;
  isCurrentUserInQueue?: boolean;
  queuePosition?: number | null;
}
