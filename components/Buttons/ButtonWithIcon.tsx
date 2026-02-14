import React from "react";
import { TouchableOpacity, Text, View, Image, ViewStyle, TextStyle, ImageStyle } from "react-native";

type ButtonProps = {
    title: string;
    onPress: () => void;
    backgroundColor?: string;
    textColor?: string;
    style?: ViewStyle | string;      
    textStyle?: TextStyle | string;
    icon?: React.ReactNode | string; 
    iconPosition?: "left" | "right";
    iconStyle?: ImageStyle | ViewStyle;
    iconSize?: number;
    disabled?: boolean;
};

const ButtonWithIcon: React.FC<ButtonProps> = ({
    title,
    onPress,
    backgroundColor = "F3F4F6F", 
    textColor = "black",        
    style,
    textStyle,
    icon,
    iconPosition = "left",
    iconStyle,
    iconSize = 20,
    disabled = false,
}) => {
   
    const renderIcon = () => {
        if (!icon) return null;

        if (typeof icon === "string") {
            // If icon is a string, treat it as an image URI
            return (
                <Image className="bg-red-200"
                    source={{ uri: icon }}
                    style={[
                        { width: iconSize, height: iconSize },
                        iconStyle
                    ]}
                    resizeMode="contain"
                />
            );
        } else {
            return <View style={iconStyle}>{icon}</View>;
        }
    };

    return (
        <TouchableOpacity
            className={`py-3.5 border border-gray-400 px-3.5 rounded-[26px] h-[50px] w-full items-center justify-center ${
                disabled ? 'opacity-50' : ''
            }`}
            style={[
                { backgroundColor },
                style
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled}
        >
            <View className="flex-row items-center justify-center">
                {icon && (
                    <Image
                        source={icon}
                        style={{ width: iconSize, height: iconSize, marginRight: 8 }}
                        resizeMode="contain"
                    />
                )}
                
                <Text 
                    className="text-base font-inter font-semibold"
                    style={[
                        { color: textColor },
                        textStyle
                    ]}
                >
                    {title}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export default ButtonWithIcon;