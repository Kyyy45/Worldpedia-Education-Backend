import Queue from 'bull';
import config from './env';

const redisOptions = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  family: 4 
};

export const emailQueue = new Queue('email', {
  redis: redisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

emailQueue.on('completed', (job) => {
  console.log(`✅ Email job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`❌ Email job ${job.id} failed:`, err.message);
});

emailQueue.on('error', (error) => {
  console.error('❌ Queue error:', error.message);
});

export default emailQueue;