import React, { useState, useEffect, useContext } from "react";
import { FhirClientContext } from "@/context/FhirClientContext";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { getSetting, saveSetting } from "@/utils/localStorage";

import { useRouter } from "next/router";

import { getDateDifferenceFromToday } from "@/utils";
import ReportsFilter from "./ReportsFilter";
import SummarySectionsFilter from "./SummarySectionsFilter";
import ReportsFilterSkeleton from "./loaders/DocumentsFilterSkeleton";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { Document } from "@/types/Document.types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
} from "@mui/material";
import { TransformedReport } from "@/types/common.types";
import { fetchReports, mapReports, urlToData } from "@/utils/fetchReports";
import { useTheme } from "@/context/ThemeContext";

const DocumentList = () => {
  const router = useRouter();

  const context = useContext(FhirClientContext);
  const { env } = useTheme();

  const apiRef = useGridApiRef();

  const { setError } = useWebSocketContext();

  const [reports, setReports] = useState<TransformedReport[]>([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState([]);
  const [rangeFilter, setRangeFilter] = useState<{
    items: { field: string; operator: string; value: number }[];
  }>({
    items: [],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const client = context?.client;

      if (client) {
        try {
          const reportsData = await fetchReports(
            client,
            context.patientId,
            env.EMR,
          );

          const today = new Date();
          const millisecondsPerDay = 1000 * 60 * 60 * 24;
          const max_encounters = 5;
          let t = 0;

          // Add dummy data for development purposes
          const response = await fetch("dummy_response.json");
          const fakeRows = await response.json();
          const combinedReports: Document[] = fakeRows.concat(reportsData);

          const transformedReports = mapReports(combinedReports);

          setReports(transformedReports);

          const marksData = Object.entries(
            combinedReports
              .map((report) =>
                Math.floor(
                  (today.getTime() - new Date(report.date).getTime()) /
                    millisecondsPerDay,
                ),
              )
              .reduce((a, v) => {
                a[v] = (a[v] ?? 0) + 1;
                return a;
              }, {}),
          )
            .slice(0, max_encounters)
            .map(([numDays, numNotes]) => {
              t = t + numNotes;
              return {
                id: parseInt(numDays),
                notes: t,
                label: getDateDifferenceFromToday(numDays),
              };
            });
          setMarks(marksData);

          const storedReports = getSetting("selectedReports")?.map(
            (report) => report.id,
          );

          if (apiRef?.current?.setRowSelectionModel) {
            if (storedReports) {
              setSelectedReports(storedReports);
              apiRef.current.setRowSelectionModel(storedReports);
            }
          }
        } catch (err) {
          console.error(err);
          setError("Error fetching reports");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, []);

  const handleReportSelect = async () => {
    setLoadingReports(true);
    const allReports = reports;
    setError(null);

    const selectedRows = selectedReports.length
      ? allReports.filter(
          (report) =>
            selectedReports.includes(report.id) && (report.url || report.data),
        )
      : allReports.slice(0, 3);

    const mappedReports = await Promise.all(
      selectedRows.map(async (report: TransformedReport) => {
        const client = context?.client;
        let data = report.data;
        if (report.url && client) {
          data = await urlToData(report.url, client);
        }

        return { ...report, data };
      }),
    );

    saveSetting("selectedReports", mappedReports);

    const invalidReports = mappedReports.filter((report) => !report.data);

    if (invalidReports.length === mappedReports.length) {
      setError(
        "Selected documents have unsupported format. Please select another documents.",
      );
    } else if (invalidReports.length > 0) {
      setIsDialogOpen(true);
    } else {
      router.push("/distillery");
    }
    setLoadingReports(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto mb-4 flex w-full flex-col gap-4 rounded-b-2xl bg-white p-4 shadow-card">
        {marks.length > 0 ? (
          <ReportsFilter range={marks} onChange={setRangeFilter} />
        ) : (
          <ReportsFilterSkeleton />
        )}
        <SummarySectionsFilter />
      </div>
      <div className="mb-4 h-full w-full">
        <DataGrid
          apiRef={apiRef}
          disableColumnResize
          rows={reports}
          columns={[
            { field: "id", headerName: "Report ID" },
            { field: "url", headerName: "Title", flex: 1 },
            { field: "category", headerName: "Category", flex: 1 },
            { field: "content_type", headerName: "Author", flex: 1 },
            { field: "date_time", headerName: "Date & Time", flex: 1.5 },
            { field: "performer", headerName: "Performer", flex: 1 },
            {
              field: "rel_date",
              headerName: "Relative Date",
              flex: 1,
              type: "number",
            },
          ]}
          checkboxSelection
          onRowSelectionModelChange={(newSelection) =>
            setSelectedReports(newSelection)
          }
          pageSizeOptions={[5, 10, 25]}
          loading={loading}
          slotProps={{
            loadingOverlay: {
              variant: "skeleton",
              noRowsVariant: "skeleton",
            },
          }}
          filterModel={rangeFilter}
          initialState={{
            columns: {
              columnVisibilityModel: {
                id: false,
                rel_date: false,
              },
            },
          }}
          disableColumnMenu
          hideFooterPagination
          hideFooter
          sx={{
            "& .MuiDataGrid-row": {
              backgroundColor: "#fff",
            },
            "& .MuiDataGrid-row.Mui-selected": {
              backgroundColor: "#F7F7F9",
            },
            "& .MuiDataGrid-virtualScrollerContent": {
              flexBasis: "auto !important",
            },
            "& .MuiDataGrid-row.Mui-selected:hover": {
              backgroundColor: "inherit",
            },
          }}
        />
      </div>
      <div className="w-full text-right">
        <Button
          className="btn-main-gradient rounded-2xl disabled:text-white"
          disabled={selectedReports.length === 0}
          variant="contained"
          color="primary"
          loading={loadingReports}
          onClick={handleReportSelect}
        >
          Process {selectedReports.length} Reports
        </Button>
      </div>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        slotProps={{
          paper: {
            sx: {
              borderRadius: "1rem",
            },
          },
        }}
      >
        <DialogTitle id="alert-dialog-title" className="p-4">
          Invalid document format!
        </DialogTitle>
        <DialogContent className="p-4 pb-0">
          <DialogContentText id="alert-dialog-description" className="pb-4">
            Some of the documents have unsupported format. Do you want to
            procceed?
          </DialogContentText>
          <Divider />
        </DialogContent>
        <DialogActions className="p-4">
          <button
            onClick={() => setIsDialogOpen(false)}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            <h3>Cancel</h3>
          </button>
          <Button
            onClick={() => router.push("/distillery")}
            className="btn-main-gradient hover:shadow-main-btn rounded-2xl text-white"
          >
            <h3>Yes</h3>
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DocumentList;
