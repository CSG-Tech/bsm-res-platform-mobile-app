import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import JsBarcode from 'jsbarcode';

const BarcodeComponent = ({ value, width = 2, height = 75 }) => {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    try {
      const canvas = { width: 0, height: 0 };
      const ctx = {
        fillRect: (x, y, w, h) => {
          setBars(prev => [...prev, { x, y, w, h }]);
        },
        fillStyle: ''
      };
      
      canvas.getContext = () => ctx;
      
      setBars([]);
      JsBarcode(canvas, value, {
        format: 'CODE128',
        width: width,
        height: height,
        displayValue: false
      });
    } catch (error) {
      console.error('Barcode error:', error);
    }
  }, [value, width, height]);

  return (
    <View>
      <Svg width={bars.reduce((max, b) => Math.max(max, b.x + b.w), 0)} height={height}>
        {bars.map((bar, i) => (
          <Rect key={i} x={bar.x} y={bar.y} width={bar.w} height={bar.h} fill="black" />
        ))}
      </Svg>
    </View>
  );
};

export default BarcodeComponent;