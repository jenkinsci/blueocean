import React, { Component, PropTypes } from 'react';
import { EmptyStateView, Table } from '@jenkins-cd/design-language';
import Markdown from 'react-remarkable';
import Branches from './Branches';
import { RunsRecord } from './records';
import {
    actions,
    currentBranches as branchSelector,
    createSelector,
    connect,
} from '../redux';
import PageLoading from './PageLoading';
import { pipelineBranchesUnsupported } from './PipelinePage';

const { object, array, func, string, any } = PropTypes;

const EmptyState = ({ repoName, t }) => (
    <main>
        <EmptyStateView iconName="branch">
            <Markdown>
                {t('EmptyState.branches', { 0: repoName })}
            </Markdown>
            <button>{t('Enable')}</button>
        </EmptyStateView>
    </main>
);

const NotSupported = ({ t }) => (
    <main>
        <EmptyStateView>
            <Markdown>
                {t('EmptyState.branches.notSupported')}
            </Markdown>
        </EmptyStateView>
    </main>
);

EmptyState.propTypes = {
    repoName: string,
    t: func,
};

NotSupported.propTypes = {
    t: func,
};

export class MultiBranch extends Component {
    componentWillMount() {
        if (this.context.pipeline && this.context.params && !pipelineBranchesUnsupported(this.context.pipeline)) {
            this.props.fetchBranches({
                organizationName: this.context.params.organization,
                pipelineName: this.context.params.pipeline,
            });
        }
    }

    componentWillUnmount() {
        this.props.clearBranchData();
    }


    render() {
        const { branches, t } = this.props;

        if (!branches || (!branches.$pending && pipelineBranchesUnsupported(this.context.pipeline))) {
            return (<NotSupported t={t} />);
        }

        if (branches.$failed) {
            return <div>ERROR: {branches.$failed}</div>;
        }

        if (!branches.$pending && !branches.length) {
            return (<EmptyState t={t} repoName={this.context.params.pipeline} />);
        }

        const headers = [
            t('Health'),
            t('Status'),
            { label: t('Branch'), className: 'branch' },
            { label: t('Last.commit'), className: 'lastcommit' },
            { label: t('Latest.message'), className: 'message' },
            { label: t('Completed'), className: 'completed' },
            { label: '', className: 'run' },
        ];

        return (
            <main>
                <article>
                    {branches.$pending && <PageLoading />}
                    <Table className="multibranch-table fixed"
                      headers={headers}
                    >
                        {branches.length > 0 && branches.map((run, index) => {
                            const result = new RunsRecord(run);
                            return (<Branches
                              key={index}
                              data={result}
                            />);
                        })
                        }
                    </Table>
                    {branches.$pager &&
                        <button disabled={branches.$pending || !branches.$pager.hasMore} className="btn-show-more btn-secondary" onClick={() => branches.$pager.fetchMore()}>
                             {branches.$pending ? t('Loading') : t('More')}
                        </button>
                    }
                </article>
                {this.props.children}
            </main>
        );
    }
}

MultiBranch.contextTypes = {
    config: object.isRequired,
    params: object.isRequired,
    pipeline: object,
};

MultiBranch.propTypes = {
    branches: array,
    fetchBranches: func,
    clearBranchData: func,
    children: any,
    t: func,
};

const selectors = createSelector([branchSelector], (branches) => ({ branches }));

export default connect(selectors, actions)(MultiBranch);
