import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { locationService, officeService } from "../services/api";

const LocationContext = createContext();

const STORAGE_KEY = "sgqs_selected_location";

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse stored location:", e);
    }
    return {
      state: { name: "Tamil Nadu", code: "TN" },
      district: { name: "Coimbatore", code: "CBE" },
      taluk: { name: "Pollachi", code: "POL" },
      office: null,
    };
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [loadingOffices, setLoadingOffices] = useState(false);

  // Auto-resolve a default office if state has no office yet
  useEffect(() => {
    const initDefaultOffice = async () => {
      if (selectedLocation?.office?._id) return;

      try {
        setLoadingOffices(true);
        const res = await officeService.getAll();
        if (res.success && res.data && res.data.length > 0) {
          // Look for Pollachi or first available office
          const defaultOff =
            res.data.find(
              (o) =>
                o.taluk?.toLowerCase() === "pollachi" ||
                o.name?.toLowerCase().includes("pollachi")
            ) || res.data[0];

          if (defaultOff) {
            const initialLocation = {
              state: {
                _id: defaultOff.stateRef?._id || null,
                name: defaultOff.state || "Tamil Nadu",
                code: defaultOff.stateRef?.code || "TN",
              },
              district: {
                _id: defaultOff.districtRef?._id || null,
                name: defaultOff.district || "Coimbatore",
                code: defaultOff.districtRef?.code || "CBE",
              },
              taluk: {
                _id: defaultOff.talukRef?._id || null,
                name: defaultOff.taluk || "Pollachi",
                code: defaultOff.talukRef?.code || "POL",
              },
              office: defaultOff,
            };

            setSelectedLocation(initialLocation);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialLocation));
          }
        }
      } catch (err) {
        console.error("Failed to initialize default office:", err);
      } finally {
        setLoadingOffices(false);
      }
    };

    initDefaultOffice();
  }, [selectedLocation?.office?._id]);

  const selectLocation = useCallback((newLocation) => {
    setSelectedLocation(newLocation);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
    } catch (e) {
      console.error("Failed to save location to storage:", e);
    }
  }, []);

  const clearLocation = useCallback(() => {
    setSelectedLocation({
      state: { name: "Tamil Nadu", code: "TN" },
      district: null,
      taluk: null,
      office: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const openLocationModal = useCallback(() => setIsLocationModalOpen(true), []);
  const closeLocationModal = useCallback(() => setIsLocationModalOpen(false), []);

  const isLocationSelected = Boolean(selectedLocation?.office?._id);

  const breadcrumb = selectedLocation?.office
    ? `${selectedLocation.state?.name || "Tamil Nadu"} / ${selectedLocation.district?.name || ""} / ${selectedLocation.taluk?.name || ""} / ${selectedLocation.office?.name || ""}`
    : selectedLocation?.district?.name
    ? `${selectedLocation.state?.name || "Tamil Nadu"} / ${selectedLocation.district?.name}`
    : "Select your service location";

  const officeName = selectedLocation?.office?.name || "Select Government Office";

  const value = {
    selectedLocation,
    selectedOffice: selectedLocation?.office,
    selectedOfficeId: selectedLocation?.office?._id || null,
    selectedTaluk: selectedLocation?.taluk,
    selectedDistrict: selectedLocation?.district,
    selectedState: selectedLocation?.state,
    isLocationSelected,
    breadcrumb,
    officeName,
    selectLocation,
    clearLocation,
    isLocationModalOpen,
    openLocationModal,
    closeLocationModal,
    loadingOffices,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};

export default LocationContext;
