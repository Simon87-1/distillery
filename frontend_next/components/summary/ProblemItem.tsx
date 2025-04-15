import { IconButton, Tooltip } from "@mui/material";
import React, { useEffect, useState, useRef, FC } from "react";
import { Fact } from "@/types/Message.types";
import { Feedback } from "@/types/common.types";
import DislikeIcon from "@/icons/DislikeIcon";
import LikeIcon from "@/icons/LikeIcon";

interface ProblemItemProps {
  item: Fact;
  selectedProblem: Fact | null;
  anchorEl: (EventTarget & Element) | null;
  onSetFeedback: (type: Feedback) => void;
  onSetAnchorEl: (anchorEl: (EventTarget & Element) | null) => void;
  onSaveCurrentFeedback: (item: Fact) => void;
}

const ProblemItem: FC<ProblemItemProps> = ({
  item,
  selectedProblem,
  anchorEl,
  onSetFeedback,
  onSetAnchorEl,
  onSaveCurrentFeedback,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      const { scrollWidth, clientWidth } = textRef.current;
      setIsTruncated(scrollWidth > clientWidth);
    }
  }, [item]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSetFeedback(item?.feedback === "like" ? null : "like");
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSaveCurrentFeedback(item);
    if (item?.feedback) {
      onSetFeedback(null);
    } else {
      onSetAnchorEl(e.currentTarget);
    }
  };

  useEffect(() => {
    if (!anchorEl) setIsHovered(false);
  }, [anchorEl]);

  return (
    <div
      className={`transition-color rounded-small flex min-h-10 items-center justify-between p-2 hover:bg-light-gray ${
        selectedProblem?.text === item.text
          ? "bg-light-main font-bold"
          : "hover:bg-light-gray"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !anchorEl && setIsHovered(false)}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="h-1 w-1 flex-shrink-0 rounded-full bg-black"></div>
        <Tooltip
          title={isTruncated ? item.text : ""}
          sx={{ tooltip: { borderRadius: "20px" } }}
          slotProps={{
            tooltip: {
              sx: {
                borderRadius: "10px",
              },
            },
          }}
        >
          <span ref={textRef} className="truncate">
            {item.text}
          </span>
        </Tooltip>
      </div>
      {(isHovered || item.feedback) && (
        <div className="flex gap-1">
          {(item.feedback === "dislike" || (!item.feedback && isHovered)) && (
            <IconButton
              size="small"
              onClick={handleDislike}
              className="p-0"
              aria-label="dislike"
            >
              <DislikeIcon color="#DA2A4B" />
            </IconButton>
          )}
          {(item.feedback === "like" || (!item.feedback && isHovered)) && (
            <IconButton
              size="small"
              onClick={handleLike}
              className="p-0"
              aria-label="like"
            >
              <LikeIcon color="#176E5B" />
            </IconButton>
          )}
        </div>
      )}
    </div>
  );
};

export default ProblemItem;
