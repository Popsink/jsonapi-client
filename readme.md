# Popsink Json API client

Queries and deserializes JsonAPI responses using the power of typescript.

## About The Project

This client uses Axios with the typing power of Typescript to construct requests to APIs using JSON:API.

## Features

- **Build low-level queries**. Maintain flexibility and a visual understanding of the JSON:API specification
- **Save time by using typing** to create queries and retrieve JSON:API data.
- **Take advantage of automatic deserialization** of your query returns, to retrieve objects that are easy to handle.

## Why not use X or Y library already available?

There are already [many frontend clients](https://jsonapi.org/implementations/) for consuming APIs using JSON:API. But none gave me complete satisfaction:

- Most libraries return objects and their relationships with the JSON:API structure like `User.attributes.projects.attributes.name`. This way of manipulating data is too cumbersome and moves away from simple OOP use.
- Some libraries are too complicated to handle.
- Others are not flexible enough when creating queries.
- Finally, others are absolutely not typed.

## Getting started

Install the client using a package manager :
```npm install --save @popsink/jsonapi-client```

## Usage

Import and instanciate the `JsonApiService`.

```ts
import JsonApiService from '@popsink/jsonapi-client'
const api = new JsonApiService({ baseURL: 'https://myservice.com' })
```

Use the availables methods :

```ts
// Let's assume that the API returns users such as:
type TUser = {
    username: string
    nickname: string
}

// List the users
api.list<TUser>('users/').then((users) => {
    for (const user of users) {
        console.log(user.username) // { id: 1, username: 'Tomy', nickname: 'Tom' }
    }
})

// Get a user
api.get<TUser>('users/12/').then((user) => {
    console.log(user.username) // { id: 1, username: 'Tomy', nickname: 'Tom' }
})

// Create a user
api.create<TUser>('users/', {
    data: {
        type: 'user',
        attributes: {
            username: 'john',
            nickname: 'foo'
        }
    }
})

// Update a user
api.update<TUser>('users/', {
    data: {
        type: `users/12/`,
        attributes: {
            nickname: 'bar'
        }
    }
})

// Delete a user
api.remove('users/12/')

// Use low level request
api.request( ... )
```
