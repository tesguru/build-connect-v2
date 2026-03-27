import { useAuthStore } from "@/store/Authstore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { PropertyService } from "../services/property/PropertyService";
import { handleApiError } from "../utils/handleapierror";

export const useProperty = () => {
  const [addPropertySucess, setPropertySuccess] = useState(false);
  const [propertySuccess, setUpdatePropertySuccess] = useState(false);
    const [mortgageSuccess, setMortgageSuccess] = useState(false);
  const { setAuthData } = useAuthStore();
  
    const createPropertyMutation = useMutation({
      mutationFn: PropertyService.createProperties,
      onSuccess: (res: any) => {
        const responseData = res?.data;
        if (
          (responseData.statusCode === 200 || responseData.statusCode === 201) &&
          responseData.success === true
        ) {
          Toast.show({
            type: "success",
            text1: "Project Created",
            text2: "Your property has been created successfully",
          });
          setPropertySuccess(true);
        }
      },
      onError: (error: any) => {
  
        handleApiError(error, "Error creating property")
    
  },
    });

        const createMortgageMutation = useMutation({
      mutationFn: PropertyService.createMortgage,
      onSuccess: (res: any) => {
        const responseData = res?.data;
        if (
          (responseData.statusCode === 200 || responseData.statusCode === 201) &&
          responseData.success === true
        ) {
          Toast.show({
            type: "success",
            text1: "Project Created",
            text2: "Your property has been created successfully",
          });
          setMortgageSuccess(true);
        }
      },
      onError: (error: any) => {
  
        handleApiError(error, "Error creating property")
    
  },
    });

       const updatePropertyMutation = useMutation({
      mutationFn: PropertyService.updateProperties,
      onSuccess: (res: any) => {
        const responseData = res?.data;
        if (
          (responseData.statusCode === 200 || responseData.statusCode === 201) &&
          responseData.success === true
        ) {
          Toast.show({
            type: "success",
            text1: "Property Update",
            text2: "Your property has been updates successfully",
          });
          setUpdatePropertySuccess(true);
        }
      },
      onError: (error: any) => {
  
        handleApiError(error, "Error creating property")
    
  },
    });
 
     const propertyMarketPlaceQuery = ( params: object) => {
  return useQuery({
    queryKey: ['getPropertyQueryMarketplace',  params], 
    queryFn: () => PropertyService.getPropertiesMarketPlace(params),
  });
};

   const viewBuilderMortgages = ( params: object) => {
  return useQuery({
    queryKey: ['viewBuilderMortgages',  params], 
    queryFn: () => PropertyService.viewBuilderMortgage(params),
  });
};

const singleBuilderMortgage = (id :any) => {
    return useQuery({
      queryKey: ['singleBuilderMortgage', id], 
      queryFn: () => PropertyService.singleBuilderMortgage(id),
    });
 };

const myProperty = () => {
  return useQuery({
    queryKey: ['myProperty',], 
    queryFn: () => PropertyService.getProperties(),
  });
};

const myMortgageApplications = () => {
  return useQuery({
    queryKey: ['myProperty',], 
    queryFn: () => PropertyService.viewMortgage(),
  });
};

 const singlePropertyMarketPlaceQuery = (id :any) => {
    return useQuery({
      queryKey: ['singlePropertyQueryMarketplace', id], 
      queryFn: () => PropertyService.singlePropertiesMarketPlace(id),
    });
 };

 

const singleProperty = (id :any) => {
    return useQuery({
      queryKey: ['singleProperties', id], 
      queryFn: () => PropertyService.singleProperties(id),
    });
 };

 const singleMortgageQuery = (id :any) => {
    return useQuery({
      queryKey: ['singlePropertiesQuery', id], 
      queryFn: () => PropertyService.singleMortgage(id),
    });
 };


  return {
    createPropertyMutation,
     addPropertySucess,
     updatePropertyMutation,
     propertyMarketPlaceQuery,
     singlePropertyMarketPlaceQuery,
     myProperty,
     singleProperty,
     createMortgageMutation,
     propertySuccess,
     mortgageSuccess,
     myMortgageApplications,
     singleMortgageQuery,
     singleBuilderMortgage,
     viewBuilderMortgages
  };
};
