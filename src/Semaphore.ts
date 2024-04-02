import ValuedSemaphore from './ValuedSemaphore'
import { SemaphoreOptions, SemaphoreResult, ValuedSemaphoreOptions } from './types'

export default class Semaphore implements PromiseLike<SemaphoreResult<never>> {

  constructor(options: SemaphoreOptions = {}) {
    const {signalled = false, ...rest} = options
    const valuedOptions: ValuedSemaphoreOptions<never> = rest
    if (signalled) {
      valuedOptions.signalledWith = {} as never
    }

    this.semaphore = new ValuedSemaphore(valuedOptions)
  }

  private semaphore: ValuedSemaphore<never>

  public dispose() {
    this.semaphore.dispose()
  }

  public get isSignalled() {
    return this.semaphore.isSignalled
  }

  public reset = () => {
    this.semaphore.reset()
  }

  public signal = () => {
    this.semaphore.signal(undefined as never)
  }

  public reject = (reason: any) => {
    this.semaphore.reject(reason)
  }

  public then<
    TResult1 = SemaphoreResult<never>,
    TResult2 = never,
  >(
    onfulfilled?: ((value: SemaphoreResult<never>) => TResult1 | Promise<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null,
  ): Promise<TResult1 | TResult2> {
    return this.semaphore.then(onfulfilled, onrejected)
  }

}
