export interface Options {
  signalled?: boolean
  autoReset?: boolean
  timeout?:   number
}

export default class Semaphore implements PromiseLike<SemaphoreResult> {

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

  private resolveWith(result: SemaphoreResult) {
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

  public then<
    TResult1 = SemaphoreResult,
    TResult2 = never,
  >(
    onfulfilled?: ((value: SemaphoreResult) => TResult1 | Promise<TResult1>) | undefined | null,
  ): Promise<TResult1 | TResult2> {
    if (this.status !== 'pending') {
      const result: SemaphoreResult = this.status === 'signalled' ? 'ok' : 'timeout'
      onfulfilled?.(result)
      return Promise.resolve<TResult1>(result as any) // Weirdness in TS
    } else {
      return new Promise<TResult1>(resolve => {
        this.resolves.push(resolve as any) // Weirdness in TS
        if (onfulfilled != null) {
          this.resolves.push(onfulfilled)
        }
      })
    }
  }

}

export type SemaphoreStatus  = 'pending' | 'signalled' | 'timeout'
export type SemaphoreResolve = (result: SemaphoreResult) => any
export type SemaphoreResult  = 'ok' | 'timeout'
export class SemaphoreTimeout extends Error {}