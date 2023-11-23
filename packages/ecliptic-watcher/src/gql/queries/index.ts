import fs from 'fs';
import path from 'path';

export const events = fs.readFileSync(path.join(__dirname, 'events.gql'), 'utf8');
export const eventsInRange = fs.readFileSync(path.join(__dirname, 'eventsInRange.gql'), 'utf8');
export const supportsInterface = fs.readFileSync(path.join(__dirname, 'supportsInterface.gql'), 'utf8');
export const name = fs.readFileSync(path.join(__dirname, 'name.gql'), 'utf8');
export const symbol = fs.readFileSync(path.join(__dirname, 'symbol.gql'), 'utf8');
export const tokenURI = fs.readFileSync(path.join(__dirname, 'tokenURI.gql'), 'utf8');
export const balanceOf = fs.readFileSync(path.join(__dirname, 'balanceOf.gql'), 'utf8');
export const ownerOf = fs.readFileSync(path.join(__dirname, 'ownerOf.gql'), 'utf8');
export const exists = fs.readFileSync(path.join(__dirname, 'exists.gql'), 'utf8');
export const getApproved = fs.readFileSync(path.join(__dirname, 'getApproved.gql'), 'utf8');
export const isApprovedForAll = fs.readFileSync(path.join(__dirname, 'isApprovedForAll.gql'), 'utf8');
export const getSpawnLimit = fs.readFileSync(path.join(__dirname, 'getSpawnLimit.gql'), 'utf8');
export const canEscapeTo = fs.readFileSync(path.join(__dirname, 'canEscapeTo.gql'), 'utf8');
export const getStateByCID = fs.readFileSync(path.join(__dirname, 'getStateByCID.gql'), 'utf8');
export const getState = fs.readFileSync(path.join(__dirname, 'getState.gql'), 'utf8');
export const getSyncStatus = fs.readFileSync(path.join(__dirname, 'getSyncStatus.gql'), 'utf8');
