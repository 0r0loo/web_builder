import { nanoid } from "nanoid";

/**
 * Generate a unique ID for components
 * Using nanoid with 10 characters (collision probability: ~400 years at 1000 IDs/hour)
 */
export function generateId(): string {
	return nanoid(10);
}

/**
 * Generate a unique ID with a prefix
 */
export function generateIdWithPrefix(prefix: string): string {
	return `${prefix}-${nanoid(8)}`;
}