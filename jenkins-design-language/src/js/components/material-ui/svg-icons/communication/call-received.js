import React from 'react';
import SvgIcon from '../../SvgIcon';

const CommunicationCallReceived = (props) => (
  <SvgIcon {...props}>
    <path d="M20 5.41L18.59 4 7 15.59V9H5v10h10v-2H8.41z"/>
  </SvgIcon>
);
CommunicationCallReceived.displayName = 'CommunicationCallReceived';
CommunicationCallReceived.muiName = 'SvgIcon';

export default CommunicationCallReceived;
