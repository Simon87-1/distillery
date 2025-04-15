interface TokenResponse {
  need_patient_banner: boolean;
  id_token: string;
  smart_style_url: string;
  active_ttl: number;
  encounter: string;
  token_type: string;
  access_token: string;
  refresh_token: string;
  patient: string;
  scope: string;
  expires_in: number;
  user: string;
  tenant: string;
  username: string;
}

interface State {
  clientId: string;
  scope: string;
  redirectUri: string;
  serverUrl: string;
  tokenResponse: TokenResponse;
}

interface EnvironmentOptions {
  replaceBrowserHistory: boolean;
  fullSessionStorageSupport: boolean;
  refreshTokenWithCredentials: string;
}

interface Environment {
  _url: string;
  _storage: Record<string, unknown>;
  security: Record<string, unknown>;
  options: EnvironmentOptions;
}

interface Encounter {
  id: string;
}

interface User {
  fhirUser: string;
  id: string;
  resourceType: string;
}

export interface PatientName {
  id: string;
  use: string;
  text: string;
  family: string;
  given: string[];
  period: {
    start: string;
  };
}

export interface Patient {
  id: string;
  gender: string;
  birthDate: string;
  name?: PatientName[];
}

export interface Client {
  units: Record<string, unknown>;
  state: State;
  environment: Environment;
  _refreshTask: null | unknown;
  patient: Patient;
  encounter: Encounter;
  user: User;
  key: string;
  registrationUri: string;
  authorizeUri: string;
  tokenUri: string;
  codeChallengeMethods: string[];
  expiresAt: number;
}
