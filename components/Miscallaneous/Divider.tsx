import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';

interface DividerWithTextProps {
  text: string;
  lineColor?: string;
  textColor?: string;
  lineHeight?: number;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

const DividerWithText: React.FC<DividerWithTextProps> = ({
  text,
  lineColor = '#E5E7EB',
  textColor = '#6B7280',
  lineHeight = 2,
  textStyle,
  containerStyle,
}) => {
  return (
    <View 
      className="flex-row items-center justify-center my-6"
      style={containerStyle}
    >
      <View 
        className="flex-1"
        style={{ 
          height: lineHeight, 
          backgroundColor: lineColor 
        }} 
      />
      

      <Text 
        className="mx-4 text-md font-inter text-black"
        style={{ 
          color: textColor,
          ...textStyle,
        }}
      >
        {text}
      </Text>
      
      <View 
        className="flex-1"
        style={{ 
          height: lineHeight, 
          backgroundColor: lineColor 
        }} 
      />
    </View>
  );
};

export default DividerWithText;