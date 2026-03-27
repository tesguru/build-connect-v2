
import { ENDPOINTS } from "@/constants/endpoints";
import axiosInstance from "../axios";



export const PropertyService = {
  getProperties: () => axiosInstance.get(`${ENDPOINTS.PROJECTS.PROPERTIES}/mine`),
  singleProperties: (propertyId :any) => axiosInstance.get(`${ENDPOINTS.PROJECTS.PROPERTIES}/${propertyId}`),
  createProperties: (data :any) => axiosInstance.post(`${ENDPOINTS.PROJECTS.PROPERTIES}/`,  data),
  updateProperties: (data :any) => axiosInstance.patch(`${ENDPOINTS.PROJECTS.PROPERTIES}/${data.id}`,  data),
  getPropertiesMarketPlace: (params: any): Promise<any> => axiosInstance.get(`${ENDPOINTS.PROJECTS.PROPERTIES_MARKETPLACE}/`, { params }),
  singlePropertiesMarketPlace: (id: any): Promise<any> => axiosInstance.get(`${ENDPOINTS.PROJECTS.PROPERTIES_MARKETPLACE}/${id}`),
  createMortgage: (data: any): Promise<any> => axiosInstance.post(`${ENDPOINTS.PROJECTS.PROPERTIES}/${data.propertyId}/mortgage-applications`, data),
  viewMortgage: (): Promise<any> => axiosInstance.get(`${ENDPOINTS.MORTGAGE.MY_MORTGAGE}`),
  singleMortgage: (propertyId: any): Promise<any> => axiosInstance.get(`${ENDPOINTS.MORTGAGE.ClIENT_MORTGAGE}/${propertyId}`),
  viewBuilderMortgage: (params: any): Promise<any> => axiosInstance.get(`${ENDPOINTS.MORTGAGE.MORTGAGE}`, {params}),
  singleBuilderMortgage: (applicationId: any): Promise<any> => axiosInstance.get(`${ENDPOINTS.MORTGAGE.MORTGAGE}/${applicationId}`),
};

