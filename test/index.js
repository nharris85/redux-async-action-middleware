import chai from 'chai';
import asyncMiddleware from '../src/index';

describe('async middleware', () => {
    const doDispatch = () => {};
    const doGetState = () => {};
    const middleware = asyncMiddleware();
    const nextHandler = middleware({
        dispatch: doDispatch,
        getState: doGetState
    });

    describe('thunk middleware', () => {
        it('must return a function to handle next', () => {
            chai.assert.isFunction(nextHandler);
            chai.assert.strictEqual(nextHandler.length, 1);
        });

        describe('handle next', () => {
            it('must return a function to handle action', () => {
                const actionHandler = nextHandler();

                chai.assert.isFunction(actionHandler);
                chai.assert.strictEqual(actionHandler.length, 1);
            });

            describe('handle action', () => {
                it('must run the given action function with dispatch and getState', done => {
                    const actionHandler = nextHandler();

                    actionHandler((dispatch, getState) => {
                        chai.assert.strictEqual(dispatch, doDispatch);
                        chai.assert.strictEqual(getState, doGetState);
                        done();
                    });
                });

                it('must pass action to next if not a function', done => {
                    const actionObj = {};

                    const actionHandler = nextHandler(action => {
                        chai.assert.strictEqual(action, actionObj);
                        done();
                    });

                    actionHandler(actionObj);
                });

                it('must return the return value of next if not a function', () => {
                    const expected = 'redux';
                    const actionHandler = nextHandler(() => expected);

                    const outcome = actionHandler();
                    chai.assert.strictEqual(outcome, expected);
                });

                it('must return value as expected if a function', () => {
                    const expected = 'rocks';
                    const actionHandler = nextHandler();

                    const outcome = actionHandler(() => expected);
                    chai.assert.strictEqual(outcome, expected);
                });

                it('must be invoked synchronously if a function', () => {
                    const actionHandler = nextHandler();
                    let mutated = 0;

                    actionHandler(() => mutated++);
                    chai.assert.strictEqual(mutated, 1);
                });
            });
        });

        describe('handle errors', () => {
            it('must throw if argument is non-object', done => {
                try {
                    middleware();
                } catch (err) {
                    done();
                }
            });
        });

        describe('withExtraArgument', () => {
            it('must pass the third argument', done => {
                const extraArg = {
                    lol: true
                };
                asyncMiddleware(extraArg)({
                    dispatch: doDispatch,
                    getState: doGetState,
                })()((dispatch, getState, arg) => {
                    chai.assert.strictEqual(dispatch, doDispatch);
                    chai.assert.strictEqual(getState, doGetState);
                    chai.assert.strictEqual(arg, extraArg);
                    done();
                });
            });
        });
    });
});
