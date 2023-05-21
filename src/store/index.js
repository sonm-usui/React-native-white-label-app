// @flow
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { all } from 'redux-saga/effects'
import { createLogger } from 'redux-logger'

import type { Store } from './type-store'

import { customLogger, PiiHiddenActionTransformer } from './custom-logger'
import user, { watchUserStore } from './user/user-store'
import pushNotification, {
  watchPushNotification,
} from '../push-notification/push-notification-store'
import connections, { watchConnection } from './connections-store'
import config, { watchConfig, watchGetMessagesSaga } from './config-store'
import deepLink from '../deep-link/deep-link-store'
import route from './route-store'
import lock, {
  watchLock,
  watchPressEventInLockSelectionScreen,
  watchEnableTouchId,
  watchDisableTouchId,
} from '../lock/lock-store'
import smsPendingInvitation, {
  watchSmsPendingInvitationSaga,
} from '../sms-pending-invitation/sms-pending-invitation-store'
import claimOffer, {
  watchClaimOffer,
  watchClaimOfferDeny,
  watchDeleteClaim,
} from '../claim-offer/claim-offer-store'
import proofRequest, {
  watchProofRequestAccepted,
  watchPersistProofRequests,
  watchProofRequestReceived,
  watchProofRequestDeny,
  watchOutOfBandConnectionForPresentationEstablished,
} from '../proof-request/proof-request-store'
import invitation, { watchInvitation } from '../invitation/invitation-store'
import claim, {
  watchClaimReceived,
  watchClaimStored,
} from '../claim/claim-store'
import question, { watchQuestion } from '../question/question-store'
import txnAuthorAgreement, {
  watchTxnAuthorAgreement,
} from '../txn-author-agreement/txn-author-agreement-store'
import proof, { watchProof } from '../proof/proof-store'
import history, {
  watchConnectionHistory,
} from '../connection-history/connection-history-store'
import historyRecorder from '../connection-history/history-middleware'
import wallet, { watchWalletStore } from '../wallet/wallet-store'
import eula, { watchEula } from '../eula/eula-store'
import restore, { watchRestore } from '../restore/restore-store'
import cloudRestore, {
  watchCloudRestore,
} from '../cloud-restore/cloud-restore-store'
import backup, { watchBackup } from '../backup/backup-store'
import sendlogs, { watchSendLogs } from '../send-logs/send-logs-store'
import offline, { watchOffline } from '../offline/offline-store'
import { hydrate } from './hydration-store'
import {
  watchLedgerStore,
  ledgerStoreReducer as ledger,
} from '../ledger/ledger-store'
import {
  watchOpenIdConnectStore,
  openIdConnectReducer,
} from '../open-id-connect/open-id-connect-store'
import { watchMessageDownload } from '../message-download/message-download'
import { watchLongPollingHome } from '../home/long-polling-home'
import inviteAction, {
  watchInviteAction,
} from '../invite-action/invite-action-store'
import showCredential, {
  watchShowCredentialStore,
} from '../show-credential/show-credential-store'
import verifier, { watchVerifier } from '../verifier/verifier-store'
import logToApptentiveMiddleware, {
  isLogToApptentive,
} from '../feedback/log-to-apptentive'

const sagaMiddleware = createSagaMiddleware()

const appReducer = combineReducers({
  config,
  connections,
  deepLink,
  pushNotification,
  route,
  smsPendingInvitation,
  user,
  lock,
  claimOffer,
  proofRequest,
  invitation,
  claim,
  proof,
  history,
  wallet,
  eula,
  restore,
  cloudRestore,
  backup,
  sendlogs,
  ledger,
  offline,
  question,
  txnAuthorAgreement,
  openIdConnect: openIdConnectReducer,
  inviteAction,
  showCredential,
  verifier,
})

let middlewares = [historyRecorder]

if (isLogToApptentive) {
  middlewares.push(logToApptentiveMiddleware)
}

// "Error", "Warning", "Info", "Debug", "Trace"
const logLevel = 'debug'
customLogger.init(logLevel)
// eslint-disable-next-line no-unused-vars
let reduxLogger = createLogger({
  logger: customLogger,
  actionTransformer: PiiHiddenActionTransformer,
  level: {
    prevState: false,
    action: logLevel,
    nextState: false,
    error: logLevel,
  },
})
middlewares.push(reduxLogger)

middlewares.push(sagaMiddleware)

const composeEnhancers =
  (global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
    global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})) ||
  compose

const store = createStore<Store, *, *>(
  appReducer,
  composeEnhancers(applyMiddleware(...middlewares))
)

sagaMiddleware.run(function* (): Generator<*, *, *> {
  return yield all([
    watchConnection(),
    watchConfig(),
    watchLock(),
    watchSmsPendingInvitationSaga(),
    watchClaimOffer(),
    watchClaimOfferDeny(),
    watchPushNotification(),
    watchInvitation(),
    watchClaimReceived(),
    watchDeleteClaim(),
    watchClaimStored(),
    watchShowCredentialStore(),
    watchPressEventInLockSelectionScreen(),
    watchEnableTouchId(),
    watchDisableTouchId(),
    watchProof(),
    watchProofRequestAccepted(),
    watchConnectionHistory(),
    watchUserStore(),
    watchWalletStore(),
    watchBackup(),
    watchSendLogs(),
    watchEula(),
    watchRestore(),
    watchCloudRestore(),
    hydrate(),
    watchGetMessagesSaga(),
    watchPersistProofRequests(),
    watchProofRequestReceived(),
    watchLedgerStore(),
    watchOffline(),
    watchQuestion(),
    watchTxnAuthorAgreement(),
    watchOpenIdConnectStore(),
    watchProofRequestDeny(),
    watchMessageDownload(),
    watchOutOfBandConnectionForPresentationEstablished(),
    watchLongPollingHome(),
    watchInviteAction(),
    watchVerifier(),
  ])
})

export default store
