import { View, Text } from 'react-native';
import React, { useState } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import FileUploadComponent from '@/components/Forms/FileUploadComponent';
import { reportImage } from '@/constants/icon';

const ProfessionalDocumentation = () => {
  const { control } = useFormContext();
  const { errors } = useFormState({ control });
  
  const [contractorLicenseError, setContractorLicenseError] = useState<string | null>(null);
  const [insuranceDocError, setInsuranceDocError] = useState<string | null>(null);
  const [additionalCertError, setAdditionalCertError] = useState<string | null>(null);

  return (
    <View>
      <View>
        <FileUploadComponent
          control={control}
          name="contractorLicense"
          label="Business/Contractor License"
          title="Upload License Document"
          note="PNG, JPG, PDF (max. 5MB)"
          icon={reportImage}
          maxSizeMB={5}
          error={contractorLicenseError || (errors.contractorLicense?.message as string)}
          onError={(error) => setContractorLicenseError(error || null)}
        />
      </View>
      
      <View className="pt-2">
        <FileUploadComponent
          control={control}
          name="insuranceDocumentation"
          label="Insurance Documentation"
          title="Upload Insurance Certificate"
          note="Liability & Workers Compensation (max. 5MB)"
          icon={reportImage}
          maxSizeMB={5}
          error={insuranceDocError || (errors.insuranceDocumentation?.message as string)}
          onError={(error) => setInsuranceDocError(error || null)}
        />
      </View>
      
      <View className="pt-2">
        <FileUploadComponent
          control={control}
          name="additionalInformation"
          label="Additional Certifications (Optional)"
          title="Upload Certifications"
          note="Trade certifications, safety training, etc. (max. 5MB)"
          icon={reportImage}
          maxSizeMB={5}
          error={additionalCertError || (errors.additionalInformation?.message as string)}
          onError={(error) => setAdditionalCertError(error || null)}
        />
      </View>
    </View>
  );
};

export default ProfessionalDocumentation;