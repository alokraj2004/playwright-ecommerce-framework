export interface UserCredentials {
  username: string;
  password: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface ProductInfo {
  name: string;
  price: number;
}

// --- FakeStoreAPI e-commerce API models (used by API test suite) ---
export interface ApiProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
}

export interface ApiCartItem {
  productId: number;
  quantity: number;
}

export interface ApiCart {
  id?: number;
  userId: number;
  date?: string;
  products: ApiCartItem[];
}

export interface ApiUser {
  id?: number;
  email: string;
  username: string;
  password: string;
  name?: {
    firstname: string;
    lastname: string;
  };
}

export interface ApiLoginResponse {
  token: string;
}

// --- AI failure analysis ---
export interface TestFailureContext {
  testName: string;
  filePath: string;
  errorMessage: string;
  stackTrace: string;
  screenshotPath?: string;
  tracePath?: string;
  tags: string[];
  retryCount: number;
}

export type FailureCategory = 'product-bug' | 'automation-bug' | 'environment-issue' | 'flaky-test' | 'unknown';

export interface AiFailureAnalysis {
  probableRootCause: string;
  category: FailureCategory;
  suggestedFix: string;
  confidence: 'low' | 'medium' | 'high';
}
