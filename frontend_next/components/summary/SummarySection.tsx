import React, { FC, useEffect, useState } from "react";
import {
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  styled,
  Menu,
  Divider,
  List,
  ListItem,
  ListItemButton,
  SvgIcon,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

import FeedbackMenu from "@/components/summary/FeedbackMenu";
import ProblemItem from "@/components/summary/ProblemItem";
import { Fact, Facts } from "@/types/Message.types";
import { Feedback } from "@/types/common.types";
import GlossySkeleton from "@/components/loaders/GlossySkeleton";
import { useWebSocketContext } from "@/context/WebSocketContext";
import LikeIcon from "@/icons/LikeIcon";
import DislikeIcon from "@/icons/DislikeIcon";
import MenuIcon from "@/icons/MenuIcon";
import { getSetting, saveSetting } from "@/utils/localStorage";
import SettingsIcon from "@/icons/SettingsIcon";
import DownloadIcon from "@/icons/DownloadIcon";

const feedbackOptions = [
  { id: "not-comprehensive", label: "Summary is not comprehensive" },
  { id: "facts-repeating", label: "Facts repeating" },
  { id: "inaccurate-reference", label: "Reference is inaccurate" },
  { id: "other", label: "Other" },
];

const totalFeedbackOptions = [
  { id: "faucibus-velit", label: "Faucibus velit" },
  { id: "donec-faucibus", label: "Donec faucibus" },
  { id: "lectus-posuere", label: "Lectus posuere" },
  { id: "cursus-tincidunt-vulputate", label: "Cursus tincidunt vulputate" },
  { id: "lacinia", label: "Lacinia" },
  { id: "other", label: "Other" },
  { id: "text-input", label: "Type your feedback here...", type: "textInput" },
];

// Styled MUI Components
const StyledAccordion = styled(Accordion)({
  "&.MuiAccordion-root": {
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    "&:before": {
      display: "none",
    },
    "&:not(:last-child)": {
      marginBottom: "8px",
    },
    borderRadius: "16px",
    border: "1px solid #E9EBEE",
    background: "#F7F7F9",
    padding: "16px",
    "&.Mui-expanded": {
      marginTop: "8px",
    },
  },
  "& .MuiAccordionSummary-root": {
    padding: 0,
    minHeight: 0,
    "&.Mui-expanded": {
      minHeight: 0,
    },
    "& .MuiAccordionSummary-content": {
      margin: "0",
    },
  },
  "& .MuiAccordionDetails-root": {
    padding: "0",
  },
});

interface SummarySectionProps {
  sections: Facts[];
  selectedItem: Fact | null;
  onDeleteFact: (id: string, header: string) => void;
  onItemClick: (item: Fact) => void;
  onChangeFeedback: ({
    header,
    id,
    type,
  }: {
    header: string;
    id: string;
    type: Feedback;
  }) => void;
}

const SummarySection: FC<SummarySectionProps> = ({
  sections = [],
  selectedItem,
  onDeleteFact,
  onItemClick,
  onChangeFeedback,
}) => {
  const { progress } = useWebSocketContext();

  const [feedbackType, setFeedbackType] = useState<Feedback>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [feedbackAnchor, setFeedbackAnchor] = useState<
    (EventTarget & Element) | null
  >(null);

  const [selectedFilter, setSelectedFilter] = useState<string[]>([]);
  const [filterAnchor, setFilterAnchor] = useState<
    (EventTarget & Element) | null
  >(null);

  const [settingsAnchor, setSettingsAnchor] = useState<
    (EventTarget & Element) | null
  >(null);

  const [filteredSections, setFilteredSections] = useState<string[]>([]);

  const [feedbackMenuAnchor, setFeedbackMenuAnchor] = useState<
    (EventTarget & Element) | null
  >(null);

  const [currentFact, setCurrentFact] = useState<{
    id: string;
    header: string;
  } | null>(null);

  const handleFeedbackClick = (e: React.MouseEvent, type: Feedback) => {
    if (!feedback) {
      setFeedbackType(type);
      setFeedbackAnchor(e.currentTarget);
    }
  };

  const handleCloseMenu = () => {
    setFeedbackAnchor(null);
    setFeedbackType(null);
  };

  const handleFeedbackSubmit = () => {
    setFeedback(feedbackType === "like" ? "like" : "dislike");
    setFeedbackAnchor(null);
  };

  const openFilterMenu = () => {
    setSelectedFilter(renderedSections.map(({ header }) => header));
    setFilterAnchor(settingsAnchor);
    setSettingsAnchor(null);
  };

  const closeFilterMenu = () => {
    setFilterAnchor(null);
  };

  const handleFilterToggle = (filter: string) => {
    setSelectedFilter((prev) => {
      if (prev.includes(filter)) {
        return prev.filter((el) => el !== filter);
      }
      return [...prev, filter];
    });
  };

  const submitFilter = () => {
    setFilterAnchor(null);
    setFilteredSections(selectedFilter);
    saveSetting("selectedSections", selectedFilter);
  };

  const renderedSections = filteredSections.length
    ? sections.filter(({ header }) => filteredSections.includes(header))
    : sections;

  const handleFeedbackMenuSubmit = (
    options: string[],
    shouldDelete: boolean,
  ) => {
    setFeedbackMenuAnchor(null);
    if (currentFact) {
      onChangeFeedback({
        id: currentFact.id,
        header: currentFact.header,
        type: "dislike",
      });

      if (shouldDelete) onDeleteFact(currentFact.id, currentFact.header);
    }
  };

  const handleItemClick = (fact: Fact, header: string) => {
    onItemClick(fact);
    setCurrentFact({ id: fact.fact_id, header });
  };

  const downloadPdf = async () => {
    try {
      // Close the settings menu
      setSettingsAnchor(null);
      
      const summaryData = {
        sections: renderedSections,
      };
      
      // Make a POST request to the backend
      const response = await fetch('http://localhost:3000/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(summaryData),
      });
      
      if (!response.ok) {
        console.error(`Error: ${response.status} ${response.statusText}`);
        throw new Error('Failed to generate PDF');
      }
      
      // Get the PDF blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = 'summary.pdf';
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Release the blob URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // We might want to show an error message to the user here
    }
  };

  useEffect(() => {
    const savedFilters = getSetting("selectedSections");

    if (sections.length) {
      if (savedFilters) {
        setSelectedFilter(savedFilters);
        setFilteredSections(savedFilters);
      } else {
        setSelectedFilter(sections.map(({ header }) => header));
      }
    }
  }, [sections]);

  return (
    <div className="h-full rounded-2xl bg-white shadow-card">
      {progress === 1 ? (
        <div className="flex h-full flex-col px-4 py-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-secondary">SUMMARY</p>
            <div className="flex gap-2">
              <IconButton
                size="small"
                onClick={(e) => handleFeedbackClick(e, "like")}
              >
                <LikeIcon
                  color={feedbackType === "like" ? "#176E5B" : "#0E0E0E"}
                />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => handleFeedbackClick(e, "dislike")}
              >
                <DislikeIcon
                  color={feedbackType === "dislike" ? "#DA2A4B" : "#0E0E0E"}
                />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => setSettingsAnchor(e.currentTarget)}
              >
                <MenuIcon
                  color={
                    settingsAnchor || filterAnchor
                      ? "var(--color-main)"
                      : "#0E0E0E"
                  }
                />
              </IconButton>

              {/* Settings menu */}
              <Menu
                anchorEl={settingsAnchor}
                open={Boolean(settingsAnchor)}
                onClose={() => setSettingsAnchor(null)}
                sx={{
                  "& .MuiPaper-root": {
                    borderRadius: "16px",
                    padding: "8px 16px",
                    minWidth: "256px",
                  },
                }}
              >
                <List disablePadding>
                  <ListItem disablePadding>
                    <ListItemButton
                      divider
                      sx={{ paddingInline: 0 }}
                      onClick={openFilterMenu}
                    >
                      <div className="flex items-center gap-2">
                        <SettingsIcon />
                        <h3>Modify sections</h3>
                      </div>
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton 
                      divider 
                      sx={{ paddingInline: 0 }} 
                      onClick={downloadPdf}
                    >
                      <div className="flex items-center gap-2">
                        <DownloadIcon />
                        <h3>Download as PDF</h3>
                      </div>
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton sx={{ paddingInline: 0 }}>
                      <div className="flex items-center gap-2">
                        <SvgIcon>
                          <svg
                            width="24"
                            height="20"
                            viewBox="0 0 24 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M16 13.9848L12 9.98485M12 9.98485L7.99996 13.9848M12 9.98485V18.9848M20.39 16.3748C21.3653 15.8431 22.1358 15.0017 22.5798 13.9835C23.0239 12.9652 23.1162 11.8281 22.8422 10.7515C22.5682 9.675 21.9434 8.72036 21.0666 8.03829C20.1898 7.35623 19.1108 6.98558 18 6.98485H16.74C16.4373 5.81409 15.8731 4.72718 15.0899 3.80584C14.3067 2.8845 13.3248 2.1527 12.2181 1.66545C11.1113 1.17821 9.90851 0.948206 8.70008 0.99273C7.49164 1.03725 6.30903 1.35515 5.24114 1.92251C4.17325 2.48988 3.24787 3.29195 2.53458 4.26843C1.82129 5.24491 1.33865 6.37038 1.12294 7.56024C0.90723 8.7501 0.964065 9.97338 1.28917 11.1381C1.61428 12.3028 2.1992 13.3787 2.99996 14.2848"
                              stroke="#0E0E0E"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </SvgIcon>
                        <h3>Save to EMR</h3>
                      </div>
                    </ListItemButton>
                  </ListItem>
                </List>
              </Menu>

              {/* Filter menu */}
              <Menu
                anchorEl={filterAnchor}
                open={Boolean(filterAnchor)}
                onClose={closeFilterMenu}
                sx={{
                  "& .MuiPaper-root": {
                    borderRadius: "16px",
                    padding: "8px 16px",
                    maxWidth: "440px",
                  },
                }}
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <SettingsIcon color="#8D95A2" />
                    <h3>Select summary sections:</h3>
                  </div>
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {sections.map(({ header }) => (
                    <button
                      key={header}
                      onClick={() => handleFilterToggle(header)}
                      className={`rounded-small border border-light-gray px-3 py-1.5 text-sm ${
                        selectedFilter.includes(header)
                          ? "bg-light-main color-main font-bold"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {header}
                    </button>
                  ))}
                </div>
                <Divider />
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => setFilterAnchor(null)}
                    className="text-gray-600 hover:text-gray-800 font-medium"
                  >
                    <h3>Cancel</h3>
                  </button>
                  <button
                    onClick={submitFilter}
                    className="action-btn btn-main-gradient hover:bg-main-700 !px-8 text-white"
                  >
                    <h3>Apply</h3>
                  </button>
                </div>
              </Menu>

              <FeedbackMenu
                type={feedbackType}
                withDelete={false}
                anchorEl={feedbackAnchor}
                options={totalFeedbackOptions}
                onClose={handleCloseMenu}
                onSubmit={handleFeedbackSubmit}
              />
            </div>
          </div>

          <div className="overflow-y-auto">
            {Boolean(sections.length) &&
              renderedSections.map(({ header, facts }, i) => (
                <StyledAccordion key={i} id={header} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <h3>{header}</h3>
                  </AccordionSummary>
                  <AccordionDetails className="mt-2">
                    <ul>
                      {facts.length ? (
                        facts.map((fact) => (
                          <li
                            className="fact pb-2 last:pb-0"
                            id={fact.fact_id}
                            key={fact.fact_id}
                            onClick={() => handleItemClick(fact, header)}
                          >
                            <ProblemItem
                              item={fact}
                              selectedProblem={selectedItem}
                              anchorEl={
                                currentFact?.id === fact.fact_id
                                  ? feedbackMenuAnchor
                                  : null
                              }
                              onSetFeedback={(type: Feedback) =>
                                onChangeFeedback({
                                  header,
                                  id: fact.fact_id,
                                  type,
                                })
                              }
                              onSetAnchorEl={setFeedbackMenuAnchor}
                              onSaveCurrentFeedback={() =>
                                setCurrentFact({ header, id: fact.fact_id })
                              }
                            />
                          </li>
                        ))
                      ) : (
                        <li className="text-xs font-semibold text-secondary">
                          No relevant information
                        </li>
                      )}
                    </ul>
                  </AccordionDetails>
                </StyledAccordion>
              ))}
            <FeedbackMenu
              anchorEl={feedbackMenuAnchor}
              options={feedbackOptions}
              onClose={() => setFeedbackMenuAnchor(null)}
              onSubmit={handleFeedbackMenuSubmit}
            />
          </div>
        </div>
      ) : (
        <GlossySkeleton />
      )}
    </div>
  );
};

export default SummarySection;
