import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { sendEmail } from '../utils/EmailService.js';

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null 
});

export const emailQueue = new Queue('email-queue', { connection });

const worker = new Worker('email-queue', async (job) => {
  const { to, subject, body } = job.data;
  
  console.log(`[Worker] Processing job ${job.id}: Sending email to ${to}...`);
  
  await sendEmail(to, subject, body);
  
  console.log(`[Worker] Job ${job.id} completed!`);
}, { connection });

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} failed: ${err.message}`);
});