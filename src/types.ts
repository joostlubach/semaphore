import SemaphoreTimeout from './SemaphoreTimeout'

interface CommonSemaphoreOptions {
  autoReset?: boolean
  timeout?:   number
}

export interface SemaphoreOptions extends CommonSemaphoreOptions {
  signalled?: boolean
}

export interface ValuedSemaphoreOptions<T> extends CommonSemaphoreOptions {
  signalledWith?: T
}

export type SemaphoreStatus = 'pending' | 'signalled' | 'error' | 'timeout'

export type SemaphoreResolve<T> = (result: T) => any
export type SemaphoreReject = (reason: SemaphoreTimeout) => any

export type SemaphoreResult<T> =
  | {status: 'signalled', value: T}
  | {status: 'error', reason: any}
  | {status: 'timeout', reason: SemaphoreTimeout}

export const SemaphoreResult: {
  signalled: <T>(value: T) => SemaphoreResult<T>
  error:     (reason: any) => SemaphoreResult<never>
  timeout:   () => SemaphoreResult<never>
} = {
  signalled: <T>(value: T) => ({status: 'signalled', value}),
  error:     (reason: any) => ({status: 'error', reason}),
  timeout:   () => ({status: 'timeout', reason: new SemaphoreTimeout()}),
}
