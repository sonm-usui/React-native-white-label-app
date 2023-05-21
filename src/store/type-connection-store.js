// @flow
import type {
  AriesAttachedRequest,
  AriesOutOfBandInvite,
  InvitationPayload,
} from '../invitation/type-invitation'
import type { CustomError, GenericObject } from '../common/type-common'

export const UPDATE_CONNECTION_THEME = 'UPDATE_CONNECTION_THEME'
export const UPDATE_STATUS_BAR_THEME = 'UPDATE_STATUS_BAR_THEME'
export const HYDRATE_CONNECTIONS = 'HYDRATE_CONNECTIONS'
export const UPDATE_CONNECTION_SERIALIZED_STATE =
  'UPDATE_CONNECTION_SERIALIZED_STATE'

export type MyPairwiseInfo = {
  myPairwiseDid: string,
  myPairwiseVerKey: string,
  myPairwiseAgentDid: string,
  myPairwiseAgentVerKey: string,
  myPairwisePeerVerKey: string,
  senderDID: string,
  senderName?: string,
}

export type Connection = {
  identifier: string,
  logoUrl: string,
  senderEndpoint: string,
  size?: number,
  senderName?: string,
  vcxSerializedConnection: string,
  publicDID: ?string,
  timestamp?: string,
  attachedRequest?: AriesAttachedRequest,
  isFetching?: boolean,
  isCompleted?: boolean,
} & MyPairwiseInfo

export const DELETE_PENDING_CONNECTION = 'DELETE_PENDING_CONNECTION'

export type DeletePendingConnectionEventAction = {
  type: typeof DELETE_PENDING_CONNECTION,
  identifier: string,
}

export const DELETE_CONNECTION = 'DELETE_CONNECTION'

export type DeleteConnectionEventAction = {
  type: typeof DELETE_CONNECTION,
  senderDID: string,
}

export type Connections = { [identifier: string]: Connection }

export type PairwiseAgent = {
  pw_did: string,
  pw_vk: string,
  agent_did: string,
  agent_vk: string,
}

export type ConnectionStore = {
  // TODO:PS Add specific keys in connection store
  [string]: any,
  data: ?Connections,
  oneTimeConnections?: ?Connections,
  pairwiseAgent?: PairwiseAgent | null,
  locked?: boolean,
}

export const DELETE_CONNECTION_SUCCESS = 'DELETE_CONNECTION_SUCCESS'

export const DELETE_CONNECTION_FAILURE = 'DELETE_CONNECTION_FAILURE'

export type DeleteConnectionSuccessEventAction = {
  type: typeof DELETE_CONNECTION_SUCCESS,
  filteredConnections: Connections,
  senderDID: string,
}

export type DeleteConnectionFailureEventAction = {
  type: typeof DELETE_CONNECTION_FAILURE,
  connection: Connection,
  error: CustomError,
}

export const NEW_CONNECTION = 'NEW_CONNECTION'

export const NEW_PENDING_CONNECTION = 'NEW_PENDING_CONNECTION'

export const NEW_ONE_TIME_CONNECTION = 'NEW_ONE_TIME_CONNECTION'

export const UPDATE_CONNECTION = 'UPDATE_CONNECTION'

export const CONNECTION_REQUEST_SENT = 'CONNECTION_REQUEST_SENT'

export type NewConnectionAction = {
  type: typeof NEW_CONNECTION,
  identifier: string,
  logoUrl?: ?string,
} & InvitationPayload

export type NewConnectionSuccessAction = {
  type: typeof NEW_CONNECTION_SUCCESS,
  identifier: string,
  senderDid: string,
}

export type UpdateConnectionSerializedStateAction = {
  type: typeof UPDATE_CONNECTION_SERIALIZED_STATE,
  identifier: string,
  vcxSerializedConnection: string,
}

export const STORAGE_KEY_THEMES = 'STORAGE_KEY_THEMES'

export type ConnectionThemes = {
  [string]: {
    primary: string,
    secondary: string,
  },
}

export const HYDRATE_CONNECTION_THEMES = 'HYDRATE_CONNECTION_THEMES'

export const SEND_CONNECTION_REDIRECT: 'SEND_CONNECTION_REDIRECT' =
  'SEND_CONNECTION_REDIRECT'
export type SendConnectionRedirectAction = {
  type: typeof SEND_CONNECTION_REDIRECT,
  qrCodeInvitationPayload: InvitationPayload,
  existingConnectionDetails: {
    senderDID: string,
    identifier: string,
  },
}

export const SEND_REDIRECT_SUCCESS = 'SEND_REDIRECT_SUCCESS'

export const SEND_CONNECTION_REUSE: 'SEND_CONNECTION_REUSE' =
  'SEND_CONNECTION_REUSE'
export type SendConnectionReuseAction = {
  type: typeof SEND_CONNECTION_REUSE,
  invite: AriesOutOfBandInvite,
  existingConnectionDetails: {
    senderDID: string,
  },
}

export const SEND_REUSE_SUCCESS = 'SEND_REUSE_SUCCESS'

export const CONNECTION_FAIL: 'CONNECTION_FAIL' = 'CONNECTION_FAIL'

export const connectionFail = (error: CustomError, senderDid: string) => ({
  type: CONNECTION_FAIL,
  error,
  senderDid,
})

export type ConnectionFailAction = {
  type: typeof CONNECTION_FAIL,
  error: string,
  senderDid: string,
}

export const ERROR_CONNECTION = (name: string) => ({
  code: 'CONNECTION-001',
  message: `Failed to establish connection with ${name}. ${name} did not reply. You can try again later.`,
})

export const CONNECTION_ATTACH_REQUEST = 'CONNECTION_ATTACH_REQUEST'
export type ConnectionAttachRequestAction = {
  type: typeof CONNECTION_ATTACH_REQUEST,
  identifier: string,
  request: GenericObject,
}

export const CONNECTION_DELETE_ATTACHED_REQUEST =
  'CONNECTION_DELETE_ATTACHED_REQUEST'

export type ConnectionDeleteAttachedRequestAction = {
  type: typeof CONNECTION_DELETE_ATTACHED_REQUEST,
  identifier: string,
}

export const NEW_CONNECTION_SUCCESS = 'NEW_CONNECTION_SUCCESS'

export const connectionSuccess = (identifier: string, senderDid: string) => ({
  type: NEW_CONNECTION_SUCCESS,
  identifier,
  senderDid,
})

export const DELETE_ONE_TIME_CONNECTION = 'DELETE_ONE_TIME_CONNECTION'
export type DeleteOneTimeConnectionAction = {
  type: typeof DELETE_ONE_TIME_CONNECTION,
  identifier: string,
}

export const DELETE_ONE_TIME_CONNECTION_SUCCESS =
  'DELETE_ONE_TIME_CONNECTION_SUCCESS'
export type DeleteOneTimeConnectionSuccessAction = {
  type: typeof DELETE_ONE_TIME_CONNECTION_SUCCESS,
  identifier: string,
}

export const LOCK_CONNECTIONS = 'LOCK_CONNECTIONS'
export type LockConnectionsAction = {
  type: typeof LOCK_CONNECTIONS,
  identifier: string,
}

export const UNLOCK_CONNECTIONS = 'UNLOCK_CONNECTIONS'
export type UnlockConnectionsAction = {
  type: typeof UNLOCK_CONNECTIONS,
  identifier: string,
}

export const CONNECTION_UPGRADED = 'CONNECTION_UPGRADED'
export type ConnectionUpgradedAction = {
  type: typeof CONNECTION_UPGRADED,
  connection: Connection,
}

/*
 * Pairwise Agent
 * */

export const STORAGE_KEY_PAIRWISE_AGENT = 'STORAGE_KEY_PAIRWISE_AGENT'

export const HYDRATE_PAIRWISE_AGENT = 'HYDRATE_PAIRWISE_AGENT'
export type HydratePairwiseAgentAction = {
  type: typeof HYDRATE_PAIRWISE_AGENT,
  pairwiseAgent: PairwiseAgent,
}

export const RESET_PAIRWISE_AGENT = 'RESET_PAIRWISE_AGENT'
export type ResetPairwiseAgentAction = {
  type: typeof RESET_PAIRWISE_AGENT,
}

export const PAIRWISE_AGENT_CREATED = 'PAIRWISE_AGENT_CREATED'
export type PairwiseAgentCreatedAction = {
  type: typeof PAIRWISE_AGENT_CREATED,
  pairwiseAgent: PairwiseAgent,
}
