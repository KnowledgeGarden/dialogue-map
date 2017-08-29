import React from 'react';
import Avatar from 'material-ui/Avatar';

import questionImg from './images/issue.png';
import answerImg from './images/position.png';
import proImg from './images/plus.png';
import conImg from './images/minus.png';

export default function nodeIcon(responseType, size = 40) {
  switch (responseType) {
    case 0: case 'QUESTION': return <Avatar src={questionImg} size={size}/>;
    case 1: case 'ANSWER': return <Avatar src={answerImg} size={size}/>;
    case 2: case 'PRO': return <Avatar src={proImg} size={size}/>;
    case 3: case 'CON': return <Avatar src={conImg} size={size}/>;
    default: return <Avatar src={questionImg} size={size}/>;
  }
}
