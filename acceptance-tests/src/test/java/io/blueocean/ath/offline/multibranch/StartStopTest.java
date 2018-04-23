package io.blueocean.ath.offline.multibranch;

import com.google.common.io.Files;
import com.google.common.io.Resources;
import io.blueocean.ath.ATHJUnitRunner;
import io.blueocean.ath.BlueOceanAcceptanceTest;
import io.blueocean.ath.GitRepositoryRule;
import io.blueocean.ath.factory.MultiBranchPipelineFactory;
import io.blueocean.ath.model.MultiBranchPipeline;
import io.blueocean.ath.pages.blue.ActivityPage;
import io.blueocean.ath.pages.blue.BranchPage;
import io.blueocean.ath.sse.SSEClientRule;
import org.apache.log4j.Logger;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.junit.JGitTestUtil;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.WebElement;

import javax.inject.Inject;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;

@RunWith(ATHJUnitRunner.class)

public class StartStopTest extends BlueOceanAcceptanceTest {
    private Logger logger = Logger.getLogger(CommitMessagesTest.class);

    @Rule
    @Inject
    public GitRepositoryRule git;

    @Rule
    @Inject
    public SSEClientRule sseClientRule;

    @Inject
    MultiBranchPipelineFactory mbpFactory;

    /**
     * This tests the commit messages are being picked up from git and displayed on the run in activity.
     */
    @Test
    public void startStopTest() throws IOException, GitAPIException {
        final String pipelineName = "StartStopTest_startStopTest";
        final String firstBranch = "master";
        final String secondBranch = "second-branch";

        URL navTestJenkinsfile = Resources.getResource(ParallelNavigationTest.class, "StartStopTest/Jenkinsfile");
        Files.copy(new File(navTestJenkinsfile.getFile()), new File(git.gitDirectory, "Jenkinsfile"));
        git.addAll();
        git.commit("Initial commit of Jenkinsfile");
        logger.info("Committed Jenkinsfile");

        MultiBranchPipeline stopStartPipeline = mbpFactory.pipeline(pipelineName).createPipeline(git);
        sseClientRule.untilEvents(stopStartPipeline.buildsFinished);
        sseClientRule.clear();

        git.createBranch(secondBranch);
        JGitTestUtil.writeTrashFile(git.client.getRepository(), "some-new-filename", "Hello from startStopTest");
        git.addAll();
        git.commit("2nd commit going in now");
        logger.info("Committed a second time");

        // Fire a rescan to get the new branch to show up
        stopStartPipeline.rescanThisPipeline();
        sseClientRule.untilEvents(stopStartPipeline.buildsFinished);

        // This is where the browser actually goes to the UI
        // ActivityPage activityPage = stopStartPipeline.getActivityPage().open();
        BranchPage branchPage = stopStartPipeline.getBranchPage().open();
        logger.info("Should have two branches now");

        logger.info("OPEN BRANCH PAGE DOES THIS WORK");
        // BranchPage branchPage = stopStartPipeline.getBranchPage().open();
        branchPage.clickRunButton(firstBranch);
        branchPage.clickRunButton(secondBranch);
        // next we want to stop them.
        branchPage.clickStopButton(firstBranch);
        branchPage.clickStopButton(secondBranch);
        // sseClientRule.untilEvents(stopStartPipeline.buildsFinished);
        // This or activityPage.open.whatever?
        // branchPage.clickActivityTab();
        ActivityPage activityPage = stopStartPipeline.getActivityPage().open();
        // Now we need to verify that the builds were stopped. So need to add
        // methods to activityPage to do that. Maybe with an assert. Example
        // From elsewhere:
        // activityPage.assertIsDuration(cells.get(5).getText());
        // so maybe this?
        // activityPage.assertIsStoppedRun(firstBranch);
        logger.info("We did it.");
    }
}
