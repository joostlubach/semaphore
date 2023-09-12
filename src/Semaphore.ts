import { SemaphoreOptions, SemaphoreResult } from './types'
import ValuedSemaphore from './ValuedSemaphore'

export default class Semaphore implements PromiseLike<SemaphoreResult<never>> {

  constructor(options: SemaphoreOptions<never> = {}) {
    this.semaphore = new ValuedSemaphore(options)
  }

  private semaphore: ValuedSemaphore<never>

  public get isSignalled() {
    return this.semaphore.isSignalled
  }

  public reset = () => {
    this.semaphore.reset()
  }

  public signal = () => {
    this.semaphore.signal(undefined as never)
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