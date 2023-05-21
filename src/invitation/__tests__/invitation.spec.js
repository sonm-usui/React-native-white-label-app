// @flow
import React from 'react'
import 'react-native'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import { Invitation, invitationScreen } from '../invitation'

import { color } from '../../common/styles'
import { ResponseType } from '../../components/request/type-request'
import { homeRoute } from '../../common'
import { getNavigation, smsToken } from '../../../__mocks__/static-data'
import { Container } from '../../components'

describe('<Invitation />', () => {
  const ConnectedInvitation = invitationScreen.screen
  let store
  let dispatch
  let subscribe
  let navigation
  let route
  let sendInvitationResponse
  let smsPendingInvitationSeen
  let invitationRejected
  let instance
  let component
  let invitation
  let isSmsInvitationNotSeen
  let allowPushNotifications
  let props

  const firstInvitation = {
    requestId: 'requestId1',
    senderAgentKeyDelegationProof: {
      agentDID: 'EHNMj5FNjA3xBo8HUKQTZv',
      agentDelegatedKey: '8Esrno7vguYbwVJDa31aMCdWJTu2tC7tke8u2iKUUvgB',
      signature:
        'OXtzqX9LJJsBY/Mrhjff6b9L79Pdg8U4B7dI/3RR65BJr5jktAGMwpMLe1aQRQT0FlplZfNy8QtUd4KNPd+ZAg==',
    },
    senderDID: 'senderDID1',
    senderEndpoint: 'endpoint',
    senderLogoUrl: 'lu',
    senderName: 'sender1',
    senderVerificationKey: 'sVk',
    targetName: 'target name',
    senderDetail: {
      name: 'default',
      agentKeyDlgProof: {
        agentDID: 'EHNMj5FNjA3xBo8HUKQTZv',
        agentDelegatedKey: '8Esrno7vguYbwVJDa31aMCdWJTu2tC7tke8u2iKUUvgB',
        signature:
          'OXtzqX9LJJsBY/Mrhjff6b9L79Pdg8U4B7dI/3RR65BJr5jktAGMwpMLe1aQRQT0FlplZfNy8QtUd4KNPd+ZAg==',
      },
      DID: '3Bb6zCYMoGnMTho97HGDrn',
      logoUrl: 'http://www.evernym.com',
      verKey: '2BzhMgbLXbECPPYiLtSEd36Boxt1oquuGJeS1ofhPoEr',
    },
    senderAgencyDetail: {
      DID: 'BDSmVkzxRYGE4HKyMKxd1H',
      verKey: '6yUatReYWNSUfEtC2ABgRXmmLaxCyQqsjLwv2BomxsxD',
      endpoint: '52.38.32.107:80/agency/msg',
    },
  }

  const getState = () => ({
    invitation: {
      senderDID1: {
        error: null,
        isFetching: false,
        payload: firstInvitation,
        status: ResponseType.none,
      },
    },
    config: {
      showErrorAlerts: true,
    },
    connections: {
      connectionThemes: {
        default: {
          primary: `rgba(${color.actions.button.primary.rgba})`,
          secondary: `rgba(${color.actions.button.secondary.rgba})`,
        },
      },
    },
    user: {
      avatarName: undefined,
    },
    lock: {
      isTouchIdEnabled: false,
    },
    smsPendingInvitation: {},
    offline: {
      offline: false,
    },
  })

  beforeEach(() => {
    dispatch = jest.fn()
    subscribe = jest.fn()
    store = {
      getState,
      dispatch() {
        return dispatch
      },
      subscribe() {
        return subscribe
      },
    }
    navigation = {
      ...getNavigation({
        senderDID: firstInvitation.senderDID,
        smsToken,
      }),
    }
    route = {
      params: {
        senderDID: firstInvitation.senderDID,
        token: smsToken,
      },
    }
    const state = getState()
    invitation = state.invitation.senderDID1
    const showErrorAlerts = state.config.showErrorAlerts
    sendInvitationResponse = jest.fn()
    smsPendingInvitationSeen = jest.fn()
    invitationRejected = jest.fn()
    isSmsInvitationNotSeen = false
    allowPushNotifications = jest.fn()
    props = {
      invitation,
      showErrorAlerts,
      navigation,
      route,
      sendInvitationResponse,
      smsPendingInvitationSeen,
      invitationRejected,
      smsToken,
      isSmsInvitationNotSeen,
      allowPushNotifications,
    }
    component = renderer.create(
      <Provider store={store}>
        <Invitation {...props} />
      </Provider>
    )

    instance = component.root.findByType(Invitation).instance
  })
  afterEach(() => {
    sendInvitationResponse.mockReset()
    sendInvitationResponse.mockRestore()
    invitationRejected.mockReset()
    invitationRejected.mockRestore()
    smsPendingInvitationSeen.mockReset()
    smsPendingInvitationSeen.mockRestore()
    dispatch.mockReset()
    dispatch.mockRestore()
    subscribe.mockReset()
    subscribe.mockRestore()
  })

  it('should match snapshot', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <ConnectedInvitation navigation={navigation} route={route} />
        </Provider>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('should dispatch correct action for accepting invitation', () => {
    const response = ResponseType.accepted
    instance.onAction(response)

    expect(sendInvitationResponse).toHaveBeenCalledWith({
      response,
      senderDID: firstInvitation.senderDID,
    })
  })

  it('should reject invitation and redirect user to Home on Deny', () => {
    instance.onAction(ResponseType.rejected)
    expect(invitationRejected).toHaveBeenCalledWith(firstInvitation.senderDID)
    expect(navigation.navigate).toHaveBeenCalled()
    const redirectScreen = navigation.navigate.mock.calls[0][0]
    expect(redirectScreen).toBe(homeRoute)
  })

  it('should call smsPendingInvitationSeen action if isSmsInvitationNotSeen is true', () => {
    const invitationAfterAccept = {
      ...invitation,
      status: ResponseType.accepted,
    }
    component = renderer.create(
      <Provider store={store}>
        <Invitation
          {...props}
          invitation={invitationAfterAccept}
          isSmsInvitationNotSeen={true}
        />
      </Provider>
    )
    expect(smsPendingInvitationSeen).toHaveBeenCalledWith(smsToken)
  })

  it('should not call smsPendingInvitationSeen action if isSmsInvitationNotSeen is false', () => {
    const invitationAfterAccept = {
      ...invitation,
      status: ResponseType.accepted,
    }
    component = renderer.create(
      <Provider store={store}>
        <Invitation {...props} invitation={invitationAfterAccept} />
      </Provider>
    )
    expect(smsPendingInvitationSeen).not.toHaveBeenCalledWith(smsToken)
  })

  it('should return a empty container when invitation is null', () => {
    invitation = null
    navigation = {
      ...getNavigation({
        senderDID: null,
        smsToken: null,
      }),
    }
    const wrapper = renderer.create(
      <Provider store={store}>
        <Invitation
          {...props}
          invitation={invitation}
          navigation={navigation}
        />
      </Provider>
    )
    expect(wrapper.toJSON()).toMatchSnapshot()
    const instance = wrapper.root
    expect(instance.findByType(Container).children.length).toBe(1)
  })
})
