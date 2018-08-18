const environments = {}

environments.staging = {
  httpPort: 1066,
  httpsPort: 1215,
  envName: 'staging'
}

environments.production = {
  httpPort: 80,
  httpsPort: 443,
  envName: 'production'
}

const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : ''

const exportEnv = typeof environments[currentEnv] === 'object' ? environments[currentEnv] : environments.staging

module.exports = exportEnv
