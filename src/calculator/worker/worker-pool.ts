import { Worker, WorkerOptions } from 'worker_threads';
import { randomUUID } from 'crypto';

interface Task<T = any> {
  id: string;
  data: T;
  resolve: (result: any) => void;
  reject: (error: any) => void;
}

interface ManagedWorker extends Worker {
  busy: boolean;
}

export class WorkerPool {
  private workers: ManagedWorker[];
  private taskQueue: Task[] = [];
  private taskMap: Map<string, Task> = new Map();
  private workerPath: string;

  constructor(workerPath: string, size: number, workerOptions: WorkerOptions = {}) {
    this.workerPath = workerPath;
    this.workers = Array.from({ length: size }, () => this.createWorker(workerOptions));
  }

  private createWorker(options: WorkerOptions): ManagedWorker {
    const worker = new Worker(this.workerPath, options) as ManagedWorker;
    worker.busy = false;

    worker.on('message', (message) => this.handleWorkerMessage(worker, message));
    worker.on('error', (error) => console.error('Worker error:', error));

    return worker;
  }

  private handleWorkerMessage(worker: ManagedWorker, message: any) {
    const { id, result, error } = message;
    const task = this.taskMap.get(id);

    if (task) {
      this.taskMap.delete(id);
      worker.busy = false;
      if (error) {
        task.reject(new Error(error));
      } else {
        task.resolve(result);
      }
      this.processQueue();
    }
  }

  private getAvailableWorker(): ManagedWorker | undefined {
    return this.workers.find((worker) => !worker.busy);
  }

  private processQueue() {
    if (this.taskQueue.length === 0) return;

    const worker = this.getAvailableWorker();
    if (!worker) return;

    const task = this.taskQueue.shift()!;
    this.taskMap.set(task.id, task);

    worker.busy = true;
    worker.postMessage({ id: task.id, data: task.data });
  }

  execute<T>(data: T): Promise<any> {
    const id = randomUUID();
    return new Promise((resolve, reject) => {
      const task: Task = { id, data, resolve, reject };
      this.taskQueue.push(task);
      this.processQueue();
    });
  }

  async terminate(): Promise<void> {
    await Promise.all(this.workers.map((worker) => worker.terminate()));
  }
}
