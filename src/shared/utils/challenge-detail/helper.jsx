/**
 * Helper function for challenge detail
 */
import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { convertNow as convertMoney } from 'services/money';
import { challenge as challengeUtils } from 'topcoder-react-lib';
import { config } from 'topcoder-react-utils';
import Prize from 'components/challenge-listing/ChallengeCard/Prize';
import { BUCKETS, getBuckets } from 'utils/challenge-listing/buckets';

const Filter = challengeUtils.filter;

// Constants
export const PRIZE_MODE = {
  HIDDEN: 'hidden',
  MONEY_EUR: 'money-eur',
  MONEY_INR: 'money-inr',
  MONEY_USD: 'money-usd',
};

/**
 * Get end date
 * @param {Object} challenge challenge info
 */
export function getEndDate(challenge) {
  let phases = challenge.allPhases || c.phases || [];
  if (challenge.subTrack === 'FIRST_2_FINISH' && challenge.status === 'COMPLETED') {
    phases = challenge.allPhases.filter(p => p.phaseType === 'Iterative Review' && p.phaseStatus === 'Closed');
  }
  const endPhaseDate = Math.max(...phases.map(d => new Date(d.scheduledEndTime)));
  return moment(endPhaseDate).format('MMM DD');
}

/**
 * Generates human-readable string containing time till the phase end.
 * @param {Object} phase phase need to check
 * @param {String} toGoText togo text
 */
export function getTimeLeft(
  phase,
  toGoText = 'to go',
) {
  const STALLED_TIME_LEFT_MSG = 'Challenge is currently on hold';
  const FF_TIME_LEFT_MSG = 'Winner is working on fixes';
  const HOUR_MS = 60 * 60 * 1000;
  const DAY_MS = 24 * HOUR_MS;

  if (!phase) return { late: false, text: STALLED_TIME_LEFT_MSG };
  if (phase.phaseType === 'Final Fix') {
    return { late: false, text: FF_TIME_LEFT_MSG };
  }

  let time = moment(phase.scheduledEndTime).diff();
  const late = time < 0;
  if (late) time = -time;

  let format;
  if (time > DAY_MS) format = 'D[d] H[h]';
  else if (time > HOUR_MS) format = 'H[h] m[min]';
  else format = 'm[min] s[s]';

  time = moment.duration(time).format(format);
  time = late ? `Late by ${time}` : `${time} ${toGoText}`;
  return { late, text: time };
}

/**
 * Get prize purse ui
 * @param {Object} challenge challenge info
 * @param {String} prizeMode prize mode
 * @param {String} onlyShowTooltipForPrize only show tooltip for prize
 * @param {String} label label for prize
 */
export function getPrizePurseUI(
  challenge,
  prizeMode,
  onlyShowTooltipForPrize = false,
  label = 'Purse',
) {
  /* Preparation of data to show in the prize component,
   * depending on options. */
  const bonuses = [];
  if (challenge.reliabilityBonus) {
    bonuses.push({
      name: 'Reliability',
      prize: challenge.reliabilityBonus,
    });
  }

  let prizeUnitSymbol = '';
  let { prizes } = challenge;
  let totalPrize;
  switch (prizeMode) {
    case PRIZE_MODE.MONEY_EUR:
      prizeUnitSymbol = '€';
      bonuses.forEach((bonus) => {
        bonus.prize = Math.round(convertMoney(bonus.prize, 'EUR')); // eslint-disable-line no-param-reassign
      });
      totalPrize = Math.round(convertMoney(challenge.totalPrize, 'EUR'));
      prizes = (prizes || []).map(prize => Math.round(convertMoney(prize, 'EUR')));
      break;
    case PRIZE_MODE.MONEY_INR:
      prizeUnitSymbol = '₹';
      bonuses.forEach((bonus) => {
        bonus.prize = Math.round(convertMoney(bonus.prize, 'INR')); // eslint-disable-line no-param-reassign
      });
      totalPrize = Math.round(convertMoney(challenge.totalPrize, 'INR'));
      prizes = (prizes || []).map(prize => Math.round(convertMoney(prize, 'INR')));
      break;
    case PRIZE_MODE.MONEY_USD:
      prizeUnitSymbol = '$';
      ({ totalPrize } = challenge);
      break;
    default: throw new Error('Unknown prize mode!');
  }

  if (totalPrize > 1) {
    return (
      <Prize
        bonuses={bonuses}
        label={label}
        prizes={prizes}
        prizeUnitSymbol={prizeUnitSymbol}
        totalPrize={totalPrize}
        onlyShowTooltipForPrize={onlyShowTooltipForPrize}
      />
    );
  }
  return null;
}

/**
 * Get prize points ui
 * @param {Object} challenge challenge info
 */
export function getPrizePointsUI(challenge) {
  if (challenge.pointPrizes && challenge.pointPrizes.length > 0) {
    return (
      <Prize
        label="Points"
        prizes={challenge.pointPrizes}
        prizeUnitSymbol=""
        totalPrize={challenge.pointPrizes.reduce((acc, points) => acc + points, 0)}
      />
    );
  }
  return null;
}

/**
 * Get recommended technologies for challenge
 * @param {Object} challenge challenge info
 */
export function getRecommendedTechnology(challenge) {
  let recommendedTechnology = '';
  _.forEach(challenge.technologies, (technology) => {
    if (!recommendedTechnology && technology.toLowerCase() !== 'other') {
      recommendedTechnology = technology;
    }
  });
  return recommendedTechnology;
}

/**
 * Get display recommended challenge
 * @param {Object} challenge challenge info
 * @param {Object} recommendedChallenges all recommended challenges
 * @param {Object} auth authentication object
 */
export function getDisplayRecommendedChallenges(
  challenge,
  recommendedChallenges,
  auth,
) {
  const first = (array, n) => {
    if (array == null || n == null) {
      return array[0];
    }
    if (n < 0) {
      return [];
    }
    return array.slice(0, n);
  };

  const recommendedTechnology = getRecommendedTechnology(challenge);
  const displayRecommendedChallenges = recommendedChallenges[recommendedTechnology]
    ? recommendedChallenges[recommendedTechnology].challenges : [];
  const filterParams = getBuckets(null)[BUCKETS.OPEN_FOR_REGISTRATION].filter;
  const userHandle = _.get(auth.user, 'handle');
  const filter = Filter.getFilterFunction(filterParams);

  let results = _.filter(displayRecommendedChallenges, (c) => {
    let isValid = filter(c);
    if (isValid && userHandle) {
      isValid = !c.users[userHandle] && c.id !== challenge.id;
    }
    return isValid;
  });
  results = first(
    results,
    config.CHALLENGE_DETAILS_MAX_NUMBER_RECOMMENDED_CHALLENGES,
  );
  return results;
}

export default getEndDate;
