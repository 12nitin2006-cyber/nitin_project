// Same fixed list as the backend Item model
export const CATEGORIES = ['Electronics', 'ID Card', 'Books', 'Bottles', 'Keys', 'Clothing', 'Bags', 'Other'];

// Format a date like "13 Nov 2026"
export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
