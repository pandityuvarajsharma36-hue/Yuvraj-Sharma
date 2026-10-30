import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, Service, TeamMember, Testimonial, WebsiteSettings } from '../types/index.js';

interface DataContextType {
  settings: WebsiteSettings;
  services: Service[];
  projects: Project[];
  team: TeamMember[];
  testimonials: Testimonial[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WebsiteSettings>({});
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/public/data');
      if (!res.ok) {
        throw new Error(`Failed to load website data (status: ${res.status})`);
      }
      const data = await res.json();
      setSettings(data.settings || {});
      setServices(data.services || []);
      setProjects(data.projects || []);
      setTeam(data.team || []);
      setTestimonials(data.testimonials || []);
    } catch (err: any) {
      console.error('Error fetching website data:', err);
      setError(err.message || 'Unable to connect to server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);

  return (
    <DataContext.Provider
      value={{
        settings,
        services,
        projects,
        team,
        testimonials,
        isLoading,
        error,
        refreshData: fetchPublicData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
