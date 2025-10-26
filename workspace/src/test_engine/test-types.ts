export interface TestResult {
    testName: string;
    success: boolean;
    responseMessage: string;
    errorMessage?: string;
    executionTimeMs: number;
}

export interface TestSummary {
    category: string;
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
}