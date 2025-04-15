import React, { useState, useEffect } from "react";
import { FaCog } from "react-icons/fa"; // Gear icon from react-icons
import { getSetting, saveSetting } from './SettingsUtils'

// List of options for multiselect
const options = [
    "Subject & demographics",
    "Problems",
    "Allergies",
    "Immunisations",
    "Medications",
    "Diagnostic Results",
    "Family History",
    "Author of transaction",
];

const SettingsComponent = () => {
    // State to hold selected options and visibility of the settings panel
    const [selectedSections, setSelectedSections] = useState([]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // On component mount, load selected options from localStorage
    useEffect(() => {
        const storedSections = getSetting("selectedSections") || options;
        setSelectedSections(storedSections)
    }, []);

    // Function to handle section selection
    const handleSectionsChange = (option) => {
        let updatedOptions = [];
        if (selectedSections.includes(option)) {
            // Remove option if it's already selected
            updatedOptions = selectedSections.filter((item) => item !== option);
        } else {
            // Add option if it's not selected
            updatedOptions = [...selectedSections, option];
        }
        setSelectedSections(updatedOptions);
        // Persist selection in localStorage
        saveSetting("selectedSections", updatedOptions);
    };

    // Toggle settings visibility
    const toggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
    };

    return (
        <div style={{ position: "relative", margin: "0 auto" }}>
            <div
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    cursor: "pointer",
                    zIndex: 1000,
                    backgroundColor: "white",
                    borderRadius: "50%",
                    padding: "5px",
                }}
                onClick={toggleSettings}
            >
                <FaCog size={24} />
            </div>

            {isSettingsOpen && (
                <div
                    style={{
                        marginTop: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        padding: "10px",
                        fontFamily: "Roboto','Helvetica','Arial',sans-serif",
                        fontSize: "0.875rem",
                        lineHeight: 1.43,
                        letterSpacing: "0.01071em"
                    }}
                >
                    <h4>Settings</h4>

                    <div>
                        <h5>Choose summary sections:</h5>
                        {options.map((option) => (
                            <div key={option}>
                                <label>
                                    <input
                                        type="checkbox"
                                        value={option}
                                        checked={selectedSections.includes(option)}
                                        onChange={() => handleSectionsChange(option)}
                                    />
                                    {option}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsComponent;
