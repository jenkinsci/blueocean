package io.jenkins.blueocean.rest.impl.pipeline;

import io.jenkins.blueocean.rest.hal.Link;
import io.jenkins.blueocean.rest.model.BlueActionProxy;
import io.jenkins.blueocean.rest.model.BluePipelineStep;
import io.jenkins.blueocean.rest.model.BlueRun;
import io.jenkins.blueocean.service.embedded.rest.LogResource;
import org.jenkinsci.plugins.workflow.actions.LogAction;
import org.jenkinsci.plugins.workflow.actions.TimingAction;
import org.jenkinsci.plugins.workflow.graph.FlowNode;

import java.util.Collection;
import java.util.Date;

/**
 * @author Vivek Pandey
 */
public class PipelineStepImpl extends BluePipelineStep {
    private final FlowNode node;
    private final PipelineNodeGraphBuilder.NodeRunStatus status;
    private final Long durationInMillis;
    private final Link self;

    public PipelineStepImpl(FlowNode node, PipelineNodeGraphBuilder graphBuilder, Link parent) {
        assert graphBuilder != null;
        assert node != null;
        this.self = parent.rel(node.getId());
        this.node = node;
        this.status = new PipelineNodeGraphBuilder.NodeRunStatus(node);
        this.durationInMillis = graphBuilder.getDurationInMillis(node);
    }

    @Override
    public String getId() {
        return node.getId();
    }

    @Override
    public String getDisplayName() {
        return node.getDisplayName();
    }

    @Override
    public BlueRun.BlueRunResult getResult() {
        return status.getResult();
    }

    @Override
    public BlueRun.BlueRunState getStateObj() {
        return status.getState();
    }

    @Override
    public Date getStartTime() {
        return new Date(TimingAction.getStartTime(node));
    }

    @Override
    public Long getDurationInMillis() {
        return durationInMillis;
    }

    @Override
    public Object getLog() {
        if(PipelineNodeUtil.isLoggable.apply(node)){
            return new LogResource(node.getAction(LogAction.class).getLogText());
        }
        return null;
    }

    @Override
    public Collection<BlueActionProxy> getActions() {

        return PipelineImpl.getActionProxies(node.getActions(), this);
    }

    @Override
    public Link getLink() {
        return self;
    }
}
