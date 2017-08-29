import {darkBlack} from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';
import {Spacing as spacing} from 'material-ui/styles/spacing';
import zIndex from 'material-ui/styles/zIndex';
import colors from './colors.css';

export default {
  spacing,
  zIndex,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: colors.primary,
    primary2Color: colors.primaryLight,
    primary3Color: colors.text,
    accent1Color: colors.secondary,
    accent2Color: '#E8E8E8',
    accent3Color: colors.textLight,
    textColor: colors.text,
    alternateTextColor: colors.textInverse,
    canvasColor: colors.textInverse,
    borderColor: colors.divider,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: colors.primaryDark
  }
};
