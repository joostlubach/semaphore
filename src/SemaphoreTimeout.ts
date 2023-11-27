export default class SemaphoreTimeout extends Error {

  constructor() {
    super("The Semaphore has timed out")
  }

}
