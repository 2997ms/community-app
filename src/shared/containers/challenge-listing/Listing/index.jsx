/**
 * This is a container component for ChallengeFiltersExample.
 * It represents community-challenge-listing page.
 *
 * ChallengeFiltersExample component was brought from another project with different approach
 * and it takes care about everything it needs by itself.
 * So this container components almost doing nothing now.
 * Though this component defines a master filter function
 * which is used to define which challenges should be listed for the certain community.
 */

import _ from 'lodash';
import actions from 'actions/challenge-listing';
import challengeDetailsActions from 'actions/page/challenge-details';
import filterPanelActions from 'actions/challenge-listing/filter-panel';
import headerActions from 'actions/topcoder_header';
import { logger, challenge as challengeUtils } from 'topcoder-react-lib';
import React from 'react';
import PT from 'prop-types';
import shortId from 'shortid';
import { connect } from 'react-redux';
import ChallengeListing from 'components/challenge-listing';
import Banner from 'components/tc-communities/Banner';
import sidebarActions from 'actions/challenge-listing/sidebar';
import communityActions from 'actions/tc-communities';
// import SORT from 'utils/challenge-listing/sort';
import { BUCKETS, filterChanged, sortChangedBucket } from 'utils/challenge-listing/buckets';
import { MetaTags } from 'topcoder-react-utils';
import { USER_GROUP_MAXAGE } from 'config';
import { updateChallengeType } from 'utils/challenge';

import ogImage from '../../../../assets/images/og_image.jpg';
import style from './styles.scss';

// const { combine, mapToBackend } = challengeUtils.filter;
const { mapToBackend } = challengeUtils.filter;

let mounted = false;

const SEO_PAGE_TITLE = 'Topcoder Challenges';

export class ListingContainer extends React.Component {
  componentDidMount() {
    const {
      activeBucket,
      auth,
      // dropChallenges,
      communitiesList,
      communityId,
      getCommunitiesList,
      markHeaderMenu,
      selectBucket,
      setFilter,
      selectCommunity,
      queryBucket,
      filter,
    } = this.props;

    markHeaderMenu();

    if (queryBucket !== activeBucket && _.includes(BUCKETS, queryBucket)) {
      selectBucket(queryBucket);
    }

    if (!communitiesList.loadingUuid
    && (Date.now() - communitiesList.timestamp > USER_GROUP_MAXAGE)) {
      getCommunitiesList(auth);
    }

    let selectedCommunity;
    if (communityId) {
      selectCommunity(communityId);
      selectedCommunity = communitiesList.data.find(item => item.communityId === communityId);
    }

    if (mounted) {
      logger.error('Attempt to mount multiple instances of ChallengeListingPageContainer at the same time!');
    } else mounted = true;

    // if (BUCKETS.PAST !== activeBucket) {
    // dropChallenges();
    // this.loadChallenges();
    if (!selectedCommunity) {
      this.reloadChallenges();
    } else {
      const groups = selectedCommunity.groupIds && selectedCommunity.groupIds.length
        ? [selectedCommunity.groupIds[0]] : [];
      // update the challenge listing filter for selected community
      setFilter({ ..._.clone(filter), groups, events: [] });
    }
    // }
  }

  componentDidUpdate(prevProps) {
    const {
      // activeBucket,
      auth,
      // dropChallenges,
      getCommunitiesList,
      // allActiveChallengesLoaded,
      // getRestActiveChallenges,
      // meta,
      // loadingActiveChallengesUUID,
      selectBucketDone,
      filter,
      sorts,
      dropMyChallenges,
      getMyChallenges,
      dropAllChallenges,
      getAllChallenges,
      getOpenForRegistrationChallenges,
      getActiveChallenges,
      dropActiveChallenges,
      dropOpenForRegistrationChallenges,
      // dropPastChallenges,
      // getPastChallenges,
    } = this.props;
    const oldUserId = _.get(prevProps, 'auth.user.userId');
    const userId = _.get(this.props, 'auth.user.userId');
    if (userId !== oldUserId) {
      getCommunitiesList(auth);
    }
    // console.log(prevProps);
    // const { profile } = auth;
    // if (profile) {
    //   if (!prevProps.auth.profile) setImmediate(() => this.loadChallenges());
    // } else if (prevProps.auth.profile) {
    //   setImmediate(() => {
    //     this.reloadChallenges();
    //   });
    // }

    // if (!loadingActiveChallengesUUID && !_.isEmpty(meta) && !allActiveChallengesLoaded
    // && BUCKETS.PAST !== activeBucket) {
    // const f = this.getBackendFilter();
    // getRestActiveChallenges(auth.tokenV3, f.back);
    // }
    const bucket = sortChangedBucket(sorts, prevProps.sorts);
    const f = this.getBackendFilter();
    if (bucket) {
      switch (bucket) {
        case BUCKETS.MY: {
          dropMyChallenges();
          getMyChallenges(
            0,
            f.back,
            auth.tokenV3,
            f.front,
          );
          break;
        }
        case BUCKETS.OPEN_FOR_REGISTRATION: {
          dropOpenForRegistrationChallenges();
          getOpenForRegistrationChallenges(
            0,
            f.back,
            auth.tokenV3,
            f.front,
          );
          break;
        }
        case BUCKETS.ONGOING: {
          dropActiveChallenges();
          getActiveChallenges(
            0,
            f.back,
            auth.tokenV3,
            f.front,
          );
          break;
        }
        case BUCKETS.ALL: {
          dropAllChallenges();
          getAllChallenges(
            0,
            f.back,
            auth.tokenV3,
            f.front,
          );
          break;
        }
        // case BUCKETS.PAST: {
        //   dropPastChallenges();
        //   getPastChallenges(
        //     0,
        //     f.back,
        //     auth.tokenV3,
        //     f.front,
        //   );
        //   break;
        // }
        default: {
          break;
        }
      }
      return;
    }
    if (filterChanged(filter, prevProps.filter)) {
      this.reloadChallenges();
    }
    setTimeout(() => {
      selectBucketDone();
    }, 10);
  }

  componentWillUnmount() {
    if (mounted) mounted = false;
    else {
      logger.error('A mounted instance of ChallengeListingPageContainer is not tracked as mounted!');
    }
    if (this.autoRefreshTimerId) clearTimeout(this.autoRefreshTimerId);
  }

  /* Evaluates the backend challenge filter most suitable for the current state
   * of the active frontend filters. */
  getBackendFilter() {
    const {
      // communitiesList,
      // selectedCommunityId,
      // groupIds,
      // communityId,
      sorts,
      filter,
    } = this.props;
    const filterTemp = _.clone(filter);
    // let communityFilter = communitiesList.data.find(
    // item => item.communityId === selectedCommunityId,
    // );
    // if (communityFilter) communityFilter = communityFilter.challengeFilter;
    // if (communityFilter) filter = combine(filter, communityFilter);
    // if (communityId && !_.isEmpty(groupIds)) {
    // filter.groups = groupIds;
    // }
    filterTemp.sorts = sorts;
    // switch (bucket) {
    //   case BUCKETS.MY:
    //   case BUCKETS.OPEN_FOR_REGISTRATION:
    //   case BUCKETS.DROP_ACTIVE_CHALLENGES: {
    //     filter.sortBy = sorts[bucket];
    //     filter.sortOrder = SORT[sorts[bucket]];
    //     break;
    //   }
    //   default: {
    //     break;
    //   }
    // }
    return {
      back: mapToBackend(filterTemp),
      front: filterTemp,
    };
  }

  loadChallenges() {
    const {
      auth,
      // DISABLED: Until api receive fix community-app#5073
      // getActiveChallenges,
      getOpenForRegistrationChallenges,
      getMyChallenges,
      getAllChallenges,
      // getPastChallenges,
      // lastRequestedPageOfActiveChallenges,
      // lastRequestedPageOfOpenForRegistrationChallenges,
      // lastRequestedPageOfMyChallenges,
      // lastRequestedPageOfPastChallenges,
      // getUserChallenges,
      getTotalChallengesCount,
    } = this.props;
    const f = this.getBackendFilter();
    getAllChallenges(
      0,
      f.back,
      auth.tokenV3,
      f.front,
    );
    // DISABLED: Until api receive fix community-app#5073
    /*
    getActiveChallenges(
      0,
      f.back,
      auth.tokenV3,
      f.front,
    );
    */
    getOpenForRegistrationChallenges(
      0,
      f.back,
      auth.tokenV3,
      f.front,
    );

    // Only retrieve my challenge only when user has login
    if (auth.user) {
      getMyChallenges(
        0,
        f.back,
        auth.tokenV3,
        f.front,
      );
    }
    // getPastChallenges(
    //   0,
    //   f.back,
    //   auth.tokenV3,
    //   f.front,
    // );
    getTotalChallengesCount(auth.tokenV3, f.front);
  }

  reloadChallenges() {
    const {
      dropChallenges,
    } = this.props;
    dropChallenges();
    this.loadChallenges();
    // switch (activeBucket) {
    //   case BUCKETS.MY: {
    //     dropMyChallenges();
    //     getMyChallenges(
    //       0,
    //       f.back,
    //       auth.tokenV3,
    //       f.front,
    //     );
    //     break;
    //   }
    //   case BUCKETS.OPEN_FOR_REGISTRATION: {
    //     dropOpenForRegistrationChallenges();
    //     getOpenForRegistrationChallenges(
    //       0,
    //       f.back,
    //       auth.tokenV3,
    //       f.front,
    //     );
    //     break;
    //   }
    //   case BUCKETS.DROP_ACTIVE_CHALLENGES: {
    //     dropActiveChallenges();
    //     getActiveChallenges(
    //       0,
    //       f.back,
    //       auth.tokenV3,
    //       f.front,
    //     );
    //     break;
    //   }
    //   default: {
    //     dropChallenges();
    //     this.loadChallenges();
    //     break;
    //   }
    // }
  }

  render() {
    const {
      auth,
      // allPastChallengesLoaded,
      allReviewOpportunitiesLoaded,
      activeBucket,
      ChallengeListingBanner,
      challenges,
      openForRegistrationChallenges,
      myChallenges,
      allChallenges,
      // pastChallenges,
      challengeTypes,
      challengesUrl,
      challengeTags,
      communityFilters,
      communityId,
      communityName,
      defaultCommunityId,
      expanding,
      expandTag,
      expandedTags,
      // extraBucket,
      filter,
      groupIds,
      getActiveChallenges,
      getMyChallenges,
      getAllChallenges,
      getOpenForRegistrationChallenges,
      // getPastChallenges,
      getReviewOpportunities,
      hideSrm,
      keepPastPlaceholders,
      lastRequestedPageOfMyChallenges,
      lastRequestedPageOfAllChallenges,
      lastRequestedPageOfActiveChallenges,
      lastRequestedPageOfOpenForRegistrationChallenges,
      // lastRequestedPageOfPastChallenges,
      lastRequestedPageOfReviewOpportunities,
      // lastUpdateOfActiveChallenges,
      loadingActiveChallengesUUID,
      loadingOpenForRegistrationChallengesUUID,
      loadingMyChallengesUUID,
      loadingAllChallengesUUID,
      // loadingPastChallengesUUID,
      loadingReviewOpportunitiesUUID,
      listingOnly,
      newChallengeDetails,
      openChallengesInNewTabs,
      preListingMsg,
      prizeMode,
      reviewOpportunities,
      selectBucket,
      selectChallengeDetailsTab,
      selectedCommunityId,
      setFilter,
      setSearchText,
      setSort,
      sorts,
      hideTcLinksInSidebarFooter,
      // isBucketSwitching,
      // userChallenges,
      meta,
    } = this.props;

    const { tokenV3 } = auth;

    const isLoggedIn = !_.isEmpty(auth.tokenV3);

    // let loadMorePast;
    // if (!allPastChallengesLoaded) {
    //   loadMorePast = () => {
    //     const f = this.getBackendFilter();
    //     getPastChallenges(
    //       1 + lastRequestedPageOfPastChallenges,
    //       f.back,
    //       tokenV3,
    //       f.front,
    //     );
    //   };
    // }

    // const loadMorePast = () => {
    //   const f = this.getBackendFilter();
    //   getPastChallenges(
    //     1 + lastRequestedPageOfPastChallenges,
    //     f.back,
    //     tokenV3,
    //     f.front,
    //   );
    // };

    const loadMoreMy = () => {
      const f = this.getBackendFilter();
      getMyChallenges(
        1 + lastRequestedPageOfMyChallenges,
        f.back,
        tokenV3,
        f.front,
      );
    };

    const loadMoreOpenForRegistration = () => {
      const f = this.getBackendFilter();
      getOpenForRegistrationChallenges(
        1 + lastRequestedPageOfOpenForRegistrationChallenges,
        f.back,
        tokenV3,
        f.front,
      );
    };

    const loadMoreOnGoing = () => {
      const f = this.getBackendFilter();
      getActiveChallenges(
        1 + lastRequestedPageOfActiveChallenges,
        f.back,
        tokenV3,
        f.front,
      );
    };

    const loadMoreAll = () => {
      const f = this.getBackendFilter();
      getAllChallenges(
        1 + lastRequestedPageOfAllChallenges,
        f.back,
        tokenV3,
        f.front,
      );
    };

    let loadMoreReviewOpportunities;
    if (!allReviewOpportunitiesLoaded) {
      loadMoreReviewOpportunities = () => getReviewOpportunities(
        1 + lastRequestedPageOfReviewOpportunities, tokenV3,
      );
    }

    let communityFilter = communityFilters.find(item => item.communityId === selectedCommunityId);
    if (communityFilter) communityFilter = communityFilter.challengeFilter;

    const description = 'Join Topcoder and compete in these challenges, to learn and earn!';

    let banner;
    if (!listingOnly) {
      banner = ChallengeListingBanner ? (
        <ChallengeListingBanner />
      ) : (
        <Banner
          title="Challenges"
          text="Browse our available challenges and compete."
          theme={{
            container: style.bannerContainer,
            content: style.bannerContent,
            contentInner: style.bannerContentInner,
          }}
          imageSrc="/community-app-assets/themes/wipro/challenges/banner.jpg"
        />
      );
    }

    return (
      <div styleName="container" role="main">
        <MetaTags
          description={description}
          image={ogImage}
          siteName="Topcoder"
          title={communityId ? `${communityName} Challenges` : SEO_PAGE_TITLE}
        />
        {banner}
        <ChallengeListing
          activeBucket={activeBucket}
          challenges={challenges}
          openForRegistrationChallenges={openForRegistrationChallenges}
          myChallenges={myChallenges}
          allChallenges={allChallenges}
          // pastChallenges={pastChallenges}
          challengeTypes={challengeTypes}
          challengeTags={challengeTags}
          challengesUrl={challengesUrl}
          communityFilter={communityFilter}
          communityName={communityName}
          defaultCommunityId={defaultCommunityId}
          expanding={expanding}
          expandedTags={expandedTags}
          expandTag={expandTag}
          // extraBucket={extraBucket}
          filterState={filter}
          hideSrm={hideSrm}
          hideTcLinksInFooter={hideTcLinksInSidebarFooter}
          keepPastPlaceholders={keepPastPlaceholders}
          // lastUpdateOfActiveChallenges={lastUpdateOfActiveChallenges}
          // eslint-disable-next-line max-len
          loadingMyChallenges={Boolean(loadingMyChallengesUUID)}
          loadingAllChallenges={Boolean(loadingAllChallengesUUID)}
          loadingOpenForRegistrationChallenges={Boolean(loadingOpenForRegistrationChallengesUUID)}
          loadingOnGoingChallenges={Boolean(loadingActiveChallengesUUID)}
          // eslint-disable-next-line max-len
          // loadingChallenges={Boolean(loadingActiveChallengesUUID) && Boolean(loadingOpenForRegistrationChallengesUUID) && Boolean(loadingMyChallengesUUID)}
          // loadingPastChallenges={Boolean(loadingPastChallengesUUID)}
          loadingReviewOpportunities={Boolean(loadingReviewOpportunitiesUUID)}
          newChallengeDetails={newChallengeDetails}
          openChallengesInNewTabs={openChallengesInNewTabs}
          preListingMsg={preListingMsg}
          prizeMode={prizeMode}
          selectBucket={selectBucket}
          selectChallengeDetailsTab={selectChallengeDetailsTab}
          selectedCommunityId={selectedCommunityId}
          // loadMorePast={loadMorePast}
          loadMoreReviewOpportunities={loadMoreReviewOpportunities}
          loadMoreMy={loadMoreMy}
          loadMoreAll={loadMoreAll}
          loadMoreOpenForRegistration={loadMoreOpenForRegistration}
          loadMoreOnGoing={loadMoreOnGoing}
          reviewOpportunities={reviewOpportunities}
          setFilterState={(state) => {
            setFilter(state);
            setSearchText(state.name || '');
            // if (activeBucket === BUCKETS.SAVED_FILTER) {
            //   selectBucket(BUCKETS.OPEN_FOR_REGISTRATION);
            // } else if (activeBucket === BUCKETS.SAVED_REVIEW_OPPORTUNITIES_FILTER) {
            //   selectBucket(BUCKETS.REVIEW_OPPORTUNITIES);
            // }
          }}
          setSort={setSort}
          sorts={sorts}
          groupIds={groupIds}
          auth={auth}
          // isBucketSwitching={isBucketSwitching}
          // userChallenges={[]}
          isLoggedIn={isLoggedIn}
          meta={meta}
        />
      </div>
    );
  }
}

ListingContainer.defaultProps = {
  ChallengeListingBanner: null,
  challengeTypes: [],
  // pastChallenges: [],
  defaultCommunityId: '',
  // extraBucket: null,
  hideSrm: false,
  selectedCommunityId: '',
  groupIds: [''],
  hideTcLinksInSidebarFooter: false,
  challengesUrl: '/challenges',
  communityId: null,
  communityName: null,
  listingOnly: false,
  newChallengeDetails: false,
  openChallengesInNewTabs: false,
  preListingMsg: null,
  prizeMode: 'money-usd',
  queryBucket: BUCKETS.OPEN_FOR_REGISTRATION,
  meta: {},
  expanding: false,
  // isBucketSwitching: false,
  // userChallenges: [],
};

ListingContainer.propTypes = {
  auth: PT.shape({
    profile: PT.shape(),
    tokenV3: PT.string,
    user: PT.shape(),
  }).isRequired,
  // allActiveChallengesLoaded: PT.bool.isRequired,
  // allPastChallengesLoaded: PT.bool.isRequired,
  allReviewOpportunitiesLoaded: PT.bool.isRequired,
  ChallengeListingBanner: PT.node,
  challenges: PT.arrayOf(PT.shape({})).isRequired, // active challenges.
  openForRegistrationChallenges: PT.arrayOf(PT.shape({})).isRequired,
  myChallenges: PT.arrayOf(PT.shape({})).isRequired,
  allChallenges: PT.arrayOf(PT.shape({})).isRequired,
  // pastChallenges: PT.arrayOf(PT.shape({})),
  challengeTypes: PT.arrayOf(PT.shape()),
  challengesUrl: PT.string,
  challengeTags: PT.arrayOf(PT.string).isRequired,
  communitiesList: PT.shape({
    data: PT.arrayOf(PT.shape({
      challengeFilter: PT.shape(),
      communityId: PT.string.isRequired,
    })).isRequired,
    loadingUuid: PT.string.isRequired,
    timestamp: PT.number.isRequired,
  }).isRequired,
  defaultCommunityId: PT.string,
  dropChallenges: PT.func.isRequired,
  dropMyChallenges: PT.func.isRequired,
  dropAllChallenges: PT.func.isRequired,
  dropOpenForRegistrationChallenges: PT.func.isRequired,
  dropActiveChallenges: PT.func.isRequired,
  // dropPastChallenges: PT.func.isRequired,
  filter: PT.shape().isRequired,
  hideSrm: PT.bool,
  hideTcLinksInSidebarFooter: PT.bool,
  communityId: PT.string,
  communityName: PT.string,
  communityFilters: PT.arrayOf(PT.object).isRequired,
  // extraBucket: PT.string,
  getActiveChallenges: PT.func.isRequired,
  getOpenForRegistrationChallenges: PT.func.isRequired,
  getMyChallenges: PT.func.isRequired,
  getAllChallenges: PT.func.isRequired,
  // getRestActiveChallenges: PT.func.isRequired,
  getCommunitiesList: PT.func.isRequired,
  // getPastChallenges: PT.func.isRequired,
  getReviewOpportunities: PT.func.isRequired,
  keepPastPlaceholders: PT.bool.isRequired,
  lastRequestedPageOfActiveChallenges: PT.number.isRequired,
  lastRequestedPageOfOpenForRegistrationChallenges: PT.number.isRequired,
  lastRequestedPageOfMyChallenges: PT.number.isRequired,
  lastRequestedPageOfAllChallenges: PT.number.isRequired,
  // lastRequestedPageOfPastChallenges: PT.number.isRequired,
  lastRequestedPageOfReviewOpportunities: PT.number.isRequired,
  // lastUpdateOfActiveChallenges: PT.number.isRequired,
  loadingActiveChallengesUUID: PT.string.isRequired,
  loadingOpenForRegistrationChallengesUUID: PT.string.isRequired,
  loadingMyChallengesUUID: PT.string.isRequired,
  loadingAllChallengesUUID: PT.string.isRequired,
  // loadingPastChallengesUUID: PT.string.isRequired,
  loadingReviewOpportunitiesUUID: PT.string.isRequired,
  markHeaderMenu: PT.func.isRequired,
  newChallengeDetails: PT.bool,
  openChallengesInNewTabs: PT.bool,
  preListingMsg: PT.node,
  prizeMode: PT.string,
  reviewOpportunities: PT.arrayOf(PT.shape()).isRequired,
  selectBucket: PT.func.isRequired,
  selectChallengeDetailsTab: PT.func.isRequired,
  selectCommunity: PT.func.isRequired,
  setFilter: PT.func.isRequired,
  activeBucket: PT.string.isRequired,
  expanding: PT.bool,
  selectedCommunityId: PT.string,
  sorts: PT.shape().isRequired,
  setSearchText: PT.func.isRequired,
  setSort: PT.func.isRequired,
  listingOnly: PT.bool,
  groupIds: PT.arrayOf(PT.string),
  expandedTags: PT.arrayOf(PT.number).isRequired,
  expandTag: PT.func.isRequired,
  queryBucket: PT.string,
  meta: PT.shape(),
  // isBucketSwitching: PT.bool,
  selectBucketDone: PT.func.isRequired,
  getTotalChallengesCount: PT.func.isRequired,
  // userChallenges: PT.arrayOf(PT.string),
  // getUserChallenges: PT.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  const cl = state.challengeListing;
  const tc = state.tcCommunities;
  updateChallengeType(
    state.challengeListing.challenges, state.challengeListing.challengeTypesMap,
  );
  return {
    auth: state.auth,
    // allActiveChallengesLoaded: cl.allActiveChallengesLoaded,
    // allPastChallengesLoaded: cl.allPastChallengesLoaded,
    allReviewOpportunitiesLoaded: cl.allReviewOpportunitiesLoaded,
    filter: cl.filter,
    challenges: cl.challenges,
    openForRegistrationChallenges: cl.openForRegistrationChallenges,
    myChallenges: cl.myChallenges,
    allChallenges: cl.allChallenges,
    // pastChallenges: cl.pastChallenges,
    challengeTypes: cl.challengeTypes,
    challengeTags: cl.challengeTags,
    communitiesList: tc.list,
    communityFilters: tc.list.data,
    domain: state.domain,
    // extraBucket: ownProps.extraBucket,
    hideTcLinksInSidebarFooter: ownProps.hideTcLinksInSidebarFooter,
    keepPastPlaceholders: cl.keepPastPlaceholders,
    lastRequestedPageOfActiveChallenges: cl.lastRequestedPageOfActiveChallenges,
    // eslint-disable-next-line max-len
    lastRequestedPageOfOpenForRegistrationChallenges: cl.lastRequestedPageOfOpenForRegistrationChallenges,
    lastRequestedPageOfMyChallenges: cl.lastRequestedPageOfMyChallenges,
    lastRequestedPageOfAllChallenges: cl.lastRequestedPageOfAllChallenges,
    // lastRequestedPageOfPastChallenges: cl.lastRequestedPageOfPastChallenges,
    lastRequestedPageOfReviewOpportunities: cl.lastRequestedPageOfReviewOpportunities,
    // lastUpdateOfActiveChallenges: cl.lastUpdateOfActiveChallenges,
    loadingActiveChallengesUUID: cl.loadingActiveChallengesUUID,
    loadingOpenForRegistrationChallengesUUID: cl.loadingOpenForRegistrationChallengesUUID,
    loadingMyChallengesUUID: cl.loadingMyChallengesUUID,
    loadingAllChallengesUUID: cl.loadingAllChallengesUUID,
    // loadingPastChallengesUUID: cl.loadingPastChallengesUUID,
    loadingReviewOpportunitiesUUID: cl.loadingReviewOpportunitiesUUID,
    loadingChallengeTypes: cl.loadingChallengeTypes,
    loadingChallengeTags: cl.loadingChallengeTags,
    newChallengeDetails: ownProps.newChallengeDetails,
    openChallengesInNewTabs: ownProps.openChallengesInNewTabs,
    preListingMsg: ownProps.preListingMsg,
    prizeMode: ownProps.prizeMode,
    reviewOpportunities: cl.reviewOpportunities,
    selectedCommunityId: cl.selectedCommunityId,
    sorts: cl.sorts,
    activeBucket: cl.sidebar.activeBucket,
    expanding: cl.sidebar.expanding,
    // isBucketSwitching: cl.sidebar.isBucketSwitching,
    expandedTags: cl.expandedTags,
    meta: cl.meta,
    // userChallenges: cl.userChallenges,
  };
};

function mapDispatchToProps(dispatch) {
  const a = actions.challengeListing;
  const ah = headerActions.topcoderHeader;
  const fpa = filterPanelActions.challengeListing.filterPanel;
  const sa = sidebarActions.challengeListing.sidebar;
  const ca = communityActions.tcCommunity;
  return {
    dropChallenges: () => dispatch(a.dropChallenges()),
    getActiveChallenges: (page, filter, token, frontFilter) => {
      const uuid = shortId();
      dispatch(a.getActiveChallengesInit(uuid, page, frontFilter));
      dispatch(a.getActiveChallengesDone(uuid, page, filter, token, frontFilter));
    },
    dropActiveChallenges: () => dispatch(a.dropActiveChallenges()),
    getOpenForRegistrationChallenges: (page, filter, token, frontFilter) => {
      const uuid = shortId();
      dispatch(a.getOpenForRegistrationChallengesInit(uuid, page, frontFilter));
      dispatch(a.getOpenForRegistrationChallengesDone(uuid, page, filter, token, frontFilter));
    },
    dropOpenForRegistrationChallenges: () => dispatch(a.dropOpenForRegistrationChallenges()),
    getMyChallenges: (page, filter, token, frontFilter) => {
      const uuid = shortId();
      dispatch(a.getMyChallengesInit(uuid, page, frontFilter));
      dispatch(a.getMyChallengesDone(uuid, page, filter, token, frontFilter));
    },
    dropMyChallenges: () => dispatch(a.dropMyChallenges()),
    getAllChallenges: (page, filter, token, frontFilter) => {
      const uuid = shortId();
      dispatch(a.getAllChallengesInit(uuid, page, frontFilter));
      dispatch(a.getAllChallengesDone(uuid, page, filter, token, frontFilter));
    },
    dropAllChallenges: () => dispatch(a.dropAllChallenges()),
    getTotalChallengesCount: (token, frontFilter) => {
      const uuid = shortId();
      dispatch(a.getTotalChallengesCountInit(uuid));
      dispatch(a.getTotalChallengesCountDone(uuid, token, frontFilter));
    },
    // getRestActiveChallenges: (token, filter) => {
    //   const uuid = shortId();
    //   dispatch(a.getRestActiveChallengesInit(uuid));
    //   dispatch(a.getRestActiveChallengesDone(uuid, token, filter));
    // },
    getCommunitiesList: (auth) => {
      const uuid = shortId();
      dispatch(ca.getListInit(uuid));
      dispatch(ca.getListDone(uuid, auth));
    },
    // dropPastChallenges: () => dispatch(a.dropPastChallenges()),
    // getPastChallenges: (page, filter, token, frontFilter) => {
    //   const uuid = shortId();
    //   dispatch(a.getPastChallengesInit(uuid, page, frontFilter));
    //   dispatch(a.getPastChallengesDone(uuid, page, filter, token, frontFilter));
    // },
    getReviewOpportunities: (page, token) => {
      const uuid = shortId();
      dispatch(a.getReviewOpportunitiesInit(uuid, page));
      dispatch(a.getReviewOpportunitiesDone(uuid, page, token));
    },
    selectBucket: (bucket, expanding) => dispatch(sa.selectBucket(bucket, expanding)),
    selectBucketDone: () => dispatch(sa.selectBucketDone()),
    selectChallengeDetailsTab:
      tab => dispatch(challengeDetailsActions.page.challengeDetails.selectTab(tab)),
    selectCommunity: id => dispatch(a.selectCommunity(id)),
    setFilter: state => dispatch(a.setFilter(state)),
    setSearchText: text => dispatch(fpa.setSearchText(text)),
    setSort: (bucket, sort) => dispatch(a.setSort(bucket, sort)),
    markHeaderMenu: () => dispatch(ah.setCurrentNav('Compete', 'All Challenges')),
    expandTag: id => dispatch(a.expandTag(id)),
    // getUserChallenges: (userId, tokenV3) => {
    //   const uuid = shortId();
    //   dispatch(a.getUserChallengesInit(uuid));
    //   dispatch(a.getUserChallengesDone(userId, tokenV3));
    // },
  };
}

const ChallengeListingContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ListingContainer);

export default ChallengeListingContainer;
