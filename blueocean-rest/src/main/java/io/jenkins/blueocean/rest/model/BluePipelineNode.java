package io.jenkins.blueocean.rest.model;

import io.jenkins.blueocean.rest.Navigable;
import io.jenkins.blueocean.rest.annotation.Capability;
import org.kohsuke.stapler.export.Exported;
import org.kohsuke.stapler.export.ExportedBean;

import java.util.List;

import static io.jenkins.blueocean.rest.model.BlueRun.TEST_SUMMARY;
import static io.jenkins.blueocean.rest.model.KnownCapabilities.BLUE_PIPELINE_NODE;

/**
 * Abstraction of Pipeline run node.
 *
 * This node is a node in Pipeline run and a vetext in DAG. Each sub-steps in this pipeline node is
 * represented as edges.
 *
 * e.g.
 * <pre>
 * stage 'build'
 * node{
 *   echo "Building..."
 * }
 * stage 'test'
 * parallel 'unit':{
 *   node{
 *     echo "Unit testing..."
 *   }
 * },'integration':{
 *   node{
 *     echo "Integration testing..."
 *   }
 * }
 * stage 'deploy'
 * node{
 * echo "Deploying"
 * }
 *</pre>
 *
 * Above pipeline script is modeled as:
 *
 *  <pre>
 * build : test
 * test : unit, integration
 * unit : deploy
 * integration: deploy
 * deploy
 *
 *
 *                   /---- unit ----------\
 * build---&gt;test---&gt;/                     \------&gt; deploy
 *                  \----- integration ---/
 *
 *</pre>
 * @author Vivek Pandey
 */
@Capability(BLUE_PIPELINE_NODE)
public abstract class BluePipelineNode extends BluePipelineStep{

    /**
     * If the node execution is blocked, its non null, explaining the cause. Otherwise its null.
     */
    @Exported(name = "causeOfBlockage")
    public abstract String getCauseOfBlockage();

    /**
     * @return Steps inside a Pipeline Stage or Parallel branch
     */
    @Navigable
    public abstract BluePipelineStepContainer getSteps();

    /**
     * Represents edge of pipeline flow graph
     */
    @ExportedBean
    public abstract static class Edge{
        /**
         * Id of {@link BluePipelineNode#getId()} destination node
         * @return node id
         */
        @Exported
        public abstract String getId();

        /**
         * Type of {@link BluePipelineNode#getType()} destination node
         * @return type
         */
        @Exported
        public abstract String getType();

    }

    /**
     * All the outgoing edges from this node
     * @return edges
     */
    @Exported(name = EDGES, inline = true)
    public abstract List<Edge> getEdges();

}
