import React, { useState, useCallback, useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { Label, LabelColor } from 'src/components/label';
import { Icon } from '@iconify/react';
import { channelIcons } from 'src/theme/icons/channel-icons';
import { 
  Button, 
  Typography,
} from '@mui/material';
import { GenericModal } from 'src/components/modal/generic-modal';
import { TagsPicker } from 'src/components/tags/tags-picker';
import dayjs from 'dayjs';

import { useModifyChannelMutation } from 'src/libs/service/channel/channel';
// ----------------------------------------------------------------------

export type ChannelProps = {
  id: string;
  type: string;
  name: string;
  url: string;
  prompt: string;
  content: string;
};

type ChannelTableRowProps = {
  row: ChannelProps;
  onChannelSubmit?: () => void;
};

const labelColors: { [key: string]: LabelColor } = {
    published: 'success',
    draft: 'info',
    archived: 'default',
}

export function ChannelTableRow({ row, onChannelSubmit }: ChannelTableRowProps) {
  const [openPopover, setOpenPopover] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [modifyChannel] = useModifyChannelMutation();
  const [promptInput, setPromptInput] = useState<string>('');
  const [rowDataList, setRowDataList] = useState<{tagLabel: string; tagValue: string}[]>([]);
  const textFieldRef = useRef<HTMLInputElement | null>(null);

  useEffect(()=>{
    setPromptInput(row.prompt);
    setRowDataList([
      {tagLabel: 'title', tagValue: row.name},
      {tagLabel: 'content', tagValue: row.content},
      {tagLabel: 'date', tagValue: dayjs().format('YYYY-MM-DD')},
    ]);
  },[row.prompt]);

  const handleTagSelection = (tag: {tagLabel: string; tagValue: string}) => {
    if(textFieldRef.current) {
      const input = textFieldRef.current;
      if(input) {
        const startPos = input.selectionStart;
        const preCursor = promptInput.substring(0, startPos as number);
        const posCursor = promptInput.substring(input.selectionEnd as number);

        setPromptInput(`${preCursor}{{${tag.tagLabel}}}${posCursor}`);

        input.selectionStart = (startPos as number) + `{{${tag.tagLabel}}}`.length;
        input.selectionEnd = input.selectionStart;
      }
    }
  };

  const displayTagsPicker: React.ReactNode = (
    <TagsPicker
      tagList={rowDataList}
      onTagSelect={handleTagSelection}
    />
  );

  const handlePromptSubmit = async () => {
    setIsSubmitted(true);

    // Code-block to enable dynamic values replacing variable tags in the channel prompt

    // const reg = new RegExp(`${rowDataList.map((tag)=>{
    //   const labels = tag.tagLabel;
    //   return `\\{\\{${labels}\\}\\}`;
    // }).join("|")}`, "g");

    // const promptUpload = promptInput.replace(reg, (matched) => 
    //   rowDataList.find((tag) => matched === `{{${tag.tagLabel}}}`)
    //   ?.tagValue as string);

    // TO-DO: confirm the final design for the variable selection

    await modifyChannel({
      channel_id: row.id,
      payload: {
        name: row.name,
        channel_type: row.type,
        brand_voice_initial: promptInput
      }
    });

    setIsSubmitted(false);
    
    onChannelSubmit?.();
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
              Edit prompt
            </Button>
            {/* <Button
              variant='contained'
              color='inherit'
            >
              Disconnect
            </Button> */}
          </Box>
        </TableCell>
      </TableRow>

      <GenericModal
        open={openPopover}
        onClose={()=>setOpenPopover(false)}
        setParentText={setPromptInput}
        isLoading={isSubmitted}
        onAddItem={handlePromptSubmit}
        modalTitle={`Edit prompt for ${row.name}`}
        modalSubTitle='Customize the prompt for generating content for this channel'
        buttonText='Submit'
        textFieldValue={promptInput}
        customChildren={displayTagsPicker} // Variables selection disabled
        textInputRef={textFieldRef}
        styling={{
          multiline: true,
          rows: 10,
          enableCloseButton: true
        }}
      />
    </>
  );
}
