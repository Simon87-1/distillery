import React, { useEffect, useState } from 'react';
import { ThumbDownOutlined, ThumbUpOutlined } from '@mui/icons-material';
import { Menu, Divider, TextField } from '@mui/material';

const FeedbackMenu = ({
  type = 'dislike',
  withDelete = true,
  anchorEl,
  options,
  onClose,
  onSubmit,
}) => {
  const open = Boolean(anchorEl);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [textField, setTextField] = useState('');

  const handleOptionToggle = optionId => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      }
      return [...prev, optionId];
    });
  };

  const closeMenu = () => {
    setSelectedOptions([]);
    onClose();
  };

  const submitFeedback = type => {
    onSubmit(selectedOptions, type);
    setSelectedOptions([]);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={closeMenu}
      sx={{
        '& .MuiPaper-root': {
          borderRadius: '16px',
          padding: '8px 16px',
          maxWidth: '448px',
        },
      }}
    >
      <div className="max-w-md">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            {type === 'dislike' ? (
              <ThumbDownOutlined color="error" />
            ) : (
              <ThumbUpOutlined color="success" />
            )}
            <h3>Leave Feedback</h3>
          </div>
          <p className="text-secondary text-sm">
            Help us improve with your feedback
          </p>
        </div>

        {/* Feedback Options */}
        <div className="mb-4 flex flex-wrap gap-2">
          {options.map(option =>
            option.type === 'textInput' ? (
              <TextField
                key={option.id}
                label={option.label}
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                value={textField}
                sx={{
                  '& fieldset': {
                    borderColor: '#E9EBEE',
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                  },
                }}
                onChange={event => {
                  setTextField(event.target.value);
                }}
              />
            ) : (
              <button
                key={option.id}
                onClick={() => handleOptionToggle(option.id)}
                className={`border-light-gray rounded-small-radius border px-3 py-1.5 text-sm ${
                  selectedOptions.includes(option.id)
                    ? 'bg-light-green font-bold text-green'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            )
          )}
        </div>

        <Divider />
        {/* Actions */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={closeMenu}
            className="font-medium text-gray-600 hover:text-gray-800"
          >
            <h3>Cancel</h3>
          </button>
          {withDelete && (
            <button
              onClick={() => submitFeedback(true)}
              className="action-btn border-red text-red hover:bg-red border px-3 py-1 hover:text-white"
            >
              <h3>Submit & Delete Fact</h3>
            </button>
          )}
          <button
            onClick={() => submitFeedback(false)}
            className="action-btn bg-green-gradient hover:bg-green-700 px-3 py-1 text-white hover:shadow-green"
          >
            <h3>Submit</h3>
          </button>
        </div>
      </div>
    </Menu>
  );
};

export default FeedbackMenu;
