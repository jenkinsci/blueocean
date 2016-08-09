import React from 'react';
import Fullscreen from './Fullscreen';
import { Progress } from '@jenkins-cd/design-language';

/**
 * Simple component to render a fullscreen loading animation
 */
export default class PageLoading extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            percentage: undefined,
            running: false,
        };
    }
    
    componentWillMount() {
        if (this.props.duration) {
            this.state.percentage = 0;
            const updateSpeed = 10;
            let total = 0;
            this.update = () => {
                if (this.running) {
                    if (total >= 1) {
                        total = 1;
                        this.setState({ percentage: total * 100, running: false });
                    } else {
                        total += (updateSpeed / this.props.duration);
                        if (this.running) {
                            this.setState({ percentage: total * 100 });
                        }
                        this.updateProcess = setTimeout(this.update, updateSpeed);
                    }
                }
            };
            this.running = true;
            this.update();
        }
    }
    
    componentWillUnmount() {
        this.running = false;
        clearTimeout(this.updateProcess);
    }
    
    render() {
        return (
            <Fullscreen className="page-loading">
                <Progress percentage={this.state.percentage} />
            </Fullscreen>
        );
    }
}

PageLoading.propTypes = {
    duration: React.PropTypes.number,
};
