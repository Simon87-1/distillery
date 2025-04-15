// Function to save a specific setting to localStorage
export const saveSetting = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
}

// Function to retrieve a specific setting from localStorage
export const getSetting = (key) => {
    const storedValue = JSON.parse(localStorage.getItem(key))
    return storedValue || null
}
