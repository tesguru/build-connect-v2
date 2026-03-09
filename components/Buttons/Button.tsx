import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

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
    loading?: boolean;
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
    loading = false,
}) => {
    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (loading) {
            Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            spinValue.setValue(0);
        }
    }, [loading]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <TouchableOpacity
            className={`py-3.5 px-3.5 rounded-[26px] h-[50px] w-full items-center justify-center flex-row ${
                disabled || loading ? 'opacity-50' : ''
            } ${className}`}
            style={[
                { backgroundColor },
                style
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled || loading}
        >
            {loading ? (
                <>
                    <Animated.View
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            borderWidth: 3,
                            borderColor: `${textColor}40`,
                            borderTopColor: textColor,
                            marginRight: 10,
                            transform: [{ rotate: spin }],
                        }}
                    />
                    <Text
                        className={`text-base font-inter font-semibold ${textClassName}`}
                        style={[{ color: textColor }, textStyle]}
                    >
                        Loading...
                    </Text>
                </>
            ) : (
                <Text 
                    className={`text-base font-inter font-semibold ${textClassName}`}
                    style={[{ color: textColor }, textStyle]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

export default PrimaryButton;