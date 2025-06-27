import { Injectable } from '@nestjs/common';
import {
  NotFoundException,
  ExternalServiceException,
  BusinessLogicException,
  PrinterConnectionException,
  QueueException,
} from '@pt.br.microservices.label-sync-nestjs/error-handling';
import { CatchErrors, RetryOnError } from '@pt.br.microservices.label-sync-nestjs/error-handling';
import {
  PrintJobData,
  PrintJob,
  PrintJobStatus,
  PrinterInfo,
} from './interfaces/print-job.interface';

@Injectable()
export class AppService {
  private readonly printers = new Map([
    ['HP-001', { id: 'HP-001', status: 'online', queue: 0 }],
    ['HP-002', { id: 'HP-002', status: 'offline', queue: 0 }],
    ['HP-003', { id: 'HP-003', status: 'online', queue: 5 }],
  ]);

  private readonly printJobs = new Map<string, PrintJob>();

  @CatchErrors({
    defaultException: ExternalServiceException,
    logErrors: true,
  })
  @RetryOnError(3, 1000)
  createPrintJob(printJobData: PrintJobData): PrintJob {
    const printer = this.checkPrinterConnection(printJobData.printerId);

    if (printer.status === 'offline') {
      throw new PrinterConnectionException(`Impressora ${printJobData.printerId} está offline`);
    }

    if (printer.queue >= 10) {
      throw new QueueException(
        `Fila da impressora ${printJobData.printerId} está cheia (${printer.queue}/10)`,
      );
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const job = {
      id: jobId,
      printerId: printJobData.printerId,
      documentId: printJobData.documentId,
      status: 'pending' as const,
      createdAt: new Date(),
      data: printJobData,
    };

    this.printJobs.set(jobId, job);
    printer.queue += 1;

    return job;
  }

  @CatchErrors({
    defaultException: NotFoundException,
    logErrors: true,
  })
  getPrintJobStatus(id: string): PrintJobStatus {
    const job = this.printJobs.get(id);

    if (!job) {
      throw new NotFoundException('Job de impressão', id);
    }

    // Simulate job status changes
    if (job.status === 'pending' && Math.random() > 0.5) {
      job.status = 'printing';
    } else if (job.status === 'printing' && Math.random() > 0.7) {
      job.status = 'completed';
    }

    return {
      id: job.id,
      status: job.status,
      progress: job.status === 'completed' ? 100 : Math.floor(Math.random() * 90),
      printerId: job.printerId,
      queuePosition: job.status === 'pending' ? Math.floor(Math.random() * 5) + 1 : undefined,
      estimatedTime: job.status === 'pending' ? Math.floor(Math.random() * 300) + 30 : undefined,
    };
  }

  @CatchErrors({
    defaultException: ExternalServiceException,
    logErrors: true,
  })
  @RetryOnError(2, 500)
  getPrinterStatus(id: string): PrinterInfo {
    const printer = this.printers.get(id);

    if (!printer) {
      throw new NotFoundException('Impressora', id);
    }

    // Simulate connection check
    if (id === 'error') {
      throw new Error('Printer connection failed');
    }

    // Simulate printer status changes
    if (Math.random() > 0.8) {
      printer.status = printer.status === 'online' ? 'offline' : 'online';
    }

    return {
      id: printer.id,
      status: printer.status as 'online' | 'offline' | 'maintenance',
      queue: printer.queue,
      location: `Floor ${Math.floor(Math.random() * 3) + 1}`,
      model: `HP LaserJet ${printer.id.split('-')[1]}`,
    };
  }

  @CatchErrors({
    defaultException: QueueException,
    logErrors: true,
  })
  processQueue(): { processed: number; remaining: number } {
    const queuedJobs = Array.from(this.printJobs.values()).filter(
      (job) => job.status === 'pending',
    );

    if (queuedJobs.length === 0) {
      throw new BusinessLogicException('Não há jobs na fila para processar');
    }

    // Process up to 3 jobs at once
    const jobsToProcess = queuedJobs.slice(0, 3);
    const processedJobs = [];

    for (const job of jobsToProcess) {
      try {
        this.processJob(job);
        processedJobs.push(job.id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new QueueException(`Falha ao processar job ${job.id}: ${errorMessage}`);
      }
    }

    return {
      processed: processedJobs.length,
      remaining: queuedJobs.length - processedJobs.length,
    };
  }

  private checkPrinterConnection(printerId: string): PrinterInfo {
    const printer = this.printers.get(printerId);

    if (!printer) {
      throw new NotFoundException('Impressora', printerId);
    }

    // Simulate connection issues
    if (printerId === 'HP-ERROR') {
      throw new PrinterConnectionException(
        `Não foi possível conectar com a impressora ${printerId}`,
      );
    }

    return {
      id: printer.id,
      status: printer.status as 'online' | 'offline' | 'maintenance',
      queue: printer.queue,
    };
  }

  private processJob(job: PrintJob): void {
    // Simulate immediate job processing
    job.status = 'printing';

    // Simulate completion
    setTimeout(() => {
      job.status = 'completed';
      job.completedAt = new Date();

      // Update printer queue
      const printer = this.printers.get(job.printerId);
      if (printer && printer.queue > 0) {
        printer.queue -= 1;
      }
    }, 1000);
  }

  getData(): { message: string } {
    return { message: 'Hello API - Print Orchestrator with Error Handling!' };
  }
}
