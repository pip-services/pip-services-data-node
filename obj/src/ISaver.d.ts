export interface ISaver<T> {
    save(correlation_id: string, items: T[], callback?: (err?: any) => void): void;
}
