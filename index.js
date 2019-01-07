const Config = require('ssb-config/inject')
const ssbKeys = require('ssb-keys')
const path = require('path')
const merge = require('lodash/merge')
const fs = require('fs')

const appName = process.env.ssb_appname || 'ssb'
const opts = appName === 'ssb' ? null : null

function Connections () {
  const connections = (process.platform === 'win32')
    ? undefined // this seems wrong?
    : { incoming: { unix: [{ 'scope': 'local', 'transform': 'noauth' }] } }

  return connections ? { connections } : {}
}

function Remote (config) {
  const pubkey = config.keys.id.slice(1).replace(`.${config.keys.curve}`, '')
  const remote = (process.platform === 'win32')
    ? undefined // `net:127.0.0.1:${config.port}~shs:${pubkey}` // currently broken
    : `unix:${path.join(config.path, 'socket')}:~noauth:${pubkey}`

  return remote ? { remote } : {}
}

let config = Config(appName, opts)
config.keys = ssbKeys.loadOrCreateSync(path.join(config.path, 'secret'))

config = merge(
  config,
  Connections(),
  Remote(config)
)

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
