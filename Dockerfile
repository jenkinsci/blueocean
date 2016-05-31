FROM jenkinsci/jenkins:latest

COPY blueocean-commons/target/blueocean-commons.hpi /usr/share/jenkins/ref/plugins/
COPY blueocean-dashboard/target/blueocean-dashboard.hpi /usr/share/jenkins/ref/plugins/
COPY blueocean-plugin/target/blueocean-plugin.hpi /usr/share/jenkins/ref/plugins/
COPY blueocean-rest/target/blueocean-rest.hpi /usr/share/jenkins/ref/plugins/
COPY blueocean-web/target/blueocean-web.hpi /usr/share/jenkins/ref/plugins/

USER root

RUN cd /usr/share/jenkins/ref/plugins/; \
	install-plugins.sh blueocean-commons \
                       blueocean-dashboard \
                       blueocean-plugin \
                       blueocean-rest \
                       blueocean-web \
                       workflow-aggregator \
                       docker-workflow \
                       pipeline-utility-steps	\
                       pipeline-stage-view \
                       git \
                       antisamy-markup-formatter \
                       matrix-auth # for security, you know

# See JENKINS-34035 - disable upgrade wizard
RUN echo -n 2.0 > /usr/share/jenkins/ref/jenkins.install.UpgradeWizard.state  && \
    echo -n 2.0 > /usr/share/jenkins/ref/jenkins.install.InstallUtil.lastExecVersion

USER jenkins
