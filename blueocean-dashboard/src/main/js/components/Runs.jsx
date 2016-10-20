import React, { Component, PropTypes } from 'react';
import {
    CommitHash, ReadableDate, LiveStatusIndicator, TimeDuration,
}
    from '@jenkins-cd/design-language';
import { ReplayButton, RunButton, i18n } from '@jenkins-cd/blueocean-core-js';

import { MULTIBRANCH_PIPELINE, SIMPLE_PIPELINE } from '../Capabilities';

import Extensions from '@jenkins-cd/js-extensions';
import moment from 'moment';
import { buildRunDetailsUrl } from '../util/UrlUtils';
import IfCapability from './IfCapability';

const t = (key) => i18n.t(key, { ns: 'jenkins.plugins.blueocean.dashboard.Messages' });

/*
 http://localhost:8080/jenkins/blue/rest/organizations/jenkins/pipelines/PR-demo/runs
 */
export default class Runs extends Component {
    constructor(props) {
        super(props);
        this.state = { isVisible: false };
    }
    render() {
        // early out
        if (!this.props.result || !this.context.pipeline) {
            return null;
        }
        const {
            context: {
                router,
                location,
                pipeline: {
                    _class: pipelineClass,
                    fullName,
                    organization,
                },
            },
            props: {
                result: {
                    durationInMillis,
                    estimatedDurationInMillis,
                    pipeline,
                    id,
                    result,
                    state,
                    startTime,
                    endTime,
                    commitId,
                },
                changeset,
            },
        } = this;

        const resultRun = result === 'UNKNOWN' ? state : result;
        const running = resultRun === 'RUNNING';
        const durationMillis = !running ?
            durationInMillis :
            moment().diff(moment(startTime));

        const open = () => {
            const pipelineName = decodeURIComponent(pipeline);
            location.pathname = buildRunDetailsUrl(organization, fullName, pipelineName, id, 'pipeline');
            router.push(location);
        };

        const openRunDetails = (newUrl) => {
            location.pathname = newUrl;
            router.push(location);
        };
        return (<tr key={id} onClick={open} id={`${pipeline}-${id}`} >
            <td>
                <LiveStatusIndicator result={resultRun} startTime={startTime}
                  estimatedDuration={estimatedDurationInMillis}
                />
            </td>
            <td>{id}</td>
            <td><CommitHash commitId={commitId} /></td>
            <IfCapability className={pipelineClass} capability={MULTIBRANCH_PIPELINE} >
                <td>{decodeURIComponent(pipeline)}</td>
            </IfCapability>
            <td>{changeset && changeset.msg || '-'}</td>
            <td>
                <TimeDuration
                  millis={durationMillis}
                  liveUpdate={running}
                  locale={i18n.language}
                  liveFormat={t('Date.duration.format')}
                  hintFormat={t('Date.duration.hint.format')}
                />
            </td>
            <td>
                <ReadableDate
                  date={endTime}
                  liveUpdate
                  locale={i18n.language}
                  shortFormat={t('Date.readable.short')}
                  longFormat={t('Date.readable.long')}
                />
            </td>
            <td>
                <Extensions.Renderer extensionPoint="jenkins.pipeline.activity.list.action" {...t} />
                <RunButton className="icon-button" runnable={this.props.pipeline} latestRun={this.props.run} buttonType="stop-only" />
                { /* TODO: check can probably removed and folded into ReplayButton once JENKINS-37519 is done */ }
                <IfCapability className={pipelineClass} capability={[MULTIBRANCH_PIPELINE, SIMPLE_PIPELINE]}>
                    <ReplayButton className="icon-button" runnable={this.props.pipeline} latestRun={this.props.run} onNavigation={openRunDetails} />
                </IfCapability>
            </td>
        </tr>);
    }
}

const { object, string, any, func } = PropTypes;

Runs.propTypes = {
    run: object,
    pipeline: object,
    result: any.isRequired, // FIXME: create a shape
    data: string,
    changeset: object.isRequired,
    t: func,
};
Runs.contextTypes = {
    pipeline: object,
    router: object.isRequired, // From react-router
    location: object,
};
