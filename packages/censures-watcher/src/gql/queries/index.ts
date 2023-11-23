import fs from 'fs';
import path from 'path';

export const events = fs.readFileSync(path.join(__dirname, 'events.gql'), 'utf8');
export const eventsInRange = fs.readFileSync(path.join(__dirname, 'eventsInRange.gql'), 'utf8');
export const getCensuringCount = fs.readFileSync(path.join(__dirname, 'getCensuringCount.gql'), 'utf8');
export const getCensuring = fs.readFileSync(path.join(__dirname, 'getCensuring.gql'), 'utf8');
export const getCensuredByCount = fs.readFileSync(path.join(__dirname, 'getCensuredByCount.gql'), 'utf8');
export const getCensuredBy = fs.readFileSync(path.join(__dirname, 'getCensuredBy.gql'), 'utf8');
export const getStateByCID = fs.readFileSync(path.join(__dirname, 'getStateByCID.gql'), 'utf8');
export const getState = fs.readFileSync(path.join(__dirname, 'getState.gql'), 'utf8');
export const getSyncStatus = fs.readFileSync(path.join(__dirname, 'getSyncStatus.gql'), 'utf8');
