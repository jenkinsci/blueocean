import React, { PropTypes } from 'react';

import GithubCredentialInput from './github/GithubCredentialInput';


/**
 * Provides UI and backend integration for acquiring a credential.
 * type: 'github', 'github-enterprise'
 * onStatus: function invoked with 'promptLoading', 'promptReady'
 * onComplete: function invoked with credential and 'autoSelected', 'userSelected'
 */
class CredentialPicker extends React.Component {

    render() {
        const { type, onStatus, onComplete } = this.props;
        let typedPicker = null;

        if (type === 'github' || type === 'github-enterprise') {
            const { scmId, apiUrl } = this.props.githubConfig;

            typedPicker = (
                <GithubCredentialInput
                    scmId={scmId}
                    apiUrl={apiUrl}
                />
            );
        }

        return React.cloneElement(typedPicker, { onStatus, onComplete });
    }
}

CredentialPicker.propTypes = {
    type: PropTypes.string,
    onStatus: PropTypes.func,
    onComplete: PropTypes.func,
    githubConfig: PropTypes.shape({
        scmId: PropTypes.string,
        apiUrl: PropTypes.string,
    }),
};

export default CredentialPicker;
