import React, {
  FC,
  ReactNode,
  SyntheticEvent,
  useEffect,
  useState,
} from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Tabs,
  Tab,
  styled,
  IconButton,
} from "@mui/material";
import handleFactRender from "@/utils/handleFactRender";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@/icons/WarningIcon";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Add,
  Remove,
} from "@mui/icons-material";
import CalendarIcon from "@/icons/CalendarIcon";
import PersonIcon from "@/icons/PersonIcon";
import { MessageRow, SourceDocuments } from "@/types/common.types";
import { Fact } from "@/types/Message.types";
import Link from "next/link";
import { useWebSocketContext } from "@/context/WebSocketContext";
import GlossySkeleton from "../loaders/GlossySkeleton";
import { getSetting, saveSetting } from "@/utils/localStorage";
import SettingsIcon from "@/icons/SettingsIcon";

const TabPanel = ({
  children,
  value,
  index,
}: {
  children: ReactNode;
  value: number;
  index: number;
}) => (
  <div hidden={value !== index} className="h-full overflow-auto py-3">
    {value === index && children}
  </div>
);

interface SourceSectionProps {
  documents: SourceDocuments;
  selectedItem: Fact | null;
  onCloseSelection: () => void;
}
const SourceSection: FC<SourceSectionProps> = ({
  documents,
  selectedItem,
  onCloseSelection,
}) => {
  const StyledTab = styled(Tab)({
    fontSize: "12px",
    fontWeight: 600,
    color: "#0E0E0E",
    minHeight: 24,
    "&.Mui-selected": {
      color: "var(--color-main)",
    },
    "&.MuiTab-root": {
      padding: 8,
      minHeight: 36,
    },
  });

  const { progress } = useWebSocketContext();

  const [tabValue, setTabValue] = useState(0);
  const [currentDocument, setCurrentDocument] = useState<MessageRow | null>(
    null,
  );
  const [currentRefIndex, setCurrentRefIndex] = useState(0);

  const uniqueDocumentIds = new Set(
    selectedItem?.references.map((item) => item.document_id),
  );

  const docsLength = Object.entries(documents).length;

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 1) {
      const currDoc = selectedItem
        ? documents[selectedItem.references[0].document_id]
        : Object.values(documents)[0];
      setCurrentDocument(currDoc);

      if (selectedItem) {
        handleFactRender(
          currDoc,
          selectedItem.references[0],
          getLocalScale(currDoc.id),
        );
      } else {
        handleFactRender(currDoc, null, getLocalScale(currDoc.id));
      }
    }
  };

  const handleRowClick = (value: MessageRow) => {
    setTabValue(1);
    setCurrentDocument(value);

    const refIndex = selectedItem?.references.findIndex(
      (ref) => ref.document_id === value.id,
    );

    if (refIndex !== -1 && refIndex !== undefined) {
      setCurrentRefIndex(refIndex);
      handleFactRender(
        value,
        selectedItem?.references[refIndex],
        getLocalScale(value.id),
      );
    }
  };

  const goPrevRef = () => {
    if (currentRefIndex > 0) {
      applyFactRender(currentRefIndex - 1);
    }
  };
  const goNextRef = () => {
    if (selectedItem && currentRefIndex < selectedItem.references.length - 1) {
      applyFactRender(currentRefIndex + 1);
    }
  };
  const applyFactRender = (index: number) => {
    if (selectedItem) {
      const doc = documents[selectedItem.references[index].document_id];
      setCurrentDocument(doc);
      handleFactRender(
        doc,
        selectedItem.references[index],
        getLocalScale(doc.id),
      );
    }
    setCurrentRefIndex(index);
  };

  const handleScale = (scale: number) => {
    if (currentDocument) {
      const localScale = getLocalScale(currentDocument.id);
      handleFactRender(
        currentDocument,
        selectedItem?.references[currentRefIndex],
        localScale + scale,
      );
      if (localScale) {
        saveSetting("canvasScale", {
          ...getSetting("canvasScale"),
          [currentDocument.id]: localScale + scale,
        });
      } else {
        saveSetting("canvasScale", {
          [currentDocument.id]: 1 + scale,
        });
      }
    }
  };
  const upScale = () => {
    handleScale(0.1);
  };
  const downScale = () => {
    handleScale(-0.1);
  };

  const formatDate = (date: string) => {
    const [month, day, year] = date.split(" ")[0].split("/");
    return `${year}-${month}-${day}`;
  };

  const getLocalScale = (id: number) => {
    const localScale = getSetting("canvasScale");
    if (localScale) {
      return localScale[id] || 1;
    }
    return 1;
  };

  useEffect(() => {
    if (!selectedItem && tabValue && currentDocument) {
      handleFactRender(
        currentDocument,
        null,
        getLocalScale(currentDocument.id),
      );
    }
    if (selectedItem && tabValue) {
      const doc = documents[selectedItem.references[0].document_id];
      setCurrentDocument(doc);
      setCurrentRefIndex(0);
      handleFactRender(doc, selectedItem.references[0], getLocalScale(doc.id));
    }
  }, [selectedItem]);

  return (
    <div className="relative h-full rounded-2xl bg-white shadow-card">
      {progress === 1 ? (
        <div className="flex h-full flex-col px-10 py-2">
          <Tabs
            value={tabValue}
            TabIndicatorProps={{
              style: {
                backgroundColor: "var(--color-main)",
                height: "3px",
              },
            }}
            onChange={handleTabChange}
            sx={{ minHeight: 36 }}
          >
            <StyledTab label="PROCESSED DOCUMENTS" />
            <StyledTab label="SOURCE" />
            <div className="flex w-full justify-end">
              <Link href="/documents">
                <Button className="flex gap-2 p-1">
                  <SettingsIcon color="var(--color-main)" />
                  <h3>Modify Documents</h3>
                </Button>
              </Link>
            </div>
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell className="text-xs font-semibold text-secondary">
                    TITLE
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-secondary">
                    CATEGORY
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-secondary">
                    AUTHOR
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-secondary">
                    DATE & TIME
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-secondary">
                    PERFORMER
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents &&
                  Object.entries(documents).map(([key, value], i) => {
                    const isSelected = selectedItem?.references.some(
                      (ref) => ref.document_id === value.id,
                    );
                    return (
                      <TableRow
                        key={key}
                        className={`${isSelected ? "bg-light-main" : "pointer-events-none"}`}
                        selected={isSelected}
                        hover={isSelected}
                        sx={{ cursor: isSelected ? "pointer" : "not-allowed" }}
                        onClick={() => handleRowClick(value)}
                      >
                        <TableCell
                          sx={{
                            position: "relative",
                            border: i === docsLength - 1 && "none",
                            borderBottomLeftRadius:
                              i === docsLength - 1 && "16px",
                            "&::after":
                              i === docsLength - 1
                                ? {
                                    content: "''",
                                    display: "block",
                                    width: "calc(100% - 14px)",
                                    height: "1px",
                                    backgroundColor: "rgb(224, 224, 224)",
                                    position: "absolute",
                                    bottom: 0,
                                    right: "0px",
                                  }
                                : "",
                          }}
                        >
                          {value.performer}
                        </TableCell>
                        <TableCell>{value.category}</TableCell>
                        <TableCell>{value.performer}</TableCell>
                        <TableCell>{value.date}</TableCell>
                        <TableCell
                          sx={{
                            position: "relative",
                            border: i === docsLength - 1 ? "none" : "",
                            borderBottomRightRadius:
                              i === docsLength - 1 ? "16px" : "",
                            "&::after":
                              i === docsLength - 1
                                ? {
                                    content: "''",
                                    display: "block",
                                    width: "calc(100% - 14px)",
                                    height: "1px",
                                    backgroundColor: "rgb(224, 224, 224)",
                                    position: "absolute",
                                    bottom: 0,
                                    left: "0px",
                                  }
                                : "",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{value.performer}</span>
                            {!value.data && (
                              <div
                                className="ml-2 flex items-center"
                                data-testid="invalid-document-icon"
                              >
                                <WarningIcon
                                  color="#FF0000"
                                  sx={{ fontSize: "1.2rem" }}
                                />
                                <span className="text-red-600 ml-1 text-xs font-medium"></span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>

            {selectedItem ? (
              <div className="flex w-full justify-center">
                <div className="fixed bottom-6 flex w-fit min-w-72 transform items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-drop">
                  <div>
                    <h3 className="">{selectedItem?.text}</h3>
                    <h5 className="text-gray">
                      {selectedItem.references.length}
                      {selectedItem.references.length === 1
                        ? " reference "
                        : " references "}
                      in {uniqueDocumentIds.size}
                      {uniqueDocumentIds.size === 1
                        ? " document"
                        : " documents"}
                    </h5>
                  </div>

                  <IconButton
                    size="small"
                    className="hover:bg-gray-200 hover:text-gray-800 bg-light-main color-main rounded-2xl p-4"
                    aria-label="close"
                    onClick={onCloseSelection}
                  >
                    <CloseIcon style={{ fontSize: "1rem" }} />
                  </IconButton>
                </div>
              </div>
            ) : (
              <div className="relative flex w-full justify-center">
                <div className="main-gradient fixed bottom-6 flex w-full max-w-sm transform items-center justify-between rounded-2xl p-4 shadow-drop">
                  <div>
                    <h3 className="text-white">No fact selected</h3>
                    <h5 className="text-light-green">
                      Click on a fact to see its reference in a source document
                    </h5>
                  </div>
                </div>
              </div>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <div
              id="canvas-container"
              className="h-full max-h-full rounded-2xl border border-light-gray"
            >
              {currentDocument ? (
                <>
                  <div className="flex items-center justify-between gap-4 rounded-t-2xl border-b border-light-gray bg-screen px-4 py-2">
                    <h2>{currentDocument.category}</h2>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon />
                        <h4>{formatDate(currentDocument.date)}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <PersonIcon />
                        <h4>{currentDocument.performer}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="original-text relative h-[90%] overflow-auto px-4">
                    <div className="text-center">
                      <canvas id="the-canvas"></canvas>
                    </div>
                    <div id="value2"></div>
                  </div>
                </>
              ) : (
                <Typography>Source documents content goes here...</Typography>
              )}
            </div>

            {selectedItem ? (
              <div className="relative flex w-full justify-center">
                <div className="fixed bottom-6 flex w-full max-w-xl transform items-center justify-between rounded-2xl bg-white p-4 shadow-drop">
                  <div>
                    <h3 className="">{selectedItem?.text}</h3>
                    <h5 className="text-gray">
                      {selectedItem.references.length} references in{" "}
                      {uniqueDocumentIds.size} documents
                    </h5>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      variant="outlined"
                      endIcon={<KeyboardArrowUp />}
                      disabled={currentRefIndex === 0}
                      sx={{
                        borderRadius: "1rem",
                        borderColor: "var(--color-main)",
                        color: "var(--color-main)",
                        fontSize: "0.875rem",
                        ":hover": {
                          borderColor: "var(--color-main-dark)",
                          backgroundColor: "#fff",
                          color: "var(--color-main-dark)",
                        },
                      }}
                      onClick={goPrevRef}
                    >
                      <h3>Previous</h3>
                    </Button>

                    <Button
                      className="btn-main-gradient"
                      variant="contained"
                      endIcon={
                        <KeyboardArrowDown
                          sx={{ fontSize: "1.5rem !important", color: "#fff" }}
                        />
                      }
                      disabled={
                        currentRefIndex === selectedItem.references.length - 1
                      }
                      sx={{
                        borderRadius: "1rem",
                        color: "#fff",
                        fontSize: "0.875rem",
                      }}
                      onClick={goNextRef}
                    >
                      <h3 className="text-white">Next</h3>
                    </Button>

                    <IconButton
                      size="small"
                      className="hover:bg-gray-200 hover:text-gray-800 bg-light-main color-main rounded-2xl p-4"
                      aria-label="close"
                      onClick={onCloseSelection}
                    >
                      <CloseIcon style={{ fontSize: "1rem" }} />
                    </IconButton>
                  </div>
                </div>
                <div className="absolute right-10">
                  <div
                    className="fixed bottom-6 flex w-fit flex-col gap-3"
                    style={{ marginLeft: "auto" }}
                  >
                    <Button
                      variant="outlined"
                      sx={{
                        padding: "0.25rem",
                        minWidth: "2rem",
                        background: "#fff",
                      }}
                      onClick={downScale}
                    >
                      <Remove />
                    </Button>
                    <Button
                      variant="outlined"
                      sx={{
                        padding: "0.25rem",
                        minWidth: "2rem",
                        background: "#fff",
                      }}
                      onClick={upScale}
                    >
                      <Add />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative flex w-full justify-center">
                <div className="main-gradient fixed bottom-6 flex w-full max-w-sm transform items-center justify-between rounded-2xl p-4 shadow-drop">
                  <div>
                    <h3 className="text-white">No fact selected</h3>
                    <h5 className="text-light-green">
                      Click on a fact to see its reference in a source document
                    </h5>
                  </div>
                </div>
              </div>
            )}
          </TabPanel>
        </div>
      ) : (
        <GlossySkeleton />
      )}
    </div>
  );
};

export default SourceSection;
