// Import functions used for testing suggesting priorities
import { suggestGradePriority, suggestDatePriority } from '../utils/suggestPriority';

// Unmock the module to ensure that real implementations are used
jest.unmock('../utils/suggestPriority');

describe('suggestGradePriority', () => {
    // Test to return Low for grades A and B
    it('should return Low for grades A and B', () => {
        expect(suggestGradePriority('A')).toBe('Low');
        expect(suggestGradePriority('B')).toBe('Low');
    });

    // Test to return Medium for grade C
    it('should return Medium for grade C', () => {
        expect(suggestGradePriority('C')).toBe('Medium');
    });

    // Test to return High for grade D
    it('should return High for grade D', () => {
        expect(suggestGradePriority('D')).toBe('High');
    });

    // Test to return Urgent for grades E and F
    it('should return Urgent for grades E and F', () => {
        expect(suggestGradePriority('E')).toBe('Urgent');
        expect(suggestGradePriority('F')).toBe('Urgent');
    });

    // Test to return N/A for unknown grades or when grade is undefined/null
    it('should return N/A for unknown grades or when grade is undefined/null', () => {
        expect(suggestGradePriority('Z')).toBe('N/A');
        expect(suggestGradePriority(null)).toBe('N/A');
        expect(suggestGradePriority(undefined)).toBe('N/A');
    });
});

describe('suggestDatePriority', () => {
    // Fixed date for tests
    const fixed_date = new Date('2025-02-01T00:00:00');

    beforeAll(() => {
        // Mock Date using Jest's Fake Timers
        jest.useFakeTimers('modern');
        jest.setSystemTime(fixed_date);
    });

    afterAll(() => {
        // Restore real timers after snapshot tests
        jest.useRealTimers();
    });

    // Test to return low when no due date is provided
    it('should return low when no due date is provided', () => {
        expect(suggestDatePriority(null)).toBe('Low');
        expect(suggestDatePriority(undefined)).toBe('Low');
    });

    // Test to return Urgent when due date is less than 1 day left
    it('should return Urgent when due date is less than 1 day left', () => {
        // Add time to the date
        const dueDate = new Date(fixed_date.getTime() + 0.5 * 24 * 60 * 60 * 1000);
        expect(suggestDatePriority(dueDate)).toBe('Urgent');
    });

    // Test to return High when due date is 1 to 4 days
    it('should return High when due date is 1 to 4 days', () => {
        // Add time to the date
        const dueDate = new Date(fixed_date.getTime() + 2 * 24 * 60 * 60 * 1000);
        expect(suggestDatePriority(dueDate)).toBe('High');
    });

    // Test to return Medium when due date is 5 to 9 days
    it('should return Medium when due date is 5 to 9 days', () => {
        // Add time to the date
        const dueDate = new Date(fixed_date.getTime() + 7 * 24 * 60 * 60 * 1000);
        expect(suggestDatePriority(dueDate)).toBe('Medium');
    });

    // Test to return Low when due date is more than 10
    it('should return Low when due date is more than 10', () => {
        // Add time to the date
        const dueDate = new Date(fixed_date.getTime() + 15 * 24 * 60 * 60 * 1000);
        expect(suggestDatePriority(dueDate)).toBe('Low');
    });
});
