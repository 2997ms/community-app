/**
 * Challenge search & filters panel.
 */
import React from 'react';
import PT from 'prop-types';
import _ from 'lodash';
import SwitchWithLabel from 'components/SwitchWithLabel';
// import { challenge as challengeUtils } from 'topcoder-react-lib';
import { COMPETITION_TRACKS as TRACKS } from 'utils/tc';

// import localStorage from 'localStorage';
import ChallengeSearchBar from './ChallengeSearchBar';
// import EditTrackPanel from './EditTrackPanel';
import FiltersIcon from './FiltersSwitch/filters-icon.svg';
import FiltersPanel from './FiltersPanel';
import FiltersSwitch from './FiltersSwitch';

import './ChallengeFilters.scss';

// const Filter = challengeUtils.filter;

export default function ChallengeFilters({
  communityFilters,
  communityName,
  defaultCommunityId,
  challenges,
  expanded,
  filterState,
  isAuth,
  auth,
  // isCardTypeSet,
  isReviewOpportunitiesBucket,
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
  validSubtracks,
  // isSavingFilter,
}) {
  let filterRulesCount = 0;
  if (filterState.tags) filterRulesCount += 1;
  if (filterState.subtracks) filterRulesCount += 1;
  if (filterState.endDate || filterState.startDate) filterRulesCount += 1;
  if (isReviewOpportunitiesBucket && filterState.reviewOpportunityType) filterRulesCount += 1;
  if (selectedCommunityId !== '') filterRulesCount += 1;
  const isTrackOn = track => !filterState.tracks || Boolean(filterState.tracks[track]);

  // const switchTrack = f => f;
  const switchTrack = (track, on) => {
    const filterObj = _.clone(filterState);
    if (on) {
      if (_.indexOf(filterObj.tracks, track) < 0) {
        filterObj.push(filterState.tracks[track]);
      }
    } else {
      const trackIndex = _.indexOf(filterObj.tracks, track);
      if (trackIndex >= 0) {
        filterObj.splice(trackIndex, 1);
      }
    }
    // const act = on ? Filter.addTrack : Filter.removeTrack;
    // const filterObj = act(filterState, track);
    // localStorage.setItem('trackStatus', JSON.stringify(filterObj));
    setFilterState(filterObj);
  };

  const clearSearch = () => {
    // setFilterState(Filter.setText(filterState, ''));
    setSearchText('');
  };

  return (
    <div styleName="challenge-filters">
      <div styleName="filter-header">
        <ChallengeSearchBar
          onSearch={text => setFilterState({ text })}
          onClearSearch={() => clearSearch()}
          label={isReviewOpportunitiesBucket ? 'Search Review Opportunities:' : 'Search Challenges:'}
          placeholder={isReviewOpportunitiesBucket ? 'Search Review Opportunities' : 'Type the challenge name here'}
          query={searchText}
          setQuery={setSearchText}
        />
        {/* {
          isCardTypeSet === 'Challenges'
            ? (
              <span>
                <span styleName="filter-switch-with-label"
                  aria-label={`Design toggle button pressed ${isTrackOn(TRACKS.DESIGN)
                  ? 'On' : 'Off'}`} role="switch" aria-checked={isTrackOn(TRACKS.DESIGN)}>
                  <SwitchWithLabel
                    enabled={isTrackOn(TRACKS.DESIGN)}
                    labelBefore="Design"
                    onSwitch={on => switchTrack(TRACKS.DESIGN, on)}
                  />
                </span>
                <span styleName="filter-switch-with-label"
                  aria-label={`Development toggle button pressed ${isTrackOn(TRACKS.DEVELOP)
                  ? 'On' : 'Off'}`} role="switch" aria-checked={isTrackOn(TRACKS.DEVELOP)}>
                  <SwitchWithLabel
                    enabled={isTrackOn(TRACKS.DEVELOP)}
                    labelBefore="Development"
                    onSwitch={on => switchTrack(TRACKS.DEVELOP, on)}
                  />
                </span>
                <span styleName="filter-switch-with-label"
                  aria-label={`Data Science toggle button pressed ${isTrackOn(TRACKS.DATA_SCIENCE)
                  ? 'On' : 'Off'}`} role="switch" aria-checked={isTrackOn(TRACKS.DATA_SCIENCE)}>
                  <SwitchWithLabel
                    enabled={isTrackOn(TRACKS.DATA_SCIENCE)}
                    labelBefore="Data Science"
                    onSwitch={on => switchTrack(TRACKS.DATA_SCIENCE, on)}
                  />
                </span>
              </span>
            ) : ''
        } */}
        <span>
          <span styleName="filter-switch-with-label" aria-label={`Design toggle button pressed ${isTrackOn(TRACKS.DESIGN) ? 'On' : 'Off'}`} role="switch" aria-checked={isTrackOn(TRACKS.DESIGN)}>
            <SwitchWithLabel
              enabled={isTrackOn(TRACKS.DESIGN)}
              labelBefore="Design"
              onSwitch={on => switchTrack(TRACKS.DESIGN, on)}
            />
          </span>
          <span styleName="filter-switch-with-label" aria-label={`Development toggle button pressed ${isTrackOn(TRACKS.DEVELOP) ? 'On' : 'Off'}`} role="switch" aria-checked={isTrackOn(TRACKS.DEVELOP)}>
            <SwitchWithLabel
              enabled={isTrackOn(TRACKS.DEVELOP)}
              labelBefore="Development"
              onSwitch={on => switchTrack(TRACKS.DEVELOP, on)}
            />
          </span>
          <span styleName="filter-switch-with-label" aria-label={`Data Science toggle button pressed ${isTrackOn(TRACKS.DATA_SCIENCE) ? 'On' : 'Off'}`} role="switch" aria-checked={isTrackOn(TRACKS.DATA_SCIENCE)}>
            <SwitchWithLabel
              enabled={isTrackOn(TRACKS.DATA_SCIENCE)}
              labelBefore="Data Science"
              onSwitch={on => switchTrack(TRACKS.DATA_SCIENCE, on)}
            />
          </span>
        </span>
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
              filterRulesCount ? (
                <span styleName="filtersCount">
                  {filterRulesCount}
                </span>
              ) : null
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
        challenges={challenges}
        hidden={!expanded}
        isAuth={isAuth}
        auth={auth}
        isReviewOpportunitiesBucket={isReviewOpportunitiesBucket}
        filterState={filterState}
        onClose={() => setExpanded(false)}
        // onSaveFilter={saveFilter}
        selectCommunity={selectCommunity}
        selectedCommunityId={selectedCommunityId}
        setFilterState={setFilterState}
        setSearchText={setSearchText}
        validKeywords={validKeywords}
        validSubtracks={validSubtracks}
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
  challenges: [],
};

ChallengeFilters.propTypes = {
  communityFilters: PT.arrayOf(PT.shape()).isRequired,
  communityName: PT.string,
  defaultCommunityId: PT.string.isRequired,
  challenges: PT.arrayOf(PT.shape()),
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
  validSubtracks: PT.arrayOf(PT.object).isRequired,
};
