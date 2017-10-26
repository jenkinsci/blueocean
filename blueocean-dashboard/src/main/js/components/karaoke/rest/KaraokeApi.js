import { capabilityAugmenter, Fetch, FetchFunctions, logging } from '@jenkins-cd/blueocean-core-js';
import debounce from 'lodash.debounce';
import parse_link_header from 'parse-link-header';
import { generateDetailUrl } from '../urls/detailUrl';
import { getNodesInformation } from '../../../util/logDisplayHelper';

const logger = logging.logger('io.jenkins.blueocean.dashboard.karaoke.RestApi');

/**
 * Generic options needed for all requests
 * @type {{credentials: string, method: string}}
 */
const fetchOptionsCommon = {
    credentials: 'include',
    method: 'GET',
};
/**
 * Helper method to clone common fetchOptions
 * @returns {*} fetchOptions
 */
function prepareOptions() {
    const fetchOptions = Object.assign({}, fetchOptionsCommon);
    return fetchOptions;
}

function parseMoreDataHeader(response) {
    let newStart = null;
    /*
     * If X-More-Data is true, then client should repeat the request after some delay.
     * In the repeated request it should use X-TEXT-SIZE header value with start query parameter.
     */
    if (response.headers.get('X-More-Data')) {
        /*
         * X-TEXT-SIZE is the byte offset of the raw log file client should use in the next request
         * as value of start query parameter.
         */
        newStart = response.headers.get('X-TEXT-SIZE');
    }
    response.newStart = newStart;  // eslint-disable-line
    return response;
}

function parseNewStart(response) {
    // By default only last 150 KB log data is returned in the response.
    const maxLength = 150000;
    const contentLength = Number(response.headers.get('X-Text-Size'));
    // set flag that there are more logs then we deliver
    const hasMore = contentLength > maxLength;
    response.hasMore = hasMore; // eslint-disable-line
    return response;
}

function recursivelyFetchNodes(href, fetchOptions) {
  return Fetch
        .fetch(href, { fetchOptions })
        .then(result => {
            const links = parse_link_header(result.headers.get('Link'));
            return FetchFunctions
                .parseJSON(result)
                .then(rawNodes => {
                    if (!links.next || rawNodes.length < 1)
                        return { rawNodes: rawNodes };

                    logger.debug("Fetching next node batch from", links.next.url);
                    return new Promise(resolve => {
                        recursivelyFetchNodes(links.next.url, fetchOptions).then(nextBatch => {
                            resolve({ rawNodes: rawNodes.concat(nextBatch.rawNodes) });
                        });
                    });
                });
        });
}

export class KaraokeApi {

    /**
     * Get a run with runId and augment the capabilities
     * @param {object} pipeline Pipeline that this pager belongs to.
     * @param {string} branch the name of the branch we are requesting
     * @param {string} runId Run that this pager belongs to.
     * @returns {*} Promise
     */
    getRunWithId(pipeline, branch, runId) {
        const fetchOptions = prepareOptions();
        const href = generateDetailUrl(pipeline, branch, runId);
        logger.debug('Fetching href', href);
        return Fetch.fetchJSON(href, { fetchOptions });
    }

    /**
     *
     * @param {string} href The url we want to fetch
     * @returns {*} Promise
     */
    getGeneralLog(href, { start }) {
        return new Promise((resolve) => {
            debounce(() => {
                const fetchOptions = prepareOptions();
                const finalHref = start ? `${href}?start=${start}` : href;
                logger.debug('Fetching with txt enabled parsing the following href', finalHref, 'start from', start);
                if (!href || href === undefined) {
                    // leave a logger warning and abort
                    logger.warn('could not fetch with empty href');
                    resolve();
                }
                resolve(Fetch.fetch(finalHref, { fetchOptions })
                    .then(parseMoreDataHeader)
                    .then(parseNewStart));
            }, 200)();
        });
    }

    getNodes(href) {
        // creating a new promise to be able to debounce the fetching
        return new Promise((resolve) => {
            debounce(() => {
                const fetchOptions = prepareOptions();
                logger.debug('Fetching with json enabled parsing the following href', href);
                if (!href || href === undefined) {
                    // leave a logger warning and abort
                    logger.warn('could not fetch with empty href');
                    resolve();
                }
                resolve(Fetch.fetchJSON(href, { fetchOptions })
                    .then(getNodesInformation));
            }, 200)();
        });
    }

    getAllNodes(href) {
      // creating a new promise to be able to debounce the fetching
      return new Promise((resolve) => {
          debounce(() => {
              const fetchOptions = prepareOptions();
              logger.debug('Fetching with json enabled parsing the following href', href);
              if (!href || href === undefined) {
                  // leave a logger warning and abort
                  logger.warn('could not fetch with empty href');
                  resolve();
              }
              resolve(recursivelyFetchNodes(href, { fetchOptions })
                  .then(data => capabilityAugmenter.augmentCapabilities(data.rawNodes))
                  .then(getNodesInformation)
              );
          }, 200)();
      });
    }

    getSteps(href) {
        return this.getNodes(href);
    }
}
