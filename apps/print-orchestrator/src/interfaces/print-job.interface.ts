export interface PrintJobData {
  printerId: string;
  documentId: string;
  documentType?: string;
  priority?: 'low' | 'medium' | 'high';
  copies?: number;
  settings?: {
    orientation?: 'portrait' | 'landscape';
    paperSize?: string;
    color?: boolean;
  };
}

export interface PrintJob {
  id: string;
  printerId: string;
  documentId: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  data: PrintJobData;
}

export interface PrinterInfo {
  id: string;
  status: 'online' | 'offline' | 'maintenance';
  queue: number;
  location?: string;
  model?: string;
}

export interface PrintJobStatus {
  id: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  progress: number;
  printerId: string;
  queuePosition?: number;
  estimatedTime?: number;
}
