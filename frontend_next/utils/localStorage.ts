// Function to save a specific setting to localStorage
export const saveSetting = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Function to retrieve a specific setting from localStorage
export const getSetting = (key: string) => {
  const item = localStorage.getItem(key);
  const storedValue = item ? JSON.parse(item) : null;
  return storedValue;
};
