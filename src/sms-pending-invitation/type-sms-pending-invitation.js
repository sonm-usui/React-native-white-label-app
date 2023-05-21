// @flow
import type {CustomError, InitialTestAction, ResetAction,} from '../common/type-common'
import type { InvitationPayload, } from '../invitation/type-invitation'

export const SMSPendingInvitationStatus = {
  NONE: 'NONE',
  FETCH_FAILED: 'FETCH_FAILED',
  RECEIVED: 'RECEIVED',
  SEEN: 'SEEN',
}

export type SMSPendingInvitationStatusType = $Keys<
  typeof SMSPendingInvitationStatus
>

export type InvitationUrl = {
  url: string,
}

export type SMSPendingInvitation = {
  +payload: ?InvitationPayload,
  +status: SMSPendingInvitationStatusType,
  +isFetching: boolean,
  +error?: ?CustomError,
}

export type SMSPendingInvitations = Array<
  SMSPendingInvitation & { invitationToken: string }
>

export type SMSPendingInvitationStore = {
  +[string]: SMSPendingInvitation,
}

export const SMS_PENDING_INVITATION_REQUEST: 'SMS_PENDING_INVITATION_REQUEST' =
  'SMS_PENDING_INVITATION_REQUEST'

export type SMSPendingInvitationRequestAction = {
  type: typeof SMS_PENDING_INVITATION_REQUEST,
  smsToken: string,
}

export const SMS_PENDING_INVITATION_RECEIVED: 'SMS_PENDING_INVITATION_RECEIVED' =
  'SMS_PENDING_INVITATION_RECEIVED'

export type SMSPendingInvitationReceivedAction = {
  type: typeof SMS_PENDING_INVITATION_RECEIVED,
  data: InvitationPayload,
  smsToken: string,
}

export const SMS_PENDING_INVITATION_FAIL: 'SMS_PENDING_INVITATION_FAIL' =
  'SMS_PENDING_INVITATION_FAIL'

export type SMSPendingInvitationFailAction = {
  type: typeof SMS_PENDING_INVITATION_FAIL,
  error: CustomError,
  smsToken: string,
}

export const SMS_PENDING_INVITATION_SEEN: 'SMS_PENDING_INVITATION_SEEN' =
  'SMS_PENDING_INVITATION_SEEN'

export type SMSPendingInvitationSeenAction = {
  type: typeof SMS_PENDING_INVITATION_SEEN,
  smsToken: string,
}

export const SAFE_TO_DOWNLOAD_SMS_INVITATION = 'SAFE_TO_DOWNLOAD_SMS_INVITATION'

export type SafeToDownloadSmsInvitationAction = {
  type: typeof SAFE_TO_DOWNLOAD_SMS_INVITATION,
}

export type SMSPendingInvitationAction =
  | SMSPendingInvitationRequestAction
  | SMSPendingInvitationReceivedAction
  | SMSPendingInvitationFailAction
  | SMSPendingInvitationSeenAction
  | SafeToDownloadSmsInvitationAction
  | InitialTestAction
  | ResetAction
