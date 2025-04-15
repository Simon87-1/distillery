import React, { useState, useEffect, FC } from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import "@react-pdf-viewer/core/lib/styles/index.css";
import SummarySection from "@/components/summary/SummarySection";
import SourceSection from "@/components/summary/SourceSection";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { Feedback, SourceDocuments } from "@/types/common.types";
import { Facts, Fact, Message } from "@/types/Message.types";
import ProcessingProgress from "../loaders/ProcessingProgress";

interface SummaryProps {
  docs: SourceDocuments;
}

const Summary: FC<SummaryProps> = ({ docs }) => {
  const { message, progress } = useWebSocketContext();

  const [facts, setFacts] = useState<Facts[]>([]);
  const [selectedItem, setSelectedItem] = useState<Fact | null>(null);

  const handleRender = (message: Message) => {
    setFacts(message.sections);
  };

  const handleDeleteFact = (id: string, header: string) => {
    const updatedFacts = facts.map((section) => {
      if (section.header === header) {
        section.facts = section.facts.filter((fact) => fact.fact_id !== id);
      }
      return section;
    });

    setFacts(updatedFacts);
  };

  const handleItemClick = (item: Fact) => {
    if (selectedItem === item) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const handleChangeFeedback = ({
    header,
    id,
    type,
  }: {
    header: string;
    id: string;
    type: Feedback;
  }) => {
    const updatedFacts = facts.map((section) => {
      if (section.header === header) {
        section.facts = section.facts.map((fact) => {
          if (fact.fact_id === id) {
            fact.feedback = type;
          }
          return fact;
        });
      }
      return section;
    });

    setFacts(updatedFacts);
  };

  useEffect(() => {
    if (message) {
      handleRender(message);
    }
  }, [message]);

  return (
    <div className="relative h-full">
      <Grid container spacing={2} sx={{ mb: 2 }} className="h-full">
        <Grid size={4} className="h-full">
          <Box sx={{ cursor: "pointer" }} className="h-full">
            <SummarySection
              sections={facts}
              selectedItem={selectedItem}
              onDeleteFact={handleDeleteFact}
              onItemClick={handleItemClick}
              onChangeFeedback={handleChangeFeedback}
            />
          </Box>
        </Grid>
        <Grid size={8} className="h-full">
          <Box className="flex h-full flex-col">
            <SourceSection
              documents={docs}
              selectedItem={selectedItem}
              onCloseSelection={() => setSelectedItem(null)}
            />
          </Box>
        </Grid>
      </Grid>
      {progress !== 1 && <ProcessingProgress progress={progress * 100} />}
    </div>
  );
};

export default Summary;
