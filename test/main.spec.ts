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
        MockContext.commit.mockReset()
    })

    it('can create single fetch actions', async () => {
        const factory = new FetchFactory<MockState, MockState>()

        const callback = jest.fn()
        const singlePromise = CreateMockPromise<MockRaw>({
            id: 1,
            mockNumber: 10,
            mockString: 'foo'
        }, callback)

        const singleAction = factory.createSingleFetcher<MockPayload, MockRaw, MockModel>(false, 'nonexistingmutation', singlePromise, () => new MockModel())
        if (typeof singleAction !== 'function') { throw Error('the action is not a function') }

        const promise = singleAction(MockContext, { id: 1 })
        await expect(promise).resolves.toBeUndefined()

        expect(callback).toBeCalled()
        expect(MockContext.commit).toBeCalledWith('nonexistingmutation', { "id": 1, "mockNumber": 10, "mockString": "foo" })
    })

    it('can create bulk fetch actions', async () => {
        const factory = new FetchFactory<MockState, MockState>()

        const callback = jest.fn()
        const bulkPromise = CreateMockPromise<MockRaw[]>([{
            id: 1,
            mockNumber: 10,
            mockString: 'foo'
        }], callback)

        const singleAction = factory.createBulkFetcher<MockPayload, MockRaw, MockModel>(false, 'nonexistingmutation', bulkPromise, () => new MockModel())
        if (typeof singleAction !== 'function') { throw Error('the action is not a function') }

        const promise = singleAction(MockContext, { id: 1 })
        await expect(promise).resolves.toBeUndefined()

        expect(callback).toBeCalled()
        expect(MockContext.commit).toBeCalledWith('nonexistingmutation', [{ "id": 1, "mockNumber": 10, "mockString": "foo" }])
    })

    it('sets the request state to pending, when the action is started and to success when it resolves', async () => {
        const factory = new FetchFactory<MockState, MockState>()

        const callback = jest.fn()
        const singleSlowPromise = CreateSlowMockPromise<MockRaw>({
            id: 1,
            mockNumber: 10,
            mockString: 'foo'
        }, callback)

        const singleAction = factory.createSingleFetcher<MockPayload, MockRaw, MockModel>(false, 'nonexistingmutation', singleSlowPromise, () => new MockModel())
        if (typeof singleAction !== 'function') { throw Error('the action is not a function') }

        const payload = { id: 1 }
        const promise = singleAction(MockContext, payload)
        expect(MockContext.state.vuexFetchersState.get('nonexistingmutation')!.get(JSON.stringify(payload))).toEqual(RequestState.Pending)
        expect(callback).not.toBeCalled()
        expect(MockContext.commit).toHaveBeenCalledTimes(1)

        await expect(promise).resolves.toBeUndefined()

        expect(MockContext.state.vuexFetchersState.get('nonexistingmutation')!.get(JSON.stringify(payload))).toEqual(RequestState.Success)
        expect(callback).toBeCalled()
        expect(MockContext.commit).toBeCalledWith('nonexistingmutation', { "id": 1, "mockNumber": 10, "mockString": "foo" })
    })

    it('sets the request state to error, when the action is rejected', async () => {
        const factory = new FetchFactory<MockState, MockState>()

        const callback = jest.fn()
        const singleSlowPromise = CreateFailingMockPromise<MockRaw>(callback)

        const singleAction = factory.createSingleFetcher<MockPayload, MockRaw, MockModel>(false, 'nonexistingmutation', singleSlowPromise, () => new MockModel())
        if (typeof singleAction !== 'function') { throw Error('the action is not a function') }

        const payload = { id: 1 }
        const promise = singleAction(MockContext, payload)

        await expect(promise).rejects.toBe("failed the mock promise")

        expect(MockContext.state.vuexFetchersState.get('nonexistingmutation')!.get(JSON.stringify(payload))).toEqual(RequestState.Error)
        expect(callback).toBeCalled()
        expect(MockContext.commit).toHaveBeenCalledTimes(1)
    })

    it('does not call the promise when the request state is pending or successful', async () => {
        const payloadMap: Map<any, RequestState> = new Map()
        payloadMap.set(JSON.stringify({ id: 1 }), RequestState.Pending)
        MockContext.state.vuexFetchersState.set('nonexistingmutation', payloadMap)

        const factory = new FetchFactory<MockState, MockState>()

        const callback = jest.fn()
        const singlePromise = CreateMockPromise<MockRaw>({
            id: 1,
            mockNumber: 10,
            mockString: 'foo'
        }, callback)

        const singleAction = factory.createSingleFetcher<MockPayload, MockRaw, MockModel>(false, 'nonexistingmutation', singlePromise, () => new MockModel())
        if (typeof singleAction !== 'function') { throw Error('the action is not a function') }

        await expect(singleAction(MockContext, { id: 1 })).resolves.toBeUndefined()

        expect(callback).not.toBeCalled()
        expect(MockContext.commit).not.toBeCalled()

        payloadMap.set(JSON.stringify({ id: 1 }), RequestState.Success)
        MockContext.state.vuexFetchersState.set('nonexistingmutation', payloadMap)

        await expect(singleAction(MockContext, { id: 1 })).resolves.toBeUndefined()

        expect(callback).not.toBeCalled()
        expect(MockContext.commit).not.toBeCalled()

        payloadMap.set(JSON.stringify({ id: 1 }), RequestState.Error)
        MockContext.state.vuexFetchersState.set('nonexistingmutation', payloadMap)

        await expect(singleAction(MockContext, { id: 1 })).resolves.toBeUndefined()

        expect(callback).toBeCalled()
        expect(MockContext.commit).toBeCalledWith('nonexistingmutation', { "id": 1, "mockNumber": 10, "mockString": "foo" })
    })

    // it('can create invalidate actions', () => {
    //     expect('@todo').toEqual(true)
    // })

    // it('can create single force fetch actions', () => {
    //     expect('@todo').toEqual(true)
    // })

    // it('can create bulk force fetch actions', () => {
    //     expect('@todo').toEqual(true)
    // })

    // it('does call the promise in a forced action when the request state is pending', () => {
    //     expect('@todo').toEqual(true)
    // })

    // it('does call the promise in a forced action when the request state is successful', () => {
    //     expect('@todo').toEqual(true)
    // })

    // it('places an empty model in the store before starting the fetcher', () => {
    //     expect('@todo').toEqual(true)
    // })
})
