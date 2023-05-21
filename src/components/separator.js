// @flow
import React, { PureComponent } from 'react'
import { StyleSheet } from 'react-native'

import { CustomView } from './layout/custom-view'
import { color } from '../common/styles'

export default class Separator extends PureComponent<void, void> {
  render() {
    return <CustomView style={[styles.separator]} />
  }
}

const styles = StyleSheet.create({
  separator: {
    height: 2,
    backgroundColor: color.bg.secondary.font.tertiary,
  },
})
