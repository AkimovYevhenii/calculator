import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { WorkerPool } from './worker/worker-pool';
import { join } from 'path';

const POOL_SIZE = 2 as const;
@Injectable()
export class CalculatorService implements OnModuleDestroy {
  private workerPool: WorkerPool;

  constructor() {
    this.workerPool = new WorkerPool(join(__dirname, 'worker/expression.worker.js'), POOL_SIZE);
  }

  async evaluate(expression: string): Promise<number> {
    return this.workerPool.execute(expression);
  }

  async onModuleDestroy() {
    await this.workerPool.terminate();
  }
}