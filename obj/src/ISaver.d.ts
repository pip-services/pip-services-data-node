export interface ISaver<T> {
    save(correlation_id: string, entities: T[], callback?: (err?: any) => void): void;
}
