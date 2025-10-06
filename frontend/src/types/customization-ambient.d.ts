declare module '../hooks/useCustomization' {
  export interface CustomizationTerminology {
    assets?: string;
    maintenance?: string;
    reports?: string;
    reportSingular?: string;
    dashboard?: string;
    assetSingular?: string;
    maintenanceSingular?: string;
  }
  export interface CustomizationBranding {
    companyName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
  }
  export interface CustomizationData {
    terminology: CustomizationTerminology;
    branding: CustomizationBranding;
  }
  export function useCustomization(): CustomizationData;
}
