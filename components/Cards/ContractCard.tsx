import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity } from "react-native";

interface Contractor {
  image: string;
  name: string;
  rating: number;
  reviews: number;
}

interface ContractorCardProps {
  contractor: Contractor;
  contractorid: string; 
  projectId: string;
}

export const ContractorCard: React.FC<ContractorCardProps> = ({ contractor, contractorid, projectId }) => {
  const router = useRouter();
  
  const Invitetobids = () => {
    router.replace({
      pathname: "/projects/inviteprofilescreen",
      params: { 
        contractorId: contractorid,
        projectId: projectId 
      }
    });
  };

  return (
    <TouchableOpacity onPress={Invitetobids} className="rounded-3xl py-4 flex flex-col items-center w-[185px] m-4 border border-gray-300 mx-2">
      <Image 
        source={{ uri: contractor.image }}
        className="w-32 h-32 rounded-full mb-4"
      />
      
      <Text className="text-xl font-interbold text-gray-900 mb-3 text-center">
        {contractor.name}
      </Text>
      
      <TouchableOpacity onPress={Invitetobids} className="w-full px-6 rounded-lg">
        <Text className="font-intersemibold text-gray-700 text-center">
          Invite to Bid
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};