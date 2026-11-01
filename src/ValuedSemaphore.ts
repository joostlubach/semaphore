import DisposableTimer from 'disposable-timer'

import {
  SemaphoreReject,
  SemaphoreResolve,
  SemaphoreResult,
  SemaphoreStatus,
  ValuedSemaphoreOptions,
} from './types'

export default class ValuedSemaphore<T = never> implements PromiseLike<T> {

  constructor(
    private readonly options: ValuedSemaphoreOptions<T> = {},
  ) {
    if (this.options.signalledWith != null) {
      this.result = {
        status: 'signalled',
        value:  this.options.signalledWith,
      }
    } else {
      this.reset()
    }
  }

  private timer = new DisposableTimer()

  public dispose() {
    this.timer.dispose()
  }

  private result?:  SemaphoreResult<T>
  private resolves: SemaphoreResolve<T>[] = []
  private rejects:  SemaphoreReject[] = []

  private get status(): SemaphoreStatus {
    if (this.result == null) { return 'pending' }
    return this.result.status
  }

  public get isSignalled() {
    return this.status === 'signalled'
  }

  public reset = () => {
    this.result = undefined
    this.setTimeout()
  }

  public signal = (value: T) => {
    this.completeWith(SemaphoreResult.signalled(value))
  }

  public reject = (reason: any) => {
    this.completeWith(SemaphoreResult.error(reason))
  }

  private completeWith(result: SemaphoreResult<T>) {
    this.result = result

    if (result.status === 'signalled') {
      this.resolves.forEach(it => it(result.value))
    } else {
      this.rejects.forEach(it => it(result.reason))
    }
    this.resolves = []
    this.rejects = []

    this.clearTimeout()
    if (this.options.autoReset) {
      this.reset()
    }
  }

  // ------
  // Timeout

  private timeout: ReturnType<DisposableTimer['setTimeout']> = null

  private setTimeout() {
    const delay = this.options.timeout
    if (delay == null) { return }

    this.clearTimeout()
    this.timeout = this.timer.setTimeout(() => {
      this.completeWith(SemaphoreResult.timeout())
    }, delay)
  }

  private clearTimeout() {
    if (this.timeout == null) { return }
    this.timer.clearTimeout(this.timeout)
    this.timeout = null
  }

  // ------
  // Promise interface

  public then<
    TResult1 = T,
    TResult2 = never,
  >(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.toPromise().then(onfulfilled, onrejected)
  }

  private toPromise(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (this.result == null) {
        this.resolves.push(resolve)
        this.rejects.push(reject)
      } else if (this.result.status === 'signalled') {
        resolve(this.result.value)
      } else {
        reject(this.result.reason)
      }
    })
  }

}
