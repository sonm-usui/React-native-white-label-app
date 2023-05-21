// @flow
import { all, call, put, select, spawn, takeEvery } from 'redux-saga/effects'
import delay from '@redux-saga/delay-p'
import type {
  AddSerializedClaimOfferAction,
  ClaimOfferAcceptedAction,
  ClaimOfferAction,
  ClaimOfferDenyAction,
  ClaimOfferPayload,
  ClaimOfferReceivedAction,
  ClaimOfferStore,
  ClaimRequestSuccessAction,
  DeleteClaimAction,
  DeleteClaimSuccessAction,
  DenyOutofbandClaimOfferAction,
  SerializedClaimOffer,
} from './type-claim-offer'
import {
  ADD_SERIALIZED_CLAIM_OFFER,
  CLAIM_OFFER_ACCEPTED,
  CLAIM_OFFER_IGNORED,
  CLAIM_OFFER_RECEIVED,
  CLAIM_OFFER_REJECTED,
  CLAIM_OFFER_SHOW_START,
  CLAIM_OFFER_SHOWN,
  CLAIM_OFFER_STATUS,
  CLAIM_OFFERS,
  CLAIM_REQUEST_FAIL,
  CLAIM_REQUEST_STATUS,
  CLAIM_REQUEST_SUCCESS,
  DELETE_CLAIM,
  DELETE_CLAIM_SUCCESS,
  DENY_CLAIM_OFFER,
  DENY_CLAIM_OFFER_FAIL,
  DENY_CLAIM_OFFER_SUCCESS,
  DENY_OUTOFBAND_CLAIM_OFFER,
  ERROR_HYDRATE_CLAIM_OFFERS,
  ERROR_NO_SERIALIZED_CLAIM_OFFER,
  ERROR_RECEIVE_CLAIM,
  ERROR_SAVE_CLAIM_OFFERS,
  ERROR_SEND_CLAIM_REQUEST,
  HYDRATE_CLAIM_OFFERS_FAIL,
  HYDRATE_CLAIM_OFFERS_SUCCESS,
  INSUFFICIENT_BALANCE,
  OUTOFBAND_CLAIM_OFFER_ACCEPTED,
  PAID_CREDENTIAL_REQUEST_FAIL,
  PAID_CREDENTIAL_REQUEST_SUCCESS,
  RESET_CLAIM_REQUEST_STATUS,
  SAVE_CLAIM_OFFERS_FAIL,
  SAVE_CLAIM_OFFERS_SUCCESS,
  SEND_CLAIM_REQUEST,
  SEND_CLAIM_REQUEST_FAIL,
  SEND_CLAIM_REQUEST_SUCCESS,
  SEND_PAID_CREDENTIAL_REQUEST,
  VCX_CLAIM_OFFER_STATE,
} from './type-claim-offer'
import type {
  AdditionalDataPayload,
  NotificationPayloadInfo,
} from '../push-notification/type-push-notification'
import type { CustomError, GenericObject } from '../common/type-common'
import { RESET } from '../common/type-common'
import {
  getClaimForOffer,
  getClaimOffer,
  getClaimOffers,
  getConnection,
  getConnectionHistory,
  getSerializedClaimOffer,
  getWalletBalance,
} from '../store/store-selector'
import {
  createCredentialWithAriesOfferObject,
  credentialReject,
  deleteCredential,
  getClaimHandleBySerializedClaimOffer,
  getClaimOfferState,
  getCredentialInfo,
  getHandleBySerializedConnection,
  getLedgerFees,
  sendClaimRequest as sendClaimRequestApi,
  serializeClaimOffer,
} from '../bridge/react-native-cxs/RNCxs'
import type {
  ClaimInfo,
  ClaimStorageFailAction,
  ClaimStorageSuccessAction,
} from '../claim/type-claim'
import { CLAIM_STORAGE_FAIL, CLAIM_STORAGE_SUCCESS } from '../claim/type-claim'
import { CLAIM_STORAGE_ERROR } from '../services/error/error-code'
import type { Connection } from '../store/type-connection-store'
import { getHydrationItem, secureSet } from '../services/storage'
import { BigNumber } from 'bignumber.js'
import { refreshWalletBalance } from '../wallet/wallet-store'
import type { LedgerFeesData } from '../ledger/type-ledger-store'
import moment from 'moment'
import { captureError } from '../services/error/error-handler'
import { retrySaga } from '../api/api-utils'
import {
  ensureVcxInitAndPoolConnectSuccess,
  ensureVcxInitSuccess,
} from '../store/route-store'
import {
  ACTION_IS_NOT_SUPPORTED,
  CREDENTIAL_DEFINITION_NOT_FOUND,
  CREDENTIAL_DEFINITION_NOT_FOUND_MESSAGE,
  INVALID_CREDENTIAL_OFFER,
  INVALID_CREDENTIAL_OFFER_MESSAGE,
  SCHEMA_NOT_FOUND,
  SCHEMA_NOT_FOUND_MESSAGE,
} from '../bridge/react-native-cxs/error-cxs'
import { colors } from '../common/styles'
import { checkProtocolStatus } from '../store/protocol-status'
import { isIssuanceCompleted } from '../store/store-utils'
import { customLogger } from '../store/custom-logger'
import { Platform } from 'react-native'
import ImageColors from 'react-native-image-colors'
import { pickAndroidColor, pickIosColor } from '../my-credentials/cards/utils'
import { showSnackError } from '../store/config-store'
import { uuid } from '../services/uuid'
import { claimStorageSuccess, getClaim, mapClaimToSender } from '../claim/claim-store'
import { ensureConnectionsSync } from '../store/connections-store'

const claimOfferInitialState = {
  vcxSerializedClaimOffers: {},
}

// TODO:PS: data structure for claim offer received should be flat
// It should not have only payload
// Merge payload and payloadInfo
export const claimOfferReceived = (
  payload: AdditionalDataPayload,
  payloadInfo: NotificationPayloadInfo
) => ({
  type: CLAIM_OFFER_RECEIVED,
  payload,
  payloadInfo,
})

// this action is used because we don't want to show claim offer again to user
// we set claim offer status as shown, so another code path doesn't show it
export const claimOfferShown = (uid: string) => ({
  type: CLAIM_OFFER_SHOWN,
  uid,
})

export const denyClaimOffer = (uid: string) => ({
  type: DENY_CLAIM_OFFER,
  uid,
})

export const denyClaimOfferSuccess = (uid: string) => ({
  type: DENY_CLAIM_OFFER_SUCCESS,
  uid,
})

export const denyClaimOfferFail = (uid: string) => ({
  type: DENY_CLAIM_OFFER_FAIL,
  uid,
})

export const claimOfferIgnored = (uid: string) => ({
  type: CLAIM_OFFER_IGNORED,
  uid,
})

export const claimOfferRejected = (uid: string) => ({
  type: CLAIM_OFFER_REJECTED,
  uid,
})

export const sendClaimRequest = (uid: string, payload: ClaimOfferPayload) => ({
  type: SEND_CLAIM_REQUEST,
  uid,
  payload,
})

export const sendClaimRequestSuccess = (
  uid: string,
  payload: ClaimOfferPayload
) => ({
  type: SEND_CLAIM_REQUEST_SUCCESS,
  uid,
  payload,
})

export const sendClaimRequestFail = (uid: string, remoteDid: string) => ({
  type: SEND_CLAIM_REQUEST_FAIL,
  uid,
  remoteDid,
})

export const claimRequestSuccess = (
  uid: string,
  issueDate: number,
  colorTheme: string,
  claimId: string,
  caseInsensitiveAttributes: any
): ClaimRequestSuccessAction => ({
  type: CLAIM_REQUEST_SUCCESS,
  uid,
  issueDate,
  colorTheme,
  claimId,
  caseInsensitiveAttributes,
})

export const claimRequestFail = (uid: string, error: CustomError) => ({
  type: CLAIM_REQUEST_FAIL,
  error,
  uid,
})

export const inSufficientBalance = (uid: string) => ({
  type: INSUFFICIENT_BALANCE,
  uid,
})

export const sendPaidCredentialRequest = (
  uid: string,
  payload: ClaimOfferPayload
) => ({
  type: SEND_PAID_CREDENTIAL_REQUEST,
  uid,
  payload,
})

export const paidCredentialRequestSuccess = (uid: string) => ({
  type: PAID_CREDENTIAL_REQUEST_SUCCESS,
  uid,
})

export const paidCredentialRequestFail = (uid: string, remoteDid: string) => ({
  type: PAID_CREDENTIAL_REQUEST_FAIL,
  uid,
  remoteDid,
})

export const acceptClaimOffer = (uid: string, remoteDid: string) => ({
  type: CLAIM_OFFER_ACCEPTED,
  uid,
  remoteDid,
})

export const acceptOutofbandClaimOffer = (
  uid: string,
  remoteDid: string,
  show: boolean
) => ({
  type: OUTOFBAND_CLAIM_OFFER_ACCEPTED,
  uid,
  remoteDid,
  show,
})

export const denyOutOfBandClaimOffer = (
  uid: string
): DenyOutofbandClaimOfferAction => ({
  type: DENY_OUTOFBAND_CLAIM_OFFER,
  uid,
})

export function* getColorTheme(senderLogoUrl: any): Generator<*, *, *> {
  if (!senderLogoUrl) {
    return colors.main
  }

  try {
    const foundColors = yield call(ImageColors.getColors, senderLogoUrl, {
      fallback: colors.main,
    })
    return Platform.OS === 'android'
      ? pickAndroidColor(foundColors)
      : pickIosColor(foundColors)
  } catch (e) {
    return colors.main
  }
}

export function* denyClaimOfferSaga(
  action: ClaimOfferDenyAction
): Generator<*, *, *> {
  const { uid } = action
  const claimOffer = yield select(getClaimOffer, uid)
  const remoteDid: string = claimOffer.remotePairwiseDID

  yield call(ensureConnectionsSync)

  const [connection]: Connection[] = yield select(getConnection, remoteDid)
  if (!connection) {
    captureError(new Error(ERROR_NO_SERIALIZED_CLAIM_OFFER(uid)))
    yield put(claimRequestFail(uid, ERROR_NO_SERIALIZED_CLAIM_OFFER(uid)))
    return
  }

  const vcxSerializedClaimOffer: SerializedClaimOffer | null = yield select(
    getSerializedClaimOffer,
    connection.identifier,
    uid
  )

  if (!vcxSerializedClaimOffer) {
    captureError(new Error(ERROR_NO_SERIALIZED_CLAIM_OFFER(uid)))
    yield put(claimRequestFail(uid, ERROR_NO_SERIALIZED_CLAIM_OFFER(uid)))

    return
  }

  const [connectionHandle, claimHandle] = yield all([
    call(getHandleBySerializedConnection, connection.vcxSerializedConnection),
    call(
      getClaimHandleBySerializedClaimOffer,
      vcxSerializedClaimOffer.serialized
    ),
  ])

  const vcxResult = yield* ensureVcxInitSuccess()
  if (vcxResult && vcxResult.fail) {
    yield put(denyClaimOfferFail(uid))
    return
  }

  try {
    yield call(credentialReject, claimHandle, connectionHandle, '')
    yield put(denyClaimOfferSuccess(uid))
  } catch (e) {
    if (e.code === ACTION_IS_NOT_SUPPORTED) {
      // proprietary protocol doesn't support credential rejection.
      // It works for aries based connection only
      // So we can complete with success if we received this error
      yield put(denyClaimOfferSuccess(uid))
    } else {
      // else fail
      yield put(denyClaimOfferFail(uid))
      yield call(showSnackError, 'Failed to reject Credential Offer.')
    }
  }
}

export function* handleClaimErrors(
  action: ClaimOfferAcceptedAction,
  e: any
): Generator<*, *, *> {
  if (e.code === CREDENTIAL_DEFINITION_NOT_FOUND) {
    yield call(showSnackError, CREDENTIAL_DEFINITION_NOT_FOUND_MESSAGE)
  } else if (e.code === SCHEMA_NOT_FOUND) {
    yield call(showSnackError, SCHEMA_NOT_FOUND_MESSAGE)
  } else if (e.code === INVALID_CREDENTIAL_OFFER) {
    yield call(showSnackError, INVALID_CREDENTIAL_OFFER_MESSAGE)
  } else {
    yield call(showSnackError, e.message)
  }

  captureError(e)
  yield put(sendClaimRequestFail(action.uid, action.remoteDid))
}

export function* acceptEphemeralClaimOffer(
  action: ClaimOfferAcceptedAction,
  claimOfferPayload: ClaimOfferPayload
): Generator<*, *, *> {
  try {
    if (!claimOfferPayload.ephemeralClaimOffer) {
      return
    }

    const offer = JSON.parse(claimOfferPayload.ephemeralClaimOffer)
    const claimHandle = yield call(
      createCredentialWithAriesOfferObject,
      uuid(),
      offer
    )

    yield put(sendClaimRequest(action.uid, claimOfferPayload))

    yield* retrySaga(call(sendClaimRequestApi, claimHandle))

    yield call(
      saveSerializedClaimOffer,
      claimHandle,
      action.remoteDid,
      action.uid
    )

    yield put(sendClaimRequestSuccess(action.uid, claimOfferPayload))

    const state = yield call(getClaimOfferState, claimHandle)
    if (state === VCX_CLAIM_OFFER_STATE.ACCEPTED) {
      const vcxClaim: ClaimInfo = yield call(getCredentialInfo, claimHandle)
      const issueDate = moment().unix()

      yield put(
        mapClaimToSender(
          vcxClaim.referent,
          action.remoteDid,
          action.remoteDid,
          claimOfferPayload.senderLogoUrl || '',
          issueDate,
          claimOfferPayload.data.name,
          claimOfferPayload.issuer.name
        )
      )
      yield put(claimStorageSuccess(action.uid, vcxClaim.referent, issueDate))
    }
    if (state === VCX_CLAIM_OFFER_STATE.NONE) {
      yield call(showSnackError, 'Failed to accept credential')
      yield put(sendClaimRequestFail(action.uid, action.remoteDid))
    }
  } catch (error) {
    yield call(handleClaimErrors, action, error)
  }
}

export function* claimOfferAccepted(
  action: ClaimOfferAcceptedAction
): Generator<*, *, *> {
  const vcxResult = yield* ensureVcxInitAndPoolConnectSuccess()
  if (vcxResult && vcxResult.fail) {
    yield put(sendClaimRequestFail(action.uid, action.remoteDid))
    return
  }

  yield call(ensureConnectionsSync)

  const messageId = action.uid
  const claimOfferPayload: ClaimOfferPayload = yield select(
    getClaimOffer,
    messageId
  )

  if (claimOfferPayload.ephemeralClaimOffer) {
    yield call(acceptEphemeralClaimOffer, action, claimOfferPayload)
    return
  }

  const payTokenAmount = new BigNumber(claimOfferPayload.payTokenValue || '0')
  const isPaidCredential = payTokenAmount.isGreaterThan(0)
  const remoteDid = claimOfferPayload.remotePairwiseDID
  const [connection]: Connection[] = yield select(getConnection, remoteDid)
  if (!connection) {
    captureError(new Error(ERROR_NO_SERIALIZED_CLAIM_OFFER(messageId)))
    yield put(
      claimRequestFail(messageId, ERROR_NO_SERIALIZED_CLAIM_OFFER(messageId))
    )

    return
  }

  const vcxSerializedClaimOffer: SerializedClaimOffer | null = yield select(
    getSerializedClaimOffer,
    connection.identifier,
    messageId
  )

  if (!vcxSerializedClaimOffer) {
    captureError(new Error(ERROR_NO_SERIALIZED_CLAIM_OFFER(messageId)))
    yield put(
      claimRequestFail(messageId, ERROR_NO_SERIALIZED_CLAIM_OFFER(messageId))
    )

    return
  }

  try {
    if (isPaidCredential) {
      yield put(sendPaidCredentialRequest(messageId, claimOfferPayload))

      const walletBalance: string = yield select(getWalletBalance)
      const balanceAmount = new BigNumber(walletBalance)
      const getLedgerFeesStartTime = moment()
      const { transfer }: LedgerFeesData = yield call(getLedgerFees)
      const transferFeesAmount = new BigNumber(transfer)

      if (balanceAmount.isLessThan(payTokenAmount.plus(transferFeesAmount))) {
        const afterLedgerFeesCalculationDone = moment()
        // add an artificial delay here because by the time we reach here
        // user would already be seeing `Paying...` status modal
        // and if ledger fees API takes less than 1-2 seconds
        // then user would see UI jumping too quickly from one state to another
        // UX will be bad
        // TODO: this decision can also be effected with the device performance
        // so if we have device with low configuration, then we may not want this
        // Need to add package with device information and test how it behaves
        if (
          getLedgerFeesStartTime
            .add(0.7, 'seconds')
            .isAfter(afterLedgerFeesCalculationDone)
        ) {
          yield call(delay, 500)
        }
        yield put(inSufficientBalance(messageId))
        return
      }
    } else {
      yield put(sendClaimRequest(messageId, claimOfferPayload))
    }
    // since these two api calls are independent, we can call them in parallel
    // but result of both calls are needed before we can move on with other logic
    // so we wait here till both calls are done
    const [connectionHandle, claimHandle] = yield all([
      call(getHandleBySerializedConnection, connection.vcxSerializedConnection),
      call(
        getClaimHandleBySerializedClaimOffer,
        vcxSerializedClaimOffer.serialized
      ),
    ])

    try {
      yield* retrySaga(call(sendClaimRequestApi, claimHandle, connectionHandle))
    } catch (error) {
      yield call(handleClaimErrors, action, error)
      return
    }

    // since we have sent claim request, state of claim offer in vcx is changed
    // so we need to update stored serialized claim offer in store
    // update serialized state in background
    yield call(
      saveSerializedClaimOffer,
      claimHandle,
      connection.identifier,
      messageId
    )

    yield put(sendClaimRequestSuccess(messageId, claimOfferPayload))
    // if we are able to send claim request successfully,
    // then we can raise an action to show that we have sent claim request
    // so that our history middleware can record this event
    if (isPaidCredential) {
      // it also means payment was successful and we can show success to user in modal
      yield put(paidCredentialRequestSuccess(messageId))
      yield put(refreshWalletBalance())
    }

    yield call(
      checkCredentialStatus,
      messageId,
      claimOfferPayload.issuer.name,
      claimOfferPayload.remotePairwiseDID
    )

    // now the updated claim offer is secure stored now we can update claim request
  } catch (e) {
    captureError(e)
    if (isPaidCredential) {
      yield put(paidCredentialRequestFail(messageId, remoteDid))
    } else {
      yield put(
        claimRequestFail(messageId, ERROR_SEND_CLAIM_REQUEST(e.message))
      )
    }
  }
}

export function* checkCredentialStatus(
  identifier: string,
  senderName: string,
  remoteDID: string
): Generator<*, *, *> {
  yield spawn(checkProtocolStatus, {
    identifier: identifier,
    getObjectFunc: getClaimOffer,
    isCompletedFunc: isIssuanceCompleted,
    error: ERROR_RECEIVE_CLAIM(senderName),
    onErrorEvent: sendClaimRequestFail(identifier, remoteDID),
  })
}

export const caseInsensitive = (attr: string) =>
  attr.toLowerCase().replace(/ /g, '')

const buildCredentialCaseInsensitiveAttributes = (
  claimOfferPayload: ClaimOfferPayload
) => {
  return claimOfferPayload.data.revealedAttributes.reduce(
    (acc, attribute) => ({
      ...acc,
      [caseInsensitive(attribute.label)]: attribute.label,
    }),
    {}
  )
}

function* claimStorageSuccessSaga(
  action: ClaimStorageSuccessAction
): Generator<*, *, *> {
  const { messageId, issueDate } = action

  const claimOfferPayload = yield select(getClaimOffer, messageId)
  const colorTheme = yield call(getColorTheme, claimOfferPayload.senderLogoUrl)
  const caseInsensitiveAttributes = buildCredentialCaseInsensitiveAttributes(
    claimOfferPayload
  )

  yield put(
    claimRequestSuccess(
      messageId,
      issueDate,
      colorTheme,
      action.claimId,
      caseInsensitiveAttributes
    )
  )
}

export function* watchClaimStorageSuccess(): any {
  yield takeEvery(CLAIM_STORAGE_SUCCESS, claimStorageSuccessSaga)
}

export function* watchClaimOfferDeny(): any {
  yield takeEvery(DENY_CLAIM_OFFER, denyClaimOfferSaga)
}

function* claimStorageFailSaga(
  action: ClaimStorageFailAction
): Generator<*, *, *> {
  const { messageId } = action
  yield put(claimRequestFail(messageId, CLAIM_STORAGE_ERROR()))
}

export function* watchClaimStorageFail(): any {
  yield takeEvery(CLAIM_STORAGE_FAIL, claimStorageFailSaga)
}

export function* saveSerializedClaimOffer(
  claimHandle: number,
  userDID: string,
  messageId: string
): Generator<*, *, *> {
  try {
    const [serializedClaimOffer, claimOfferVcxState]: [
      string,
      number
    ] = yield all([
      call(serializeClaimOffer, claimHandle),
      call(getClaimOfferState, claimHandle),
    ])
    yield put(
      addSerializedClaimOffer(
        serializedClaimOffer,
        userDID,
        messageId,
        claimOfferVcxState
      )
    )
  } catch (e) {
    captureError(e)
    // TODO:KS need to think about what happens when serialize call from vcx fails
  }
}

function* watchClaimOfferAccepted(): any {
  yield takeEvery(CLAIM_OFFER_ACCEPTED, claimOfferAccepted)
}

export const addSerializedClaimOffer = (
  serializedClaimOffer: string,
  userDID: string,
  messageId: string,
  claimOfferVcxState: number
) => ({
  type: ADD_SERIALIZED_CLAIM_OFFER,
  serializedClaimOffer,
  userDID,
  messageId,
  claimOfferVcxState,
})

export function* watchAddSerializedClaimOffer(): any {
  //save claimOffers as well or rename to save ClaimOfferSaga
  yield takeEvery(
    [
      ADD_SERIALIZED_CLAIM_OFFER,
      CLAIM_OFFER_RECEIVED,
      SEND_CLAIM_REQUEST,
      CLAIM_OFFER_SHOWN,
      DELETE_CLAIM_SUCCESS,
      CLAIM_STORAGE_SUCCESS,
      SEND_CLAIM_REQUEST_FAIL,
      CLAIM_REQUEST_SUCCESS
    ],
    saveClaimOffersSaga
  )
}

export function* saveClaimOffersSaga(
  action: AddSerializedClaimOfferAction
): Generator<*, *, *> {
  try {
    const claimOffers = yield select(getClaimOffers)
    yield call(secureSet, CLAIM_OFFERS, JSON.stringify(claimOffers))
    yield put({
      type: SAVE_CLAIM_OFFERS_SUCCESS,
    })
  } catch (e) {
    // capture error for safe set
    captureError(e)
    yield put({
      type: SAVE_CLAIM_OFFERS_FAIL,
      error: ERROR_SAVE_CLAIM_OFFERS(e.message),
    })
  }
}

export function* hydrateClaimOffersSaga(): Generator<*, *, *> {
  try {
    const claimOffersJson = yield call(getHydrationItem, CLAIM_OFFERS)
    const connectionHistory = yield select(getConnectionHistory)
    if (claimOffersJson) {
      const serializedClaimOffers = JSON.parse(claimOffersJson)
      const {
        vcxSerializedClaimOffers: serializedOffers,
        ...offers
      } = serializedClaimOffers

      // To make sure that all claim offers has issue date
      // we have to look through connection history and extract issue date from it if current date is empty
      let storageSuccessHistory = []
      Object.keys(connectionHistory.data.connections)
        .map((uid) => connectionHistory.data.connections[uid])
        .forEach((connection) => {
          const connectionHistory = connection.data || []
          storageSuccessHistory.push(
            ...connectionHistory.filter(
              (event) =>
                event &&
                event.originalPayload &&
                event.originalPayload.type === CLAIM_STORAGE_SUCCESS
            )
          )
        })

      // iterate over offers and do
      for (let uid of Object.keys(offers)) {
        const offer = offers[uid]
        // 2. set missing data
        if (!offer.issueDate) {
          const historyEvent = storageSuccessHistory.find(
            (event) =>
              event.originalPayload && event.originalPayload.messageId === uid
          )
          if (historyEvent) {
            offer.issueDate = historyEvent.originalPayload.issueDate
          }
          serializedClaimOffers[uid] = offer
        }

        if (!offer.colorTheme) {
          // set color theme if it's missing
          offer.colorTheme = yield call(getColorTheme, offer.senderLogoUrl)
        }

        if (!offer.claimId) {
          const claim: GenericObject = yield select(getClaimForOffer, offer)
          if (claim && claim.claimUuid) {
            offer.claimId = claim.claimUuid
          }
        }

        if (!offer.caseInsensitiveAttributes) {
          offer.caseInsensitiveAttributes = buildCredentialCaseInsensitiveAttributes(
            offer
          )
        }

        if (offer.data && offer.issuer && !offer.data.claimDefinitionId) {
          // I don't see an easy way to fetch claimDefinitionId
          // use combination of `issuerDID + credentialName` as workaround
          offer.data.claimDefinitionId = `${offer.issuer.did}:${offer.data.name}`
        }
      }

      yield put(hydrateClaimOffers(serializedClaimOffers))
    }
  } catch (e) {
    captureError(e)
    customLogger.log(`hydrateClaimOffersSaga: ${e}`)
    yield put({
      type: HYDRATE_CLAIM_OFFERS_FAIL,
      error: ERROR_HYDRATE_CLAIM_OFFERS(e.message),
    })
  }
}

export const hydrateClaimOffers = (claimOffers: ClaimOfferStore) => ({
  type: HYDRATE_CLAIM_OFFERS_SUCCESS,
  claimOffers,
})

export const deleteClaim = (uuid: string): DeleteClaimAction => ({
  type: DELETE_CLAIM,
  uuid,
})
export const deleteClaimSuccess = (
  messageId: string,
  uid: string,
  pwDid: string
): DeleteClaimSuccessAction => ({
  type: DELETE_CLAIM_SUCCESS,
  messageId,
  uid,
  pwDid,
})

export function* deleteClaimSaga(
  action: DeleteClaimAction
): Generator<*, *, *> {
  try {
    const claim = yield call(getClaim, action.uuid)
    if (!claim) {
      return
    }
    yield call(deleteCredential, claim.handle)
    yield put(
      deleteClaimSuccess(
        claim.vcxSerializedClaimOffer.messageId,
        action.uuid,
        claim.claim.myPairwiseDID
      )
    )
  } catch (e) {
    captureError(e)
  }
}

function* claimOfferReceivedSaga(
  action: ClaimOfferReceivedAction
): Generator<*, *, *> {
  // accepting of credential offer requires pool ledger connectivity.
  yield* ensureVcxInitAndPoolConnectSuccess()
}

export function* watchDeleteClaim(): any {
  yield takeEvery(DELETE_CLAIM, deleteClaimSaga)
}

export function* watchClaimOfferReceived(): any {
  yield takeEvery(CLAIM_OFFER_RECEIVED, claimOfferReceivedSaga)
}

export function* watchClaimOffer(): any {
  yield all([
    watchClaimOfferAccepted(),
    watchAddSerializedClaimOffer(),
    watchClaimStorageSuccess(),
    watchClaimStorageFail(),
    watchClaimOfferReceived(),
  ])
}

export const claimOfferShowStart = (uid: string) => ({
  type: CLAIM_OFFER_SHOW_START,
  uid,
})

export const resetClaimRequestStatus = (uid: string) => ({
  type: RESET_CLAIM_REQUEST_STATUS,
  uid,
})

export default function claimOfferReducer(
  state: ClaimOfferStore = claimOfferInitialState,
  action: ClaimOfferAction
) {
  switch (action.type) {
    case CLAIM_OFFER_RECEIVED:
      return {
        ...state,
        [action.payloadInfo.uid]: {
          ...action.payload,
          ...action.payloadInfo,
          status: CLAIM_OFFER_STATUS.RECEIVED,
          claimRequestStatus: CLAIM_REQUEST_STATUS.NONE,
          error: null,
        },
      }
    case CLAIM_OFFER_SHOWN:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          status: CLAIM_OFFER_STATUS.SHOWN,
        },
      }
    case CLAIM_OFFER_ACCEPTED:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          status: CLAIM_OFFER_STATUS.ACCEPTED,
        },
      }
    case OUTOFBAND_CLAIM_OFFER_ACCEPTED:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          status: CLAIM_OFFER_STATUS.ACCEPTED,
        },
      }
    case DENY_OUTOFBAND_CLAIM_OFFER:
      const { [action.uid]: claimOffer, ...newState } = state
      return {
        ...newState,
      }
    case CLAIM_OFFER_IGNORED:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          status: CLAIM_OFFER_STATUS.IGNORED,
        },
      }
    case CLAIM_OFFER_REJECTED:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          status: CLAIM_OFFER_STATUS.REJECTED,
        },
      }
    case SEND_CLAIM_REQUEST:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          claimRequestStatus: CLAIM_REQUEST_STATUS.SENDING_CLAIM_REQUEST,
        },
      }
    case CLAIM_REQUEST_SUCCESS:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          claimRequestStatus: CLAIM_REQUEST_STATUS.CLAIM_REQUEST_SUCCESS,
          status: CLAIM_OFFER_STATUS.ISSUED,
          issueDate: action.issueDate,
          colorTheme: action.colorTheme,
          claimId: action.claimId,
          caseInsensitiveAttributes: action.caseInsensitiveAttributes,
        },
      }
    case CLAIM_REQUEST_FAIL:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          claimRequestStatus: CLAIM_REQUEST_STATUS.CLAIM_REQUEST_FAIL,
          status: CLAIM_OFFER_STATUS.FAILED,
        },
      }
    case INSUFFICIENT_BALANCE:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          claimRequestStatus: CLAIM_REQUEST_STATUS.INSUFFICIENT_BALANCE,
          status: CLAIM_OFFER_STATUS.FAILED,
        },
      }
    case SEND_PAID_CREDENTIAL_REQUEST:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          claimRequestStatus:
            CLAIM_REQUEST_STATUS.SENDING_PAID_CREDENTIAL_REQUEST,
        },
      }
    case PAID_CREDENTIAL_REQUEST_SUCCESS:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          claimRequestStatus:
            CLAIM_REQUEST_STATUS.PAID_CREDENTIAL_REQUEST_SUCCESS,
          status: CLAIM_OFFER_STATUS.ISSUED,
        },
      }
    case PAID_CREDENTIAL_REQUEST_FAIL:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          claimRequestStatus: CLAIM_REQUEST_STATUS.PAID_CREDENTIAL_REQUEST_FAIL,
          status: CLAIM_OFFER_STATUS.FAILED,
        },
      }
    case RESET:
      return claimOfferInitialState
    case ADD_SERIALIZED_CLAIM_OFFER:
      return {
        ...state,
        vcxSerializedClaimOffers: {
          ...state.vcxSerializedClaimOffers,
          [action.userDID]: {
            ...state.vcxSerializedClaimOffers[action.userDID],
            [action.messageId]: {
              serialized: action.serializedClaimOffer,
              state: action.claimOfferVcxState,
              messageId: action.messageId,
            },
          },
        },
      }
    case HYDRATE_CLAIM_OFFERS_SUCCESS:
      return action.claimOffers

    case CLAIM_OFFER_SHOW_START: {
      if ([CLAIM_REQUEST_STATUS.SEND_CLAIM_REQUEST_SUCCESS, CLAIM_REQUEST_STATUS.CLAIM_REQUEST_SUCCESS].includes(state[action.uid].claimRequestStatus)) {
        // if credential offer is already accepted, then we should not reset the state
        // it can happen that even after accepting the state, we get another event which reset the state 
        // and we don't see it in accepted credentials
        return state
      }

      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          status: CLAIM_OFFER_STATUS.RECEIVED,
          claimRequestStatus: CLAIM_REQUEST_STATUS.NONE,
        },
      }
    }

    case RESET_CLAIM_REQUEST_STATUS: {
      if ([CLAIM_REQUEST_STATUS.SEND_CLAIM_REQUEST_SUCCESS, CLAIM_REQUEST_STATUS.CLAIM_REQUEST_SUCCESS].includes(state[action.uid].claimRequestStatus)) {
        // if credential offer is already accepted, then we should not reset the state
        // it can happen that even after accepting the state, we get another event which reset the state 
        // and we don't see it in accepted credentials
        return state
      }
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          claimRequestStatus: CLAIM_REQUEST_STATUS.NONE,
          status: CLAIM_OFFER_STATUS.RECEIVED,
        },
      }
    }

    case SEND_CLAIM_REQUEST_SUCCESS:
      return {
        ...state,
        [action.uid]: {
          ...action.payload,
          claimRequestStatus: CLAIM_REQUEST_STATUS.SEND_CLAIM_REQUEST_SUCCESS,
        },
      }

    case SEND_CLAIM_REQUEST_FAIL:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          claimRequestStatus: CLAIM_REQUEST_STATUS.SEND_CLAIM_REQUEST_FAIL,
          status: CLAIM_OFFER_STATUS.FAILED,
        },
      }
    case DELETE_CLAIM_SUCCESS:
      const {
        [action.uid]: deleted,
        ...restSerializedOffers
      } = state.vcxSerializedClaimOffers[action.pwDid]

      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          status: CLAIM_OFFER_STATUS.DELETED,
          claimRequestStatus: CLAIM_REQUEST_STATUS.DELETED,
        },
        vcxSerializedClaimOffers: {
          ...state.vcxSerializedClaimOffers,
          [action.pwDid]: restSerializedOffers,
        },
      }
    default:
      return state
  }
}
