import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { Label, LabelColor } from 'src/components/label';
import { Icon } from '@iconify/react';
import { channelIcons } from 'src/theme/icons/channel-icons';
import { Button, Typography, Snackbar, Alert, AlertColor } from '@mui/material';
import { GenericModal } from 'src/components/modal/generic-modal';

import { useModifyChannelMutation } from 'src/libs/service/channel/channel';
// ----------------------------------------------------------------------

export type ChannelProps = {
  id: string;
  type: string;
  name: string;
  url: string;
  prompt: string;
};

type ChannelTableRowProps = {
  row: ChannelProps;
};

const labelColors: { [key: string]: LabelColor } = {
    published: 'success',
    draft: 'info',
    archived: 'default',
}

export function ChannelTableRow({ row }: ChannelTableRowProps) {
  const [openPopover, setOpenPopover] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [modifyChannel, { isLoading : modifyChannelIsLoading }] = useModifyChannelMutation();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'error',
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePromptSubmit = async (prompt: string) => {
    setIsSubmitted(true);
    const result = await modifyChannel({
      channel_id: row.id,
      payload: {
        name: row.name,
        channel_type: row.type,
        brand_voice_initial: prompt
      }
    });
    setIsSubmitted(false);
    if (!result.data) {
      setSnackbar({
        open: true,
        message: "Failed to submit modified prompt",
        severity: 'error',
      })
    } else {
      setSnackbar({
        open: true,
        message: "Prompt is successfully updated",
        severity: 'success',
      })
    }
  };

  return (
    <>
      <TableRow hover tabIndex={-1}>
        <TableCell align='center'>
          <Icon icon={channelIcons[row.type]} width='2rem'/>
        </TableCell>

        <TableCell>
          <Box>
            <Typography sx={{ fontWeight: 'bold' }}>
            {row.name}
            </Typography>
            <Typography>
            {row.url}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align='right'>
          <Box display='flex' justifyContent='flex-end' gap='0.5rem'>
            <Button
              variant='outlined'
              color='inherit'
              onClick={() => setOpenPopover(true)}
            >
              Prompt
            </Button>
            <Button
              variant='contained'
              color='inherit'
            >
              Disconnect
            </Button>
          </Box>
        </TableCell>
      </TableRow>
      <GenericModal
        open={openPopover}
        onClose={()=>setOpenPopover(false)}
        isLoading={isSubmitted}
        onAddItem={(value) => {handlePromptSubmit(value)}}
        modalTitle={`Edit prompt for ${row.name}`}
        modalSubTitle='Customize the prompt for generating content for this channel'
        buttonText='Submit'
        textFieldValue={row.prompt}
        styling={{
          multiline: true,
          rows: 10,
          enableCloseButton: true
        }}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
