import { isFSA } from 'flux-standard-action';

function isPromise(val) {
    return val && typeof val.then === 'function';
}

export default function middleware(helpers) {
    return ({dispatch, getState}) => next => action => {
        if (!isFSA(action)) {
            return isPromise(action) ?
                action.then(dispatch) :
                next(action);
        }

        const {type, payload, meta} = action;

        if (typeof payload !== 'function' && !isPromise(payload)) {
            next(action);
        }

        const loadingAction = {type, meta: {...meta, loading: true, loaded: false}};
        const okAction = {type, meta: {...meta, loaded: true, loading: false}};
        const errorAction = {type, error: true, meta: {...meta, loading: false, loaded: false}};

        next(loadingAction);

        const payloadAction = isPromise(payload) ?
            payload :
            payload({...helpers, dispatch, getState});

        if (!isPromise(payloadAction)) {
            return next(payloadAction);
        }

        payloadAction.then(
            result => next({
                ...okAction, payload: result
            }),
            err => next({
                ...errorAction, payload: err
            })
        ).catch(err => {
            console.error('redux-async-actions MIDDLEWARE ERROR:', error);
            next({...errorAction, payload: err});
        })
    }
}
