import React from 'react';
import { View, Text, Image, TouchableOpacity, ImageSourcePropType, Button } from 'react-native';
import { ClockIcon, DollarCircle, HeartIcon, LocationIcon, MarkCircle, UserIcon } from '@/constants/icon';
import StatusBar from '../Miscallaneous/StatusBar';
import ProgressBar from '../Miscallaneous/ProgressBar';
import InfoCard from './InfoCard';


interface ProjectsComponentProps {
  postedTime: string;
  projectName: string;
  location: string;
  description: string;
  budget: string;
  duration: string;
  bids: string;
  role:string;
  progress:number;
  onPress?: () => void;
  heartIcon?: ImageSourcePropType;
  locationIcon?: ImageSourcePropType;
  clockIcon?: ImageSourcePropType;
  userIcon?: ImageSourcePropType;
}

const ProjectsWithMilestone: React.FC<ProjectsComponentProps> = ({

  projectName,
  location,
  description,
  budget,
  role,
  progress,
  onPress,
  heartIcon = HeartIcon,
  locationIcon = LocationIcon,

}) => {
  return (
    <TouchableOpacity className=" mt-2 p-4 bg-white rounded-xl" onPress={onPress}>
    

      <View>
        <View className="flex-row justify-between">
        <Text className="text-xl font-worksanssemibold">{projectName}</Text>
        <StatusBar title={"Active"}/>
       </View>


           <Text className="py-3 font-inter">{description}</Text>
      <ProgressBar progress={progress}/>
        <View className="flex-row gap-2 py-3 items-center">
          <Image source={locationIcon} style={{ width: 15, height: 15 }} resizeMode="contain" />
          <Text className="font-inter">{location}</Text>
        </View>
{role == "client" ? (
  "" 
) : (
  <View>
    <View className="flex-row items-center mt-4 gap-2">
      <View className="flex-1">
        <InfoCard
          icon={DollarCircle}
          title={budget}
          subtitle="Total Budget"
          subtitleColor="black"
          touchable={false}
          titleColor={"black"}
        />
      </View>
      <View className="flex-1">
        <InfoCard
          icon={MarkCircle}
          title="#218,800"
          subtitle="Earned"
          subtitleColor="black"
          touchable={false}
          titleColor={"black"}
        />
      </View>
    </View>

    <View className="flex-row justify-between">
      <View>
        <Text className="font-inter">Next Milestone</Text>
        <Text className="font-inter">Electrical</Text>
        <Text className="pt-6 font-inter">Due: 23/04/2025</Text>
      </View>
      <View className="pt-14">
        <StatusBar title={"Approved"}/>
      </View>
    </View>
  </View>
)}
        

      </View>
    </TouchableOpacity>
  );
};

export default ProjectsWithMilestone;
