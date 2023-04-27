import fs from 'fs';
import path from 'path';

export const events = fs.readFileSync(path.join(__dirname, 'events.gql'), 'utf8');
export const eventsInRange = fs.readFileSync(path.join(__dirname, 'eventsInRange.gql'), 'utf8');
export const withdrawLimit = fs.readFileSync(path.join(__dirname, 'withdrawLimit.gql'), 'utf8');
export const verifyBalance = fs.readFileSync(path.join(__dirname, 'verifyBalance.gql'), 'utf8');
export const getBatches = fs.readFileSync(path.join(__dirname, 'getBatches.gql'), 'utf8');
export const getBatch = fs.readFileSync(path.join(__dirname, 'getBatch.gql'), 'utf8');
export const getWithdrawn = fs.readFileSync(path.join(__dirname, 'getWithdrawn.gql'), 'utf8');
export const getWithdrawnFromBatch = fs.readFileSync(path.join(__dirname, 'getWithdrawnFromBatch.gql'), 'utf8');
export const getForfeited = fs.readFileSync(path.join(__dirname, 'getForfeited.gql'), 'utf8');
export const hasForfeitedBatch = fs.readFileSync(path.join(__dirname, 'hasForfeitedBatch.gql'), 'utf8');
export const getRemainingStars = fs.readFileSync(path.join(__dirname, 'getRemainingStars.gql'), 'utf8');
export const getConditionsState = fs.readFileSync(path.join(__dirname, 'getConditionsState.gql'), 'utf8');
export const getSyncStatus = fs.readFileSync(path.join(__dirname, 'getSyncStatus.gql'), 'utf8');
export const getStateByCID = fs.readFileSync(path.join(__dirname, 'getStateByCID.gql'), 'utf8');
export const getState = fs.readFileSync(path.join(__dirname, 'getState.gql'), 'utf8');
