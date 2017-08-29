import {fromJS, Map as iMap} from 'immutable';

export const TOGGLE_MENU = 'TOGGLE_MENU';
export const OPEN_PROFILE = 'OPEN_PROFILE';
export const CLOSE_PROFILE = 'CLOSE_PROFILE';
export const SET_APP_BAR = 'SET_APP_BAR';

const initialState = iMap({
  menu: iMap({
    open: false
  }),
  profile: iMap({
    open: false,
    target: null
  }),
  bar: iMap({
    title: null,
    route: null,
    permission: null
  })
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case TOGGLE_MENU:
      return state.setIn(['menu', 'open'], !state.getIn(['menu', 'open']));
    case OPEN_PROFILE:
      return state.setIn(['profile', 'open'], true).setIn(['profile', 'target'], action.payload.target);
    case CLOSE_PROFILE:
      return state.setIn(['profile', 'open'], false).setIn(['profile', 'target'], null);
    case SET_APP_BAR:
      return state.setIn(['bar'], fromJS(action.payload));
    default:
      return state;
  }
}

export const toggleMenu = {
  type: TOGGLE_MENU
};

export const openProfile = target => ({
  type: OPEN_PROFILE,
  payload: {target}
});

export const closeProfile = {
  type: CLOSE_PROFILE
};

export const setAppBar = ({title, route, permission}) => ({
  type: SET_APP_BAR,
  payload: {title, route, permission}
});
