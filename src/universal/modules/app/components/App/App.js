import React, {PropTypes, Component} from 'react';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import Avatar from 'material-ui/Avatar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import ArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import {Link} from 'react-router';
import {toggleMenu, openProfile} from '../../ducks/app.js';
import Action from './Action';
import Profile from './Profile';
import styles from './App.css';

let scrollTick = false;
let resizeTick = false;

export default class App extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    appBar: PropTypes.shape({
      title: PropTypes.string.isRequired
    }).isRequired,
    menuIsOpen: PropTypes.bool.isRequired,
    user: PropTypes.shape({
      handle: PropTypes.string
    }).isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    isAdministrator: PropTypes.bool.isRequired,
    children: PropTypes.element.isRequired
  };

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  }

  constructor(props) {
    super(props);
    this.state = {
      offset: 0,
      margin: 96,
      zDepth: 0
    };
  }

  render() {
    const {
      appBar: {title, route, permission},
      menuIsOpen,
      user: {handle},
      isAuthenticated,
      isAdministrator,
      children
    } = this.props;
    return (
      <div>
        <AppBar
          className={styles.title}
          zDepth={this.state.zDepth}
          title={title}
          titleStyle={{
            marginTop: `${this.state.margin}px`,
            marginLeft: this.state.margin > 32 ? '-44px' : 0
          }}
          style={{position: 'fixed', top: 0}}
          onLeftIconButtonTouchTap={this.handleToggleMenu}
          iconElementRight={
            <span className={styles.userIcon} onTouchTap={this.handleOpenProfile}>
              <Avatar src={`http://lorempixel.com/300/300/nature/${handle}/`} style={{backgroundSize: 'cover'}}/>
              <ArrowDropDown className={styles.userDropDown}/>
            </span>
          }
        />
        {route && !permission ? <Action margin={this.state.margin} route={route}/> : <div/>}
        {route && permission && permission === 'ADMINISTRATOR' && isAdministrator ? <Action margin={this.state.margin} route={route}/> : <div/>}
        {isAuthenticated ? <Profile {...this.props}/> : <div/>}
        <Drawer
          docked={false}
          open={menuIsOpen}
          onRequestChange={this.handleToggleMenu}
          className={styles.nav}
        >
          <AppBar
            // title={<Link to="/">Topic Quests</Link>}
            title={'Topic Quests'}
            iconElementLeft={<IconButton onTouchTap={this.handleToggleMenu}><NavigationClose/></IconButton>}
          />
          <Link to="/blog"><MenuItem onTouchTap={this.handleToggleMenu}>Blog</MenuItem></Link>
          <Link to="/maps"><MenuItem onTouchTap={this.handleToggleMenu}>Dialogue Map</MenuItem></Link>
        </Drawer>
        <div style={{paddingTop: '160px'}}>
          {children}
        </div>
      </div>
    );
  }

  handleToggleMenu = () => {
    const {dispatch} = this.props;
    dispatch(toggleMenu);
  }

  handleOpenProfile = event => {
    const {dispatch} = this.props;
    event.preventDefault(); // Prevent ghost click on mobile
    dispatch(openProfile(event.currentTarget));
  }

  handleScroll = () => {
    if (scrollTick) return;
    scrollTick = true;
    const offset = window.scrollY;
    const margin = Math.max(96 - window.scrollY, 0);
    const zDepth = margin > 0 ? 0 : 1;
    window.requestAnimationFrame(() => {
      this.setState({offset, margin, zDepth});
      scrollTick = false;
    });
  }

  handleResize = () => {
    if (resizeTick) return;
    resizeTick = true;
    const width = window.innerWidth;
    window.requestAnimationFrame(() => {
      this.setState({width});
      resizeTick = false;
    });
  }
}
