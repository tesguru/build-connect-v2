import { QuestionImage } from '@/constants/image';
import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface EmptyScreenComponentProps {
  title?: string;
  /** Legacy fallback: used as the title when no title is given. */
  message?: string;
  description?: string;
  icon?: ImageSourcePropType;
  buttonText?: string;
  onButtonPress?: () => void;
}

const EmptyScreenComponent: React.FC<EmptyScreenComponentProps> = ({
  title,
  message,
  description,
  icon = QuestionImage,
  buttonText,
  onButtonPress,
}) => {
  const heading = title ?? message ?? 'Nothing here yet';
  const body = description ?? (message && message !== heading ? message : undefined);

  return (
    <View className="items-center justify-center px-6 py-10">
      <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-4">
        <Image
          style={{ width: 40, height: 40 }}
          source={icon}
          resizeMode="contain"
        />
      </View>

      <Text className="text-gray-900 font-worksanssemibold text-lg text-center">
        {heading}
      </Text>

      {body ? (
        <Text className="text-gray-500 font-inter text-sm text-center mt-2 leading-5 max-w-[280px]">
          {body}
        </Text>
      ) : null}

      {buttonText && onButtonPress ? (
        <TouchableOpacity
          onPress={onButtonPress}
          activeOpacity={0.8}
          className="mt-6 bg-[#007bff] px-6 py-3 rounded-full"
        >
          <Text className="text-white font-inter font-semibold text-sm">
            {buttonText}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default EmptyScreenComponent;
