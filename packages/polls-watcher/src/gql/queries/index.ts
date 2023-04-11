import fs from 'fs';
import path from 'path';

export const events = fs.readFileSync(path.join(__dirname, 'events.gql'), 'utf8');
export const eventsInRange = fs.readFileSync(path.join(__dirname, 'eventsInRange.gql'), 'utf8');
export const getUpgradeProposalCount = fs.readFileSync(path.join(__dirname, 'getUpgradeProposalCount.gql'), 'utf8');
export const getDocumentProposalCount = fs.readFileSync(path.join(__dirname, 'getDocumentProposalCount.gql'), 'utf8');
export const hasVotedOnUpgradePoll = fs.readFileSync(path.join(__dirname, 'hasVotedOnUpgradePoll.gql'), 'utf8');
export const hasVotedOnDocumentPoll = fs.readFileSync(path.join(__dirname, 'hasVotedOnDocumentPoll.gql'), 'utf8');
export const getSyncStatus = fs.readFileSync(path.join(__dirname, 'getSyncStatus.gql'), 'utf8');
export const getStateByCID = fs.readFileSync(path.join(__dirname, 'getStateByCID.gql'), 'utf8');
export const getState = fs.readFileSync(path.join(__dirname, 'getState.gql'), 'utf8');
