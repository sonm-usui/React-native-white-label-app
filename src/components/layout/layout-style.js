// @flow

import { StyleSheet } from 'react-native'

import {
  PADDING_HORIZONTAL,
  PADDING_VERTICAL,
  color,
  OFFSET_2X,
} from '../../common/styles/constant'

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  horizontalSpaced: {
    paddingHorizontal: PADDING_HORIZONTAL,
  },
  verticalSpaced: {
    paddingVertical: PADDING_VERTICAL,
  },
  doubleVerticalSpaced: {
    paddingVertical: PADDING_VERTICAL * 2,
  },
  transparentBg: {
    backgroundColor: 'transparent',
  },
  primaryBg: {
    backgroundColor: color.bg.primary.color,
  },
  secondaryBg: {
    backgroundColor: color.bg.secondary.color,
  },
  tertiaryBg: {
    backgroundColor: color.bg.tertiary.color,
  },
  quaternaryBg: {
    backgroundColor: color.bg.quaternary.color,
  },
  fifthBg: {
    backgroundColor: color.bg.fifth.color,
  },
  senaryBg: {
    backgroundColor: color.bg.sixth.color,
  },
  darkBg: {
    backgroundColor: color.bg.dark.color,
  },
  yellowBg: {
    backgroundColor: color.bg.yellow.color,
  },  
  left: {
    // this is assuming that we are aligning items in column
    alignItems: 'flex-start',
  },
  right: {
    alignItems: 'flex-end',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hCenter: {
    justifyContent: 'center',
  },
  vCenter: {
    alignItems: 'center',
  },
  rowBottom: {
    alignItems: 'flex-end',
  },
  columnBottom: {
    justifyContent: 'flex-end',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  list: {
    marginHorizontal: OFFSET_2X,
  },
  listItem: {
    marginVertical: OFFSET_2X,
  },
  shadow: {
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 30,
    elevation: 10,
  },
  imageShadow: {
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    elevation: 3,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  shadowNoOffset: {
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 10,
  },
  absolute: {
    position: 'absolute',
  },
  absoluteTopRight: {
    top: 0,
    right: 0,
  },
  absoluteTopLeft: {
    top: 0,
    left: 0,
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  zeroWidthBottomBorder: {
    borderBottomWidth: 0,
  },
})
