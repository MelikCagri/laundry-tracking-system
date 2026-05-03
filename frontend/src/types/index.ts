export interface Machine {
  id: string;
  type: 'Laundry' | 'Dryer';
  status: 'Empty' | 'Full' | 'Finished' | 'Broken';
  floorNumber: number;
  endTime?: Date;
  userNote?: string;
}
