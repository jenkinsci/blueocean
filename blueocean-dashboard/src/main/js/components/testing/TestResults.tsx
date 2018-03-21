import * as React from 'react';
import { observer } from 'mobx-react';
import { TestSummary } from './TestSummary';
import TestSection from './TestSection';

/* eslint-disable max-len */

interface Props {
    pipeline: any,
    run: any,
    t: (key: string) => string,
    locale: string,
    testService: any
}

@observer
export default class TestResults extends React.Component<Props> {
    private regressionsPager: any;
    private existingFailedPager: any;
    private skippedPager: any;
    private fixedPager: any;
    private passedPager: any;

    componentWillMount() {
        this._initPagers(this.props);
    }

    componentWillReceiveProps(nextProps: Props) {
        this._initPagers(nextProps);
    }

    _initPagers(props: Props) {
        const pipeline = props.pipeline;
        const run = props.run;
        this.regressionsPager = this.props.testService.newRegressionsPager(pipeline, run);
        this.existingFailedPager = this.props.testService.newExistingFailedPager(pipeline, run);
        this.skippedPager = this.props.testService.newSkippedPager(pipeline, run);
        this.fixedPager = this.props.testService.newFixedPager(pipeline, run);
        this.passedPager = this.props.testService.newPassedPager(pipeline, run);
    }

    render() {
        const { t: translation, locale, run } = this.props;
        return (
            <div>
                <TestSummary
                    translate={translation}
                    passing={run.testSummary.passed}
                    fixed={run.testSummary.fixed}
                    failuresNew={run.testSummary.regressions}
                    failuresExisting={run.testSummary.existingFailed}
                    skipped={run.testSummary.skipped}
                />
                <TestSection
                    titleKey="rundetail.tests.results.errors.new.count"
                    pager={this.regressionsPager}
                    extraClasses="new-failure-block"
                    locale={locale}
                    t={translation}
                    total={run.testSummary.regressions}
                    testService={this.props.testService}
                />
                <TestSection
                    titleKey="rundetail.tests.results.errors.existing.count"
                    pager={this.existingFailedPager}
                    extraClasses="existing-failure-block"
                    locale={locale}
                    t={translation}
                    total={run.testSummary.existingFailed}
                    testService={this.props.testService}
                />
                <TestSection
                    titleKey="rundetail.tests.results.fixed"
                    pager={this.fixedPager}
                    extraClasses="fixed-block"
                    locale={locale}
                    t={translation}
                    total={run.testSummary.fixed}
                    testService={this.props.testService}
                />
                <TestSection
                    titleKey="rundetail.tests.results.skipped.count"
                    pager={this.skippedPager}
                    extraClasses="skipped-block"
                    locale={locale}
                    t={translation}
                    total={run.testSummary.skipped}
                    testService={this.props.testService}
                />
                <TestSection
                    titleKey="rundetail.tests.results.passed.count"
                    pager={this.passedPager}
                    extraClasses=""
                    locale={locale}
                    t={translation}
                    total={run.testSummary.passed}
                    testService={this.props.testService}
                />
            </div>
        );
    }
}
