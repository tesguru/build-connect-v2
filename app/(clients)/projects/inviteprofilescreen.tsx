import { View, Text, ImageBackground, TouchableOpacity, Image, ScrollView } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router';
import { Check, Star } from 'lucide-react-native';
import AppLayout from '@/components/Layouts/AppLayout';
import GradientButton from '@/components/Buttons/GradientButton';
import { useBids } from '@/core/hooks/UseBids';
import SuccessScreen from '@/components/Notifications/SucessScreen';

interface Contractor {
  name: string;
  rating: number;
  reviews: number;
  projects: string;
  years: number;
  coverImage: string;
}

interface Project {
  id: number;
  title: string;
  image: string;
}

interface Testimonial {
  id: number;
  name: string;
  timeAgo: string;
  avatar: string;
  text: string;
}

interface StatItemProps {
  value: string | number;
  label: string;
}

interface ProjectCardProps {
  project: Project;
  onPress?: () => void;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

interface InviteProfileScreenProps {
  contractor?: Contractor;
}

// Mock data
const services = [
  'Residential New Builds',
  'Renovation',
  'Commercial',
];

// Mock data
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Ethan Morgan',
    timeAgo: '2 months ago',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    text: 'Lorem ipsum dolor sit amet consectetur. Vivert rra a in diam nulla eget sed. Nunc habitasse a cras quis amet est magnis partu rient ut. In is mauris sodales orci senectus integer.',
  },
  {
    id: 2,
    name: 'Bennett Olivia',
    timeAgo: '6 months ago',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    text: 'Lorem ipsum dolor sit amet consectetur. Vivert rra a in diam nulla eget sed. Nunc habitasse a cras quis amet est magnis partu rient ut. In is mauris sodales orci senectus integer.',
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    timeAgo: '1 month ago',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    text: 'Lorem ipsum dolor sit amet consectetur. Vivert rra a in diam nulla eget sed. Nunc habitasse a cras quis amet est magnis partu rient ut. In is mauris sodales orci senectus integer.',
  },
];

// Mock data
const contractorData: Contractor = {
  name: 'Elite Builders',
  rating: 4.5,
  reviews: 81,
  projects: '22+',
  years: 15,
  coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop',
};

const projects: Project[] = [
  {
    id: 1,
    title: 'Modern Home',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
  },
  {
    id: 2,
    title: 'Kitchen Renovation',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop',
  },
  {
    id: 3,
    title: 'Office Space',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
  },
  {
    id: 4,
    title: 'Luxury Villa',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
  },
];

const StatItem: React.FC<StatItemProps> = ({ value, label }) => (
  <View className="flex-1 items-center">
    <Text className="text-4xl font-bold text-gray-900">{value}</Text>
    <Text className="text-base text-gray-600 mt-1">{label}</Text>
  </View>
);

export const ServiceTag = ({ 
  label, 
  onPress 
}: { 
  label: string; 
  onPress?: () => void 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-blue-100 rounded-full px-4 py-3 mr-3 mb-3"
      activeOpacity={0.7}
    >
      <Text className="text-blue-600 text-base font-intersemibold">
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onPress 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="mr-4"
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: project.image }}
        className="w-72 h-48 rounded-3xl"
      />
      <Text className="text-lg font-intersemibold text-gray-900 mt-3">
        {project.title}
      </Text>
    </TouchableOpacity>
  );
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  testimonial 
}) => {
  return (
    <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
      <View className="flex-row items-center mb-4">
        <Image
          source={{ uri: testimonial.avatar }}
          className="w-14 h-14 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="text-lg font-interbold text-gray-900">
            {testimonial.name}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {testimonial.timeAgo}
          </Text>
        </View>
      </View>

      <Text className="text-base font-inter text-gray-600 leading-6 italic">
        {testimonial.text}
      </Text>
    </View>
  );
};

const Inviteprofilescreen: React.FC<InviteProfileScreenProps> = ({ contractor = contractorData }) => {
  const { contractorId, projectId} = useLocalSearchParams<{ contractorId: string, projectId: string }>();
  const { singleContractorQuery, inviteBidMutation, inviteBidsuccess } = useBids();

  const { data, isLoading } = singleContractorQuery(contractorId || "");
    
  const handleInviteToBid = () => {
  const inviteData = {  // Better naming
    projectId: projectId,
    contractorId: contractorId,
    message: "ayyaa",
    expiresInDays: 30
  }

  console.log(inviteData)
  inviteBidMutation.mutate(inviteData);
}

   if (inviteBidsuccess) {
     return (
      <SuccessScreen
  title="Invitation Sent"
  message="Invitation Sent Successfully"
  buttonTitle="View my Projects"
  navigateTo="/(tabs)/projects" 
/>
     );
   }



  return (
    <AppLayout screenName="Elite Builders">
      <View className="mx-4 my-6">
        <ImageBackground
          source={{ uri: contractor.coverImage }}
          className="w-full h-64 rounded-t-3xl overflow-hidden"
          imageStyle={{ opacity: 0.7 }}
        >
          <View className="flex-1 bg-black/20" />
        </ImageBackground>
        
        <View className="bg-white rounded-3xl p-6 -mt-16 mx-4">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-interbold text-gray-900">
              {contractor.name}
            </Text>
            <View className="flex-row items-center gap-1">
              <Star size={20} fill="#FFD700" color="#FFD700" />
              <Text className="text-base font-semibold text-gray-700 ml-1">
                {contractor.rating} ({contractor.reviews}+ reviews)
              </Text>
            </View>
          </View>
          
          <View className="flex-row border-t border-gray-200 pt-4">
            <StatItem value={contractor.projects} label="Projects" />
            <View className="w-px bg-gray-200" />
            <StatItem value={contractor.years} label="Years" />
          </View>
        </View>
        
        <View className="pt-6">
          <Text className="text-xl font-interbold">About us</Text>
          <Text className="text-gray-400 pt-4">
            Lorem ipsum dolor sit amet consectetur. Viverra a in diam nulla eget sed. Nunc habitasse cras quis amet est magnis partu rient ut. In mauris sodales orci senectus integer. Pharetra nunc maecenas nibh lectus quam in ultrices. In mauris sodales orci senectus integer. Pharetra nunc maecenas nibh lectus quam in ultrices.
          </Text>
        </View>

        <View className="bg-gray-100 px-1 py-6">
          {/* Header */}
          <Text className="text-xl font-interbold text-gray-900 mb-6">
            Services Offered
          </Text>

          {/* Services Tags */}
          <View className="flex-row flex-wrap">
            {services.map((service, index) => (
              <ServiceTag
                key={index}
                label={service}
                onPress={() => console.log('Selected:', service)}
              />
            ))}
          </View>
        </View>
        
        <View>
          <View className="flex-1 py-4 mt-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4"
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))}
            </ScrollView>
          </View>

          <View>
            <View className="flex-1 px-4 py-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-interbold text-gray-900">
                  Testimonials
                </Text>
                <TouchableOpacity>
                  <Text className="text-base font-intersemibold text-gray-700">
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Testimonials List */}
              {testimonials.map(testimonial => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </View>
          </View>

          <View>
            <View className="bg-gray-100 px-4 py-6">
              <Text className="text-2xl font-bold text-gray-900 mb-6">
                Certifications & Licenses
              </Text>

              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center mr-4">
                  <Check size={24} color="white" strokeWidth={3} />
                </View>
                <Text className="text-lg text-gray-900">
                  Licensed General Contractor
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center mr-4">
                  <Check size={24} color="white" strokeWidth={3} />
                </View>
                <Text className="text-lg text-gray-900">
                  Certified Green Builder
                </Text>
              </View>

              <View className="mt-14">
                <GradientButton loading={inviteBidMutation.isPending} onPress={handleInviteToBid} title="Invite to bids" />
              </View>
            </View>
          </View>
        </View>
      </View>
    </AppLayout>
  )
}

export default Inviteprofilescreen;