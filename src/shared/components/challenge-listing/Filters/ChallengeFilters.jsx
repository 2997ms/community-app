/**
 * Challenge search & filters panel.
 */
import React from 'react';
import PT from 'prop-types';
import SwitchWithLabel from 'components/SwitchWithLabel';
import { challenge as challengeUtils } from 'topcoder-react-lib';
// import { COMPETITION_TRACKS as TRACKS } from 'utils/tc';
import _ from 'lodash';

// import localStorage from 'localStorage';
import ChallengeSearchBar from './ChallengeSearchBar';
// import EditTrackPanel from './EditTrackPanel';
import FiltersIcon from './FiltersSwitch/filters-icon.svg';
import FiltersPanel from './FiltersPanel';
import FiltersSwitch from './FiltersSwitch';

import './ChallengeFilters.scss';

const Filter = challengeUtils.filter;

export default function ChallengeFilters({
  communityFilters,
  communityName,
  defaultCommunityId,
  // challenges,
  expanded,
  filterState,
  isAuth,
  auth,
  // isCardTypeSet,
  isReviewOpportunitiesBucket,
  activeBucket,
  // saveFilter,
  searchText,
  selectCommunity,
  selectedCommunityId,
  setExpanded,
  setFilterState,
  setSearchText,
  // showTrackModal,
  // trackModalShown,
  validKeywords,
  validTypes,
  // isSavingFilter,
}) {
  let filterRulesCount = 0;
  if (filterState.groups && filterState.groups.length) filterRulesCount += 1;
  if (filterState.events && filterState.events.length) filterRulesCount += 1;
  if (filterState.tags && filterState.tags.length) filterRulesCount += 1;
  if (filterState.types && filterState.types.length) filterRulesCount += 1;
  if (filterState.endDateStart || filterState.startDateEnd) {
    filterRulesCount += 1;
  }
  if (isReviewOpportunitiesBucket && filterState.reviewOpportunityType) filterRulesCount += 1;
  // if (selectedCommunityId !== '' && selectedCommunityId !== 'All') filterRulesCount += 1;
  const isTrackOn = track => filterState.tracks && filterState.tracks[track];

  const switchTrack = (track, on) => {
    const act = on ? Filter.addTrack : Filter.removeTrack;
    const filterObj = act(filterState, track);
    setFilterState({ ...filterObj });
  };

  const clearSearch = () => {
    // setFilterState(Filter.setText(filterState, ''));
    setFilterState({ ..._.clone(filterState), name: '' });
    setSearchText('');
  };

  return (
    <div styleName="challenge-filters">
      <div styleName="filter-header">
        <ChallengeSearchBar
          onSearch={(text) => {
            // console.log('search text');
            // console.log(text);
            setFilterState({ ..._.clone(filterState), name: text });
          }}
          // onSearch={text => setFilterState(Filter.setText(filterState, text))}
          onClearSearch={() => clearSearch()}
          label={isReviewOpportunitiesBucket ? 'Search Review Opportunities:' : 'Search Challenges:'}
          placeholder={isReviewOpportunitiesBucket ? 'Search Review Opportunities' : 'Type the challenge name here'}
          query={searchText}
          setQuery={setSearchText}
        />
        <span>
          <span styleName="filter-switch-with-label" aria-label={`Design toggle button pressed ${isTrackOn('Des') ? 'On' : 'Off'}`} role="switch" aria-checked={isTrackOn('Des')}>
            <SwitchWithLabel
              enabled={isTrackOn('Des')}
              labelBefore="Design"
              onSwitch={on => switchTrack('Des', on)}
            />
          </span>
          <span styleName="filter-switch-with-label" aria-label={`Development toggle button pressed ${isTrackOn('Dev') ? 'On' : 'Off'}`} role="switch" aria-checked={isTrackOn('Dev')}>
            <SwitchWithLabel
              enabled={isTrackOn('Dev')}
              labelBefore="Development"
              onSwitch={on => switchTrack('Dev', on)}
            />
          </span>
          <span styleName="filter-switch-with-label" aria-label={`Data Science toggle button pressed ${isTrackOn('DS') ? 'On' : 'Off'}`} role="switch" aria-checked={isTrackOn('DS')}>
            <SwitchWithLabel
              enabled={isTrackOn('DS')}
              labelBefore="Data Science"
              onSwitch={on => switchTrack('DS', on)}
            />
          </span>
          <span styleName="filter-switch-with-label" aria-label={`QA toggle button pressed ${isTrackOn('QA') ? 'On' : 'Off'}`} role="switch" aria-checked={isTrackOn('QA')}>
            <SwitchWithLabel
              enabled={isTrackOn('QA')}
              labelBefore="QA"
              onSwitch={on => switchTrack('QA', on)}
            />
          </span>
        </span>
        {/* {
          isCardTypeSet === 'Challenges'
            ?  : ''
        } */}
        <span styleName="pulled-right">
          {/* {
            isCardTypeSet === 'Challenges'
              ? (
                <span
                  onClick={() => showTrackModal(true)}
                  onKeyPress={() => showTrackModal(true)}
                  role="button"
                  styleName="track-btn"
                  tabIndex={0}
                >
                  Tracks
                  <span styleName="down-arrow" />
                </span>
              ) : ''
          } */}
          {/* TODO: Two components below are filter switch buttons for
            * mobile and desktop views. Should be refactored to use the
            * same component, which automatically changes its style depending
            * on the viewport size. */}
          <span
            onClick={() => setExpanded(!expanded)}
            onKeyPress={() => setExpanded(!expanded)}
            role="button"
            styleName="filter-btn"
            tabIndex={0}
          >
            <FiltersIcon styleName="FiltersIcon" />
            {
              // filterRulesCount ? (
              //   <span styleName="filtersCount">
              //     {filterRulesCount}
              //   </span>
              // ) : null
            }
          </span>
          <FiltersSwitch
            active={expanded}
            filtersCount={filterRulesCount}
            onSwitch={setExpanded}
            styleName="FiltersSwitch"
          />
        </span>
      </div>

      <FiltersPanel
        communityFilters={communityFilters}
        communityName={communityName}
        defaultCommunityId={defaultCommunityId}
        // challenges={challenges}
        hidden={!expanded}
        isAuth={isAuth}
        auth={auth}
        isReviewOpportunitiesBucket={isReviewOpportunitiesBucket}
        activeBucket={activeBucket}
        filterState={filterState}
        onClose={() => setExpanded(false)}
        // onSaveFilter={saveFilter}
        selectCommunity={selectCommunity}
        selectedCommunityId={selectedCommunityId}
        setFilterState={setFilterState}
        setSearchText={setSearchText}
        validKeywords={validKeywords}
        validTypes={validTypes}
        // isSavingFilter={isSavingFilter}
      />

      {/* <EditTrackPanel
        opened={trackModalShown}
        onClose={() => showTrackModal(false)}
        designEnabled={isTrackOn(TRACKS.DESIGN)}
        switchDesign={on => switchTrack(TRACKS.DESIGN, on)}
        devEnabled={isTrackOn(TRACKS.DEVELOP)}
        switchDev={on => switchTrack(TRACKS.DEVELOP, on)}
        dataScienceEnabled={isTrackOn(TRACKS.DATA_SCIENCE)}
        switchDataScience={on => switchTrack(TRACKS.DATA_SCIENCE, on)}
        qaEnabled={isTrackOn(TRACKS.QA)}
        switchQA={on => switchTrack(TRACKS.QA, on)}
      /> */}
    </div>
  );
}

ChallengeFilters.defaultProps = {
  communityName: null,
  isAuth: false,
  // isCardTypeSet: '',
  isReviewOpportunitiesBucket: false,
  // isSavingFilter: false,
  // challenges: [],
};

ChallengeFilters.propTypes = {
  communityFilters: PT.arrayOf(PT.shape()).isRequired,
  communityName: PT.string,
  defaultCommunityId: PT.string.isRequired,
  activeBucket: PT.string.isRequired,
  // challenges: PT.arrayOf(PT.shape()),
  expanded: PT.bool.isRequired,
  filterState: PT.shape().isRequired,
  isAuth: PT.bool,
  auth: PT.shape().isRequired,
  // isCardTypeSet: PT.string,
  // isSavingFilter: PT.bool,
  isReviewOpportunitiesBucket: PT.bool,
  // saveFilter: PT.func.isRequired,
  selectCommunity: PT.func.isRequired,
  selectedCommunityId: PT.string.isRequired,
  setExpanded: PT.func.isRequired,
  setFilterState: PT.func.isRequired,
  searchText: PT.string.isRequired,
  setSearchText: PT.func.isRequired,
  // showTrackModal: PT.func.isRequired,
  // trackModalShown: PT.bool.isRequired,
  validKeywords: PT.arrayOf(PT.string).isRequired,
  validTypes: PT.arrayOf(PT.object).isRequired,
};
