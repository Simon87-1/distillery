import React, { useState, useEffect, useRef, useContext } from 'react';
import { FhirClientContext } from '../FhirClientContext';
import LinearProgress from '@mui/material/LinearProgress';
import WebSocket from './WebSocket';
import { DataGrid, GridFooterContainer, GridFooter } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Button } from '@mui/material';
import Alert from '@mui/material/Alert';
import Slider from '@mui/material/Slider';
import { getSetting } from './SettingsUtils';
import { jwtDecode } from 'jwt-decode';

const approximateDateDiff = (startDate, endDate) => {
  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  let days = endDate.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    const previousMonth = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      0
    );
    days += previousMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years > 0 ? years + 'yr ' : ''}${months > 0 ? months + 'mo ' : ''}${
    days > 0 ? days + 'd' : ''
  }`;
};

const getDateDifferenceFromToday = pastDays => {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - pastDays);
  return approximateDateDiff(pastDate, new Date());
};

const DocumentList = ({ ws_url, updateMessage, updateDocs }) => {
  const context = useContext(FhirClientContext);
  const webSocketRef = useRef(null);

  const [reports, setReports] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(-1);
  const [marks, setMarks] = useState([]);
  const [sliderFilter, setSliderFilter] = useState({ items: [] });

  useEffect(() => {
    console.log('Fetching reports');

    const fetchReports = async () => {
      const client = context.client;
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 1);

      try {
        const metadata = await client.request('metadata');
        const isOscar = metadata.implementation.url.includes('oscar');

        const q = new URLSearchParams();
        q.set('patient', client.getPatientId() || context.patientId);
        if (isOscar) q.set('category', 'document');
        else q.set('status', 'final');

        q.set('_lastUpdated', `ge${minDate.toISOString().slice(0, 10)}`);
        q.set('_count', 50);
        q.set('_sort', '-_lastUpdated');

        const reportsData = await client.request(`DocumentReference?${q}`, {
          pageLimit: 1,
          flat: true,
        });

        console.log({ reportsData });

        const today = new Date();
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const max_encounters = 5;
        let t = 0;

        // Add dummy data for development purposes
        const response = await fetch('dummy_response.json');
        const fakeRows = await response.json();
        const combinedReports = fakeRows.concat(reportsData);

        const transformedReports = combinedReports.map(report => ({
          id: report.id,
          category: report.type?.text || report.category[0]?.text,
          date_time: new Date(report.date).toLocaleString(),
          performer: report.author[0].display || 'N/A',
          rel_date: Math.floor(
            (today - new Date(report.date)) / millisecondsPerDay
          ),
          url: report.content[0]?.attachment?.url?.split('/').pop(),
          data: report.content[0]?.attachment?.data,
          content_type: report.content[0]?.attachment?.contentType,
        }));

        setReports(transformedReports);

        const marksData = Object.entries(
          reportsData
            .map(report =>
              Math.floor((today - new Date(report.date)) / millisecondsPerDay)
            )
            .reduce((a, v) => {
              a[v] = (a[v] ?? 0) + 1;
              return a;
            }, {})
        )
          .slice(0, max_encounters)
          .map(([numDays, numNotes]) => {
            t = t + numNotes;
            return {
              value: parseInt(numDays),
              label: (
                <div style={{ textAlign: 'center' }}>
                  {getDateDifferenceFromToday(numDays)}
                  <br />({t} note{t > 1 ? 's' : ''})
                </div>
              ),
            };
          });
        setMarks(marksData);
        handleReportSelect(transformedReports);
      } catch (err) {
        console.error(err);
        setError('Error fetching reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // useEffect(() => {
  //   reports.length && handleReportSelect();
  // }, [reports]);

  const handleReportSelect = async fetchedReports => {
    const client = context.client;
    const allReports = fetchedReports || reports;
    setFetching(0);
    setError(null);

    if (webSocketRef.current) {
      const selectedRows = selectedReports.length
        ? allReports.filter(
            report =>
              selectedReports.includes(report.id) && (report.url || report.data)
          )
        : allReports.slice(0, 3);

      console.log('Selected rows:', reports);

      try {
        const rows = await Promise.all(
          selectedRows.map(async (report, i) => {
            console.log({ report });

            if (report.url) {
              const binary = await client.request({
                url: `Binary/${report.url}`,
                headers: { Accept: 'application/fhir+json' },
              });

              setFetching((100 * (i + 1)) / selectedReports.length);
              return {
                id: report.id,
                category: report.category,
                content_type: binary.contentType,
                data: binary.data,
                date: report.date_time,
                performer: report.performer,
              };
            } else if (report.data) {
              return {
                id: report.id,
                category: report.category,
                content_type: report.content_type,
                data: report.data,
                date: report.date_time,
                performer: report.performer,
              };
            }
          })
        );

        webSocketRef.current.sendMessage({
          rows,
          sections: getSetting('selectedSections'),
        });

        console.log('Selected reports:', rows);

        const docs = rows.reduce((acc, row) => {
          acc[row.id] = row;
          return acc;
        }, {});
        updateDocs(docs);
      } catch (err) {
        console.error(err);
        setError('Error fetching selected reports');
      }
    }
  };

  const CustomFooterStatusComponent = () => (
    <GridFooterContainer>
      <Box sx={{ p: 1, display: 'flex' }}>
        <FiberManualRecordIcon
          fontSize="small"
          sx={{
            ml: 1,
            mr: 1,
            color: connectionStatus === 'open' ? '#4caf50' : '#d9182e',
          }}
        />
        DARWEN status
      </Box>
      <GridFooter sx={{ border: 'none' }} />
    </GridFooterContainer>
  );

  return (
    <div>
      <h2>Reports</h2>
      {error && <Alert severity="error">{error}</Alert>}
      <div style={{ height: 100, width: '100%' }}>
        {marks.length > 0 && (
          <Slider
            aria-label="Note range"
            valueLabelDisplay="off"
            step={null}
            marks={marks}
            min={Math.min(...marks.map(m => m.value))}
            max={Math.max(...marks.map(m => m.value))}
            onChange={(e, value) =>
              setSliderFilter({
                items: [{ field: 'rel_date', operator: '<=', value }],
              })
            }
            defaultValue={+marks[marks.length - 1].value}
          />
        )}
      </div>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={reports}
          columns={[
            { field: 'id', headerName: 'Report ID' },
            { field: 'category', headerName: 'Category', flex: 1 },
            { field: 'date_time', headerName: 'Date/Time', flex: 1.5 },
            { field: 'performer', headerName: 'Performer', flex: 1 },
            {
              field: 'rel_date',
              headerName: 'Relative Date',
              flex: 1,
              type: 'number',
            },
          ]}
          checkboxSelection
          onRowSelectionModelChange={newSelection =>
            setSelectedReports(newSelection)
          }
          selectionModel={selectedReports}
          pageSizeOptions={[5, 10, 25]}
          autoPageSize
          slots={{ footer: CustomFooterStatusComponent }}
          loading={loading}
          slotProps={{
            loadingOverlay: {
              variant: 'skeleton',
              noRowsVariant: 'skeleton',
            },
          }}
          filterModel={sliderFilter}
          initialState={{
            columns: {
              columnVisibilityModel: {
                id: false,
                rel_date: false,
              },
            },
          }}
        />
        <WebSocket
          ref={webSocketRef}
          url={ws_url}
          providerId={
            jwtDecode(context.client.state.tokenResponse.id_token).sub
          }
          onMessage={event => {
            const message = JSON.parse(event.data);
            if (message.progress) {
              console.log(event.data);
            } else {
              updateMessage(message);
              setRunning(false);
              setFetching(-1);
            }
          }}
          onStatusChange={setConnectionStatus}
        />
      </div>
      <br />
      <Button
        disabled={selectedReports.length === 0}
        variant="contained"
        color="primary"
        onClick={handleReportSelect}
      >
        Process Selected Reports
      </Button>
      {fetching >= 0 && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant="determinate" value={fetching} />
        </Box>
      )}
      {running && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress color="success" />
        </Box>
      )}
    </div>
  );
};

export default DocumentList;
