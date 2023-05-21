// @flow
export const CONNECTION_ALREADY_EXISTS = '1062'
export const CREDENTIAL_DEFINITION_NOT_FOUND = '1036'
export const SCHEMA_NOT_FOUND = '1040'
export const INVALID_CREDENTIAL_OFFER = '1043'
export const ACTION_IS_NOT_SUPPORTED = '1103'
export const CLOUD_AGENT_UNAVAILABLE = '1010'
export const NO_POOL_OPEN = '1030'
export const CREDENTIAL_SCHEMA_NOT_FOUND = '1031'
export const WALLET_ITEM_NOT_FOUND = '1073'
export const INVALID_AGENCY_RESPONSE = '1020'
export const NOT_READY = '1005'
export const CONNECTION_UPGRADE_NOT_NEEDED = '1065'

export const CONNECTION_ALREADY_EXISTS_MESSAGE =
  'The connection invitation has already been accepted. ' +
  'Please, request a new invitation.'

export const CREDENTIAL_DEFINITION_NOT_FOUND_MESSAGE =
  'Definition for offered Credential not found on the network application is connected to.'

export const SCHEMA_NOT_FOUND_MESSAGE =
  'Schema for offered Credential not found on the network application is connected to.'

export const INVALID_CREDENTIAL_OFFER_MESSAGE =
  'Offered Credential does not match to its schema definition.'
