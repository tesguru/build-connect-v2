import AppLayout from '@/components/Layouts/AppLayout';
import { useAuth } from '@/core/hooks/useAuth';
import { useAuthStore } from '@/store/Authstore';
import {
  Award,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  FileText,
  ImageIcon,
  MapPin,
  ShieldCheck,
  User
} from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


const formatDate = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatFileSize = (bytes?: string) => {
  if (!bytes) return null;
  const size = parseInt(bytes);
  if (isNaN(size)) return null;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getVerificationStatusConfig = (status: string) => {
  const s = status?.toLowerCase();
  if (s === 'verified')
    return {
      dot: 'bg-green-400',
      label: 'Verified',
      labelColor: 'text-green-600',
      tagBg: 'bg-green-50',
    };
  if (s === 'rejected')
    return {
      dot: 'bg-red-400',
      label: 'Rejected',
      labelColor: 'text-red-500',
      tagBg: 'bg-red-50',
    };
  if (s === 'pending')
    return {
      dot: 'bg-amber-400',
      label: 'Pending Review',
      labelColor: 'text-amber-600',
      tagBg: 'bg-amber-50',
    };
  return {
    dot: 'bg-gray-400',
    label: 'Not Started',
    labelColor: 'text-gray-500',
    tagBg: 'bg-gray-50',
  };
};

const getDocStatusConfig = (status: string) => {
  const s = status?.toLowerCase();
  if (s === 'uploaded')
    return { label: 'Uploaded', color: 'text-green-600', bg: 'bg-green-50' };
  if (s === 'pending')
    return { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50' };
  if (s === 'rejected')
    return { label: 'Rejected', color: 'text-red-500', bg: 'bg-red-50' };
  return { label: status || 'Unknown', color: 'text-gray-500', bg: 'bg-gray-50' };
};

const getDocIcon = (type: string) => {
  const t = type?.toLowerCase();
  if (t?.includes('profile_picture') || t?.includes('profile')) return ImageIcon;
  if (t?.includes('license') || t?.includes('business')) return Building2;
  if (t?.includes('insurance')) return ShieldCheck;
  if (t?.includes('certification') || t?.includes('cert')) return Award;
  if (t?.includes('id') || t?.includes('identity')) return User;
  if (t?.includes('income')) return Briefcase;
  return FileText;
};

const formatDocType = (type: string) =>
  type?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Document';


const Divider = () => <View className="h-px bg-gray-100 mx-4" />;


const InfoRow = ({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) => (
  <>
    <View className="px-4 py-4 flex-row justify-between items-center">
      <Text className="font-inter text-gray-500">{label}</Text>
      <Text
        className="font-interbold text-base text-gray-900 flex-1 text-right ml-4"
        numberOfLines={2}
      >
        {value || '—'}
      </Text>
    </View>
    {!last && <Divider />}
  </>
);


const DocumentCard = ({
  type,
  description,
  url,
  uploadedAt,
  status,
  fileSize,
  mimeType,
}: {
  type: string;
  description?: string;
  url?: string;
  uploadedAt?: string;
  status?: string;
  fileSize?: string;
  mimeType?: string;
}) => {
  const DocIcon = getDocIcon(type);
  const docStatus = getDocStatusConfig(status || '');
  const size = formatFileSize(fileSize);

  return (
    <TouchableOpacity
      onPress={() => url && Linking.openURL(url)}
      activeOpacity={0.8}
      className="flex-row items-center gap-3 bg-gray-50 rounded-xl p-3 mb-3"
    >
      <View className="bg-blue-50 rounded-xl p-3">
        <DocIcon size={18} color="#2563EB" />
      </View>
      <View className="flex-1">
        <Text className="font-interbold text-gray-800 text-sm" numberOfLines={1}>
          {description || formatDocType(type)}
        </Text>
        <View className="flex-row items-center gap-2 mt-0.5 flex-wrap">
          {uploadedAt && (
            <Text className="font-inter text-gray-400 text-xs">
              {formatDate(uploadedAt)}
            </Text>
          )}
          {size && (
            <Text className="font-inter text-gray-300 text-xs">· {size}</Text>
          )}
          {mimeType && (
            <Text className="font-inter text-gray-300 text-xs">
              · {mimeType.split('/')[1]?.toUpperCase()}
            </Text>
          )}
        </View>
        {status && (
          <View className={`mt-1.5 self-start px-2 py-0.5 rounded-full ${docStatus.bg}`}>
            <Text className={`font-interbold text-xs ${docStatus.color}`}>
              {docStatus.label}
            </Text>
          </View>
        )}
      </View>
      <View className="bg-blue-50 rounded-lg p-2">
        <ExternalLink size={14} color="#2563EB" />
      </View>
    </TouchableOpacity>
  );
};


const Timeline = ({
  submittedAt,
  verificationStatus,
}: {
  submittedAt?: string;
  verificationStatus: string;
}) => {
  const status = verificationStatus?.toLowerCase();
  const isUnderReview = ['pending', 'verified', 'rejected'].includes(status);
  const isDecided = ['verified', 'rejected'].includes(status);

  const steps = [
    {
      label: 'Documents Submitted',
      sub: 'Your documents were received',
      date: submittedAt,
      done: !!submittedAt,
    },
    {
      label: 'Under Admin Review',
      sub: 'Being reviewed by our team',
      date: isUnderReview ? submittedAt : null,
      done: isUnderReview,
    },
    {
      label: 'Decision Made',
      sub: 'Final outcome communicated',
      date: isDecided ? submittedAt : null,
      done: isDecided,
    },
  ];

  return (
    <View className="bg-white m-4 rounded-xl">
      <Text className="font-interbold px-4 pt-4 text-xl pb-4">
        Verification Timeline
      </Text>
      <Divider />
      <View className="px-4 pb-4 pt-4">
        {steps.map((step, index, arr) => (
          <View key={step.label} className="flex-row gap-4">
            <View className="items-center w-6">
              <View
                className={`w-6 h-6 rounded-full items-center justify-center ${
                  step.done ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                {step.done ? (
                  <CheckCircle2 size={14} color="#fff" />
                ) : (
                  <Circle size={10} color="#CBD5E1" />
                )}
              </View>
              {index < arr.length - 1 && (
                <View
                  className={`w-0.5 flex-1 mt-1 min-h-8 ${
                    step.done ? 'bg-blue-200' : 'bg-gray-100'
                  }`}
                />
              )}
            </View>
            <View className={`flex-1 ${index < arr.length - 1 ? 'pb-6' : 'pb-0'}`}>
              <Text
                className={`font-interbold text-sm ${
                  step.done ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {step.label}
              </Text>
              <Text className="font-inter text-gray-400 text-xs mt-0.5">
                {step.sub}
              </Text>
              <View
                className={`mt-2 self-start rounded-lg px-2 py-1 ${
                  step.done ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <Text
                  className={`font-inter text-xs ${
                    step.done ? 'text-blue-600' : 'text-gray-300'
                  }`}
                >
                  {step.date ? formatDate(step.date) : 'Pending'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};


const BuilderVerificationView = ({
  contractorProfile,
  verificationStatus,
  userData, // Add userData prop to get user info
}: {
  contractorProfile: any;
  verificationStatus: string;
  userData: any; // Added this
}) => {
  const sc = getVerificationStatusConfig(verificationStatus);

  // Get user info from main userData instead of contractorProfile
  const fullName = userData?.firstName && userData?.lastName 
    ? `${userData.firstName} ${userData.lastName}`
    : '—';
  const email = userData?.email || '—';
  const mobileNumber = userData?.mobileNumber || '—';

  const documents = [
    contractorProfile?.profilePicture && {
      type: 'profile_picture',
      description: contractorProfile.profilePicture.description || 'Profile Picture',
      url: contractorProfile.profilePicture.publicUrl,
      uploadedAt: contractorProfile.profilePicture.createdAt,
      status: contractorProfile.profilePicture.status,
      fileSize: contractorProfile.profilePicture.fileSize,
      mimeType: contractorProfile.profilePicture.mimeType,
    },
    contractorProfile?.businessLicense && {
      type: 'business_license',
      description: contractorProfile.businessLicense.description || 'Business License',
      url: contractorProfile.businessLicense.publicUrl,
      uploadedAt: contractorProfile.businessLicense.createdAt,
      status: contractorProfile.businessLicense.status,
      fileSize: contractorProfile.businessLicense.fileSize,
      mimeType: contractorProfile.businessLicense.mimeType,
    },
    contractorProfile?.insuranceDocument && {
      type: 'insurance_document',
      description: contractorProfile.insuranceDocument.description || 'Insurance Document',
      url: contractorProfile.insuranceDocument.publicUrl,
      uploadedAt: contractorProfile.insuranceDocument.createdAt,
      status: contractorProfile.insuranceDocument.status,
      fileSize: contractorProfile.insuranceDocument.fileSize,
      mimeType: contractorProfile.insuranceDocument.mimeType,
    },
    contractorProfile?.certification && {
      type: 'certification',
      description: contractorProfile.certification.description || 'Certification',
      url: contractorProfile.certification.publicUrl,
      uploadedAt: contractorProfile.certification.createdAt,
      status: contractorProfile.certification.status,
      fileSize: contractorProfile.certification.fileSize,
      mimeType: contractorProfile.certification.mimeType,
    },
  ].filter(Boolean);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 48 }}
    >
      {/* Status Overview Card */}
      <View className="pt-4 bg-white m-4 rounded-xl">
        <View className="flex-row items-center justify-between px-4 mb-3">
          <View className="flex-row items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
            <Briefcase size={13} color="#64748B" />
            <Text className="text-slate-500 text-xs font-inter">Builder Profile</Text>
          </View>
          <View
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${sc.tagBg}`}
          >
            <View className={`w-2 h-2 rounded-full ${sc.dot}`} />
            <Text className={`text-xs font-interbold ${sc.labelColor}`}>
              {sc.label}
            </Text>
          </View>
        </View>

        <Text className="font-interbold text-xl px-4 pb-1">
          {contractorProfile?.businessName || '—'}
        </Text>

        <View className="flex-row items-center gap-1.5 px-4 pb-4">
          <MapPin size={13} color="#9CA3AF" />
          <Text className="text-gray-400 text-sm font-inter">
            {contractorProfile?.location || '—'}
          </Text>
        </View>

        <Divider />

        <View className="px-4 py-4 flex-row justify-between items-center">
          <Text className="font-inter text-gray-500">Date Submitted</Text>
          <View className="flex-row items-center gap-1.5">
            <CalendarDays size={14} color="#9CA3AF" />
            <Text className="font-interbold text-base">
              {formatDate(contractorProfile?.createdAt)}
            </Text>
          </View>
        </View>

        <Divider />

        <View className="px-4 py-4 flex-row justify-between items-center">
          <Text className="font-inter text-gray-500">Last Updated</Text>
          <View className="flex-row items-center gap-1.5">
            <Clock size={14} color="#9CA3AF" />
            <Text className="font-interbold text-base">
              {formatDate(contractorProfile?.updatedAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Business Information */}
      <View className="bg-white m-4 rounded-xl">
        <Text className="font-interbold px-4 pt-4 text-xl pb-2">
          Business Information
        </Text>
        <Divider />

        <InfoRow
          label="Business Name"
          value={contractorProfile?.businessName}
        />
        <InfoRow
          label="Location"
          value={contractorProfile?.location}
          last
        />
      </View>

      {/* Account Information - Using userData instead */}
      <View className="bg-white m-4 rounded-xl">
        <Text className="font-interbold px-4 pt-4 text-xl pb-2">
          Account Information
        </Text>
        <Divider />
        <InfoRow
          label="Full Name"
          value={fullName}
        />
        <InfoRow
          label="Email"
          value={email}
        />
        <InfoRow
          label="Phone"
          value={mobileNumber}
          last
        />
      </View>

  

      {/* Documents Section - Show if any documents exist */}
      {documents.length > 0 && (
        <View className="bg-white m-4 rounded-xl">
          <Text className="font-interbold px-4 pt-4 text-xl pb-4">
            Submitted Documents
          </Text>
          <Divider />
          <View className="px-4 pt-4">
            {documents.map((doc: any) => (
              <DocumentCard
                key={doc.type}
                type={doc.type}
                description={doc.description}
                url={doc.url}
                uploadedAt={doc.uploadedAt}
                status={doc.status}
                fileSize={doc.fileSize}
                mimeType={doc.mimeType}
              />
            ))}
          </View>
        </View>
      )}

      {/* Timeline */}
      <Timeline
        submittedAt={contractorProfile?.createdAt}
        verificationStatus={verificationStatus}
      />
    </ScrollView>
  );
};


const ClientVerificationView = ({
  verification,
  verificationStatus,
}: {
  verification: any;
  verificationStatus: string;
}) => {

  const clientStatus = verification?.verificationStatus ?? verificationStatus;
  const sc = getVerificationStatusConfig(clientStatus);
  const documents = verification?.documents || [];
  const firstDocDate = documents[0]?.uploadedAt;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 48 }}
    >
   
      <View className="pt-4 bg-white m-4 rounded-xl">
        <View className="flex-row items-center justify-between px-4 mb-3">
          <View className="flex-row items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
            <ShieldCheck size={13} color="#64748B" />
            <Text className="text-slate-500 text-xs font-inter">
              Identity Verification
            </Text>
          </View>
          <View
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${sc.tagBg}`}
          >
            <View className={`w-2 h-2 rounded-full ${sc.dot}`} />
            <Text className={`text-xs font-interbold ${sc.labelColor}`}>
              {sc.label}
            </Text>
          </View>
        </View>

        <Text className="font-interbold text-xl px-4 pb-1">
          Verification Details
        </Text>
        <Text className="font-inter text-gray-400 text-sm px-4 pb-4">
          Your submitted identity documents and current status
        </Text>

        <Divider />

        <View className="px-4 py-4 flex-row justify-between items-center">
          <Text className="font-inter text-gray-500">Date Submitted</Text>
          <View className="flex-row items-center gap-1.5">
            <CalendarDays size={14} color="#9CA3AF" />
            <Text className="font-interbold text-base">
              {formatDate(firstDocDate)}
            </Text>
          </View>
        </View>

        <Divider />

        <View className="px-4 py-4 flex-row justify-between items-center">
          <Text className="font-inter text-gray-500">Documents Submitted</Text>
          <Text className="font-interbold text-base">{documents.length}</Text>
        </View>

    
        {verification?.missingDocuments?.length > 0 && (
          <>
            <Divider />
            <View className="px-4 py-4">
              <Text className="font-inter text-gray-500 mb-2">
                Missing Documents
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {verification.missingDocuments.map((doc: string) => (
                  <View key={doc} className="bg-red-50 px-3 py-1 rounded-full">
                    <Text className="font-interbold text-red-500 text-xs capitalize">
                      {formatDocType(doc)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </View>

   
      {documents.length > 0 && (
        <View className="bg-white m-4 rounded-xl">
          <Text className="font-interbold px-4 pt-4 text-xl pb-4">
            Submitted Documents
          </Text>
          <Divider />
          <View className="px-4 pt-4">
            {documents.map((doc: any) => (
              <DocumentCard
                key={doc.id}
                type={doc.documentType}
                description={formatDocType(doc.documentType)}
                url={doc.fileUrl}
                uploadedAt={doc.uploadedAt}
                status={doc.status}
              />
            ))}
          </View>
        </View>
      )}

   
      <Timeline
        submittedAt={firstDocDate}
        verificationStatus={clientStatus}
      />
    </ScrollView>
  );
};


const VerificationDetailsScreen = () => {
  const { user } = useAuthStore();
  const { getUserProfile } = useAuth();

  const { data, isLoading, error } = getUserProfile();

  const userData = data?.data?.data;
  const userRole = user?.role;
  const verificationStatus = userData?.verificationStatus ?? 'not_started';

  if (isLoading) {
    return (
      <AppLayout screenName="Verification Details">
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#2463EB" />
          <Text className="mt-4 text-gray-600 font-inter">Loading details...</Text>
        </View>
      </AppLayout>
    );
  }

  if (error || !userData) {
    return (
      <AppLayout screenName="Verification Details">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center font-inter">
            Failed to load verification details. Please try again.
          </Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout screenName="Verification Details">
      {userRole === 'builder' ? (
        <BuilderVerificationView
          contractorProfile={userData?.contractorProfile}
          verificationStatus={verificationStatus}
          userData={userData} // Pass the full userData
        />
      ) : (
        <ClientVerificationView
          verification={userData?.verification}
          verificationStatus={verificationStatus}
        />
      )}
    </AppLayout>
  );
};

export default VerificationDetailsScreen;