import React, { useContext, useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Summary from "@/components/summary/Summary";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { getSetting, saveSetting } from "@/utils/localStorage";
import { Document } from "@/types/Document.types";
import {
  MessageRow,
  SourceDocuments,
  TransformedReport,
} from "@/types/common.types";
import { fetchReports, mapReports, urlToData } from "@/utils/fetchReports";
import { FhirClientContext } from "@/context/FhirClientContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/router";

const Distillery = () => {
  const [docs, setDocs] = useState<SourceDocuments>({});

  const { webSocketRef, setProgress, setError } = useWebSocketContext();
  const context = useContext(FhirClientContext);
  const { env } = useTheme();

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (webSocketRef?.current) {
        const today = new Date();
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const client = context?.client;

        let transformedReports: TransformedReport[] =
          getSetting("selectedReports") || [];

        if (!transformedReports.length && client) {
          // Add dummy data for development purposes
          const response = await fetch("dummy_response.json");
          const fakeRows = await response.json();
          const reports = await fetchReports(
            client,
            context.patientId,
            env.EMR,
          );

          const combinedReports: Document[] = fakeRows
            .concat(reports)
            .sort(
              (a: Document, b: Document) =>
                new Date(b.date).getTime() - new Date(a.date).getTime(),
            );

          if (combinedReports.length > 0) {
            const filteredReports = combinedReports.filter(
              ({ date }) =>
                Math.floor(
                  (today.getTime() - new Date(date).getTime()) /
                    millisecondsPerDay,
                ) ===
                Math.floor(
                  (today.getTime() -
                    new Date(combinedReports[0].date).getTime()) /
                    millisecondsPerDay,
                ),
            );

            transformedReports = mapReports(filteredReports);

            transformedReports = await Promise.all(
              transformedReports.map(async (report: TransformedReport) => {
                let data = report.data;
                if (report.url) {
                  data = await urlToData(report.url, client);
                }

                return { ...report, data };
              }),
            );

            const invalidDocumentsCount = transformedReports.filter(
              ({ data }) => !data,
            ).length;

            if (invalidDocumentsCount) {
              if (invalidDocumentsCount === transformedReports.length) {
                return router.push("documents");
              }
              setError(
                `We couldn't proccess ${invalidDocumentsCount} ${invalidDocumentsCount === 1 ? "document" : "documents"}`,
              );
            }

            saveSetting("selectedReports", transformedReports);
          }
        }

        if (
          !Array.isArray(transformedReports) ||
          transformedReports.length === 0
        ) {
          return;
        }

        try {
          const rows = await Promise.all(
            transformedReports.map(async (report) => ({
              id: report.id,
              category: report.category,
              content_type: report.content_type,
              data: report.data,
              date: report.date_time,
              performer: report.performer,
            })),
          );

          webSocketRef.current.sendMessage({
            rows,
            sections: getSetting("selectedSections"),
          });

          const docs = rows.reduce(
            (acc: { [key: number]: MessageRow }, row) => {
              acc[row.id] = row;
              return acc;
            },
            {},
          );

          setDocs(docs);
        } catch (err) {
          console.error(err);
          setError((err as Error).message);
        }
      }
    };
    fetchData();
    return () => {
      setProgress(0);
      saveSetting("canvasScale", {});
    };
  }, []);

  return (
    <Container
      maxWidth="xl"
      className="mt-4 flex h-full flex-col overflow-auto"
    >
      {/* <Patient /> */}
      <div className="h-full">
        <Summary docs={docs} />
      </div>
    </Container>
  );
};

export default Distillery;
