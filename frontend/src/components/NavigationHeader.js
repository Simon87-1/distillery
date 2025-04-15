import { ArrowBack, Logout, ArrowBackIos } from '@mui/icons-material';
import { Button, Typography, IconButton } from '@mui/material';

const NavigationHeader = () => (
  <div className="flex items-center justify-between py-4">
    <div className="flex items-center gap-4">
      <img src="company_logo.png" alt="Pentavere Logo" className="h-8" />
      {/* <Button
        startIcon={<ArrowBackIos style={{ fontSize: '14px' }} />}
        size="small"
        sx={{
          '.MuiButton-startIcon': {
            marginRight: 0,
          },
        }}
      >
        <h3 className="normal-case text-green">Back</h3>
      </Button> */}
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 rounded-lg px-4 py-2 text-green shadow-[0px_6px_14px_0px_#0E0E1A14]">
        <div className="h-2 w-2 rounded-full bg-green shadow-[0px_0px_4px_0px_#00A58499]"></div>
        <h4>DARWEN AI Status</h4>
      </div>
      <IconButton style={{ color: '#000' }}>
        <Logout />
      </IconButton>
    </div>
  </div>
);

export default NavigationHeader;
