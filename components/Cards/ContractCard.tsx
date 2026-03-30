import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, Text, TouchableOpacity } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns, accounting for margins

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
        projectId: projectId,
      },
    });
  };

  return (
    <TouchableOpacity
      onPress={Invitetobids}
      style={{ width: CARD_WIDTH }}
      className="rounded-3xl py-4 flex flex-col items-center border border-gray-300 mx-2"
    >
      <Image
        source={{ uri: contractor.image }}
        style={{ width: CARD_WIDTH * 0.5, height: CARD_WIDTH * 0.5, borderRadius: (CARD_WIDTH * 0.5) / 2 }}
        className="mb-4"
      />

      <Text className="text-xl font-interbold text-gray-900 mb-3 text-center" numberOfLines={2}>
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