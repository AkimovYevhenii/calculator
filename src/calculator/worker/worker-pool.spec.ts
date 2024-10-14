import { WorkerPool } from './worker-pool';
import { join } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

describe('WorkerPool', () => {
  const poolSize = 4;
  let workerPool: WorkerPool;
  const workerPath = join(__dirname, '../../../dist/calculator/worker/expression.worker.js');

  beforeEach(() => {
    workerPool = new WorkerPool(workerPath, poolSize);
  });

  afterEach(async () => {
    await workerPool.terminate();
  });

  it('should correctly evaluate a simple expression', async () => {
    const result = await workerPool.execute('2 + 2 * 2');
    expect(result).toBe(6);
  });

  it('should handle 1000 concurrent requests correctly', async () => {
    const expressions = Array.from({ length: 1000 }, (_, i) => `${i} + 1`);
    const promises = expressions.map((expr) => workerPool.execute(expr));
    const results = await Promise.all(promises);

    results.forEach((result, index) => {
      expect(result).toBe(index + 1);
    });
  });

  it('should handle errors from workers', async () => {
    await expect(workerPool.execute('invalid + expression')).rejects.toThrow();
  });
});


describe('WorkerPool Parallel Execution', () => {
  const poolSize = 4;
  let workerPool: WorkerPool;
  let workerPath: string;

  const workerCode = `
    const { parentPort } = require('worker_threads');
    parentPort.on('message', ({ id, delay }) => {
      setTimeout(() => {
        parentPort.postMessage({ id });
      }, delay);
    });
  `;

  beforeAll(() => {
    workerPath = path.join(tmpdir(), 'test-worker.js');
    fs.writeFileSync(workerPath, workerCode);

    const workerOptions: WorkerOptions = {};
    workerPool = new WorkerPool(workerPath, poolSize, workerOptions);
  });

  afterAll(async () => {
    await workerPool.terminate();
    fs.unlinkSync(workerPath);
  });

  it('should execute tasks in parallel', async () => {
    const delays = Array.from({ length: poolSize }, () => 500);
    const start = Date.now();

    const promises = delays.map((delay) =>
      workerPool.execute({ delay })
    );

    await Promise.all(promises);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000);
  });
});