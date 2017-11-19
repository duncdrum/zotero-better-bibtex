import debug = require('./debug.ts')

import Queue = require('better-queue')
import MemoryStore = require('better-queue-memory')

function queueHandler(handler) {
  return (task, cb) => {
    handler(task).then(() => cb(null)).catch(err => {
      debug('Queue: task failed', task, err)
      cb(err)
    })

    return {
      cancel() { task.cancelled = true },
    }
  }
}

class PromiseQueue extends Queue {
  public push: (task: any) => void
  public pause: () => void
  public resume: () => void
  public cancel: (taskId) => void
  public on: (event: string, callback) => void

  public _stopped: boolean

  constructor(handler, options = null) {
    // tslint:disable-next-line:prefer-object-spread
    super(queueHandler(handler), Object.assign({
      store: new MemoryStore(),
      // https://bugs.chromium.org/p/v8/issues/detail?id=4718
      setImmediate: setTimeout.bind(null),
    }, options || {}))
  }
}

export = PromiseQueue
