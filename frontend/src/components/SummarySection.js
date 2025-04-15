import React, { useEffect, useState } from 'react';
import {
  Typography,
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
} from '@mui/material';
import {
  ExpandMore,
  ThumbUp,
  ThumbDown,
  Info,
  ThumbDownOutlined,
  ThumbUpOutlined,
  InfoOutlined,
  MoreVertSharp,
  SettingsOutlined,
  SaveAlt,
} from '@mui/icons-material';
import { Camera } from 'lucide-react';

import FeedbackMenu from './FeedbackMenu';

const feedbackOptions = [
  { id: 'not-comprehensive', label: 'Summary is not comprehensive' },
  { id: 'facts-repeating', label: 'Facts repeating' },
  { id: 'inaccurate-reference', label: 'Reference is inaccurate' },
  { id: 'other', label: 'Other' },
];

const totalFeedbackOptions = [
  { id: 'faucibus-velit', label: 'Faucibus velit' },
  { id: 'donec-faucibus', label: 'Donec faucibus' },
  { id: 'lectus-posuere', label: 'Lectus posuere' },
  { id: 'cursus-tincidunt-vulputate', label: 'Cursus tincidunt vulputate' },
  { id: 'lacinia', label: 'Lacinia' },
  { id: 'other', label: 'Other' },
  { id: 'text-input', label: 'Type your feedback here...', type: 'textInput' },
];

// Styled MUI Components
const StyledAccordion = styled(Accordion)({
  '&.MuiAccordion-root': {
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    '&:before': {
      display: 'none',
    },
    '&:not(:last-child)': {
      marginBottom: '8px',
    },
    borderRadius: '16px',
    border: '1px solid #E9EBEE',
    background: '#F7F7F9',
    padding: '16px',
    '&.Mui-expanded': {
      marginTop: '8px',
    },
  },
  '& .MuiAccordionSummary-root': {
    padding: 0,
    minHeight: 0,
    '&.Mui-expanded': {
      minHeight: 0,
    },
    '& .MuiAccordionSummary-content': {
      margin: '0',
    },
  },
  '& .MuiAccordionDetails-root': {
    padding: '0',
  },
});

const ProblemItem = ({ item, onDeleteFeedback, selectedProblem }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLike = e => {
    e.stopPropagation();
    setFeedback(feedback === 'like' ? null : 'like');
  };

  const handleDislike = e => {
    e.stopPropagation();
    feedback ? setFeedback(null) : setAnchorEl(e.currentTarget);
    // setFeedback(feedback === 'dislike' ? null : 'dislike');
  };

  const handleClosePopup = () => {
    setAnchorEl(null);
    setIsHovered(false);
  };

  const handleSubmit = (options, shouldDelete) => {
    console.log('Submitted feedback:', options, shouldDelete);

    handleClosePopup();
    shouldDelete && onDeleteFeedback(options);
    setFeedback(feedback === 'dislike' ? null : 'dislike');
  };

  return (
    <>
      <div
        className={`hover:bg-light-gray, flex min-h-12 items-center justify-between rounded-small-radius p-2 transition-colors ${
          selectedProblem?.text === item
            ? 'bg-light-green font-medium'
            : 'hover:bg-light-gray'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => !Boolean(anchorEl) && setIsHovered(false)}
      >
        <span>{item}</span>
        {(isHovered || feedback) && (
          <div className="flex gap-1">
            {(feedback === 'dislike' || (!feedback && isHovered)) && (
              <IconButton
                size="small"
                onClick={handleDislike}
                className="text-red-600"
              >
                <ThumbDownOutlined fontSize="small" color="error" />
              </IconButton>
            )}
            {(feedback === 'like' || (!feedback && isHovered)) && (
              <IconButton
                size="small"
                onClick={handleLike}
                className="text-emerald-600"
              >
                <ThumbUpOutlined fontSize="small" color="success" />
              </IconButton>
            )}
          </div>
        )}
      </div>
      <FeedbackMenu
        anchorEl={anchorEl}
        options={feedbackOptions}
        onClose={handleClosePopup}
        onSubmit={handleSubmit}
      />
    </>
  );
};

const SummarySection = ({
  sections = [],
  selectedItem,
  onDeleteFact,
  onItemClick,
}) => {
  const [feedbackType, setFeedbackType] = useState('dislike');
  const [feedback, setFeedback] = useState(null);
  const [feedbackAnchor, setFeedbackAnchor] = useState(null);

  const [selectedFilter, setSelectedFilter] = useState([]);
  const [filterAnchor, setFilterAnchor] = useState(null);

  const [settingsAnchor, setSettingsAnchor] = useState(null);

  const [filteredSections, setFilteredSections] = useState([]);

  const [isFilterSumbitted, setIsFilterSubmitted] = useState(false);

  const handleFeedbackClick = (e, type) => {
    if (!feedback) {
      setFeedbackType(type);
      setFeedbackAnchor(e.currentTarget);
    } else {
      setFeedback(null);
    }
  };

  const handleChange = panel => (event, newExpanded) => {
    // setExpanded(newExpanded ? panel : false);
  };

  const handleDeleteFeedback = (id, sectionName) => {
    onDeleteFact(id, sectionName);
  };

  const handleCloseMenu = () => {
    setFeedbackAnchor(null);
  };

  const handleFeedbackSubmit = options => {
    setFeedback(feedbackType === 'like' ? 'like' : 'dislike');
    handleCloseMenu();
  };

  const openFilterMenu = () => {
    setFilterAnchor(settingsAnchor);
    setSettingsAnchor(null);
  };

  const closeFilterMenu = () => {
    setFilterAnchor(null);
  };

  const handleFilterToggle = filter => {
    setSelectedFilter(prev => {
      if (prev.includes(filter)) {
        return prev.filter(el => el !== filter);
      }
      return [...prev, filter];
    });
  };

  const submitFilter = () => {
    setFilterAnchor(null);
    setFilteredSections(selectedFilter);
  };

  const renderedSections = filteredSections.length
    ? sections.filter(({ header }) => filteredSections.includes(header))
    : sections;

  useEffect(() => {
    if (sections.length) {
      setSelectedFilter(sections.map(({ header }) => header));
    }
  }, [sections]);

  return (
    <div className="h-full rounded-2xl p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold text-secondary">SUMMARY</p>
        <div className="flex gap-2">
          <IconButton
            size="small"
            onClick={e => handleFeedbackClick(e, 'like')}
          >
            <ThumbUpOutlined
              fontSize="small"
              color={feedback === 'like' ? 'success' : ''}
            />
          </IconButton>
          <IconButton
            size="small"
            onClick={e => handleFeedbackClick(e, 'dislike')}
          >
            <ThumbDownOutlined
              fontSize="small"
              color={feedback === 'dislike' ? 'error' : ''}
            />
          </IconButton>
          <IconButton
            size="small"
            onClick={e => setSettingsAnchor(e.currentTarget)}
          >
            <MoreVertSharp />
          </IconButton>

          {/* Settings menu */}
          <Menu
            anchorEl={settingsAnchor}
            open={Boolean(settingsAnchor)}
            onClose={() => setSettingsAnchor(null)}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: '16px',
                padding: '8px 16px',
                minWidth: '256px',
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
                    <SettingsOutlined />
                    <h3>Modify sections</h3>
                  </div>
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton divider sx={{ paddingInline: 0 }}>
                  <div className="flex items-center gap-2">
                    <SaveAlt />
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
                          stroke-width="1.6"
                          stroke-linecap="round"
                          stroke-linejoin="round"
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
              '& .MuiPaper-root': {
                borderRadius: '16px',
                padding: '8px 16px',
                maxWidth: '440px',
              },
            }}
          >
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <SettingsOutlined style={{ color: '#8D95A2' }} />
                <h3>Select summary sections:</h3>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {sections.map(({ header }) => (
                <button
                  key={header}
                  onClick={() => handleFilterToggle(header)}
                  className={`rounded-small-radius border border-light-gray px-3 py-1.5 text-sm ${
                    selectedFilter.includes(header)
                      ? 'bg-light-green font-bold text-green'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                className="font-medium text-gray-600 hover:text-gray-800"
              >
                <h3>Cancel</h3>
              </button>
              <button
                onClick={submitFilter}
                className="action-btn hover:bg-green-700 bg-green-gradient px-3 py-1 text-white hover:shadow-green"
              >
                <h3>Submit</h3>
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

      <div className="max-h-[90vh] overflow-y-auto">
        {Boolean(sections.length) &&
          renderedSections.map(({ header, facts }, i) => (
            <StyledAccordion
              key={i}
              id={header}
              defaultExpanded
              onChange={handleChange(header)}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <h3>{header}</h3>
              </AccordionSummary>
              <AccordionDetails>
                <ul className="list-disc">
                  {facts.map(fact => (
                    <li
                      className="fact"
                      id={fact.fact_id}
                      key={fact.fact_id}
                      onClick={() => onItemClick(fact)}
                    >
                      <ProblemItem
                        item={fact.text}
                        selectedProblem={selectedItem}
                        onDeleteFeedback={() =>
                          handleDeleteFeedback(fact.fact_id, header)
                        }
                      />
                    </li>
                  ))}
                </ul>
              </AccordionDetails>
            </StyledAccordion>
          ))}
      </div>
    </div>
  );
};

export default SummarySection;
