import fs from 'fs';
import path from 'path';

export const events = fs.readFileSync(path.join(__dirname, 'events.gql'), 'utf8');
export const eventsInRange = fs.readFileSync(path.join(__dirname, 'eventsInRange.gql'), 'utf8');
export const isActive = fs.readFileSync(path.join(__dirname, 'isActive.gql'), 'utf8');
export const getKeyRevisionNumber = fs.readFileSync(path.join(__dirname, 'getKeyRevisionNumber.gql'), 'utf8');
export const hasBeenLinked = fs.readFileSync(path.join(__dirname, 'hasBeenLinked.gql'), 'utf8');
export const isLive = fs.readFileSync(path.join(__dirname, 'isLive.gql'), 'utf8');
export const getContinuityNumber = fs.readFileSync(path.join(__dirname, 'getContinuityNumber.gql'), 'utf8');
export const getSpawnCount = fs.readFileSync(path.join(__dirname, 'getSpawnCount.gql'), 'utf8');
export const hasSponsor = fs.readFileSync(path.join(__dirname, 'hasSponsor.gql'), 'utf8');
export const getSponsor = fs.readFileSync(path.join(__dirname, 'getSponsor.gql'), 'utf8');
export const isSponsor = fs.readFileSync(path.join(__dirname, 'isSponsor.gql'), 'utf8');
export const getSponsoringCount = fs.readFileSync(path.join(__dirname, 'getSponsoringCount.gql'), 'utf8');
export const isEscaping = fs.readFileSync(path.join(__dirname, 'isEscaping.gql'), 'utf8');
export const getEscapeRequest = fs.readFileSync(path.join(__dirname, 'getEscapeRequest.gql'), 'utf8');
export const isRequestingEscapeTo = fs.readFileSync(path.join(__dirname, 'isRequestingEscapeTo.gql'), 'utf8');
export const getEscapeRequestsCount = fs.readFileSync(path.join(__dirname, 'getEscapeRequestsCount.gql'), 'utf8');
export const getOwner = fs.readFileSync(path.join(__dirname, 'getOwner.gql'), 'utf8');
export const isOwner = fs.readFileSync(path.join(__dirname, 'isOwner.gql'), 'utf8');
export const getOwnedPointCount = fs.readFileSync(path.join(__dirname, 'getOwnedPointCount.gql'), 'utf8');
export const getOwnedPointAtIndex = fs.readFileSync(path.join(__dirname, 'getOwnedPointAtIndex.gql'), 'utf8');
export const getManagementProxy = fs.readFileSync(path.join(__dirname, 'getManagementProxy.gql'), 'utf8');
export const isManagementProxy = fs.readFileSync(path.join(__dirname, 'isManagementProxy.gql'), 'utf8');
export const canManage = fs.readFileSync(path.join(__dirname, 'canManage.gql'), 'utf8');
export const getManagerForCount = fs.readFileSync(path.join(__dirname, 'getManagerForCount.gql'), 'utf8');
export const getSpawnProxy = fs.readFileSync(path.join(__dirname, 'getSpawnProxy.gql'), 'utf8');
export const isSpawnProxy = fs.readFileSync(path.join(__dirname, 'isSpawnProxy.gql'), 'utf8');
export const canSpawnAs = fs.readFileSync(path.join(__dirname, 'canSpawnAs.gql'), 'utf8');
export const getSpawningForCount = fs.readFileSync(path.join(__dirname, 'getSpawningForCount.gql'), 'utf8');
export const getVotingProxy = fs.readFileSync(path.join(__dirname, 'getVotingProxy.gql'), 'utf8');
export const isVotingProxy = fs.readFileSync(path.join(__dirname, 'isVotingProxy.gql'), 'utf8');
export const canVoteAs = fs.readFileSync(path.join(__dirname, 'canVoteAs.gql'), 'utf8');
export const getVotingForCount = fs.readFileSync(path.join(__dirname, 'getVotingForCount.gql'), 'utf8');
export const getTransferProxy = fs.readFileSync(path.join(__dirname, 'getTransferProxy.gql'), 'utf8');
export const isTransferProxy = fs.readFileSync(path.join(__dirname, 'isTransferProxy.gql'), 'utf8');
export const canTransfer = fs.readFileSync(path.join(__dirname, 'canTransfer.gql'), 'utf8');
export const getTransferringForCount = fs.readFileSync(path.join(__dirname, 'getTransferringForCount.gql'), 'utf8');
export const isOperator = fs.readFileSync(path.join(__dirname, 'isOperator.gql'), 'utf8');
export const findClaim = fs.readFileSync(path.join(__dirname, 'findClaim.gql'), 'utf8');
export const getSyncStatus = fs.readFileSync(path.join(__dirname, 'getSyncStatus.gql'), 'utf8');
export const getStateByCID = fs.readFileSync(path.join(__dirname, 'getStateByCID.gql'), 'utf8');
export const getState = fs.readFileSync(path.join(__dirname, 'getState.gql'), 'utf8');
