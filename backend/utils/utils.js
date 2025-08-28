async function classifyIssue(description, address) {
    // Mock AI logic: classify priority based on keywords
    let priority = 'Moderate';

    if (description) {
        if (description.toLowerCase().includes('urgent') || description.toLowerCase().includes('critical')) {
            priority = 'Critical';
        } else if (description.toLowerCase().includes('minor') || description.toLowerCase().includes('low')) {
            priority = 'Low';
        }
    }

    return { priority, category: 'General' }; // Example response
}

module.exports = {
    classifyIssue,
}
