// @flow
import React from 'react'
import { Text, Animated, StyleSheet } from 'react-native'
import {
  color,
  fontFamily,
  fontSizes as fonts,
} from '../common/styles/constant'
import debounce from 'lodash.debounce'
import type { GenericObject } from '../common/type-common'

export function formatNumbers(num: string) {
  if (num) {
    let numStr = num.toString().split('.')
    numStr[0] = numStr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return numStr.join('.')
  }
  return num
}

class CustomText extends React.Component<GenericObject, void> {
  render() {
    const props = this.props
    const {
      h3,
      h3a,
      h4,
      h4a,
      h6,
      h7,
      bold,
      thick,
      semiBold,
      demiBold,
      center,
      bg = 'primary',
      primary,
      secondary,
      tertiary,
      quaternary,
      quinaryText,
      errorText,
      borderColor,
      style = [],
      testID,
      onPress,
      onLongPress,
      transparentBg,
      uppercase,
      heavy,
      numberOfLines,
      formatNumber,
      fullWidth,
      adjustsFontSizeToFit,
      allowFontScaling,
      animated,
      charcoal,
      secondaryColor,
      darkgray,
      medium,
      // set text color by passing value such as primary, secondary, tertiary
      // to color prop
      // for example: <CustomText bg="primary" color="primary">Text</CustomText>
      color,
      // set size of text from available font sizes
      // ideally we should have only 6-7 sizes and we can try to use
      // following pattern to choose among those sizes
      // <CustomText size="h3" />
      size,
      // show numbers of layout (top, left, width, height) in an alert
      // this props is purely for testing purpose, and should not be used in any
      // production code
      showLayoutDetails = false,
      underline,
      horizontalSpaced,
    } = props

    // preference is given to color prop to set text color
    const colorType = color
      ? capitalizeFirstLetter(color)
      : quaternary
      ? 'Quaternary'
      : secondary
      ? 'Secondary'
      : tertiary
      ? 'Tertiary'
      : 'Primary'
    // preference is given to size prop, so if user pass both size and h3-h7
    // value of size will override other values
    const sizeStyle = size
      ? size
      : h3
      ? 'h3'
      : h3a
      ? 'h3a'
      : h4
      ? 'h4'
      : h4a
      ? 'h4a'
      : h6
      ? 'h6'
      : h7
      ? 'h7'
      : 'h5'
    const fontFamily = 'fontLato'
    const textStyles = [
      styles[sizeStyle],
      styles[fontFamily],
      // $FlowFixMe Flow does not support below syntax for type checking
      styles[`${bg}Bg${colorType}`] || {},
      bold
        ? styles.bold
        : semiBold
        ? styles.semiBold
        : thick
        ? styles.thick
        : demiBold
        ? styles.demiBold
        : heavy
        ? styles.heavy
        : medium
        ? styles.medium
        : null,
      center ? styles.center : null,
      transparentBg ? styles.transparentBg : null,
      quinaryText ? styles.orangeText : null,
      errorText ? styles.errorText : null,
      borderColor ? styles.borderColor : null,
      primary ? styles.primary : null,
      fullWidth ? styles.fullWidth : null,
      charcoal ? styles.colorCharcoal : null,
      secondaryColor ? styles.greyColor : null,
      darkgray ? styles.darkgray : null,
      underline ? styles.underline : null,
      horizontalSpaced ? styles.horizontalSpaced : null,
    ]
    if (Array.isArray(style) && style.length) {
      // style does exist, is an array, and is not empty
      textStyles.push(...style)
    }
    const TextComponent = animated ? Animated.Text : Text

    let filteredProps = {}
    if (typeof onLongPress !== 'undefined') {
      filteredProps.onLongPress = onLongPress
    }
    if (typeof testID !== 'undefined') {
      filteredProps.testID = testID
      filteredProps.accessible = true
      filteredProps.accessibilityLabel = props.children
        ? props.children.toString()
        : testID
    }
    if (typeof onPress !== 'undefined') {
      filteredProps.onPress = debounce(
        (event) => {
          onPress(event)
        },
        300,
        { leading: true, trailing: false }
      )
    }
    if (typeof numberOfLines !== 'undefined') {
      filteredProps.numberOfLines = numberOfLines
    }
    let textChild = props.children
    if (uppercase) {
      textChild = props.children.toUpperCase()
    }
    if (formatNumber) {
      textChild = formatNumbers(props.children)
    }
    if (adjustsFontSizeToFit) {
      filteredProps.adjustsFontSizeToFit = adjustsFontSizeToFit
    }
    if (allowFontScaling && animated) {
      filteredProps.allowFontScaling = allowFontScaling
    } else {
      filteredProps.allowFontScaling = false
    }
    if (props.onLayout) {
      filteredProps.onLayout = props.onLayout
    }
    if (props.onPress) {
      filteredProps.onPress = props.onPress
    }

    if (showLayoutDetails && __DEV__) {
      return (
        <TextComponent
          style={textStyles}
          {...filteredProps}
          ref={(textRef) => (this.textRef = textRef)}
          onLayout={this.onLayout}
        >
          {textChild}
        </TextComponent>
      )
    }

    return (
      <TextComponent
        style={textStyles}
        {...filteredProps}
        suppressHighlighting={true}
      >
        {textChild}
      </TextComponent>
    )
  }

  textRef = null

  // handle onLayout, and get top, left, width and height
  onLayout = () => {
    if (__DEV__) {
      setTimeout(() => {
        this.textRef &&
          this.textRef.measure((fx, fy, width, height, left, top) => {
            alert(`w: ${width}, h: ${height}, x: ${left}, y: ${top}`)
          })
      }, 2000)
    }
  }
}

export default CustomText
//TODO h should start with h1 to h4
export const styles = StyleSheet.create({
  h3: {
    fontSize: fonts.size0,
  },
  h3a: {
    fontSize: fonts.size1,
  },
  h3b: {
    fontSize: fonts.size2,
  },
  h4a: {
    fontSize: fonts.size4,
  },
  h4b: {
    fontSize: fonts.size1,
  },
  h4: {
    fontSize: fonts.size3,
  },
  h5: {
    fontSize: fonts.size4,
  },
  h6: {
    fontSize: fonts.size5,
  },
  h7: {
    fontSize: fonts.size8,
  },
  medium: {
    fontWeight: '500',
  },
  semiBold: {
    fontWeight: '600',
  },
  demiBold: {
    fontWeight: '600',
  },
  bold: {
    fontWeight: 'bold',
  },
  thick: {
    fontWeight: '800',
  },
  heavy: {
    fontWeight: '900',
  },
  center: {
    textAlign: 'center',
  },
  primaryBgPrimary: {
    color: color.bg.primary.font.primary,
    backgroundColor: color.bg.primary.color,
  },
  primaryBgSecondary: {
    color: color.bg.primary.font.secondary,
    backgroundColor: color.bg.primary.color,
  },
  primaryBgTertiary: {
    color: color.bg.primary.font.tertiary,
    backgroundColor: color.bg.primary.color,
  },
  fifthBgPrimary: {
    color: color.bg.fifth.font.primary,
    backgroundColor: color.bg.fifth.color,
  },
  fifthBgTertiary: {
    color: color.bg.fifth.font.primary,
    backgroundColor: color.bg.tertiary.color,
  },
  tertiaryBgPrimary: {
    color: color.bg.tertiary.font.primary,
    backgroundColor: color.bg.tertiary.color,
  },
  tertiaryBgTertiary: {
    color: color.bg.tertiary.font.tertiary,
    backgroundColor: color.bg.tertiary.color,
  },
  tertiaryBgSeventh: {
    color: color.bg.tertiary.font.seventh,
    backgroundColor: color.bg.tertiary.color,
  },
  transparentBg: {
    backgroundColor: 'transparent',
  },
  orangeText: {
    color: color.bg.eighth.color,
  },
  errorText: {
    color: color.bg.tenth.font.color,
  },
  borderColor: {
    borderWidth: 2,
    borderColor: color.bg.eighth.border.color,
  },
  primary: {
    color: color.bg.primary.color,
  },
  fontLato: {
    fontFamily: fontFamily,
  },
  fullWidth: {
    width: '100%',
  },
  colorCharcoal: {
    color: color.textColor.charcoal,
  },
  greyColor: {
    color: color.textColor.grey,
  },
  darkgray: {
    color: color.textColor.darkgray,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  horizontalSpaced: {
    marginHorizontal: 20,
  },
})

function capitalizeFirstLetter(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
