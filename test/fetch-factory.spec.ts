import FetchFactory from 'src/fetch-factory'
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
})
