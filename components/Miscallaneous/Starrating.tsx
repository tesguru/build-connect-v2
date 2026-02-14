import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';

export default function StarRating() {
  const [rating, setRating] = useState(3);
  const totalStars = 5;

  return (
    <View className="flex-1 justify-center items-center ">
      <View className="flex-row gap-2">
        {[...Array(totalStars)].map((_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= rating;
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => setRating(starNumber)}
              className="p-1"
            >
              <Star
                size={32}
                fill={isFilled ? '#FFD700' : '#E5E7EB'}
                color={isFilled ? '#FFD700' : '#E5E7EB'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}