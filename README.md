Redux Async Action Middleware
===================

[![build status](https://img.shields.io/travis/nharris85/redux-async-action-middleware/master.svg?style=flat-square)](https://travis-ci.org/nharris85/redux-async-action-middleware)
[![npm version](https://img.shields.io/npm/v/redux-async-action-middleware.svg?style=flat-square)](https://www.npmjs.com/packageredux-async-action-middleware)
[![npm downloads](https://img.shields.io/npm/dm/redux-async-action-middleware.svg?style=flat-square)](https://www.npmjs.com/package/redux-async-action-middleware)


## Install

```bash
npm install --save redux-async-action-middleware
```

CommonJS

```js
var asyncMiddleware = require('redux-async-action-middleware').default;
```

ES Modules
```js
import asyncMiddleware from 'redux-async-action-middleware';
```

## Why Do I Need This?

Just like [Redux Thunk](https://raw.githubusercontent.com/gaearon/redux-thunk) if you're not sure whether you need it, you probably don't.

## Motivation

This middleware was inspired by [Redux Thunk](https://raw.githubusercontent.com/gaearon/redux-thunk) and [Redux Async](https://github.com/symbiont-io/redux-async). After using a variation of Redux Async, I had realized that defining the three LOAD, SUCCESS, and FAIL redux event types were redundant and not necessary for my use. I also didn't like the non-standard organization of metadata vs payload. So following the lead of [Redux Promise](https://github.com/acdlite/redux-promise), I adopted the [Flux Standard Action](https://github.com/acdlite/flux-standard-action) convention. The result is a combination of everything I liked from all three of these middleware modules.

## Usage

### Redux Thunk

There is a slight variation compared to Redux Thunk [Composition](https://github.com/gaearon/redux-thunk#composition)

```diff
- function (dispatch, getState, extraArg) { ... }
+ function ({dispatch, getState, ...extraArgs}) { ... }
```

Note how instead of three arguments it is now a single object that contains dispatch, getState, and a spread of the extraArg object passed into the middleware creator. This was - in my opinion - a cleaner way to enable easy access to only the needed arguments by leveraging the destructuring feature.

## Async Actions

```js
import {createAction} from 'redux-actions';
import { createStore, applyMiddleware } from 'redux';
import asyncMiddleware from 'redux-async-action-middleware';
import axios from 'axios';
import rootReducer from './reducers';

const http = axios.create({
    baseURL: 'https://example.com/api',
    timeout: 1000,
    headers: {'X-Custom-Header': 'foobar'}
});

// Note: this API requires redux@>=3.1.0
const store = createStore(
  rootReducer,
  applyMiddleware(asyncMiddleware({http}))
);


const getThing = (id) => ({
    type: 'FETCH_THINGS',
    payload: ({http}) => http.get(`/thing/${id}`
});

const getStuffedThing = (id) => ({
    type: 'FETCH_STUFF_THING',
    payload: ({dispatch, http}) => http.get(`/stuff/${id}`)
        .then((result) => dispatch(getThing(result.data.thingId)))
});

store.dispatch(getThing(1));
store.dispatch(getStuffedThing(2));
```

## Async Actions Redux Store Access

```js
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {getFoo} from './reducers/foo';

@connect(state => ({foo: state.foo}),
    dispatch => bindActionCreators({getFoo})
)
export class Foo extends Component {
    static propTypes = {
        foo: PropTypes.object.isRequired,
        getFoo: PropTypes.func.isRequired
    }

    componentWillMount() {
        const {getFoo} = this.props;
        getFoo();
    }

    render() {
        const {foo: {loading, loaded, payload}} = this.props;

        return (
            <div>
                {loading && <p>loading...</p>}
                {loaded && <p>{payload}</p>}
            </div>
        )
    }
}
```
