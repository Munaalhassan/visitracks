import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Building } from '@/types/visitor';
import { supabase } from '@/integrations/supabase/client';

interface BuildingContextType {
  currentBuilding: Building | null;
  setCurrentBuilding: (building: Building | null) => void;
  buildings: Building[];
  isLoading: boolean;
  verifyBuildingCode: (code: string) => Building | null;
  logout: () => void;
}

const BuildingContext = createContext<BuildingContextType | undefined>(undefined);

export function BuildingProvider({ children }: { children: ReactNode }) {
  const [currentBuilding, setCurrentBuildingState] = useState<Building | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBuildings = async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('is_active', true);
      
      if (!error && data) {
        setBuildings(data as Building[]);
      }
      setIsLoading(false);
    };

    fetchBuildings();

    // Check for saved building in session storage
    const savedBuildingId = sessionStorage.getItem('currentBuildingId');
    if (savedBuildingId) {
      supabase
        .from('buildings')
        .select('*')
        .eq('id', savedBuildingId)
        .single()
        .then(({ data }) => {
          if (data) {
            setCurrentBuildingState(data as Building);
          }
        });
    }
  }, []);

  const setCurrentBuilding = (building: Building | null) => {
    setCurrentBuildingState(building);
    if (building) {
      sessionStorage.setItem('currentBuildingId', building.id);
    } else {
      sessionStorage.removeItem('currentBuildingId');
    }
  };

  const verifyBuildingCode = (code: string): Building | null => {
    const building = buildings.find(b => b.code.toLowerCase() === code.toLowerCase());
    return building || null;
  };

  const logout = () => {
    setCurrentBuilding(null);
  };

  return (
    <BuildingContext.Provider value={{
      currentBuilding,
      setCurrentBuilding,
      buildings,
      isLoading,
      verifyBuildingCode,
      logout,
    }}>
      {children}
    </BuildingContext.Provider>
  );
}

export function useBuilding() {
  const context = useContext(BuildingContext);
  if (context === undefined) {
    throw new Error('useBuilding must be used within a BuildingProvider');
  }
  return context;
}
