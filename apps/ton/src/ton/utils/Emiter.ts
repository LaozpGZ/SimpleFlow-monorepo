export interface EmiterMessage<TTopic, TBody> {
  topic: TTopic
  body?: TBody
}

type Handler<TData> = (value: TData) => void

export class Emiter<Topic> {
  private topics: Map<Topic, Handler<any>[]> = new Map()

  private allHandlers: Handler<EmiterMessage<Topic, any>>[] = []

  private getTopic(topic: Topic): Handler<any>[] {
    if (!this.topics.get(topic)) {
      this.topics.set(topic, [])
    }
    return this.topics.get(topic)!
  }

  on<T>(topic: Topic, handler: Handler<T>) {
    const handlers = this.getTopic(topic)
    handlers.push(handler)
    return () => {
      this.topics.set(
        topic,
        this.getTopic(topic).filter((x) => x !== handler),
      )
    }
  }

  onAll(handler: Handler<EmiterMessage<Topic, any>>) {
    this.allHandlers.push(handler)
    return () => {
      this.allHandlers = this.allHandlers.filter((x) => x !== handler)
    }
  }

  emit<TBody>(topic: Topic, body?: TBody) {
    this.getTopic(topic).forEach((h) => {
      h(body)
    })
    this.allHandlers.forEach((h) => {
      h({
        topic,
        body,
      })
    })
  }
}
