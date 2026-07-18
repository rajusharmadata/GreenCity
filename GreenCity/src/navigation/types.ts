export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  'report-detail': { reportId: string };
  'leaderboard': undefined;
  'badges': undefined;
  'eco-route-map': { routeData?: any };
};

export type AuthStackParamList = {
  login: undefined;
  register: undefined;
  'verify-email': { email?: string };
};

export type TabParamList = {
  dashboard: undefined;
  report: undefined;
  'eco-routes': undefined;
  community: undefined;
  profile: undefined;
};

export type NavigationProp<T extends keyof RootStackParamList> = any;
export type AuthNavigationProp<T extends keyof AuthStackParamList> = any;
export type TabNavigationProp<T extends keyof TabParamList> = any;
