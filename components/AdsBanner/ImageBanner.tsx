import React from 'react'
import { Image } from 'react-native'
import { View } from 'react-native'

interface ImageData {
    imageSrc: any; // Can be number (require) or object {uri: string}
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    className?: string;
    imageClassName?: string;
}

const ImageBanner: React.FC<ImageData> = ({ 
    imageSrc, 
    width = '100%', 
    height = 200, 
    borderRadius = 0,
    className = "",
    imageClassName = ""
}) => {
    return (
        <View 
            className={`overflow-hidden ${className}`}
            style={{ width, height }}
        >
            <Image 
                source={imageSrc} 
                resizeMode='contain'
                className={`w-full h-full ${imageClassName}`}
                style={{ borderRadius }}
            />
        </View>
    )
}

export default ImageBanner