package io.blueocean.ath.offline.pipeline;

import com.google.inject.Inject;
import io.blueocean.ath.ATHJUnitRunner;
import io.blueocean.ath.BlueOceanAcceptanceTest;
import io.blueocean.ath.WebDriverMixin;
import io.blueocean.ath.factory.ClassicPipelineFactory;
import io.blueocean.ath.factory.FreestyleJobFactory;
import io.blueocean.ath.model.ClassicPipeline;
import io.blueocean.ath.sse.SSEClientRule;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestName;
import org.junit.runner.RunWith;

@RunWith(ATHJUnitRunner.class)
public class DownstreamLinkTest extends BlueOceanAcceptanceTest implements WebDriverMixin {

    @Inject
    ClassicPipelineFactory pipelineFactory;

    @Inject
    FreestyleJobFactory freestyleJobFactory;

    @Inject
    @Rule
    public SSEClientRule sseClient;

    @Rule
    public TestName testName = new TestName();

    @Test
    public void downstreamJobLinkAppearsInRunResult() throws Exception {
        ClassicPipeline upstreamJob = pipelineFactory.pipeline(testName.getMethodName() + "-upstream").createPipeline(getJobScript("upstream"));
        freestyleJobFactory.pipeline(testName.getMethodName() + "-downstream").create("echo blah");

        upstreamJob.build();
        sseClient.untilEvents(upstreamJob.buildsFinished);
        sseClient.clear();

        upstreamJob.getRunDetailsPipelinePage().open(1);

        find("//*[contains(text(),'Triggered Builds')]").isVisible(); // Heading for table of builds
        find("//*[contains(text(),'downstreamJob')]").isVisible(); // row pointing to downstream build
    }

    @Test
    public void sequentialStages() throws Exception {

        ClassicPipeline upstreamJob = pipelineFactory.pipeline(testName.getMethodName() + "-upstream").createPipeline(getJobScript("upstream"));
        freestyleJobFactory.pipeline(testName.getMethodName() + "-downstream").create("echo blah");

        upstreamJob.build();
        upstreamJob.build();
        upstreamJob.build();
        sseClient.untilEvents(upstreamJob.buildsFinished);
        sseClient.clear();

        for (int i = 1 ; i <= 3 ; i++) {
            upstreamJob.getRunDetailsPipelinePage().open(i);
            find("//*[contains(text(),'Triggered Builds')]").isVisible(); // Heading for table of builds
            find("//*[contains(text(),'downstreamJob')]").isVisible(); // row pointing to downstream build
        }
    }

    private String getJobScript(String name) throws IOException {
        String pipeline = IOUtils.toString( getClass().getResource(DownstreamLinkTest.class.getSimpleName() + "/" + testName.getMethodName() + "." + name + ".groovy"),
                                 StandardCharsets.UTF_8);
        return StringUtils.replace(pipeline, "${NAME}", testName.getMethodName());
    }
}
