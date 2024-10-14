import { parentPort } from 'node:worker_threads';

export interface WorkerMessage {
  id: string;
  data: string;
}

export interface WorkerResponse {
  id: string;
  result?: any;
  error?: string;
}

parentPort?.on('message', (message: WorkerMessage) => {
  try {
    const result = Function(`"use strict"; return (${message.data})`)();
    const response: WorkerResponse = { id: message.id, result };
    parentPort?.postMessage(response);
  } catch (error: any) {
    const response: WorkerResponse = { id: message.id, error: error.message };
    parentPort?.postMessage(response);
  }
});
