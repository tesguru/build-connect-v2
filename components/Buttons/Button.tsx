import React from "react";
import { TouchableOpacity, Text, ViewStyle, TextStyle } from "react-native";

type ButtonProps = {
    title: string;
    onPress: () => void;
    backgroundColor?: string;
    textColor?: string;
    style?: ViewStyle;      
    textStyle?: TextStyle; 
    className?: string; 
    textClassName?: string; 
    disabled?: boolean;
};

const PrimaryButton: React.FC<ButtonProps> = ({
    title,
    onPress,
    backgroundColor = "#007AFF", 
    textColor = "#FFFFFF",        
    style,
    textStyle,
    className = "",
    textClassName = "",
    disabled = false,
}) => {
    return (
        <TouchableOpacity
            className={`py-3.5 px-3.5 rounded-[26px] h-[50px] w-full items-center justify-center ${
                disabled ? 'opacity-50' : ''
            } ${className}`}
            style={[
                { backgroundColor },
                style
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled}
        >
            <Text 
                className={`text-base font-inter font-semibold ${textClassName}`}
                style={[
                    { color: textColor },
                    textStyle
                ]}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}

export default PrimaryButton;