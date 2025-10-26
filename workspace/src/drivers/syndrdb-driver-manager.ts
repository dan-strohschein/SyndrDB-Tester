import { SyndrDBDriver } from "./syndrdb-driver";

/**
 * Global singleton manager for SyndrDB driver instance
 * Ensures all components use the same connected driver
 */
export class SyndrDBDriverManager {
    private static instance: SyndrDBDriverManager;
    private driver: SyndrDBDriver | null = null;

    private constructor() {}

    public static getInstance(): SyndrDBDriverManager {
        if (!SyndrDBDriverManager.instance) {
            SyndrDBDriverManager.instance = new SyndrDBDriverManager();
        }
        return SyndrDBDriverManager.instance;
    }

    public getDriver(): SyndrDBDriver {
        if (!this.driver) {
            this.driver = new SyndrDBDriver();
        }
        return this.driver;
    }

    public setDriver(driver: SyndrDBDriver): void {
        this.driver = driver;
    }

    public isConnected(): boolean {
        return this.driver ? this.driver.isConnected() : false;
    }
}

// Export convenience function for easy access
export function getSyndrDBDriver(): SyndrDBDriver {
    return SyndrDBDriverManager.getInstance().getDriver();
}