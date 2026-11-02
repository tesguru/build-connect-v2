import colors from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

type GradientButtonProps = {
    title: string;
    onPress: () => void;
    textColor?: string;
    style?: ViewStyle;      
    textStyle?: TextStyle;
    disabled?: boolean;
    loading?: boolean;
    /** Label shown while loading. Defaults to "Loading..." */
    loadingText?: string;
    /** Real upload progress from 0 to 1. Omit for an indeterminate bar. */
    progress?: number;
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
    loadingText = "Loading...",
    progress,
    gradientStart = { x: 0, y: 0 },
    gradientEnd = { x: 1, y: 0 },
}) => {
    const slideValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!loading || progress != null) {
            slideValue.setValue(0);
            return;
        }

        const loop = Animated.loop(
            Animated.timing(slideValue, {
                toValue: 1,
                duration: 1200,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            })
        );
        loop.start();

        return () => loop.stop();
    }, [loading, progress, slideValue]);

    const translateX = slideValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-140, 420],
    });

    const clampedProgress =
        progress == null ? null : Math.min(Math.max(progress, 0), 1);

    const label = !loading
        ? title
        : clampedProgress == null
            ? loadingText
            : `${loadingText} ${Math.round(clampedProgress * 100)}%`;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled || loading}
            style={style}
            accessibilityState={{ busy: loading, disabled: disabled || loading }}
        >
            <LinearGradient
                colors={colors.gradientColors as [string, string]}
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
                    overflow: 'hidden',
                }}
            >
                <Text 
                    className="font-inter" 
                    style={{
                        color: textColor,
                        fontSize: 16,
                        fontWeight: '600',
                        ...textStyle,
                    }}
                >
                    {label}
                </Text>

                {loading && (
                    <View
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: 4,
                            backgroundColor: `${textColor}33`,
                            overflow: 'hidden',
                        }}
                    >
                        {clampedProgress == null ? (
                            <Animated.View
                                style={{
                                    width: 140,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: textColor,
                                    transform: [{ translateX }],
                                }}
                            />
                        ) : (
                            <View
                                style={{
                                    width: `${clampedProgress * 100}%` as `${number}%`,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: textColor,
                                }}
                            />
                        )}
                    </View>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
}

export default GradientButton;
