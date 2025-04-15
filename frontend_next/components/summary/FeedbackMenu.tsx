import React, { FC, useState } from "react";
import { ThumbDownOutlined, ThumbUpOutlined } from "@mui/icons-material";
import { Menu, Divider, TextField } from "@mui/material";
import { Feedback, FeedbackOptions } from "@/types/common.types";
import DislikeIcon from "@/icons/DislikeIcon";
import LikeIcon from "@/icons/LikeIcon";

interface FeedbackMenuProps {
  type?: Feedback;
  withDelete?: boolean;
  anchorEl: (EventTarget & Element) | null;
  options: FeedbackOptions[];
  onClose: () => void;
  onSubmit: (options: string[], shouldDelete: boolean) => void;
}

const FeedbackMenu: FC<FeedbackMenuProps> = ({
  type = "dislike",
  withDelete = true,
  anchorEl,
  options,
  onClose,
  onSubmit,
}) => {
  const open = Boolean(anchorEl);

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textField, setTextField] = useState<string>("");

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId);
      }
      return [...prev, optionId];
    });
  };

  const closeMenu = () => {
    setSelectedOptions([]);
    onClose();
  };

  const submitFeedback = (withDelete: boolean) => {
    onSubmit(selectedOptions, withDelete);
    setSelectedOptions([]);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={closeMenu}
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "16px",
          padding: "8px 16px",
          maxWidth: "448px",
        },
      }}
    >
      <div className="max-w-md">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            {type === "dislike" ? <DislikeIcon /> : <LikeIcon />}
            <h3>Leave Feedback</h3>
          </div>
          <p className="text-sm text-secondary">
            Help us improve with your feedback
          </p>
        </div>

        {/* Feedback Options */}
        <div className="mb-4 flex flex-wrap gap-2">
          {options.map((option) =>
            option.type === "textInput" ? (
              <TextField
                key={option.id}
                label={option.label}
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                value={textField}
                sx={{
                  "& fieldset": {
                    borderColor: "#E9EBEE",
                  },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: "#F7F7F9",
                  },
                }}
                onChange={(event) => {
                  setTextField(event.target.value);
                }}
              />
            ) : (
              <button
                key={option.id}
                onClick={() => handleOptionToggle(option.id)}
                className={`rounded-small border border-light-gray px-3 py-1.5 text-sm ${
                  selectedOptions.includes(option.id)
                    ? "bg-light-main color-main font-bold"
                    : "text-gray-700 hover:bg-gray-200 bg-screen"
                }`}
              >
                {option.label}
              </button>
            ),
          )}
        </div>

        <Divider />
        {/* Actions */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={closeMenu}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            <h3>Cancel</h3>
          </button>
          {withDelete && (
            <button
              onClick={() => submitFeedback(true)}
              className="action-btn border border-red px-3 py-1 text-red hover:bg-red hover:text-white"
            >
              <h3>Submit & Delete Fact</h3>
            </button>
          )}
          <button
            onClick={() => submitFeedback(false)}
            className="action-btn hover:bg-main-700 btn-main-gradient !px-6 text-white"
          >
            <h3>Submit</h3>
          </button>
        </div>
      </div>
    </Menu>
  );
};

export default FeedbackMenu;
