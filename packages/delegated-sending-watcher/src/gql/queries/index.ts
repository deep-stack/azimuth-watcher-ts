import fs from 'fs';
import path from 'path';

export const events = fs.readFileSync(path.join(__dirname, 'events.gql'), 'utf8');
export const eventsInRange = fs.readFileSync(path.join(__dirname, 'eventsInRange.gql'), 'utf8');
export const canSend = fs.readFileSync(path.join(__dirname, 'canSend.gql'), 'utf8');
export const getPool = fs.readFileSync(path.join(__dirname, 'getPool.gql'), 'utf8');
export const canReceive = fs.readFileSync(path.join(__dirname, 'canReceive.gql'), 'utf8');
export const getPoolStars = fs.readFileSync(path.join(__dirname, 'getPoolStars.gql'), 'utf8');
export const getInviters = fs.readFileSync(path.join(__dirname, 'getInviters.gql'), 'utf8');
export const getInvited = fs.readFileSync(path.join(__dirname, 'getInvited.gql'), 'utf8');
export const getSyncStatus = fs.readFileSync(path.join(__dirname, 'getSyncStatus.gql'), 'utf8');
export const getStateByCID = fs.readFileSync(path.join(__dirname, 'getStateByCID.gql'), 'utf8');
export const getState = fs.readFileSync(path.join(__dirname, 'getState.gql'), 'utf8');
