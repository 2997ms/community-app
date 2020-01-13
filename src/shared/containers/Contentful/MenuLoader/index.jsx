/**
 * MenuLoaderContainer
 * Load resursively a complete navi menu from Contentful
 * and delegates to custom navi component
 */

import _ from 'lodash';
import LoadingIndicator from 'components/LoadingIndicator';
import PT from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Logo from 'assets/images/tc-logo.svg';
import { isomorphy, config } from 'topcoder-react-utils';
import actions from 'actions/contentful';


class MenuLoaderContainer extends React.Component {
  constructor(props) {
    super(props);

    // initial state
    this.state = {
      path: isomorphy.isClientSide() ? window.location.pathname : '',
    };
    // bind
    this.handleChangeOpenMore = this.handleChangeOpenMore.bind(this);
    this.handleChangeLevel1Id = this.handleChangeLevel1Id.bind(this);
    this.handleCloseOpenMore = this.handleCloseOpenMore.bind(this);
    this.handleSwitchMenu = this.handleSwitchMenu.bind(this);
  }

  componentDidMount() {
    const {
      id,
      loadMenuData,
      fields,
      preview,
      spaceName,
      environment,
      baseUrl,
    } = this.props;
    // initiate loading the menu data
    loadMenuData({
      id,
      fields,
      preview,
      spaceName,
      environment,
      baseUrl,
    });
  }

  handleChangeLevel1Id(menuId) {
    this.setState({ activeLevel1Id: menuId });
  }

  handleChangeOpenMore(changedOpenMore) {
    this.setState({ openMore: changedOpenMore });
  }

  handleSwitchMenu() {
    this.setState({ activeLevel1Id: null });
  }

  handleCloseOpenMore() {
    this.setState({ openMore: false });
  }

  render() {
    const {
      menu, auth, loading, menuLogo,
    } = this.props;
    const { openMore, path, activeLevel1Id } = this.state;
    if (loading) {
      return <LoadingIndicator />;
    }
    if (isomorphy.isClientSide()) {
      // eslint-disable-next-line global-require
      const { TopNav, LoginNav } = require('navigation-component');
      const logoToUse = !_.isEmpty(menuLogo) ? <img src={menuLogo.fields.file.url} alt="menu logo" /> : <Logo />;
      const comboMenu = _.clone(config.HEADER_MENU);
      comboMenu[1].subMenu = _.clone(menu[0].subMenu);
      let normalizedProfile = auth.profile && _.clone(auth.profile);
      if (auth.profile) {
        normalizedProfile.photoURL = (_.has(auth.profile, 'photoURL') && auth.profile.photoURL !== null)
          ? `${config.CDN.PUBLIC}/avatar/${encodeURIComponent(auth.profile.photoURL)}?size=32` : '';
      } else {
        normalizedProfile = null;
      }
      return (
        <div>
          <TopNav
            menu={comboMenu}
            rightMenu={(
              <LoginNav
                loggedIn={!_.isEmpty(auth.profile)}
                notificationButtonState="none"
                notifications={[]}
                accountMenu={config.ACCOUNT_MENU}
                switchText={config.ACCOUNT_MENU_SWITCH_TEXT}
                onSwitch={this.handleSwitchMenu}
                onMenuOpen={this.handleCloseOpenMore}
                showNotification={false}
                profile={normalizedProfile}
                authURLs={config.HEADER_AUTH_URLS}
              />
            )}
            logo={logoToUse}
            theme={config.HEADER_MENU_THEME}
            currentLevel1Id={activeLevel1Id}
            onChangeLevel1Id={this.handleChangeLevel1Id}
            path={path}
            openMore={openMore}
            setOpenMore={this.handleChangeOpenMore}
            loggedIn={!_.isEmpty(auth.profile)}
            profileHandle={auth.profile ? auth.profile.handle : ''}
          />
        </div>
      );
    }
    // no SSR for navi component yet
    // TODO when ready
    return null;
  }
}

MenuLoaderContainer.defaultProps = {
  preview: false,
  spaceName: null,
  environment: null,
  menu: [],
  baseUrl: '',
};

MenuLoaderContainer.propTypes = {
  id: PT.string.isRequired,
  preview: PT.bool,
  spaceName: PT.string,
  environment: PT.string,
  fields: PT.shape().isRequired,
  auth: PT.shape().isRequired,
  loadMenuData: PT.func.isRequired,
  menu: PT.arrayOf(PT.shape()),
  loading: PT.bool.isRequired,
  menuLogo: PT.shape().isRequired,
  baseUrl: PT.string,
};

function mapStateToProps(state, ownProps) {
  return {
    auth: state.auth || {},
    menu: state.menuNavigation[ownProps.id] ? state.menuNavigation[ownProps.id].menu : [],
    loading: state.menuNavigation[ownProps.id] ? state.menuNavigation[ownProps.id].loading : true,
    menuLogo: state.menuNavigation[ownProps.id] ? state.menuNavigation[ownProps.id].menuLogo : {},
  };
}

function mapDispatchToProps(dispatch) {
  const a = actions.contentful;
  return {
    loadMenuData: (ownProps) => {
      dispatch(a.getMenuInit(ownProps));
      dispatch(a.getMenuDone(ownProps));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuLoaderContainer);
