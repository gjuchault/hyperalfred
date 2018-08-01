const fs = require('graceful-fs')
const { promisify } = require('util')
const { resolve } = require('path')
const { homedir } = require('os')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const access = promisify(fs.access)

const commandFile = resolve(homedir(), '.hyper_plugins', 'hyperalfred.txt')

async function loadCommand() {
  try {
    const hasCommand = await access(commandFile, fs.constants.R_OK | fs.constants.W_OK)

    let command = await readFile(commandFile, 'utf8')

    command = command.trim()

    if (command.length === 0) {
      return null
    }

    return command
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('[hyperalfred] command file not existing, ignoring')
    }

    console.error(err)
  }
}

async function sendCommand(session, command) {
  console.log(`[hyperalfred] sending command ${command} to window`)

  if (session && typeof session.write === 'function') {
    session.write(command)
    session.write('\n')
  }
}

async function clearCommand() {
  try {
    await writeFile(commandFile, '')
  } catch (err) {
    console.error(err)
  }
}

async function main(session) {
  const command = await loadCommand()

  if (!command) {
    console.log('[hyperalfred] no command found')
    return
  }

  console.log(`[hyperalfred] command found : ${command}`)

  await sendCommand(session, command)
  await clearCommand()
}

exports.onWindow = win => {
  win.rpc.on('hyperalfred write command', async (sessionId) => {
    let session = win.sessions.get(sessionId)

    await main(session)
  })
}

exports.middleware = (store) => (next) => (action) => {
  if ('SESSION_ADD' === action.type || 'SESSION_SET_ACTIVE' === action.type) {
    const sessionId = action.uid

    setTimeout(() => rpc.emit('hyperalfred write command', sessionId), 200)

    next(action);
  } else {
    next(action);
  }
}