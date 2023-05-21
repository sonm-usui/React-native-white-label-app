// @flow

import { put, all, call, takeLeading } from 'redux-saga/effects'
import moment from 'moment'

import type {
  LedgerAction,
  LedgerStore,
  LedgerFeesData,
} from './type-ledger-store'

import { STORE_STATUS } from '../common/type-common'
import {
  GET_LEDGER_FEES,
  getLedgerFeesFail,
  ERROR_GET_LEDGER_FEES,
  getLedgerFeesSuccess,
  GET_LEDGER_FEES_SUCCESS,
  GET_LEDGER_FEES_FAIL,
  RESET_LEDGER_FEES,
} from './type-ledger-store'
import { getLedgerFees } from '../bridge/react-native-cxs/RNCxs'
import { ensureVcxInitAndPoolConnectSuccess } from '../store/route-store'
import { captureError } from '../services/error/error-handler'

const initialState = {
  fees: {
    data: {
      transfer: '0',
      refreshTime: moment().year(2000).format(),
    },
    status: STORE_STATUS.IDLE,
    error: null,
  },
}

export function* getLedgerFeesSaga(): Generator<*, *, *> {
  try {
    const vcxResult = yield* ensureVcxInitAndPoolConnectSuccess()
    if (vcxResult && vcxResult.fail) {
      throw new Error(JSON.stringify(vcxResult.fail.message))
    }
    const fees: LedgerFeesData = yield call(getLedgerFees)
    yield put(getLedgerFeesSuccess(fees))
  } catch (e) {
    captureError(e)
    yield put(
      getLedgerFeesFail(
        ERROR_GET_LEDGER_FEES(e ? e.message : 'No error passed')
      )
    )
  }
}

export function* watchGetLedgerFees(): any {
  yield takeLeading(GET_LEDGER_FEES, getLedgerFeesSaga)
}

export function* watchLedgerStore(): any {
  yield all([watchGetLedgerFees()])
}

export function ledgerStoreReducer(
  state: LedgerStore = initialState,
  action: LedgerAction
): LedgerStore {
  switch (action.type) {
    case GET_LEDGER_FEES:
      return {
        ...state,
        fees: {
          ...state.fees,
          status: STORE_STATUS.IN_PROGRESS,
          error: null,
        },
      }

    case GET_LEDGER_FEES_SUCCESS:
      return {
        ...state,
        fees: {
          ...state.fees,
          status: STORE_STATUS.SUCCESS,
          error: null,
          data: {
            ...action.fees,
            refreshTime: moment().format(),
          },
        },
      }

    case GET_LEDGER_FEES_FAIL:
      return {
        ...state,
        fees: {
          ...state.fees,
          status: STORE_STATUS.ERROR,
          error: action.error,
        },
      }

    case RESET_LEDGER_FEES:
      return initialState

    default:
      return state
  }
}
