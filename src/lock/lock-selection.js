// @flow
import React, { Component } from 'react'
import {
  Image,
  StyleSheet,
  Alert,
  Platform,
  Switch,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ToggleSwitch from 'react-native-flip-toggle-button'
import { verticalScale, moderateScale } from 'react-native-size-matters'
import type { Store } from '../store/type-store'
import { Container, CustomText, CustomView } from '../components'
import {
  lockTouchIdSetupRoute,
  switchEnvironmentRoute,
  lockSelectionRoute,
  eulaRoute,
} from '../common/'
import type { LockSelectionProps } from './type-lock'
import {
  OFFSET_1X,
  OFFSET_2X,
  OFFSET_3X,
  isiPhone5,
  mantis,
  lightWhite,
  colors,
  fontFamily,
} from '../common/styles/constant'
import {
  disableDevMode,
  longPressedInLockSelectionScreen,
  pressedOnOrInLockSelectionScreen,
} from './lock-store'
import { safeToDownloadSmsInvitation } from '../sms-pending-invitation/sms-pending-invitation-store'
import { LockHeader } from '../external-imports'
import { headerDefaultOptions } from '../navigation/navigation-header-config'
import { environments, defaultEnvironment } from '../environment'
import { changeEnvironment } from '../switch-environment/switсh-environment-store'
import { SERVER_ENVIRONMENT } from '../switch-environment/type-switch-environment'
const { width, height } = Dimensions.get('screen')
export class LockSelection extends Component<LockSelectionProps, *> {
  constructor(props: LockSelectionProps) {
    super(props)
    this.state = {
      devMode: false,
    }
  }
  goTouchIdSetup = () => {
    if (this.props.navigation.isFocused()) {
      this.props.navigation.navigate(lockTouchIdSetupRoute, {
        fromSetup: true,
      })
      this.props.safeToDownloadSmsInvitation()
    }
  }
  onNoThanks = () => {
    this.props.safeToDownloadSmsInvitation()
    this.props.navigation.navigate(eulaRoute)
  }
  _onLongPressButton = () => {
    this.props.longPressedInLockSelectionScreen()
  }
  _onTextPressButton = () => {
    this.props.pressedOnOrInLockSelectionScreen()
  }
  onDevModeChange = (switchState: boolean) => {
    if (this.state.devMode !== switchState) {
      this.setState({ devMode: switchState }, () => {
        const env = this.state.devMode
          ? environments[SERVER_ENVIRONMENT.DEMO]
          : environments[defaultEnvironment]
        this.props.changeEnvironment(
          env.agencyUrl,
          env.agencyDID,
          env.agencyVerificationKey,
          env.poolConfig,
          env.paymentMethod,
          env.domainDID,
          env.verityFlowBaseUrl,
          env.identityCardCredDefId,
          env.drivingLicenseCredDefId,
          env.passportCredDefId
        )
      })
    }
  }
  // width: 411.42857142857144 height: 868.5714285714286
  // width: 320 height: 675.5555555555555
  componentDidMount() {
    console.log('width:', width, 'height:', height)
  }
  render() {
    return (
      <Container tertiary>
        <ScrollView>
          <Container tertiary style={[style.pinSelectionContainer]}>
            <CustomView center>
              {LockHeader ? <LockHeader /> : <View />}
            </CustomView>
            <CustomText
              center
              h4
              bg="tertiary"
              style={[style.title]}
              tertiary
              thick
            >
              Biometrics are faster.
            </CustomText>
            <CustomView
              testID="lock-selection-or-text"
              accessible={true}
              accessibilityLabel="lock-selection-or-text"
              center
              style={[style.image]}
              onPress={this._onTextPressButton}
              onLongPress={this._onLongPressButton}
              debounceAction={false}
            >
              <Image source={require('../images/biometricsGroup.png')} />
            </CustomView>
            <CustomText bg="tertiary" tertiary style={[style.message]}>
              You can use your face or finger to unlock this app. Your passcode
              will still be required if biometrics fail.
            </CustomText>
            <TouchableOpacity
              onPress={this.goTouchIdSetup}
              style={[style.button]}
            >
              <CustomText center h4 transparentBg thick>
                Use biometrics
              </CustomText>
            </TouchableOpacity>
            <CustomText
              center
              style={[style.noThanks]}
              bg="tertiary"
              tertiary
              h5
              bold
              onPress={this.onNoThanks}
            >
              No thanks
            </CustomText>
          </Container>
        </ScrollView>
      </Container>
    )
  }
  componentDidUpdate(prevProps: LockSelectionProps) {
    if (
      prevProps.showDevMode !== this.props.showDevMode &&
      this.props.showDevMode
    ) {
      Alert.alert(
        'Developer Mode',
        'you are enabling developer mode and it will delete all existing data. Are you sure?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => this.props.disableDevMode(),
          },
          {
            text: 'OK',
            onPress: () =>
              this.props.navigation.navigate(switchEnvironmentRoute),
          },
        ]
      )
    }
  }
}
const mapStateToProps = ({ lock }: Store) => {
  return {
    showDevMode: lock.showDevMode,
  }
}
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      longPressedInLockSelectionScreen,
      pressedOnOrInLockSelectionScreen,
      disableDevMode,
      safeToDownloadSmsInvitation,
      changeEnvironment,
    },
    dispatch
  )
export const lockSelectionScreen = {
  routeName: lockSelectionRoute,
  screen: connect(mapStateToProps, mapDispatchToProps)(LockSelection),
  options: headerDefaultOptions({
    headline: undefined,
    headerHideShadow: true,
    transparent: false,
  }),
}
const marginHorizontalHandler = (curWidth) => {
  if (curWidth >= 411) return OFFSET_3X
  if (curWidth >= 375) return OFFSET_2X
  return OFFSET_1X
}
const style = StyleSheet.create({
  pinSelectionContainer: {
    paddingBottom: isiPhone5 ? OFFSET_1X / 2 : OFFSET_1X,
    paddingHorizontal: OFFSET_2X,
    flexDirection: 'column',
  },
  devSwitchContainer: {
    marginHorizontal: marginHorizontalHandler(width),
    marginTop: moderateScale(OFFSET_2X),
  },
  devSwitchText: {
    alignSelf: 'center',
  },
  title: {
    fontFamily,
    fontSize: moderateScale(26, 0.1),
    fontStyle: 'normal',
    lineHeight: moderateScale(31),
    marginTop: verticalScale(49.26),
    marginBottom: verticalScale(60),
    paddingHorizontal: OFFSET_2X,
    textAlign: 'center',
    fontWeight: '700',
  },
  message: {
    fontSize: moderateScale(17),
    lineHeight: moderateScale(22),
  },
  button: {
    borderRadius: 5,
    marginTop: verticalScale(50),
    marginBottom: verticalScale(17.5),
    backgroundColor: colors.main,
    width: width - OFFSET_2X * 2,
    padding: moderateScale(17),
    paddingLeft: moderateScale(10),
    paddingRight: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gray2,
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowRadius: 5,
    shadowOpacity: 0.3,
    elevation: 7,
  },
  noThanks: {
    color: colors.main,
    lineHeight: moderateScale(34),
  },
  image: {
    marginBottom: verticalScale(50),
  },
})
