import { View, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { arrowleft, SettingsIcon } from '@/constants/icon'
import Search from '@/components/Forms/Search'
import AppLayout from '@/components/Layouts/AppLayout'
import NotificationBox from '@/components/Miscallaneous/NotificationBox'




const NotificationScreen = () => {

  return (
  <AppLayout screenName="Notification">
    <View className="flex-row pt-5 gap-2 px-2">
          <View className="">
            <Search />
          </View>
          <TouchableOpacity>
            <Image source={SettingsIcon} className="w-14 h-14" />
          </TouchableOpacity>
        </View>

       <View>
        <NotificationBox/>
           <NotificationBox/>
       </View>
     
  </AppLayout>
    
    
     
  )
}

export default NotificationScreen