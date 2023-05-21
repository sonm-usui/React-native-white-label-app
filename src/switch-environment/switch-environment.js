//@flow
import React, { Component } from 'react'
import { StyleSheet, TextInput } from 'react-native'
import { Container, CustomView, CustomText, CustomButton } from '../components'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import type { Store } from '../store/type-store'
import { FooterActions } from '../components'
import { OFFSET_1X, OFFSET_2X } from '../common/styles'
import { selectRestoreMethodRoute, switchEnvironmentRoute } from '../common'
import { disableDevMode } from '../lock/lock-store'
import type {
  SwitchEnvironmentState,
  SwitchEnvironmentProps,
} from './type-switch-environment'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { withStatusBar } from '../components/status-bar/status-bar'
import { environments } from '../environment'
import { changeEnvironment } from './switсh-environment-store'
import { SERVER_ENVIRONMENT } from './type-switch-environment'

const styles = StyleSheet.create({
  TextInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginHorizontal: OFFSET_1X,
    marginBottom: OFFSET_2X,
    color: 'gray',
  },
  label: {
    marginHorizontal: OFFSET_1X,
  },
})

class SwitchEnvironment extends Component<
  SwitchEnvironmentProps,
  SwitchEnvironmentState
> {
  state = {
    agencyDID: '',
    agencyVerificationKey: '',
    agencyUrl: '',
    poolConfig: '',
    paymentMethod: '',
    domainDID: '',
    verityFlowBaseUrl: '',
    identityCardCredDefId: '',
    drivingLicenseCredDefId: '',
    passportCredDefId: '',
  }

  onSave = () => {
    const {
      agencyDID,
      agencyVerificationKey,
      agencyUrl,
      poolConfig,
      paymentMethod,
      domainDID,
      verityFlowBaseUrl,
      identityCardCredDefId,
      drivingLicenseCredDefId,
      passportCredDefId,
    } = this.state

    this.props.changeEnvironment(
      agencyUrl,
      agencyDID,
      agencyVerificationKey,
      poolConfig,
      paymentMethod,
      domainDID,
      verityFlowBaseUrl,
      identityCardCredDefId,
      drivingLicenseCredDefId,
      passportCredDefId
    )
    this.props.navigation.goBack()
  }

  onSaveAndRestore = () => {
    const {
      agencyDID,
      agencyVerificationKey,
      agencyUrl,
      poolConfig,
      paymentMethod,
      domainDID,
      verityFlowBaseUrl,
      identityCardCredDefId,
      drivingLicenseCredDefId,
      passportCredDefId,
    } = this.state
    this.props.changeEnvironment(
      agencyUrl,
      agencyDID,
      agencyVerificationKey,
      poolConfig,
      paymentMethod,
      domainDID,
      verityFlowBaseUrl,
      identityCardCredDefId,
      drivingLicenseCredDefId,
      passportCredDefId
    )
    this.props.navigation.navigate(selectRestoreMethodRoute)
  }

  onCancel = () => {
    this.props.navigation.goBack()
  }

  componentDidMount() {
    const {
      agencyDID,
      agencyUrl,
      agencyVerificationKey,
      disableDevMode,
      poolConfig,
      paymentMethod,
      domainDID,
      verityFlowBaseUrl,
      identityCardCredDefId,
      drivingLicenseCredDefId,
      passportCredDefId,
    } = this.props
    disableDevMode()
    this.setState({
      agencyDID,
      agencyUrl,
      agencyVerificationKey,
      poolConfig,
      paymentMethod,
      domainDID,
      verityFlowBaseUrl,
      identityCardCredDefId,
      drivingLicenseCredDefId,
      passportCredDefId,
    })
  }

  onSwitchTap = (environment: string) => {
    this.setState(environments[environment])
  }

  render() {
    const testID = 'switch-environment'
    return (
      <Container>
        <Container>
          <CustomView row style={[style.buttonGroup]}>
            <CustomButton
              primary
              title="DEV"
              testID={`${testID}-dev`}
              onPress={() => this.onSwitchTap(SERVER_ENVIRONMENT.DEVELOPMENT)}
            />
            <CustomButton
              primary
              title="SANDBOX"
              testID={`${testID}-sandbox`}
              onPress={() => this.onSwitchTap(SERVER_ENVIRONMENT.SANDBOX)}
            />
            <CustomButton
              primary
              title="STAGING"
              testID={`${testID}-staging`}
              onPress={() => this.onSwitchTap(SERVER_ENVIRONMENT.STAGING)}
            />
            <CustomButton
              primary
              title="DEMO"
              testID={`${testID}-demo`}
              onPress={() => this.onSwitchTap(SERVER_ENVIRONMENT.DEMO)}
            />
          </CustomView>
          <CustomView row style={[style.buttonGroup]}>
            <CustomButton
              primary
              title="QATest1"
              testID={`${testID}-qatest1`}
              onPress={() => this.onSwitchTap(SERVER_ENVIRONMENT.QATEST1)}
            />
            <CustomButton
              primary
              title="QA"
              testID={`${testID}-qa`}
              onPress={() => this.onSwitchTap(SERVER_ENVIRONMENT.QA)}
            />
            <CustomButton
              primary
              title="DEV-RC"
              testID={`${testID}-devrc`}
              onPress={() => this.onSwitchTap(SERVER_ENVIRONMENT.DEVRC)}
            />
          </CustomView>
          <CustomView row style={[style.buttonGroup]}>
            <CustomButton
              primary
              title="DevTeam1"
              testID={`${testID}-devteam1`}
              onPress={() => this.onSwitchTap(SERVER_ENVIRONMENT.DEVTEAM1)}
            />
            <CustomButton
              primary
              title="DevTeam2"
              testID={`${testID}-devteam2`}
              onPress={() => this.onSwitchTap(SERVER_ENVIRONMENT.DEVTEAM2)}
            />
            <CustomButton
              primary
              title="DevTeam3"
              testID={`${testID}-devteam3`}
              onPress={() => this.onSwitchTap(SERVER_ENVIRONMENT.DEVTEAM3)}
            />
          </CustomView>
          <CustomView row style={[style.buttonGroup]}>
            <CustomButton
              primary
              title="Prod"
              testID={`${testID}-prod`}
              onPress={() => this.onSwitchTap(SERVER_ENVIRONMENT.PROD)}
            />
            <CustomButton
              primary
              title="Save and Restore"
              testID={`${testID}-SAVEnRESTORE`}
              onPress={() => this.onSaveAndRestore()}
            />
          </CustomView>
          <KeyboardAwareScrollView>
            <CustomText
              h7
              uppercase
              bold
              bg="tertiary"
              transparentBg
              style={styles.label}
            >
              {'Agency URL'}
            </CustomText>
            <TextInput
              style={styles.TextInput}
              onChangeText={(agencyUrl) => this.setState({ agencyUrl })}
              value={this.state.agencyUrl}
              testID="text-input-agencyUrl"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
            <CustomText
              h7
              uppercase
              bold
              bg="tertiary"
              transparentBg
              style={styles.label}
            >
              {'Agency DID'}
            </CustomText>
            <TextInput
              style={styles.TextInput}
              onChangeText={(agencyDID) => this.setState({ agencyDID })}
              value={this.state.agencyDID}
              testID="text-input-agencyDID"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
            <CustomText
              h7
              uppercase
              bold
              bg="tertiary"
              transparentBg
              style={styles.label}
            >
              {'Agency VerKey'}
            </CustomText>
            <TextInput
              style={styles.TextInput}
              onChangeText={(agencyVerificationKey) =>
                this.setState({ agencyVerificationKey })
              }
              value={this.state.agencyVerificationKey}
              testID="text-input-agencyVerificationKey"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
            <CustomText
              h7
              uppercase
              bold
              bg="tertiary"
              transparentBg
              style={styles.label}
            >
              {'Pool Config'}
            </CustomText>
            <TextInput
              style={styles.TextInput}
              onChangeText={(poolConfig) => this.setState({ poolConfig })}
              value={this.state.poolConfig}
              testID="text-input-poolConfig"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
            <CustomText
              h7
              uppercase
              bold
              bg="tertiary"
              transparentBg
              style={styles.label}
            >
              {'Payment Method'}
            </CustomText>
            <TextInput
              style={styles.TextInput}
              onChangeText={(paymentMethod) => this.setState({ paymentMethod })}
              value={this.state.paymentMethod}
              testID="text-input-paymentMethod"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
            <CustomText
              h7
              uppercase
              bold
              bg="tertiary"
              transparentBg
              style={styles.label}
            >
              {'Domain DID'}
            </CustomText>
            <TextInput
              style={styles.TextInput}
              onChangeText={(domainDID) => this.setState({ domainDID })}
              value={this.state.domainDID}
              testID="text-input-domainDID"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
            <CustomText
              h7
              uppercase
              bold
              bg="tertiary"
              transparentBg
              style={styles.label}
            >
              {'Verity Flow Backend URL'}
            </CustomText>
            <TextInput
              style={styles.TextInput}
              onChangeText={(verityFlowBaseUrl) =>
                this.setState({ verityFlowBaseUrl })
              }
              value={this.state.verityFlowBaseUrl}
              testID="text-input-verityFlowBaseUrl"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
            <CustomText
              h7
              uppercase
              bold
              bg="tertiary"
              transparentBg
              style={styles.label}
            >
              {'Identity Card Cred Def Id'}
            </CustomText>
            <TextInput
              style={styles.TextInput}
              onChangeText={(identityCardCredDefId) =>
                this.setState({ identityCardCredDefId })
              }
              value={this.state.identityCardCredDefId}
              testID="text-input-identityCardCredDefId"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
            <CustomText
              h7
              uppercase
              bold
              bg="tertiary"
              transparentBg
              style={styles.label}
            >
              {'Driving License Cred Def Id'}
            </CustomText>
            <TextInput
              style={styles.TextInput}
              onChangeText={(drivingLicenseCredDefId) =>
                this.setState({ drivingLicenseCredDefId })
              }
              value={this.state.drivingLicenseCredDefId}
              testID="text-input-drivingLicenseCredDefId"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
            <CustomText
              h7
              uppercase
              bold
              bg="tertiary"
              transparentBg
              style={styles.label}
            >
              {'Passport Cred Def Id'}
            </CustomText>
            <TextInput
              style={styles.TextInput}
              onChangeText={(passportCredDefId) =>
                this.setState({ passportCredDefId })
              }
              value={this.state.passportCredDefId}
              testID="text-input-passportCredDefId"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
          </KeyboardAwareScrollView>
        </Container>
        <FooterActions
          onAccept={this.onSave}
          onDecline={this.onCancel}
          denyTitle="Cancel"
          acceptTitle="Save"
          testID={`${testID}-footer`}
        />
      </Container>
    )
  }
}

const mapStateToProps = ({ config }: Store) => {
  return {
    agencyUrl: config.agencyUrl,
    agencyDID: config.agencyDID,
    agencyVerificationKey: config.agencyVerificationKey,
    poolConfig: config.poolConfig,
    paymentMethod: config.paymentMethod,
    domainDID: config.domainDID,
    verityFlowBaseUrl: config.verityFlowBaseUrl,
    identityCardCredDefId: config.identityCardCredDefId,
    drivingLicenseCredDefId: config.drivingLicenseCredDefId,
    passportCredDefId: config.passportCredDefId,
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      changeEnvironment,
      disableDevMode,
    },
    dispatch
  )

export const switchEnvironmentScreen = {
  routeName: switchEnvironmentRoute,
  screen: withStatusBar()(
    connect(mapStateToProps, mapDispatchToProps)(SwitchEnvironment)
  ),
}

const style = StyleSheet.create({
  buttonGroup: {
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    justifyContent: 'space-between',
  },
})
