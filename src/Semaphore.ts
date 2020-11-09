export interface Options {
  signalled?: boolean
  autoReset?: boolean
}

export default class Semaphore {

  constructor(
    private readonly options: Options = {}
  ) {}

  private signalled: boolean = this.options.signalled ?? false

  private resolves: Array<() => any> = []

  public reset() {
    this.signalled = false
  }

  public signal() {
    this.signalled = true
    this.resolves.forEach(resolve => resolve())
    this.resolves = []

    if (this.options.autoReset) {
      this.reset()
    }
  }

  // Promise interface

  public then(resolve: () => any) {
    if (this.signalled) {
      resolve()
    } else {
      this.resolves.push(resolve)
    }
  }

}