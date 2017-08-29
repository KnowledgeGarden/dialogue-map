import AppContainer from 'universal/modules/app/containers/App/AppContainer';
import {setAppBar} from 'universal/modules/app/ducks/app';

export default function (store) {
  const {dispatch} = store;
  const title = () => dispatch(setAppBar({title: '404 Not Found'}));
  return {
    path: '*',
    component: AppContainer,
    onEnter: title,
    getIndexRoute: async (location, cb) => {
      const component = await System.import('universal/components/NotFound/NotFound');
      cb(null, {component});
    }
  };
}
