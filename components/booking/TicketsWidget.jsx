import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Dimensions } from 'react-native';



const TicketWidget = ({ children, style }) => {

  const SCREEN_WIDTH = Dimensions.get('window').width;
  const HORIZONTAL_MARGIN = 32;
  const width = SCREEN_WIDTH - 32;

  const height = 320;
  const cornerRadius = 24;
  const cutoutRadius = 18;
  const cutoutY = height * 0.33;

  const shadowPadding = 20;
  const svgWidth = width + shadowPadding * 2;
  const svgHeight = height + shadowPadding * 2;

  const SHADOW_X_OFFSET = -3; 
  const SHADOW_Y_OFFSET = -2; 

  const ticketPath = [
    `M ${cornerRadius} 0`,
    `H ${width - cornerRadius}`,
    `A ${cornerRadius} ${cornerRadius} 0 0 1 ${width} ${cornerRadius}`,
    `V ${cutoutY - cutoutRadius}`,
    `A ${cutoutRadius} ${cutoutRadius} 0 0 0 ${width} ${cutoutY + cutoutRadius}`,
    `V ${height - cornerRadius}`,
    `A ${cornerRadius} ${cornerRadius} 0 0 1 ${width - cornerRadius} ${height}`,
    `H ${cornerRadius}`,
    `A ${cornerRadius} ${cornerRadius} 0 0 1 0 ${height - cornerRadius}`,
    `V ${cutoutY + cutoutRadius}`,
    `A ${cutoutRadius} ${cutoutRadius} 0 0 0 0 ${cutoutY - cutoutRadius}`,
    `V ${cornerRadius}`,
    `A ${cornerRadius} ${cornerRadius} 0 0 1 ${cornerRadius} 0`,
    'Z',
  ].join(' ');

  return (
    <View style={[styles.container, style, { width: svgWidth, height: svgHeight }]}>
      <Svg width={svgWidth} height={svgHeight}>
        <Path
          d={ticketPath}
          fill="rgba(255, 255, 255, 0.46)" 
          transform={`translate(${shadowPadding + SHADOW_X_OFFSET}, ${shadowPadding + SHADOW_Y_OFFSET}) scale(1.03)`}
        />
        <Path
          d={ticketPath}
          fill="rgba(255, 250, 250, 0.61)"
          transform={`translate(${shadowPadding + SHADOW_X_OFFSET}, ${shadowPadding + SHADOW_Y_OFFSET}) scale(1.04)`}
        />
        <Path
          d={ticketPath}
          fill="rgba(248, 244, 244, 0.4)"
          transform={`translate(${shadowPadding + SHADOW_X_OFFSET}, ${shadowPadding + SHADOW_Y_OFFSET}) scale(1.03)`}
        />
        <Path
          d={ticketPath}
          fill="rgba(202, 191, 191, 0.13)"
          transform={`translate(${shadowPadding + SHADOW_X_OFFSET}, ${shadowPadding + SHADOW_Y_OFFSET}) scale(1.02)`}
        />
        <Path
          d={ticketPath}
          fill="rgba(230, 230, 230, 0.21)"
          transform={`translate(${shadowPadding + SHADOW_X_OFFSET}, ${shadowPadding + SHADOW_Y_OFFSET}) scale(1.01)`}
        />

        <Path
          d={ticketPath}
          fill="white"
          transform={`translate(${shadowPadding}, ${shadowPadding})`}
        />
      </Svg>

      <View
        style={[
          styles.contentContainer,
          { width, height, top: shadowPadding, left: shadowPadding },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginVertical: 12,
  },
  contentContainer: {
    position: 'absolute',
    padding: 14,
  },
});

export default TicketWidget;