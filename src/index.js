import { isFSA } from 'flux-standard-action';

function isPromise(val) {
    return val && typeof val.then === 'function';
}

export default function middleware(helpers) {
    return ({dispatch, getState}) => next => action => {
        if (!isFSA(action)) {
            const thunk = typeof action === 'function' ?
                action(dispatch, getState, helpers) :
                isPromise(action) ?
                    action :
                    next(action);
            return isPromise(thunk) ?
                thunk.then(dispatch) :
                thunk;
        }

        const {type, payload, meta} = action;

        if (typeof payload !== 'function' && !isPromise(payload)) {
            return next(action);
        }

        const loadingAction = {type, meta: {...meta, loading: true, loaded: false}};
        const okAction = {type, meta: {...meta, loaded: true, loading: false}};
        const errorAction = {type, error: true, meta: {...meta, loading: false, loaded: false}};

        next(loadingAction);

        const payloadAction = typeof payload === 'function' ?
            payload(dispatch, getState, helpers) :
            payload;

        if (!isPromise(payloadAction)) {
            return next({...okAction, payload: payloadAction});
        }

        return payloadAction.then(
            result => next({
                ...okAction, payload: result
            }),
            err => next({
                ...errorAction, payload: err
            })
        ).catch(err => {
            console.error('redux-async-actions MIDDLEWARE ERROR:', err);
            return next({...errorAction, payload: err});
        })
    }
}
