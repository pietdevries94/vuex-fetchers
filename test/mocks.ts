import { Model, RequestState } from 'src/main'
import { ActionContext } from 'vuex';

export interface MockRaw {
    id: number,
    mockNumber: number,
    mockString: string,
}

export class MockModel implements Model<MockModel, MockRaw> {
    private id: number = 0
    private mockNumber: number = 0
    private mockString: string = ''

    public getNew() {
        return new MockModel()
    }

    public fillModel(raw: MockRaw) {
        this.id = raw.id
        this.mockNumber = raw.mockNumber
        this.mockString = raw.mockString
        return this
    }

    public getRaw() {
        return {
            id: this.id,
            mockNumber: this.mockNumber,
            mockString: this.mockString,
        }
    }
}

export interface MockState {
    vuexFetchersState: Map<string, Map<string, RequestState>>
    mockModelList: MockModel[]
}

export interface MockPayload {
    id: number
}

export const CreateMockPromise = <R>(response: R, callback: () => {}): (payload: MockPayload) => Promise<R> => {
    return (payload: MockPayload): Promise<R> => {
        return new Promise<R>((resolve, reject: any) => {
            callback()
            resolve(response)
        })
    }
}

export const CreateFailingMockPromise = <R>(callback: () => {}): (payload: MockPayload) => Promise<R> => {
    return (payload: MockPayload): Promise<R> => {
        return new Promise<R>((resolve, reject: any) => {
            callback()
            reject("failed the mock promise")
        })
    }
}

export const CreateSlowMockPromise = <R>(response: R, callback: () => {}): (payload: MockPayload) => Promise<R> => {
    return (payload: MockPayload): Promise<R> => {
        return new Promise<R>((resolve, reject: any) => {
            setTimeout(() => {
                callback()
                resolve(response)
            }, 300)
        })
    }
}

interface MockActionContext extends ActionContext<MockState, MockState> {
    commit: jest.Mock
}

export const MockContext: MockActionContext = {
    state: {
        vuexFetchersState: new Map(),
        mockModelList: []
    },
    rootState: {
        vuexFetchersState: new Map(),
        mockModelList: []
    },
    commit: jest.fn(),
    dispatch: () => new Promise<any>( (resolve) => {resolve()}),
    getters: () => {},
    rootGetters: () => {}
}