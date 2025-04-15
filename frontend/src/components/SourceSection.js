import React, { useState } from 'react';
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
} from '@mui/material';
import handleFactRender from '../helpers/renderFact';

const StyledTab = styled(Tab)({
  '&.Mui-selected': {
    color: '#065f46',
  },
});

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} className="py-4">
    {value === index && children}
  </div>
);

const SourceSection = ({ documents, selectedItem }) => {
  const [tabValue, setTabValue] = useState(0);
  const [currentDocument, setCurrentDocument] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClick = value => {
    console.log('Clicked:', value);
    setTabValue(1);
    setCurrentDocument(value);
    handleFactRender(value, selectedItem.references);
  };

  return (
    <div className="h-full max-h-[100vh] overflow-auto rounded-2xl p-4 shadow-card">
      <Tabs
        value={tabValue}
        TabIndicatorProps={{
          style: {
            backgroundColor: '#065f46',
            height: '3px',
          },
        }}
        onChange={handleTabChange}
      >
        <StyledTab label="PROCESSED DOCUMENTS" />
        <StyledTab label="SOURCE" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Table>
          <TableHead>
            <TableRow className="bg-gray-50">
              <TableCell>TITLE</TableCell>
              <TableCell>CATEGORY</TableCell>
              <TableCell>AUTHOR</TableCell>
              <TableCell>DATE & TIME</TableCell>
              <TableCell>PERFORMER</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents &&
              Object.entries(documents).map(([key, value]) => {
                const isSelected = selectedItem?.references.some(
                  ref => ref.document_id === value.id
                );

                return (
                  <TableRow
                    key={key}
                    className={
                      isSelected
                        ? 'bg-light-green'
                        : 'pointer-events-none blur-[1px]'
                    }
                    selected={isSelected}
                    hover={isSelected}
                    sx={{ cursor: isSelected ? 'pointer' : 'not-allowed' }}
                    onClick={() => handleClick(value)}
                  >
                    <TableCell>{value.performer}</TableCell>
                    <TableCell>{value.category}</TableCell>
                    <TableCell>{value.performer}</TableCell>
                    <TableCell>{value.date}</TableCell>
                    <TableCell>{value.performer}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>

        <div className="mt-4 flex justify-end">
          <Button variant="outlined" sx={{ textTransform: 'none' }}>
            <h3>Modify Documents</h3>
          </Button>
        </div>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <div className="rounded bg-gray-50 p-4">
          {/* Add your source content here */}
          {currentDocument ? (
            <>
              <h2>
                Source{' '}
                <span>
                  {currentDocument.category} {currentDocument.date}
                </span>
              </h2>
              <div className="original-text">
                <canvas id="the-canvas"></canvas>
                <div id="value2"></div>
              </div>
            </>
          ) : (
            <Typography>Source documents content goes here...</Typography>
          )}
        </div>
      </TabPanel>
    </div>
  );
};

export default SourceSection;
