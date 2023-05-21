// @flow

import type {
  CustomError,
  GenericObject,
  InitialTestAction,
  NavigationParams,
  ResetAction,
  NotificationPayload,
  MatchingCredential,
  AttributeNames,
} from '../common/type-common'

export const ALLOW_PUSH_NOTIFICATIONS = 'ALLOW_PUSH_NOTIFICATIONS'
export type AllowPushNotificationsAction = {
  type: typeof ALLOW_PUSH_NOTIFICATIONS,
}

export const PUSH_NOTIFICATION_PERMISSION = 'PUSH_NOTIFICATION_PERMISSION'
export type PushNotificationPermissionAction = {
  type: typeof PUSH_NOTIFICATION_PERMISSION,
  isAllowed: boolean,
}

export const PUSH_NOTIFICATION_RECEIVED = 'PUSH_NOTIFICATION_RECEIVED'
export type PushNotificationReceivedAction = {
  type: typeof PUSH_NOTIFICATION_RECEIVED,
  notification: DownloadedNotification,
}

export const SAVE_NOTIFICATION_OPEN_OPTIONS = 'SAVE_NOTIFICATION_OPEN_OPTIONS'

export const PUSH_NOTIFICATION_UPDATE_TOKEN = 'PUSH_NOTIFICATION_UPDATE_TOKEN'
export type PushNotificationUpdateTokenAction = {
  type: typeof PUSH_NOTIFICATION_UPDATE_TOKEN,
  token: string,
}

export const FETCH_ADDITIONAL_DATA = 'FETCH_ADDITIONAL_DATA'
export type FetchAdditionalDataAction = {
  type: typeof FETCH_ADDITIONAL_DATA,
  notificationPayload: NotificationPayload,
  notificationOpenOptions: NotificationOpenOptions,
}

export const FETCH_ADDITIONAL_DATA_PENDING_KEYS =
  'FETCH_ADDITIONAL_DATA_PENDING_KEYS'
export type PendingSetFetchAdditionalDataAction = {
  type: typeof FETCH_ADDITIONAL_DATA_PENDING_KEYS,
  uid: string,
  forDID: string,
}

export const FETCH_ADDITIONAL_DATA_ERROR = 'FETCH_ADDITIONAL_DATA_ERROR'
export type FetchAdditionalDataErrorAction = {
  type: typeof FETCH_ADDITIONAL_DATA_ERROR,
  isPristine: boolean,
  isFetching: boolean,
  error: CustomError,
}

export type PushNotificationAction =
  | AllowPushNotificationsAction
  | PushNotificationPermissionAction
  | PushNotificationReceivedAction
  | PushNotificationUpdateTokenAction
  | FetchAdditionalDataAction
  | FetchAdditionalDataErrorAction
  | InitialTestAction
  | HydratePushTokenAction
  | ResetAction
  | PendingSetFetchAdditionalDataAction

export type DownloadedNotification = {
  additionalData: GenericObject,
  additionalPayloadInfo?: GenericObject,
  type: string,
  uid: string,
  senderLogoUrl?: ?string,
  pushNotifMsgText?: ?string,
  pushNotifMsgTitle?: ?string,
  remotePairwiseDID: string,
  forDID: string,
  notificationOpenOptions?: ?NotificationOpenOptions,
}

export type PushNotificationStore = {
  isAllowed: boolean | null,
  notification: ?DownloadedNotification,
  pushToken: ?string,
  isPristine: boolean,
  isFetching: boolean,
  error: ?CustomError,
  pendingFetchAdditionalDataKey: ?{
    [string]: boolean,
  },
  navigateRoute: ?{
    routeName: string,
    params: GenericObject,
  },
  notificationOpenOptions?: Object | null,
}

export type Attribute = {
  label: string,
  key?: string,
  data?: string,
  values?: AttributeNames,
  logoUrl?: string,
  claimUuid?: string,
  cred_info?: MatchingCredential,
  self_attest_allowed?: boolean,
  p_type?: string,
  p_value?: number,
  type?: string,
  hasCredentialsWithRequestedAttribute?: boolean,
}

export type SelectedAttribute = {
  label: string,
  key: string,
  value?: string,
  claimUuid?: string,
  cred_info?: MatchingCredential,
}

export type AdditionalData = {
  name: string,
  version: string,
  revealedAttributes: Array<Attribute>,
  claimDefinitionSchemaSequenceNumber: number,
  claimDefinitionId?: ?string,
}

export type AdditionalDataPayload = {
  data: AdditionalData,
  issuer: {
    name: string,
    did: string,
  },
  statusMsg?: string,
  price?: ?string,
  ephemeralClaimOffer?: any,
}

export type ClaimOfferPushPayload = {
  msg_type: string,
  version: string,
  to_did: string,
  from_did: string,
  iid?: string,
  mid?: string,
  claim: {
    name: Array<string>,
    date_of_birth: Array<string>,
    height: Array<string>,
  },
  claim_name: string,
  schema_seq_no: number,
  issuer_did: string,
  issuer_name?: string,
  nonce?: string,
  optional_data?: GenericObject,
  remoteName: string,
  price?: ?string,
  claim_def_id?: string | null,
  ephemeralClaimOffer?: any,
}

export type ClaimOfferMessagePayload = {
  msg_type: string,
  version: string,
  to_did: string,
  from_did: string,
  cred_def_id: string,
  claim: {
    [string]: Array<string>,
  },
  claim_name: string,
  schema_seq_no: number,
  issuer_did: string,
  issuer_name?: string,
  remoteName?: string,
}

export type NotificationPayloadInfo = {
  uid: string,
  senderName?: string,
  senderLogoUrl: ?string,
  remotePairwiseDID: string,
  hidden?: boolean,
  autoAccept?: boolean,
  identifier?: string,
}

export type ClaimPushPayload = {
  msg_type: string,
  version: string,
  claim_offer_id: string,
  from_did: string,
  to_did: string,
  claim: {
    [string]: Array<string>,
  },
  schema_seq_no: number,
  issuer_did: string,
  signature: {
    primary_claim: {
      m2: string,
      a: string,
      e: string,
      v: string,
    },
    non_revocation_claim?: GenericObject,
  },
  optional_data?: GenericObject,
}

export type NextPropsPushNotificationNavigator = {
  pushNotification: {
    notification: DownloadedNotification,
    navigateRoute: ?{
      routeName: string,
      params: GenericObject,
    },
  },
  navigateToRoute: (routeName: string, params: NavigationParams) => void,
}

export type PushNotificationNavigatorProps = {
  clearNavigateToRoutePN: () => void,
  updatePayloadToRelevantStoreAndRedirect: (
    notification: DownloadedNotification
  ) => void,
} & NextPropsPushNotificationNavigator

export type UiType = {
  uiType?: ?string,
}

export type RedirectToRelevantScreen = DownloadedNotification & UiType

export type PushNotificationProps = {
  fetchAdditionalData: (
    payload: NotificationPayload,
    options: ?NotificationOpenOptions
  ) => void,
  pushNotificationPermissionAction: (boolean) => void,
  updatePushToken: (string) => void,
  navigateToRoute: (routeName: string, params: NavigationParams) => void,
  isAllowed: boolean,
  pushToken?: string,
  getUnacknowledgedMessages: () => void,
  newMessagesCount?: number,
}

export const HYDRATE_PUSH_TOKEN = 'HYDRATE_PUSH_TOKEN'
export type HydratePushTokenAction = {
  type: typeof HYDRATE_PUSH_TOKEN,
  token: string,
}
export const UPDATE_RELEVANT_PUSH_PAYLOAD_STORE_AND_REDIRECT =
  'UPDATE_RELEVANT_PUSH_PAYLOAD_STORE_AND_REDIRECT'
export type updatePayloadToRelevantStoreAndRedirectAction = {
  type: typeof UPDATE_RELEVANT_PUSH_PAYLOAD_STORE_AND_REDIRECT,
  notification: DownloadedNotification,
}
export const UPDATE_RELEVANT_PUSH_PAYLOAD_STORE =
  'UPDATE_RELEVANT_PUSH_PAYLOAD_STORE'
export type updatePayloadToRelevantStoreAction = {
  type: typeof UPDATE_RELEVANT_PUSH_PAYLOAD_STORE,
  notification: DownloadedNotification,
}

export type NotificationOpenOptions = {
  uid: string,
}
