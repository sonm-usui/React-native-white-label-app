// @flow
import { expectSaga } from 'redux-saga-test-plan'
import pushNotificationReducer, {
  pushNotificationPermissionAction,
  pushNotificationReceived,
  updatePushToken,
  onPushTokenUpdate,
} from '../push-notification-store'
import { updatePushTokenVcx } from '../../bridge/react-native-cxs/RNCxs'
import { claimOfferPushNotification } from '../../../__mocks__/static-data'
import { initialTestAction } from '../../common/type-common'
import uniqueId from 'react-native-unique-id'
import { VCX_INIT_SUCCESS } from '../../store/type-config-store'

describe('push notification store should work properly', () => {
  let initialState = {
    isAllowed: null,
    notification: null,
    pushToken: null,
    isPristine: true,
    isFetching: false,
    error: null,
    pendingFetchAdditionalDataKey: null,
    navigateRoute: null,
  }

  beforeAll(() => {
    initialState = pushNotificationReducer(undefined, initialTestAction())
  })

  it('should set push notification permission accepted', () => {
    const expectedState = {
      ...initialState,
      isAllowed: true,
      notification: null,
    }
    const actualState = pushNotificationReducer(
      initialState,
      pushNotificationPermissionAction(true)
    )
    expect(actualState).toMatchObject(expectedState)
  })

  it('should set new push notification flag true', () => {
    const expectedState = {
      ...initialState,
      isAllowed: null,
      notification: claimOfferPushNotification,
    }
    const actualState = pushNotificationReducer(
      initialState,
      pushNotificationReceived(claimOfferPushNotification)
    )
    expect(actualState).toMatchObject(expectedState)
  })

  it('should update push token properly', () => {
    const pushToken = 'test:APA91bFOyY3at1DzdKO-Z4G_5dG12cXvKC1GuI…CX3jH'
    const expectedState = {
      ...initialState,
      isAllowed: true,
      pushToken,
    }
    const actualState = pushNotificationReducer(
      initialState,
      updatePushToken(pushToken)
    )
    expect(actualState).toMatchObject(expectedState)
  })

  it('should reset push notification store, if RESET action is raised', () => {
    const afterPushNotificationReceivedState = pushNotificationReducer(
      initialState,
      pushNotificationReceived(claimOfferPushNotification)
    )
    expect(
      pushNotificationReducer(afterPushNotificationReceivedState, {
        type: 'RESET',
      })
    ).toMatchSnapshot()
  })

  it('saga:onPushTokenUpdateVcx', async () => {
    const pushToken = 'test:APA91bFOyY3at1DzdKO-Z4G_5dG12cXvKC1GuICX3jH'
    const vcxInitSuccessState = {
      config: {
        vcxInitializationState: VCX_INIT_SUCCESS,
        isHydrated: true,
      },
      connections: {
        data: null,
      },
      deepLink: {
        tokens: { token: { status: '', token: 'token' } },
      },
      invitation: {},
    }
    const id = await uniqueId()
    const cxsPushTokenConfig = { uniqueId: id, pushToken: `${pushToken}` }

    return expectSaga(onPushTokenUpdate, updatePushToken(pushToken))
      .withState(vcxInitSuccessState)
      .call(updatePushTokenVcx, cxsPushTokenConfig)
      .run()
  })
})
