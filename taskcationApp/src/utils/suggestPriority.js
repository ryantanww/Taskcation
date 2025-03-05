// Function to suggest priority based on grade
export function suggestGradePriority(grade) {
    switch (grade) {
        // Returns priority of Low when grades is A and B
        case 'A':
        case 'B':
            return 'Low';
        // Returns priority of Medium when grades is C
        case 'C':
            return 'Medium';
        // Returns priority of High when grades is D
        case 'D':
            return 'High';
        // Returns priority of Urgent when grades is E and F
        case 'E':
        case 'F':
            return 'Urgent';
        default:
            // Returns priority of N/A if grade is invalid or unknown
            return 'N/A';
    }
}

// Function to suggest priority based on due date (end date)
export function suggestDatePriority(dueDate) {
    // If there is no due date provided return Low as priority as the default value
    if (!dueDate) return 'Low';

    // Get the current date and convert dueDate to a date object in case it is not
    const now = new Date();
    const due = new Date(dueDate);
    
    // Calculate the number of days remaining before the due date
    const msInADay = 1000 * 60 * 60 * 24;
    const daysLeft = (due.getTime() - now.getTime()) / msInADay;
    
    // Assign priority based on days remaining
    if (daysLeft < 1) {
        // Returns priority of Urgent when due date is less than a day left
        return 'Urgent';
    } else if (daysLeft < 5) {
        // Returns priority of High when due date is 1 to 4 days
        return 'High';
    } else if (daysLeft < 10) {
        // Returns priority of Medium when due date is 5 to 9 days
        return 'Medium';
    } else {
        // Returns priority of Low when due date is more than 10
        return 'Low';
    }
}
