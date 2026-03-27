import ClientPropertiesComponent from '@/components/Cards/ClientPropertiesComponent';
import AppLayout from '@/components/Layouts/AppLayout';
import EmptyScreenComponent from '@/components/Miscallaneous/EmptyScreenComponent';
import { useProperty } from '@/core/hooks/useProperty';
import { LookupService } from '@/core/services/lookup/LookupService';
import type { MarketplaceProperty } from '@/core/types/api';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { SlidersHorizontal, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


interface PropertyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  propertyTypeId?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
}

const BEDROOM_OPTIONS = [
  { label: 'Any', value: undefined },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5+', value: 5 },
];

const BATHROOM_OPTIONS = [
  { label: 'Any', value: undefined },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4+', value: 4 },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function countActiveFilters(params: PropertyQueryParams): number {
  return [
    params.propertyTypeId,
    params.minPrice,
    params.maxPrice,
    params.location,
    params.bedrooms,
    params.bathrooms,
  ].filter((v) => v !== undefined && v !== '' && v !== null).length;
}

// ── Screen ─────────────────────────────────────────────────────────────────────
const ClientPropertiesScreen = () => {
  const router = useRouter();
  const { propertyMarketPlaceQuery } = useProperty();

  const [queryParams, setQueryParams] = useState<PropertyQueryParams>({
    page: 1,
    limit: 20,
  });
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // ── Draft filter state (inside modal) ───────────────────
  const [draftTypeId, setDraftTypeId] = useState<string | undefined>();
  const [draftMinPrice, setDraftMinPrice] = useState('');
  const [draftMaxPrice, setDraftMaxPrice] = useState('');
  const [draftLocation, setDraftLocation] = useState('');
  const [draftBedrooms, setDraftBedrooms] = useState<number | undefined>();
  const [draftBathrooms, setDraftBathrooms] = useState<number | undefined>();

  // ── Property types for filter dropdown ──────────────────
  const { data: propertyTypesResponse } = useQuery({
    queryKey: ['propertyTypes'],
    queryFn: async () => {
      const res = await LookupService.getPropertyTypes();
      return res.data.data.items;
    },
  });
  const propertyTypes = propertyTypesResponse ?? [];

  // ── Main query ───────────────────────────────────────────
  const {
    data: apiResponse,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = propertyMarketPlaceQuery(queryParams);

  const propertiesList: MarketplaceProperty[] =
    apiResponse?.data?.data?.properties ?? [];
  const pagination = apiResponse?.data?.data?.pagination;

  // ── Search — fires on submit ─────────────────────────────
  const handleSearch = () => {
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      search: searchText.trim() || undefined,
    }));
  };

  const clearSearch = () => {
    setSearchText('');
    setQueryParams((prev) => ({ ...prev, page: 1, search: undefined }));
  };

  // ── Open modal — seed drafts from current params ─────────
  const openFilterModal = () => {
    setDraftTypeId(queryParams.propertyTypeId);
    setDraftMinPrice(queryParams.minPrice ? String(queryParams.minPrice) : '');
    setDraftMaxPrice(queryParams.maxPrice ? String(queryParams.maxPrice) : '');
    setDraftLocation(queryParams.location ?? '');
    setDraftBedrooms(queryParams.bedrooms);
    setDraftBathrooms(queryParams.bathrooms);
    setShowFilterModal(true);
  };

  // ── Apply filters ────────────────────────────────────────
  const applyFilters = () => {
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      propertyTypeId: draftTypeId || undefined,
      minPrice: draftMinPrice ? parseFloat(draftMinPrice) : undefined,
      maxPrice: draftMaxPrice ? parseFloat(draftMaxPrice) : undefined,
      location: draftLocation.trim() || undefined,
      bedrooms: draftBedrooms,
      bathrooms: draftBathrooms,
    }));
    setShowFilterModal(false);
  };

  // ── Clear all filters ────────────────────────────────────
  const clearAllFilters = () => {
    setDraftTypeId(undefined);
    setDraftMinPrice('');
    setDraftMaxPrice('');
    setDraftLocation('');
    setDraftBedrooms(undefined);
    setDraftBathrooms(undefined);
    setQueryParams({ page: 1, limit: 20, search: searchText.trim() || undefined });
    setShowFilterModal(false);
  };

  const activeFilterCount = countActiveFilters(queryParams);

  // ── Chip helper ──────────────────────────────────────────
  const SelectChip = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full border mr-2 mb-2 ${
        selected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'
      }`}
    >
      <Text className={`text-sm font-inter ${selected ? 'text-white' : 'text-gray-700'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <AppLayout screenName="Properties" fullHeightContent>
      <View className="flex-1">

        {/* ── Search + Filter bar ── */}
        <View className="pt-3 px-4 flex-row items-center gap-3">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 gap-2">
            <TextInput
              className="flex-1 font-inter text-sm text-gray-800"
              placeholder="Search properties..."
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <X size={16} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter button */}
          <TouchableOpacity
            onPress={openFilterModal}
            className="relative bg-gray-100 rounded-xl p-3"
          >
            <SlidersHorizontal size={20} color={activeFilterCount > 0 ? '#2563eb' : '#374151'} />
            {activeFilterCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-blue-600 rounded-full w-4 h-4 items-center justify-center">
                <Text className="text-white text-xs font-interbold" style={{ fontSize: 9 }}>
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Active filter chips ── */}
        {activeFilterCount > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, gap: 8 }}
            style={{ maxHeight: 48 }}
          >
            {queryParams.propertyTypeId && (
              <TouchableOpacity
                className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1"
                onPress={() => setQueryParams((p) => ({ ...p, propertyTypeId: undefined, page: 1 }))}
              >
                <Text className="text-blue-600 text-xs font-intersemibold">
                  {propertyTypes.find((t) => t.id === queryParams.propertyTypeId)?.label ?? 'Type'}
                </Text>
                <X size={12} color="#2563eb" />
              </TouchableOpacity>
            )}
            {(queryParams.minPrice || queryParams.maxPrice) && (
              <TouchableOpacity
                className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1"
                onPress={() => setQueryParams((p) => ({ ...p, minPrice: undefined, maxPrice: undefined, page: 1 }))}
              >
                <Text className="text-blue-600 text-xs font-intersemibold">
                  {queryParams.minPrice && queryParams.maxPrice
                    ? `₦${queryParams.minPrice.toLocaleString()} – ₦${queryParams.maxPrice.toLocaleString()}`
                    : queryParams.minPrice
                    ? `From ₦${queryParams.minPrice.toLocaleString()}`
                    : `Up to ₦${queryParams.maxPrice!.toLocaleString()}`}
                </Text>
                <X size={12} color="#2563eb" />
              </TouchableOpacity>
            )}
            {queryParams.location && (
              <TouchableOpacity
                className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1"
                onPress={() => setQueryParams((p) => ({ ...p, location: undefined, page: 1 }))}
              >
                <Text className="text-blue-600 text-xs font-intersemibold">{queryParams.location}</Text>
                <X size={12} color="#2563eb" />
              </TouchableOpacity>
            )}
            {queryParams.bedrooms !== undefined && (
              <TouchableOpacity
                className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1"
                onPress={() => setQueryParams((p) => ({ ...p, bedrooms: undefined, page: 1 }))}
              >
                <Text className="text-blue-600 text-xs font-intersemibold">{queryParams.bedrooms} bed(s)</Text>
                <X size={12} color="#2563eb" />
              </TouchableOpacity>
            )}
            {queryParams.bathrooms !== undefined && (
              <TouchableOpacity
                className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1"
                onPress={() => setQueryParams((p) => ({ ...p, bathrooms: undefined, page: 1 }))}
              >
                <Text className="text-blue-600 text-xs font-intersemibold">{queryParams.bathrooms} bath(s)</Text>
                <X size={12} color="#2563eb" />
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* ── Property list ── */}
        <View className="pt-4 flex-1">
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#2463EB" />
              <Text className="text-gray-500 font-inter mt-3">Loading properties...</Text>
            </View>
          ) : isError ? (
            <View className="flex-1 justify-center items-center py-20 px-4">
              <Text className="text-gray-700 font-inter text-center">
                Unable to load properties. Pull down to retry.
              </Text>
            </View>
          ) : propertiesList.length === 0 ? (
            <EmptyScreenComponent message="No properties found" />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
              }
            >
              {propertiesList.map((property, index) => (
                <ClientPropertiesComponent
                  key={property?.id ?? `property-${index}`}
                  property={property}
                  onPress={() =>
                    router.push({
                      pathname: '/(clients)/properties/propertiesdetails',
                      params: { id: property.id },
                    })
                  }
                />
              ))}

             
              {pagination && (
                <View className="py-6 items-center">
                  <Text className="text-gray-500 text-sm mb-2">
                    Showing {propertiesList.length} of {pagination.total} properties
                  </Text>
                  {pagination.page < pagination.totalPages && (
                    <TouchableOpacity
                      className="bg-blue-600 px-6 py-3 rounded-xl"
                      onPress={() =>
                        setQueryParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                      }
                    >
                      <Text className="text-white font-intersemibold">Load More</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>

     
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 bg-white">

          <View className="flex-row justify-between items-center px-5 pt-6 pb-4 border-b border-gray-100">
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <X size={22} color="#374151" />
            </TouchableOpacity>
            <Text className="font-interbold text-lg text-gray-900">Filters</Text>
            <TouchableOpacity onPress={clearAllFilters}>
              <Text className="text-blue-600 font-intersemibold text-sm">Clear all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          >

            <View className="mt-6">
              <Text className="font-interbold text-base text-gray-900 mb-3">Property Type</Text>
              <View className="flex-row flex-wrap">
                <SelectChip
                  label="Any"
                  selected={!draftTypeId}
                  onPress={() => setDraftTypeId(undefined)}
                />
                {propertyTypes.map((type) => (
                  <SelectChip
                    key={type.id}
                    label={type.label}
                    selected={draftTypeId === type.id}
                    onPress={() => setDraftTypeId(type.id)}
                  />
                ))}
              </View>
            </View>

           
            <View className="mt-6">
              <Text className="font-interbold text-base text-gray-900 mb-3">Price Range (₦)</Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 font-inter mb-1">Min Price</Text>
                  <TextInput
                    className="bg-gray-100 rounded-xl px-3 py-3 font-inter text-sm text-gray-800"
                    placeholder="e.g 500000"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={draftMinPrice}
                    onChangeText={setDraftMinPrice}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 font-inter mb-1">Max Price</Text>
                  <TextInput
                    className="bg-gray-100 rounded-xl px-3 py-3 font-inter text-sm text-gray-800"
                    placeholder="e.g 5000000"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={draftMaxPrice}
                    onChangeText={setDraftMaxPrice}
                  />
                </View>
              </View>
            </View>

          
            <View className="mt-6">
              <Text className="font-interbold text-base text-gray-900 mb-3">Location</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-3 py-3 font-inter text-sm text-gray-800"
                placeholder="e.g Lagos, Abuja..."
                placeholderTextColor="#9ca3af"
                value={draftLocation}
                onChangeText={setDraftLocation}
              />
            </View>

        
            <View className="mt-6">
              <Text className="font-interbold text-base text-gray-900 mb-3">Bedrooms</Text>
              <View className="flex-row flex-wrap">
                {BEDROOM_OPTIONS.map((opt) => (
                  <SelectChip
                    key={String(opt.value)}
                    label={opt.label}
                    selected={draftBedrooms === opt.value}
                    onPress={() => setDraftBedrooms(opt.value)}
                  />
                ))}
              </View>
            </View>

         
            <View className="mt-6">
              <Text className="font-interbold text-base text-gray-900 mb-3">Bathrooms</Text>
              <View className="flex-row flex-wrap">
                {BATHROOM_OPTIONS.map((opt) => (
                  <SelectChip
                    key={String(opt.value)}
                    label={opt.label}
                    selected={draftBathrooms === opt.value}
                    onPress={() => setDraftBathrooms(opt.value)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
    
          <View
            className="absolute bottom-0 left-0 right-0 bg-white px-5 pb-8 pt-4"
            style={{ borderTopWidth: 1, borderTopColor: '#f1f5f9' }}
          >
            <TouchableOpacity
              className="bg-blue-600 rounded-2xl py-4 items-center"
              onPress={applyFilters}
              activeOpacity={0.88}
            >
              <Text className="text-white font-interbold text-base">
                Apply Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppLayout>
  );
};

export default ClientPropertiesScreen;