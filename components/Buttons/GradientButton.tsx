import React, { useEffect, useRef } from "react";
import { TouchableOpacity, Text, ViewStyle, TextStyle, Animated, Easing } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import colors from "@/constants/colors";

type GradientButtonProps = {
    title: string;
    onPress: () => void;
    textColor?: string;
    style?: ViewStyle;      
    textStyle?: TextStyle;
    disabled?: boolean;
    loading?: boolean;
    gradientStart?: { x: number; y: number };
    gradientEnd?: { x: number; y: number };
};

const GradientButton: React.FC<GradientButtonProps> = ({
    title,
    onPress,
    textColor = "#FFFFFF",        
    style,
    textStyle,
    disabled = false,
    loading = false,
    gradientStart = { x: 0, y: 0 },
    gradientEnd = { x: 1, y: 0 },
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
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled || loading}
            style={style}
        >
            <LinearGradient
                colors={colors.gradientColors}
                start={gradientStart}
                end={gradientEnd}
                style={{
                    paddingVertical: 14,
                    paddingHorizontal: 14,
                    borderRadius: 26,
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: disabled ? 0.5 : 1,
                    flexDirection: 'row',
                }}
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
                            className="font-inter" 
                            style={{
                                color: textColor,
                                fontSize: 16,
                                fontWeight: '600',
                                ...textStyle,
                            }}
                        >
                            Loading...
                        </Text>
                    </>
                ) : (
                    <Text 
                        className="font-inter" 
                        style={{
                            color: textColor,
                            fontSize: 16,
                            fontWeight: '600',
                            ...textStyle,
                        }}
                    >
                        {title}
                    </Text>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
}

export default GradientButton;