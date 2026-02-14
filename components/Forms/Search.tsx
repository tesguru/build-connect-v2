import { View,  TextInput, Image } from 'react-native'
import React from 'react'
import { SearchIcon } from '@/constants/icon'

const Search = () => {
  return (
    <View style={{width:350}} className="flex-row  items-center  bg-gray-100  rounded-full px-3 py-4  border border-gray-200">
      <Image 
        source={SearchIcon} 
        resizeMode="contain"
        className="w-5 h-5 mr-3"
      />
      <TextInput 
        placeholder="Search..."
        placeholderTextColor="black"
        className="flex-1 text-base font-wok-sans text-gray-800"
      />
    </View>
  )
}

export default Search