# Popsibk Json API client

Queries and deserializes JsonAPI responses using the power of typescript.

## Features

- request bodies are typed
- responses are dynamically typed
- the deserializer allows a "clean" object return without `data`, `attributes` structure...

```ts
import JsonApiService from '@popsink/jsonapi-client'

const fetchUsers = async () => {
    const service = new JsonApiService({ baseURL: 'https://myservice.com' })

    const users = await service.list<{ username: string, nickname: string }>('users/', {})
    for (const user of users) {
        console.log(user.username) // typed data
    }
}
```
