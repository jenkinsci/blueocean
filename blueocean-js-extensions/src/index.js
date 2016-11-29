var Extensions = require('./Extensions');

module.exports = {
    extensionRegistry: Extensions.default,
    ExtensionPoint: Extensions.ExtensionPoint,
    Extension: Extensions.Extension,
    ExtensionList: Extensions.ExtensionList,
    InjectExtension: Extensions.InjectExtension,
    InjectExtensions: Extensions.InjectExtensions,
    Priority: Extensions.Priority,
    Service: Extensions.Service,
    extensionPoints: Extensions.extensionPoints,
    extensions: Extensions.extensions,
};

var extensionRenderer;
Object.defineProperty(module.exports, 'ExtensionRenderer', {
    get: function() {
        if (!extensionRenderer) {
            var renderCreator = require('./ExtensionRendererJS');
            extensionRenderer = renderCreator(Extensions.extensions.React, Extensions.extensions.ReactDOM, Extensions.extensions);
        }
        return extensionRenderer;
    }
});
