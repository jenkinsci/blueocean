package io.jenkins.blueocean.rest.impl.pipeline;

import com.google.common.base.Charsets;
import com.google.common.io.Resources;
import hudson.model.Run;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import jenkins.plugins.git.GitSampleRepoRule;
import org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition;
import org.jenkinsci.plugins.workflow.job.WorkflowJob;
import org.junit.Rule;
import org.junit.Test;
import org.jvnet.hudson.test.Issue;

import static org.junit.Assert.assertTrue;

public class PipelineImplTest extends PipelineBaseTest {
    
    @Rule
    public GitSampleRepoRule sampleRepo = new GitSampleRepoRule();

    @Test
    @Issue("JENKINS-55497")
    public void testPipelineRunSummaryHasChangeSet() throws Exception {
        String jenkinsFile = Resources.toString(Resources.getResource(getClass(), "singleScm.jenkinsfile"), Charsets.UTF_8).replaceAll("%REPO%", sampleRepo.toString());

        WorkflowJob p = j.createProject(WorkflowJob.class, "project");
        p.setDefinition(new CpsFlowDefinition(jenkinsFile, true));
        p.save();

        sampleRepo.init();

        Run r = p.scheduleBuild2(0).waitForStart();
        j.waitForCompletion(r);

        Map<String, Object> runDetails = get("/organizations/jenkins/pipelines/" + p.getName() + "/runs/" + r.getId() + "/");
        List<Object> changeSet = (ArrayList) runDetails.get("changeSet");
        
        assertTrue(!changeSet.isEmpty());
    }
}