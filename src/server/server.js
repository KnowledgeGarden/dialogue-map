import os from 'os';
import path from 'path';
import {SocketCluster} from 'socketcluster';

import {jwtSecret} from './secrets';

const numCpus = os.cpus().length;

const port = process.env.PORT || 3333;

export const options = {
  authKey: jwtSecret,
  logLevel: 1,
  // change this to scale vertically
  workers: process.env.NODE_ENV === 'production' ? numCpus || 1 : 1,
  brokers: 1,
  port,
  appName: 'DialogueMap',
  allowClientPublish: false,
  initController: path.join(__dirname, '/init.js'),
  workerController: path.join(__dirname, '/worker.js'),
  brokerController: path.join(__dirname, '/broker.js'),
  socketChannelLimit: 1000,
  rebootWorkerOnCrash: true
};

export const socketCluster = new SocketCluster(options);
