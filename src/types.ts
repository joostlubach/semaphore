import SemaphoreTimeout from './SemaphoreTimeout'

interface CommonSemaphoreOptions {
  autoReset?: boolean
  timeout?:   number
}

export interface SemaphoreOptions extends CommonSemaphoreOptions {
  signalled?: boolean
}

export interface ValuedSemaphoreOptions<T> extends CommonSemaphoreOptions {
  signalledWith?:  T
}

export type SemaphoreStatus  = 'pending' | 'signalled' | 'timeout'

export type SemaphoreResolve<T> = (result: T) => any
export type SemaphoreReject     = (reason: SemaphoreTimeout) => any

export type SemaphoreResult<T> =
  | {status: 'signalled', value: T}
  | {status: 'timeout', reason: SemaphoreTimeout}

export const SemaphoreResult: {
  signalled: <T>(value: T) => SemaphoreResult<T>
  timeout:   () => SemaphoreResult<never>
} = {
  signalled: <T>(value: T) => ({status: 'signalled', value}),
  timeout:   () => ({status: 'timeout', reason: new SemaphoreTimeout()}),
}