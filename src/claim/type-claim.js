// @flow

import type {
  CustomError,
  InitialTestAction,
  ResetAction,
  NotificationPayload,
} from '../common/type-common'

export const CLAIM_STORAGE_SUCCESS = 'CLAIM_STORAGE_SUCCESS'
export type ClaimStorageSuccessAction = {
  type: typeof CLAIM_STORAGE_SUCCESS,
  messageId: string,
  claimId: string,
  issueDate: number,
}

export const CLAIM_STORAGE_FAIL = 'CLAIM_STORAGE_FAIL'
export type ClaimStorageFailAction = {
  type: typeof CLAIM_STORAGE_FAIL,
  messageId: string,
  error: CustomError,
}

export const MAP_CLAIM_TO_SENDER = 'MAP_CLAIM_TO_SENDER'
export type MapClaimToSenderAction = {
  type: typeof MAP_CLAIM_TO_SENDER,
  claimUuid: string,
  senderDID: string,
  myPairwiseDID: string,
  logoUrl: string,
  issueDate: number,
  name: string,
  senderName?: string,
}

export const HYDRATE_CLAIM_MAP = 'HYDRATE_CLAIM_MAP'
export type HydrateClaimMapAction = {
  type: typeof HYDRATE_CLAIM_MAP,
  claimMap: ClaimMap,
}

export const HYDRATE_CLAIM_MAP_FAIL = 'HYDRATE_CLAIM_MAP_FAIL'
export type HydrateClaimMapFailAction = {
  type: typeof HYDRATE_CLAIM_MAP_FAIL,
  error: CustomError,
}

export type ClaimPushPayload = {
  connectionHandle: number,
}
export type Claim = NotificationPayload & ClaimPushPayload

export const CLAIM_RECEIVED = 'CLAIM_RECEIVED'
export type ClaimReceivedAction = {
  type: typeof CLAIM_RECEIVED,
  claim: Claim,
}

export type ClaimAction =
  | ClaimStorageSuccessAction
  | ClaimStorageFailAction
  | MapClaimToSenderAction
  | HydrateClaimMapAction
  | HydrateClaimMapFailAction
  | InitialTestAction
  | ResetAction
  | ClaimReceivedAction

export type ClaimMap = {
  +[claimUuid: string]: {
    senderDID: string,
    myPairwiseDID: string,
    logoUrl: string,
    issueDate: number,
    name?: string,
    senderName?: string,
  },
}

export type ClaimStore = {
  +[string]: {
    error?: CustomError,
  },
  claimMap: ClaimMap,
}

export const ERROR_CLAIM_HYDRATE_FAIL = {
  message: 'Failed to hydrate claim map',
  code: 'CL-001',
}

export type ClaimInfo = {
  referent: string,
  schema_id: string,
  attrs: {
    [attrName: string] : string
  },
}
