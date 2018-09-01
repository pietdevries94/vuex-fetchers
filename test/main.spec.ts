import FetchFactory from 'src/main'
import { MockRaw, MockModel, MockState, CreateMockPromise, MockPayload, MockContext } from './mocks'

describe('FetchFactory', () => {
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
        expect('@todo').toEqual(true)
    })

    it('sets the request state to pending, when the action is started', () => {
        expect('@todo').toEqual(true)
    })

    it('sets the request state to success, when the action is resolved', () => {
        expect('@todo').toEqual(true)
    })

    it('sets the request state to error, when the action is rejected', () => {
        expect('@todo').toEqual(true)
    })

    it('can create invalidate actions', () => {
        expect('@todo').toEqual(true)
    })

    it('can create force fetch actions', () => {
        expect('@todo').toEqual(true)
    })
})
