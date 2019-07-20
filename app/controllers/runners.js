const pm2 = require('pm2')
// const fs = require('fs')
const path = require('path')
// const model = require('../models/user')
const utils = require('../middleware/utils')
// const { matchedData } = require('express-validator/filter')
// const auth = require('../middleware/auth')

let PM2 = null

/*********************
 * Private functions *
 *********************/
const init = () => {
  pm2.connect(err => {
    if (err) {
      console.log('Err on pm2, restarting...')
      console.error(err)
      // process.exit(2)

      init()
    }

    PM2 = pm2
  })
}
init()

/**
 * Get Runners from PM2
 * @param {null} null
 */
const getRunnersFromPM2 = async () => {
  return new Promise((resolve, reject) => {
    // model.findById(id, '-_id -updatedAt -createdAt', (err, user) => {
    //   utils.itemNotFound(err, user, reject, 'NOT_FOUND')
    //   resolve(user)
    // })
    if (PM2) {
      PM2.list((err, runners) => {
        if (err) {
          reject('Runners not ready...')
        }

        // console.log('PM2 runners ', runners)
        resolve(
          runners.map(runner => ({
            id: runner.pm_id,
            name: runner.name,
            memory: runner.monit.memory,
            cpu: runner.monit.cpu,
            uptime: runner.pm2_env.pm_uptime,
            restarts: runner.pm2_env.restart_time,
            unstableRestarts: runner.pm2_env.unstable_restarts,
            status: runner.pm2_env.status
          }))
        )
      })
    } else {
      reject('Runners not ready...')
    }
  })
}

/**
 * Start Runner from PM2
 * @param {null} null
 */
const startRunner = async ({ name }) => {
  return new Promise((resolve, reject) => {
    // model.findById(id, '-_id -updatedAt -createdAt', (err, user) => {
    //   utils.itemNotFound(err, user, reject, 'NOT_FOUND')
    //   resolve(user)
    // })
    if (PM2) {
      PM2.start(
        {
          script: path.resolve('../', '../', 'testTask.js'),
          name,
          exec_mode: 'cluster', // eslint-disable-line
          instances: 2,
          max_memory_restart: '16M' // eslint-disable-line
        },
        (err, runner) => {
          if (err) {
            reject('Runners not ready...')
          }

          resolve({
            id: runner.pm_id,
            name: runner.name,
            memory: runner.monit.memory,
            cpu: runner.monit.cpu,
            uptime: runner.pm2_env.pm_uptime,
            unstableRestarts: runner.pm2_env.pm_unstable_restarts,
            status: runner.pm2_env.status
          })
        }
      )
    } else {
      reject('Runners not ready...')
    }
  })
}

/********************
 * Public functions *
 ********************/

/**
 * Get runners list function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getProcessRunners = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    res.status(200).json(await getRunnersFromPM2())
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Start runner function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.addProcessRunner = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    res.status(200).json(await startRunner({ name: req.name }))
  } catch (error) {
    utils.handleError(res, error)
  }
}
