const Config = require('ssb-config/inject')
const ssbKeys = require('ssb-keys')
const path = require('path')
const fs = require('fs')

const appName = process.env.ssb_appname || 'ssb'
const opts = appName === 'ssb' ? null : null

let config = Config(appName, opts)
config.keys = ssbKeys.loadOrCreateSync(path.join(config.path, 'secret'))

var createSbot = require('ssb-server')
  .use(require('ssb-server/plugins/master'))
  .use(require('ssb-server/plugins/gossip'))
  .use(require('ssb-server/plugins/replicate'))
  .use(require('ssb-server/plugins/invite'))
  .use(require('ssb-server/plugins/local'))
  .use(require('ssb-server/plugins/logging'))
  .use(require('ssb-server/plugins/unix-socket'))
  .use(require('ssb-server/plugins/no-auth'))

var sbot = createSbot(config)
var manifest = sbot.getManifest()
fs.writeFileSync(path.join(config.path, 'manifest.json'), JSON.stringify(manifest))
console.log('started')
