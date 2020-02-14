import module from 'module';
const require = module.createRequire(import.meta.url);
const config = require('../data/config.json');

export default config;
