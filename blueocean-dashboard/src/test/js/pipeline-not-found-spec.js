import React from 'react';
import { Route } from 'react-router';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import { PipelinePage } from '../../main/js/components/PipelinePage.jsx';
import PageLoading from '../../main/js/components/PageLoading.jsx';
import NotFound from '../../main/js/components/NotFound.jsx';

const params = {}
const context = {
  pipelineService: {
    fetchPipeline() {
      return {
        data: null,
        error: null,
      }
    }
  }
};

const contextFailed = {
  pipelineService: {
    fetchPipeline() {
      return {
        data: null,
        error: true,
      }
    }
  }
};
describe("PipelinePage", () => {
  const pipeline = {
    'displayName': 'beers',
    'name': 'beers',
    'fullName': 'beers',
    'organization': 'jenkins',
    'weatherScore': 0
  };

  const ctx = {
    router: {},
    location: {},
    config: {
      organization: 'jenkins',
      pipeline: 'asdf',
      getAppURLBase: () => '/jenkins/blue',
    }
  };

  
  it("shows 404 for failure", () => {
    let wrapper;
    wrapper = shallow(<PipelinePage params={params} setTitle={()=>{}}/>, { context });
    expect(wrapper.find('PageLoading')).to.have.length(1);

    wrapper = shallow(<PipelinePage params={params} setTitle={()=>{}} />, { context: contextFailed });
    expect(wrapper.find('PageLoading')).to.have.length(0);
    expect(wrapper.html()).to.contain('404')
  });
});
