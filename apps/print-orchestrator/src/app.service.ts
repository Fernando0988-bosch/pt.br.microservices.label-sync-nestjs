import { Injectable } from '@nestjs/common';
import {
  NotFoundException,
  ExternalServiceException,
  BusinessLogicException,
  PrinterConnectionException,
  QueueException,
} from '@pt.br.microservices.label-sync-nestjs/error-handling';
import { CatchErrors, RetryOnError } from '@pt.br.microservices.label-sync-nestjs/error-handling';

@Injectable()
export class AppService {
  private readonly printers = new Map([
    ['HP-001', { id: 'HP-001', status: 'online', queue: 0 }],
    ['HP-002', { id: 'HP-002', status: 'offline', queue: 0 }],
    ['HP-003', { id: 'HP-003', status: 'online', queue: 5 }],
  ]);

  private readonly printJobs = new Map();

  @CatchErrors({
    defaultException: ExternalServiceException,
    logErrors: true,
  })
  @RetryOnError(3, 1000)
  async createPrintJob(printJobData: any) {
    const printer = await this.checkPrinterConnection(printJobData.printerId);

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
      status: 'queued',
      createdAt: new Date(),
      pages: printJobData.pages || 1,
      priority: printJobData.priority || 'normal',
    };

    this.printJobs.set(jobId, job);
    printer.queue += 1;

    return job;
  }

  @CatchErrors({
    defaultException: NotFoundException,
    logErrors: true,
  })
  async getPrintJobStatus(id: string) {
    const job = this.printJobs.get(id);

    if (!job) {
      throw new NotFoundException('Job de impressão', id);
    }

    // Simulate job status changes
    if (job.status === 'queued' && Math.random() > 0.5) {
      job.status = 'printing';
    } else if (job.status === 'printing' && Math.random() > 0.7) {
      job.status = 'completed';
    }

    return job;
  }

  @CatchErrors({
    defaultException: ExternalServiceException,
    logErrors: true,
  })
  @RetryOnError(2, 500)
  async getPrinterStatus(id: string) {
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
      ...printer,
      lastChecked: new Date(),
      paperLevel: Math.floor(Math.random() * 100),
      tonerLevel: Math.floor(Math.random() * 100),
    };
  }

  @CatchErrors({
    defaultException: QueueException,
    logErrors: true,
  })
  async processQueue() {
    const queuedJobs = Array.from(this.printJobs.values()).filter((job) => job.status === 'queued');

    if (queuedJobs.length === 0) {
      throw new BusinessLogicException('Não há jobs na fila para processar');
    }

    // Process up to 3 jobs at once
    const jobsToProcess = queuedJobs.slice(0, 3);
    const processedJobs = [];

    for (const job of jobsToProcess) {
      try {
        await this.processJob(job);
        processedJobs.push(job.id);
      } catch (error) {
        throw new QueueException(`Falha ao processar job ${job.id}: ${error.message}`);
      }
    }

    return {
      processed: processedJobs.length,
      remaining: queuedJobs.length - processedJobs.length,
      processedJobs,
    };
  }

  private async checkPrinterConnection(printerId: string) {
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

    return printer;
  }

  private async processJob(job: any) {
    // Simulate job processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    job.status = 'printing';
    job.startedAt = new Date();

    // Simulate printing time based on pages
    const printingTime = job.pages * 2000; // 2 seconds per page
    await new Promise((resolve) => setTimeout(resolve, printingTime));

    job.status = 'completed';
    job.completedAt = new Date();

    // Update printer queue
    const printer = this.printers.get(job.printerId);
    if (printer && printer.queue > 0) {
      printer.queue -= 1;
    }
  }

  getData(): { message: string } {
    return { message: 'Hello API - Print Orchestrator with Error Handling!' };
  }
}
