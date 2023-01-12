import SemaphoreTimeout from './SemaphoreTimeout'

export interface SemaphoreOptions<T> {
  resolved?:  T
  autoReset?: boolean
  timeout?:   number
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