export interface ILoader<T> {
    load(correlation_id: string, callback: (err: any, data: T[]) => void): void;
}
