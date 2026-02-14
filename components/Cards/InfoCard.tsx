import React from 'react';
import { View, Text, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';

interface InfoCardProps {
  icon: ImageSourcePropType;
  title: string;
  subtitle: string;
  titleColor?: string;
  subtitleColor?: string;
  onPress?: () => void;
  touchable?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  subtitle,
  titleColor = '#FFFFFF',
  subtitleColor = '#FFFFFF',
  onPress,
  touchable = true,
}) => {
  const Content = (
    <View className="bg-white/20 px-2 pt-4 pb-6 flex-row gap-2 rounded-xl">
      <View className="mt-4">
        <Image resizeMode="contain" source={icon} className="w-6 h-6" />
      </View>
      <View>
        <Text
          className="font-worksanssemibold text-xl pt-2"
          style={{ color: titleColor }}
        >
          {title}
        </Text>
        <Text
          className="text-sm font-work-sans pt-2"
          style={{ color: subtitleColor }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );

  return touchable ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      {Content}
    </TouchableOpacity>
  ) : (
    Content
  );
};

export default InfoCard;
