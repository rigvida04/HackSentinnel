
export enum AppMode {
  BEGINNER = 'BEGINNER',
  PROFESSIONAL = 'PROFESSIONAL'
}

export enum Tab {
  SCAN = 'SCAN',
  PORTS = 'PORTS',
  PROTECTION = 'PROTECTION',
  HISTORY = 'HISTORY'
}

export interface PortVulnerability {
  port: number;
  service: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  protectionMethods: string[];
}

export interface SecurityReport {
  score: number;
  status: 'secure' | 'at_risk' | 'compromised';
  confidence: number;
  summary: string;
  indicators: string[];
  vulnerabilities: PortVulnerability[];
  recommendations: string[];
  remediationPlan: string[];
  sources: { title: string; uri: string }[];
}
