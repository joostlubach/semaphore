import DisposableTimer from 'disposable-timer'
import SemaphoreTimeout from './SemaphoreTimeout'
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
    this.resolveWith(SemaphoreResult.signalled(value))
  }

  private resolveWith(result: SemaphoreResult<T>) {
    this.result = result

    if (result.status === 'signalled') {
      this.resolves.forEach(it => it(result.value))
    } else {
      this.rejects.forEach(it => it(new SemaphoreTimeout()))
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

  private timeout: NodeJS.Timeout | null = null

  private setTimeout() {
    const delay = this.options.timeout
    if (delay == null) { return }

    this.clearTimeout()
    this.timer.setTimeout(() => {
      this.resolveWith(SemaphoreResult.timeout())
    }, delay)
  }

  private clearTimeout() {
    if (this.timeout == null) { return }
    this.timer.clearTimeout(this.timeout)
    this.timeout = null
  }

  // ------
  // Promise interface

  public async then<
    TResult1 = T,
    TResult2 = any,
  >(
    onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null,
  ): Promise<TResult1 | TResult2> {
    if (this.result == null) {
      return new Promise<TResult1 | TResult2>((resolve, reject) => {
        if (onfulfilled != null) {
          this.resolves.push(async result => {
            try {
              const value = await onfulfilled(result)
              resolve(value)
            } catch (reason) {
              reject(reason)
            }
          })
        }

        if (onrejected != null) {
          this.rejects.push(async reason => {
            try {
              const value = await onrejected(reason)
              resolve(value)
            } catch (reason) {
              reject(reason)
            }
          })
        }
      })
    } else if (this.result.status === 'signalled' && onfulfilled != null) {
      try {
        const next = await onfulfilled(this.result.value)
        return Promise.resolve<TResult1>(next)
      } catch (reason) {
        return Promise.reject(reason)
      }
    } else if (this.result.status === 'timeout' && onrejected != null) {
      try {
        const next = await onrejected(this.result.reason)
        return Promise.resolve<TResult2>(next)
      } catch (reason) {
        return Promise.reject(reason)
      }
    } else {
      return new Promise<TResult1 | TResult2>(() => undefined) // Never gonna happen.
    }
  }

}
