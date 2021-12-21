export interface Options {
  signalled?: boolean
  autoReset?: boolean
  timeout?:   number
}

export default class Semaphore {

  constructor(
    private readonly options: Options = {},
  ) {
    if (this.options.signalled) {
      this.status = 'signalled'
    } else {
      this.status = 'pending'
      this.reset()
    }
  }

  private status: SemaphoreStatus
  private resolves: SemaphoreResolve[] = []

  public reset() {
    this.status = 'pending'
    this.setTimeout()
  }

  public signal() {
    this.resolveWith('ok')
  }

  private resolveWith(result: 'ok' | 'timeout') {
    this.status   = result === 'ok' ? 'signalled' : 'timeout'

    this.resolves.forEach(it => it(result))
    this.resolves = []

    this.clearTimeout()
    if (this.options.autoReset) {
      this.reset()
    }
  }

  //------
  // Timeout

  private timeout: NodeJS.Timeout | null = null

  private setTimeout() {
    const delay = this.options.timeout
    if (delay == null) { return }

    this.clearTimeout()
    this.timeout = setTimeout(() => {
      this.resolveWith('timeout')
    }, delay)
  }

  private clearTimeout() {
    if (this.timeout == null) { return }
    clearTimeout(this.timeout)
    this.timeout = null
  }

  //------
  // Promise interface

  public then(resolve: SemaphoreResolve) {
    if (this.status !== 'pending') {
      resolve(this.status === 'signalled' ? 'ok' : 'timeout')
    } else {
      this.resolves.push(resolve)
    }
  }

}

export type SemaphoreStatus = 'pending' | 'signalled' | 'timeout'
export type SemaphoreResolve = (result: 'ok' | 'timeout') => any
export class SemaphoreTimeout extends Error {}