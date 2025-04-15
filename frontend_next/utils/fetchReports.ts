import { Document } from "@/types/Document.types";
import Client from "fhirclient/lib/Client";

export const fetchReports = async (
  client: Client,
  patientId: string,
  emr: string,
) => {
  if (!client) throw new Error("FHIR client is not available");

  const isOscar = emr === "oscar";

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 1);

  const q = new URLSearchParams();
  q.set("patient", client.getPatientId() || patientId);
  if (isOscar) q.set("category", "document");
  else q.set("status", "final");

  q.set("_lastUpdated", `ge${minDate.toISOString().slice(0, 10)}`);
  q.set("_count", "50");
  q.set("_sort", "-_lastUpdated");

  return await client.request(`DocumentReference?${q}`, {
    pageLimit: 1,
    flat: true,
  });
};

export const mapReports = (reports: Document[]) => {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const today = new Date();

  return reports.map((report: Document) => {
    const date = new Date(report.date).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return {
      id: report.id,
      category: report.type?.text || report.category[0]?.text,
      date_time: date.replace(",", "").toLowerCase(),
      performer: report.author[0]?.display || "N/A",
      rel_date: Math.floor(
        (today.getTime() - new Date(report.date).getTime()) /
          millisecondsPerDay,
      ),
      url: report.content[0]?.attachment?.url?.split("/").pop(),
      data: report.content[0]?.attachment?.data,
      content_type: report.content[0]?.attachment?.contentType,
    };
  });
};

export const urlToData = async (url: string, client: Client) => {
  try {
    const binary = await client.request({
      url: `Binary/${url}`,
      headers: { Accept: "application/fhir+json" },
    });
    if (atob(binary.data).startsWith("<!doctype html")) return null;

    return binary.data;
  } catch (error) {
    console.error(`Error fetching binary data for ${url}:`, error);
  }
};
