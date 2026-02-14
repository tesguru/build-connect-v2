
import { Star } from 'lucide-react-native';
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
export const ContractorListItem = ({ contractor, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white rounded-xl px-4 py-3 mb-3"
      activeOpacity={0.7}
    >
      <View className="flex flex-row items-center">
  
        <Image 
          source={{ uri: contractor.image }}
          className="w-10 h-10 rounded-full mr-3"
        />
        
     
        <View className="flex-1">
   
          <Text className="text-base font-semibold text-gray-900 mb-0.5">
            {contractor.name}
          </Text>
          
     
          <View className="flex flex-row items-center">
            <Text className="text-sm mr-1 pt-5"> <Star
                size={22}
                fill= '#FFD700'
                color='#FFD700'
              /></Text>
            <Text className="text-sm text-gray-600">
              {contractor.rating} ({contractor.reviews}+ reviews)
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};