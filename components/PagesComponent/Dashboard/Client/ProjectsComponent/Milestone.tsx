import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native'



interface Communication {
  id: string
  title: string
  date: string
}

interface Document {
  id: string
  name: string
}

interface MilestoneDetailProps {
  completionDate?: string
  paymentAmount?: string
  status?: string
  progress?: number
  communications?: Communication[]
  mediaImages?: string[]
  documents?: Document[]
}



const SectionTitle = ({ title }: { title: string }) => (
  <Text className="text-xl font-interbold text-gray-900 mb-3">{title}</Text>
)

const DetailRow = ({
  label,
  value,
  valueStyle,
}: {
  label: string
  value: string
  valueStyle?: string
}) => (
  <View className="flex-row font-inter justify-between items-center py-3.5 border-b border-gray-100">
    <Text className="text-gray-500 font-inter text-[15px]">{label}</Text>
    <Text className={`font-interbold text-[15px] ${valueStyle ?? 'text-gray-900'}`}>
      {value}
    </Text>
  </View>
)

const ProgressBar = ({ progress }: { progress: number }) => (
  <View className="py-3.5">
    <View className="flex-row justify-between items-center mb-2">
      <Text className="text-gray-500 font-inter text-[15px]">Progress</Text>
      <Text className="font-interbold text-[15px] text-gray-900">{progress}%</Text>
    </View>
    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <View
        className="h-full bg-blue-600 rounded-full"
        style={{ width: `${progress}%` }}
      />
    </View>
  </View>
)

const CommunicationItem = ({ item }: { item: Communication }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    className="flex-row items-center bg-white rounded-2xl px-4 py-4 mb-3 shadow-sm"
    style={{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    }}
  >
    {/* Icon */}
    <View className="w-11 h-11 rounded-xl bg-blue-50 items-center justify-center mr-4">
      <Text className="text-lg">💬</Text>
    </View>
    <View className="flex-1">
      <Text className="font-interbold text-gray-900 text-[15px]">{item.title}</Text>
      <Text className="text-gray-400 font-inter text-[13px] mt-0.5">{item.date}</Text>
    </View>
    {/* Chevron */}
    <Text className="text-gray-300 text-lg">›</Text>
  </TouchableOpacity>
)

const MediaGrid = ({ images }: { images: string[] }) => (
  <View className="flex-row flex-wrap gap-3">
    {images.map((uri, index) => (
      <TouchableOpacity
        key={index}
        activeOpacity={0.85}
        className="rounded-2xl overflow-hidden"
        style={{ width: 130, height: 110 }}
      >
        <Image
          source={{ uri }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </TouchableOpacity>
    ))}
  </View>
)

const DocumentItem = ({ doc }: { doc: Document }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    className="flex-row items-center bg-white rounded-2xl px-4 py-4 mb-3 shadow-sm"
    style={{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    }}
  >
    {/* Doc Icon */}
    <View className="w-11 h-11 rounded-xl bg-blue-50 items-center justify-center mr-4">
      <Text className="text-lg">📄</Text>
    </View>
    <Text className="flex-1 font-inter text-gray-900 text-[15px]">{doc.name}</Text>
    <Text className="text-gray-300 text-lg">›</Text>
  </TouchableOpacity>
)



const MilestoneDetailScreen: React.FC<MilestoneDetailProps> = ({
  completionDate = 'Aug 16, 2025',
  paymentAmount = '#12,200,000',
  status = 'Active',
  progress = 68,
  communications = [
    { id: '1', title: 'Meeting Schedule', date: '30/09/2025 · 11AM' },
  ],
  mediaImages = [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&q=80',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&q=80',
  ],
  documents = [
    { id: '1', name: 'Project Plan' },
    { id: '2', name: 'Permit Approvals' },
  ],
}) => {
  return (
   
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16, paddingTop: 16 }}
      >
      
        <View
          className="bg-white rounded-3xl px-5 pt-2 pb-4 mb-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <DetailRow label="Actual Completion Date" value={completionDate} />
          <DetailRow label="Payment Amount" value={paymentAmount} />
          <DetailRow
            label="Status"
            value={status}
            valueStyle="text-blue-600"
          />
          <ProgressBar progress={progress} />
        </View>

       
        <View className="mb-6">
          <SectionTitle title="Communication" />
          {communications.map(item => (
            <CommunicationItem key={item.id} item={item} />
          ))}
        </View>

       
        <View className="mb-6">
          <SectionTitle title="Linked Media" />
          <MediaGrid images={mediaImages} />
        </View>

       
        <View className="mb-2">
          <SectionTitle title="Documents" />
          {documents.map(doc => (
            <DocumentItem key={doc.id} doc={doc} />
          ))}
        </View>
      </ScrollView>

  )
}

export default MilestoneDetailScreen;