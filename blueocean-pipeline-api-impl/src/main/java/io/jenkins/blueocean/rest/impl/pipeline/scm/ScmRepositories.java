package io.jenkins.blueocean.rest.impl.pipeline.scm;

import io.jenkins.blueocean.rest.model.Resource;
import org.kohsuke.stapler.export.Exported;

/**
 * Represents collection of SCM repositories
 *
 * Implementation of it can include pagination information
 *
 * @author Vivek Pandey
 */
public abstract class ScmRepositories extends Resource {
    public static final String REPOSITORIES="repositories";

    @Exported(name=REPOSITORIES)
    public abstract Iterable<ScmRepository> getRepositories();
}
