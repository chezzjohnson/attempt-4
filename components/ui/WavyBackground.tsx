import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface WavyBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  colors?: string[];
  waveOpacity?: number;
  height?: number;
}

export function WavyBackground({
  children,
  style,
  colors = ['#38bdf8', '#818cf8', '#c084fc', '#e879f9', '#22d3ee'],
  waveOpacity = 0.3,
  height = 300,
}: WavyBackgroundProps) {
  const { width: screenWidth } = require('react-native').Dimensions.get('window');

  const createWavePath = (offset: number, amplitude: number, frequency: number) => {
    let path = `M 0 ${height / 2}`;
    
    for (let x = 0; x <= screenWidth; x += 5) {
      const y = height / 2 + 
        Math.sin((x / frequency) + offset) * amplitude +
        Math.sin((x / (frequency * 0.5)) + offset) * (amplitude * 0.3);
      path += ` L ${x} ${y}`;
    }
    
    path += ` L ${screenWidth} ${height} L 0 ${height} Z`;
    return path;
  };

  return (
    <View style={[{ position: 'relative', height }, style]}>
      <Svg
        width={screenWidth}
        height={height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 0,
        }}
      >
        <Defs>
          <LinearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors[0]} stopOpacity={waveOpacity} />
            <Stop offset="25%" stopColor={colors[1]} stopOpacity={waveOpacity} />
            <Stop offset="50%" stopColor={colors[2]} stopOpacity={waveOpacity} />
            <Stop offset="75%" stopColor={colors[3]} stopOpacity={waveOpacity} />
            <Stop offset="100%" stopColor={colors[4]} stopOpacity={waveOpacity} />
          </LinearGradient>
          <LinearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors[4]} stopOpacity={waveOpacity * 0.7} />
            <Stop offset="25%" stopColor={colors[0]} stopOpacity={waveOpacity * 0.7} />
            <Stop offset="50%" stopColor={colors[1]} stopOpacity={waveOpacity * 0.7} />
            <Stop offset="75%" stopColor={colors[2]} stopOpacity={waveOpacity * 0.7} />
            <Stop offset="100%" stopColor={colors[3]} stopOpacity={waveOpacity * 0.7} />
          </LinearGradient>
        </Defs>
        
        {/* Multiple wave layers for depth */}
        <Path
          d={createWavePath(0, 40, 200)}
          fill="url(#waveGradient1)"
        />
        <Path
          d={createWavePath(Math.PI / 3, 30, 150)}
          fill="url(#waveGradient2)"
        />
        <Path
          d={createWavePath(Math.PI / 6, 20, 100)}
          fill="url(#waveGradient1)"
        />
      </Svg>
      
      <View style={{ position: 'relative', zIndex: 1, flex: 1 }}>
        {children}
      </View>
    </View>
  );
} 