import FetchFactory, { RequestState } from 'src/main'
import { MockRaw, MockModel, MockState, CreateMockPromise, MockPayload, MockContext, CreateSlowMockPromise, CreateFailingMockPromise } from './mocks'

describe('FetchFactory', () => {
    afterEach(() => {
        // cleanup the state
        MockContext.state = {
            vuexFetchersState: new Map(),
            mockModelList: []
        },
        MockContext.rootState = {
            vuexFetchersState: new Map(),
            mockModelList: []
        }
    })

    it('can create single fetch actions', () => {
        const factory = new FetchFactory<MockState, MockState>()

        const singlePromise = CreateMockPromise<MockRaw>({
            id: 1,
            mockNumber: 10,
            mockString: 'foo'
        })

        const singleAction = factory.createSingleFetcher<MockPayload, MockRaw, MockModel>('nonexistingmutation', singlePromise, () => new MockModel())
        if (typeof singleAction !== 'function') {throw Error('the action is not a function')}
        
        const promise = singleAction(MockContext, {id: 1})
        return expect(promise).resolves.toBeUndefined()
    })

    it('can create bulk fetch actions', () => {
        const factory = new FetchFactory<MockState, MockState>()

        const bulkPromise = CreateMockPromise<MockRaw[]>([{
            id: 1,
            mockNumber: 10,
            mockString: 'foo'
        }])

        const singleAction = factory.createBulkFetcher<MockPayload, MockRaw, MockModel>('nonexistingmutation', bulkPromise, () => new MockModel())
        if (typeof singleAction !== 'function') {throw Error('the action is not a function')}
        
        const promise = singleAction(MockContext, {id: 1})
        return expect(promise).resolves.toBeUndefined()
    })

    it('sets the request state to pending, when the action is started and to success when it resolves', async () => {
        const factory = new FetchFactory<MockState, MockState>()

        const singleSlowPromise = CreateSlowMockPromise<MockRaw>({
            id: 1,
            mockNumber: 10,
            mockString: 'foo'
        })

        const singleAction = factory.createSingleFetcher<MockPayload, MockRaw, MockModel>('nonexistingmutation', singleSlowPromise, () => new MockModel())
        if (typeof singleAction !== 'function') {throw Error('the action is not a function')}
        
        const payload = {id: 1}
        const promise = singleAction(MockContext, payload)
        expect(MockContext.state.vuexFetchersState.get('nonexistingmutation')!.get(payload)).toEqual(RequestState.Pending)

        await expect(promise).resolves.toBeUndefined()

        expect(MockContext.state.vuexFetchersState.get('nonexistingmutation')!.get(payload)).toEqual(RequestState.Success)
    })

    it('sets the request state to error, when the action is rejected', async () => {
        const factory = new FetchFactory<MockState, MockState>()

        const singleSlowPromise = CreateFailingMockPromise<MockRaw>({
            id: 1,
            mockNumber: 10,
            mockString: 'foo'
        })

        const singleAction = factory.createSingleFetcher<MockPayload, MockRaw, MockModel>('nonexistingmutation', singleSlowPromise, () => new MockModel())
        if (typeof singleAction !== 'function') {throw Error('the action is not a function')}
        
        const payload = {id: 1}
        const promise = singleAction(MockContext, payload)

        await expect(promise).rejects.toBe("failed the mock promise")

        expect(MockContext.state.vuexFetchersState.get('nonexistingmutation')!.get(payload)).toEqual(RequestState.Error)
    })

    // it('does not call the promise when the request state is pending', () => {
    //     expect('@todo').toEqual(true)
    // })

    // it('does not call the promise when the request state is successful', () => {
    //     expect('@todo').toEqual(true)
    // })

    // it('calls the given mutation on success', () => {
    //     expect('@todo').toEqual(true)
    // })

    // @todo uncomment when this is implemented
    // it('can create invalidate actions', () => {
    //     expect('@todo').toEqual(true)
    // })

    // @todo uncomment when this is implemented
    // it('can create single force fetch actions', () => {
    //     expect('@todo').toEqual(true)
    // })

    // @todo uncomment when this is implemented
    // it('can create bulk force fetch actions', () => {
    //     expect('@todo').toEqual(true)
    // })

    // @todo uncomment when this is implemented
    // it('does call the promise in a forced action when the request state is pending', () => {
    //     expect('@todo').toEqual(true)
    // })

    // @todo uncomment when this is implemented
    // it('does call the promise in a forced action when the request state is successful', () => {
    //     expect('@todo').toEqual(true)
    // })
})
