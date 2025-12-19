/* eslint-disable class-methods-use-this */
// Mock Next.js server for Vite
export class NextRequest {
  public url: string

  public init?: RequestInit

  constructor(url: string, init?: RequestInit) {
    this.url = url
    this.init = init
  }

  get headers() {
    return new Headers(this.init?.headers)
  }

  get method() {
    return this.init?.method || 'GET'
  }

  async json() {
    // eslint-disable-next-line class-methods-use-this
    return {}
  }

  async text() {
    // eslint-disable-next-line class-methods-use-this
    return ''
  }
}

export class NextResponse {
  public body?: BodyInit | null

  public init?: ResponseInit

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = body
    this.init = init
  }

  static json(data: any, init?: ResponseInit) {
    return new NextResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  }

  static redirect(url: string, status = 302) {
    return new NextResponse(null, {
      status,
      headers: {
        Location: url,
      },
    })
  }

  static next(init?: ResponseInit) {
    return new NextResponse(null, init)
  }
}

export class NextFetchEvent {
  public request: NextRequest

  constructor(request: NextRequest) {
    this.request = request
  }
}
