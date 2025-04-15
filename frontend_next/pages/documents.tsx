import React from "react";
import { Container } from "@mui/material";
import DocumentList from "@/components/DocumentList";

const Documents = () => {
  return (
    <Container maxWidth="xl" className="flex flex-col h-full">
      <DocumentList />
    </Container>
  );
};

export default Documents;
