/**
 * This script is the same as how we
 * build and deploy reactor to CDN
 * for use in Sencha Fiddle.
 */

const Sencha  = window.Sencha || (window.Sencha = {});

import react    from 'react';
import reactDom from 'react-dom';

require('{SDK}/ext/modern/reactor/src/RendererCell');
require('{SDK}/ext/modern/reactor/src/Transition');

// need to defer this as reactor looks for some thing on the Ext JS
// namespace that loading a non-Ext build may not be there. This is
// executed in the generated app.js in fiddle/Base.js#buildAppJs
Sencha.reactor = () => {
    const reactor            = require('{REACTOR}/packages/reactor');
    const reactorBabelPlugin = require('{REACTOR}/packages/reactor-babel-plugin');

    Sencha.reactor = {
        react                         : react,
        'react-dom'                   : reactDom,
        '@extjs/reactor'              : reactor,
        '@extjs/reactor-babel-plugin' : reactorBabelPlugin
    };
};
